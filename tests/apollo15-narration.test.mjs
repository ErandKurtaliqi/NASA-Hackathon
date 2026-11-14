import { beforeMoonScope } from './helpers/moon-scope-contract.mjs'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { build } from 'esbuild'
import React from 'react'
import postcss from 'postcss'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
async function bundle(contents, plugins = []) {
  const result = await build({ stdin: { contents, resolveDir: root }, bundle: true, write: false,
    outfile: `${root}/.apollo15-audio-check.cjs`, platform: 'node', format: 'cjs', packages: 'external',
    jsx: 'automatic', loader: { '.css': 'local-css' }, plugins, logLevel: 'silent' })
  const module = { exports: {} }
  new Function('require', 'module', 'exports', result.outputFiles.find(f => f.path.endsWith('.cjs')).text)(require, module, module.exports)
  return module.exports
}
const entry = `export * from './src/features/storytelling/recordedNarration';
  export * from './src/features/storytelling/apollo15Recordings'; export * from './src/apollo15Narration';`
const api = await bundle(entry)

// Validate every MPEG Layer III frame, including variable bitrate and ID3v2.
// This is a structural check; audible decoding and pronunciation remain Chrome QA.
function mp3Duration(bytes) {
  assert.equal(bytes.toString('ascii', 0, 3), 'ID3')
  let offset = 10 + [...bytes.subarray(6, 10)].reduce((n, v) => (n << 7) + (v & 127), 0), frames = 0, seconds = 0
  while (offset < bytes.length) {
    assert.ok(offset + 4 <= bytes.length)
    const header = bytes.readUInt32BE(offset)
    assert.equal(header >>> 21, 0x7ff)
    const version = (header >>> 19) & 3, layer = (header >>> 17) & 3, rate = (header >>> 10) & 3, bitrate = (header >>> 12) & 15
    assert.notEqual(version, 1); assert.equal(layer, 1); assert.notEqual(rate, 3); assert.ok(bitrate > 0 && bitrate < 15)
    const sampleRate = [44100, 48000, 32000][rate] / ({ 3: 1, 2: 2, 0: 4 }[version])
    const rates = version === 3 ? [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320] : [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160]
    offset += Math.floor((version === 3 ? 144 : 72) * rates[bitrate] * 1000 / sampleRate) + ((header >>> 9) & 1)
    seconds += (version === 3 ? 1152 : 576) / sampleRate; frames++
    assert.ok(offset <= bytes.length, 'no truncated frame')
  }
  assert.ok(frames > 100); assert.ok(seconds > 4 && seconds < 30)
  return seconds
}

test('all 19 MP3s are byte-identical and the 16 scripts/references are unchanged apart from platform line endings', () => {
  assert.equal(readFileSync(`${root}/src/apollo15Narration.ts`, 'utf8').replace(/\r\n/g, '\n'), execFileSync('git', ['show', '4d31563:src/apollo15Narration.ts'], { cwd: root, encoding: 'utf8' }).replace(/\r\n/g, '\n'))
  const tracks = api.apollo15ChapterRecordings.flat(), paths = [...tracks.map(t => t.audio), ...api.apollo15QuizRecordings]
  assert.deepEqual(api.apollo15ChapterRecordings.map(ch => ch.length), [4, 4, 4, 4])
  assert.deepEqual(api.apollo15ChapterRecordings, api.apollo15Narration)
  assert.equal(new Set(paths).size, 19)
  const originalPaths = execFileSync('git', ['ls-tree', '-r', '--name-only', '4d31563', '--', 'public/audio/apollo-15'], { cwd: root, encoding: 'utf8' }).trim().split('\n')
  assert.deepEqual(paths.map(p => `public${p}`).sort(), originalPaths.sort())
  for (const path of paths) {
    const bytes = readFileSync(`${root}/public${path}`)
    assert.deepEqual(bytes, execFileSync('git', ['show', `4d31563:public${path}`], { cwd: root, maxBuffer: 1024 * 1024 }), path)
    mp3Duration(bytes)
  }
  api.apollo15ChapterRecordings.forEach((chapter, c) => chapter.forEach((track, s) => {
    assert.equal(track.audio, `/audio/apollo-15/chapter-${c + 1}/${s + 1}.mp3`)
    assert.ok(track.title && track.text)
  }))
  assert.deepEqual(api.apollo15QuizRecordings, [1, 2, 3].map(n => `/audio/apollo-15/chapter-5/${n}.mp3`))
  const originalPage = execFileSync('git', ['show', '4d31563:src/components/MachineStoryPage.tsx'], { cwd: root, encoding: 'utf8' })
  assert.ok(originalPage.includes('/audio/apollo-15/chapter-5/${question+1}.mp3'))
})

