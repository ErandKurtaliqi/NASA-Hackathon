import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { build } from 'esbuild'
import postcss from 'postcss'
import React from 'react'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
globalThis.__homeReact = React
const result = await build({ stdin: { contents: "export {default as Home} from './src/pages/HomePage'", resolveDir: root },
  bundle: true, write: false, outfile: `${root}/.home-check.cjs`, platform: 'node', format: 'cjs', packages: 'external',
  jsx: 'automatic', loader: { '.css': 'local-css' }, logLevel: 'silent', plugins: [{ name: 'home-host', setup(build) {
    build.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'home-hooks' }))
    build.onLoad({ filter: /.*/, namespace: 'home-hooks' }, () => ({ contents: `
      export const useCallback=fn=>fn;export const Component=globalThis.__homeReact.Component,Suspense=p=>p.children;
      export const lazy=()=>p=>globalThis.__homeReact.createElement('planet-scene',p);
      export const useLayoutEffect=(...a)=>useEffect(...a);export const useState=(...a)=>globalThis.__homeHooks.state(...a);
      export const useRef=(...a)=>globalThis.__homeHooks.ref(...a);
      export const useEffect=(...a)=>globalThis.__homeHooks.effect(...a);` }))
    build.onResolve({ filter: /^framer-motion$/ }, () => ({ path: 'motion', namespace: 'home-motion' }))
    build.onLoad({ filter: /.*/, namespace: 'home-motion' }, () => ({ contents: `export const useMotionValue=v=>({get:()=>v,set(){}}),useSpring=v=>v;export const useReducedMotion=()=>globalThis.__homeReduced;
      export const motion={div:p=>globalThis.__homeReact.createElement('div',p,p.children)};` }))
    build.onResolve({ filter: /^react-router-dom$/ }, () => ({ path: 'router', namespace: 'home-router' }))
    build.onLoad({ filter: /.*/, namespace: 'home-router' }, () => ({ contents: `export const Link=p=>globalThis.__homeReact.createElement('a',{...p,href:p.to},p.children);` }))
    build.onLoad({ filter: /[\\/]PlanetScene\.tsx$/ }, () => ({ contents: 'export const OfficialRover=()=>null,LunarRover=()=>null;export default function Scene(){return null}' }))
  } }] })
const module = { exports: {} }
new Function('require', 'module', 'exports', result.outputFiles.find(file => file.path.endsWith('.cjs')).text)(require, module, module.exports)
const text = node => Array.isArray(node) ? node.map(text).join('') : node && typeof node === 'object' ? text(node.children) : String(node ?? '')

