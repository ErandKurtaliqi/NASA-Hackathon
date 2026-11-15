import assert from 'node:assert/strict'
import {test} from 'node:test'
import {build} from 'esbuild'
import {createRequire} from 'node:module'
import {readFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import React from 'react'
const root=fileURLToPath(new URL('../',import.meta.url)),require=createRequire(import.meta.url)
const built=await build({stdin:{contents:`export {default as Audio} from './src/components/storytelling/DocumentaryAudio';export * from './src/features/explorer/documentaryPlanetReturn';`,resolveDir:root},bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',packages:'external',logLevel:'silent'})
const code=built.outputFiles[0].text
const instantiate=custom=>{const m={exports:{}};new Function('require','module','exports',code)(custom??require,m,m.exports);return m.exports}
function nodes(tree,test){if(Array.isArray(tree))return tree.flatMap(n=>nodes(n,test));if(!tree?.props)return[];return[...(test(tree)?[tree]:[]),...nodes(tree.props.children,test)]}
function fixture({src='/first.mp3',hold,contextId='first',sync=true,autoPlay=false}={}){
 const requests=[],audio={paused:true,currentTime:0,src:'',plays:0,play(){this.plays++;if(this.throws)throw Error('Decoder failure');this.paused=false;this.onplay?.();return this.pending??Promise.resolve()},pause(){this.paused=true;this.onpause?.()},removeAttribute(){this.src=''},load(){this.loads=(this.loads??0)+1}}
 const previous={fetch:globalThis.fetch,window:globalThis.window,navigator:Object.getOwnPropertyDescriptor(globalThis,'navigator')}
 globalThis.fetch=(src,options)=>new Promise((resolve,reject)=>requests.push({src,signal:options.signal,resolve:available=>resolve({ok:available,headers:{get:()=>available?'audio/mpeg':'text/html'}}),reject}))
 globalThis.window={speechSynthesis:{cancel(){}}};Object.defineProperty(globalThis,'navigator',{value:{connection:{saveData:true}},configurable:true})
 let cells=[],cursor=0,pending=[],dirty=false,tree,props={src,hold,contextId,autoPlay,label:'Visible segment',onBeforeEnable:()=>sync}
 const slot=fn=>cells[cursor++]??=fn()
 const hooks={...React,useRef:value=>slot(()=>({current:value})),useState(init){const c=slot(()=>({value:typeof init==='function'?init():init}));return[c.value,value=>{const next=typeof value==='function'?value(c.value):value;if(!Object.is(c.value,next)){c.value=next;dirty=true}}]},useEffect(fn,deps){const c=slot(()=>({}));if(!c.deps||deps.some((v,i)=>!Object.is(v,c.deps[i]))){c.deps=deps;pending.push(()=>{c.cleanup?.();c.cleanup=fn()})}}}
 const api=instantiate(id=>id==='react'?hooks:require(id))
 function render(){let pass=0;do{dirty=false;cursor=0;tree=api.Audio(props);nodes(tree,n=>n.type==='audio')[0].ref.current=audio;const effects=pending;pending=[];effects.forEach(fn=>fn());assert.ok(++pass<12)}while(dirty)}
 render()
 return{audio,requests,tree:()=>tree,button:()=>nodes(tree,n=>n.type==='button')[0],message:()=>nodes(tree,n=>n.props.role==='status')[0].props.children,
 toggle(){nodes(tree,n=>n.type==='button')[0].props.onClick();render()},change(next){props={...props,...next};render()},
 async settle(){for(let i=0;i<6;i++){await Promise.resolve();render()}},
 dispose(){cells.forEach(c=>c.cleanup?.());globalThis.fetch=previous.fetch;globalThis.window=previous.window;if(previous.navigator)Object.defineProperty(globalThis,'navigator',previous.navigator);else delete globalThis.navigator}}
}

test('header owns one sound disclosure; no seek, pause/resume or extra media element',()=>{const f=fixture();try{assert.equal(nodes(f.tree(),n=>n.type==='button').length,1);assert.equal(nodes(f.tree(),n=>n.type==='audio').length,1);assert.equal(nodes(f.tree(),n=>n.type==='input').length,0);assert.equal(f.button().props['aria-label'],'Sound on');assert.equal(f.button().props['aria-pressed'],false);assert.ok(f.button().props['aria-describedby']);assert.equal(f.audio.plays,0)}finally{f.dispose()}})

test('story entry requests autoplay after checking the recording and preserves manual mute',async()=>{
 const f=fixture({autoPlay:true})
 try {
  assert.equal(f.audio.plays,0)
  f.requests[0].resolve(true);await f.settle()
  assert.equal(f.audio.plays,1)
  f.toggle()
  f.change({src:'/next.mp3',contextId:'next'})
  f.requests[1].resolve(true);await f.settle()
  assert.equal(f.audio.plays,1)
 } finally { f.dispose() }
})

test('sound starts the checked visible recording, off stops, on restarts at zero',async()=>{const f=fixture();try{f.requests[0].resolve(true);await f.settle();assert.equal(f.audio.plays,0);f.toggle();assert.equal(f.audio.plays,1);f.audio.currentTime=12;f.toggle();assert.ok(f.audio.paused);f.change({src:'/second.mp3',contextId:'second'});f.requests[1].resolve(true);await f.settle();assert.equal(f.audio.plays,1);f.toggle();assert.equal(f.audio.src,'/second.mp3');assert.equal(f.audio.currentTime,0);assert.equal(f.audio.plays,2)}finally{f.dispose()}})

test('rapid and reverse scrolling aborts old checks and cannot play stale recordings',async()=>{const f=fixture();try{f.toggle();f.change({src:'/second.mp3',contextId:'second'});f.change({src:'/third.mp3',contextId:'third'});f.requests[0].resolve(true);f.requests[1].resolve(true);await f.settle();assert.equal(f.audio.plays,0);assert.ok(f.requests[0].signal.aborted&&f.requests[1].signal.aborted);f.requests[2].resolve(true);await f.settle();assert.equal(f.audio.src,'/third.mp3');assert.equal(f.audio.plays,1);f.change({src:'/first.mp3',contextId:'first'});assert.ok(f.audio.paused);f.requests[3].resolve(true);await f.settle();assert.equal(f.audio.src,'/first.mp3');assert.equal(f.audio.plays,2)}finally{f.dispose()}})

test('muting during a pending availability request disarms autoplay',async()=>{const f=fixture();try{f.toggle();f.toggle();f.requests[0].resolve(true);await f.settle();assert.equal(f.audio.plays,0);assert.equal(f.button().props['aria-pressed'],false)}finally{f.dispose()}})

test('enabling before the scroll frame synchronizes never starts the previous segment',async()=>{const f=fixture({sync:false});try{f.requests[0].resolve(true);await f.settle();f.toggle();assert.equal(f.audio.plays,0);f.change({src:'/visible.mp3',contextId:'visible'});f.requests[1].resolve(true);await f.settle();assert.equal(f.audio.src,'/visible.mp3');assert.equal(f.audio.plays,1)}finally{f.dispose()}})

test('held and missing recordings stay readable and never play fallback HTML',async()=>{for(const hold of ['Scientific review',undefined]){const f=fixture({hold});try{f.toggle();if(!hold){f.requests[0].resolve(false);await f.settle()}assert.equal(f.audio.plays,0);assert.match(f.message(),hold?/under review/:/unavailable/);assert.equal(nodes(f.tree(),n=>n.props.role==='status')[0].props['data-important'],true)}finally{f.dispose()}}})

test('network failures recover when selecting another available segment',async()=>{const f=fixture();try{f.toggle();f.requests[0].reject(Error('Offline'));await f.settle();assert.match(f.message(),/unavailable/);f.change({src:'/recovered.mp3',contextId:'recovered'});f.requests[1].resolve(true);await f.settle();assert.equal(f.audio.src,'/recovered.mp3');assert.equal(f.audio.plays,1)}finally{f.dispose()}})

test('blocked and synchronous play failures switch sound off without autoplaying later segments',async()=>{for(const sync of [false,true]){const f=fixture();try{f.requests[0].resolve(true);await f.settle();if(sync)f.audio.throws=true;else f.audio.pending=Promise.reject(Object.assign(Error('No activation'),{name:'NotAllowedError'}));f.toggle();await f.settle();assert.equal(f.button().props['aria-pressed'],false);assert.match(f.message(),sync?/unavailable/:/browser blocked/);f.change({src:'/next.mp3',contextId:'next'});f.requests[1].resolve(true);await f.settle();assert.equal(f.audio.plays,1)}finally{f.dispose()}}})

test('media errors disarm narration; late play fulfillment cannot undo sound off',async()=>{const f=fixture();try{f.requests[0].resolve(true);await f.settle();let resolve;f.audio.pending=new Promise(r=>resolve=r);f.toggle();f.toggle();f.audio.paused=false;resolve();await f.settle();assert.ok(f.audio.paused);f.audio.pending=undefined;f.toggle();f.audio.onerror();await f.settle();assert.equal(f.button().props['aria-pressed'],false);const plays=f.audio.plays;f.change({src:'/later.mp3',contextId:'later'});f.requests[1].resolve(true);await f.settle();assert.equal(f.audio.plays,plays)}finally{f.dispose()}})

test('same URL with a new context restarts; unmount aborts requests and releases handlers',async()=>{const f=fixture();f.requests[0].resolve(true);await f.settle();f.toggle();f.audio.currentTime=8;f.change({contextId:'new-context'});assert.ok(f.audio.paused);f.requests[1].resolve(true);await f.settle();assert.equal(f.audio.currentTime,0);const plays=f.audio.plays;f.dispose();assert.equal(f.audio.src,'');assert.ok(f.audio.paused&&f.requests[1].signal.aborted);f.requests[1].resolve(true);await Promise.resolve();assert.equal(f.audio.plays,plays)})

test('documentary return intent is planet-specific and cleared after use',()=>{const api=instantiate();api.noteDocumentaryPlanet('moon');assert.equal(api.isDocumentaryPlanetReturn('moon'),true);assert.equal(api.isDocumentaryPlanetReturn('mars'),false);api.clearDocumentaryPlanetReturn();assert.equal(api.isDocumentaryPlanetReturn('moon'),false)})

test('a dedicated tab marker survives a document reload and is consumed without touching mission saves',()=>{
 const previous=globalThis.window,memory=new Map([['unrelated','keep']])
 globalThis.window={sessionStorage:{getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)}}
 try{const first=instantiate();first.noteDocumentaryPlanet('mars');const reloaded=instantiate();assert.equal(reloaded.isDocumentaryPlanetReturn('mars'),true);assert.equal(reloaded.isDocumentaryPlanetReturn('moon'),false);reloaded.clearDocumentaryPlanetReturn();assert.deepEqual([...memory],[['unrelated','keep']])}finally{globalThis.window=previous}
})

test('approved scripts, evidence, quiz, storage and separate cinematic code stay unchanged',()=>{
 const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim()
 // Git accounts for this Windows checkout's LF/CRLF filters; binary changes
 // remain visible. Do not compare a filtered checkout hash with an unfiltered blob.
 const changed=git('diff','--name-only','HEAD','--','src/features/storytelling','src/components/rover','src/machineStories.ts','src/data.ts','src/store.ts','src/pages/HomePage.tsx','src/pages/HomePage.module.css','src/components/MachineStoryPage.tsx','public').split('\n').filter(p=>p&&p!=='src/features/storytelling/documentaryNarration.ts')
 assert.deepEqual(changed,[])
 const css=readFileSync(root+'src/components/storytelling/ContinuousStoryPage.module.css','utf8');assert.ok(!/^\.deck\b/m.test(css));assert.ok(css.includes('background: #080e19bd'))
})