class FakeAudio {
  paused = true; currentTime = 0; loads = 0; pauses = 0; playCalls = 0; src = ''; preload = ''; onplay = null; onpause = null; onended = null; onerror = null
  play() { this.playCalls++; throw Error('Code must never call play; native controls own explicit playback') }
  userPlay() { this.paused = false; this.onplay?.() }
  pause() { const changed = !this.paused; this.paused = true; this.pauses++; if (changed) this.onpause?.() }
  removeAttribute(name) { assert.equal(name, 'src'); this.src = '' }
  load() { this.loads++ }
  end() { this.paused = true; this.onended?.() }
}

test('native opt-in, pause/resume, ending and exclusive ownership cancel the previous voice', () => {
  const first = new FakeAudio(), second = new FakeAudio(), statuses = [], otherStatuses = []
  let speechCancels = 0
  const a = api.bindRecordedNarration(first, '/one.mp3', s => statuses.push(s), () => speechCancels++)
  const b = api.bindRecordedNarration(second, '/two.mp3', s => otherStatuses.push(s), () => speechCancels++)
  try {
    assert.equal(first.preload, 'none'); assert.equal(first.playCalls + second.playCalls, 0); assert.deepEqual(statuses, [])
    first.userPlay(); assert.equal(statuses.at(-1), 'playing')
    first.currentTime = 5; first.pause(); assert.equal(statuses.at(-1), 'paused'); assert.equal(first.currentTime, 5)
    first.userPlay(); second.userPlay()
    assert.ok(first.paused); assert.equal(statuses.at(-1), 'paused'); assert.equal(otherStatuses.at(-1), 'playing')
    assert.equal(speechCancels, 3)
    api.stopRecordedNarration(); assert.ok(second.paused); assert.equal(otherStatuses.at(-1), 'paused')
    second.userPlay(); second.end(); assert.equal(otherStatuses.at(-1), 'ended')
  } finally { a.dispose(); b.dispose() }
})

test('errors remain readable and reload is manual with no autoplay or queued speech', () => {
  const audio = new FakeAudio(), statuses = []
  const session = api.bindRecordedNarration(audio, '/missing.mp3', s => statuses.push(s), () => {})
  try {
    audio.userPlay(); audio.onerror()
    assert.equal(statuses.at(-1), 'error'); assert.ok(audio.paused)
    session.reload(); assert.equal(statuses.at(-1), 'idle'); assert.equal(audio.loads, 1); assert.equal(audio.playCalls, 0)
    audio.userPlay(); assert.equal(statuses.at(-1), 'playing')
  } finally { session.dispose() }
})

