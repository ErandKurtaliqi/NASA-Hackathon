// Real Chrome QA. Each run owns a disposable browser context; no user progress,
// private recordings or PDFs are read, reset, copied or uploaded.
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { connectChrome } from './story-browser-qa.mjs'

const output = resolve(process.argv[2] ?? '../qa-artifacts/20261111-haroon-visual')
const base = process.argv[3] ?? 'http://127.0.0.1:5198'
assert.match(base, /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/)
mkdirSync(output, { recursive: true })
const browser = await connectChrome(Number(process.env.CHROME_QA_PORT ?? 9337))
const results = [], checks = []
let diagnostics
const ids = ['apollo-15-rover', 'apollo-11-reflector', 'apollo-17-rover',
  ...(process.argv.includes('--all-missions') ? ['apollo-16-rover', 'sojourner', 'opportunity', 'viking-1', 'ingenuity'] : [])]
const chapters = ['meet', 'journey', 'challenges', 'legacy']
const read = expression => browser.evaluate(expression)
async function capture(id, chapter, width, height, suffix = '') {
  await browser.size(width, height)
  await browser.goto(`${base}/story/${id}/${chapter}`)
  assert.equal(await read('location.pathname'), `/story/${id}/${chapter}`)
  // NASA CDN loading can exceed the generic six-second navigation warmup.
  // Require actual decoded images, rather than treating a pending request as a broken asset.
  await browser.waitFor('[...document.images].every(image => image.complete && image.naturalWidth > 0)')
  const metrics = await browser.metrics()
  assert.equal(metrics.overflow, false, `${id}/${chapter} at ${width}: horizontal overflow`)
  assert.equal(await read('document.querySelectorAll("main").length'), 1)
  assert.equal(await read(`document.querySelectorAll('[aria-label="Story chapters"]').length`), 1)
  assert.ok(await read('!!document.querySelector("[data-hardware-kind]")'))
  if (id !== 'apollo-15-rover') assert.equal(metrics.audio.length, 0, 'Review must not request excluded narration')
  const screenshot = resolve(output, `verified-${id}-${chapter}-${width}${suffix}.jpg`)
  await browser.capture(screenshot)
  const ax = await browser.send('Accessibility.getFullAXTree')
  results.push({ ...metrics, chapter, screenshot, accessibilityNodes: ax.nodes.length,
    brokenImages: metrics.images.filter(i => !i.loaded) })
}
try {
  await browser.size(1366, 768)
  await browser.goto(`${base}/story/apollo-15-rover/1`)
  assert.equal(await read('localStorage.getItem("beyond-earth-progress")'), null, 'QA context starts without saved user progress')
  await browser.click('Play')
  await browser.waitFor('document.querySelector("audio")?.currentTime > .05 && !document.querySelector("audio").paused')
  await browser.click('Pause')
  assert.equal(await read('document.querySelector("audio").paused'), true)
  await browser.click('Resume')
  await browser.click('Next segment')
  await browser.waitFor('document.querySelector("audio")?.paused === true')
  assert.ok((await read(`document.querySelector('[aria-label="Scroll story and activities"]').innerText`)).includes('Segment 2 of 4'))
  checks.push('Actual Apollo 15 MP3 playback advances; Pause/Resume work; changing segment does not autoplay')

  // Seed only this empty disposable context, using the unchanged public schema,
  // so all chapter layouts and quizzes can be inspected independently.
  const state = { completedChapters: ids.flatMap(id => chapters.map(chapter => `${id}:${chapter}`)),
    storyProgress: Object.fromEntries(ids.map(id => [id, { completed: chapters, lastChapter: 5, completedMission: false }])),
    badges: [], exploredLocations: [], inspectedInstruments: [] }
  await browser.evaluate(`localStorage.setItem('beyond-earth-progress', ${JSON.stringify(JSON.stringify({ state, version: 0 }))})`)
  for (const [width, height] of [[1366,768], [390,844]]) for (const id of ids) for (let chapter = 1; chapter <= 5; chapter++) {
    await capture(id, chapter, width, height)
    console.log(`Captured ${id}/${chapter} ${width}x${height}`)
  }
  for (const [width, height] of [[360,800], [439,591], [1024,768]]) for (const id of ids) await capture(id, 1, width, height)

  await browser.size(1366,768)
  await browser.goto(`${base}/story/apollo-15-rover/4`)
  assert.ok(await read('!!document.querySelector("fieldset input[type=radio]")'), 'Hammer/feather activity remains rendered')
  const activity = await read('document.querySelector("fieldset")?.closest("section")?.innerText')
  checks.push(`Apollo 15 legacy activity rendered: ${activity?.slice(0,100)}`)
  const beforeActivity = await read('localStorage.getItem("beyond-earth-progress")')
  await browser.evaluate('document.querySelector("fieldset input[type=radio]").click()', true)
  await browser.click('Compare with evidence')
  assert.ok(await read('document.body.innerText.includes("What was observed?")'))
  assert.equal(await read('localStorage.getItem("beyond-earth-progress")'), beforeActivity)
  await browser.capture(resolve(output, 'verified-apollo15-evidence-activity.jpg'))
  checks.push('Native prediction form reveals NASA evidence without writing mission progress')

  await browser.goto(`${base}/story/apollo-15-rover/5`)
  for (let question = 0; question < 3; question++) {
    await browser.evaluate('document.querySelector(".quiz-options button").click()', true)
    await browser.click(question === 2 ? 'View Results' : 'NEXT QUESTION')
  }
  await browser.click('COMPLETE STORY')
  const saved = await read('JSON.parse(localStorage.getItem("beyond-earth-progress")).state')
  assert.equal(saved.storyProgress['apollo-15-rover'].completedMission, true)
  assert.equal(saved.badges.filter(id => id === 'apollo-15-rover-storyteller').length, 1)
  await browser.capture(resolve(output, 'verified-apollo15-completion.jpg'))
  await browser.goto(`${base}/story/apollo-15-rover/5`)
  assert.equal(await read('JSON.parse(localStorage.getItem("beyond-earth-progress")).state.storyProgress["apollo-15-rover"].completedMission'), true)
  await browser.click('COMPLETE STORY')
  assert.equal(await read('JSON.parse(localStorage.getItem("beyond-earth-progress")).state.badges.filter(id=>id==="apollo-15-rover-storyteller").length'), 1)
  checks.push('Actual quiz, completion, reload and repeated completion preserve one durable Apollo 15 badge')

  if (process.argv.includes('--all-missions')) for (const id of ids.slice(3)) {
    await browser.goto(`${base}/story/${id}/5`)
    for (let question = 0; question < 3; question++) {
      await browser.evaluate('document.querySelector(".quiz-options button").click()', true)
      await browser.click(question === 2 ? 'View Results' : 'NEXT QUESTION')
    }
    await browser.click('COMPLETE STORY')
    const completed = await read('JSON.parse(localStorage.getItem("beyond-earth-progress")).state')
    assert.equal(completed.storyProgress[id].completedMission, true)
    assert.equal(completed.badges.filter(b => b === `${id}-storyteller`).length, 1)
    assert.equal(completed.storyProgress['apollo-15-rover'].completedMission, true)
    await browser.capture(resolve(output, `verified-${id}-completion.jpg`))
    await browser.goto(`${base}/story/${id}/5`)
    await browser.click('COMPLETE STORY')
    assert.equal(await read(`JSON.parse(localStorage.getItem('beyond-earth-progress')).state.badges.filter(b=>b===${JSON.stringify(`${id}-storyteller`)}).length`), 1)
    checks.push(`${id}: real quiz, durable completion, reload and idempotent badge; other mission completion preserved`)
  }

  await browser.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await capture('apollo-15-rover', 1, 390, 844, '-reduced-motion')
  assert.equal(await read('matchMedia("(prefers-reduced-motion: reduce)").matches'), true)
  await browser.evaluate(`document.querySelector('button[aria-label="Open navigation"]').click()`, true)
  await browser.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
  await browser.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
  assert.equal(await read(`document.activeElement?.getAttribute('aria-label')`), 'Open navigation')
  assert.equal(await read(`document.activeElement?.getAttribute('aria-expanded')`), 'false')
  checks.push('Real Escape key closes the mobile navigation and restores toggle focus')
  await browser.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
  await browser.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
  assert.ok(await read('document.activeElement?.matches("a,button,input,summary")'))
  checks.push('Reduced motion plus real Tab key reaches a native interactive control')
  const startY = await read('scrollY')
  await browser.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 330, y: 680 }] })
  for (const y of [610,540,470,400,330]) await browser.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 330, y }] })
  await browser.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await browser.waitFor(`scrollY > ${startY}`)
  checks.push('Emulated native touch swipe scrolls the mobile document without interception')
  if (process.argv.includes('--all-missions')) {
    await capture('ingenuity', 1, 390, 844, '-reduced-motion')
    assert.equal(await read('document.querySelector("[data-hardware-kind]")?.dataset.hardwareKind'), 'helicopter')
    await browser.send('Page.bringToFront')
    await browser.evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Next segment').focus()`)
    await browser.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', text: '\r', unmodifiedText: '\r', windowsVirtualKeyCode: 13 })
    await browser.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
    await browser.waitFor(`document.body.innerText.includes('Segment 2 of 4: Who Built Me?')`)
    assert.equal(await read('document.querySelectorAll("audio").length'), 0)
    const ingenuityStartY = await read('scrollY')
    await browser.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 330, y: 680 }] })
    for (const y of [610,540,470,400,330]) await browser.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 330, y }] })
    await browser.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await browser.waitFor(`scrollY > ${ingenuityStartY}`)
    checks.push('Ingenuity: helicopter identity, reduced motion, real Enter-key segment selection, native emulated touch scrolling and omitted-audio boundary verified')
    await browser.size(1366, 768)
    for (const [chapter, label, mediaId] of [[3, '3. My Eyes from Above', 'ingenuity-ridges'], [4, '3. My Dream Lives On', 'ingenuity-skyfall']]) {
      await browser.goto(`${base}/story/ingenuity/${chapter}`)
      await browser.evaluate(`document.querySelector('button[aria-label=${JSON.stringify(label)}]').click()`, true)
      await browser.waitFor(`document.querySelector('[data-step-media="${mediaId}"] img')?.naturalWidth > 0`)
      if (chapter === 3) assert.ok(await read(`document.body.innerText.includes('Ingenuity did not detect underground water')`))
      else assert.ok(await read(`document.querySelector('[data-step-media="${mediaId}"]').innerText.includes('Illustration · not a photograph')`))
      await browser.capture(resolve(output, `verified-ingenuity-${chapter}-science-evidence.jpg`))
    }
    checks.push('Ingenuity: selected geological evidence and explicitly labelled SkyFall artist concept load; scientific qualifications stay visible')
  }
} finally {
  const errors = browser.events.filter(e => e.method === 'Runtime.exceptionThrown' || e.method === 'Network.loadingFailed')
  const httpErrors = browser.events.filter(e => e.method === 'Network.responseReceived' && e.params.response.status >= 400)
  diagnostics = { base, results, checks, errors, httpErrors }
  writeFileSync(resolve(output, 'verification.json'), JSON.stringify(diagnostics, null, 2) + '\n')
  await browser.close()
}
assert.equal(diagnostics.errors.length, 0, 'No browser runtime or network-loading errors')
assert.equal(results.flatMap(r => r.brokenImages).length, 0, 'All evidence/hardware images loaded')
assert.equal(diagnostics.httpErrors.filter(e => !e.params.response.url.endsWith('/favicon.ico')).length, 0, 'No application/media HTTP errors')
console.log(JSON.stringify({ captures: results.length, checks }, null, 2))
