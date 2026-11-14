import { beforeMasterIntegration } from './helpers/master-integration-contract.mjs'
import { beforeMoonScope } from './helpers/moon-scope-contract.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { build } from 'esbuild'
import React from 'react'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
async function bundle(contents, plugins = []) {
  const result = await build({ stdin: { contents, resolveDir: root, sourcefile: 'media-check.tsx' }, bundle: true,
    write: false, outfile: `${root}/.media-check.cjs`, platform: 'node', format: 'cjs', packages: 'external',
    jsx: 'automatic', loader: { '.css': 'local-css' }, plugins, logLevel: 'silent' })
  const module = { exports: {} }
  new Function('require', 'module', 'exports', result.outputFiles.find(f => f.path.endsWith('.cjs')).text)(require, module, module.exports)
  return module.exports
}
globalThis.__journeyReact = React
const api = await bundle(`export {default as Pilot} from './src/components/storytelling/PerseverancePilot';
  export * from './src/features/storytelling/journeyMedia'; export {getPilotSteps} from './src/features/storytelling/pilot';
  export {machineStories} from './src/machineStories';`, [{ name: 'hook-host', setup(build) {
  build.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'hook-host' }))
  build.onLoad({ filter: /.*/, namespace: 'hook-host' }, () => ({ loader: 'js', contents: `
    export const Component=globalThis.__journeyReact.Component, Suspense=globalThis.__journeyReact.Suspense;
    export const lazy=loader=>props=>globalThis.__journeyReact.createElement('test-scene', {...props, 'data-scene': loader.toString().includes('LandingSequence')?'landing':'rover'});
    export const useId=()=>{const cell=globalThis.__journeyHooks.ref(null);return cell.current??=("host-id-"+(globalThis.__releaseHookId=(globalThis.__releaseHookId??0)+1))};
    export const useLayoutEffect=(...a)=>useEffect(...a);export const useState=(...args)=>globalThis.__journeyHooks.state(...args);
    export const useRef=(...args)=>globalThis.__journeyHooks.ref(...args);
    export const useEffect=(...args)=>globalThis.__journeyHooks.effect(...args);
    export const useMemo=(...args)=>globalThis.__journeyHooks.memo(...args);
    export const useCallback=(fn,deps)=>globalThis.__journeyHooks.memo(()=>fn,deps);` }))
} }])