test('dispose releases requests and ignores stale callbacks without stopping a newer player; StrictMode setup is repeatable', () => {
  const old = new FakeAudio(), next = new FakeAudio(), states = []
  const first = api.bindRecordedNarration(old, '/old.mp3', s => states.push(s), () => {})
  old.userPlay(); const latePlay = old.onplay, lateError = old.onerror, lateEnd = old.onended
  first.dispose(); first.dispose()
  assert.equal(old.src, ''); assert.ok(old.paused); assert.equal(old.loads, 1)
  for (const key of ['onplay', 'onpause', 'onended', 'onerror']) assert.equal(old[key], null)
  const second = api.bindRecordedNarration(next, '/new.mp3', () => {}, () => {})
  try {
    next.userPlay(); const before = states.length
    latePlay(); lateError(); lateEnd(); first.reload()
    assert.equal(states.length, before); assert.ok(!next.paused); assert.ok(old.paused)
  } finally { second.dispose() }
  const repeated = api.bindRecordedNarration(old, '/old.mp3', () => {}, () => {})
  old.userPlay(); assert.ok(!old.paused); repeated.dispose()
})

const components = await bundle("export * from './src/components/storytelling/Apollo15Narration'; export {default as StoryRecording} from './src/components/storytelling/StoryRecording'", [{ name: 'narration-hooks', setup(build) {
  build.onResolve({ filter: /^react$/ }, () => ({ path: 'hooks', namespace: 'narration-hooks' }))
  build.onLoad({ filter: /.*/, namespace: 'narration-hooks' }, () => ({ loader: 'js', contents: `
    export const useLayoutEffect=(...a)=>useEffect(...a);export const useState=(...a)=>globalThis.__recordingHooks.state(...a),useRef=(...a)=>globalThis.__recordingHooks.ref(...a),useEffect=(...a)=>globalThis.__recordingHooks.effect(...a);` }))
} }])
const text = n => Array.isArray(n) ? n.map(text).join('') : typeof n === 'object' && n ? text(n.children) : String(n ?? '')
function fixture(Component, props, { requestedPlayback = false } = {}) {
  const instances = new Map(), players = [], listeners = new Map(), windowListeners = new Map()
  let cursor, current, pending = [], dirty, tree, visited
  const events = (map, name, fn, remove = false) => map.set(name, remove ? (map.get(name) || []).filter(f => f !== fn) : [...(map.get(name) || []), fn])
  const originalElement = globalThis.Element
  globalThis.Element = class { closest(selector) { assert.equal(selector, 'a[href]'); return this.link ? {} : null } }
  globalThis.document = { hidden: false, addEventListener: (n, f) => events(listeners, n, f), removeEventListener: (n, f) => events(listeners, n, f, true) }
  globalThis.window = { speechSynthesis: { cancel() {} }, addEventListener: (n, f) => events(windowListeners, n, f), removeEventListener: (n, f) => events(windowListeners, n, f, true) }
  const slot = init => current[cursor++] ||= init()
  globalThis.__recordingHooks = {
    state(init) { const c = slot(() => ({ value: init })); return [c.value, v => { if (v !== c.value) { c.value = v; dirty = true } }] },
    ref(value) { return slot(() => ({ current: value })) },
    effect(fn, deps) { const c = slot(() => ({})); if (!c.deps || deps.some((v, i) => !Object.is(v, c.deps[i]))) {
      c.deps = deps; pending.push(() => { c.cleanup?.(); c.cleanup = fn() })
    } },
  }
  function walk(node, path) {
    if (node == null || typeof node === 'boolean') return null
    if (Array.isArray(node)) return node.map((child, i) => walk(child, `${path}/${child?.key ?? i}`))
    if (typeof node !== 'object') return node
    if (typeof node.type === 'function') {
      const key = `${path}:${node.type.name}:${node.key || ''}`
      visited.add(key); current = instances.get(key) || []; instances.set(key, current); cursor = 0
      return walk(node.type(node.props), `${key}/out`)
    }
    if (node.type === 'audio' && !node.ref.current) { const audio = new FakeAudio(); if(requestedPlayback)audio.play=()=>{audio.playCalls++;audio.userPlay();return Promise.resolve()}; players.push(audio); node.ref.current = audio }
    return { type: node.type, props: node.props, children: walk(node.props.children, `${path}/children`) }
  }
  function render(nextProps = props) {
    props = nextProps; let passes = 0
    do {
      dirty = false; visited = new Set(); tree = walk(React.createElement(Component, props), 'root')
      for (const [key, cells] of instances) if (!visited.has(key)) { cells.forEach(c => c.cleanup?.()); instances.delete(key) }
      const effects = pending; pending = []; effects.forEach(fn => fn()); assert.ok(++passes < 10)
    } while (dirty)
  }
  function all(predicate, node = tree) {
    if (Array.isArray(node)) return node.flatMap(n => all(predicate, n))
    if (!node || typeof node !== 'object') return []
    return [...(predicate(node) ? [node] : []), ...all(predicate, node.children)]
  }
  render()
  return { render, all, players, click(label){const button=all(n=>n.type==='button'&&text(n)===label)[0];assert.ok(button,label);assert.ok(!button.props.disabled);button.props.onClick();render()}, time(seconds){players.at(-1).currentTime=seconds;all(n=>n.type==='audio')[0].props.onTimeUpdate();render()}, text: () => text(tree), listeners, windowListeners,
    select(index) { all(n => n.type === 'select')[0].props.onChange({ target: { value: String(index) } }); render() },
    event(name, event = {}) { for (const fn of [...(listeners.get(name) || []), ...(windowListeners.get(name) || [])]) fn(event); render() },
    dispose() { instances.forEach(cells => cells.forEach(c => c.cleanup?.())); delete globalThis.window; delete globalThis.document; delete globalThis.__recordingHooks; globalThis.Element = originalElement },
  }
}

