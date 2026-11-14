import { beforeMoonScope } from './helpers/moon-scope-contract.mjs'
import { historicalPerseverance } from './helpers/historical-perseverance.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { build } from 'esbuild'
import postcss from 'postcss'
import React from 'react'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
async function bundle(contents, plugins = []) {
  const result = await build({ stdin: { contents, resolveDir: root, sourcefile: 'quiz-check.tsx' }, bundle: true, write: false,
    outfile: `${root}/.quiz-check.cjs`, platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic', loader: { '.css': 'local-css' }, plugins: [...plugins, ...(contents.includes('MachineStoryPage') ? [historicalPerseverance] : [])], logLevel: 'silent' })
  const module = { exports: {} }
  new Function('require', 'module', 'exports', result.outputFiles.find(f => f.path.endsWith('.cjs')).text)(require, module, module.exports)
  return module.exports
}
globalThis.__quizReact = React
const hooksPlugin = { name: 'quiz-hooks', setup(build) {
  build.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'quiz-hooks' }))
  build.onLoad({ filter: /.*/, namespace: 'quiz-hooks' }, () => ({ loader: 'js', contents: `
    export const Component=globalThis.__quizReact.Component,Suspense=globalThis.__quizReact.Suspense;
    export const lazy=()=>()=>null;
    export const useId=()=>{const cell=globalThis.__quizHooks.ref(null);return cell.current??=("host-id-"+(globalThis.__releaseHookId=(globalThis.__releaseHookId??0)+1))};
    export const useLayoutEffect=(...a)=>useEffect(...a);export const useState=(...a)=>globalThis.__quizHooks.state(...a);
    export const useRef=(...a)=>globalThis.__quizHooks.ref(...a);
    export const useEffect=(...a)=>globalThis.__quizHooks.effect(...a);
    export const useReducer=(...a)=>globalThis.__quizHooks.reducer(...a);
    export const useMemo=(...a)=>globalThis.__quizHooks.memo(...a);
    export const useCallback=(fn,deps)=>globalThis.__quizHooks.memo(()=>fn,deps);` }))
} }
const api = await bundle(`export {default as Quiz} from './src/components/storytelling/PerseveranceQuiz';
  export * from './src/features/storytelling/quizAttempt'; export * from './src/features/storytelling/quizLearning'; export {machineStories} from './src/machineStories';`, [hooksPlugin])
const story = api.machineStories['follow-perseverance'], questions = story.quiz
const text = node => Array.isArray(node) ? node.map(text).join('') : typeof node === 'object' && node ? text(node.children) : String(node ?? '')

