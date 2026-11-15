import { beforeMasterIntegration } from './helpers/master-integration-contract.mjs'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter, Routes, Route } from 'react-router-dom'
import { beforeMoonScope } from './helpers/moon-scope-contract.mjs'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
async function bundle(contents) {
  const output = await build({ stdin: {contents, resolveDir:root}, bundle:true, write:false, outfile:`${root}/.moon-check.cjs`, platform:'node', format:'cjs', packages:'external', jsx:'automatic', loader:{'.css':'local-css'}, logLevel:'silent', plugins:[{name:'no-progress-writes',setup(b){
    b.onLoad({filter:/[\\/]store\.ts$/},()=>({loader:'ts',contents:`const state={badges:['follow-perseverance-storyteller'],completedChapters:['follow-perseverance:meet'],storyProgress:Object.fromEntries(['apollo-11-reflector','apollo-15-rover','apollo-17-rover'].map(id=>[id,{completed:['meet','journey','challenges','legacy'],lastChapter:5}])),exploredLocations:[],inspectedInstruments:[],completeStoryChapter(){throw Error('render cannot save')},awardBadge(){throw Error('render cannot award')}};export const useProgress=s=>s?s(state):state;export const useProgressPersistence=()=>({status:'saved'}),retryProgressSave=()=>true;`}))
  }}]})
  const mod={exports:{}};new Function('require','module','exports',output.outputFiles.find(f=>f.path.endsWith('.cjs')).text)(require,mod,mod.exports);return mod.exports
}
const api=await bundle(`export * from './src/features/storytelling/storyCatalog'; export * from './src/features/storytelling/pilot'; export * from './src/features/storytelling/moonRecordings'; export * from './src/features/explorer/storyEntry'; export * from './src/features/storytelling/apollo11StoryMedia'; export {laserRangeKm} from './src/components/storytelling/activities/LaserRangingActivity'; export {default as Page} from './src/components/MachineStoryPage'; export {default as Dashboard} from './src/components/MissionDashboard';`)
const page=(id,n)=>renderToStaticMarkup(React.createElement(StaticRouter,{location:`/story/${id}/${n}`},React.createElement(Routes,null,React.createElement(Route,{path:'/story/:storyId/:chapter',element:React.createElement(api.Page)}))))

test('published mission catalog excludes Perseverance at discovery, dashboard and direct-route boundaries without deleting history',()=>{
  assert.deepEqual(Object.keys(api.storyCatalog),['apollo-15-rover','apollo-17-rover','apollo-11-reflector','apollo-16-rover','sojourner','opportunity','viking-1','ingenuity'])
  assert.ok(!api.missionHardware.some(h=>h.id==='perseverance'))
  assert.equal(api.getStoryEntry({id:'perseverance',planet:'mars'}),null)
  for(let n=1;n<=5;n++){assert.equal(api.resolveStoryRoute('follow-perseverance',String(n)),null);assert.ok(page('follow-perseverance',n).includes('Story not found'))}
  const html=renderToStaticMarkup(React.createElement(StaticRouter,null,React.createElement(api.Dashboard)))
  assert.ok(html.includes('Perseverance expedition')&&!html.includes('Jezero Field Scientist'))
  assert.ok(html.includes('12 / 40 CHAPTERS COMPLETE'));assert.ok(html.includes('1 reward unlocked'))
  assert.equal((html.match(/class="mission-track moon"/g)||[]).length,4)
  for(const p of ['src/data.ts','src/store.ts','src/components/PlanetScene.tsx','src/planetaryConfig.ts'])assert.equal(beforeMasterIntegration(readFileSync(`${root}/${p}`,'utf8').replace(/\r\n/g,'\n')),execFileSync('git',['show',`e9573da:${p}`],{cwd:root,encoding:'utf8'}).replace(/\r\n/g,'\n'),p)
  for(const p of ['src/App.tsx','src/pages/HomePage.tsx','src/components/explorer/ExplorerHeader.tsx'])assert.ok(!readFileSync(`${root}/${p}`,'utf8').includes('/story/follow-perseverance/'))
})