// A small hook/effect host: executes real pilot, hooks, controller and handlers.
// Scene loading and browser geometry are fixtures; this is not a DOM/GPU test.
function fixture(reduced = false, chapter = 'journey') {
  const instances = new Map(), frames = new Map(), listeners = new Map(), docListeners = new Map(), bounds = new Map()
  let current, cursor, pending = [], dirty = false, tree, nextFrame = 0, engaged = 0, visited
  const query = { matches: reduced, addEventListener(_, fn) { this.change = fn }, removeEventListener() {} }
  const add = (map, name, fn) => map.set(name, [...(map.get(name) || []), fn])
  const remove = (map, name, fn) => map.set(name, (map.get(name) || []).filter(f => f !== fn))
  globalThis.window = { innerHeight: 800, matchMedia: () => query,
    addEventListener: (n, f) => add(listeners, n, f), removeEventListener: (n, f) => remove(listeners, n, f),
    requestAnimationFrame: fn => (frames.set(++nextFrame, fn), nextFrame), cancelAnimationFrame: id => frames.delete(id) }
  globalThis.document = { hidden: false, addEventListener: (n, f) => add(docListeners, n, f), removeEventListener: (n, f) => remove(docListeners, n, f) }
  const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]))
  const slot = init => { const i = cursor++; return current[i] ||= init() }
  globalThis.__journeyHooks = {
    state(init) { const cell = slot(() => ({ value: typeof init === 'function' ? init() : init })); return [cell.value, value => {
      const next = typeof value === 'function' ? value(cell.value) : value
      if (!Object.is(next, cell.value)) { cell.value = next; dirty = true }
    }] },
    ref(value) { return slot(() => ({ current: value })) },
    memo(fn, deps) { const cell = slot(() => ({})); if (!same(cell.deps, deps)) { cell.value = fn(); cell.deps = deps } return cell.value },
    effect(fn, deps) { const cell = slot(() => ({})); if (!same(cell.deps, deps)) { cell.deps = deps; pending.push(() => { cell.cleanup?.(); cell.cleanup = fn() }) } },
  }
  function walk(node, path) {
    if (node == null || typeof node === 'boolean') return null
    if (Array.isArray(node)) return node.map((child, i) => walk(child, `${path}/${child?.key ?? i}`))
    if (typeof node !== 'object') return node
    if (typeof node.type === 'function') {
      const key = `${path}:${node.type.name}:${node.key || ''}`
      visited.add(key); current = instances.get(key) || []; instances.set(key, current); cursor = 0
      const output = node.type.prototype?.render ? new node.type(node.props).render() : node.type(node.props)
      return walk(output, `${key}/out`)
    }
    const props = node.props || {}
    if (node.ref) {
      const element = { offsetHeight: 80, style: { setProperty() {} }, contains: () => false,
        getBoundingClientRect: () => bounds.get(props.id) || { top: 1000, bottom: 1400 },
        scrollIntoView(options) { assert.equal(options.behavior, 'instant') }, focus() {} }
      if (typeof node.ref === 'function') node.ref(element); else node.ref.current = element
    }
    return { type: node.type, props, children: walk(props.children, `${path}/children`) }
  }
  function render() {
    let passes = 0
    do {
      dirty = false; visited = new Set()
      tree = walk(React.createElement(api.Pilot, { story: api.machineStories['follow-perseverance'], chapter, onEngage: () => engaged++ }), 'pilot')
      for (const [key, cells] of instances) if (!visited.has(key)) { cells.forEach(c => c.cleanup?.()); instances.delete(key) }
      const effects = pending; pending = []; effects.forEach(fn => fn())
      assert.ok(++passes < 15, 'effects settle')
    } while (dirty)
    return tree
  }
  function all(predicate, node = tree) {
    if (Array.isArray(node)) return node.flatMap(child => all(predicate, child))
    if (!node || typeof node !== 'object') return []
    return [...(predicate(node) ? [node] : []), ...all(predicate, node.children)]
  }
  render()
  return { render, all, query, engaged: () => engaged,
    click(label) { const button = all(n => n.type === 'button' && n.props['aria-label'] === label)[0]; assert.ok(button); assert.ok(!button.props.disabled); button.props.onClick(); render() },
    scroll(index) {
      api.journeyStepIds.forEach((id, i) => bounds.set(`perseverance-journey-${id}`, { top: (i - index) * 600 + 80, bottom: (i - index) * 600 + 580 }))
      listeners.get('scroll').forEach(fn => fn()); const batch = [...frames.values()]; frames.clear(); batch.forEach(fn => fn()); render()
    },
    hide() { document.hidden = true; docListeners.get('visibilitychange').forEach(fn => fn()); render() },
    dispose() { instances.forEach(cells => cells.forEach(c => c.cleanup?.())); delete globalThis.window; delete globalThis.document; delete globalThis.__journeyHooks },
  }
}
const text = node => Array.isArray(node) ? node.map(text).join(' ') : typeof node === 'object' && node ? text(node.children) : String(node ?? '')
const mediaId = f => f.all(n => n.type === 'figure')[0]?.props['data-step-media']

test('all five existing IDs have verified, attributed local JPEG variants', () => {
  assert.deepEqual(api.getPilotSteps(api.machineStories['follow-perseverance'], 'journey').map(s => s.id), api.journeyStepIds)
  for (const id of api.journeyStepIds) {
    const media = api.getPerseveranceJourneyMedia(id)
    assert.equal(media.id, id); assert.ok(media.alt.length > 60 && media.credit && media.usageNotes)
    for (const url of [media.sourceUrl, media.usagePolicyUrl]) assert.match(new URL(url).hostname, /(^|\.)nasa\.gov$/)
    for (const width of [720, 1440]) {
      const bytes = readFileSync(`${root}/public/media/perseverance-journey/${id}-${width}.jpg`)
      assert.equal(bytes.readUInt16BE(0), 0xffd8); assert.ok(bytes.length < 250000)
    }
  }
  assert.equal(api.getPerseveranceJourneyMedia('missing'), undefined)
  assert.equal(api.getPerseveranceJourneyMedia('__proto__'), undefined)
})