// Executes real components, reducers, handlers and effects. Native browser radio
// key handling and actual screen-reader output remain manual acceptance checks.
function fixture({ reduced = false, saved = false, Page = null } = {}) {
  const instances = new Map(), refs = new Map()
  let current, cursor, pending = [], dirty = false, tree, visited, completed = 0, retried = 0, ready = false, lastFocus = null
  const query = { matches: reduced, addEventListener(_, fn) { this.change = fn }, removeEventListener() {} }
  globalThis.window = { ...globalThis.window, matchMedia: () => query }
  globalThis.document = { hidden: false, addEventListener() {}, removeEventListener() {} }
  const slot = init => { const i = cursor++; return current[i] ||= init() }
  const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]))
  globalThis.__quizHooks = {
    state(init) { const cell = slot(() => ({ value: typeof init === 'function' ? init() : init })); return [cell.value, value => {
      const next = typeof value === 'function' ? value(cell.value) : value
      if (!Object.is(next, cell.value)) { cell.value = next; dirty = true }
    }] },
    reducer(reducer, arg, init) { const cell = slot(() => ({ value: init ? init(arg) : arg })); return [cell.value, action => {
      const next = reducer(cell.value, action); if (next !== cell.value) { cell.value = next; dirty = true }
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
      return walk(node.type(node.props), `${key}/out`)
    }
    if (node.ref) {
      const key = node.props.id || path
      const element = refs.get(key) || { focus() { lastFocus = key }, scrollIntoView(options) { this.scrolled = options } }
      refs.set(key, element)
      if (typeof node.ref === 'function') node.ref(element); else node.ref.current = element
    }
    return { type: node.type, props: node.props, children: walk(node.props.children, `${path}/children`) }
  }
  function render() {
    let passes = 0
    do {
      dirty = false; visited = new Set()
      tree = walk(React.createElement(Page || api.Quiz, { story, alreadyCompleted: saved,
        onComplete: () => { ready = true; completed++ }, onRetry: () => { ready = false; retried++ } }), 'quiz')
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
  return { render, all, refs, query, completed: () => completed, retried: () => retried, ready: () => ready, lastFocus: () => lastFocus,
    choose(index) { const radio = all(n => n.type === 'input' && n.props.type === 'radio')[index]; assert.ok(radio); radio.props.onChange(); render() },
    submit() { const form = all(n => n.type === 'form')[0]; assert.ok(form); form.props.onSubmit({ preventDefault() {} }); render() },
    click(label) { const button = all(n => n.type === 'button' && text(n).includes(label))[0]; assert.ok(button, label); assert.ok(!button.props.disabled, `${label} disabled`);
      if (button.props.type === 'submit') all(n => n.type === 'form')[0].props.onSubmit({ preventDefault() {} }); else button.props.onClick(); render() },
    text: () => text(tree),
    dispose() { instances.forEach(cells => cells.forEach(c => c.cleanup?.())); instances.clear(); delete globalThis.__quizHooks; delete globalThis.window; delete globalThis.document },
  }
}
const feedback = f => f.all(n => n.props.id === 'quiz-feedback-title')
function finishAttempt(f, choices) {
  choices.forEach((choice, index) => { f.choose(choice); f.submit(); assert.equal(feedback(f).length, 1); f.click(index === choices.length - 1 ? 'View results' : 'Next question') })
}

test('original questions, choices, correct answers and reward stay unchanged', () => {
  assert.deepEqual(questions.map(q => q.answer), [0, 1, 0]); assert.equal(story.reward, 'Jezero Field Scientist')
  const original = execFileSync('git', ['show', '49f7545:src/machineStories.ts'], { cwd: root, encoding: 'utf8' })
  // Only the independently registered Apollo 15 record may follow the original records.
  const current = beforeMoonScope(readFileSync(`${root}/src/machineStories.ts`, 'utf8').replace(/\r\n/g, '\n'))
  assert.equal(current.slice(0, current.indexOf('  // Apollo 15 content')) + '}\n', original.replace(/\r\n/g, '\n'))
  questions.forEach((question, index) => question.options.forEach((_, option) => {
    if (option !== question.answer) assert.ok(api.perseveranceQuizLearning[index].wrongAnswers[option])
  }))
})

test('all 27 answer combinations score once; invalid selection, early advance and duplicate submissions are ignored', () => {
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 3; c++) {
    let state = api.createQuizAttempt()
    assert.equal(api.reduceQuizAttempt(questions, state, { type: 'submit' }), state)
    assert.equal(api.reduceQuizAttempt(questions, state, { type: 'advance' }), state)
    for (const option of [-1, 3, 1.5]) assert.equal(api.reduceQuizAttempt(questions, state, { type: 'select', option }), state)
    const choices = [a, b, c]
    choices.forEach(option => {
      state = api.reduceQuizAttempt(questions, state, { type: 'select', option })
      state = api.reduceQuizAttempt(questions, state, { type: 'submit' })
      assert.equal(api.reduceQuizAttempt(questions, state, { type: 'submit' }), state)
      assert.equal(api.reduceQuizAttempt(questions, state, { type: 'select', option: (option + 1) % 3 }), state)
      state = api.reduceQuizAttempt(questions, state, { type: 'advance' })
    })
    assert.ok(state.showResults); assert.deepEqual(state.answers, choices)
    assert.equal(api.scoreQuiz(questions, state.answers), choices.filter((answer, index) => answer === questions[index].answer).length)
    assert.equal(api.reduceQuizAttempt(questions, state, { type: 'advance' }), state)
    assert.deepEqual(api.reduceQuizAttempt(questions, state, { type: 'retry' }), api.createQuizAttempt())
  }
})

test('selection does not reveal correctness, explanation, sources or reward before submission', () => {
  const f = fixture()
  try {
    assert.equal(f.all(n => n.type === 'input').length, 3); assert.equal(f.all(n => n.type === 'legend').length, 1)
    assert.ok(f.all(n => n.type === 'button' && text(n) === 'Submit answer')[0].props.disabled)
    f.submit(); assert.equal(feedback(f).length, 0)
    f.choose(2); f.choose(0)
    assert.equal(feedback(f).length, 0); assert.equal(f.all(n => n.type === 'a').length, 0)
    assert.ok(!f.text().includes('Correct answer')); assert.ok(!f.text().includes(questions[0].explanation)); assert.ok(!f.text().includes(story.reward))
    assert.equal(f.completed(), 0); assert.equal(f.lastFocus(), null)
    f.click('Submit answer'); assert.equal(feedback(f).length, 1)
    assert.ok(f.text().includes('Correct —')); assert.ok(f.text().includes(questions[0].explanation))
    assert.equal(f.lastFocus(), 'quiz-feedback-title'); assert.ok(f.all(n => n.type === 'fieldset')[0].props.disabled)
    f.choose(2); assert.ok(f.all(n => n.type === 'input')[0].props.checked)
    f.click('Next question'); assert.equal(f.lastFocus(), 'quiz-question-title')
    assert.equal(feedback(f).length, 0); assert.ok(f.text().includes(questions[1].question))
  } finally { f.dispose() }
})

test('every incorrect choice gets specific educational feedback and official evidence', () => {
  questions.forEach((question, index) => question.options.forEach((_, option) => {
    if (option === question.answer) return
    const f = fixture()
    try {
      for (let i = 0; i < index; i++) { f.choose(questions[i].answer); f.submit(); f.click('Next question') }
      f.choose(option); f.submit()
      assert.ok(f.text().includes('Not quite'))
      assert.ok(f.text().includes(api.perseveranceQuizLearning[index].wrongAnswers[option]))
      assert.ok(f.text().includes(question.explanation))
      assert.ok(f.text().includes(question.options[question.answer]))
      for (const source of api.perseveranceQuizLearning[index].sources) {
        assert.match(new URL(source.url).hostname, /(^|\.)nasa\.gov$/)
        assert.ok(f.all(n => n.type === 'a' && n.props.href === source.url).length)
      }
    } finally { f.dispose() }
  }))
})

test('last answer keeps feedback visible; completion and reward follow View results, with accurate 0/1/2/3 scores', () => {
  for (let score = 0; score <= 3; score++) {
    const choices = questions.map((q, index) => index < score ? q.answer : (q.answer + 1) % q.options.length)
    const f = fixture()
    try {
      choices.forEach((choice, index) => {
        f.choose(choice); f.submit(); assert.ok(f.text().includes(questions[index].explanation))
        assert.equal(f.completed(), 0)
        if (index < 2) f.click('Next question')
      })
      assert.ok(!f.text().includes('ACTIVITY COMPLETE')); assert.equal(feedback(f).length, 1)
      f.click('View results'); assert.equal(f.completed(), 1); assert.ok(f.ready())
      assert.ok(f.text().includes(`${score} of 3 correct answers`)); assert.ok(f.text().includes(`${Math.round(score / 3 * 100)}%`))
      assert.ok(f.text().includes('ACTIVITY COMPLETE')); assert.ok(f.text().includes(story.reward))
      if (score < 3) assert.ok(!f.text().includes('Every answer is correct'))
      f.render(); assert.equal(f.completed(), 1)
      assert.equal(f.lastFocus(), 'quiz-results-title')
      f.click('Try again'); assert.equal(f.retried(), 1); assert.ok(!f.ready()); assert.ok(f.text().includes('0 correct'))
      assert.equal(f.lastFocus(), 'quiz-question-title'); assert.ok(!f.text().includes(story.reward))
    } finally { f.dispose() }
  }
})

test('keyboard form semantics, focus, reduced motion and chapter-only responsive styles', () => {
  const f = fixture({ reduced: true, saved: true })
  try {
    assert.ok(f.text().includes('already complete'))
    const inputs = f.all(n => n.type === 'input')
    assert.ok(inputs.every(n => n.props.type === 'radio' && n.props.name === 'perseverance-quiz-answer'))
    assert.equal(f.all(n => n.type === 'label').length, 3)
    f.choose(1); f.submit()
    assert.equal(f.refs.get('quiz-feedback-title').scrolled.behavior, 'instant')
    f.click('Next question'); assert.equal(f.refs.get('quiz-question-title').scrolled.behavior, 'instant')
  } finally { f.dispose() }
  const css = postcss.parse(readFileSync(`${root}/src/components/storytelling/PerseveranceQuiz.module.css`, 'utf8'))
  css.walkRules(rule => { if (rule.selector.includes(':global(.machine-story-')) assert.ok(rule.selector.includes(':has(.chapter)')) })
  assert.ok(css.toString().includes('focus-visible')); assert.ok(css.toString().includes('min-height: 44px'))
  assert.ok(css.toString().includes('prefers-reduced-motion')); assert.ok(css.toString().includes('max-width: 600px'))
})

const routeHooks = { name: 'quiz-route-host', setup(build) {
  build.onLoad({ filter: /[\\/]store\.ts$/ }, () => ({ loader: 'ts', contents: `
    export function useProgress(selector){const p=globalThis.__quizProgress.getState();return selector?selector(p):p}
    export function useProgressPersistence(){return globalThis.__quizProgressPersistence?.getState() ?? {status:'saved',reason:null}}
    export const retryProgressSave=()=>globalThis.__quizRetrySave();` }))
  build.onResolve({ filter: /^react-router-dom$/ }, () => ({ path: 'router', namespace: 'quiz-router' }))
  build.onLoad({ filter: /.*/, namespace: 'quiz-router' }, () => ({ loader: 'js', contents: `export const useParams=()=>({storyId:'follow-perseverance',chapter:'5'});export const useNavigate=()=>()=>{};
    export const Link=p=>globalThis.__quizReact.createElement('a',p,p.children);export const Navigate=()=>null;` }))
  build.onResolve({ filter: /^framer-motion$/ }, () => ({ path: 'motion', namespace: 'quiz-motion' }))
  build.onLoad({ filter: /.*/, namespace: 'quiz-motion' }, () => ({ loader: 'js', contents: `const Wrap=p=>globalThis.__quizReact.createElement('div',p,p.children);export const motion={div:Wrap,article:Wrap};export const AnimatePresence=p=>p.children;export const MotionConfig=p=>p.children,useReducedMotion=()=>false,useScroll=()=>({scrollYProgress:{get:()=>0}}),useMotionValue=v=>({get:()=>v,set(){}}),useSpring=v=>v;` }))
  build.onLoad({ filter: /[\\/](RoverScene|LunarRoverScene|LandingSequence)\.tsx$/ }, () => ({ loader: 'tsx', contents: 'export const OfficialRover=()=>null,LunarRover=()=>null;export default function Scene(){return null}' }))
  build.onResolve({ filter: /^@react-three\/(fiber|drei)$/ }, args => ({ path: args.path, namespace: 'quiz-scene' }))
  build.onLoad({ filter: /.*/, namespace: 'quiz-scene' }, () => ({ loader: 'js', contents: 'export const Canvas=()=>null,Stars=()=>null,useFrame=()=>{},useThree=()=>({});' }))
} }
const ui = await bundle(`export {default as Page} from './src/components/MachineStoryPage'; export {default as Dashboard} from './src/components/MissionDashboard';`, [hooksPlugin, routeHooks])
const completionButton = f => f.all(n => n.props.id === 'complete-perseverance-story')[0]

test('real parent Complete Story persists only on its action; retry preserves saved and unrelated progress', async () => {
  const seed = { completedChapters: ['follow-perseverance:meet', 'follow-perseverance:journey', 'follow-perseverance:challenges', 'follow-perseverance:legacy'], exploredLocations: ['jezero'], inspectedInstruments: ['supercam'], badges: ['existing-badge'],
    storyProgress: { 'follow-perseverance': { completed: ['meet', 'journey', 'challenges', 'legacy'], lastChapter: 5, completedMission: false }, 'apollo-17-rover': { completed: ['meet'], lastChapter: 2, completedMission: false } } }
  const memory = new Map([['beyond-earth-progress', JSON.stringify({ state: seed, version: 0 })]])
  globalThis.window = { localStorage: { getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v), removeItem: k => memory.delete(k) } }
  const { useProgress } = await bundle(`export {useProgress} from './src/store';`)
  globalThis.__quizProgress = useProgress
  const before = memory.get('beyond-earth-progress'), f = fixture({ Page: ui.Page })
  const completeButton = () => completionButton(f)
  try {
    assert.ok(completeButton().props.disabled)
    finishAttempt(f, [1, 0, 1]); assert.equal(memory.get('beyond-earth-progress'), before)
    assert.ok(!completeButton().props.disabled)
    f.click('Try again'); assert.equal(memory.get('beyond-earth-progress'), before); assert.ok(completeButton().props.disabled)
    finishAttempt(f, [0, 1, 0]); f.click('Complete Story')
    const saved = JSON.parse(memory.get('beyond-earth-progress'))
    assert.equal(saved.version, 0); assert.deepEqual(Object.keys(saved.state).sort(), Array.from(new Set([...Object.keys(seed),'roverJourneys'])).sort())
    assert.deepEqual(saved.state.storyProgress['follow-perseverance'], { completed: ['meet', 'journey', 'challenges', 'legacy', 'quiz'], lastChapter: 5, completedMission: true })
    assert.deepEqual(saved.state.storyProgress['apollo-17-rover'], seed.storyProgress['apollo-17-rover'])
    assert.deepEqual(saved.state.exploredLocations, seed.exploredLocations); assert.deepEqual(saved.state.inspectedInstruments, seed.inspectedInstruments)
    assert.deepEqual(saved.state.badges, ['existing-badge', 'follow-perseverance-storyteller'])
    assert.ok(f.text().includes('Mission accomplished!'))
    assert.equal(f.lastFocus(), 'perseverance-completion-title')
    assert.equal(f.refs.get('perseverance-completion-title').scrolled.behavior, 'instant')
    assert.ok(f.text().includes('3 of 3 correct answers'), 'saving does not remount or reset quiz results')
    assert.ok(f.all(n => n.type === 'a' && n.props.to === '/dashboard').length)
    assert.ok(f.all(n => n.type === 'a' && n.props.to === '/explore/mars').length)
    assert.ok(f.all(n => n.props.role === 'status' && text(n).includes('now saved')).length)
    const completedSave = memory.get('beyond-earth-progress')
    f.click('View saved completion')
    assert.equal(memory.get('beyond-earth-progress'), completedSave, 'repeat action does not rewrite progress or award twice')
    assert.ok(!f.text().includes('Mission accomplished!'))
    assert.ok(f.text().includes('does not earn a second badge'))
    f.click('Try again'); assert.equal(memory.get('beyond-earth-progress'), completedSave)
    assert.ok(!completeButton().props.disabled, 'previously saved completion remains valid during practice')
    assert.ok(f.text().includes('already complete'))
    f.choose(2); f.submit(); f.click('View saved completion')
    assert.equal(memory.get('beyond-earth-progress'), completedSave)
    assert.equal(feedback(f).length, 1, 'viewing saved completion preserves practice feedback and answers')
    assert.deepEqual(Object.keys(saved.state.storyProgress['follow-perseverance']).sort(), ['completed', 'completedMission', 'lastChapter'])
    f.dispose()
    // A fresh store instance reads only the serialized data, as on browser reload.
    globalThis.window = { localStorage: { getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v), removeItem: k => memory.delete(k) } }
    const refreshed = await bundle(`export {useProgress} from './src/store';`)
    globalThis.__quizProgress = refreshed.useProgress
    assert.ok(refreshed.useProgress.getState().storyProgress['follow-perseverance'].completedMission)
    assert.deepEqual(refreshed.useProgress.getState().badges, saved.state.badges)
    const reload = fixture({ Page: ui.Page, reduced: true })
    try {
      assert.ok(reload.text().includes('Perseverance mission complete'))
      assert.ok(reload.text().includes('Badge earned'))
      assert.ok(!reload.text().includes('Mission accomplished!'))
      assert.equal(reload.lastFocus(), null, 'refresh does not steal keyboard focus')
      reload.click('View saved completion')
      assert.equal(reload.lastFocus(), 'perseverance-completion-title')
      assert.equal(reload.refs.get('perseverance-completion-title').scrolled.behavior, 'instant')
      assert.equal(memory.get('beyond-earth-progress'), completedSave)
    } finally { reload.dispose() }
    const dashboard = fixture({ Page: ui.Dashboard })
    try {
      const track = dashboard.all(n => n.type === 'article' && n.props.className === 'mission-track mars' && text(n).includes('Perseverance'))[0]
      assert.equal(track, undefined, 'retired mission is not published in dashboard')
      const reward = dashboard.all(n => n.type === 'span' && n.props.className === 'earned' && text(n).includes('Jezero Field Scientist'))[0]
      assert.equal(reward, undefined, 'historical reward is retained in storage but hidden from the catalog')
      assert.equal(memory.get('beyond-earth-progress'), completedSave)
    } finally { dashboard.dispose() }
  } finally { f.dispose(); delete globalThis.__quizProgress }
})

