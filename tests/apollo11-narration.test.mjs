import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { inspectMp3 } from '../scripts/workstream-a-audio-review.mjs'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
const bundled = await build({ stdin: { contents: `export {moonRecordings} from './src/features/storytelling/moonRecordings'; export {storyCatalog} from './src/features/storytelling/storyCatalog'; export {documentarySegments} from './src/features/storytelling/continuousStory'`, resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', logLevel: 'silent' })
const mod = { exports: {} }
new Function('module', 'exports', 'require', bundled.outputFiles[0].text)(mod, mod.exports, require)
const { moonRecordings, storyCatalog, documentarySegments } = mod.exports
const segments = documentarySegments(storyCatalog['apollo-11-reflector'])
const audit = JSON.parse(readFileSync(new URL('../docs/review-safe/held-recordings.json', import.meta.url)))
const inventory = JSON.parse(readFileSync(new URL('../docs/moon-package/inventory.json', import.meta.url)))

test('Apollo 11 Meet Me starts with the narrative, without a duplicate heading or opening quote', () => {
  const expected = "The Moon was about to welcome its first human explorers, and I was going along with them! I'm Apollo 11's Laser Ranging Retroreflector—a little reflector with a mission reaching all the way back to Earth!"
  assert.equal(moonRecordings['11'][0][0].text, expected)
  assert.equal(segments[0].text, expected)
  assert.equal(segments[0].title, 'Meet Me')
  assert.ok(!/^(?:\d+[.\s]|["“]|Meet Me)/.test(segments[0].text))
})

for (const [chapter, segment, title] of [[2, 3, 'Carried Out by Hand'], [2, 4, 'Set Down Once, Forever'], [4, 4, 'More Than a Mirror']]) {
  test(`Apollo 11 ${chapter}/${segment} ${title}: exact original MP3, mapping and explicit editorial status`, () => {
    const path = `public/audio/apollo-11/chapter-${chapter}/${segment}.mp3`
    const original = audit.recordings.find(item => item.localQaPath === path)
    const source = inventory.files.find(item => item.local === path)
    const file = inspectMp3(readFileSync(new URL(`../${path}`, import.meta.url)))
    assert.equal(file.sha256, original.sha256)
    assert.equal(file.sha256, source.sha256)
    assert.ok(file.frames > 100)
    assert.ok(file.channels.every(channels => channels === 1 || channels === 2))
    assert.ok(Math.abs(file.encodedDurationSeconds - original.structuralDurationSeconds) < 0.001)
    const recording = moonRecordings['11'][chapter - 1][segment - 1]
    const rendered = segments.find(item => item.chapter === chapter - 1 && item.segment === segment - 1)
    assert.equal(recording.title, title)
    assert.equal(recording.audio, `/${path.replace('public/', '')}`)
    assert.equal(rendered.audio, recording.audio)
    const approved = chapter === 4 && segment === 4
    assert.equal(recording.playback, approved ? 'enabled' : 'review-required')
    assert.equal(recording.listening, approved ? 'approved-by-haroon' : 'pending')
    assert.ok(recording.review)
    assert.equal(rendered.audioHold, approved ? undefined : recording.review)
    assert.equal(rendered.note, recording.review)
    assert.equal(rendered.text, original.currentReadingText)
    if (approved) {
      assert.equal(rendered.text, recording.text, 'Approved narration and displayed narrative use the same script')
      assert.match(original.approval, /Haroon/)
    }
  })
}

test('all other Apollo 11 segments retain their original, unheld narration mappings', () => {
  const held = new Set(['2:3', '2:4', '4:4'])
  for (const chapter of moonRecordings['11']) for (const recording of chapter) {
    if (held.has(`${recording.chapter}:${recording.segment}`)) continue
    assert.equal(recording.playback, 'enabled')
    assert.equal(recording.audio, `/audio/apollo-11/chapter-${recording.chapter}/${recording.segment}.mp3`)
    const rendered = segments.find(item => item.chapter === recording.chapter - 1 && item.segment === recording.segment - 1)
    if (rendered) assert.equal(rendered.audioHold, undefined)
  }
})
