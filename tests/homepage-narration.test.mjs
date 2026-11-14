import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { build } from 'esbuild'

const root = fileURLToPath(new URL('../', import.meta.url))
const result = await build({ stdin: { contents: "export * from './src/components/home/homeNarration'; export * from './src/components/home/homeCaptions'", resolveDir: root },
  bundle: true, write: false, platform: 'node', format: 'cjs', logLevel: 'silent' })
const module = { exports: {} }
new Function('require', 'module', 'exports', result.outputFiles[0].text)(createRequire(import.meta.url), module, module.exports)
const { createHomeNarration, homeRecordings, homeCaptions, captionAtTime, captionStartFraction } = module.exports
const tick = async () => { await Promise.resolve(); await Promise.resolve() }

// Exercise the real audio session. Only the browser's HTMLAudioElement is substituted;
// real codec decoding, audibility and mobile autoplay policy require browser/manual QA.
function fixture() {
  const audio = [], states = []
  const session = createHomeNarration(state => states.push(state), () => {
    let resolve, reject
    const pending = new Promise((yes, no) => { resolve = yes; reject = no })
    const element = { src: '', currentTime: 0, duration: NaN, paused: true, releases: 0, playCalls: 0,
      onerror: null, onended: null, resolve, reject,
      play() {
        assert.ok(audio.filter(other => other !== this).every(other => other.paused), 'stop previous before playing next')
        this.paused = false; this.playCalls++; return pending
      },
      pause() { this.paused = true },
      removeAttribute(name) { assert.equal(name, 'src'); this.src = '' },
      load() { this.releases++ },
    }
    audio.push(element)
    return element
  })
  return { session, audio, states, state: () => states.at(-1) }
}

test('no autoplay or fetch before explicit enable; first enable plays the supplied intro', async () => {
  const f = fixture()
  f.session.select('moon'); f.session.select('mars')
  assert.equal(f.audio.length, 0); assert.equal(f.states.length, 0)
  f.session.toggle()
  assert.equal(f.audio.length, 1); assert.equal(f.audio[0].src, '/audio/home/intro.mp3')
  assert.equal(f.audio[0].preload, 'none'); assert.equal(f.state().enabled, true)
  f.audio[0].resolve(); await tick()
  assert.match(f.state().message, /Welcome narration playing/)
  f.session.dispose()
})

test('switching planets stops and releases the old recording; same-world focus/click events never restart it', async () => {
  const f = fixture()
  f.session.toggle(); f.session.select('moon')
  const intro = f.audio[0], moon = f.audio[1]
  assert.ok(intro.paused); assert.equal(intro.src, ''); assert.equal(intro.releases, 1)
  assert.equal(moon.src, '/audio/home/moon.mp3')
  for (let i = 0; i < 5; i++) f.session.select('moon')
  assert.equal(f.audio.length, 2)
  moon.resolve(); await tick(); moon.onended()
  f.session.select('moon'); assert.equal(f.audio.length, 2, 'no restart after recording ends')
  f.session.select('mars')
  assert.equal(f.audio[2].src, '/audio/home/mars.mp3'); assert.ok(moon.paused)
  intro.reject(new Error('late aborted request')); await tick()
  assert.equal(f.state().enabled, true); assert.equal(f.state().error, false)
  f.session.select('moon'); assert.equal(f.audio[3].src, '/audio/home/moon.mp3')
  f.session.dispose()
})

test('mute is immediate, blocks new narration and ignores a late play promise; enable retries the last selection', async () => {
  const f = fixture()
  f.session.toggle(); f.session.select('mars')
  const mars = f.audio[1]
  mars.currentTime = 4
  f.session.toggle()
  assert.ok(mars.paused); assert.equal(mars.currentTime, 0); assert.equal(mars.src, '')
  assert.equal(mars.onerror, null); assert.equal(mars.onended, null)
  assert.equal(f.state().enabled, false)
  f.session.select('moon'); mars.resolve(); await tick()
  assert.equal(f.audio.length, 2); assert.equal(f.state().enabled, false)
  f.session.toggle()
  assert.equal(f.audio[2].src, '/audio/home/mars.mp3'); assert.equal(f.audio[2].currentTime, 0)
  f.session.dispose()
})

