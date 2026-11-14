import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import { createServer } from 'node:http'
import { resolve, sep } from 'node:path'
import React from 'react'
import { build } from 'esbuild'
import { inspectMp3, createAudioReview } from '../scripts/workstream-a-audio-review.mjs'
import { prepareCandidate } from '../scripts/workstream-a-prepare-asr.mjs'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
const inventory = JSON.parse(readFileSync(`${root}/docs/workstream-a-audio-review.json`, 'utf8'))
const asr = JSON.parse(readFileSync(`${root}/docs/workstream-a-asr-candidates.json`, 'utf8'))
const compiled = await build({ stdin: { contents: `export {default as Recording} from './src/components/storytelling/StoryRecording';
  export * from './src/features/storytelling/apollo15CueEvidence'; export * from './src/features/storytelling/apollo15CaptionTiming';`, resolveDir: root },
  bundle: true, write: false, outfile: `${root}/.a-review-check.cjs`, packages: 'external', platform: 'node', format: 'cjs', jsx: 'automatic', loader: { '.css': 'local-css' }, logLevel: 'silent',
  plugins: [{ name: 'a-audio-hooks', setup(build) {
    build.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'a-hooks' }))
    build.onLoad({ filter: /.*/, namespace: 'a-hooks' }, () => ({ loader: 'js', contents: `export const useState=(...a)=>globalThis.__aHooks.state(...a),useEffect=(...a)=>globalThis.__aHooks.effect(...a),useRef=(...a)=>globalThis.__aHooks.ref(...a);` }))
  } }] })
const module = { exports: {} }
new Function('require', 'module', 'exports', compiled.outputFiles.find(file => file.path.endsWith('.cjs')).text)(require, module, module.exports)
const api = module.exports

test('A: 19 originals have reproducible actual MPEG durations, hashes and independent chapter/question mappings', async () => {
  const regenerated = await createAudioReview(root)
  assert.deepEqual(regenerated, inventory)
  assert.equal(inventory.recordings.length, 19)
  assert.deepEqual(inventory.recordings.reduce((chapters, track) => { chapters[track.chapter] = (chapters[track.chapter] ?? 0) + 1; return chapters }, {}), { 1: 4, 2: 4, 3: 4, 4: 4, 5: 3 })
  assert.equal(inventory.recordings.reduce((sum, track) => sum + track.bytes, 0), 5054347)
  for (const track of inventory.recordings) {
    assert.ok(track.frames > 100); assert.ok(track.encodedDurationSeconds > 4)
    assert.equal(track.path, `/audio/apollo-15/chapter-${track.chapter}/${track.segment}.mp3`)
    assert.equal(track.sha256, createHash('sha256').update(readFileSync(`${root}/public${track.path}`)).digest('hex'))
    assert.deepEqual(track.sentenceCues, []); assert.equal(track.timingStatus, 'pending-human-listening')
  }
  assert.throws(() => inspectMp3(Buffer.from('not audio')), /MPEG|frame/)
  const sample = readFileSync(`${root}/public${inventory.recordings[0].path}`)
  assert.throws(() => inspectMp3(sample.subarray(0, sample.length - 1)), /Truncated/)
})