test('Apollo 11 has a unique stationary identity, five accessible 2D chapters and a four-choice evidence-based quiz',()=>{
  const story=api.storyCatalog['apollo-11-reflector']
  assert.equal(story.machineId,'apollo-11-lrrr');assert.equal(story.category,'stationary-experiment')
  assert.equal(api.getStoryEntry(api.missionHardware.find(h=>h.id===story.machineId)).href,'/story/apollo-11-reflector/1')
  for(let n=1;n<=5;n++){
    assert.equal(api.resolveStoryRoute(story.id,String(n)).index,n-1)
    const html=page(story.id,n)
    assert.ok(html.includes('Your lunar experiment storyteller'));assert.ok(html.includes('STATIONARY LUNAR EXPERIMENT'))
    assert.ok(!/<canvas|Browser voice|wire-mesh|driving controls/.test(html));assert.ok(html.includes('NASA EVIDENCE'))
    assert.ok(html.includes('Credit:'));assert.ok(html.includes('Official source'));assert.ok(html.includes('Chapter navigation'))
    assert.ok(html.includes('aria-current="step"'));assert.ok(html.includes('tabindex="-1"'))
  }
  for(const n of ['0','6','01','1.2','Infinity','-1'])assert.equal(api.resolveStoryRoute(story.id,n),null)
  assert.deepEqual(story.quiz.map(q=>q.answer),[1,2,2]);assert.ok(story.quiz.every(q=>q.options.length===4&&q.explanation))
  const quiz=page(story.id,5);assert.ok(!quiz.includes(story.quiz[0].explanation));assert.ok(quiz.includes('COMPLETE STORY'))
  assert.ok(page(story.id,1).includes('does not move the Moon'))
})

function duration(bytes){
  assert.equal(bytes.toString('ascii',0,3),'ID3')
  let offset=10+[...bytes.subarray(6,10)].reduce((n,v)=>(n<<7)+(v&127),0),seconds=0,frames=0
  while(offset<bytes.length){
    const header=bytes.readUInt32BE(offset);assert.equal(header>>>21,0x7ff)
    const version=(header>>>19)&3,layer=(header>>>17)&3,rate=(header>>>10)&3,bitrate=(header>>>12)&15
    assert.notEqual(version,1);assert.equal(layer,1);assert.ok(rate<3&&bitrate>0&&bitrate<15)
    const sampleRate=[44100,48000,32000][rate]/({3:1,2:2,0:4}[version])
    const rates=version===3?[0,32,40,48,56,64,80,96,112,128,160,192,224,256,320]:[0,8,16,24,32,40,48,56,64,80,96,112,128,144,160]
    offset+=Math.floor((version===3?144:72)*rates[bitrate]*1000/sampleRate)+((header>>>9)&1);seconds+=(version===3?1152:576)/sampleRate;frames++
    assert.ok(offset<=bytes.length)
  }
  assert.ok(frames>10&&seconds>1&&seconds<120);return seconds
}
test('source inventory stays traceable while restricted originals are explicitly absent from this code review',()=>{
  const inventory=JSON.parse(readFileSync(`${root}/docs/moon-package/inventory.json`))
  assert.deepEqual(['11','15','16','17'].map(m=>inventory.files.filter(f=>f.mission===m&&f.entry.endsWith('.mp3')).length),[18,19,18,20])
  assert.equal(inventory.files.filter(f=>f.entry.endsWith('.pdf')&&!f.entry.includes('~$')).length,4)
  for(const row of inventory.files){
    if(row.local)assert.equal(existsSync(`${root}/${row.local}`),false,'private originals are not review assets')
    if(row.mission==='15'&&row.chapter){
      const bytes=readFileSync(`${root}/public/audio/apollo-15/chapter-${row.chapter}/${row.segment}.mp3`)
      assert.equal(createHash('sha256').update(bytes).digest('hex'),row.sha256);duration(bytes)
    }
  }
})

