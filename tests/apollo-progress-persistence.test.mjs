import { beforeMoonScope } from './helpers/moon-scope-contract.mjs'
import { withBaselineApolloQuiz } from './helpers/apollo-quiz-contract.mjs'
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
    outfile: `${root}/.apollo-save-check.cjs`, platform: 'node', format: 'cjs', packages: 'external',
    jsx: 'automatic', loader: { '.css': 'local-css' }, plugins, logLevel: 'silent' })
  const module = { exports: {} }
  new Function('require', 'module', 'exports', result.outputFiles.find(f => f.path.endsWith('.cjs')).text)(require, module, module.exports)
  return module.exports
}
globalThis.__saveReact = React
const ui = await bundle("export {default as Page} from './src/components/MachineStoryPage'; export {default as Dashboard} from './src/components/MissionDashboard'; export {storyCatalog as machineStories} from './src/features/storytelling/storyCatalog';", [{ name: 'apollo-save-host', setup(build) {
  build.onLoad({ filter: /[\\/]store\.ts$/ }, () => ({ loader: 'ts', contents: `
    export function useProgress(){return globalThis.__saveStore.useProgress.getState()}
    export function useProgressPersistence(){return globalThis.__saveStore.useProgressPersistence.getState()}
    export const retryProgressSave=()=>globalThis.__saveStore.retryProgressSave();` }))
  build.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'save-hooks' }))
  build.onLoad({ filter: /.*/, namespace: 'save-hooks' }, () => ({ loader: 'js', contents: `
    export const Component=globalThis.__saveReact.Component,Suspense=p=>p.children,lazy=()=>()=>null;
    export const useId=()=>{const cell=globalThis.__saveHooks.ref(null);return cell.current??=("host-id-"+(globalThis.__releaseHookId=(globalThis.__releaseHookId??0)+1))};
    export const useLayoutEffect=(...a)=>useEffect(...a);export const useState=(...a)=>globalThis.__saveHooks.state(...a),useEffect=(...a)=>globalThis.__saveHooks.effect(...a),useRef=(...a)=>globalThis.__saveHooks.ref(...a);
    export const useMemo=fn=>fn(),useCallback=fn=>fn,useReducer=()=>{throw Error('Perseverance quiz is outside this fixture')};` }))
  build.onResolve({ filter: /^react-router-dom$/ }, () => ({ path: 'router', namespace: 'save-router' }))
  build.onLoad({ filter: /.*/, namespace: 'save-router' }, () => ({ loader: 'js', contents: `
    export const Link='a',Navigate=()=>null,useParams=()=>globalThis.__saveRoute,useNavigate=()=>globalThis.__saveNavigate;` }))
  build.onResolve({ filter: /^framer-motion$/ }, () => ({ path: 'motion', namespace: 'save-motion' }))
  build.onLoad({ filter: /.*/, namespace: 'save-motion' }, () => ({ loader: 'js', contents: `
    const Wrap=p=>globalThis.__saveReact.createElement('div',p,p.children);export const motion={div:Wrap,article:Wrap};export const AnimatePresence=p=>p.children;export const MotionConfig=p=>p.children,useReducedMotion=()=>false,useScroll=()=>({scrollYProgress:{get:()=>0}}),useMotionValue=v=>({get:()=>v,set(){}}),useSpring=v=>v;` }))
  build.onLoad({ filter: /[\\/](RoverScene|LunarRoverScene|LandingSequence)\.tsx$/ }, () => ({ loader: 'tsx', contents: 'export const OfficialRover=()=>null,LunarRover=()=>null;export default function Scene(){return null}' }))
  build.onLoad({ filter: /[\\/]Apollo17BrowserVoice\.tsx$/ }, () => ({ loader: 'tsx', contents: 'export default function Voice(){return null}' }))
  build.onLoad({ filter: /[\\/]StoryRecording\.tsx$/ }, () => ({ loader: 'tsx', contents: 'export default function Recording(p){return <div data-recording-src={p.src}/>}' }))
  build.onLoad({ filter: /[\\/]Apollo15Narration\.tsx$/ }, () => ({ loader: 'tsx', contents: 'export const Apollo15ChapterNarration=()=>null,Apollo15QuizNarration=()=>null;' }))
  build.onResolve({ filter: /^@react-three\/(fiber|drei)$/ }, args => ({ path: args.path, namespace: 'save-scene' }))
  build.onLoad({ filter: /.*/, namespace: 'save-scene' }, () => ({ loader: 'js', contents: 'export const Canvas=()=>null,Stars=()=>null,useFrame=()=>{},useThree=()=>({});' }))
} }])
const freshStore = () => bundle("export * from './src/store'")
const chapters = ['meet', 'journey', 'challenges', 'legacy', 'quiz'], key = 'beyond-earth-progress'
function seed(id, ready = true) {
  const completed = ready ? chapters.slice(0, 4) : []
  return { roverJourneys: {}, completedChapters: [...completed.map(c => `${id}:${c}`), 'follow-perseverance:meet'],
    exploredLocations: ['jezero'], inspectedInstruments: ['supercam'], badges: ['previous-badge'],
    storyProgress: { ...(ready ? { [id]: { completed, lastChapter: 5, completedMission: false } } : {}),
      'follow-perseverance': { completed: ['meet'], lastChapter: 2, completedMission: false } } }
}
function device(initial) {
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
function fixture(id, chapter = 5, { strictEffects = false } = {}) {
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
      dirty = false; visited = new Set(); tree = walk(React.createElement(ui.Page), 'page')
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
for (const id of ['apollo-15-rover', 'apollo-17-rover', 'apollo-11-reflector']) {
  test(`${id}: retry of an already completed quiz preserves completion and the unique reward`, async () => {
    const initial = seed(id)
    initial.completedChapters.push(`${id}:quiz`)
    initial.storyProgress[id] = { completed: [...chapters], lastChapter: 5, completedMission: true }
    initial.badges.push(`${id}-storyteller`)
    const d = device(initial)
    globalThis.__saveStore = await freshStore()
    const f = fixture(id, 5)
    try {
      const before = d.memory.get(key)
      finishQuiz(f, id)
      f.click('TRY AGAIN')
      assert.equal(d.memory.get(key), before)
      assert.equal(f.all(n => n.type === 'button' && text(n).includes('COMPLETE STORY'))[0].props.disabled, false)
      f.click('COMPLETE STORY')
      assert.deepEqual(JSON.parse(d.memory.get(key)).state, initial)
      assert.equal(globalThis.__saveStore.useProgress.getState().badges.filter(b => b === `${id}-storyteller`).length, 1)
    } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
  })
  test(`${id}: retry cannot complete an unfinished new attempt or mutate existing progress`, async () => {
    const initial = seed(id), d = device(initial)
    globalThis.__saveStore = await freshStore()
    const f = fixture(id, 5)
    const complete = () => f.all(n => n.type === 'button' && text(n).includes('COMPLETE STORY'))[0]
    try {
      const before = d.memory.get(key)
      assert.equal(complete().props.disabled, true)
      finishQuiz(f, id)
      assert.equal(complete().props.disabled, false)
      f.click('TRY AGAIN')
      assert.equal(complete().props.disabled, true, 'retry clears only the temporary permission to complete this unfinished quiz')
      assert.equal(d.memory.get(key), before)
      assert.deepEqual(globalThis.__saveStore.useProgress.getState().badges, initial.badges)
      ui.machineStories[id].quiz.forEach((item, i) => {
        f.answer(item.answer)
        assert.equal(complete().props.disabled, true, 'feedback is readable before explicit results')
        f.click(i < 2 ? 'NEXT QUESTION' : 'View Results')
      })
      assert.equal(complete().props.disabled, false)
      f.click('COMPLETE STORY')
      const saved = JSON.parse(d.memory.get(key)).state
      assert.equal(saved.storyProgress[id].completedMission, true)
      assert.deepEqual(saved.badges, [...initial.badges, `${id}-storyteller`])
      assertOtherProgress(saved, initial)
    } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
  })
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
  assert.ok(rawText(dashboard).includes(`${total - 1} / 40 CHAPTERS COMPLETE`))
  assert.equal(rawNodes(dashboard, n => n.type === 'span' && n.props.className === 'earned' && rawText(n).includes(ui.machineStories[id].reward)).length, earned ? 1 : 0)
}

for (const id of ['apollo-15-rover', 'apollo-17-rover']) {
  test(`${id}: all three explanations remain readable; focus follows feedback, questions, View Results and retry`, async () => {
    const initial = seed(id), d = device(initial); globalThis.__saveStore = await freshStore(); const f = fixture(id, 5, { strictEffects: true })
    const prefix = `${id}-quiz`, complete = () => f.all(n => n.type === 'button' && text(n).includes('COMPLETE STORY'))[0]
    try {
      assert.equal(f.focused(), id === 'apollo-15-rover' ? 'apollo15-chapter-5' : 'apollo17-chapter-5', 'pilot chapter entry has a heading target; shared quiz never steals initial focus')
      const before = d.memory.get(key)
      ui.machineStories[id].quiz.forEach((item, i) => {
        const question = f.all(n => n.props.id === `${prefix}-question`)[0]
        assert.equal(question.props.tabIndex, -1); assert.equal(question.props['aria-describedby'], `${prefix}-position`)
        assert.equal(f.all(n => n.props.id === `${prefix}-feedback`).length, 0)
        assert.equal(complete().props.disabled, true)
        f.answer(item.answer)
        const feedback = f.all(n => n.props.id === `${prefix}-feedback`)[0]
        assert.ok(text(feedback).includes(item.explanation)); assert.ok(text(feedback).includes('Correct.'))
        assert.equal(f.focused(), `${prefix}-feedback`)
        assert.equal(f.refs.get(f.focused()).scroll.behavior, 'instant')
        assert.equal(feedback.props['aria-live'], undefined, 'focus announces the explanation without a duplicate live region')
        const region = f.all(n => n.props.role === 'region' && n.props['aria-label'] === 'Answer feedback')[0]
        assert.ok(region); assert.equal(region.props['aria-live'], undefined)
        const options = f.all(n => n.type === 'button' && n.props.disabled === true && n.props['aria-pressed'] !== undefined)
        assert.equal(options.length, item.options.length); assert.equal(options.filter(n => n.props['aria-pressed']).length, 1)
        assert.equal(complete().props.disabled, true); assert.equal(d.memory.get(key), before)
        if (i < 2) {
          f.click('NEXT QUESTION'); assert.equal(f.focused(), `${prefix}-question`)
        } else {
          f.render(); f.render()
          assert.ok(f.text().includes(item.explanation)); assert.ok(!f.text().includes('You scored'))
          const view = f.all(n => n.type === 'button' && text(n).includes('View Results'))[0]
          assert.equal(view.props.type, 'button'); assert.ok(!view.props.disabled); assert.notEqual(view.props.tabIndex, -1)
          f.click('View Results')
          assert.equal(f.focused(), `${prefix}-results`); assert.ok(f.text().includes('You scored 3 / 3'))
          assert.equal(complete().props.disabled, false); assert.equal(d.memory.get(key), before)
          view.props.onClick(); f.render(); assert.equal(d.writes(), 0, 'repeated results intent does not persist or award anything')
        }
      })
      assert.deepEqual(globalThis.__saveStore.useProgress.getState().badges, initial.badges)
      f.click('TRY AGAIN'); assert.equal(f.focused(), `${prefix}-question`)
      assert.ok(f.text().includes('QUESTION 1 / 3')); assert.ok(f.text().includes('0 CORRECT'))
      assert.equal(f.all(n => n.props.id === `${prefix}-feedback`).length, 0)
      assert.equal(d.memory.get(key), before)
    } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
  })

  test(`${id}: all answer combinations keep correct/incorrect feedback, score exactly once and reset only the attempt`, async () => {
    for (let a = 0; a < ui.machineStories[id].quiz[0].options.length; a++) for (let b = 0; b < ui.machineStories[id].quiz[1].options.length; b++) for (let c = 0; c < ui.machineStories[id].quiz[2].options.length; c++) {
      const initial = seed(id), d = device(initial); globalThis.__saveStore = await freshStore(); const f = fixture(id)
      try {
        const choices = [a, b, c], before = d.memory.get(key)
        choices.forEach((choice, i) => {
          const item = ui.machineStories[id].quiz[i]
          f.answer(choice)
          const feedback = f.all(n => n.props.id === `${id}-quiz-feedback`)[0]
          assert.ok(text(feedback).includes(item.explanation))
          assert.ok(text(feedback).includes(choice === item.answer ? 'Correct.' : `Incorrect. Correct answer: ${item.options[item.answer]}.`))
          // Even an obsolete handler cannot change a submitted answer/score.
          f.all(n => n.type === 'button' && n.props['aria-pressed'] === false)[0].props.onClick(); f.render()
          assert.equal(d.memory.get(key), before)
          f.click(i < 2 ? 'NEXT QUESTION' : 'View Results')
        })
        const score = choices.filter((choice, i) => choice === ui.machineStories[id].quiz[i].answer).length
        assert.ok(f.text().includes(`You scored ${score} / 3`)); assert.ok(f.text().includes(ui.machineStories[id].reward))
        assert.equal(d.writes(), 0); assert.deepEqual(globalThis.__saveStore.useProgress.getState().badges, initial.badges)
        f.click('TRY AGAIN'); assert.ok(f.text().includes('0 CORRECT')); assert.equal(d.memory.get(key), before)
        assert.equal(f.all(n => n.type === 'button' && n.props['aria-pressed'] !== undefined).length, 0)
      } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
    }
  })

  test(`${id}: explicit results preserve the other Apollo mission; completion and failed-save recovery keep their existing conditions`, async () => {
    const initial = seed(id), other = id === 'apollo-15-rover' ? 'apollo-17-rover' : 'apollo-15-rover'
    initial.storyProgress[other] = { completed: chapters, lastChapter: 5, completedMission: true }
    initial.completedChapters.push(...chapters.map(ch => `${other}:${ch}`)); initial.badges.push(`${other}-storyteller`)
    const d = device(initial); globalThis.__saveStore = await freshStore(); const f = fixture(id)
    try {
      finishQuiz(f, id)
      assert.deepEqual(globalThis.__saveStore.useProgress.getState().storyProgress, initial.storyProgress)
      assert.deepEqual(globalThis.__saveStore.useProgress.getState().badges, initial.badges)
      d.reject(true); f.click('COMPLETE STORY'); assert.equal(warning(f).length, 1)
      assert.equal(confirmation(f).length, 0); assert.ok(f.text().includes('You scored 3 / 3'))
      assert.deepEqual(globalThis.__saveStore.useProgress.getState().storyProgress[other], initial.storyProgress[other])
      d.reject(false); f.click('Retry saving')
      const saved = JSON.parse(d.memory.get(key)).state
      assert.deepEqual(saved.storyProgress[other], initial.storyProgress[other])
      assert.deepEqual(saved.badges, [...initial.badges, `${id}-storyteller`])
      assert.equal(saved.storyProgress[id].completedMission, true); assertOtherProgress(saved, initial)
      assert.equal(f.questionClicks(), 3); assert.ok(f.text().includes('You scored 3 / 3'))
      const snapshot = d.memory.get(key); f.click('TRY AGAIN'); assert.equal(d.memory.get(key), snapshot)
    } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
  })

  test(`${id}: Meet Me permits immediate native-button navigation without inventing interaction or changing legacy progress`, async () => {
    const initial = seed(id, false), other = id === 'apollo-15-rover' ? 'apollo-17-rover' : 'apollo-15-rover'
    initial.completedChapters.push(`${other}:meet`, `${other}:journey`)
    const d = device(initial), store = globalThis.__saveStore = await freshStore(), f = fixture(id, 1)
    try {
      assert.equal(nextChapter(f).type, 'button'); assert.equal(nextChapter(f).props.disabled, false)
      assert.notEqual(nextChapter(f).props['aria-disabled'], true); assert.notEqual(nextChapter(f).props.tabIndex, -1)
      assert.equal(nextChapter(f).props.onKeyDown, undefined, 'native Enter/Space activation is not intercepted')
      assert.ok(f.text().includes('EXPLORE OR CONTINUE')); assert.ok(!f.text().includes('INTERACTION COMPLETE'))
      assert.ok(f.all(n => n.type === 'button' && text(n).includes('PREVIOUS CHAPTER'))[0].props.disabled)
      assert.equal(d.writes(), 0); assert.deepEqual(store.useProgress.getState().completedChapters, initial.completedChapters)
      assert.equal(store.useProgress.getState().storyProgress[id], undefined)
      f.click('NEXT CHAPTER')
      assert.deepEqual(f.navigations, [`/story/${id}/2`]); assert.equal(nextChapter(f).props.disabled, false)
      const saved = JSON.parse(d.memory.get(key))
      assert.equal(saved.version, 0); assert.equal(d.writes(), 1)
      assert.deepEqual(saved.state.completedChapters, [...initial.completedChapters, `${id}:meet`])
      assert.deepEqual(saved.state.storyProgress[id], { completed: ['meet'], lastChapter: 2, completedMission: false })
      assert.deepEqual(saved.state.badges, initial.badges); assertOtherProgress(saved.state, initial)
      assert.deepEqual((await freshStore()).useProgress.getState().storyProgress[id], saved.state.storyProgress[id])
    } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
  })

  test(`${id}: all profile cards remain optional native controls and only actual clicks show interaction complete`, async () => {
    const d = device(seed(id, false)); globalThis.__saveStore = await freshStore(); const f = fixture(id, 1)
    try {
      const initialCard = f.all(n => n.type === 'button' && text(n).includes('MY NAME'))[0]
      assert.equal(initialCard.props.className, 'active'); assert.ok(!f.text().includes('INTERACTION COMPLETE'))
      for (const item of ui.machineStories[id].profile) {
        const card = f.all(n => n.type === 'button' && text(n).includes(item.label))[0]
        assert.ok(card); assert.ok(!card.props.disabled); assert.notEqual(card.props.tabIndex, -1)
        f.click(item.label)
        assert.equal(f.all(n => n.type === 'button' && text(n).includes(item.label))[0].props.className, 'active')
        assert.ok(f.text().includes('INTERACTION COMPLETE')); assert.equal(nextChapter(f).props.disabled, false)
        assert.equal(d.writes(), 0, 'exploring cards does not complete a chapter or write visited data')
      }
      f.click('NEXT CHAPTER'); assert.deepEqual(JSON.parse(d.memory.get(key)).state.storyProgress[id].completed, ['meet'])
    } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
  })

  test(`${id}: chapters 2–4 and the quiz keep their original interaction gates and reward flow`, async () => {
    const d = device(seed(id, false)); globalThis.__saveStore = await freshStore(); const f = fixture(id, 1)
    try {
      f.click('NEXT CHAPTER'); assert.equal(nextChapter(f).props.disabled, false)
      assert.ok(f.text().includes('EXPLORE OR CONTINUE'))
      f.click(ui.machineStories[id].journey[0].label); f.click('NEXT CHAPTER')
      assert.equal(globalThis.__saveRoute.chapter, '3'); assert.equal(nextChapter(f).props.disabled, false)
      f.click(ui.machineStories[id].challenges[0].title); f.click('NEXT CHAPTER')
      assert.equal(globalThis.__saveRoute.chapter, '4'); assert.equal(nextChapter(f).props.disabled, false)
      f.click(ui.machineStories[id].legacy[0].year); f.click('NEXT CHAPTER')
      const complete = () => f.all(n => n.type === 'button' && text(n).includes('COMPLETE STORY'))[0]
      assert.equal(globalThis.__saveRoute.chapter, '5'); assert.equal(complete().props.disabled, true)
      assert.deepEqual(JSON.parse(d.memory.get(key)).state.badges, ['previous-badge'])
      ui.machineStories[id].quiz.forEach((q, i) => {
        assert.equal(complete().props.disabled, true)
        f.answer(q.answer); assert.equal(complete().props.disabled, true); f.click(i < 2 ? 'NEXT QUESTION' : 'View Results')
      })
      assert.equal(complete().props.disabled, false); f.click('COMPLETE STORY')
      const saved = JSON.parse(d.memory.get(key)).state
      assert.equal(saved.storyProgress[id].completedMission, true)
      assert.deepEqual(saved.badges, ['previous-badge', `${id}-storyteller`])
    } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
  })

  test(`${id}: immediate Meet Me navigation retains the save warning and working Retry saving`, async () => {
    const d = device(seed(id, false)), store = globalThis.__saveStore = await freshStore(), f = fixture(id, 1)
    try {
      const before = d.memory.get(key); d.reject(true); f.click('NEXT CHAPTER')
      assert.equal(globalThis.__saveRoute.chapter, '2'); assert.equal(warning(f).length, 1)
      assert.equal(d.memory.get(key), before); assert.equal(confirmation(f).length, 0)
      assert.deepEqual(store.useProgress.getState().storyProgress[id].completed, ['meet'])
      f.click('Retry saving'); assert.equal(warning(f).length, 1); assert.equal(nextChapter(f).props.disabled, false)
      d.reject(false); f.click('Retry saving')
      assert.equal(warning(f).length, 0); assert.equal(confirmation(f).length, 1)
      const saved = JSON.parse(d.memory.get(key)).state
      assert.deepEqual(saved.storyProgress[id], { completed: ['meet'], lastChapter: 2, completedMission: false })
      assert.deepEqual(saved.badges, ['previous-badge']); assert.equal(nextChapter(f).props.disabled, false)
    } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
  })

  test(`${id}: successful completion/reload uses the same schema and one badge; quiz retry leaves saved data intact`, async () => {
    const initial = seed(id), d = device(initial), store = globalThis.__saveStore = await freshStore(), f = fixture(id)
    try {
      const before = d.memory.get(key); finishQuiz(f, id); assert.equal(d.memory.get(key), before)
      f.click('COMPLETE STORY')
      assert.equal(warning(f).length, 0); assert.equal(confirmation(f).length, 1)
      assert.ok(f.text().includes('Badge saved on this device'))
      const saved = JSON.parse(d.memory.get(key))
      assert.equal(saved.version, 0); assert.deepEqual(Object.keys(saved.state).sort(), Array.from(new Set([...Object.keys(initial),'roverJourneys'])).sort())
      assertOtherProgress(saved.state, initial); assert.equal(saved.state.storyProgress[id].completedMission, true)
      assert.deepEqual(saved.state.badges, ['previous-badge', `${id}-storyteller`])
      const snapshot = d.memory.get(key); f.click('TRY AGAIN'); assert.equal(d.memory.get(key), snapshot)
      assert.ok(f.text().includes('QUESTION 1 / 3'))
      f.click('COMPLETE STORY'); assert.equal(d.memory.get(key), snapshot)
      const reload = await freshStore(); assert.deepEqual(reload.useProgress.getState().storyProgress, saved.state.storyProgress)
      assert.deepEqual(reload.useProgress.getState().badges, saved.state.badges)
      assert.equal(store.useProgressPersistence.getState().status, 'saved')
    } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
  })

  test(`${id}: rejected saves and repeated retries preserve the quiz; recovery persists the latest full snapshot without duplicates`, async () => {
    const initial = seed(id), d = device(initial), store = globalThis.__saveStore = await freshStore(), f = fixture(id)
    try {
      d.reject(true); const before = d.memory.get(key); finishQuiz(f, id); f.click('COMPLETE STORY')
      assert.equal(d.memory.get(key), before); assert.equal(warning(f).length, 1); assert.equal(confirmation(f).length, 0)
      assert.ok(f.text().includes('complete in this session')); assert.ok(f.text().includes('Badge unlocked in this session · not saved'))
      assert.equal(store.useProgress.getState().storyProgress[id].completedMission, true)
      const focused = f.focused(); assert.ok(focused); assert.equal(f.refs.get(focused).scroll.behavior, 'instant')
      for (let i = 1; i <= 2; i++) {
        f.click('Retry saving'); assert.ok(f.text().includes(`Save retry ${i} failed`)); assert.equal(d.memory.get(key), before)
        assert.equal(confirmation(f).length, 0); assert.ok(f.text().includes('You scored 3 / 3'))
      }
      store.useProgress.getState().inspectInstrument('session-instrument')
      const beforeRecovery = structuredClone(JSON.parse(JSON.stringify(store.useProgress.getState())))
      d.reject(false); f.click('Retry saving')
      assert.equal(warning(f).length, 0); assert.equal(confirmation(f).length, 1)
      assert.equal(f.questionClicks(), 3); assert.ok(f.text().includes('You scored 3 / 3'))
      const saved = JSON.parse(d.memory.get(key)); assert.deepEqual(saved.state, beforeRecovery)
      assert.deepEqual(saved.state.badges, ['previous-badge', `${id}-storyteller`]); assertOtherProgress(saved.state, initial)
      assert.deepEqual(saved.state.inspectedInstruments, ['supercam', 'session-instrument'])
      const afterRecovery = d.memory.get(key); f.click('COMPLETE STORY'); assert.equal(d.memory.get(key), afterRecovery)
      assert.deepEqual((await freshStore()).useProgress.getState().storyProgress[id], saved.state.storyProgress[id])
    } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
  })

  test(`${id}: a badge-only write failure never confirms a saved badge`, async () => {
    const d = device(seed(id)), store = globalThis.__saveStore = await freshStore(), f = fixture(id)
    try {
      d.rejectBadge(true); finishQuiz(f, id); f.click('COMPLETE STORY')
      const disk = JSON.parse(d.memory.get(key)).state
      assert.equal(disk.storyProgress[id].completedMission, true); assert.deepEqual(disk.badges, ['previous-badge'])
      assert.equal(confirmation(f).length, 0); assert.equal(warning(f).length, 1)
      assert.ok(f.text().includes('Badge unlocked in this session · not saved'))
      d.rejectBadge(false); f.click('Retry saving')
      assert.deepEqual(JSON.parse(d.memory.get(key)).state.badges, ['previous-badge', `${id}-storyteller`])
      assert.equal(confirmation(f).length, 1); assert.equal(store.useProgressPersistence.getState().status, 'saved')
    } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
  })

  test(`${id}: intermediate chapter failures remain visible after navigation; retry saves the latest chapter position`, async () => {
    const initial = seed(id, false), d = device(initial), store = globalThis.__saveStore = await freshStore(), f = fixture(id, 1)
    try {
      d.reject(true); const before = d.memory.get(key)
      f.click('MY NAME'); f.click('NEXT CHAPTER')
      assert.equal(globalThis.__saveRoute.chapter, '2'); assert.equal(warning(f).length, 1); assert.equal(confirmation(f).length, 0)
      assert.equal(d.memory.get(key), before)
      f.click(id === 'apollo-15-rover' ? 'Launch & Landing' : 'LAUNCH'); f.click('NEXT CHAPTER')
      assert.equal(globalThis.__saveRoute.chapter, '3'); assert.equal(warning(f).length, 1)
      assert.deepEqual(store.useProgress.getState().storyProgress[id].completed, ['meet', 'journey'])
      d.reject(false); f.click('Retry saving')
      assert.equal(warning(f).length, 0); assert.equal(confirmation(f).length, 1)
      const saved = JSON.parse(d.memory.get(key)).state
      assert.equal(saved.storyProgress[id].lastChapter, 3); assert.equal(saved.storyProgress[id].completedMission, false)
      assert.deepEqual(saved.badges, ['previous-badge']); assertOtherProgress(saved, initial)
      assert.deepEqual((await freshStore()).useProgress.getState().storyProgress[id], saved.storyProgress[id])
    } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
  })
}

test('unreadable existing records stay protected; Apollo offers reload rather than an unsafe retry write', async () => {
  const d = device(seed('apollo-15-rover')), before = d.memory.get(key)
  window.localStorage.getItem = () => { throw new DOMException('Read blocked', 'SecurityError') }
  globalThis.__saveStore = await freshStore()
  const f = fixture('apollo-15-rover', 1)
  try {
    assert.equal(warning(f).length, 1); assert.ok(f.text().includes('Saving is paused to protect it'))
    assert.equal(f.all(n => n.type === 'button' && text(n) === 'Retry saving').length, 0)
    f.click('Reload saved progress'); assert.equal(d.reloads(), 1); assert.equal(d.writes(), 0); assert.equal(d.memory.get(key), before)
  } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
})

for (const id of ['apollo-15-rover', 'apollo-17-rover']) {
  test(`${id}: regression: final completion reconciles four genuinely completed legacy chapters`, async () => {
    const initial = seed(id); delete initial.storyProgress[id]
    const d = device(initial); globalThis.__saveStore = await freshStore(); const f = fixture(id)
    try {
      assert.equal(d.writes(), 0, 'loading old data must not rewrite it')
      assertDashboard(id, 4, 5, false)
      finishQuiz(f, id); f.click('COMPLETE STORY')
      const saved = JSON.parse(d.memory.get(key)).state
      assert.deepEqual(saved.storyProgress[id].completed, chapters)
      assert.equal(saved.storyProgress[id].completedMission, true)
      assert.deepEqual(saved.badges, ['previous-badge', `${id}-storyteller`])
      assertOtherProgress(saved, initial)
      assert.equal(confirmation(f).length, 1)
      assertDashboard(id, 5, 6, true)
    } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
  })

  test(`${id}: mixed progress merges only its known chapters and stays correct after reload and repeated completion`, async () => {
    const initial = seed(id)
    initial.storyProgress[id].completed = ['meet', 'challenges']
    initial.completedChapters = [`${id}:journey`, `${id}:legacy`, 'follow-perseverance:meet']
    const other = id === 'apollo-15-rover' ? 'apollo-17-rover' : 'apollo-15-rover'
    initial.completedChapters.push(`${other}:meet`, `${other}:journey`)
    initial.storyProgress[other] = { completed: ['meet'], lastChapter: 2, completedMission: false }
    const d = device(initial); globalThis.__saveStore = await freshStore()
    // Hydrate again before finishing: no migration on read and no lost modern data.
    globalThis.__saveStore = await freshStore(); const f = fixture(id)
    try {
      assert.equal(d.writes(), 0); assertDashboard(id, 4, 7, false)
      finishQuiz(f, id); f.click('COMPLETE STORY')
      const saved = JSON.parse(d.memory.get(key))
      assert.equal(saved.version, 0); assert.deepEqual(Object.keys(saved.state).sort(), Array.from(new Set([...Object.keys(initial),'roverJourneys'])).sort())
      assert.deepEqual([...saved.state.storyProgress[id].completed].sort(), [...chapters].sort())
      assert.equal(saved.state.storyProgress[id].completedMission, true); assert.equal(saved.state.storyProgress[id].lastChapter, 5)
      assert.deepEqual(saved.state.storyProgress[other], initial.storyProgress[other])
      assert.deepEqual(saved.state.completedChapters, [...initial.completedChapters, `${id}:quiz`], 'keep the original legacy array; modern-only prerequisites need no replay')
      assertOtherProgress(saved.state, initial); assertDashboard(id, 5, 8, true)
      const snapshot = d.memory.get(key); f.click('COMPLETE STORY'); assert.equal(d.memory.get(key), snapshot)
      globalThis.__saveStore = await freshStore(); f.render(); f.click('COMPLETE STORY')
      assert.equal(d.memory.get(key), snapshot); assert.deepEqual(globalThis.__saveStore.useProgress.getState().badges, ['previous-badge', `${id}-storyteller`])
    } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
  })

  test(`${id}: modern-only progress completes without replaying prerequisites or rewriting on load`, async () => {
    const initial = seed(id); initial.completedChapters = ['follow-perseverance:meet']
    const d = device(initial); globalThis.__saveStore = await freshStore(); const f = fixture(id)
    try {
      assert.equal(d.writes(), 0); assertDashboard(id, 4, 5, false)
      finishQuiz(f, id); f.click('COMPLETE STORY')
      assert.equal(d.writes(), 2, 'only the quiz and badge use existing save actions')
      const saved = JSON.parse(d.memory.get(key)).state
      assert.deepEqual(saved.storyProgress[id], { completed: chapters, lastChapter: 5, completedMission: true })
      assert.deepEqual(saved.completedChapters, ['follow-perseverance:meet', `${id}:quiz`])
      assertOtherProgress(saved, initial); assertDashboard(id, 5, 6, true)
      assert.deepEqual((await freshStore()).useProgress.getState().storyProgress[id], saved.storyProgress[id])
    } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
  })

  test(`${id}: an already completed legacy mission and badge reconcile without quiz repetition or duplicate rewards`, async () => {
    const initial = seed(id); delete initial.storyProgress[id]
    initial.completedChapters.push(`${id}:quiz`, `${id}:retired-step`)
    initial.badges.push(`${id}-storyteller`)
    const d = device(initial); globalThis.__saveStore = await freshStore(); const f = fixture(id)
    try {
      assert.equal(d.writes(), 0); assertDashboard(id, 5, 6, true)
      f.click('COMPLETE STORY')
      const saved = JSON.parse(d.memory.get(key)).state
      assert.deepEqual(saved.storyProgress[id], { completed: chapters, lastChapter: 5, completedMission: true })
      assert.deepEqual(saved.completedChapters, initial.completedChapters, 'retain historical/unknown entries without counting them as modern chapters')
      assert.deepEqual(saved.badges, initial.badges); assert.equal(f.questionClicks(), 0)
      const snapshot = d.memory.get(key); f.click('COMPLETE STORY'); assert.equal(d.memory.get(key), snapshot)
      const reload = await freshStore(); assert.deepEqual(reload.useProgress.getState().storyProgress[id], saved.storyProgress[id])
    } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
  })

  test(`${id}: badges, other missions and incomplete records never imply missing chapter completion`, async () => {
    for (const partial of [false, true]) {
      const initial = seed(id, false), other = id === 'apollo-15-rover' ? 'apollo-17-rover' : 'apollo-15-rover'
      initial.badges.push(`${id}-storyteller`)
      initial.completedChapters.push(...chapters.map(ch => `${other}:${ch}`))
      if (partial) {
        initial.storyProgress[id] = { completed: ['meet', 'journey', 'quiz'], lastChapter: 5, completedMission: false }
        initial.completedChapters.push(`${id}:legacy`)
      }
      const d = device(initial); globalThis.__saveStore = await freshStore(); const f = fixture(id)
      try {
        assert.equal(globalThis.__saveRoute.chapter, partial ? '3' : '1')
        assert.equal(d.writes(), 0); assert.equal(d.memory.get(key), JSON.stringify({ state: initial, version: 0 }))
        assert.deepEqual(globalThis.__saveStore.useProgress.getState().storyProgress, initial.storyProgress)
        assert.deepEqual(globalThis.__saveStore.useProgress.getState().badges, initial.badges)
        assert.ok(!globalThis.__saveStore.useProgress.getState().storyProgress[id]?.completedMission)
      } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
    }
  })

  for (const failure of ['all', 'badge']) test(`${id}: legacy reconciliation survives ${failure} write rejection and Retry saving`, async () => {
    const initial = seed(id); initial.storyProgress[id].completed = ['meet']
    const d = device(initial); const store = globalThis.__saveStore = await freshStore(); const f = fixture(id)
    try {
      const before = d.memory.get(key)
      if (failure === 'all') d.reject(true); else d.rejectBadge(true)
      finishQuiz(f, id); f.click('COMPLETE STORY')
      assert.equal(store.useProgress.getState().storyProgress[id].completedMission, true)
      assert.deepEqual(store.useProgress.getState().storyProgress[id].completed, chapters)
      assert.equal(warning(f).length, 1); assert.equal(confirmation(f).length, 0)
      const disk = JSON.parse(d.memory.get(key)).state
      if (failure === 'all') { assert.equal(d.memory.get(key), before); assert.equal(disk.storyProgress[id].completedMission, false) }
      else { assert.equal(disk.storyProgress[id].completedMission, true); assert.deepEqual(disk.badges, ['previous-badge']) }
      const stillSaved = d.memory.get(key); f.click('Retry saving'); f.click('Retry saving')
      assert.equal(d.memory.get(key), stillSaved); assert.equal(warning(f).length, 1)
      const reloadBeforeRecovery = await freshStore()
      assert.deepEqual(reloadBeforeRecovery.useProgress.getState().storyProgress[id], disk.storyProgress[id])
      d.reject(false); d.rejectBadge(false); f.click('Retry saving')
      assert.equal(warning(f).length, 0); assert.equal(confirmation(f).length, 1); assert.equal(f.questionClicks(), 3)
      assert.ok(f.text().includes('You scored 3 / 3'))
      const saved = JSON.parse(d.memory.get(key)).state
      assert.deepEqual(saved.storyProgress[id], { completed: chapters, lastChapter: 5, completedMission: true })
      assert.deepEqual(saved.badges, ['previous-badge', `${id}-storyteller`]); assertOtherProgress(saved, initial)
      const snapshot = d.memory.get(key); f.click('COMPLETE STORY'); assert.equal(d.memory.get(key), snapshot)
      assert.deepEqual((await freshStore()).useProgress.getState().storyProgress[id], saved.storyProgress[id])
      assertDashboard(id, 5, 6, true)
    } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
  })
}

test('Apollo completion and historical Perseverance remain protected apart from the exact Moon QA registration seams', () => {
  const source = readFileSync(`${root}/src/components/MachineStoryPage.tsx`, 'utf8').replace(/\r\n/g, '\n')
  const prior = execFileSync('git', ['show', 'e6a2f14:src/components/MachineStoryPage.tsx'], { cwd: root, encoding: 'utf8' }).replace(/\r\n/g, '\n')
  assert.equal(withBaselineApolloQuiz(source, prior), prior)
  for (const path of ['src/store.ts', 'src/components/storytelling/PerseveranceCompletion.tsx', 'src/components/storytelling/PerseveranceQuiz.tsx', 'src/machineStories.ts', 'src/data.ts']) {
    assert.equal(beforeMoonScope(readFileSync(`${root}/${path}`, 'utf8').replace(/\r\n/g, '\n')), execFileSync('git', ['show', `7326570:${path}`], { cwd: root, encoding: 'utf8' }).replace(/\r\n/g, '\n'), path)
  }
  const css = postcss.parse(readFileSync(`${root}/src/components/storytelling/ApolloProgressSaveStatus.module.css`, 'utf8'))
  for (const text of ['min-height: 44px', 'focus-visible', 'max-width: 600px', 'overflow-wrap: anywhere']) assert.ok(css.toString().includes(text))
  assert.ok(!/animation:|transition:/.test(css.toString()))
})


test('Apollo 15 pilot starts at Meet Me, selects evidence/recording through explicit steps and real scroll without writes', async () => {
  const initial = seed('apollo-15-rover', false), d = device(initial)
  globalThis.__saveStore = await freshStore(); const f = fixture('apollo-15-rover', 1)
  try {
    assert.ok(f.text().includes('Meet Me')); assert.equal(f.focused(), 'apollo15-chapter-1')
    const recording = () => f.all(n => n.props['data-recording-src'])[0].props['data-recording-src']
    assert.equal(recording(), '/audio/apollo-15/chapter-1/1.mp3')
    f.click('Next segment'); assert.equal(f.focused(), 'apollo15-step-0-1')
    assert.equal(recording(), '/audio/apollo-15/chapter-1/2.mp3')
    assert.ok(f.all(n => n.props['data-step-media'] === 'field').length)
    f.refs.get('apollo15-step-0-2').rect = { top: 200, bottom: 600 }
    d.scroll(300); f.render()
    assert.equal(recording(), '/audio/apollo-15/chapter-1/3.mp3')
    assert.ok(f.all(n => n.props['data-step-media'] === 'rollout').length)
    assert.equal(d.writes(), 0); assert.deepEqual(globalThis.__saveStore.useProgress.getState().badges, initial.badges)
  } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
  assert.equal([...d.listeners.values()].reduce((sum, set) => sum + set.size, 0), 0)
})

test('Apollo 15 scroll chapter advancement uses the existing save/recovery path and can be disabled; quiz never auto-completes', async () => {
  const initial = seed('apollo-15-rover', false), d = device(initial)
  globalThis.__saveStore = await freshStore(); const f = fixture('apollo-15-rover', 1)
  try {
    f.click('Next segment'); f.click('Next segment'); f.click('Next segment')
    f.refs.get('apollo15-chapter-boundary').rect = { top: 500, bottom: 600 }
    d.scroll(20); f.render(); assert.equal(f.navigations.length, 0, 'programmatic scrolling is not a completion gesture')
    d.reject(true); d.emit('wheel', { deltaY: 100 }); d.scroll(100); f.render()
    assert.deepEqual(f.navigations, ['/story/apollo-15-rover/2']); assert.equal(warning(f).length, 1)
    assert.deepEqual(globalThis.__saveStore.useProgress.getState().storyProgress['apollo-15-rover'].completed, ['meet'])
    d.reject(false); f.click('Retry saving'); assert.equal(warning(f).length, 0)
    f.all(n => n.type === 'input' && n.props.type === 'checkbox')[0].props.onChange({ target: { checked: false } }); f.render()
    f.click('Next segment'); f.click('Next segment'); f.click('Next segment')
    f.refs.get('apollo15-chapter-boundary').rect = { top: 500, bottom: 600 }
    d.emit('wheel', { deltaY: 100 }); d.scroll(200); f.render(); assert.equal(f.navigations.length, 1)
    f.click('NEXT CHAPTER'); f.click('NEXT CHAPTER'); f.click('NEXT CHAPTER')
    assert.equal(globalThis.__saveRoute.chapter, '5')
    assert.equal(f.all(n => n.props.id === 'apollo15-chapter-boundary').length, 0)
    d.emit('wheel', { deltaY: 100 }); d.scroll(1000); f.render()
    assert.equal(f.all(n => n.type === 'button' && text(n).includes('COMPLETE STORY'))[0].props.disabled, true)
    assert.deepEqual(globalThis.__saveStore.useProgress.getState().badges, initial.badges)
    const saved = JSON.parse(d.memory.get(key)).state
    assert.deepEqual(saved.storyProgress['apollo-15-rover'].completed, chapters.slice(0,4)); assertOtherProgress(saved, initial)
  } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
})

test('Apollo 15 mobile reading retains every script, evidence caption and source; optional discovery activity stays independent of persistence', async () => {
  const initial = seed('apollo-15-rover'), d = device(initial)
  window.matchMedia = query => ({ matches: query.includes('max-width'), addEventListener(){}, removeEventListener(){} })
  globalThis.__saveStore = await freshStore(); const f = fixture('apollo-15-rover', 3)
  try {
    assert.equal(f.all(n => n.type === 'figure' && n.props['data-step-media']).length, 4, 'documentary evidence in all four mobile steps')
    assert.equal(f.all(n => n.type === 'figure' && n.props['data-hardware-kind'] === 'lunar-rover').length, 1, 'separate historical hardware presentation')
    assert.ok(f.text().includes('This shows fieldwork, not the steering failure itself.'))
    for (const item of ui.machineStories['apollo-15-rover'].discoveries) {
      f.all(n => n.type === 'button' && n.props['aria-expanded'] !== undefined && text(n).includes(item.title))[0].props.onClick(); f.render(); assert.ok(f.text().includes(item.detail))
    }
    assert.ok(f.all(n => n.type === 'a' && /images.nasa.gov/.test(n.props.href ?? '')).length)
    assert.equal(d.writes(), 0)
  } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
})


test('Apollo 15 pilot respects reduced motion for quiz feedback and preserves storage-warning focus', async () => {
  const d = device(seed('apollo-15-rover')); window.matchMedia = () => ({ matches: true, addEventListener(){}, removeEventListener(){} })
  globalThis.__saveStore = await freshStore()
  const beforeDocument = globalThis.document
  globalThis.document = { activeElement: { closest: () => ({ role: 'alert' }) } }
  const f = fixture('apollo-15-rover', 5)
  try {
    assert.equal(f.focused(), null, 'route heading does not override an existing recovery warning')
    f.answer(1)
    const feedback = f.all(n => n.props.className === 'quiz-explanation')[0]
    assert.equal(feedback.props.initial, false); assert.deepEqual(feedback.props.transition, { duration: 0 })
    assert.equal(f.focused(), 'apollo-15-rover-quiz-feedback'); assert.equal(d.writes(), 0)
  } finally { f.dispose(); globalThis.document = beforeDocument; delete globalThis.__saveStore; delete globalThis.window }
})


test('Apollo 17 scroll presentation selects chapter evidence with no progress writes and preserves focused explicit steps', async () => {
  const initial=seed('apollo-17-rover'),d=device(initial);globalThis.__saveStore=await freshStore();const f=fixture('apollo-17-rover',2)
  try {
    assert.equal(f.focused(),'apollo17-chapter-2')
    assert.ok(f.all(n=>n.props['data-step-media']==='launch').length)
    f.click('Next segment');assert.equal(f.focused(),'apollo17-step-1-1')
    assert.ok(f.text().includes('No direct photograph is selected for this segment'))
    f.refs.get('apollo17-step-1-3').rect={top:200,bottom:600};d.scroll(300);f.render()
    assert.ok(f.all(n=>n.props['data-step-media']==='rover').length)
    assert.equal(d.writes(),0);assert.deepEqual(globalThis.__saveStore.useProgress.getState().badges,initial.badges)
  }finally{f.dispose();delete globalThis.__saveStore;delete globalThis.window}
  assert.equal([...d.listeners.values()].reduce((sum,set)=>sum+set.size,0),0)
})

test('Apollo 17 scroll completion preserves save rejection/recovery, opt-out and explicit quiz conditions', async () => {
  const initial=seed('apollo-17-rover',false),d=device(initial);globalThis.__saveStore=await freshStore();const f=fixture('apollo-17-rover',1)
  try {
    for(let i=0;i<3;i++)f.click('Next segment')
    f.refs.get('apollo17-chapter-boundary').rect={top:500,bottom:600}
    d.scroll(20);f.render();assert.equal(f.navigations.length,0)
    d.reject(true);d.emit('wheel',{deltaY:100});d.scroll(100);f.render()
    assert.deepEqual(f.navigations,['/story/apollo-17-rover/2']);assert.equal(warning(f).length,1)
    assert.deepEqual(globalThis.__saveStore.useProgress.getState().storyProgress['apollo-17-rover'].completed,['meet'])
    d.reject(false);f.click('Retry saving');assert.equal(warning(f).length,0)
    f.all(n=>n.type==='input'&&n.props.type==='checkbox')[0].props.onChange({target:{checked:false}});f.render()
    for(let i=0;i<3;i++)f.click('Next segment')
    f.refs.get('apollo17-chapter-boundary').rect={top:500,bottom:600};d.emit('wheel',{deltaY:100});d.scroll(200);f.render()
    assert.equal(f.navigations.length,1);f.click('NEXT CHAPTER');f.click('NEXT CHAPTER');f.click('NEXT CHAPTER')
    assert.equal(globalThis.__saveRoute.chapter,'5');assert.equal(f.all(n=>n.props.id==='apollo17-chapter-boundary').length,0)
    assert.ok(f.all(n=>n.type==='button'&&text(n).includes('COMPLETE STORY'))[0].props.disabled)
    assert.deepEqual(globalThis.__saveStore.useProgress.getState().badges,initial.badges)
    const saved=JSON.parse(d.memory.get(key)).state;assertOtherProgress(saved,initial)
    assert.deepEqual(saved.storyProgress['apollo-17-rover'].completed,chapters.slice(0,4))
  }finally{f.dispose();delete globalThis.__saveStore;delete globalThis.window}
})


for (const prediction of ['hammer', 'together', 'feather']) {
  test(`RC: Apollo 15 optional activity (${prediction}) stays independent of recording, chapter progress, storage errors and navigation`, async () => {
    const id = 'apollo-15-rover', initial = seed(id)
    initial.storyProgress[id] = { completed: chapters.slice(0, 3), lastChapter: 4, completedMission: false }
    initial.completedChapters = initial.completedChapters.filter(c => c !== `${id}:legacy`)
    const d = device(initial); globalThis.__saveStore = await freshStore(); const f = fixture(id, 4)
    try {
      const before = d.memory.get(key), recording = () => f.all(n => n.props['data-recording-src'])[0].props['data-recording-src']
      assert.equal(recording(), '/audio/apollo-15/chapter-4/1.mp3')
      assert.equal(f.all(n => n.type === 'input' && n.props.type === 'radio').length, 3)
      assert.equal(nextChapter(f).props.disabled, false, 'activity is never a completion gate')
      f.all(n => n.type === 'input' && n.props.value === prediction)[0].props.onChange(); f.render()
      assert.ok(!f.text().includes('What was observed?'), 'choosing alone does not reveal evidence')
      d.reject(true)
      let prevented = false
      f.all(n => n.type === 'form')[0].props.onSubmit({ preventDefault() { prevented = true } }); f.render()
      assert.equal(prevented, true)
      assert.ok(f.text().includes('What was observed?'))
      assert.ok(f.text().includes(prediction === 'together' ? 'Your prediction matches' : 'Let the evidence refine'))
      const feedback = f.all(n => n.type === 'h3' && n.props.id?.endsWith('-feedback'))[0]
      assert.equal(f.focused(), feedback.props.id)
      assert.ok(f.all(n => n.type === 'a' && n.props.href === 'https://science.nasa.gov/resource/the-apollo-15-hammer-feather-drop/').length)
      assert.equal(d.writes(), 0); assert.equal(d.memory.get(key), before); assert.equal(warning(f).length, 0)
      assert.equal(recording(), '/audio/apollo-15/chapter-4/1.mp3'); assert.equal(f.navigations.length, 0)
      f.click('Try another prediction'); assert.equal(f.all(n => n.type === 'input' && n.props.type === 'radio' && n.props.checked).length, 0)
      assert.equal(d.writes(), 0); d.reject(false); f.click('NEXT CHAPTER')
      assert.equal(globalThis.__saveRoute.chapter, '5')
      assert.equal(f.all(n => n.type === 'input' && n.props.type === 'radio').length, 0)
      assert.equal(f.all(n => n.type === 'button' && text(n).includes('COMPLETE STORY'))[0].props.disabled, true)
      const saved = JSON.parse(d.memory.get(key)).state
      assert.deepEqual(saved.storyProgress[id].completed, chapters.slice(0, 4)); assertOtherProgress(saved, initial)
      assert.deepEqual(saved.badges, initial.badges)
    } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window }
  })
}

// Public Apollo 11 route: actual shared completion/store actions, no historical
// route override. A stationary experiment receives the same reliable save flow.
test('Apollo 11 progresses from Meet Me without mandatory activity and surfaces intermediate save failures', async () => {
  const id='apollo-11-reflector',initial=seed(id,false),d=device(initial)
  globalThis.__saveStore=await freshStore();const f=fixture(id,1)
  try {
    assert.equal(f.focused(),'apollo11-chapter-1');assert.equal(nextChapter(f).props.disabled,false)
    assert.ok(f.text().includes('stationary')||f.text().includes('STATIONARY'))
    d.reject(true);f.click('NEXT CHAPTER');assert.deepEqual(f.navigations,[`/story/${id}/2`])
    assert.equal(warning(f).length,1);assert.equal(confirmation(f).length,0)
    f.click('Retry saving');f.click('Retry saving');assert.equal(warning(f).length,1)
    d.reject(false);f.click('Retry saving');assert.equal(warning(f).length,0)
    f.click('NEXT CHAPTER');f.click('NEXT CHAPTER');f.click('NEXT CHAPTER')
    assert.equal(globalThis.__saveRoute.chapter,'5')
    assert.equal(f.all(n=>n.type==='button'&&text(n).includes('COMPLETE STORY'))[0].props.disabled,true)
    const state=JSON.parse(d.memory.get(key)).state
    assert.deepEqual(state.storyProgress[id].completed,chapters.slice(0,4));assertOtherProgress(state,initial)
    assert.deepEqual(state.badges,initial.badges)
  }finally{f.dispose();delete globalThis.__saveStore;delete globalThis.window}
})

test('Apollo 11 recorded quiz keeps final feedback, scores an imperfect attempt and retries without erasing progress',async()=>{
  const id='apollo-11-reflector',initial=seed(id),d=device(initial)
  globalThis.__saveStore=await freshStore();const f=fixture(id,5)
  try{
    const before=d.memory.get(key)
    for(let i=0;i<3;i++){
      assert.equal(f.all(n=>n.props['data-review-omitted-recording'])[0].props['data-review-omitted-recording'],`/audio/apollo-11/chapter-5/${i+1}.mp3`)
      assert.equal(f.all(n=>n.props['data-recording-src']).length,0,'no unavailable audio player in review')
      f.answer(i===0?1:0)
      assert.equal(f.focused(),`${id}-quiz-feedback`)
      assert.ok(f.text().includes(ui.machineStories[id].quiz[i].explanation))
      if(i<2)f.click('NEXT QUESTION')
    }
    assert.ok(!f.text().includes('You scored'));assert.equal(d.memory.get(key),before)
    f.click('View Results');assert.equal(f.focused(),`${id}-quiz-results`);assert.ok(f.text().includes('You scored 1 / 3'))
    assert.equal(d.memory.get(key),before)
    f.click('TRY AGAIN');assert.equal(f.focused(),`${id}-quiz-question`)
    assert.equal(d.memory.get(key),before);assert.deepEqual(globalThis.__saveStore.useProgress.getState().badges,initial.badges)
    finishQuiz(f,id);f.click('COMPLETE STORY')
    const saved=JSON.parse(d.memory.get(key)).state
    assert.equal(saved.storyProgress[id].completedMission,true);assertOtherProgress(saved,initial)
    assert.deepEqual(saved.badges,[...initial.badges,`${id}-storyteller`])
    f.click('COMPLETE STORY');assert.equal(d.memory.get(key),JSON.stringify({state:saved,version:0}))
    assert.deepEqual((await freshStore()).useProgress.getState().storyProgress[id],saved.storyProgress[id])
  }finally{f.dispose();delete globalThis.__saveStore;delete globalThis.window}
})

test('Apollo 11 failed final save retries the complete latest snapshot without duplicate rewards or answering again',async()=>{
  const id='apollo-11-reflector',initial=seed(id),d=device(initial)
  globalThis.__saveStore=await freshStore();const f=fixture(id,5)
  try{
    finishQuiz(f,id);const before=d.memory.get(key);d.reject(true);f.click('COMPLETE STORY')
    assert.equal(d.memory.get(key),before);assert.equal(warning(f).length,1);assert.equal(confirmation(f).length,0)
    assert.ok(f.text().includes('complete in this session'))
    f.click('Retry saving');f.click('Retry saving');assert.equal(warning(f).length,1)
    d.reject(false);f.click('Retry saving');assert.equal(warning(f).length,0);assert.equal(confirmation(f).length,1)
    assert.equal(f.questionClicks(),3)
    const saved=JSON.parse(d.memory.get(key)).state
    assert.deepEqual(saved.storyProgress[id],{completed:chapters,lastChapter:5,completedMission:true})
    assert.deepEqual(saved.badges,[...initial.badges,`${id}-storyteller`]);assertOtherProgress(saved,initial)
    f.click('COMPLETE STORY');assert.equal(saved.badges.filter(b=>b===`${id}-storyteller`).length,1)
  }finally{f.dispose();delete globalThis.__saveStore;delete globalThis.window}
})
