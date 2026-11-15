import assert from 'node:assert/strict'
import {test} from 'node:test'
import {build} from 'esbuild'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'

const root=fileURLToPath(new URL('../',import.meta.url)),require=createRequire(import.meta.url)
const built=await build({stdin:{contents:`export * from './src/components/home/homeNarration';
export * from './src/components/home/homeIntroductionSession';
export {default as useNarration} from './src/components/home/useHomeNarration';
export {default as Guide} from './src/components/home/AstronautGuide';`,resolveDir:root},bundle:true,write:false,
  outfile:`${root}/.home-introduction-test.cjs`,platform:'node',format:'cjs',packages:'external',jsx:'automatic',loader:{'.css':'local-css'},logLevel:'silent'})

function fixture({seen=false,blocked=false,deferred=false,denied=false,strict=false}={}){
  const memory=new Map(seen?[['auroralys-home-intro-seen-v1','1']]:[]),audio=[],listeners=new Map()
  globalThis.window={location:{pathname:'/'},addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:(name,fn)=>{if(listeners.get(name)===fn)listeners.delete(name)},
    get sessionStorage(){if(denied)throw Error('Storage denied');return {getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value)}}}
  globalThis.Audio=class{
    constructor(){this.src='';this.paused=true;this.currentTime=0;this.duration=NaN;this.plays=0;audio.push(this)}
    play(){assert.ok(audio.filter(a=>a!==this).every(a=>a.paused));this.plays++
      if(blocked)return Promise.reject(Object.assign(Error('Activation required'),{name:'NotAllowedError'}))
      if(deferred)return new Promise((resolve,reject)=>{this.resolve=()=>{this.paused=false;resolve()};this.reject=reject})
      this.paused=false;return Promise.resolve()}
    pause(){this.paused=true}removeAttribute(){this.src=''}load(){this.released=true}
  }
  let cells=[],cursor=0,pending=[],dirty=false,state,api
  const slot=init=>cells[cursor++]??=init()
  const hooks={...React,
    useState(init){const cell=slot(()=>({value:typeof init==='function'?init():init}));return [cell.value,next=>{cell.value=typeof next==='function'?next(cell.value):next;dirty=true}]},
    useRef(value){return slot(()=>({current:value}))},
    useEffect(fn,deps){const cell=slot(()=>({}));if(!cell.deps||deps.some((v,i)=>!Object.is(v,cell.deps[i]))){cell.deps=deps;cell.setup=fn;pending.push(()=>{cell.cleanup?.();cell.cleanup=fn()})}},
  }
  function loadModule(){const module={exports:{}};new Function('require','module','exports',built.outputFiles.find(f=>f.path.endsWith('.cjs')).text)(id=>id==='react'?hooks:require(id),module,module.exports);api=module.exports}
  loadModule()
  function render(){let runs=0;do{dirty=false;cursor=0;state=api.useNarration();const effects=pending;pending=[];effects.forEach(fn=>fn());assert.ok(++runs<8)}while(dirty)}
  function unmount(){cells.forEach(cell=>cell.cleanup?.());cells=[];pending=[];cursor=0}
  function mount(){render();if(strict){cells.filter(c=>c.setup).forEach(c=>{c.cleanup?.();c.cleanup=c.setup()})}}
  mount()
  return {audio,memory,state:()=>state,api:()=>api,
    event(name,path='/'){window.location.pathname=path;listeners.get(name)?.();render()},
    async settle(){for(let i=0;i<6;i++){await Promise.resolve();render()}return state},
    toggle(){state.toggle();render()},select(planet){state.select(planet);render()},
    leave:unmount,returnHome(){mount()},reload(){unmount();loadModule();mount()},
    guide(extra={}){const old=cells;cells=[];cursor=0;const tree=api.Guide({highlighted:null,selected:null,narration:state,astronaut:'/images/home/astronaut-guide.png',...extra});cells=old;pending=[];return renderToStaticMarkup(tree)},
    dispose(){unmount();assert.equal(listeners.size,0);delete globalThis.window;delete globalThis.Audio},
  }
}

