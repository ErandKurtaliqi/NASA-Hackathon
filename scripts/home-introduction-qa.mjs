// Installed Chrome, default autoplay policy, disposable contexts. No synthetic
// DOM clicks, autoplay flags, permission changes or media-policy overrides.
import assert from 'node:assert/strict'
import {mkdirSync,writeFileSync,realpathSync,existsSync} from 'node:fs'
import {resolve,relative,dirname,isAbsolute} from 'node:path'
import {fileURLToPath} from 'node:url'
import {connectChrome} from './story-browser-qa.mjs'

assert.ok(process.argv[2],'Supply an external QA output directory')
const root=fileURLToPath(new URL('../',import.meta.url)),output=resolve(process.argv[2]),origin=new URL(process.argv[3]??'http://127.0.0.1:5200'),port=Number(process.argv[4]??9339)
assert.ok(['127.0.0.1','localhost','[::1]'].includes(origin.hostname))
let ancestor=output;while(!existsSync(ancestor))ancestor=dirname(ancestor)
const inside=path=>{const r=relative(realpathSync(root),path);return !r||(!r.startsWith('..')&&!isAbsolute(r))}
assert.ok(!inside(output)&&!inside(realpathSync(ancestor)),'QA output must remain outside the checkout')
mkdirSync(output,{recursive:true})
const results=[],screenshots=[]
const probe=`(()=>{window.__homeAudio=[];window.__homePlays=[];
const NativeAudio=window.Audio;
window.Audio=new Proxy(NativeAudio,{construct(Target,args){const audio=Reflect.construct(Target,args);window.__homeAudio.push(audio);return audio}});
const nativePlay=HTMLMediaElement.prototype.play;
HTMLMediaElement.prototype.play=function(...args){const row={src:this.src,status:'pending'};window.__homePlays.push(row);const pending=nativePlay.apply(this,args);pending?.then(()=>row.status='playing',error=>row.status=error.name);return pending};})()`
async function context(width=1440,height=900){const b=await connectChrome(port);await b.send('Page.addScriptToEvaluateOnNewDocument',{source:probe});await b.size(width,height);return b}
async function click(b,selector){
  if(selector.startsWith('a[aria-label="Explore '))await b.waitFor("Number(getComputedStyle(document.querySelector('h1').parentElement).opacity)>.99 && Number(getComputedStyle(document.querySelector('aside[aria-label=\"Your astronaut guide\"] img')).opacity)>.99")
  const box=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing control');e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()`)
  await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',...box})
  await b.send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...box})
  await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...box})
}
async function report(b,label){
  const state=await b.evaluate(`({caption:document.querySelector('[data-home-caption]')?.textContent??null,topic:document.querySelector('[data-home-caption]')?.dataset.homeCaption??null,
    message:document.querySelector('#home-audio-status')?.textContent,plays:window.__homePlays,
    introAudio:window.__homeAudio.filter(a=>a.src.endsWith('/audio/home/intro.mp3')).map(a=>({paused:a.paused,time:a.currentTime})),
    overflow:document.documentElement.scrollWidth>innerWidth,session:sessionStorage.getItem('auroralys-home-intro-seen-v1')})`)
  assert.equal(state.overflow,false,label);results.push({label,...state});console.log(label)
  writeFileSync(resolve(output,'browser-progress.json'),JSON.stringify(results,null,2)+'\n')
  return state
}
async function capture(b,name){
  await b.waitFor("Number(getComputedStyle(document.querySelector('h1').parentElement).opacity)>.99 && Number(getComputedStyle(document.querySelector('aside[aria-label=\"Your astronaut guide\"] img')).opacity)>.99")
  await b.capture(resolve(output,name));screenshots.push(name)
}