test('recordings follow their PDF chapter/segment mapping; scientific holds and all timing/listening gaps are explicit',()=>{
  for(const [mission,counts] of [['11',[4,4,3,4,3]],['17',[4,4,4,5,3]]]){
    const chapters=api.moonRecordings[mission];assert.deepEqual(chapters.map(c=>c.length),counts)
    chapters.forEach((c,i)=>c.forEach((s,j)=>{assert.equal(s.audio,`/audio/apollo-${mission}/chapter-${i+1}/${j+1}.mp3`);assert.equal(s.mapping,'filename-and-pdf');assert.equal(s.timing,'pending');assert.equal(s.listening,s.editorialApproval==='approved-by-haroon'?'machine-verified':mission==='11'&&i===3&&j===3?'approved-by-haroon':'pending');assert.ok(s.text&&s.readingText);if(s.playback==='review-required')assert.ok(s.review)}))
  }
  assert.equal(api.moonRecordings['11'].flat().filter(s=>s.playback==='review-required').length,2)
  assert.equal(api.moonRecordings['17'].flat().filter(s=>s.playback==='review-required').length,0)
  assert.ok(!page('apollo-17-rover',1).includes('<audio'));assert.ok(page('apollo-17-rover',1).includes('Recorded narration omitted from this code review'));assert.ok(!page('apollo-17-rover',4).includes('Recording held for scientific review'))
  const component=readFileSync(`${root}/src/components/storytelling/MoonPackageStory.tsx`,'utf8')
  assert.ok(!component.includes('Apollo17BrowserVoice')&&!component.includes('speechSynthesis.speak'))
  assert.ok(component.includes('key={segment.audio}'));assert.ok(component.includes('stopRecordedNarration(); onNext()'))
  const controls=readFileSync(`${root}/src/components/storytelling/StoryRecording.tsx`,'utf8')
  for(const term of ['preload="none"','visibilitychange','popstate','pagehide','session.dispose()','Sound on','Resume','Replay','Audio unavailable'])assert.ok(controls.includes(term))
})
test('Apollo 11 evidence uses official remote NASA assets with credits, never new image binaries',()=>{
  const evidence=JSON.parse(readFileSync(`${root}/docs/moon-package/apollo11-media-evidence.json`))
  assert.equal(evidence.length,3)
  for(const media of Object.values(api.apollo11StoryMedia)){
    const original=evidence.find(e=>e.id.toLowerCase()===media.id.toLowerCase());assert.ok(original)
    assert.equal(media.src,original.url);assert.equal(existsSync(`${root}/${original.local}`),false)
    assert.equal(media.kind,'Photograph');assert.ok(media.alt.length>70&&media.caption&&media.credit.startsWith('NASA'))
    for(const field of ['sourceUrl','originalUrl','usagePolicyUrl'])assert.match(new URL(media[field]).hostname,/(^|\.)nasa.gov$/)
  }
})
test('laser-ranging numerical model uses a round trip and has no progress side effects',()=>{
  assert.equal(api.laserRangeKm(2.56),383734.34624)
  const html=page('apollo-11-reflector',1)
  for(const term of ['type="range"','2.56 seconds','speed of light','divide by two','not a real observation','Follow the light'])assert.ok(html.includes(term))
})
test('all approved pre-QA shared source remains protected apart from the exact catalog/presentation seams',()=>{
  for(const path of ['src/App.tsx','src/components/MachineStoryPage.tsx','src/machineStories.ts','src/pages/HomePage.tsx','src/components/storytelling/RoverStoryLayout.tsx','src/components/MissionDashboard.tsx']){
    assert.equal(beforeMoonScope(readFileSync(`${root}/${path}`,'utf8').replace(/\r\n/g,'\n')),execFileSync('git',['show',`e9573da:${path}`],{cwd:root,encoding:'utf8'}).replace(/\r\n/g,'\n'),path)
  }
})

test('all fifteen active Moon screens expose one central introduction, one five-chapter nav and a reachable source region',()=>{
  for(const [id,number] of [['apollo-15-rover','15'],['apollo-17-rover','17'],['apollo-11-reflector','11']])for(let chapter=1;chapter<=5;chapter++){
    const html=page(id,chapter)
    assert.equal((html.match(/<h1\b/g)||[]).length,1,`${id}/${chapter}: one mission heading`)
    assert.ok(html.indexOf('<h1 ')<html.indexOf('<aside '),'intro precedes machine/evidence in DOM reading order')
    assert.equal((html.match(/aria-label="Story chapters"/g)||[]).length,1)
    assert.ok(html.includes(`href="#apollo${number}-sources"`))
    assert.ok(html.includes(`id="apollo${number}-sources" tabindex="-1" role="region"`))
    assert.ok(html.includes(`aria-label="Apollo ${number} scientific sources"`))
    for(const label of ['Scroll story and activities','NASA evidence','Chapter navigation'])assert.ok(html.includes(`aria-label="${label}"`))
    assert.ok(html.includes('href="/explore/moon"'));assert.ok(html.includes('Credit:'));assert.ok(!html.includes('<canvas'))
    assert.ok(html.includes(chapter===5?'COMPLETE STORY':'NEXT CHAPTER'))
  }
})

test('review protects GIS, scientific records and narration internals using only published history',()=>{
  for(const path of ['src/components/PlanetScene.tsx','src/planetaryConfig.ts','src/data.ts','src/store.ts','src/components/storytelling/StoryRecording.tsx','src/features/storytelling/useScrollStory.ts','src/features/storytelling/chapterScrollBoundary.ts','src/features/storytelling/apollo15CaptionTiming.ts']){
    assert.equal(beforeMasterIntegration(readFileSync(`${root}/${path}`,'utf8').replace(/\r\n/g,'\n')),execFileSync('git',['show',`e9573da:${path}`],{cwd:root,encoding:'utf8'}).replace(/\r\n/g,'\n'),path)
  }
})

test('every Apollo 11/17 review chapter remains readable without private audio controls or TTS',()=>{
  for(const id of ['apollo-11-reflector','apollo-17-rover'])for(let n=1;n<=5;n++){
    const html=page(id,n)
    assert.ok(html.includes('Code review build:'));assert.ok(!html.includes('<audio'))
    assert.ok(html.includes(n===5?'QUESTION 1':'Recorded narration omitted from this code review')||html.includes('Recording held for scientific review'))
    assert.ok(html.includes('COMPLETE STORY')||html.includes('NEXT CHAPTER'));assert.ok(!html.includes('Play optional narration'))
  }
  assert.ok(page('apollo-15-rover',1).includes('<audio'))
})