test('older flat completed-chapter records remain valid during a fresh practice attempt', async () => {
  const seed = { completedChapters: ['meet', 'journey', 'challenges', 'legacy', 'quiz'].map(id => `follow-perseverance:${id}`),
    exploredLocations: ['jezero'], inspectedInstruments: [], badges: ['follow-perseverance-storyteller'] }
  const before = JSON.stringify({ state: seed, version: 0 }), memory = new Map([['beyond-earth-progress', before]])
  globalThis.window = { localStorage: { getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v), removeItem: k => memory.delete(k) } }
  const { useProgress } = await bundle(`export {useProgress} from './src/store';`)
  globalThis.__quizProgress = useProgress
  const f = fixture({ Page: ui.Page })
  try {
    assert.ok(f.text().includes('already complete'))
    assert.ok(!completionButton(f).props.disabled)
    finishAttempt(f, [1, 0, 1]); f.click('Try again')
    assert.equal(memory.get('beyond-earth-progress'), before)
    assert.deepEqual(useProgress.getState().completedChapters, seed.completedChapters)
    assert.deepEqual(useProgress.getState().storyProgress, {})
    assert.ok(f.text().includes('already complete'))
  } finally { f.dispose(); delete globalThis.__quizProgress }
})

test('finishing with four legacy flat chapters reconciles completedMission without losing older achievements', async () => {
  const seed = { completedChapters: ['meet', 'journey', 'challenges', 'legacy'].map(id => `follow-perseverance:${id}`),
    exploredLocations: ['jezero'], inspectedInstruments: ['supercam'], badges: ['existing-badge'],
    storyProgress: { 'apollo-17-rover': { completed: ['meet'], lastChapter: 2, completedMission: false } } }
  const before = JSON.stringify({ state: seed, version: 0 }), memory = new Map([['beyond-earth-progress', before]])
  globalThis.window = { localStorage: { getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v), removeItem: k => memory.delete(k) } }
  const { useProgress } = await bundle(`export {useProgress} from './src/store';`)
  globalThis.__quizProgress = useProgress
  const f = fixture({ Page: ui.Page })
  try {
    finishAttempt(f, [1, 0, 1]) // Zero correct is still a completed educational activity.
    assert.ok(f.text().includes('0 of 3 correct answers'))
    assert.equal(memory.get('beyond-earth-progress'), before)
    f.click('Complete Story')
    const saved = JSON.parse(memory.get('beyond-earth-progress')).state
    assert.deepEqual(saved.storyProgress['follow-perseverance'], { completed: ['meet', 'journey', 'challenges', 'legacy', 'quiz'], lastChapter: 5, completedMission: true })
    assert.deepEqual(saved.completedChapters, [...seed.completedChapters, 'follow-perseverance:quiz'])
    assert.deepEqual(saved.badges, ['existing-badge', 'follow-perseverance-storyteller'])
    assert.deepEqual(saved.storyProgress['apollo-17-rover'], seed.storyProgress['apollo-17-rover'])
    assert.deepEqual(saved.exploredLocations, seed.exploredLocations); assert.deepEqual(saved.inspectedInstruments, seed.inspectedInstruments)
    assert.ok(f.text().includes('0 of 3 correct answers'))
    const completedSave = memory.get('beyond-earth-progress')
    f.click('View saved completion'); assert.equal(memory.get('beyond-earth-progress'), completedSave)
  } finally { f.dispose(); delete globalThis.__quizProgress }
})