test('first entry exposes the approved introduction, claims the tab and attempts the original MP3',async()=>{
  const f=fixture();try{
    assert.equal(f.state().introVisible,true);assert.ok(f.guide().includes('Welcome, explorer.'))
    await f.settle();assert.equal(f.audio.length,1);assert.equal(f.audio[0].src,'/audio/home/intro.mp3')
    assert.equal(f.audio[0].plays,1);assert.equal(f.state().phase,'playing');assert.equal(f.memory.get('auroralys-home-intro-seen-v1'),'1')
  }finally{f.dispose()}
})

test('blocked autoplay retains readable captions and exposes sound-on recovery without retry loops',async()=>{
  const f=fixture({blocked:true});try{
    await f.settle();assert.equal(f.state().enabled,false);assert.equal(f.state().introVisible,true)
    assert.equal(f.state().phase,'error');assert.match(f.state().message,/browser blocked automatic audio.*Turn sound on/)
    assert.ok(f.guide().includes('Welcome, explorer.'));assert.ok(f.guide().includes('Next astronaut caption'))
    assert.equal(f.audio.length,1);assert.equal(f.audio[0].src,'');assert.ok(f.audio[0].paused)
    await f.settle();assert.equal(f.audio.length,1)
    f.toggle();assert.equal(f.audio.length,2,'Only an explicit action retries playback')
  }finally{f.dispose()}
})

test('manual mute immediately releases pending autoplay and ignores a late resolution',async()=>{
  const f=fixture({deferred:true});try{
    await f.settle();assert.equal(f.state().enabled,true);const old=f.audio[0]
    f.toggle();assert.equal(f.state().enabled,false);assert.ok(old.paused&&old.released);assert.equal(old.src,'')
    old.resolve();await f.settle();assert.ok(old.paused);assert.equal(f.state().enabled,false)
    assert.ok(f.guide().includes('Welcome, explorer.'),'Muted first-visit captions remain readable')
  }finally{f.dispose()}
})

for(const route of ['Mars','Moon','Rover Stories'])test(`returning from ${route} shows no automatic introduction or audio`,async()=>{
  const f=fixture();try{
    await f.settle();f.leave();assert.ok(f.audio.every(a=>a.paused&&a.src===''))
    f.returnHome();assert.equal(f.state().introVisible,false);assert.ok(!f.guide().includes('data-home-caption'))
    await f.settle();assert.equal(f.audio.length,1);assert.ok(!f.guide().includes('astronaut-dialogue'))
    assert.ok(f.guide().includes('smiling astronaut guide'),'The astronaut stays visible')
  }finally{f.dispose()}
})

test('refresh in the same tab reads session storage and never replays, even after blocked autoplay',async()=>{
  const f=fixture({blocked:true});try{
    await f.settle();f.reload();await f.settle();assert.equal(f.audio.length,1)
    assert.equal(f.state().introVisible,false);assert.ok(!f.guide().includes('Welcome, explorer.'))
  }finally{f.dispose()}
})

test('React Strict Mode probe neither consumes the first visit nor creates duplicate playback',async()=>{
  const f=fixture({strict:true});try{
    assert.equal(f.audio.length,0);assert.equal(f.memory.size,0)
    await f.settle();assert.equal(f.audio.length,1);assert.equal(f.audio[0].plays,1)
    assert.equal(f.state().introVisible,true);assert.equal(f.state().phase,'playing')
  }finally{f.dispose()}
})

test('leaving before the deferred setup does not create audio or consume an introduction never shown',async()=>{
  const f=fixture();try{
    f.leave();await Promise.resolve();assert.equal(f.audio.length,0);assert.equal(f.memory.size,0)
    f.returnHome();await f.settle();assert.equal(f.audio.length,1)
  }finally{f.dispose()}
})

test('route cleanup removes all media handlers and prevents late pending playback after returning',async()=>{
  const f=fixture({deferred:true});try{
    await f.settle();const audio=f.audio[0],late=audio.ontimeupdate
    f.leave();for(const name of ['onerror','onended','onloadedmetadata','ontimeupdate','onplaying','onpause','onwaiting'])assert.equal(audio[name],null)
    f.returnHome();await f.settle();audio.resolve();late();await f.settle()
    assert.ok(audio.paused);assert.equal(f.state().recording,null);assert.equal(f.state().introVisible,false)
  }finally{f.dispose()}
})