test('A: all 19 local ASR transcripts and 54 sentence candidates are audio-bound, explicitly unapproved and absent from runtime timing', () => {
  assert.equal(asr.recordings.length, 19)
  assert.equal(asr.recordings.reduce((sum, track) => sum + track.sentenceCandidates.length, 0), 54)
  for (const candidate of asr.recordings) {
    assert.equal(candidate.recordingSha256, inventory.recordings.find(track => track.path === candidate.recordingPath).sha256)
    assert.equal(candidate.status, 'asr-candidate-not-reviewed'); assert.ok(candidate.transcript.length > 30)
    assert.ok(candidate.tokenPredictions.length > 10)
    const offsets = candidate.tokenPredictions.flatMap(token => [token.startMs / 1000, token.endMs / 1000])
    for (const sentence of candidate.sentenceCandidates) {
      assert.equal(sentence.status, 'asr-candidate-not-reviewed')
      assert.ok(offsets.includes(sentence.start)); assert.ok(offsets.includes(sentence.end), 'no divided/interpolated timestamps')
    }
    assert.deepEqual(api.apollo15CaptionTiming[candidate.recordingPath], { status: 'pending', cues: [] })
  }
  const quiz = asr.recordings.filter(track => track.recordingPath.includes('chapter-5'))
  assert.ok(quiz.every(track => track.transcript.endsWith('?') || track.transcript.endsWith('.')))
  assert.ok(quiz[0].transcript.includes('small Falcon lander'))
  assert.ok(quiz[1].transcript.includes('Spur Crater'))
  assert.ok(quiz[2].transcript.includes('what light object'))
  assert.ok(quiz.every(track => !/origami|Genesis Rock|falcon feather/i.test(track.transcript)), 'recorded question candidates do not reveal correct answers')
})

test('A: sentence grouping takes model token offsets, preserves unreviewed content and never invents timed gaps', () => {
  const candidate = prepareCandidate({ path: '/sample.mp3', sha256: 'sha' }, { transcription: [{ text: ' One. Two?', offsets: { from: 0, to: 9000 }, tokens: [
    { text: '[_BEG_]', offsets: { from: 0, to: 0 }, p: 1 }, { text: ' One', offsets: { from: 1370, to: 1930 }, p: .9 }, { text: '.', offsets: { from: 1930, to: 1930 }, p: .8 },
    { text: ' Two', offsets: { from: 5340, to: 6770 }, p: .7 }, { text: '?', offsets: { from: 6770, to: 6770 }, p: .8 },
  ] }] })
  assert.deepEqual(candidate.sentenceCandidates.map(({ start, end }) => [start, end]), [[1.37, 1.93], [5.34, 6.77]])
  assert.equal(candidate.tokenPredictions.length, 4); assert.equal(candidate.status, 'asr-candidate-not-reviewed')
})

class Audio {
  paused = true; ended = false; currentTime = 0; src = ''; preload = ''; muted = false; playCalls = 0; loads = 0
  play() { this.playCalls++; this.paused = false; this.ended = false; this.onplay?.(); return Promise.resolve() }
  pause() { const changed = !this.paused; this.paused = true; if (changed) this.onpause?.() }
  load() { this.loads++ }
  removeAttribute(name) { assert.equal(name, 'src'); this.src = '' }
}
const text = n => Array.isArray(n) ? n.map(text).join('') : typeof n === 'object' && n ? text(n.children) : String(n ?? '')
function recordingFixture(props) {
  const cells = [], audio = new Audio(), listeners = new Map()
  let cursor = 0, pending = [], dirty = false, tree
  const slot = init => cells[cursor++] ||= init()
  globalThis.__aHooks = {
    state(init) { const cell = slot(() => ({ value: typeof init === 'function' ? init() : init })); return [cell.value, value => { const next = typeof value === 'function' ? value(cell.value) : value; if (!Object.is(next, cell.value)) { cell.value = next; dirty = true } }] },
    ref(value) { return slot(() => ({ current: value })) },
    effect(fn, deps) { const cell = slot(() => ({})); if (!cell.deps || deps.some((value, index) => !Object.is(value, cell.deps[index]))) { cell.deps = deps; pending.push(() => { cell.cleanup?.(); cell.cleanup = fn() }) } },
  }
  const previous = { document: globalThis.document, window: globalThis.window, Element: globalThis.Element }
  const add = (type, fn) => { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn) }
  const remove = (type, fn) => listeners.get(type)?.delete(fn)
  globalThis.document = { hidden: false, addEventListener: add, removeEventListener: remove }
  globalThis.window = { speechSynthesis: { cancel() {} }, addEventListener: add, removeEventListener: remove }
  globalThis.Element = class { closest() { return null } }
  function walk(node) {
    if (Array.isArray(node)) return node.map(walk)
    if (node == null || typeof node !== 'object') return node
    if (node.type === 'audio') node.ref.current = audio
    return { type: node.type, props: node.props, children: walk(node.props.children) }
  }
  function render(next = props) {
    props = next; let passes = 0
    do { dirty = false; cursor = 0; tree = walk(api.Recording(props)); const effects = pending; pending = []; effects.forEach(fn => fn()); assert.ok(++passes < 15) } while (dirty)
  }
  function all(predicate, node) {
    if (arguments.length === 1) node = tree
    if (Array.isArray(node)) return node.flatMap(child => all(predicate, child))
    if (!node || typeof node !== 'object') return []
    return [...(predicate(node) ? [node] : []), ...all(predicate, node.children ?? null)]
  }
  render()
  return { audio, render, all, text: () => text(tree),
    event(name, seconds) { if (seconds !== undefined) audio.currentTime = seconds; all(node => node.type === 'audio')[0].props[name](); render() },
    click(label) { const button = all(node => node.type === 'button' && text(node) === label)[0]; assert.ok(button, label); assert.ok(!button.props.disabled); button.props.onClick(); render() },
    dispose() { cells.forEach(cell => cell.cleanup?.()); Object.assign(globalThis, previous); delete globalThis.__aHooks }, listeners,
  }
}
const reviewedTiming = { status: 'verified', reviewedBy: 'Test reviewer', reviewedOn: '2026-11-08', cues: [
  { start: 0, end: 2, text: 'First reviewed sentence', mediaId: 'rover' }, { start: 3, end: 7, text: 'Second reviewed sentence', mediaId: 'field' },
] }