test('legacy saved completion is reconciled without announcing a new achievement or duplicating badges', async () => {
  const chapters = ['meet', 'journey', 'challenges', 'legacy', 'quiz']
  const seed = { completedChapters: chapters.map(id => `follow-perseverance:${id}`), exploredLocations: [], inspectedInstruments: [], badges: ['follow-perseverance-storyteller'] }
  const memory = new Map([['beyond-earth-progress', JSON.stringify({ state: seed, version: 0 })]])
  globalThis.window = { localStorage: { getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v), removeItem: k => memory.delete(k) } }
  const { useProgress } = await bundle(`export {useProgress} from './src/store';`)
  globalThis.__quizProgress = useProgress
  const f = fixture({ Page: ui.Page })
  try {
    f.click('View saved completion')
    assert.ok(!f.text().includes('Mission accomplished!'))
    assert.ok(f.text().includes('does not earn a second badge'))
    assert.deepEqual(useProgress.getState().badges, seed.badges)
    assert.deepEqual(useProgress.getState().storyProgress['follow-perseverance'], { completed: chapters, lastChapter: 5, completedMission: true })
    const saved = memory.get('beyond-earth-progress')
    f.click('View saved completion'); assert.equal(memory.get('beyond-earth-progress'), saved)
  } finally { f.dispose(); delete globalThis.__quizProgress }
})