test('missing/corrupt media and rejected browser playback turn sound off with a retryable warning', async () => {
  for (const error of ['media', 'NotAllowedError', 'NotSupportedError']) {
    const f = fixture()
    f.session.toggle()
    if (error === 'media') f.audio[0].onerror()
    else f.audio[0].reject(Object.assign(new Error(error), { name: error }))
    await tick()
    assert.equal(f.state().enabled, false); assert.equal(f.state().error, true)
    assert.match(f.state().message, /could not play.*retry/)
    assert.ok(f.audio[0].paused); assert.equal(f.audio[0].src, '')
    f.session.select('moon'); assert.equal(f.audio.length, 1)
    f.session.toggle(); f.audio[1].resolve(); await tick()
    assert.equal(f.state().enabled, true); assert.equal(f.state().error, false)
    f.session.dispose()
  }
})

test('unavailable Audio API or synchronous play failure is handled without breaking the page', () => {
  for (const createAudio of [() => { throw new Error('Audio unavailable') },
    () => ({ play() { throw new Error('play failed') }, pause() {}, removeAttribute() {}, load() {} })]) {
    const states = []
    const session = createHomeNarration(state => states.push(state), createAudio)
    assert.doesNotThrow(() => session.toggle())
    assert.equal(states.at(-1).enabled, false); assert.equal(states.at(-1).error, true)
    session.dispose()
  }
})

test('unmount cancels audio, removes event handlers/resources and ignores late browser callbacks', async () => {
  const f = fixture()
  f.session.toggle()
  const element = f.audio[0], lateError = element.onerror, lateEnd = element.onended
  f.session.dispose(); const notifications = f.states.length
  assert.ok(element.paused); assert.equal(element.src, ''); assert.equal(element.releases, 1)
  assert.equal(element.onerror, null); assert.equal(element.onended, null)
  lateError(); lateEnd(); element.reject(new Error('unmounted')); await tick()
  f.session.toggle(); f.session.select('moon'); f.session.dispose()
  assert.equal(f.audio.length, 1); assert.equal(f.states.length, notifications)
})

test('all three supplied recording URLs point at nonempty MP3 files in public', () => {
  assert.deepEqual(homeRecordings, { intro: '/audio/home/intro.mp3', moon: '/audio/home/moon.mp3', mars: '/audio/home/mars.mp3' })
  for (const url of Object.values(homeRecordings)) {
    const bytes = readFileSync(`${root}/public${url}`)
    assert.ok(bytes.length > 10000, url)
    assert.equal(bytes.subarray(0, 3).toString(), 'ID3', url)
  }
})

test('short caption segments preserve all three exact approved scripts', () => {
  const approved = {
    intro: "Welcome, explorer. I'm so glad you found us. These robots finished their missions long ago... but their stories never did. Come choose a world and meet them.",
    moon: 'Look... the Moon still keeps the footprints and the quiet robots that once explored it. Their stories are waiting.',
    mars: "Mars holds many brave robots who worked for years under its red sky. They're silent now... but they still have so much to tell us.",
  }
  for (const [recording, script] of Object.entries(approved)) {
    assert.equal(homeCaptions[recording].join(' '), script)
    assert.ok(homeCaptions[recording].every(segment => segment.length <= 40), 'short phrases fit the existing bubble without smaller fonts')
    assert.equal(captionAtTime(recording, 0, 10), 0)
    assert.equal(captionAtTime(recording, 10, 10), homeCaptions[recording].length - 1)
    for (const duration of [null, NaN, Infinity, 0, -1]) assert.equal(captionAtTime(recording, 4, duration), 0)
    assert.equal(captionAtTime(recording, NaN, 10), 0)
    assert.equal(captionAtTime(recording, -10, 10), 0)
  }
})

