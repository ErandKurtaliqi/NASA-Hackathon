import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
const read = p => readFileSync(`${root}/${p}`, 'utf8')
async function bundle(contents) {
  const out = await build({ stdin: { contents, resolveDir: `${root}/src/features/storytelling`, loader: 'ts' },
    bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', logLevel: 'silent' })
  const mod = { exports: {} }; new Function('require','module','exports',out.outputFiles[0].text)(require,mod,mod.exports)
  return mod.exports
}
const api = await bundle("export * from './marsStories'; export * from './ingenuityStory'; export * from './ingenuityStoryMedia'; export * from './storyCatalog'; export * from './reviewMediaPolicy';")

test('Ingenuity original package inventory maps all 19 recordings and excludes every binary from the review', () => {
  const inventory = JSON.parse(read('docs/mission-integration/ingenuity-source-inventory.json'))
  assert.equal(inventory.archiveSha256,'a2b61dd8fb35681250f0a35adf2fb2d171ae259c8deebdf4fb56a9eb8289f54f')
  assert.equal(inventory.pdfPages,7); assert.equal(inventory.files.length,20)
  const audio=inventory.files.filter(f=>f.path)
  assert.deepEqual([1,2,3,4,5].map(c=>audio.filter(a=>a.chapter===c).length),[4,4,4,4,3])
  assert.equal(new Set(audio.map(a=>a.path)).size,19)
  for(const row of audio) {
    assert.match(row.sha256,/^[a-f0-9]{64}$/);assert.ok(row.bytes>60000)
    assert.equal(row.timing,'pending');assert.equal(row.listening,'pending')
    assert.equal(api.isOmittedReviewRecording(row.path),true)
    assert.equal(existsSync(`${root}/public${row.path}`),false)
  }
  api.ingenuityContent.chapters.forEach((chapter,i)=>chapter.forEach((step,j)=>{
    assert.ok(audio.some(row=>row.path===step.audio&&row.chapter===i+1&&row.segment===j+1))
    assert.ok(step.text.length>100);assert.equal(step.sourceChapter,i+1);assert.equal(step.sourceSegment,j+1)
  }))
  assert.equal(api.isOmittedReviewRecording('/audio/apollo-15/chapter-1/1.mp3'),false)
})

test('Ingenuity has one existing helicopter hardware association, independent quiz, and explicit scientific qualifications', () => {
  assert.equal(api.missionHardware.filter(h=>h.id==='ingenuity').length,1)
  assert.equal(api.missionHardware.find(h=>h.id==='ingenuity').type,'Mars helicopter')
  assert.deepEqual(api.ingenuityQuiz.map(q=>q.answer),[1,2,2])
  assert.equal(api.storyCatalog.ingenuity.reward,'Jezero Flight Explorer')
  assert.match(api.marsReviewNote('ingenuity',2,2),/did not detect underground water/)
  assert.match(api.marsReviewNote('ingenuity',3,2),/future mission/)
  assert.match(api.marsReviewNote('ingenuity',3,0),/likely sequence/)
  assert.equal(api.marsReviewNote('ingenuity',0,0),undefined)
  const media=api.ingenuityStoryMedia
  assert.equal(media['ingenuity-skyfall'].kind,'Illustration · not a photograph')
  assert.match(media['ingenuity-skyfall'].caption,/not photographs of Ingenuity/)
  assert.match(media['ingenuity-surface'].sourceUrl,/ingenuitys-blades-are-released/)
  for(const evidence of Object.values(media)) {
    assert.ok(evidence.alt.length>70&&evidence.width>0&&evidence.height>0)
    assert.match(new URL(evidence.sourceUrl).hostname,/(^|\.)nasa\.gov$/)
    assert.ok(!evidence.src.startsWith('/'));assert.match(evidence.credit,/^NASA/)
  }
})

test('adding Ingenuity preserves the three reviewed Mars story objects and hardware without unpublished Git objects', () => {
  const expected=JSON.parse(read('tests/fixtures/release-source-baselines.json'))
  const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x
  const digest=x=>createHash('sha256').update(JSON.stringify(canonical(x))).digest('hex')
  for(const id of ['sojourner','opportunity','viking-1']) assert.equal(digest(api.marsMachineStories[id]),expected.marsLegacyObjects[id],id)
  assert.equal(digest(api.marsStoryHardware),expected.marsLegacyHardware)
})