test('completion has native keyboard controls, readable mobile actions and no completion animation', () => {
  const css = postcss.parse(readFileSync(`${root}/src/components/storytelling/PerseveranceCompletion.module.css`, 'utf8'))
  assert.ok(css.toString().includes('min-height: 44px')); assert.ok(css.toString().includes('focus-visible'))
  assert.ok(css.toString().includes('max-width: 600px')); assert.ok(css.toString().includes('flex-wrap: wrap'))
  assert.ok(css.toString().includes('prefers-reduced-motion')); assert.ok(css.toString().includes('.panel[hidden]'))
})

test('storage rejection never confirms saved completion; retry recovers without resetting the quiz or duplicating badges', async () => {
  const seed = { completedChapters: ['meet', 'journey', 'challenges', 'legacy'].map(id => `follow-perseverance:${id}`),
    exploredLocations: ['jezero'], inspectedInstruments: ['supercam'], badges: ['existing-badge'],
    storyProgress: { 'apollo-17-rover': { completed: ['meet'], lastChapter: 2, completedMission: false } } }
  const before = JSON.stringify({ state: seed, version: 0 }), memory = new Map([['beyond-earth-progress', before]])
  let reject = true
  globalThis.window = { localStorage: { getItem: k => memory.get(k) ?? null, setItem(k, value) {
    if (reject) throw new DOMException('Storage quota exceeded', 'QuotaExceededError')
    memory.set(k, value)
  }, removeItem: k => memory.delete(k) } }
  const store = await bundle(`export * from './src/store';`)
  globalThis.__quizProgress = store.useProgress
  globalThis.__quizProgressPersistence = store.useProgressPersistence
  globalThis.__quizRetrySave = store.retryProgressSave
  const f = fixture({ Page: ui.Page })
  try {
    finishAttempt(f, [0, 1, 0])
    assert.doesNotThrow(() => f.click('Complete Story'))
    assert.equal(memory.get('beyond-earth-progress'), before)
    assert.ok(f.all(n => n.props.role === 'alert' && text(n).includes('not saved')).length)
    assert.ok(!f.text().includes('now saved')); assert.ok(!f.text().includes('already saved'))
    assert.ok(f.text().includes('3 of 3 correct answers'))
    assert.ok(store.useProgress.getState().badges.includes('follow-perseverance-storyteller'))
    f.click('Retry saving'); assert.equal(memory.get('beyond-earth-progress'), before)
    assert.ok(f.all(n => n.props.role === 'status' && text(n).includes('Save retry 1 failed')).length)
    f.click('Retry saving'); assert.ok(f.text().includes('Save retry 2 failed'))
    f.click('Try again'); assert.equal(memory.get('beyond-earth-progress'), before)
    assert.ok(!f.text().includes('already saved'))
    reject = false; f.click('Retry saving')
    const saved = JSON.parse(memory.get('beyond-earth-progress'))
    assert.equal(saved.version, 0); assert.deepEqual(Object.keys(saved.state).sort(), Array.from(new Set([...Object.keys(seed),'roverJourneys'])).sort())
    assert.deepEqual(saved.state.storyProgress['apollo-17-rover'], seed.storyProgress['apollo-17-rover'])
    assert.deepEqual(saved.state.exploredLocations, seed.exploredLocations)
    assert.deepEqual(saved.state.inspectedInstruments, seed.inspectedInstruments)
    assert.deepEqual(saved.state.badges, ['existing-badge', 'follow-perseverance-storyteller'])
    assert.ok(saved.state.storyProgress['follow-perseverance'].completedMission)
    assert.ok(f.text().includes('saved on this device'))
    assert.equal(f.all(n => n.props.role === 'alert').length, 0)
    const after = memory.get('beyond-earth-progress')
    f.click('View saved completion'); assert.equal(memory.get('beyond-earth-progress'), after)
    const reload = await bundle(`export * from './src/store';`)
    assert.deepEqual(reload.useProgress.getState().badges, saved.state.badges)
    assert.ok(reload.useProgress.getState().storyProgress['follow-perseverance'].completedMission)
  } finally {
    f.dispose(); delete globalThis.__quizProgress; delete globalThis.__quizProgressPersistence; delete globalThis.__quizRetrySave
  }
})

