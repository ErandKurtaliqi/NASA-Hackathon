import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { build } from 'esbuild'
import React from 'react'
import postcss from 'postcss'

const root = fileURLToPath(new URL('../../', import.meta.url)), require = createRequire(import.meta.url)
async function bundle(contents, plugins = []) {
  const result = await build({ stdin: { contents, resolveDir: root }, bundle: true, write: false,
    outfile: `${root}/.apollo-save-check.cjs`, platform: 'node', format: 'cjs', packages: 'external',
    jsx: 'automatic', loader: { '.css': 'local-css' }, plugins, logLevel: 'silent' })
  const module = { exports: {} }
  new Function('require', 'module', 'exports', result.outputFiles.find(f => f.path.endsWith('.cjs')).text)(require, module, module.exports)
  return module.exports
}
globalThis.__saveReact = React
const ui = await bundle("export {default as Page,DocumentaryQuiz} from './src/components/MachineStoryPage'; export {default as Apollo16Quiz} from './src/components/storytelling/Apollo16Quiz'; export {default as Dashboard} from './src/components/MissionDashboard'; export {storyCatalog as machineStories} from './src/features/storytelling/storyCatalog';", [{ name: 'apollo-save-host', setup(build) {
  build.onLoad({ filter: /[\\/]store\.ts$/ }, () => ({ loader: 'ts', contents: `
    export function useProgress(){return globalThis.__saveStore.useProgress.getState()}
    export function useProgressPersistence(){return globalThis.__saveStore.useProgressPersistence.getState()}
    export const retryProgressSave=()=>globalThis.__saveStore.retryProgressSave();` }))
  build.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'save-hooks' }))
  build.onLoad({ filter: /.*/, namespace: 'save-hooks' }, () => ({ loader: 'js', contents: `
    export const Component=globalThis.__saveReact.Component,Suspense=p=>p.children,lazy=()=>()=>null;
    export const useId=()=>{const cell=globalThis.__saveHooks.ref(null);return cell.current??=("mission-test-"+(globalThis.__missionHookId=(globalThis.__missionHookId??0)+1))};
    export const useLayoutEffect=(...a)=>useEffect(...a);export const useState=(...a)=>globalThis.__saveHooks.state(...a),useEffect=(...a)=>globalThis.__saveHooks.effect(...a),useRef=(...a)=>globalThis.__saveHooks.ref(...a);
    export const useMemo=fn=>fn(),useCallback=fn=>fn,useReducer=()=>{throw Error('Perseverance quiz is outside this fixture')};` }))
  build.onResolve({ filter: /^react-router-dom$/ }, () => ({ path: 'router', namespace: 'save-router' }))
  build.onLoad({ filter: /.*/, namespace: 'save-router' }, () => ({ loader: 'js', contents: `
    export const Link='a',Navigate=()=>null,useParams=()=>globalThis.__saveRoute,useNavigate=()=>globalThis.__saveNavigate;` }))
  build.onResolve({ filter: /^framer-motion$/ }, () => ({ path: 'motion', namespace: 'save-motion' }))
  build.onLoad({ filter: /.*/, namespace: 'save-motion' }, () => ({ loader: 'js', contents: `
    const Wrap=p=>globalThis.__saveReact.createElement('div',p,p.children);export const motion={div:Wrap,article:Wrap};export const AnimatePresence=p=>p.children;export const MotionConfig=p=>p.children,useReducedMotion=()=>false,useScroll=()=>({scrollYProgress:{get:()=>0}}),useMotionValue=v=>({get:()=>v,set(){}}),useSpring=v=>v;` }))
  build.onLoad({ filter: /[\\/](RoverScene|LunarRoverScene|LandingSequence)\.tsx$/ }, () => ({ loader: 'tsx', contents: 'export const OfficialRover=()=>null,LunarRover=()=>null;export default function Scene(){return null}' }))
  build.onLoad({ filter: /[\\/]StoryRecording\.tsx$/ }, () => ({ loader: 'tsx', contents: 'export default function Recording(p){return <div data-recording-src={p.src}/>}' }))
  build.onLoad({ filter: /[\\/]Apollo15Narration\.tsx$/ }, () => ({ loader: 'tsx', contents: 'export const Apollo15ChapterNarration=()=>null,Apollo15QuizNarration=()=>null;' }))
  build.onResolve({ filter: /^@react-three\/(fiber|drei)$/ }, args => ({ path: args.path, namespace: 'save-scene' }))
  build.onLoad({ filter: /.*/, namespace: 'save-scene' }, () => ({ loader: 'js', contents: 'export const Canvas=()=>null,Stars=()=>null,useFrame=()=>{},useThree=()=>({});' }))
} }])
const freshStore = () => bundle("export * from './src/store'")
const chapters = ['meet', 'journey', 'challenges', 'legacy', 'quiz'], key = 'beyond-earth-progress'
function seed(id, ready = true) {
  const completed = ready ? chapters.slice(0, 4) : []
  return { completedChapters: [...completed.map(c => `${id}:${c}`), 'follow-perseverance:meet'],
    exploredLocations: ['jezero'], inspectedInstruments: ['supercam'], badges: ['previous-badge'],
    storyProgress: { ...(ready ? { [id]: { completed, lastChapter: 5, completedMission: false } } : {}),
      'follow-perseverance': { completed: ['meet'], lastChapter: 2, completedMission: false } } }
}
function device(initial) {
  globalThis.document = { activeElement: null }
  const memory = new Map([[key, JSON.stringify({ state: initial, version: 0 })]])
  let reject = false, rejectBadge = false, writes = 0, reloads = 0
  const listeners = new Map(), frames = new Map(); let frameId = 0
  const emit = (type, event = {}) => { for (const fn of listeners.get(type) ?? []) fn({type,...event}); const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()) }
  globalThis.window = { innerHeight: 800, scrollY: 0,
    addEventListener(type, fn){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn)},
    removeEventListener(type,fn){listeners.get(type)?.delete(fn)},
    requestAnimationFrame(fn){frames.set(++frameId,fn);return frameId}, cancelAnimationFrame(id){frames.delete(id)}, setInterval: () => 1, clearInterval() {}, location: { reload() { reloads++ } },
    localStorage: { getItem: k => memory.get(k) ?? null, setItem(k, v) {
      writes++
      if (reject || (rejectBadge && JSON.parse(v).state.badges.some(id => id.endsWith('-storyteller')))) throw new DOMException('Storage rejected', 'QuotaExceededError')
      memory.set(k, v)
    }, removeItem: k => memory.delete(k) } }
  return { memory, emit, scroll(y){window.scrollY=y;emit('scroll')}, listeners, writes: () => writes, reloads: () => reloads, reject(value) { reject = value }, rejectBadge(value) { rejectBadge = value } }
}
const text = n => Array.isArray(n) ? n.map(text).join('') : typeof n === 'object' && n ? text(n.children) : String(n ?? '')