test('A: replay, forward/backward seeking, gaps, errors and ending update or clear reviewed captions/evidence immediately', () => {
  const cues = [], f = recordingFixture({ src: '/one.mp3', label: 'One', sound: true, onSound() {}, timing: reviewedTiming, onCue: cue => cues.push(cue) })
  try {
    assert.equal(f.audio.playCalls, 0)
    f.event('onTimeUpdate', 4); assert.ok(f.text().includes('Second reviewed sentence'))
    const reports = cues.length; f.event('onTimeUpdate', 4.5); assert.equal(cues.length, reports, 'same cue does not churn parent state')
    f.click('Replay'); assert.ok(f.text().includes('First reviewed sentence')); assert.equal(f.audio.currentTime, 0)
    f.event('onSeeking', 2.5); assert.equal(f.all(node => node.props['aria-label'] === 'Timed caption').length, 0); assert.equal(cues.at(-1), undefined)
    f.event('onSeeked', 3.5); assert.ok(f.text().includes('Second reviewed sentence'))
    f.audio.ended = true; f.audio.onended(); f.render(); assert.equal(cues.at(-1), undefined)
    assert.equal(f.all(node => node.props['aria-label'] === 'Timed caption').length, 0)
    f.audio.ended = false; f.event('onSeeked', 4); f.audio.onerror(); f.render()
    assert.equal(cues.at(-1), undefined); assert.ok(f.text().includes('Audio unavailable'))
    assert.equal(f.all(node => node.props['aria-live']).length, 0)
  } finally { f.dispose() }
  assert.equal([...f.listeners.values()].reduce((sum, set) => sum + set.size, 0), 0)
})

test('A: a rejected old play request cannot poison a replacement source; source changes release cues and never autoplay', async () => {
  const cues = [], props = { src: '/old.mp3', label: 'Old', sound: true, onSound() {}, timing: reviewedTiming, onCue: cue => cues.push(cue) }
  const f = recordingFixture(props)
  try {
    let reject
    f.audio.play = () => new Promise((_, fail) => { reject = fail })
    f.event('onSeeked', 4); f.click('Play')
    f.render({ ...props, src: '/new.mp3', label: 'New' })
    reject(Error('Old request interrupted by source replacement')); await Promise.resolve(); f.render()
    assert.equal(f.audio.src, '/new.mp3'); assert.equal(f.all(node => node.props.role === 'alert').length, 0)
    assert.equal(f.all(node => node.props['aria-label'] === 'Timed caption').length, 0); assert.equal(cues.at(-1), undefined)
    assert.equal(f.audio.playCalls, 0)
    f.audio.play = () => { throw Error('Synchronous media failure') }; f.click('Play')
    assert.equal(f.all(node => node.props.role === 'alert').length, 1)
  } finally { f.dispose() }
})