test('a badge write failing after chapters were saved never claims the badge is saved', async () => {
  const chapters = ['meet', 'journey', 'challenges', 'legacy']
  const seed = { completedChapters: chapters.map(id => `follow-perseverance:${id}`), exploredLocations: [], inspectedInstruments: [], badges: [],
    storyProgress: { 'follow-perseverance': { completed: chapters, lastChapter: 5, completedMission: false } } }
  const memory = new Map([['beyond-earth-progress', JSON.stringify({ state: seed, version: 0 })]])
  let writes = 0, rejectBadge = true
  globalThis.window = { localStorage: { getItem: k => memory.get(k) ?? null, setItem(k, value) {
    writes++
    if (rejectBadge && JSON.parse(value).state.badges.includes('follow-perseverance-storyteller')) throw Error('Badge save rejected')
    memory.set(k, value)
  }, removeItem: k => memory.delete(k) } }
  const store = await bundle(`export * from './src/store';`)
  globalThis.__quizProgress = store.useProgress
  globalThis.__quizProgressPersistence = store.useProgressPersistence
  globalThis.__quizRetrySave = store.retryProgressSave
  const f = fixture({ Page: ui.Page })
  try {
    finishAttempt(f, [1, 0, 1]); f.click('Complete Story')
    assert.equal(writes, 2)
    const disk = JSON.parse(memory.get('beyond-earth-progress')).state
    assert.ok(disk.storyProgress['follow-perseverance'].completedMission); assert.deepEqual(disk.badges, [])
    assert.ok(f.text().includes('Badge unlocked in this session'))
    assert.ok(!f.text().includes('already saved')); assert.ok(!f.text().includes('now saved'))
    assert.ok(f.text().includes('0 of 3 correct answers'))
    const beforeRetry = memory.get('beyond-earth-progress')
    f.click('View session completion'); assert.equal(memory.get('beyond-earth-progress'), beforeRetry)
    rejectBadge = false; f.click('Retry saving')
    assert.deepEqual(JSON.parse(memory.get('beyond-earth-progress')).state.badges, ['follow-perseverance-storyteller'])
    assert.ok(f.text().includes('saved on this device')); assert.ok(f.text().includes('0 of 3 correct answers'))
    assert.equal(f.lastFocus(), 'perseverance-completion-title')
    const saved = memory.get('beyond-earth-progress'), writeCount = writes
    f.click('View saved completion'); assert.equal(writes, writeCount); assert.equal(memory.get('beyond-earth-progress'), saved)
  } finally {
    f.dispose(); delete globalThis.__quizProgress; delete globalThis.__quizProgressPersistence; delete globalThis.__quizRetrySave
  }
})