test('all 16 scripts/source links are selectable with one native player; switching segments stops and releases the old audio', () => {
  for (let chapter = 0; chapter < 4; chapter++) {
    const f = fixture(components.Apollo15ChapterNarration, { chapter })
    try {
      assert.equal(f.all(n => n.type === 'select').length, 1); assert.equal(f.all(n => n.type === 'option').length, 4)
      for (let s = 0; s < 4; s++) {
        if (s) { const previous = f.players.at(-1); f.select(s); assert.ok(previous.paused); assert.equal(previous.src, '') }
        const track = api.apollo15ChapterRecordings[chapter][s], audio = f.players.at(-1)
        assert.equal(audio.src, track.audio); assert.equal(audio.playCalls, 0)
        assert.ok(f.text().includes(track.text)); assert.equal(f.all(n => n.type === 'audio').length, 1)
        assert.equal(f.all(n => n.type === 'button').length, 0, 'no duplicate play control')
        assert.deepEqual(f.all(n => n.type === 'a').map(n => n.props.href), track.sources.map(s => s.url))
        const control = f.all(n => n.type === 'audio')[0]
        assert.equal(control.props.controls, true); assert.equal(control.props.preload, 'none'); assert.ok(control.props['aria-label'].includes(track.title))
        assert.ok(!control.props.autoPlay); audio.userPlay(); f.render()
      }
    } finally { f.dispose() }
    assert.ok(f.players.every(a => a.paused && !a.src && a.onplay === null))
    assert.ok([...f.listeners.values(), ...f.windowListeners.values()].every(handlers => handlers.length === 0))
  }
})

test('question changes reset audio, results unmount it and retry returns to the first original quiz segment', () => {
  const f = fixture(components.Apollo15QuizNarration, { question: 0 })
  try {
    for (const question of [0, 1, 2]) {
      const previous = f.players.at(-1)
      f.render({ question })
      if (question) assert.equal(previous.src, '')
      assert.equal(f.players.at(-1).src, api.apollo15QuizRecordings[question])
      assert.equal(f.all(n => n.type === 'audio').length, 1)
      f.players.at(-1).userPlay(); f.render()
    }
    const last = f.players.at(-1); f.render({ question: 3 })
    assert.equal(f.all(n => n.type === 'audio').length, 0); assert.ok(last.paused); assert.equal(last.src, '')
    f.render({ question: 0 }); assert.equal(f.players.at(-1).src, api.apollo15QuizRecordings[0]); assert.ok(f.players.at(-1).paused)
  } finally { f.dispose() }
})