test('real scroll hook/controller and Previous/Next drive the matching image, alt, source and credit', () => {
  const f = fixture()
  try {
    assert.equal(mediaId(f), 'launch')
    for (const i of [1, 2, 3, 4, 3, 2, 1, 0]) {
      f.scroll(i)
      const id = api.journeyStepIds[i], media = api.getPerseveranceJourneyMedia(id)
      assert.equal(mediaId(f), id)
      assert.equal(f.all(n => n.type === 'img')[0].props.alt, media.alt)
      assert.ok(f.all(n => n.type === 'a' && n.props.href === media.sourceUrl).length)
      assert.ok(f.all(n => n.type === 'span' && text(n).includes(media.credit)).length)
    }
    f.click('Next story step'); assert.equal(mediaId(f), 'cruise')
    f.click('Previous story step'); assert.equal(mediaId(f), 'launch')
    assert.ok(f.engaged() > 0)
    assert.equal(f.all(n => n.type === 'test-scene').length, 0, 'normal media steps do not mount a 3D scene')
  } finally { f.dispose() }
})

test('image errors keep attribution, offer retry, and reset loading on a new step', () => {
  const f = fixture()
  try {
    f.all(n => n.type === 'img')[0].props.onError(); f.render()
    assert.equal(f.all(n => n.type === 'img').length, 0)
    const retry = f.all(n => n.type === 'button' && text(n) === 'Retry image')[0]
    assert.ok(retry); assert.ok(f.all(n => n.type === 'a' && text(n).includes('Official source')).length)
    retry.props.onClick(); f.render(); assert.equal(f.all(n => n.type === 'img').length, 1)
    f.scroll(1); assert.equal(mediaId(f), 'cruise')
    f.all(n => n.type === 'img')[0].props.onLoad(); f.render()
    assert.equal(f.all(n => n.props['aria-busy'] === true).length, 0)
  } finally { f.dispose() }
})

test('reduced motion still follows steps, disables fades and preserves explicit reconstruction lifecycle', () => {
  const f = fixture(true)
  const landing = () => f.all(n => n.type === 'test-scene' && n.props['data-scene'] === 'landing')
  try {
    f.scroll(3); assert.equal(mediaId(f), 'landing'); assert.equal(landing().length, 0)
    let play = f.all(n => n.type === 'button' && text(n) === 'Play landing reconstruction')[0]
    assert.equal(play.props.disabled, true)
    assert.ok(!f.all(n => n.type === 'img')[0].props.className.includes('motion'))
    f.all(n => n.type === 'button' && text(n).includes('Resume visuals'))[0].props.onClick(); f.render()
    play = f.all(n => n.type === 'button' && text(n) === 'Play landing reconstruction')[0]
    play.props.onClick(); f.render(); assert.equal(landing().length, 1)
    assert.ok(f.all(n => n.type === 'p' && text(n).includes('not NASA footage')).length)
    f.scroll(4); assert.equal(landing().length, 0)
    f.scroll(3); assert.equal(landing().length, 0, 'no restart after returning to landing')
    f.all(n => n.type === 'button' && text(n) === 'Play landing reconstruction')[0].props.onClick(); f.render()
    f.all(n => n.type === 'button' && text(n) === 'Stop reconstruction')[0].props.onClick(); f.render()
    assert.equal(landing().length, 0)
    f.all(n => n.type === 'button' && text(n) === 'Play landing reconstruction')[0].props.onClick(); f.render()
    f.all(n => n.type === 'button' && text(n).includes('Pause visuals'))[0].props.onClick(); f.render()
    assert.equal(landing().length, 0)
    f.all(n => n.type === 'button' && text(n).includes('Resume visuals'))[0].props.onClick(); f.render()
    assert.equal(landing().length, 0, 'resume does not start the reconstruction')
    f.all(n => n.type === 'button' && text(n) === 'Play landing reconstruction')[0].props.onClick(); f.render()
    f.hide(); assert.equal(landing().length, 0)
    f.query.change({ matches: false }); f.render(); f.query.change({ matches: true }); f.render()
    assert.ok(f.all(n => n.type === 'button' && text(n).includes('Resume visuals')).length)
  } finally { f.dispose() }
})

test('Meet Me does not render the new media panel', () => {
  const f = fixture(false, 'meet')
  try { assert.equal(f.all(n => n.type === 'figure').length, 0); assert.ok(f.all(n => n.props['aria-label'] === 'Perseverance presentation').length) }
  finally { f.dispose() }
})