test('failed initial reads show accessible recovery and never overwrite existing saved records', async () => {
  const before = JSON.stringify({ state: { badges: ['existing-badge'] }, version: 0 })
  let writes = 0, reloaded = false
  globalThis.window = { location: { reload() { reloaded = true } }, localStorage: {
    getItem() { throw new DOMException('Storage blocked', 'SecurityError') }, setItem() { writes++ }, removeItem() {},
  } }
  const store = await bundle(`export * from './src/store';`)
  globalThis.__quizProgress = store.useProgress
  globalThis.__quizProgressPersistence = store.useProgressPersistence
  globalThis.__quizRetrySave = store.retryProgressSave
  const f = fixture({ Page: ui.Page })
  try {
    assert.ok(f.all(n => n.props.role === 'alert' && n.props['aria-atomic'] === 'true').length)
    assert.ok(f.text().includes('Saving is paused to protect it'))
    assert.equal(f.all(n => n.type === 'button' && text(n).includes('Retry saving')).length, 0)
    assert.ok(completionButton(f).props.disabled)
    store.useProgress.getState().awardBadge('temporary-badge'); assert.equal(writes, 0)
    assert.equal(store.retryProgressSave(), false)
    f.click('Reload saved progress'); assert.ok(reloaded); assert.equal(writes, 0)
    globalThis.window.localStorage.getItem = () => before
    const reload = await bundle(`export * from './src/store';`)
    assert.deepEqual(reload.useProgress.getState().badges, ['existing-badge'])
    assert.equal(reload.useProgressPersistence.getState().status, 'saved')
  } finally {
    f.dispose(); delete globalThis.__quizProgress; delete globalThis.__quizProgressPersistence; delete globalThis.__quizRetrySave
  }
})