test('navigation intent, Back, pagehide and hidden tabs stop playback; error recovery is accessible', () => {
  const f = fixture(components.Apollo15QuizNarration, { question: 0 })
  try {
    const audio = f.players[0], link = new Element(); link.link = true
    for (const event of ['click', 'popstate', 'pagehide', 'visibilitychange']) {
      audio.userPlay(); f.render(); document.hidden = event === 'visibilitychange'
      f.event(event, { button: 0, defaultPrevented: true, target: link }); assert.ok(audio.paused)
    }
    document.hidden = false; f.event('visibilitychange'); assert.ok(audio.paused, 'no auto-resume')
    audio.onerror(); f.render()
    assert.equal(f.all(n => n.props.role === 'alert').length, 1)
    f.all(n => n.type === 'button')[0].props.onClick(); f.render()
    assert.equal(f.all(n => n.props.role === 'alert').length, 0); assert.equal(audio.playCalls, 0)
  } finally { f.dispose() }
})

test('chapter navigation stops recording before a route changes; quiz/completion seams remain Apollo 15-only', () => {
  const page = beforeMoonScope(readFileSync(`${root}/src/components/MachineStoryPage.tsx`, 'utf8').replace(/\r\n/g,'\n'))
  assert.ok(page.includes("{!pilot&&story.id!=='apollo-15-rover'&&<NarrationButton"))
  assert.ok(page.includes("{story.id==='apollo-15-rover'&&index<4&&<Apollo15ChapterNarration"))
  assert.ok(page.includes("story.id==='apollo-15-rover'&&<Apollo15QuizNarration key={question} question={question}/>}"))
  assert.ok(page.includes("return <Apollo15ScrollStory story={story}"))
  const finish = page.slice(page.indexOf('  const finish='), page.indexOf('\n  const narration='))
  assert.ok(finish.includes("stopRecordedNarration()"))
  assert.ok(finish.indexOf('stopRecordedNarration()') < finish.indexOf('completeStoryChapter('), 'stop before reconciliation or navigation')
  assert.ok(page.includes("if(story.id==='apollo-15-rover')stopRecordedNarration();navigate(`/story/${story.id}/${index}`)"))
  for (const file of ['src/store.ts', 'src/machineStories.ts', 'src/data.ts', 'src/components/home/homeNarration.ts',
    'src/components/home/homeCaptions.ts', 'src/components/PlanetScene.tsx']) {
    assert.equal(beforeMoonScope(readFileSync(`${root}/${file}`, 'utf8').replace(/\r\n/g, '\n')), execFileSync('git', ['show', `cc2759a:${file}`], { cwd: root, encoding: 'utf8' }).replace(/\r\n/g, '\n'), file)
  }
  const css = postcss.parse(readFileSync(`${root}/src/components/storytelling/Apollo15Narration.module.css`, 'utf8'))
  assert.ok(css.toString().includes(':focus-visible')); assert.ok(css.toString().includes('min-height: 44px'))
  assert.ok(css.toString().includes('max-width: 600px')); assert.ok(!/animation:|transition:/.test(css.toString()), 'no new motion, including reduced-motion mode')
})