for(const [width,height]of [[1440,900],[768,1024],[360,800],[390,844],[439,591]]){
  const b=await context(width,height)
  try{
    await b.goto(origin.origin+'/')
    await b.waitFor("window.__homePlays.some(p=>p.src.endsWith('/audio/home/intro.mp3')&&p.status!=='pending')")
    const first=await report(b,`first-${width}`)
    assert.equal(first.caption,'Welcome, explorer.');assert.equal(first.session,'1')
    assert.equal(first.plays.filter(p=>p.src.endsWith('/audio/home/intro.mp3')).length,1,'Strict Mode must not duplicate attempts')
    assert.equal(first.plays[0].status,'NotAllowedError','Fresh browser context obeys its normal autoplay restriction')
    assert.ok(first.message.includes('Turn sound on'))
    const controls=await b.evaluate("[...document.querySelectorAll('button[aria-describedby=\"home-audio-status\"],button[aria-label*=\"astronaut caption\"]')].map(e=>{const r=e.getBoundingClientRect();return{w:r.width,h:r.height}})")
    assert.ok(controls.every(r=>r.w>=44&&r.h>=44))
    const overlap=await b.evaluate("(()=>{const a=document.querySelector('#home-audio-status').getBoundingClientRect(),b=document.querySelector('h1').getBoundingClientRect();return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top})()")
    assert.equal(overlap,false,'Autoplay fallback must not cover the heading')
    if([1440,390].includes(width))await capture(b,`first-${width}.jpg`)
    // Accessible user-initiated recovery uses genuine keyboard input on the
    // existing sound control. The original HTMLMediaElement.play is untouched.
    await b.evaluate("document.querySelector('button[aria-label=\"Turn sound on\"]').focus()")
    for(const type of ['keyDown','keyUp'])await b.send('Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13,...(type==='keyDown'?{text:'\r'}:{})})
    await b.waitFor("window.__homeAudio.some(a=>a.src.endsWith('/audio/home/intro.mp3')&&!a.paused&&a.currentTime>0.1)")
    assert.equal((await report(b,`manual-play-${width}`)).plays.filter(p=>p.src.endsWith('/audio/home/intro.mp3')).length,2)
    await click(b,'button[aria-label="Turn sound off"]')
    assert.ok(await b.evaluate("window.__homeAudio.every(a=>a.paused&&!a.getAttribute('src'))"))
    await report(b,`mute-${width}`)
    for(const planet of ['mars','moon']){
      await click(b,`a[aria-label="Explore ${planet==='mars'?'Mars':'Moon'}"]`)
      await b.waitFor(`location.pathname==='/explore/${planet}' && !!document.querySelector('#explorer-title') && !document.querySelector('#home-audio-status')`)
      assert.ok(await b.evaluate("window.__homeAudio.slice(0,2).every(a=>a.paused&&!a.getAttribute('src'))"))
      await click(b,'a[aria-label="Auroralys home"]')
      await b.waitFor("location.pathname==='/' && !!document.querySelector('#home-audio-status')")
      const back=await report(b,`return-${planet}-${width}`)
      assert.equal(back.caption,null);assert.equal(back.plays.filter(p=>p.src.endsWith('/audio/home/intro.mp3')).length,2)
    }
    if([1440,390].includes(width))await capture(b,`return-${width}.jpg`)
    await b.evaluate('window.__beforeHomeRefresh=true')
    await b.send('Page.reload')
    // Poll from Node: a promise evaluated in the old document cannot survive
    // reload. Navigation/context-destroyed protocol errors here are transient.
    let refreshed=false
    for(let attempt=0;attempt<100&&!refreshed;attempt++){
      try{refreshed=await b.evaluate("!window.__beforeHomeRefresh && !!document.querySelector('#home-audio-status') && Array.isArray(window.__homePlays)")}
      catch(error){if(!/navigated|closed|context|Cannot find/i.test(error.message))throw error}
      if(!refreshed)await new Promise(r=>setTimeout(r,100))
    }
    assert.ok(refreshed,'New homepage document must finish loading after refresh')
    const refresh=await report(b,`refresh-${width}`)
    assert.equal(refresh.caption,null);assert.ok(!refresh.plays.some(p=>p.src.endsWith('/audio/home/intro.mp3')))
    assert.deepEqual(b.events.filter(e=>e.method==='Runtime.exceptionThrown'),[])
  }catch(error){console.error(`Scenario ${width} failed:`,error);throw error}finally{await b.close()}
}
const reduced=await context(390,844)
try{
  await reduced.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
  await reduced.goto(origin.origin+'/')
  await reduced.waitFor("window.__homePlays.some(p=>p.status==='NotAllowedError')")
  assert.equal((await report(reduced,'reduced-motion-first-visit')).caption,'Welcome, explorer.')
  assert.equal(await reduced.evaluate("document.getAnimations().filter(a=>a.playState==='running').length"),0)
}finally{await reduced.close()}
// First homepage entry after an actual in-app navigation already has user
// activation. This tests permitted autoplay without changing browser policy.
const allowed=await context()
try{
  await allowed.goto(origin.origin+'/hardware')
  await click(allowed,'a[aria-label="Auroralys home"]')
  await allowed.waitFor("window.__homeAudio.some(a=>a.src.endsWith('/audio/home/intro.mp3')&&!a.paused&&a.currentTime>0.1)")
  const first=await report(allowed,'automatic-permitted-after-user-navigation')
  assert.equal(first.plays.filter(p=>p.src.endsWith('/audio/home/intro.mp3')).length,1)
  assert.equal(first.plays[0].status,'playing')
  // Leave while narration is actually playing, through the existing home menu.
  await click(allowed,'button[aria-label="Open navigation"]')
  await click(allowed,'#home-navigation a[href="/hardware"]')
  await allowed.waitFor("location.pathname==='/hardware'")
  assert.ok(await allowed.evaluate("window.__homeAudio.every(a=>a.paused&&!a.getAttribute('src'))"))
  await click(allowed,'a.button.primary[href^="/story/"]')
  await allowed.waitFor("!!document.querySelector('[data-continuous-story]')")
  const history=await allowed.send('Page.getNavigationHistory')
  assert.ok(history.currentIndex>0)
  await allowed.send('Page.navigateToHistoryEntry',{entryId:history.entries[history.currentIndex-1].id})
  await allowed.waitFor("location.pathname==='/hardware'")
  await click(allowed,'a[aria-label="Auroralys home"]')
  await allowed.waitFor("location.pathname==='/' && !!document.querySelector('#home-audio-status')")
  const back=await report(allowed,'return-from-rover-story')
  assert.equal(back.caption,null);assert.equal(back.plays.filter(p=>p.src.endsWith('/audio/home/intro.mp3')).length,1)
  assert.deepEqual(allowed.events.filter(e=>e.method==='Runtime.exceptionThrown'),[])
  const version=await allowed.send('Browser.getVersion')
  writeFileSync(resolve(output,'browser-results.json'),JSON.stringify({browser:version,results,screenshots,normalAutoplayPolicy:true,syntheticClicks:false,restrictedPolicyFlags:false},null,2)+'\n')
  console.log(JSON.stringify({cases:results.length,screenshots,blockedAutoplay:'passed',permittedAutoplay:'passed',keyboardRecovery:'passed',mute:'passed',routeCleanup:'passed',returns:'Mars/Moon/Rover passed',refresh:'passed',runtimeErrors:0},null,2))
}finally{await allowed.close()}
