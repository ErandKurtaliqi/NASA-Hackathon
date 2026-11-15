import { beforeMoonScope } from './helpers/moon-scope-contract.mjs'
import assert from 'node:assert/strict'
import { withoutReleaseActivity } from './helpers/release-activity-contract.mjs'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter, Routes, Route } from 'react-router-dom'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
async function bundle(contents, plugins = []) {
  const result = await build({ stdin: { contents, resolveDir: root }, bundle: true, write: false,
    outfile: `${root}/.workstream-b-check.cjs`, platform: 'node', format: 'cjs', packages: 'external',
    jsx: 'automatic', loader: { '.css': 'local-css' }, plugins, logLevel: 'silent' })
  const module = { exports: {} }
  new Function('require', 'module', 'exports', result.outputFiles.find(file => file.path.endsWith('.cjs')).text)(require, module, module.exports)
  return module.exports
}
const api = await bundle(`export {default as Page} from './src/components/MachineStoryPage'; export * from './src/machineStories';
  export * from './src/features/storytelling/apollo17StorySteps'; export * from './src/features/storytelling/apollo17StoryMedia';`, [{ name: 'read-only-progress', setup(build) {
  build.onLoad({ filter: /[\\/]store\.ts$/ }, () => ({ loader: 'ts', contents: `
    export const useProgressPersistence=()=>({status:'saved',reason:null}),retryProgressSave=()=>true;
    export const useProgress=()=>({badges:[],completedChapters:[],storyProgress:{'apollo-17-rover':{completed:['meet','journey','challenges','legacy'],lastChapter:5}},
      completeStoryChapter(){throw Error('render cannot complete')},awardBadge(){throw Error('render cannot award')}});` }))
} }])
const story = api.machineStories['apollo-17-rover']
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll("'", '&#x27;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const page = chapter => renderToStaticMarkup(React.createElement(StaticRouter, { location: `/story/${story.id}/${chapter}` }, React.createElement(Routes, null,
  React.createElement(Route, { path: '/story/:storyId/:chapter', element: React.createElement(api.Page) }))))

test('Apollo 17 adapts every existing educational fact into independent typed reading steps', () => {
  assert.deepEqual([0,1,2,3,4].map(ch => api.getApollo17StorySteps(story,ch).length), [7,5,6,5,0])
  const all = [0,1,2,3].flatMap(ch => api.getApollo17StorySteps(story,ch))
  for (let ch=0;ch<4;ch++) {
    const steps = api.getApollo17StorySteps(story,ch)
    assert.equal(new Set(steps.map(step => step.id)).size, steps.length)
    for (const step of steps) if(step.media) assert.ok(api.apollo17StoryMedia[step.media])
  }
  assert.ok(all.some(step=>step.text===story.intro))
  for(const item of story.profile)assert.ok(all.some(step=>step.title===item.label&&step.text===item.value))
  for(const item of story.journey)assert.ok(all.some(step=>step.text===item.copy&&step.date===item.date))
  for(const item of story.challenges)assert.ok(all.some(step=>step.text===item.problem&&step.detail===item.solution))
  for(const item of story.discoveries)assert.ok(all.some(step=>step.text===item.detail))
  for(const item of story.legacy)assert.ok(all.some(step=>step.text===item.copy&&step.date===item.year))
  assert.deepEqual(api.getApollo17StorySteps(api.machineStories['apollo-15-rover'],0),[])
  assert.deepEqual(api.getApollo17StorySteps(api.machineStories['follow-perseverance'],0),[])
})

test('all five Apollo 17 screens expose the three-area accessible layout without canvas, recordings or data writes', () => {
  for(let ch=1;ch<=5;ch++) {
    const html=page(ch)
    assert.ok(html.includes('data-story-pilot="apollo-17"'));assert.ok(html.includes(escape(api.chapterMeta[ch-1].title)))
    for(const label of ['Your rover storyteller','Scroll story and activities','NASA evidence','Chapter navigation'])assert.ok(html.includes(`aria-label="${label}"`))
    assert.ok(html.includes('Credit:'));assert.ok(html.includes('Official source'))
    assert.ok(!/<canvas|<audio/.test(html));assert.ok(html.includes('Recorded narration omitted from this code review'));assert.ok(!html.includes('/audio/apollo-15/'))
    if(ch<5) {
      // Approved originals are no longer editorially held; this legacy
      // asset-safe fixture still omits recordings under its review policy.
      assert.ok(html.includes('Recorded narration omitted from this code review'))
      assert.ok(html.includes('Continue to the next chapter when I scroll past the end'))
    } else {
      assert.ok(html.includes('Who drove Apollo'));assert.ok(!html.includes(story.quiz[0].explanation))
      assert.ok(!html.includes('apollo17-chapter-boundary'))
    }
  }
  assert.ok(page(4).includes('Mission legacy')||page(4).includes('My Final Place'))
  assert.ok(page(2).includes('No direct photograph is selected for this step')===false,'first journey step has verified launch imagery')
})

