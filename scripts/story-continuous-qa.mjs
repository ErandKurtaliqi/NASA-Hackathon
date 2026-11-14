// Real isolated Chrome + native input; no user profile/storage is read or reset.
// node scripts/story-continuous-qa.mjs <base-url> <debug-port> <external-output-dir>
import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { connectChrome } from './story-browser-qa.mjs'

const [base, port, output] = process.argv.slice(2)
if (!base || !port || !output) throw Error('Expected base URL, Chrome debugging port and external QA output directory')
const out = resolve(output); mkdirSync(out,{recursive:true})
const ids = ['apollo-15-rover','apollo-11-reflector','apollo-16-rover','apollo-17-rover','sojourner','opportunity','viking-1','ingenuity']
const resume = process.argv.includes('--resume-interactions')
const localAudio = process.argv.includes('--local-audio')
const chrome = await connectChrome(Number(port)), report = resume ? { ...JSON.parse(readFileSync(resolve(out,'continuous-verification.json'),'utf8')), input:[],audio:[],progress:[],errors:[] } : { base, views:[], links:[], input:[], audio:[], progress:[], errors:[] }
delete report.failure
const wait = ms => chrome.evaluate(`new Promise(r=>setTimeout(r,${ms}))`)
const geometry = `(()=>{const selectors=['[data-documentary-hardware]','[data-documentary-background]','[data-documentary-stage]','[data-documentary-evidence]','[data-documentary-controls]','[data-documentary-hardware] figure > div','[data-documentary-background] img'];return selectors.map(s=>{const e=document.querySelector(s);if(!e)return{selector:s,absent:true};const r=e.getBoundingClientRect(),c=getComputedStyle(e);return{selector:s,rect:[r.x,r.y,r.width,r.height],transform:c.transform,opacity:c.opacity,position:c.position,background:c.backgroundImage,objectFit:c.objectFit,objectPosition:c.objectPosition,filter:c.filter,source:e.getAttribute('src'),images:[...e.querySelectorAll('img,svg image')].map(i=>i.getAttribute('src')??i.getAttribute('href'))}})})()`
async function snapshot(){return chrome.evaluate(geometry)}
async function context(){return chrome.evaluate(`(()=>{const d=document.querySelector('[data-continuous-story]'),a=document.querySelector('audio');return{active:d.dataset.activeSegment,chapter:Number(d.dataset.activeChapter),audio:a.getAttribute('src'),playing:!a.paused,time:a.currentTime,evidence:document.querySelector('[data-documentary-evidence]').dataset.evidenceId,url:location.href,scroll:document.querySelector('[data-documentary-reader]').scrollTop}})()`)}
async function select(index){await chrome.evaluate(`(()=>{const r=document.querySelector('[data-documentary-reader]'),e=r.querySelectorAll('[data-segment]')[${index}];r.scrollTop+=e.getBoundingClientRect().top-r.getBoundingClientRect().top-20;return true})()`);await chrome.waitFor(`document.querySelector('[data-continuous-story]').dataset.activeSegment===document.querySelectorAll('[data-segment]')[${index}].dataset.segment`)}
function stable(a,b){
  // Evidence IMAGE may change; geometry and every other static source may not.
  const clean = rows=>rows.map(({images,...row})=>['[data-documentary-hardware]','[data-documentary-background]'].includes(row.selector)?{...row,images}:row)
  assert.deepEqual(clean(b),clean(a),'Static stage geometry/styles/hardware/background changed')
}
try {
  for (const [width,height] of (resume ? [] : [[1440,900],[1024,768],[390,844]])) {
    await chrome.size(width,height)
    for(const id of ids){
      await chrome.goto(`${base}/story/${id}`)
      await chrome.waitFor(`document.querySelector('[data-continuous-story]')?.dataset.continuousStory===${JSON.stringify(id)}`)
      const url=(await context()).url, first=await snapshot()
      assert.ok(await chrome.evaluate(`(()=>{const deck=document.querySelector('[data-documentary-controls]').getBoundingClientRect();return ['[data-documentary-hardware]','[data-documentary-evidence]'].every(s=>document.querySelector(s).getBoundingClientRect().bottom<=deck.top+1)})()`),'Hardware/evidence overlaps audio controls')
      await chrome.evaluate(`window.__hardwareNode=document.querySelector('[data-documentary-hardware]');window.__voiceNode=document.querySelector('audio');true`)
      const segments=await chrome.evaluate(`[...document.querySelectorAll('[data-segment]')].map(e=>({id:e.dataset.segment,audio:e.dataset.recording??null,evidence:e.dataset.evidence??null}))`)
      const checks=[]
      for(const index of [...segments.keys(),...segments.keys()].slice(0,segments.length).concat([...segments.keys()].reverse())){
        await select(index); const c=await context()
        assert.equal(c.active,segments[index].id,`${id}: segment ${index}`);assert.equal(c.url,url)
        if(index<segments.length-1){assert.equal(c.audio,segments[index].audio);assert.equal(c.evidence,segments[index].evidence)}
        stable(first,await snapshot())
        assert.equal(await chrome.evaluate(`window.__hardwareNode===document.querySelector('[data-documentary-hardware]')&&window.__voiceNode===document.querySelector('audio')`),true)
        checks.push(c)
      }
      assert.equal(await chrome.evaluate('localStorage.getItem("beyond-earth-progress")'),null,'Scrolling must not save progress')
      assert.equal(await chrome.evaluate('document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight'),false)
      await chrome.capture(resolve(out,`${id}-${width}.jpg`))
      report.views.push({id,width,height,geometry:first,checks,screenshot:`${id}-${width}.jpg`,metrics:await chrome.metrics()})
      writeFileSync(resolve(out,'continuous-verification.json'),JSON.stringify(report,null,2))
      console.log(`${id} ${width}x${height}: ${checks.length} forward/reverse contexts; static scene PASS`)
    }
  }
  await chrome.size(1440,900)
  for(const id of (resume ? [] : ids))for(let chapter=1;chapter<=5;chapter++){
    await chrome.goto(`${base}/story/${id}/${chapter}`)
    assert.equal((await context()).chapter,chapter)
    report.links.push({id,chapter,context:await context()})
  }
  await chrome.goto(`${base}/story/apollo-15-rover`)
  const reader=await chrome.evaluate(`(()=>{const r=document.querySelector('[data-documentary-reader]').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`)
  const start=await context()
  for(let i=0;i<12;i++){await chrome.send('Input.dispatchMouseEvent',{type:'mouseWheel',...reader,deltaX:0,deltaY:120});await wait(50)}
  const slow=await context();assert.ok(slow.scroll>start.scroll);report.input.push({kind:'slow native wheel',start,after:slow})
  await select(0)
  await chrome.evaluate(`document.querySelector('[data-documentary-reader]').focus();true`)
  await chrome.send('Input.dispatchKeyEvent',{type:'keyDown',key:'PageDown',code:'PageDown',windowsVirtualKeyCode:34});await chrome.send('Input.dispatchKeyEvent',{type:'keyUp',key:'PageDown',code:'PageDown',windowsVirtualKeyCode:34});await wait(350)
  const keyboard=await context();assert.ok(keyboard.scroll>0);report.input.push({kind:'native PageDown',after:keyboard})
  for(const index of [15,2,12,0,8,1])await select(index)
  report.input.push({kind:'rapid jumps and reverse',after:await context()})
  await chrome.size(390,844);await chrome.goto(`${base}/story/apollo-15-rover`)
  const touch=await chrome.evaluate(`(()=>{const r=document.querySelector('[data-documentary-reader]').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`)
  // Direct native touch sequence: synthesizeScrollGesture is a no-op in some
  // headless Chrome versions. Never replace a touch assertion with scrollTop.
  await chrome.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:touch.x,y:touch.y+50}]})
  for(let dy=38;dy>=-70;dy-=12){await chrome.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:touch.x,y:touch.y+dy}]});await wait(25)}
  await chrome.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(300)
  const touched=await context();assert.ok(touched.scroll>0);report.input.push({kind:'emulated touch swipe',after:touched})
  await chrome.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});const before=await snapshot();await select(8);stable(before,await snapshot());report.input.push({kind:'reduced motion',after:await context()})
  await chrome.send('Emulation.setEmulatedMedia',{features:[]})
  // Actual original MP3 playback, no mocked media elements or autoplay flags.
  await select(0);assert.equal((await context()).playing,false)
  await chrome.click('Play Narration');await chrome.waitFor(`!document.querySelector('audio').paused&&document.querySelector('audio').currentTime>0`)
  report.audio.push({kind:'explicit activation',context:await context()});await select(1);await chrome.waitFor(`!document.querySelector('audio').paused&&document.querySelector('audio').currentTime>0`);report.audio.push({kind:'segment switch',context:await context()})
  await chrome.click('Pause narration');await select(2);assert.equal((await context()).playing,false);report.audio.push({kind:'pause respected on scroll',context:await context()})
  await chrome.click('Play Narration');await select(0);await chrome.waitFor(`!document.querySelector('audio').paused&&document.querySelector('audio').currentTime>0`);report.audio.push({kind:'backward replay from start',context:await context()})
  await chrome.click('Pause narration')
  if(localAudio) for(const id of ['apollo-16-rover','sojourner','opportunity','viking-1','ingenuity']){
    await chrome.goto(`${base}/story/${id}`);await chrome.click('Play Narration')
    await chrome.waitFor(`!document.querySelector('audio').paused&&document.querySelector('audio').currentTime>0`)
    const first=await context();await chrome.click('Next segment')
    await chrome.waitFor(`document.querySelector('audio').getAttribute('src').endsWith('/2.mp3')&&!document.querySelector('audio').paused&&document.querySelector('audio').currentTime>0`)
    const second=await context();await chrome.click('Pause narration');await chrome.click('Next segment')
    assert.equal((await context()).playing,false);report.audio.push({id,kind:'actual local recording / switch / pause',first,second,paused:await context()})
  }
  await chrome.goto(`${base}/story/apollo-11-reflector`);await chrome.click('Follow the light: next stage')
  assert.ok((await chrome.evaluate(`document.querySelector('#laser-lab-title').parentElement.innerText`)).includes('Stage 2:'))
  await chrome.goto(`${base}/story/apollo-15-rover/4`)
  await chrome.evaluate(`document.querySelector('input[type=radio]').click();true`,true);await chrome.click('Compare with evidence')
  assert.ok(await chrome.evaluate(`!!document.querySelector('h3[id$="-feedback"]')`))
  assert.equal(await chrome.evaluate(`localStorage.getItem('beyond-earth-progress')`),null)
  report.activities={laserRanging:true,hammerFeather:true,optionalActivitiesDoNotSave:true}
  await chrome.goto(`${base}/story/apollo-15-rover`);await chrome.send('Page.bringToFront')
  await chrome.evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent==='Next segment').focus();true`)
  await chrome.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'})
  await chrome.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13})
  await chrome.waitFor(`document.querySelector('[data-continuous-story]').dataset.activeSegment.endsWith('meet:2')`)
  report.input.push({kind:'native Enter activates segment shortcut and moves focus',after:await context()})
  // Complete the real quiz and intentional chapter actions using disposable
  // incognito storage only. Never reset the user's saved progress.
  for(const id of ids){
    await chrome.goto(`${base}/story/${id}`)
    for(let ch=0;ch<4;ch++){
      await chrome.evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.startsWith('Mark ')&&!b.disabled);if(!b)throw Error('Missing intentional chapter action');b.scrollIntoView({block:'center',behavior:'instant'});b.click();return true})()`,true);await wait(50)
    }
    await chrome.evaluate(`document.querySelector('[data-segment="${id}:quiz"]').scrollIntoView({block:'start',behavior:'instant'});true`)
    for(let q=0;q<3;q++){
      await chrome.evaluate(`document.querySelector('.quiz-options button').click();true`,true);await wait(40)
      await chrome.evaluate(`document.querySelector('.quiz-explanation button').click();true`,true);await wait(60)
    }
    await chrome.click('COMPLETE STORY')
    const saved=await chrome.evaluate(`JSON.parse(localStorage.getItem('beyond-earth-progress')).state`)
    assert.equal(saved.storyProgress[id].completedMission,true);assert.equal(saved.storyProgress[id].completed.length,5);assert.equal(saved.badges.filter(b=>b===`${id}-storyteller`).length,1)
    await chrome.goto(`${base}/story/${id}/5`);await chrome.click('COMPLETE STORY')
    const repeated=await chrome.evaluate(`JSON.parse(localStorage.getItem('beyond-earth-progress')).state`);assert.deepEqual(repeated,saved)
    report.progress.push({id,completed:saved.storyProgress[id],badge:`${id}-storyteller`,repeatedAndReload:true})
  }
  // An already completed mission can retry its quiz without losing its badge.
  await chrome.goto(`${base}/story/apollo-15-rover/5`)
  for(let q=0;q<3;q++){await chrome.evaluate(`document.querySelector('.quiz-options button').click();true`,true);await wait(40);await chrome.evaluate(`document.querySelector('.quiz-explanation button').click();true`,true);await wait(60)}
  await chrome.click('TRY AGAIN');assert.equal(await chrome.evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent==='COMPLETE STORY').disabled`),true)
  assert.equal(await chrome.evaluate(`JSON.parse(localStorage.getItem('beyond-earth-progress')).state.storyProgress['apollo-15-rover'].completedMission`),true)
  // Reject a genuine persisted write; recovery must not duplicate rewards.
  await chrome.goto(`${base}/story/apollo-15-rover/5`)
  const durableBefore=await chrome.evaluate(`localStorage.getItem('beyond-earth-progress')`)
  await chrome.evaluate(`window.__originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('QA quota','QuotaExceededError')};true`)
  await chrome.click('COMPLETE STORY');await chrome.waitFor(`!!document.querySelector('[data-documentary-save-warning]')`)
  assert.equal(await chrome.evaluate(`localStorage.getItem('beyond-earth-progress')`),durableBefore)
  await chrome.evaluate(`Storage.prototype.setItem=window.__originalSetItem;true`)
  await chrome.evaluate(`document.querySelector('[data-documentary-save-warning] button').click();true`,true)
  await chrome.waitFor(`document.querySelector('[data-documentary-save-warning]')?.textContent.includes('Progress saved on this device')`)
  assert.equal(await chrome.evaluate(`localStorage.getItem('beyond-earth-progress')`),durableBefore)
  report.progress.push({kind:'completed-quiz retry and real quota failure/recovery',badgeIdempotent:true})
  await chrome.goto(`${base}/dashboard`);await chrome.waitFor(`!!document.querySelector('.mission-control-head')`);assert.ok((await chrome.evaluate('document.body.innerText')).includes('40 / 40 CHAPTERS COMPLETE'))
  await chrome.goto(`${base}/story/apollo-15-rover`);await chrome.click('Play Narration');await chrome.waitFor(`!document.querySelector('audio').paused`)
  await chrome.evaluate(`window.__departingAudio=document.querySelector('audio');[...document.querySelectorAll('a')].find(a=>a.textContent==='Hardware Lab').click();true`,true)
  await chrome.waitFor(`!!document.querySelector('.hardware-page')`)
  assert.equal(await chrome.evaluate(`window.__departingAudio.paused&&!window.__departingAudio.getAttribute('src')&&!document.querySelector('audio')`),true)
  report.audio.push({kind:'real client-navigation cleanup',passed:true})
  report.errors=chrome.events.filter(e=>e.method==='Runtime.exceptionThrown').map(e=>e.params.exceptionDetails)
  assert.equal(report.errors.length,0)
  writeFileSync(resolve(out,'continuous-verification.json'),JSON.stringify(report,null,2));console.log('PASS: all 8 missions / 40 legacy routes / native inputs / actual narration / real completion persistence')
} catch(error){report.failure=error.stack;writeFileSync(resolve(out,'continuous-verification.json'),JSON.stringify(report,null,2));throw error}
finally{await chrome.close()}