test('A: muting pauses without deleting reading/caption position; unmuting does not play', () => {
  const props = { src: '/one.mp3', label: 'Readable segment', sound: true, onSound() {}, timing: reviewedTiming }
  const f = recordingFixture(props)
  try {
    f.click('Play'); f.event('onTimeUpdate', 4); f.render({ ...props, sound: false })
    assert.ok(f.audio.paused); assert.ok(f.audio.muted); assert.equal(f.audio.currentTime, 4)
    assert.ok(f.text().includes('Second reviewed sentence')); const plays = f.audio.playCalls
    f.render(props); assert.equal(f.audio.playCalls, plays); assert.ok(f.audio.paused)
  } finally { f.dispose() }
})

test('A: desktop and mobile evidence use only the current recording/current card and known NASA asset IDs', () => {
  const recording = '/audio/apollo-15/chapter-1/1.mp3'
  const selection = { audio: recording, cue: { start: 0, end: 1, text: 'Reviewed', mediaId: 'genesis' } }
  assert.equal(api.apollo15EvidenceForStep(0, 0, 0, selection), 'genesis')
  assert.equal(api.apollo15EvidenceForStep(0, 1, 0, selection), 'field', 'other mobile cards retain segment evidence')
  assert.equal(api.apollo15EvidenceForStep(0, 1, 1, selection), 'field', 'a previous recording never supplies a later card image')
  assert.equal(api.apollo15EvidenceForStep(1, 0, 0, selection), 'rollout', 'chapter changes ignore stale audio cues')
  assert.equal(api.apollo15EvidenceForStep(0, 0, 0, { ...selection, cue: { ...selection.cue, mediaId: 'unverified-placeholder' } }), 'rover')
  assert.equal(api.apollo15EvidenceForStep(0, 0, 0, { ...selection, cue: undefined }), 'rover')
})

function reviewerFixture(protocol = 'file:') {
  class Node {
    constructor(tag = 'div') { this.tagName = tag.toUpperCase(); this.children = []; this.events = new Map(); this.value = ''; this.checked = false; this.disabled = false; this.selectionStart = 0; this.selectionEnd = 0; this.currentTime = 0; this.duration = 20; this.paused = true; this.loads = 0 }
    append(...nodes) { this.children.push(...nodes) }
    replaceChildren(...nodes) { this.children = nodes }
    addEventListener(type, fn) { if (!this.events.has(type)) this.events.set(type, []); this.events.get(type).push(fn) }
    trigger(type) { this.events.get(type)?.forEach(fn => fn({ target: this })) }
    click() { if (!this.disabled) this.trigger('click') }
    focus() { this.focused = true }
    pause() { this.paused = true }
    load() { this.loads++ }
    get lastElementChild() { return this.children.filter(node => typeof node === 'object').at(-1) }
    querySelector(tag) { for (const child of this.children) if (typeof child === 'object') { if (child.tagName === tag.toUpperCase()) return child; const found = child.querySelector(tag); if (found) return found } return null }
  }
  const html = readFileSync(`${root}/docs/workstream-a-audio-review.html`, 'utf8'), nodes = new Map()
  for (const match of html.matchAll(/<([a-z]+)[^>]*id="([^"]+)"/g)) nodes.set(match[2], new Node(match[1]))
  const downloads = [], document = { hidden: false, getElementById: id => nodes.get(id), createElement: tag => new Node(tag), createTextNode: text => text, addEventListener() {} }
  const window = { apollo15AudioReview: inventory, addEventListener() {} }
  runInNewContext(readFileSync(`${root}/docs/workstream-a-audio-review.js`, 'utf8'), { window, document, location: { protocol },
    URL: { createObjectURL(blob) { downloads.push(blob); return 'blob:test' }, revokeObjectURL() {} }, Blob, setTimeout: fn => fn() })
  return { nodes, downloads }
}

