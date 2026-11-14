// Existing Chrome + native Node WebSocket. No browser package, real user profile,
// original narration copy, security bypass, production endpoint or upload.
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

async function protocol(url) {
  const socket = new WebSocket(url)
  await new Promise((yes, no) => { socket.onopen = yes; socket.onerror = no })
  let serial = 0
  const pending = new Map(), events = []
  socket.onmessage = event => {
    const message = JSON.parse(event.data)
    if (message.id) {
      const item = pending.get(message.id)
      if (!item) return
      clearTimeout(item.timer); pending.delete(message.id)
      message.error ? item.no(Error(JSON.stringify(message.error))) : item.yes(message.result)
    } else events.push(message)
  }
  const send = (method, params = {}) => new Promise((yes, no) => {
    const id = ++serial, timer = setTimeout(() => { pending.delete(id); no(Error(`CDP timeout: ${method}`)) }, 20000)
    pending.set(id, { yes, no, timer }); socket.send(JSON.stringify({ id, method, params }))
  })
  return { socket, send, events }
}

export async function connectChrome(port = 9337) {
  // A disposable incognito context: never seed, reset or read the user's profile.
  const version = await fetch(`http://127.0.0.1:${port}/json/version`).then(r => r.json())
  const host = await protocol(version.webSocketDebuggerUrl)
  const { browserContextId } = await host.send('Target.createBrowserContext')
  const { targetId } = await host.send('Target.createTarget', { url: 'about:blank', browserContextId })
  const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(r => r.json())
  const target = targets.find(item => item.id === targetId)
  if (!target) { await host.send('Target.disposeBrowserContext', { browserContextId }); host.socket.close(); throw Error('Isolated QA target unavailable') }
  const { socket, send, events } = await protocol(target.webSocketDebuggerUrl)
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable')
  await send('Runtime.runIfWaitingForDebugger')
  const evaluate = async (expression, userGesture = false) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture })
    if (r.exceptionDetails) throw Error(r.exceptionDetails.text + ': ' + (r.exceptionDetails.exception?.description ?? expression))
    return r.result.value
  }
  const waitFor = async expression => evaluate(`new Promise((resolve,reject)=>{const started=Date.now();const check=()=>{if(${expression})resolve(true);else if(Date.now()-started>15000)reject(Error('Condition timed out: '+${JSON.stringify(expression)}));else setTimeout(check,50)};check()})`)
  return { send, evaluate, events, waitFor,
    async size(width, height) { await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 701 }); await send('Emulation.setTouchEmulationEnabled', { enabled: width < 701 }) },
    async goto(url) {
      await send('Page.navigate', { url }); await waitFor(`document.querySelector('h1') && !document.querySelector('.scene-loader')`)
      await evaluate('document.fonts.ready.then(()=>true)')
      await evaluate(`Promise.all([...document.images].map(i=>i.complete?Promise.resolve():new Promise(r=>{i.addEventListener('load',r,{once:true});i.addEventListener('error',r,{once:true});setTimeout(r,6000)}))).then(()=>true)`)
      await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
    },
    async click(text) {
      const expression = `(()=>{const el=[...document.querySelectorAll('button,a,summary')].find(e=>e.textContent.trim()===${JSON.stringify(text)});if(!el)throw Error('Control missing: '+${JSON.stringify(text)});el.scrollIntoView({block:'center'});el.click();return true})()`
      await evaluate(expression, true)
      await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
    },
    async capture(path) { const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 82, captureBeyondViewport: false }); writeFileSync(path, Buffer.from(r.data, 'base64')) },
    async metrics() { return evaluate(`({url:location.href,viewport:[innerWidth,innerHeight],width:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth,heading:document.querySelector('h1')?.textContent,images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0})),focus:document.activeElement?.textContent?.trim().slice(0,100),audio:[...document.querySelectorAll('audio')].map(a=>({src:a.getAttribute('src'),paused:a.paused,time:a.currentTime,ready:a.readyState})),smallTargets:[...document.querySelectorAll('button,a,summary')].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&(r.height<43||r.width<43)}).map(e=>({text:e.textContent.trim().slice(0,70),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})).slice(0,30)})`) },
    async close() { try { await host.send('Target.disposeBrowserContext', { browserContextId }) } finally { socket.close(); host.socket.close() } },
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))) {
  const directory = resolve(process.argv[2] ?? '../qa-artifacts/20261111-haroon-visual')
  const label = process.argv[3] ?? 'capture'
  mkdirSync(directory, { recursive: true })
  const browser = await connectChrome()
  const results = []
  try {
    for (const [width, height] of [[1366,768],[390,844]]) {
      await browser.size(width, height)
      await browser.goto('http://127.0.0.1:5198/story/apollo-15-rover/1')
      const path = resolve(directory, `${label}-apollo15-${width}.jpg`)
      await browser.capture(path); results.push({ ...await browser.metrics(), screenshot: path })
    }
    const errors = browser.events.filter(e => e.method === 'Runtime.exceptionThrown' || e.method === 'Network.loadingFailed')
    writeFileSync(resolve(directory, `${label}-metrics.json`), JSON.stringify({ results, errors }, null, 2) + '\n')
    console.log(JSON.stringify(results.map(({viewport,overflow,heading,screenshot})=>({viewport,overflow,heading,screenshot})), null, 2))
  } finally { await browser.close() }
}