// Real homepage + PlanetGateway handlers/effects. Scene markers verify their public
// props, not GPU rendering. Browser geometry and native gestures remain manual QA.
function fixture({ reduced = false, webgl = true } = {}) {
  const instances = new Map(), listeners = new Map()
  const audio = []
  let current, cursor, pending = [], dirty, tree, focused = null
  globalThis.__homeReduced = reduced
  globalThis.Audio = class {
    constructor() { this.paused = true; this.src = ''; this.currentTime = 0; audio.push(this) }
    play() { this.paused = false; return Promise.resolve() }
    pause() { this.paused = true }
    removeAttribute() { this.src = '' }
    load() {}
  }
  globalThis.document = { title: 'Original title', hidden: false,
    createElement: () => ({ getContext: () => webgl ? { getExtension: () => null } : null }),
    addEventListener: (name, fn) => listeners.set(fn, name), removeEventListener: (_, fn) => listeners.delete(fn),
    getElementById: id => ({ focus: () => { focused = id } }) }
  globalThis.IntersectionObserver = class { constructor(callback) { this.callback = callback } observe() { this.callback([{ isIntersecting: true }]) } disconnect() {} }
  const slot = init => { const i = cursor++; return current[i] ||= init() }
  const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]))
  globalThis.__homeHooks = {
    state(init) { const cell = slot(() => ({ value: typeof init === 'function' ? init() : init })); return [cell.value, value => {
      const next = typeof value === 'function' ? value(cell.value) : value
      if (!Object.is(next, cell.value)) { cell.value = next; dirty = true }
    }] },
    ref(value) { return slot(() => ({ current: value })) },
    effect(fn, deps) { const cell = slot(() => ({})); if (!same(cell.deps, deps)) { cell.deps = deps; pending.push(() => { cell.cleanup?.(); cell.cleanup = fn() }) } },
  }
  function walk(node, path) {
    if (node == null || typeof node === 'boolean') return null
    if (Array.isArray(node)) return node.map((child, i) => walk(child, `${path}/${child?.key ?? i}`))
    if (typeof node !== 'object') return node
    if (typeof node.type === 'function') {
      const key = `${path}:${node.type.name}`
      current = instances.get(key) || []; instances.set(key, current); cursor = 0
      const output = node.type.prototype?.render ? new node.type(node.props).render() : node.type(node.props)
      return walk(output, `${key}/out`)
    }
    if (node.ref) node.ref.current = { contains: () => false }
    return { type: node.type, props: node.props, children: walk(node.props.children, `${path}/children`) }
  }
  function render() {
    let passes = 0
    do { dirty = false; tree = walk(React.createElement(module.exports.Home), 'home')
      const effects = pending; pending = []; effects.forEach(fn => fn()); assert.ok(++passes < 12)
    } while (dirty)
  }
  function all(predicate, node = tree) {
    if (Array.isArray(node)) return node.flatMap(child => all(predicate, child))
    if (!node || typeof node !== 'object') return []
    return [...(predicate(node) ? [node] : []), ...all(predicate, node.children)]
  }
  render()
  return { all, audio, text: () => text(tree), focused: () => focused,
    click(label) { const button = all(n => n.type === 'button' && n.props['aria-label'] === label)[0]; assert.ok(button, label); assert.ok(!button.props.disabled); button.props.onClick(); render() },
    update(fn) { fn(); render() },
    dispose() { instances.forEach(cells => cells.forEach(cell => cell.cleanup?.())); assert.equal(document.title, 'Original title'); assert.equal(listeners.size, 0)
      delete globalThis.__homeHooks; delete globalThis.__homeReduced; delete globalThis.document; delete globalThis.IntersectionObserver; delete globalThis.Audio },
  }
}

test('homepage renders only the cinematic hero, original assets and both world links, without lower content or dead anchors', () => {
  const f = fixture()
  try {
    assert.equal(f.all(n => n.type === 'section').length, 1)
    assert.equal(f.all(n => n.type === 'footer').length, 0)
    assert.equal(f.all(n => n.type === 'h1').length, 1)
    assert.equal(text(f.all(n => n.type === 'h1')[0]), 'Their missions ended.Their stories live on.')
    assert.ok(f.text().includes('AURORALYS')); assert.ok(f.text().includes('Welcome, explorer.'))
    for (const planet of ['moon', 'mars']) assert.equal(f.all(n => n.type === 'a' && n.props.href === `/explore/${planet}`).length, 1)
    const ids = new Set(f.all(n => n.props.id).map(n => n.props.id))
    f.all(n => n.type === 'a' && n.props.href.startsWith('#')).forEach(link => assert.ok(ids.has(link.props.href.slice(1))))
    for (const removed of ['Scroll to Explore', 'Science is a story', 'You are the explorer', 'ENTER ORBIT', 'FEATURED ADVENTURE', 'Three clues', 'READY FOR LAUNCH']) assert.ok(!f.text().includes(removed), removed)
    for (const asset of ['/images/home/auroralys-mark.svg', '/images/home/astronaut-guide.png']) {
      assert.ok(f.all(n => n.type === 'img' && n.props.src === asset).length); assert.ok(existsSync(`${root}/public${asset}`))
    }
  } finally { f.dispose() }
})

test('the home menu lists only the three highlighted destinations', () => {
  const f = fixture()
  try {
    f.click('Open navigation')
    const menu = f.all(n => n.type === 'nav' && n.props.id === 'home-navigation')[0]
    assert.deepEqual(f.all(n => n.type === 'a', menu).map(n => n.props.href), ['/hardware', '/dashboard', '/sources'])
  } finally { f.dispose() }
})