test('A: local review tool loads one original, imports ASR only as a draft, captures actual currentTime and gates reviewed exports', async () => {
  const f = reviewerFixture(), get = id => f.nodes.get(id)
  assert.equal(get('audio').loads, 1); assert.equal(get('audio').paused, true); assert.ok(get('audio').src.endsWith('chapter-1/1.mp3'))
  get('load-asr').click(); assert.ok(get('transcript').value.includes('Imagine a car')); assert.equal(get('reviewed').checked, false)
  assert.equal(get('export-reviewed').disabled, true)
  get('export-draft').click(); const draft = JSON.parse(await f.downloads.at(-1).text())
  assert.equal(draft.timing.status, 'candidate-not-approved'); assert.equal(draft.recordingSha256, inventory.recordings[0].sha256)
  const cue = get('cues').children[0], row = cue.children.find(node => node.className === 'row')
  get('audio').currentTime = 1.234; row.children[1].click()
  assert.equal(row.children[0].children[0].value, '1.234')
  get('recording').value = '16'; get('recording').trigger('change')
  assert.ok(get('audio').src.endsWith('chapter-5/1.mp3')); assert.equal(get('audio').loads, 2)
  assert.equal(get('transcript').value, '', 'current question context is never misrepresented as an original transcript')
  get('load-asr').click(); assert.ok(get('transcript').value.includes('small Falcon lander'))
  get('reviewer').value = 'Human reviewer'; get('reviewer').trigger('input')
  get('reviewed').checked = true; get('reviewed').trigger('change'); assert.equal(get('export-reviewed').disabled, false)
  get('export-reviewed').click(); const reviewed = JSON.parse(await f.downloads.at(-1).text())
  assert.equal(reviewed.timing.status, 'verified'); assert.equal(reviewed.timing.reviewedBy, 'Human reviewer')
  get('transcript').value += ' edit'; get('transcript').trigger('input')
  assert.equal(get('reviewed').checked, false); assert.equal(get('export-reviewed').disabled, true)
})

test('A: documented plain HTTP reviewer location resolves its actual first/last audio and image URLs without Vite mappings', async () => {
  const server = createServer((request, response) => {
    try {
      const pathname = new URL(request.url, 'http://127.0.0.1').pathname
      const file = resolve(root, `.${decodeURIComponent(pathname)}`)
      if (!file.startsWith(resolve(root) + sep)) throw Error('Outside test root')
      response.writeHead(200); response.end(readFileSync(file))
    } catch { response.writeHead(404); response.end('Not found') }
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    const page = `http://127.0.0.1:${server.address().port}/docs/workstream-a-audio-review.html`
    assert.equal((await fetch(page)).status, 200)
    const f = reviewerFixture('http:'), get = id => f.nodes.get(id)
    const urls = [new URL(get('audio').src, page), new URL(get('image').src, page)]
    get('recording').value = '18'; get('recording').trigger('change')
    urls.push(new URL(get('audio').src, page))
    assert.deepEqual(urls.map(url => url.pathname), [
      '/public/audio/apollo-15/chapter-1/1.mp3', '/public/images/apollo15-story/rover.jpg', '/public/audio/apollo-15/chapter-5/3.mp3',
    ])
    for (const url of urls) {
      const response = await fetch(url)
      assert.equal(response.status, 200, url.href)
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), readFileSync(resolve(root, `.${url.pathname}`)))
    }
  } finally { await new Promise(resolve => server.close(resolve)) }
})