test('four NASA photographs have exact local provenance and meaningful, non-simulation captions', () => {
  const hashes={vehicle:'f03e7ba8a6db8199ee24e6dd678ca5605c683dc265399573c37dd4c289fa2e5d',launch:'4d726d30b6cb054231e40a6f28fa41a3648a4fe5f89aac6db2e2831e94d76189',field:'de08b29ef737cbda2e7af71992e4a914cb39687b03d887e6a4c8f02c5ecec9bb',orange:'590808b53983246cbb3b84effa28913f06c6d182a6a0db9e82c60f3b83633ccc'}
  let total=0
  for(const [id,media] of Object.entries(api.apollo17StoryMedia)) {
    const bytes=readFileSync(`${root}/public${media.src}`);total+=bytes.length
    assert.equal(createHash('sha256').update(bytes).digest('hex'),hashes[id]);assert.equal(media.kind,'Photograph')
    for(const field of ['sourceUrl','originalUrl','usagePolicyUrl'])assert.match(new URL(media[field]).hostname,/(^|\.)nasa.gov$/)
    assert.ok(media.alt.length>60);assert.ok(media.credit.startsWith('NASA'));assert.ok(media.usageNotes.includes('no endorsement'))
    assert.equal(media.verifiedOn,'2026-11-08')
  }
  assert.ok(total<300000);assert.ok(api.apollo17StoryMedia.vehicle.caption.includes('not a deployment photograph'))
})

test('Apollo 15, Perseverance, scientific records and persistence are byte-identical to the shared baseline', () => {
  for(const path of ['src/components/storytelling/Apollo15ScrollStory.tsx','src/components/storytelling/StoryRecording.tsx',
    'src/features/storytelling/apollo15CaptionTiming.ts','src/components/storytelling/PerseverancePilot.tsx',
    'src/components/storytelling/PerseveranceQuiz.tsx','src/store.ts','src/data.ts','src/machineStories.ts',
    'src/components/storytelling/RoverStoryLayout.tsx','src/components/storytelling/StoryMedia.tsx']) {
    assert.equal(withoutReleaseActivity(beforeMoonScope(readFileSync(`${root}/${path}`,'utf8').replace(/\r\n/g,'\n'))),execFileSync('git',['show',`8120d9e:${path}`],{cwd:root,encoding:'utf8'}).replace(/\r\n/g,'\n'),path)
  }
})

