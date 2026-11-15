import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { inspectMp3 } from '../scripts/workstream-a-audio-review.mjs'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
const built = await build({ stdin: { contents: `export {moonRecordings} from './src/features/storytelling/moonRecordings'; export {storyCatalog} from './src/features/storytelling/storyCatalog'; export {documentarySegments} from './src/features/storytelling/continuousStory'`, resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', logLevel: 'silent' })
const mod = { exports: {} }
new Function('module', 'exports', 'require', built.outputFiles[0].text)(mod, mod.exports, require)
const { moonRecordings, storyCatalog, documentarySegments } = mod.exports
const audit = JSON.parse(readFileSync(new URL('../docs/review-safe/held-recordings.json', import.meta.url)))
const inventory = JSON.parse(readFileSync(new URL('../docs/moon-package/inventory.json', import.meta.url)))

for (const item of audit.recordings) test(`${item.mission} ${item.chapter}/${item.segment}: exact original, honest reading and enforced playback decision`, () => {
  const mission = item.mission === 'Apollo 11' ? '11' : '17'
  const id = mission === '11' ? 'apollo-11-reflector' : 'apollo-17-rover'
  const recording = moonRecordings[mission][item.chapter - 1][item.segment - 1]
  const segment = documentarySegments(storyCatalog[id]).find(s => s.chapter === item.chapter - 1 && s.segment === item.segment - 1)
  const source = inventory.files.find(s => s.local === item.localQaPath)
  const file = inspectMp3(readFileSync(new URL(`../${item.localQaPath}`, import.meta.url)))
  assert.equal(file.sha256, item.sha256)
  assert.equal(file.sha256, source.sha256)
  assert.ok(file.frames > 100)
  assert.ok(Math.abs(file.encodedDurationSeconds - item.structuralDurationSeconds) < 0.001)
  assert.equal(recording.text, item.expectedScript)
  assert.equal(segment.audio, `/${item.localQaPath.replace('public/', '')}`)
  assert.equal(segment.text, item.currentReadingText)
  const approved = mission === '17' || item.chapter === 4 && item.segment === 4
  assert.equal(recording.playback, approved ? 'enabled' : 'review-required')
  assert.equal(recording.listening, mission === '17' ? 'machine-verified' : approved ? 'approved-by-haroon' : 'pending')
  assert.equal(segment.audioHold, approved ? undefined : recording.review)
  if (!approved) assert.ok(segment.audioHold, 'An alternate reading must not play the disputed/unapproved original')
  if (mission === '17') {
    assert.equal(segment.text, recording.text, 'Approved story text matches the original recording script')
    assert.equal(recording.editorialApproval, 'approved-by-haroon')
    assert.equal(item.restorationStatus, 'approved-restored')
    assert.equal(segment.source, recording.reviewSource)
    assert.match(new URL(segment.source).hostname, /(^|\.)nasa\.gov$/)
    assert.match(segment.note, /Haroon approved restoring/)
  }
})

test('a future Apollo 17 editorial hold is enforced even on a previously enabled segment', () => {
  const recording = moonRecordings['17'][0][0], previous = { ...recording }
  try {
    recording.playback = 'review-required'; recording.review = 'Pending editorial review'
    const segment = documentarySegments(storyCatalog['apollo-17-rover'])[0]
    assert.equal(segment.audioHold, 'Pending editorial review')
  } finally { Object.assign(recording, previous) }
})