test('returning sound-on arms world narration without a welcome; planet selection stays explicit',async()=>{
  const f=fixture({seen:true});try{
    await f.settle();f.toggle();assert.equal(f.audio.length,0);assert.equal(f.state().enabled,true)
    assert.ok(!f.guide().includes('Welcome, explorer.'))
    f.select('moon');await f.settle();assert.equal(f.audio[0].src,'/audio/home/moon.mp3')
    f.select('moon');assert.equal(f.audio.length,1)
    f.toggle();f.select('mars');assert.equal(f.audio.length,1)
    f.toggle();await f.settle();assert.equal(f.audio[1].src,'/audio/home/mars.mp3')
    assert.ok(f.audio.every(a=>a.src!=='/audio/home/intro.mp3'))
  }finally{f.dispose()}
})

test('navigation intent stops audio and hides captions before an exit animation unmounts the homepage',async()=>{
  const early=fixture();try{
    early.state().stopForNavigation();await early.settle()
    assert.equal(early.audio.length,0,'Navigation before deferred entry must cancel its autoplay too')
    assert.equal(early.state().introVisible,false)
  }finally{early.dispose()}
  const f=fixture({deferred:true});try{
    await f.settle();const old=f.audio[0]
    f.state().stopForNavigation();await f.settle()
    assert.equal(f.state().introVisible,false);assert.equal(f.state().recording,null)
    assert.ok(!f.guide().includes('data-home-caption'));assert.ok(old.paused&&old.src==='')
    old.resolve();await f.settle();assert.ok(old.paused)
    f.toggle();assert.equal(f.audio.length,1,'A quick return does not replay welcome')
    f.select('mars');assert.equal(f.audio[1].src,'/audio/home/mars.mp3')
  }finally{f.dispose()}
})

test('history navigation and pagehide stop playback; their listeners are removed on cleanup',async()=>{
  for(const event of ['popstate','pagehide']){
    const f=fixture({deferred:true});try{
      await f.settle();f.event(event,'/explore/moon');assert.equal(f.state().enabled,false)
      assert.equal(f.state().introVisible,false);assert.ok(f.audio[0].paused&&f.audio[0].src==='')
    }finally{f.dispose()}
  }
})

test('returning visitors can preview planet captions silently, without a default introduction bubble',async()=>{
  const f=fixture({seen:true});try{
    await f.settle();assert.ok(!f.guide().includes('data-home-caption'))
    assert.ok(f.guide({highlighted:'moon'}).includes('Look... the Moon still keeps'))
    assert.ok(f.guide({selected:'mars'}).includes('Mars holds many brave robots'))
    assert.equal(f.audio.length,0)
  }finally{f.dispose()}
})

test('denied session storage remains safe and suppresses repeats within the running application',async()=>{
  const f=fixture({denied:true});try{
    await f.settle();f.leave();f.returnHome();await f.settle()
    assert.equal(f.audio.length,1);assert.equal(f.state().introVisible,false)
  }finally{f.dispose()}
})

test('full storage, existing session markers and new tab sessions are independent of progress storage',()=>{
  const f=fixture();try{
    const create=f.api().createHomeIntroductionSession
    let writes=0;const session=create(()=>({getItem:()=>null,setItem(){writes++;throw Error('Quota')}}))
    assert.equal(session.seen(),false);assert.equal(session.claim(),true);assert.equal(session.claim(),false);assert.equal(writes,1)
    const existing=create(()=>({getItem:()=> '1',setItem(){throw Error('Do not rewrite existing visits')}}))
    assert.equal(existing.seen(),true);assert.equal(existing.claim(),false)
    const newTab=create(()=>({getItem:()=>null,setItem(){}}))
    assert.equal(newTab.seen(),false);assert.equal(newTab.claim(),true)
    assert.deepEqual([...f.memory.keys()],[],'No local or mission storage is touched')
  }finally{f.dispose()}
})