test('all Apollo chapters and protected Perseverance chapters render exactly as before', async () => {
  const baselinePilot = execFileSync('git', ['show', '49f7545:src/components/storytelling/PerseverancePilot.tsx'], { cwd: root, encoding: 'utf8' })
  const isolate = { name: 'legacy-render-contract', setup(build) {
    build.onLoad({ filter: /[\\/]store\.ts$/ }, () => ({ loader: 'ts', contents: `export const useProgressPersistence=()=>({status:'saved',reason:null}),retryProgressSave=()=>true;export function useProgress(){return {badges:[],completedChapters:[], storyProgress:{'follow-perseverance':{completed:['meet','journey','challenges','legacy']},'apollo-17-rover':{completed:['meet','journey','challenges','legacy']}},completeStoryChapter(){},awardBadge(){}}}` }))
    build.onLoad({ filter: /[\\/](RoverScene|LunarRoverScene|LandingSequence)\.tsx$/ }, () => ({ loader: 'tsx', contents: 'export const OfficialRover=()=>null,LunarRover=()=>null;export default function Scene(){return null}' }))
    build.onResolve({ filter: /^@react-three\/(fiber|drei)$/ }, args => ({ path: args.path, namespace: 'scene-test' }))
    build.onLoad({ filter: /.*/, namespace: 'scene-test' }, () => ({ loader: 'tsx', contents: 'export function Canvas(){return null};export function Stars(){return null};export function useFrame(){}' }))
  } }
  const entry = `export {default as Page} from './src/components/MachineStoryPage';`
  const before = await bundle(entry, [isolate, { name: 'baseline-pilot', setup(build) {
    build.onLoad({ filter: /[\\/]PerseverancePilot\.tsx$/ }, () => ({ loader: 'tsx', contents: baselinePilot }))
  } }])
  const after = await bundle(entry, [isolate])
  const { renderToStaticMarkup } = require('react-dom/server')
  const { StaticRouter, Routes, Route } = require('react-router-dom')
  const markup = (Page, id, chapter) => renderToStaticMarkup(React.createElement(StaticRouter, { location: `/story/${id}/${chapter}` },
    React.createElement(Routes, null, React.createElement(Route, { path: '/story/:storyId/:chapter', element: React.createElement(Page) }))))
  for (const [id, chapters] of [['apollo-17-rover', [1, 2, 3, 4, 5]], ['follow-perseverance', [1]]]) {
    for (const chapter of chapters) assert.equal(markup(after.Page, id, chapter), markup(before.Page, id, chapter), `${id}/${chapter}`)
  }
})

test('protected source files, controller and original progress actions remain identical to the checkpoint', () => {
  // MachineStoryPage now has an authorized Chapter 3 integration, covered by
  // the protected-route and legacy-function comparisons in challenges tests.
  // The approved hero-only homepage is covered by homepage-hero.test.mjs.
  for (const file of ['src/components/LandingSequence.tsx', 'src/components/RoverScene.tsx',
    'src/components/PlanetScene.tsx', 'src/components/LunarRoverScene.tsx',
    'src/pages/ExplorerPage.module.css', 'src/features/storytelling/useScrollStory.ts',
    'src/features/storytelling/scrollController.ts', 'src/features/storytelling/useChapterNarration.ts', 'src/machineStories.ts',
    'src/data.ts', 'src/planetaryConfig.ts', 'src/index.css', 'package.json', 'package-lock.json']) {
    const baseline = execFileSync('git', ['show', `49f7545:${file}`], { cwd: root })
    let current = beforeMoonScope(readFileSync(`${root}/${file}`, 'utf8').replace(/\r\n/g, '\n'))
    if (file === 'src/machineStories.ts') current = current.slice(0, current.indexOf('  // Apollo 15 content')) + '}\n'
    if (file === 'src/data.ts') current = current.split('\n').filter(line => !line.startsWith("  { id: 'lrv-1',")).join('\n')
    assert.equal(current, baseline.toString().replace(/\r\n/g, '\n'), file)
  }
  // The storage adapter now has an authorized reliability correction. Keep the
  // original schema/types and every progress action protected independently.
  const previousStore = execFileSync('git', ['show', '49f7545:src/store.ts'], { cwd: root, encoding: 'utf8' }).replace(/\r\n/g, '\n')
  const currentStore = beforeMasterIntegration(readFileSync(`${root}/src/store.ts`, 'utf8').replace(/\r\n/g, '\n'))
  for (const [start, end] of [['type ProgressState', 'const add'], ['  completedChapters: [], exploredLocations:', '  reset: () =>']]) {
    const extract = source => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)))
    assert.equal(extract(currentStore), extract(previousStore))
  }
  const reset = source => source.split('\n').find(line => line.startsWith('  reset: () =>'))
  assert.equal(reset(currentStore), reset(previousStore))
})