test('both public planet scenes, touch interaction, guide feedback, motion pause and essential menu remain functional', () => {
  const f = fixture()
  try {
    assert.deepEqual(f.all(n => n.type === 'planet-scene').map(n => [n.props.planet, n.props.compact]), [['moon', true], ['mars', true]])
    f.click('Rotate and zoom Moon'); assert.ok(f.text().includes('Pinch to zoom.')); assert.ok(f.text().includes('Look... the Moon still keeps'))
    f.click('Finish interacting with Moon'); assert.ok(!f.text().includes('Pinch to zoom.'))
    f.click('Rotate and zoom Mars'); assert.ok(f.text().includes('Mars holds many brave robots'))
    f.click('Open navigation')
    f.click('Pause ambient motion'); assert.equal(f.all(n => n.type === 'planet-scene').length, 0)
    assert.equal(f.all(n => n.type === 'a' && /^Explore (Moon|Mars)$/.test(n.props['aria-label'])).length, 2)
    f.click('Resume ambient motion'); assert.equal(f.all(n => n.type === 'planet-scene').length, 2)
    f.update(() => f.all(n => n.type === 'nav')[0].props.onKeyDown({ key: 'Escape' }))
    assert.equal(f.all(n => n.type === 'nav').length, 0); assert.equal(f.focused(), 'home-menu-toggle')
  } finally { f.dispose() }
})

test('homepage sound control, planet keyboard focus, mouse/touch intent and cleanup use the real audio session', () => {
  const f = fixture()
  try {
    const world = planet => f.all(n => n.type === 'article' && n.props['aria-label'] === (planet === 'moon' ? 'Explore the Moon' : 'Explore Mars'))[0]
    assert.equal(f.audio.length, 0)
    f.update(() => world('moon').props.onFocus())
    assert.equal(f.audio.length, 0, 'focus while muted cannot start audio')
    f.click('Turn sound on')
    assert.equal(f.audio[0].src, '/audio/home/intro.mp3')
    assert.equal(f.all(n => n.type === 'planet-scene').length, 2, 'sound does not pause planets')
    f.update(() => { world('moon').props.onMouseEnter(); world('moon').props.onMouseLeave() })
    assert.equal(f.audio.length, 1, 'hover does not narrate')
    f.update(() => world('moon').props.onFocus())
    assert.equal(f.audio[1].src, '/audio/home/moon.mp3'); assert.ok(f.audio[0].paused)
    f.click('Rotate and zoom Moon'); assert.equal(f.audio.length, 2, 'focus and click cannot double-play')
    const stage = planet => f.all(n=>!!n.props.onPointerDown,world(planet))[0]
    f.update(() => stage('mars').props.onPointerDown({ pointerType: 'touch', button: 0 }))
    assert.equal(f.audio.length, 2, 'touch scroll is not narration intent')
    f.update(() => stage('mars').props.onClick())
    assert.equal(f.audio[2].src, '/audio/home/mars.mp3')
    f.click('Turn sound off'); assert.ok(f.audio[2].paused); assert.equal(f.audio[2].src, '')
    f.update(() => stage('moon').props.onPointerDown({ pointerType: 'mouse', button: 0 }))
    assert.equal(f.audio.length, 3, 'muted interaction stays silent')
    f.click('Turn sound on'); assert.equal(f.audio[3].src, '/audio/home/mars.mp3')
    f.update(() => stage('moon').props.onPointerDown({ pointerType: 'mouse', button: 0 }))
    assert.equal(f.audio[4].src, '/audio/home/moon.mp3')
    assert.equal(f.all(n => n.props.id === 'home-audio-status' && n.props.role === 'status' && n.props['aria-live'] === 'polite').length, 1)
  } finally { f.dispose() }
  assert.ok(f.audio.every(element => element.paused && element.src === '' && element.onerror === null && element.onended === null))
})

test('sound remains available with reduced motion and playback errors are visibly and accessibly reported', () => {
  const f = fixture({ reduced: true })
  try {
    f.click('Turn sound on')
    assert.equal(f.audio[0].src, '/audio/home/intro.mp3')
    assert.equal(f.all(n => n.type === 'planet-scene').length, 0)
    f.update(() => f.audio[0].onerror())
    assert.ok(f.text().includes('Turn sound on to retry.'))
    const status = f.all(n => n.props.id === 'home-audio-status')[0]
    assert.ok(status.props.className.includes('audioError'))
    assert.equal(f.all(n => n.type === 'button' && n.props['aria-label'] === 'Turn sound on')[0].props['aria-pressed'], false)
  } finally { f.dispose() }
})