// Actual page, quiz, navigation, completion handlers and persistence adapter.
// Only React host hooks, router/GPU/audio presentation and DOM references are isolated.
function fixture(id, chapter = 5, { strictEffects = false, component = ui.Page, props = {} } = {}) {
  const instances = new Map(), refs = new Map(), navigations = []
  let current, cursor, tree, dirty, visited, pending = [], focused = null, questionClicks = 0
  globalThis.__saveRoute = { storyId: id, chapter: String(chapter) }
  globalThis.__saveNavigate = path => {
    navigations.push(path); globalThis.__saveRoute = { storyId: id, chapter: path.split('/').at(-1) }; dirty = true
  }
  const slot = init => current[cursor++] ||= init()
  globalThis.__saveHooks = {
    state(init) { const c = slot(() => ({ value: typeof init === 'function' ? init() : init })); return [c.value, v => {
      const next = typeof v === 'function' ? v(c.value) : v
      if (!Object.is(next, c.value)) { c.value = next; dirty = true }
    }] },
    ref(value) { return slot(() => ({ current: value })) },
    effect(fn, deps) { const c = slot(() => ({})); if (!c.deps || deps.some((v, i) => !Object.is(v, c.deps[i]))) {
      const mount = !c.deps
      c.deps = deps; pending.push(() => { c.cleanup?.(); c.cleanup = fn(); if (strictEffects && mount) { c.cleanup?.(); c.cleanup = fn() } })
    } },
  }
  function walk(n, path) {
    if (n == null || typeof n === 'boolean') return null
    if (Array.isArray(n)) return n.map((child, i) => walk(child, `${path}/${child?.key ?? i}`))
    if (typeof n !== 'object') return n
    if (typeof n.type === 'function') {
      const key = `${path}:${n.type.name}:${n.key ?? ''}`
      visited.add(key); current = instances.get(key) || []; instances.set(key, current); cursor = 0
      return walk(n.type(n.props), `${key}/out`)
    }
    if (n.ref) {
      const key = n.props.id || `${path}:${n.type}`
      const element = refs.get(key) || { rect: { top: Infinity, bottom: Infinity }, getBoundingClientRect(){return this.rect}, focus() { focused = key }, scrollIntoView(options) { this.scroll = options } }
      refs.set(key, element); if(typeof n.ref === 'function')n.ref(element);else n.ref.current = element
    }
    return { type: n.type, props: n.props, children: walk(n.props.children, `${path}/children`) }
  }
  function render() {
    let passes = 0
    do {
      dirty = false; visited = new Set(); tree = walk(React.createElement(component, props), 'page')
      for (const [key, cells] of instances) if (!visited.has(key)) { cells.forEach(c => c.cleanup?.()); instances.delete(key) }
      const effects = pending; pending = []; effects.forEach(fn => fn()); assert.ok(++passes < 15, 'effects settle')
    } while (dirty)
  }
  function all(predicate, node = tree) {
    if (Array.isArray(node)) return node.flatMap(child => all(predicate, child))
    if (!node || typeof node !== 'object') return []
    return [...(predicate(node) ? [node] : []), ...all(predicate, node.children)]
  }
  render()
  return { render, all, refs, navigations, text: () => text(tree), focused: () => focused, questionClicks: () => questionClicks,
    click(label) { const b = all(n => (n.type === 'button'||n.type==='summary') && (n.props['aria-label'] ?? text(n)).includes(label))[0]; assert.ok(b, label); assert.ok(!b.props.disabled); b.props.onClick(); render() },
    answer(index) { const b = all(n => n.type === 'button' && n.props.className === '')
        .filter(n => text(n).startsWith(String.fromCharCode(65 + index)))[0]; assert.ok(b, `answer ${index}`); b.props.onClick(); questionClicks++; render() },
    dispose() { instances.forEach(cells => cells.forEach(c => c.cleanup?.())); delete globalThis.__saveHooks; delete globalThis.__saveRoute; delete globalThis.__saveNavigate },
  }
}
function finishQuiz(f, id) {
  ui.machineStories[id].quiz.forEach((q, i) => { f.answer(q.answer); f.click(i < 2 ? 'NEXT QUESTION' : 'View Results') })
  assert.ok(f.text().includes('You scored 3 / 3'))
}
const warning = f => f.all(n => n.props.role === 'alert')
const confirmation = f => f.all(n => n.props.role === 'status' && /(?:are|is) saved on this device/.test(text(n)))
const nextChapter = f => f.all(n => n.type === 'button' && text(n).includes('NEXT CHAPTER'))[0]
function assertOtherProgress(saved, initial) {
  assert.deepEqual(saved.storyProgress['follow-perseverance'], initial.storyProgress['follow-perseverance'])
  assert.deepEqual(saved.exploredLocations, initial.exploredLocations)
  assert.deepEqual(saved.completedChapters.filter(c => c.startsWith('follow-perseverance:')), ['follow-perseverance:meet'])
}
const rawText = n => Array.isArray(n) ? n.map(rawText).join('') : typeof n === 'object' && n ? rawText(n.props?.children) : String(n ?? '')
function rawNodes(n, predicate) {
  if (Array.isArray(n)) return n.flatMap(child => rawNodes(child, predicate))
  if (!n || typeof n !== 'object') return []
  return [...(predicate(n) ? [n] : []), ...rawNodes(n.props?.children, predicate)]
}
function assertDashboard(id, count, total, earned) {
  // Execute the actual dashboard calculations with the current real store.
  const dashboard = ui.Dashboard()
  const track = rawNodes(dashboard, n => n.type === 'article' && n.props.className?.startsWith('mission-track '))
    .find(n => rawText(n).includes(ui.machineStories[id].name))
  assert.ok(track); assert.ok(rawText(track).includes(`${count / 5 * 100}%`))
  assert.ok(rawText(track).includes(`${count} OF 5 CHAPTERS`))
  assert.ok(rawText(dashboard).includes(`${total} / ${Object.keys(ui.machineStories).length * 5} CHAPTERS COMPLETE`))
  assert.equal(rawNodes(dashboard, n => n.type === 'span' && n.props.className === 'earned' && rawText(n).includes(ui.machineStories[id].reward)).length, earned ? 1 : 0)
}


export { ui, freshStore, device, seed, fixture, finishQuiz, key, chapters, text, assertOtherProgress, confirmation, warning, assertDashboard }