test('pilot recording controls are explicit, exclusive, mute-safe and retain pause/resume position', () => {
  let sound = true
  const Wrapper = props => React.createElement(components.StoryRecording, { ...props, key: props.src })
  const props = () => ({ src: '/one.mp3', label: 'Segment one', sound, onSound: value => { sound = value } })
  const f = fixture(Wrapper, props(), { requestedPlayback: true })
  try {
    const first = f.players.at(-1)
    assert.equal(first.playCalls, 0); assert.equal(first.preload, 'none')
    f.click('Play'); assert.equal(first.playCalls, 1); assert.ok(!first.paused)
    first.currentTime = 6; f.click('Pause'); assert.ok(first.paused); assert.equal(first.currentTime, 6)
    f.click('Resume'); assert.equal(first.currentTime, 6)
    f.click('Replay'); assert.equal(first.currentTime, 0)
    f.click('Sound on'); f.render(props()); assert.ok(first.paused); assert.ok(first.muted)
    assert.ok(f.all(n => n.type === 'button' && text(n) === 'Resume')[0].props.disabled)
    f.click('Sound off'); f.render(props()); assert.ok(first.paused, 'unmuting does not autoplay')
    f.click('Resume'); const late = first.onplay
    f.render({ ...props(), src: '/two.mp3' })
    assert.equal(first.src, ''); assert.ok(first.paused)
    const second = f.players.at(-1); assert.equal(second.src, '/two.mp3'); assert.equal(second.playCalls, 0)
    f.click('Play'); late(); assert.ok(first.paused); assert.ok(!second.paused)
    f.event('popstate'); assert.ok(second.paused)
    f.click('Resume'); document.hidden = true; f.event('visibilitychange'); assert.ok(second.paused)
  } finally { f.dispose() }
  assert.equal([...f.listeners.values(), ...f.windowListeners.values()].flat().length, 0)
  assert.ok(f.players.every(audio => audio.paused && audio.src === ''))
})

test('pilot recording shows only reviewed cues at real playback times, including seeks; pending cues never fake captions', () => {
  const timing = { status: 'verified', reviewedBy: 'Test reviewer', reviewedOn: '2026-11-08', cues: [
    { start: 1, end: 3, text: 'Reviewed sentence', mediaId: 'field' },
    { start: 4, end: 5, text: 'Second sentence' },
  ] }
  const cues = [], props = { src: '/cue.mp3', label: 'Cue test', sound: true, onSound() {}, timing, onCue: cue => cues.push(cue) }
  const f = fixture(components.StoryRecording, props, { requestedPlayback: true })
  try {
    f.time(0); assert.ok(!f.text().includes('Reviewed sentence'))
    f.time(2); assert.ok(f.text().includes('Reviewed sentence')); assert.equal(cues.at(-1).mediaId, 'field')
    assert.equal(f.all(n => n.props['aria-live']).length, 0)
    f.time(3); assert.equal(f.all(n => n.props['aria-label'] === 'Timed caption').length, 0)
    f.time(4.2); assert.ok(f.text().includes('Second sentence'))
    f.time(1.5); assert.ok(f.text().includes('Reviewed sentence'), 'backward seeks use media time')
    f.render({ ...props, timing: { status: 'pending', cues: [] } }); f.time(2)
    assert.ok(f.text().includes('awaits listening review')); assert.equal(cues.at(-1), undefined)
    assert.equal(f.players[0].playCalls, 0)
  } finally { f.dispose() }
})

test('pilot playback rejection and media errors expose a readable, manual retry without blocking reading', async () => {
  const f = fixture(components.StoryRecording, { src: '/error.mp3', label: 'Readable segment', sound: true, onSound() {} }, { requestedPlayback: true })
  try {
    const audio = f.players[0]; audio.play = () => Promise.reject(Error('blocked'))
    f.click('Play'); await Promise.resolve(); f.render()
    assert.ok(f.all(n => n.props.role === 'alert').length)
    audio.play = () => { audio.userPlay(); return Promise.resolve() }
    f.click('Play'); assert.equal(f.all(n => n.props.role === 'alert').length, 0)
    audio.onerror(); f.render(); assert.ok(f.text().includes('Keep reading'))
    f.click('Play'); assert.ok(audio.loads > 0); assert.ok(!audio.paused)
  } finally { f.dispose() }
})