test('reduced motion and unavailable WebGL keep the astronaut, four existing fallback tiles and navigation usable', () => {
  for (const options of [{ reduced: true }, { webgl: false }]) {
    const f = fixture(options)
    try {
      assert.equal(f.all(n => n.type === 'planet-scene').length, 0)
      assert.equal(f.all(n => n.type === 'img' && (n.props.src.startsWith('/nasa-fallback/')||n.props.src==='/images/mars-nasa-poster.jpg')).length, 3)
      assert.equal(f.all(n => n.type === 'a' && /^\/explore\//.test(n.props.href)).length, 2)
      assert.ok(f.all(n => n.type === 'aside' && n.props['aria-label'] === 'Your astronaut guide').length)
    } finally { f.dispose() }
  }
})

test('muted captions can be read in full with native buttons; hover, keyboard focus and touch select the matching script', () => {
  const f = fixture({ reduced: true })
  const caption = () => f.all(n => n.props['data-home-caption'])[0]
  const transcript = () => text(f.all(n => n.props.id === 'astronaut-dialogue')[0])
  const world = planet => f.all(n => n.type === 'article' && n.props['aria-label'] === (planet === 'moon' ? 'Explore the Moon' : 'Explore Mars'))[0]
  function readAll() {
    const parts = [text(caption())]
    while (!f.all(n => n.props['aria-label'] === 'Next astronaut caption')[0].props.disabled) {
      f.click('Next astronaut caption'); parts.push(text(caption()))
    }
    assert.equal(parts.join(' '), transcript())
  }
  try {
    assert.equal(caption().props['data-home-caption'], 'intro')
    assert.equal(text(caption()), 'Welcome, explorer.')
    assert.equal(f.all(n => n.props.id === 'astronaut-dialogue')[0].props['aria-live'], undefined)
    readAll(); f.click('Previous astronaut caption')
    assert.equal(text(caption()), 'long ago... but their stories never did.')
    f.update(() => world('moon').props.onMouseEnter())
    assert.equal(caption().props['data-home-caption'], 'moon'); readAll()
    f.update(() => world('mars').props.onFocus())
    assert.equal(caption().props['data-home-caption'], 'mars'); readAll()
    f.update(() => world('mars').props.onMouseLeave())
    assert.equal(caption().props['data-home-caption'], 'mars', 'focused/selected world survives pointer exit')
    f.update(() => f.all(n=>!!n.props.onPointerDown,world('moon'))[0].props.onClick())
    assert.equal(caption().props['data-home-caption'], 'moon'); readAll()
    assert.equal(f.audio.length, 0, 'reading never enables, fetches or plays audio')
    assert.equal(f.all(n => n.type === 'planet-scene').length, 0, 'reduced motion is preserved')
    for (const old of ['Follow the tracks.', 'Come explore the stories', 'Meet the machines uncovering']) assert.ok(!f.text().includes(old))
  } finally { f.dispose() }
})

test('visible captions follow active audio rather than silent hover; mute restores self-paced text and automatic changes are not live announcements', () => {
  const f = fixture()
  const caption = () => f.all(n => n.props['data-home-caption'])[0]
  const world = planet => f.all(n => n.type === 'article' && n.props['aria-label'] === (planet === 'moon' ? 'Explore the Moon' : 'Explore Mars'))[0]
  const manualStatus = () => text(f.all(n => n.props.role === 'status' && !n.props.id)[0])
  try {
    f.update(() => world('moon').props.onMouseEnter())
    f.click('Turn sound on')
    assert.equal(caption().props['data-home-caption'], 'intro', 'first enable welcomes even after silent hover')
    assert.ok(f.all(n => n.props['aria-label'] === 'Next astronaut caption')[0].props.disabled, 'wait for real metadata before seeking')
    const intro = f.audio[0]
    f.update(() => { intro.duration = 13.2; intro.onloadedmetadata(); intro.onplaying(); intro.currentTime = 8; intro.ontimeupdate() })
    assert.equal(text(caption()), 'long ago... but their stories never did.')
    assert.equal(manualStatus(), '')
    f.update(() => world('mars').props.onMouseEnter())
    assert.equal(caption().props['data-home-caption'], 'intro'); assert.equal(f.audio.length, 1, 'hover never starts another recording')
    f.click('Previous astronaut caption')
    assert.equal(text(caption()), 'These robots finished their missions'); assert.ok(intro.currentTime < 8)
    assert.equal(manualStatus(), 'These robots finished their missions')
    f.update(() => world('moon').props.onFocus())
    assert.equal(caption().props['data-home-caption'], 'moon'); assert.equal(manualStatus(), '')
    assert.ok(intro.paused); assert.equal(f.audio[1].src, '/audio/home/moon.mp3')
    f.click('Turn sound off')
    f.click('Next astronaut caption')
    assert.equal(text(caption()), 'the footprints and the quiet robots')
    assert.ok(f.audio[1].paused); assert.equal(f.audio.length, 2)
    f.click('Turn sound on')
    const moon = f.audio[2]
    assert.equal(text(caption()), 'Look... the Moon still keeps')
    f.update(() => { moon.duration = 8.6; moon.onloadedmetadata(); moon.currentTime = 8.6; moon.onended() })
    assert.equal(text(caption()), 'Their stories are waiting.')
    f.update(() => world('mars').props.onMouseEnter())
    assert.equal(caption().props['data-home-caption'], 'mars', 'silent preview returns once audio finishes')
  } finally { f.dispose() }
})

const css = postcss.parse(readFileSync(`${root}/src/pages/HomePage.module.css`, 'utf8'))
function stylesAt(selector, width, height) {
  const values = {}
  css.walkRules(rule => {
    if (!rule.selector.split(',').map(s => s.trim()).includes(selector)) return
    for (let parent = rule.parent; parent; parent = parent.parent) if (parent.type === 'atrule' && parent.name === 'media') {
      if (parent.params.includes('prefers-reduced-motion')) return
      for (const [, kind, axis, value] of parent.params.matchAll(/(min|max)-(width|height):\s*(\d+)px/g)) {
        const actual = axis === 'width' ? width : height
        if (kind === 'max' ? actual > Number(value) : actual < Number(value)) return
      }
    }
    rule.walkDecls(decl => { values[decl.prop] = decl.value })
  })
  return values
}

test('desktop sizing can grow at text zoom and clips decorations rather than essential hero content', () => {
  for (const [w, h] of [[1280, 720], [1366, 600], [1920, 1080]]) {
    const hero = stylesAt('.hero', w, h), content = stylesAt('.heroContent', w, h)
    assert.equal(hero['min-height'], '100dvh'); assert.equal(hero.height, undefined); assert.equal(hero.overflow, undefined)
    assert.equal(content.overflow, undefined); assert.equal(stylesAt('.header', w, h).position, 'relative')
    assert.ok(stylesAt('.planetStage', w, h).width.includes('100dvh'))
    assert.equal(stylesAt('.guide', w, h).position, 'absolute')
  }
  css.walkRules(rule => assert.ok(!/(^|[\s,])(html|body|:root)([\s,]|$)/.test(rule.selector), 'no new global overflow restrictions'))
  assert.ok(!/scrollCue|scrollMouse|scroll-nudge|\.education|\.footer/.test(css.toString()))
})

for (const [width, height, columns] of [[360, 800, 'minmax(0, 1fr)'], [390, 844, 'repeat(2, minmax(0, 1fr))'], [439, 591, 'repeat(2, minmax(0, 1fr))']]) {
  test(`${width}×${height}: mobile CSS keeps the guide in flow, readable controls and opt-in touch gestures`, () => {
    assert.equal(stylesAt('.worldSelection', width, height)['grid-template-columns'], columns)
    assert.equal(stylesAt('.guide', width, height).position, 'relative')
    assert.ok(Number.parseFloat(stylesAt('.speech', width, height)['font-size']) >= 13)
    const caption = stylesAt('.captionText', width, height), button = stylesAt('.captionControls button', width, height)
    assert.equal(caption.height, undefined); assert.equal(caption.overflow, undefined, 'no clipped text or fixed caption height')
    assert.equal(caption['font-size'], undefined, 'caption inherits the approved speech font size')
    assert.ok(Number.parseFloat(button['min-height']) >= 44); assert.ok(Number.parseFloat(button.width) >= 44)
    assert.ok(Number.parseFloat(stylesAt('.exploreLink', width, height)['min-height']) >= 44)
    assert.equal(stylesAt('.planetDisc', width, height)['touch-action'], 'pan-y pinch-zoom')
    assert.equal(stylesAt('.scene', width, height)['pointer-events'], 'none')
    assert.equal(stylesAt('.touchInteractive .scene', width, height)['pointer-events'], 'auto')
    assert.equal(stylesAt('.hero', width, height).height, undefined)
    if (height < 650) assert.equal(stylesAt('.planetStage', width, height).width, '132px')
  })
}