globalThis.__bReact=React
const voiceApi=await bundle("export {default as Voice} from './src/components/storytelling/Apollo17BrowserVoice'; export {bindRecordedNarration} from './src/features/storytelling/recordedNarration';", [{name:'voice-hooks',setup(build){
  build.onResolve({filter:/^react$/},()=>({path:'react',namespace:'b-hooks'}))
  build.onLoad({filter:/.*/,namespace:'b-hooks'},()=>({loader:'js',contents:`
    export const useLayoutEffect=(...a)=>useEffect(...a);export const useState=(...args)=>globalThis.__bHooks.state(...args),useRef=(...args)=>globalThis.__bHooks.ref(...args),useEffect=(...args)=>globalThis.__bHooks.effect(...args);`}))
}}])
const text=n=>Array.isArray(n)?n.map(text).join(''):typeof n==='object'&&n?text(n.props?.children):String(n??'')
function voiceFixture(initial='First segment') {
  const cells=[],listeners=new Map(),utterances=[];let cursor,dirty,tree,pending=[],value=initial,cancels=0,pauses=0,resumes=0
  const speech={speak(u){utterances.push(u)},cancel(){cancels++},pause(){pauses++},resume(){resumes++},getVoices:()=>[]}
  const add=(n,f)=>{if(!listeners.has(n))listeners.set(n,new Set());listeners.get(n).add(f)}
  const remove=(n,f)=>listeners.get(n)?.delete(f)
  const prior={window:globalThis.window,document:globalThis.document,Element:globalThis.Element,Utterance:globalThis.SpeechSynthesisUtterance}
  globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text}}
  globalThis.Element=class{closest(){return this.isLink?{}:null}}
  globalThis.window={speechSynthesis:speech,SpeechSynthesisUtterance:globalThis.SpeechSynthesisUtterance,addEventListener:add,removeEventListener:remove}
  globalThis.document={hidden:false,addEventListener:add,removeEventListener:remove}
  const slot=init=>cells[cursor++]??=init()
  globalThis.__bHooks={state(init){const c=slot(()=>({value:typeof init==='function'?init():init}));return[c.value,next=>{next=typeof next==='function'?next(c.value):next;if(!Object.is(next,c.value)){c.value=next;dirty=true}}]},
    ref(value){return slot(()=>({current:value}))},effect(fn,deps){const c=slot(()=>({}));if(!c.deps||deps.some((x,i)=>!Object.is(x,c.deps[i]))){c.deps=deps;pending.push(()=>{c.clean?.();c.clean=fn()})}}}
  const walk=(n,predicate)=>Array.isArray(n)?n.flatMap(child=>walk(child,predicate)):!n||typeof n!=='object'?[]:[...(predicate(n)?[n]:[]),...walk(n.props?.children,predicate)]
  const render=(next=value)=>{value=next;let count=0;do{dirty=false;cursor=0;tree=voiceApi.Voice({text:value});const effects=pending;pending=[];effects.forEach(fn=>fn());assert.ok(++count<15)}while(dirty)}
  render()
  return{utterances,listeners,speech,render,tree:()=>tree,cancels:()=>cancels,pauses:()=>pauses,resumes:()=>resumes,
    click(label){const b=walk(tree,n=>n.type==='button'&&text(n)===label)[0];assert.ok(b,label);assert.ok(!b.props.disabled);b.props.onClick();render()},
    event(name,event={}){for(const fn of listeners.get(name)??[])fn(event);render()},
    dispose(){cells.forEach(c=>c.clean?.());globalThis.window=prior.window;globalThis.document=prior.document;globalThis.Element=prior.Element;globalThis.SpeechSynthesisUtterance=prior.Utterance;delete globalThis.__bHooks}}
}

test('Apollo 17 optional browser voice supports explicit play, pause, resume, replay, mute and selected-step text', () => {
  const f=voiceFixture()
  try {
    assert.equal(f.utterances.length,0);f.click('Play voice');assert.equal(f.utterances.at(-1).text,'First segment')
    f.click('Pause');assert.equal(f.pauses(),1);f.click('Resume');assert.ok(f.resumes()>0)
    f.click('Replay voice');assert.equal(f.utterances.length,2)
    f.render('Second segment');assert.equal(f.utterances.at(-1).text,'Second segment');assert.equal(f.utterances.length,3)
    f.click('Sound on');const before=f.utterances.length;f.render('Read without sound');assert.equal(f.utterances.length,before)
    assert.ok(text(f.tree()).includes('browser-generated voice'));assert.ok(text(f.tree()).includes('no approved Apollo 17 MP3'))
  }finally{f.dispose()}
  assert.equal([...f.listeners.values()].reduce((n,set)=>n+set.size,0),0)
})

test('browser voice excludes recorded playback and stops on navigation, hide, errors and disposal without stale callbacks', () => {
  const f=voiceFixture(),audio={paused:true,preload:'',src:'',pause(){this.paused=true;this.onpause?.()},removeAttribute(){this.src=''},load(){}}
  const recording=voiceApi.bindRecordedNarration(audio,'/existing.mp3',()=>{},()=>f.speech.cancel())
  try {
    audio.paused=false;audio.onplay();f.click('Play voice');assert.ok(audio.paused)
    const late=f.utterances.at(-1).onend
    f.event('popstate');assert.ok(text(f.tree()).includes('Play voice'))
    late();f.render();assert.ok(text(f.tree()).includes('Play voice'))
    f.click('Play voice');f.click('Pause');document.hidden=true;f.event('visibilitychange');assert.ok(text(f.tree()).includes('Play voice'))
    document.hidden=false;f.click('Play voice');f.utterances.at(-1).onerror();f.render();assert.ok(text(f.tree()).includes('could not play'))
    f.click('Play voice');const link=new Element();link.isLink=true;f.event('click',{button:0,target:link});assert.ok(text(f.tree()).includes('Play voice'))
  }finally{recording.dispose();f.dispose()}
})