test('all nine other story routes and original helper functions remain identical', async () => {
  const current = readFileSync(`${root}/src/components/MachineStoryPage.tsx`, 'utf8')
  const integration = ":story.id==='follow-perseverance'?<PerseveranceQuiz story={story} alreadyCompleted={alreadyDone} onComplete={()=>setInteracted(true)} onRetry={()=>setInteracted(false)}/>:<QuizChapter story={story} onComplete={()=>setInteracted(true)}/>"
  assert.ok(current.includes(integration))
  const beforeQuiz = current.replace("import PerseveranceQuiz from './storytelling/PerseveranceQuiz'\n", '').replace(integration, ':<QuizChapter story={story} onComplete={()=>setInteracted(true)}/>')
  const checkpoint = execFileSync('git', ['show', '49f7545:src/components/MachineStoryPage.tsx'], { cwd: root, encoding: 'utf8' })
  for (const name of ['StoryLoader', 'NarrationButton', 'MachineVisual', 'MeetChapter', 'FlightScene', 'JourneyChapter', 'ChallengeChapter', 'LegacyChapter']) {
    const extract = source => source.slice(source.indexOf(`function ${name}(`), source.indexOf('\n}', source.indexOf(`function ${name}(`)) + 2).replace(/\r\n/g, '\n')
      // Authorized Apollo 15 seam: the historical image belongs only to Apollo 17.
      .replace("const image=story.id==='apollo-17-rover'?", "const image=story.planet==='moon'?")
      // Apollo 15-only recorded question player; scoring/feedback stay identical.
      .replace("{story.id==='apollo-15-rover'&&<Apollo15QuizNarration key={question} question={question}/>}", '')
    assert.equal(extract(current), extract(checkpoint), name)
  }
  const isolate = { name: 'render-route-contract', setup(build) {
    build.onLoad({ filter: /[\\/]store\.ts$/ }, () => ({ loader: 'ts', contents: `export const useProgressPersistence=()=>({status:'saved',reason:null}),retryProgressSave=()=>true;export function useProgress(){return {badges:[],completedChapters:[],storyProgress:{'follow-perseverance':{completed:['meet','journey','challenges','legacy']},'apollo-17-rover':{completed:['meet','journey','challenges','legacy']}},completeStoryChapter(){},awardBadge(){}}}` }))
    build.onLoad({ filter: /[\\/](RoverScene|LunarRoverScene|LandingSequence)\.tsx$/ }, () => ({ loader: 'tsx', contents: 'export const OfficialRover=()=>null,LunarRover=()=>null;export default function Scene(){return null}' }))
    build.onResolve({ filter: /^@react-three\/(fiber|drei)$/ }, args => ({ path: args.path, namespace: 'scene' }))
    build.onLoad({ filter: /.*/, namespace: 'scene' }, () => ({ loader: 'js', contents: 'export const Canvas=()=>null,Stars=()=>null,useFrame=()=>{},useThree=()=>({});' }))
  } }
  const entry = `export {default as Page} from './src/components/MachineStoryPage';`
  const before = await bundle(entry, [isolate, { name: 'before-quiz', setup(build) {
    build.onLoad({ filter: /[\\/]MachineStoryPage\.tsx$/ }, () => ({ loader: 'tsx', contents: beforeQuiz }))
  } }]), after = await bundle(entry, [isolate])
  const { renderToStaticMarkup } = require('react-dom/server'), { StaticRouter, Routes, Route } = require('react-router-dom')
  const markup = (Page, id, chapter) => renderToStaticMarkup(React.createElement(StaticRouter, { location: `/story/${id}/${chapter}` }, React.createElement(Routes, null,
    React.createElement(Route, { path: '/story/:storyId/:chapter', element: React.createElement(Page) }))))
  for (const id of ['follow-perseverance', 'apollo-17-rover']) for (let chapter = 1; chapter <= 5; chapter++) {
    const a = markup(after.Page, id, chapter), b = markup(before.Page, id, chapter)
    if (id === 'follow-perseverance' && chapter === 5) { assert.notEqual(a, b); assert.ok(a.includes('Perseverance knowledge assessment')); assert.ok(a.includes('Complete Story')) }
    else assert.equal(a, b, `${id}/${chapter}`)
  }
})
