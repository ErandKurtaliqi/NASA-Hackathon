// Real installed Chrome via the existing isolated CDP host. No browser dependency.
// Usage: node scripts/final-mission-locations-qa.mjs <external-output-dir> [loopback-origin] [chrome-port]
import assert from 'node:assert/strict'
import {mkdirSync, realpathSync, existsSync, writeFileSync} from 'node:fs'
import {resolve, relative, dirname, isAbsolute} from 'node:path'
import {fileURLToPath} from 'node:url'
import {connectChrome} from './story-browser-qa.mjs'

const root=fileURLToPath(new URL('../',import.meta.url))
assert.ok(process.argv[2],'Supply an external QA output directory')
const output=resolve(process.argv[2]), origin=new URL(process.argv[3]??'http://127.0.0.1:5199')
assert.ok(['127.0.0.1','localhost','[::1]'].includes(origin.hostname),'QA must use a loopback origin')
let ancestor=output
while(!existsSync(ancestor))ancestor=dirname(ancestor)
const inside=path=>{const r=relative(realpathSync(root),path);return !r||(!r.startsWith('..')&&!isAbsolute(r))}
assert.ok(!inside(output)&&!inside(realpathSync(ancestor)),'QA output must be outside the checkout')
mkdirSync(output,{recursive:true})
const expected={moon:[
  ['apollo-11','Apollo 11 LRRR','Mare Tranquillitatis, Sea of Tranquility','0.67345° N, 23.47307° E',0.67345,23.47307],
  ['apollo-15-rover','Apollo 15 LRV','Hadley-Apennine Region, Hadley Rille','26.13110° N, 3.63972° E',26.13110,3.63972],
  ['apollo-16-rover','Apollo 16 LRV','Descartes Highlands, near Orion Lunar Module','8.97292° S, 15.50279° E',-8.97292,15.50279],
  ['apollo-17-rover','Apollo 17 LRV','Taurus-Littrow Valley, near Challenger Lunar Module','20.19043° N, 30.77726° E',20.19043,30.77726],
],mars:[
  ['opportunity','Opportunity Rover','Perseverance Valley, Endeavour Crater'],
  ['sojourner','Sojourner Rover','Ares Vallis, Mars Pathfinder Landing Site'],
  ['viking-1','Viking 1 Lander','Chryse Planitia','22.483° N, 47.968° W',22.483,-47.968],
  ['ingenuity','Ingenuity Helicopter','Valinor Hills, Jezero Crater'],
]}
const browser=await connectChrome(Number(process.argv[4]??9338)), results=[],screenshots=[]
const frames=()=>browser.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
async function select(index){await browser.evaluate(`document.querySelectorAll('#scientific-locations li button')[${index}].click()`,true);await frames()}
async function sectionCapture(name){
  await browser.evaluate("document.querySelector('#scientific-locations').scrollIntoView({block:'start',behavior:'instant'})")
  await frames()
  const box=await browser.evaluate("(()=>{const r=document.querySelector('#scientific-locations').getBoundingClientRect();return {x:0,y:Math.max(0,r.top+scrollY),width:innerWidth,height:Math.ceil(r.height),scale:1}})()")
  const capture=await browser.send('Page.captureScreenshot',{format:'jpeg',quality:85,clip:box,captureBeyondViewport:true})
  writeFileSync(resolve(output,name),Buffer.from(capture.data,'base64'));screenshots.push(name)
}
async function installMapProbe(){await browser.evaluate(`(async()=>{
  const L=(await import('/node_modules/.vite/deps/leaflet.js')).default;
  window.__missionMapCalls=[];
  for(const method of ['flyTo','fitBounds','panBy']){
    const original=L.Map.prototype[method];
    L.Map.prototype[method]=function(...args){window.__missionMapCalls.push({method,args});return original.apply(this,args)};
  }
})()`)}
try{
  await browser.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
  for(const [width,height,label] of [[1440,900,'desktop'],[768,1024,'tablet'],[360,800,'mobile'],[390,844,'mobile390'],[439,591,'mobile439']]){
    await browser.size(width,height)
    for(const planet of ['moon','mars']){
      await browser.goto(`${origin.origin}/explore/${planet}?view=map`)
      await browser.waitFor("document.querySelector('.leaflet-container') && document.querySelector('[data-mission-location]')")
      await installMapProbe()
      assert.equal(await browser.evaluate("document.querySelectorAll('#scientific-locations li button').length"),4)
      for(const [index,[id,name,place,display,lat,lon]]of expected[planet].entries()){
        await select(index)
        const details=await browser.evaluate("document.querySelector('#location-information').innerText")
        assert.ok(details.includes(name)&&details.includes(place)&&details.includes(display??'Not provided'))
        await browser.evaluate("window.__missionMapCalls=[]")
        await browser.click('View on 2D map')
        await browser.waitFor(`document.querySelector('[data-mission-location]')?.dataset.missionLocation===${JSON.stringify(id)}`)
        const state=await browser.evaluate(`({text:document.querySelector('[data-mission-location]').innerText,calls:window.__missionMapCalls,
          pins:document.querySelectorAll('.leaflet-marker-icon').length,focus:document.activeElement?.getAttribute('role'),
          overflow:document.documentElement.scrollWidth>innerWidth})`)
        assert.ok(state.text.includes(place)&&state.text.includes(display??'No exact final-position pin'))
        assert.equal(state.pins,planet==='moon'?4:1);assert.equal(state.focus,'region');assert.equal(state.overflow,false)
        if(display){assert.ok(state.calls.some(c=>c.method==='flyTo'&&c.args[0][0]===lat&&c.args[0][1]===lon))}
        else{assert.ok(state.calls.some(c=>c.method==='fitBounds'));assert.ok(!state.calls.some(c=>c.method==='flyTo'))}
        results.push({viewport:[width,height],planet,id,...state})
      }
      // Every control in the lower section is an accessible touch target.
      const sizes=await browser.evaluate("[...document.querySelectorAll('#scientific-locations button,#scientific-locations a')].map(e=>({text:e.textContent.trim(),w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))")
      assert.ok(sizes.every(r=>r.w>=44&&r.h>=44),JSON.stringify(sizes))
      await select(0)
      if(['desktop','tablet','mobile'].includes(label))await sectionCapture(`${planet}-${label}.jpg`)
      // Native Tab + Enter selection, then Tab through the list to the map action.
      await browser.evaluate("document.querySelector('#scientific-locations li button').focus()")
      for(const [key,code]of[['Tab',9],['Enter',13]]){
        await browser.send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,windowsVirtualKeyCode:code,text:key==='Enter'?'\r':undefined})
        await browser.send('Input.dispatchKeyEvent',{type:'keyUp',key,code:key,windowsVirtualKeyCode:code})
      }
      await frames()
      assert.equal(await browser.evaluate("document.querySelectorAll('#scientific-locations li button')[1].getAttribute('aria-pressed')"),'true')
      assert.ok(await browser.evaluate("document.activeElement.matches(':focus-visible')"))
    }
  }
  // Client-side planet switching must not retain an Apollo selection on Mars.
  await browser.evaluate("document.querySelector('nav[aria-label=\"Choose a world\"] a[href=\"/explore/moon\"]').click()",true)
  await browser.waitFor("location.pathname==='/explore/moon' && document.querySelector('#location-title')?.textContent==='Apollo 11 LRRR'")
  await select(3)
  await browser.evaluate("document.querySelector('nav[aria-label=\"Choose a world\"] a[href=\"/explore/mars\"]').click()",true)
  await browser.waitFor("location.pathname==='/explore/mars' && document.querySelector('#location-title')?.textContent==='Opportunity Rover'")
  // Normal-motion focusing and the existing mobile interaction switch.
  await browser.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]})
  await browser.size(390,844)
  await browser.goto(`${origin.origin}/explore/mars?view=map`)
  await browser.waitFor("document.querySelector('.leaflet-container')")
  await installMapProbe();await select(2);await browser.click('View on 2D map')
  await browser.evaluate('new Promise(r=>setTimeout(r,1600))')
  assert.ok(await browser.evaluate("window.__missionMapCalls.some(c=>c.method==='flyTo'&&c.args[2]?.animate===true)"))
  await browser.click('Interact with map')
  assert.equal(await browser.evaluate("[...document.querySelectorAll('button')].find(b=>b.textContent==='Done')?.getAttribute('aria-pressed')"),'true')
  await browser.click('Done')
  // Real keyboard zoom using Leaflet's existing focusable container.
  await browser.evaluate("document.querySelector('.leaflet-container').focus()")
  await browser.evaluate('window.__missionMapCalls=[]')
  for(const type of ['keyDown','keyUp'])await browser.send('Input.dispatchKeyEvent',{type,key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39})
  assert.ok(await browser.evaluate("window.__missionMapCalls.some(c=>c.method==='panBy')"))
  await browser.evaluate("document.querySelector('[data-mission-location]').scrollIntoView({block:'start',behavior:'instant'})")
  await frames();await browser.capture(resolve(output,'mars-mobile-map.jpg'));screenshots.push('mars-mobile-map.jpg')
  // Simulate unavailable NASA tiles, preserving the local mosaic and attribution.
  const intentionalFailureStart=browser.events.length
  await browser.send('Network.setCacheDisabled',{cacheDisabled:true})
  await browser.send('Network.setBlockedURLs',{urls:['*trek.nasa.gov/tiles/*']})
  await browser.goto(`${origin.origin}/explore/moon?view=map`)
  await browser.waitFor("document.querySelector('.map-service-state.fallback') && document.querySelector('.leaflet-image-layer')?.naturalWidth>0")
  assert.ok(await browser.evaluate("document.querySelector('.map-data-panel').textContent.includes('NASA TREK WMTS')"))
  const simulatedFailures=browser.events.slice(intentionalFailureStart).filter(e=>e.method==='Network.loadingFailed').length
  assert.ok(simulatedFailures>0)
  await browser.send('Network.setBlockedURLs',{urls:[]})
  await browser.send('Network.setCacheDisabled',{cacheDisabled:false})
  // Verify an unchanged canonical story route without activating narration.
  await browser.goto(`${origin.origin}/story/apollo-15-rover`)
  await browser.waitFor("document.querySelector('[data-continuous-story=\"apollo-15-rover\"]')")
  assert.equal(await browser.evaluate("document.querySelectorAll('audio').length"),1)
  assert.ok(await browser.evaluate("[...document.querySelectorAll('audio')].every(a=>a.paused)"))
  const errors=browser.events.filter(e=>e.method==='Runtime.exceptionThrown')
  assert.deepEqual(errors,[])
  writeFileSync(resolve(output,'browser-results.json'),JSON.stringify({browser:await browser.send('Browser.getVersion'),results,screenshots,keyboard:'Tab/Enter and Leaflet arrow passed',planetSwitch:'passed',storyRoute:'passed',normalMotion:'passed',mobileInteraction:'passed',tileFailureFallback:'passed',simulatedFailures,runtimeErrors:errors,networkFailures:browser.events.filter(e=>e.method==='Network.loadingFailed')},null,2)+'\n')
  console.log(JSON.stringify({checks:results.length,screenshots,keyboard:'passed',planetSwitch:'passed',storyRoute:'passed',normalMotion:'passed',mobileInteraction:'passed',tileFailureFallback:'passed',runtimeErrors:errors.length},null,2))
}finally{await browser.close()}