test('captions use actual media metadata/time, adapt to duration changes and never publish every timeupdate', () => {
  const f = fixture()
  f.session.toggle()
  const audio = f.audio[0]
  audio.currentTime = 2; audio.ontimeupdate()
  assert.equal(f.state().caption, 0); assert.equal(f.state().duration, null)
  audio.duration = 13.2; audio.onloadedmetadata()
  assert.equal(f.state().duration, 13.2)
  audio.currentTime = 8; audio.ontimeupdate()
  const oldCaption = f.state().caption, message = f.state().message, notifications = f.states.length
  assert.equal(oldCaption, captionAtTime('intro', 8, 13.2))
  audio.currentTime += .001; audio.ontimeupdate()
  assert.equal(f.states.length, notifications, 'no rerender for sub-segment time changes')
  audio.duration = 26.4; audio.ondurationchange()
  assert.ok(f.state().caption < oldCaption); assert.equal(f.state().message, message, 'no live announcement on automatic segments')
  audio.currentTime = 0; audio.onseeking(); assert.equal(f.state().caption, 0)
  f.session.dispose()
})

test('waiting/pause retains the current caption; resume and ending follow media events', () => {
  const f = fixture()
  f.session.toggle(); f.session.select('moon')
  const audio = f.audio[1]
  audio.duration = 8.6; audio.onloadedmetadata(); audio.onplaying()
  assert.equal(f.state().phase, 'playing')
  audio.currentTime = 5; audio.ontimeupdate()
  const caption = f.state().caption
  audio.onwaiting(); assert.equal(f.state().phase, 'paused'); assert.equal(f.state().caption, caption)
  audio.onpause(); assert.equal(f.state().caption, caption)
  audio.onplaying(); assert.equal(f.state().phase, 'playing')
  audio.onended(); assert.equal(f.state().phase, 'ended'); assert.equal(f.state().caption, homeCaptions.moon.length - 1)
  assert.equal(f.state().recording, 'moon'); assert.ok(audio.paused)
  f.session.dispose()
})

test('caption controls seek the same recording without another play call; mute blocks seeking', () => {
  const f = fixture()
  f.session.toggle()
  assert.equal(f.session.seekCaption(1), false, 'no guessed duration before metadata')
  const audio = f.audio[0]
  audio.duration = 13.2; audio.onloadedmetadata()
  for (const index of [1, 3, 4, 0]) {
    assert.equal(f.session.seekCaption(index), true)
    assert.equal(audio.currentTime, captionStartFraction('intro', index) * audio.duration)
    assert.equal(f.state().caption, index)
  }
  assert.equal(audio.playCalls, 1); assert.equal(f.audio.length, 1)
  f.session.toggle(); assert.equal(f.session.seekCaption(1), false)
  f.session.dispose()
})

test('all timing handlers are removed on switching/mute/unmount and stale callbacks cannot replace new captions', () => {
  const f = fixture()
  const handlers = ['onloadedmetadata', 'ondurationchange', 'ontimeupdate', 'onseeking', 'onplaying', 'onpause', 'onwaiting']
  f.session.toggle()
  const intro = f.audio[0], stale = handlers.map(name => intro[name])
  f.session.select('mars')
  handlers.forEach(name => assert.equal(intro[name], null))
  const count = f.states.length
  stale.forEach(fn => fn())
  assert.equal(f.state().recording, 'mars'); assert.equal(f.states.length, count)
  const mars = f.audio[1], late = mars.ontimeupdate
  f.session.toggle(); handlers.forEach(name => assert.equal(mars[name], null))
  f.session.toggle(); const next = f.audio[2]
  f.session.dispose(); handlers.forEach(name => assert.equal(next[name], null))
  const disposedCount = f.states.length; late()
  assert.equal(f.states.length, disposedCount)
})
