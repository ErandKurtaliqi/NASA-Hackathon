import assert from 'node:assert/strict'
import { test } from 'node:test'
import { build } from 'esbuild'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { readFileSync, mkdtempSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer, request as httpRequest } from 'node:http'
import { once } from 'node:events'
import { localStoryMedia } from '../scripts/localStoryMedia.mjs'
import { beforeContinuousStory } from './helpers/continuous-story-contract.mjs'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
const bundle = await build({ stdin: { contents: "export * from './src/features/storytelling/continuousStory';export * from './src/features/storytelling/documentaryNarration';export {storyCatalog} from './src/features/storytelling/storyCatalog'", resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', logLevel: 'silent' })
const mod = { exports: {} }; new Function('module','exports','require',bundle.outputFiles[0].text)(mod, mod.exports, require)
const { documentarySegments, documentaryPresentation, activeDocumentSegment, createDocumentaryNarration, storyCatalog, quizRecording } = mod.exports

test('all eight documents reuse all reviewed narration segments and retain five logical chapters', () => {
  assert.equal(Object.keys(storyCatalog).length, 8)
  const expected = { 'apollo-15-rover':16,'apollo-16-rover':15,'apollo-11-reflector':15,'apollo-17-rover':17,sojourner:16,opportunity:16,'viking-1':15,ingenuity:16 }
  for (const story of Object.values(storyCatalog)) {
    const segments = documentarySegments(story)
    assert.equal(segments.length, expected[story.id], story.id)
    assert.equal(new Set(segments.map(s=>s.id)).size,segments.length)
    assert.deepEqual([...new Set(segments.map(s=>s.chapter))], [0,1,2,3])
    for (const segment of segments) {
      assert.ok(segment.text.length > 20 && segment.title && segment.audio && segment.source.startsWith('https://'))
      assert.equal(segment.completion, 'intentional-chapter-action')
      if (segment.evidence) assert.ok(segment.evidence.credit && segment.evidence.sourceUrl && segment.evidence.kind)
    }
    for (let q=0;q<3;q++) assert.match(quizRecording(story.id,q),new RegExp(`/chapter-5/${q+1}\\.mp3$`))
  }
  assert.equal(documentaryPresentation(storyCatalog['viking-1']).hardware,'lander')
  assert.equal(documentaryPresentation(storyCatalog.ingenuity).hardware,'helicopter')
  assert.equal(documentaryPresentation(storyCatalog['apollo-11-reflector']).hardware,'stationary-experiment')
})
test('every Mars narration segment has exact context and no visual evidence is reused', () => {
  const ids = ['sojourner','opportunity','viking-1','ingenuity']
  const segments = ids.flatMap(id => documentarySegments(storyCatalog[id]))
  assert.equal(segments.length,63)
  for (const segment of segments) {
    assert.ok(segment.evidenceLabel && segment.evidenceSummary, segment.id)
    assert.ok(segment.source.startsWith('https://'), segment.id)
  }
  const visual = segments.flatMap(segment => segment.evidence ? [segment.evidence] : [])
  assert.equal(visual.length,42)
  assert.equal(new Set(visual.map(item => item.id)).size,visual.length)
  assert.equal(new Set(visual.map(item => item.src)).size,visual.length)
  for (const id of ids) assert.ok(documentarySegments(storyCatalog[id]).some(segment => !segment.evidence), id)
})
test('scientific holds remain explicit; missing evidence is never replaced by unrelated photographs', () => {
  const moon = documentarySegments(storyCatalog['apollo-11-reflector'])
  assert.equal(moon.filter(s=>s.audioHold).length,3)
  assert.ok(moon.some(s=>!s.evidence))
  const apollo17 = documentarySegments(storyCatalog['apollo-17-rover'])
  assert.equal(apollo17.filter(s=>s.audioHold).length,0)
  assert.ok(apollo17.some(s=>s.note))
  assert.ok(documentarySegments(storyCatalog['viking-1']).some(s=>s.note?.includes('1982')))
})
test('Apollo narration packages include every published chapter and quiz recording', () => {
  const expected = { 'apollo-11': [4,4,3,4,3], 'apollo-16': [4,4,3,4,3], 'apollo-17': [4,4,4,5,3] }
  for (const [mission, chapters] of Object.entries(expected)) {
    chapters.forEach((count, chapter) => {
      for (let track=1;track<=count;track++) {
        assert.ok(statSync(join(root,'public','audio',mission,`chapter-${chapter+1}`,`${track}.mp3`)).size > 50000)
      }
    })
  }
})
test('all Mars narration and quiz recordings are bundled', () => {
  const expected = { sojourner: [4,4,4,4,3], opportunity: [4,4,4,4,3], 'viking-1': [3,4,4,4,3], ingenuity: [4,4,4,4,3] }
  for (const [mission, chapters] of Object.entries(expected)) {
    chapters.forEach((count, chapter) => {
      for (let track=1;track<=count;track++) {
        assert.ok(statSync(join(root,'public','audio',mission,`chapter-${chapter+1}`,`${track}.mp3`)).size > 50000)
      }
    })
  }
})
test('activation has hysteresis, follows rapid/reverse jumps, and never mutates progress or navigation', () => {
  assert.equal(activeDocumentSegment([0,95,400],100,0),0)
  assert.equal(activeDocumentSegment([0,87,400],100,0),1)
  assert.equal(activeDocumentSegment([-800,-400,20],100,0),2)
  assert.equal(activeDocumentSegment([20,400,800],100,2),0)
  assert.equal(activeDocumentSegment([-100,105,400],100,1),1)
})
function fakeAudio() {
  let plays=0, pauses=0, loads=0, rejection, deferred
  const audio = { paused:true,src:'',preload:'none',currentTime:0,volume:1,
    pause(){this.paused=true;pauses++;this.onpause?.()},
    play(){plays++;if(rejection)return Promise.reject(rejection);this.paused=false;this.onplay?.();return deferred ?? Promise.resolve()},
    load(){loads++},removeAttribute(){this.src=''} }
  return {audio,get plays(){return plays},get pauses(){return pauses},get loads(){return loads},reject(error){rejection=error},defer(promise){deferred=promise}}
}
test('single real narration binding waits for activation, switches/restarts, respects pause and releases resources', async () => {
  globalThis.window={speechSynthesis:{cancel(){}}}
  const f=fakeAudio(),events=[],voice=createDocumentaryNarration(f.audio,s=>events.push(s))
  voice.select('/first.mp3');assert.equal(f.plays,0)
  voice.play();assert.equal(f.plays,1);assert.equal(events.at(-1),'playing')
  f.audio.currentTime=9;voice.select('/second.mp3');assert.equal(f.audio.src,'/second.mp3');assert.equal(f.audio.currentTime,0);assert.equal(f.plays,2)
  voice.pause();voice.select('/third.mp3');assert.equal(f.plays,2);assert.equal(f.audio.paused,true)
  voice.play();voice.select('/first.mp3');assert.equal(f.plays,4)
  voice.select('/held.mp3',true);assert.equal(f.audio.src,'');assert.equal(events.at(-1),'held');voice.play();assert.equal(f.plays,4)
  voice.dispose();assert.equal(f.audio.src,'');assert.equal(f.audio.onplay,null);assert.ok(f.loads>=4)
  voice.play();assert.equal(f.plays,4);delete globalThis.window
})
test('blocked playback and stale promise rejections cannot override a newer narration context', async () => {
  globalThis.window={speechSynthesis:{cancel(){}}}
  const f=fakeAudio(),events=[],voice=createDocumentaryNarration(f.audio,s=>events.push(s))
  f.reject(new DOMException('Gesture needed','NotAllowedError'));voice.select('/first.mp3');voice.play();await new Promise(r=>setImmediate(r));assert.equal(events.at(-1),'blocked')
  f.reject(null);let reject;f.defer(new Promise((_,no)=>{reject=no}));voice.play();f.defer(null);voice.select('/second.mp3');reject(Error('old aborted load'));await new Promise(r=>setImmediate(r));assert.equal(events.at(-1),'playing');assert.equal(f.audio.src,'/second.mp3')
  voice.dispose();delete globalThis.window
})
test('pause can keep chapter autoplay armed, replay restarts, and sound off disarms autoplay', () => {
  globalThis.window = { speechSynthesis: { cancel() {} } }
  const f = fakeAudio()
  const voice = createDocumentaryNarration(f.audio, () => {})
  try {
    voice.play()
    voice.select('/first.mp3')
    assert.equal(f.plays, 1)
    voice.pause(true)
    assert.equal(f.audio.paused, true)
    voice.select('/second.mp3')
    assert.equal(f.plays, 2)
    f.audio.currentTime = 12
    voice.replay()
    assert.equal(f.plays, 3)
    assert.equal(f.audio.currentTime, 0)
    voice.pause()
    voice.select('/third.mp3')
    assert.equal(f.plays, 3)
  } finally {
    voice.dispose()
    delete globalThis.window
  }
})
test('local-only media server supports real ranges and never serves documents, directories or arbitrary paths', async () => {
  const dir=mkdtempSync(join(tmpdir(),'auroralys-range-test-'));mkdirSync(join(dir,'sojourner','chapter-1'),{recursive:true})
  // Deliberate non-audio HTTP transport fixture, never used as story narration.
  writeFileSync(join(dir,'sojourner','chapter-1','1.mp3'),Buffer.from('transport-test-only'))
  const plugin=localStoryMedia(dir);let middleware;plugin.configureServer({middlewares:{use(fn){middleware=fn}}})
  const server=createServer((req,res)=>middleware(req,res,()=>{res.writeHead(404);res.end()}));server.listen(0,'127.0.0.1');await once(server,'listening')
  const url=`http://127.0.0.1:${server.address().port}`
  try {
    const response=await fetch(url+'/audio/sojourner/chapter-1/1.mp3',{headers:{Range:'bytes=2-5'}})
    assert.equal(response.status,206);assert.equal(await response.text(),'ansp');assert.equal(response.headers.get('content-range'),'bytes 2-5/19')
    assert.equal((await fetch(url+'/audio/sojourner/chapter-1/1.mp3',{headers:{Range:'bytes=999-'}})).status,416)
    assert.equal((await fetch(url+'/audio/sojourner/chapter-1/1.mp3',{headers:{Origin:'https://unrelated.example'}})).status,403)
    const foreignHostStatus = await new Promise((yes,no) => {
      const request=httpRequest(url+'/audio/sojourner/chapter-1/1.mp3',{headers:{Host:'unrelated.example'}},response=>{response.resume();yes(response.statusCode)})
      request.on('error',no);request.end()
    })
    assert.equal(foreignHostStatus,403)
    for(const path of ['/audio/sojourner/chapter-1/1.pdf','/.git/config','/audio/sojourner/chapter-1/../../secret.mp3','/audio/sojourner/chapter-9/1.mp3'])assert.equal((await fetch(url+path)).status,404)
  } finally {server.closeAllConnections();await new Promise(r=>server.close(r))}
})
test('both tracked Vite configurations activate the external-media plugin (JavaScript takes runtime precedence)', () => {
  for(const file of ['vite.config.js','vite.config.ts']) {
    const source=readFileSync(join(root,file),'utf8')
    assert.ok(source.includes("import { localStoryMedia } from './scripts/localStoryMedia.mjs'"),file)
    assert.ok(source.includes('plugins: [react(), localStoryMedia()]'),file)
  }
})
test('historical source normalization permits only reviewed routing/export seams; protected shell and legacy completion stay byte identical', () => {
  for(const file of ['src/App.tsx','src/components/MachineStoryPage.tsx']){
    const original=execFileSync('git',['show',`4ddd64c:${file}`],{cwd:root,encoding:'utf8'}).replaceAll('\r\n','\n')
    assert.equal(beforeContinuousStory(readFileSync(join(root,file),'utf8').replaceAll('\r\n','\n')),original,file)
  }
  const page=readFileSync(join(root,'src/components/storytelling/ContinuousStoryPage.tsx'),'utf8')
  assert.ok(!page.includes('navigate(')&&!page.includes('onWheel=')&&!page.includes('onTouchMove='))
  assert.ok(!page.includes('<StoryHardware key=')&&!page.includes('<DocumentaryAudio key='))
  assert.ok(page.includes('sourceLabel={segment?.evidenceLabel}') && page.includes('sourceSummary={segment?.evidenceSummary}'))
})


test('approved documentary header exposes only Sound on/off without a playback deck', () => {
  const source = readFileSync(join(root,'src/components/storytelling/DocumentaryAudio.tsx'),'utf8')
  assert.ok(source.includes("aria-label={sound ? 'Sound off' : 'Sound on'}"))
  assert.ok(!/Resume narration|Pause narration|type="range"|Replay narration/.test(source))
  const page = readFileSync(join(root,'src/components/storytelling/ContinuousStoryPage.tsx'),'utf8')
  assert.ok(!/data-documentary-controls|Previous segment|Next segment/.test(page))
  assert.ok(page.indexOf('Mission sources ↗</button>') < page.indexOf('<DocumentaryAudio'))
})
