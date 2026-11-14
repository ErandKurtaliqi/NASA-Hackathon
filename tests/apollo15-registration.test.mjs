import { beforeMasterIntegration } from './helpers/master-integration-contract.mjs'
import { legacyApolloQuizMarkup } from './helpers/apollo-quiz-contract.mjs'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { build } from 'esbuild'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter, Routes, Route } from 'react-router-dom'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
const previous = file => execFileSync('git', ['show', `5ffd022:${file}`], { cwd: root, encoding: 'utf8' })
async function bundle(contents, plugins = []) {
  const result = await build({ stdin: { contents, resolveDir: root }, bundle: true, write: false,
    outfile: `${root}/.apollo15-check.cjs`, platform: 'node', format: 'cjs', packages: 'external',
    jsx: 'automatic', loader: { '.css': 'local-css' }, plugins, logLevel: 'silent' })
  const module = { exports: {} }
  new Function('require', 'module', 'exports', result.outputFiles.find(f => f.path.endsWith('.cjs')).text)(require, module, module.exports)
  return module.exports
}
const entry = `export * from './src/data'; export * from './src/machineStories';
  export * from './src/features/explorer/storyEntry'; export * from './src/features/storytelling/pilot';`
const api = await bundle(entry, [{name:'historical-registration-records',setup(b){for(const file of ['data','machineStories'])b.onLoad({filter:new RegExp(`[\\\\/]${file}\\.ts$`)},args=>({loader:'ts',contents:beforeMasterIntegration(readFileSync(args.path,'utf8'))}))}}])
const baseline = await bundle(entry, [{ name: 'original-records', setup(build) {
  for (const file of ['data', 'machineStories']) build.onLoad({ filter: new RegExp(`[\\\\/]${file}\\.ts$`) },
    () => ({ loader: 'ts', contents: previous(`src/${file}.ts`) }))
} }])
const apollo = api.machineStories['apollo-15-rover']
const text = node => Array.isArray(node) ? node.map(text).join('') : typeof node === 'object' && node ? text(node.props?.children) : String(node ?? '')
function all(node, predicate) {
  if (Array.isArray(node)) return node.flatMap(child => all(child, predicate))
  if (!node || typeof node !== 'object') return []
  return [...(predicate(node) ? [node] : []), ...all(node.props?.children, predicate)]
}

test('Apollo 15 is an independent complete record with a unique approved hardware mapping', () => {
  assert.equal(apollo.id, 'apollo-15-rover'); assert.equal(apollo.machineId, 'lrv-1'); assert.equal(apollo.planet, 'moon')
  assert.equal(api.machineStories['apollo-17-rover'].machineId, 'lrv')
  assert.equal(new Set(api.hardware.map(h => h.id)).size, api.hardware.length)
  assert.equal(new Set(Object.values(api.machineStories).map(s => s.machineId)).size, 3)
  assert.deepEqual(Object.keys(apollo).sort(), Object.keys(baseline.machineStories['apollo-17-rover']).sort())
  for (const field of ['profile', 'journey', 'challenges', 'discoveries', 'legacy', 'quiz']) assert.ok(apollo[field].length)
  assert.deepEqual(apollo.quiz.map(q => q.answer), [1, 0, 2])
  assert.equal(apollo.reward, 'Hadley-Apennine Explorer')
  assert.ok(apollo.sources.every(source => /(^|\.)nasa\.gov$/.test(new URL(source.url).hostname)))
  assert.ok(!JSON.stringify(apollo).includes('.mp3')); assert.ok(!('narration' in apollo))
  for (const story of Object.values(baseline.machineStories)) assert.deepEqual(api.machineStories[story.id], story)
  assert.deepEqual(api.hardware.filter(h => h.id !== 'lrv-1'), baseline.hardware)
  for (const field of ['markers', 'sources', 'story']) assert.deepEqual(api[field], baseline[field])
})

test('the existing dynamic route accepts all five chapters and rejects malformed routes', () => {
  for (const id of ['apollo-15-rover','apollo-17-rover','apollo-11-reflector']) {
    for (let n = 1; n <= 5; n++) {
      const route = api.resolveStoryRoute(id, String(n))
      assert.equal(route.story.id, id); assert.equal(route.index, n - 1)
    }
    for (const chapter of ['', '0', '-1', '6', '2.5', '01', '1e0', 'Infinity', '9007199254740992']) {
      assert.equal(api.resolveStoryRoute(id, chapter), null)
    }
  }
  for (const id of ['missing', '__proto__', 'constructor']) assert.equal(api.resolveStoryRoute(id, '1'), null)
  for (const [machine, id] of [['lrv-1', apollo.id], ['lrv', 'apollo-17-rover']]) {
    const h = api.hardware.find(h => h.id === machine)
    assert.equal(api.getStoryEntry(h).href, `/story/${id}/1`)
    assert.equal(api.getStoryEntry(h, { completed: ['meet', 'journey'], lastChapter: 3 }).href, `/story/${id}/3`)
  }
  const app = readFileSync(`${root}/src/App.tsx`, 'utf8')
  assert.ok(app.includes('path="/story/:storyId/:chapter"'))
  assert.ok(!app.includes('path="/story/apollo-15'))
})

const sceneIsolation = build => {
  build.onLoad({ filter: /[\\/](RoverScene|LunarRoverScene|IngenuityScene|LandingSequence|PlanetScene|PlanetMap|CinematicScene)\.tsx$/ },
    () => ({ loader: 'tsx', contents: 'export const OfficialRover=()=>null,LunarRover=()=>null;export default function Scene(){return null}' }))
  build.onResolve({ filter: /^@react-three\/(fiber|drei)$/ }, args => ({ path: args.path, namespace: 'no-gpu' }))
  build.onLoad({ filter: /.*/, namespace: 'no-gpu' }, () => ({ loader: 'js', contents: 'export const Canvas=()=>null,Stars=()=>null,useFrame=()=>{},useThree=()=>({});' }))
}
const progressIsolation = build => build.onLoad({ filter: /[\\/]store\.ts$/ }, () => ({ loader: 'ts', contents: `
  export const useProgress=selector=>selector?selector(globalThis.__apolloProgress):globalThis.__apolloProgress;
  export const useProgressPersistence=()=>({status:'saved',reason:null}),retryProgressSave=()=>true;` }))
const renderEntry = `export {default as Page} from './src/components/MachineStoryPage'; export {default as Dashboard} from './src/components/MissionDashboard';`
const renderApi = await bundle(renderEntry, [{ name: 'render-isolation', setup(build) { sceneIsolation(build); progressIsolation(build) } }])
const renderBefore = await bundle(renderEntry, [{ name: 'previous-routes', setup(build) {
  sceneIsolation(build); progressIsolation(build)
  build.onLoad({ filter: /[\\/]MachineStoryPage\.tsx$/ }, () => ({ loader: 'tsx', contents: previous('src/components/MachineStoryPage.tsx') }))
} }])
const empty = () => ({ completedChapters: [], exploredLocations: [], inspectedInstruments: [], badges: [], storyProgress: {},
  completeStoryChapter() { throw Error('Render must not complete chapters') }, awardBadge() { throw Error('Render must not award badges') } })
const render = (Component, location) => renderToStaticMarkup(React.createElement(StaticRouter, { location }, React.createElement(Component)))
const pageMarkup = (Page, id, n) => renderToStaticMarkup(React.createElement(StaticRouter, { location: `/story/${id}/${n}` },
  React.createElement(Routes, null, React.createElement(Route, { path: '/story/:storyId/:chapter', element: React.createElement(Page) }))))

test('all Apollo 15 chapter screens render; Perseverance screens remain identical and Apollo 17 evidence stays exclusive', () => {
  globalThis.__apolloProgress = empty()
  try {
    for (const id of Object.keys(api.machineStories)) globalThis.__apolloProgress.storyProgress[id] = { completed: ['meet', 'journey', 'challenges', 'legacy'], lastChapter: 5 }
    for (const id of Object.keys(baseline.machineStories)) for (let n = 1; n <= 5; n++) {
      if(id === 'apollo-17-rover') {
        const html = pageMarkup(renderApi.Page, id, n); assert.ok(html.includes('data-story-pilot="apollo-17"')); assert.ok(html.includes(api.machineStories[id].name))
      } else assert.equal(legacyApolloQuizMarkup(pageMarkup(renderApi.Page, id, n)), legacyApolloQuizMarkup(pageMarkup(renderBefore.Page, id, n)), `${id}/${n}`)
    }
    for (let n = 1; n <= 5; n++) {
      const html = pageMarkup(renderApi.Page, apollo.id, n)
      assert.ok(html.includes(api.chapterMeta[n - 1].title.replace('&', '&amp;')))
      assert.ok(html.includes(apollo.name)); assert.ok(!html.includes('/images/apollo17-rover.jpg'))
    }
    assert.ok(pageMarkup(renderApi.Page, 'apollo-17-rover', 3).includes('/images/apollo17-story/vehicle.jpg'))
    assert.ok(pageMarkup(renderApi.Page, apollo.id, 6).includes('Story not found'))
  } finally { delete globalThis.__apolloProgress }
})

test('Dashboard discovers eight missions, forty chapters and resumes each independent mission', () => {
  const progress = globalThis.__apolloProgress = empty()
  try {
    let html = render(renderApi.Dashboard, '/dashboard')
    assert.equal((html.match(/class="mission-track (mars|moon)"/g) || []).length, 8)
    assert.ok(html.includes('0 / 40 CHAPTERS COMPLETE'))
    assert.ok(html.includes('href="/story/apollo-15-rover/1"'))
    for (const id of Object.keys(baseline.machineStories)) {
      progress.storyProgress[id] = { completed: api.chapterMeta.map(c => c.id), lastChapter: 5, completedMission: true }
      progress.badges.push(`${id}-storyteller`)
    }
    html = render(renderApi.Dashboard, '/dashboard')
    assert.ok(html.includes('5 / 40 CHAPTERS COMPLETE')); assert.ok(html.includes('13%'))
    assert.equal((html.match(/<strong>100%<\/strong>/g) || []).length, 1)
    progress.storyProgress[apollo.id] = { completed: ['meet', 'journey'], lastChapter: 3, completedMission: false }
    html = render(renderApi.Dashboard, '/dashboard')
    assert.ok(html.includes('7 / 40 CHAPTERS COMPLETE')); assert.ok(html.includes('href="/story/apollo-15-rover/3"'))
    // The pre-storyProgress completedChapters representation still counts.
    progress.completedChapters = ['apollo-15-rover:challenges']
    assert.ok(render(renderApi.Dashboard, '/dashboard').includes('8 / 40 CHAPTERS COMPLETE'))
  } finally { delete globalThis.__apolloProgress }
})

// Exercise actual Hardware/quiz/completion handlers without a DOM or GPU. Only
// hooks, router and animation surfaces are isolated; persisted actions stay real.
globalThis.__apolloReact = React
const interactive = await bundle(`export {Hardware} from './src/App'; export {QuizChapter,ValidMachineStoryPage} from './src/components/MachineStoryPage';`, [{ name: 'interactive-isolation', setup(build) {
  sceneIsolation(build); progressIsolation(build)
  for (const [file, names] of [['App', 'Hardware'], ['MachineStoryPage', 'QuizChapter,ValidMachineStoryPage']]) {
    build.onLoad({ filter: new RegExp(`[\\\\/]${file}\\.tsx$`) }, args => ({ loader: 'tsx', contents: readFileSync(args.path, 'utf8') + `\nexport {${names}}` }))
  }
  build.onResolve({ filter: /^react$/ }, () => ({ path: 'hooks', namespace: 'apollo-hooks' }))
  build.onLoad({ filter: /.*/, namespace: 'apollo-hooks' }, () => ({ loader: 'js', contents: `
    export const Component=globalThis.__apolloReact.Component,Suspense=globalThis.__apolloReact.Suspense;
    export const lazy=()=>()=>null,useMemo=fn=>fn(),useCallback=fn=>fn,useReducer=()=>{throw Error('Unexpected reducer')};
    export const useId=()=>{const cell=globalThis.__apolloHooks.ref(null);return cell.current??=("host-id-"+(globalThis.__releaseHookId=(globalThis.__releaseHookId??0)+1))};
    export const useLayoutEffect=(...a)=>useEffect(...a);export const useState=(...a)=>globalThis.__apolloHooks.state(...a),useRef=(...a)=>globalThis.__apolloHooks.ref(...a),useEffect=(...a)=>globalThis.__apolloHooks.effect(...a);` }))
  build.onResolve({ filter: /^react-router-dom$/ }, () => ({ path: 'router', namespace: 'apollo-router' }))
  build.onLoad({ filter: /.*/, namespace: 'apollo-router' }, () => ({ loader: 'js', contents: `
    export const useSearchParams=()=>[new URLSearchParams()];export const Link='a',NavLink='a',Route='route',Routes='routes',Navigate='redirect';
    export const useNavigate=()=>path=>globalThis.__apolloNavigations.push(path),useParams=()=>({}),useLocation=()=>({pathname:'/hardware'});` }))
} }])
function fixture(Component, props = {}) {
  const cells = []; let cursor, dirty, tree, pending = []
  const slot = init => cells[cursor++] ||= init()
  const hooks = {
    state(init) { const c = slot(() => ({ value: typeof init === 'function' ? init() : init })); return [c.value, value => {
      const next = typeof value === 'function' ? value(c.value) : value
      if (!Object.is(next, c.value)) { c.value = next; dirty = true }
    }] },
    ref(value) { return slot(() => ({ current: value })) },
    effect(fn, deps) { const c = slot(() => ({})); if (!c.deps || !deps || deps.some((v, i) => !Object.is(v, c.deps[i]))) {
      c.deps = deps; pending.push(() => { c.cleanup?.(); c.cleanup = fn() })
    } },
  }
  function render() {
    let passes = 0
    do {
      globalThis.__apolloHooks = hooks; cursor = 0; dirty = false; tree = Component(props)
      const effects = pending; pending = []; effects.forEach(fn => fn()); assert.ok(++passes < 10)
    } while (dirty)
  }
  render()
  return { render, all: predicate => all(tree, predicate), text: () => text(tree),
    click(label) { const button = all(tree, n => n.type === 'button' && text(n).includes(label))[0]; assert.ok(button, label); assert.ok(!button.props.disabled); button.props.onClick(); render() },
    dispose() { cells.forEach(c => c.cleanup?.()) },
  }
}

test('Hardware selection links to Apollo 15 and resumes saved progress without redirecting Apollo 17', () => {
  globalThis.__apolloProgress = empty()
  const f = fixture(interactive.Hardware)
  try {
    f.click('Apollo 15 Lunar Roving Vehicle')
    assert.ok(f.all(n => n.props.to === '/story/apollo-15-rover/1').length)
    globalThis.__apolloProgress.storyProgress[apollo.id] = { completed: ['meet', 'journey'], lastChapter: 3 }
    f.render(); assert.ok(f.all(n => n.props.to === '/story/apollo-15-rover/3' && text(n).includes('Continue my story')).length)
    f.click('Apollo 17 Lunar Roving Vehicle')
    assert.ok(f.all(n => n.props.to === '/story/apollo-17-rover/1').length)
  } finally { f.dispose(); delete globalThis.__apolloProgress }
})

test('Apollo 15 quiz, retry and Complete Story preserve old saves and award exactly one persistent badge', async () => {
  const initial = empty(); delete initial.completeStoryChapter; delete initial.awardBadge
  for (const id of Object.keys(baseline.machineStories)) {
    initial.storyProgress[id] = { completed: api.chapterMeta.map(c => c.id), lastChapter: 5, completedMission: true }
    initial.completedChapters.push(...api.chapterMeta.map(c => `${id}:${c.id}`)); initial.badges.push(`${id}-storyteller`)
  }
  const key = 'beyond-earth-progress', memory = new Map([[key, JSON.stringify({ state: initial, version: 0 })]])
  globalThis.window = { localStorage: { getItem: name => memory.get(name) ?? null, setItem: (name, value) => memory.set(name, value) } }
  globalThis.__apolloNavigations = []
  const loadStore = () => bundle("export * from './src/store'")
  const store = await loadStore()
  try {
    globalThis.__apolloProgress = store.useProgress.getState()
    assert.deepEqual(globalThis.__apolloProgress.storyProgress, initial.storyProgress)
    for (let i = 0; i < 4; i++) {
      const chapter = fixture(interactive.ValidMachineStoryPage, { story: apollo, index: i })
      try {
        const pilot = chapter.all(n => n.props.story?.id === apollo.id && typeof n.props.onNext === 'function')[0]
        assert.ok(pilot); assert.equal(pilot.props.canComplete, true)
        pilot.props.onNext()
        globalThis.__apolloProgress = store.useProgress.getState()
        assert.deepEqual(globalThis.__apolloProgress.storyProgress[apollo.id].completed, api.chapterMeta.slice(0, i + 1).map(c => c.id))
      } finally { chapter.dispose() }
    }
    const page = fixture(interactive.ValidMachineStoryPage, { story: apollo, index: 4 })
    try {
      const pilot = () => page.all(n => typeof n.props.renderQuiz === 'function')[0]
      assert.equal(pilot().props.canComplete, false)
      const ready = pilot().props.renderQuiz(() => null).props.onComplete
      const quiz = fixture(interactive.QuizChapter, { story: apollo, onComplete: ready })
      try {
        for (const choices of [[1, 0, 2], [0, 1, 1]]) {
          choices.forEach((choice, i) => {
            const option = quiz.all(n => n.type === 'button')[choice]; option.props.onClick(); quiz.render()
            // Every answer retains its explanation until the explicit advance action.
            assert.ok(quiz.text().includes(apollo.quiz[i].explanation)); quiz.click(i < 2 ? 'NEXT QUESTION' : 'View Results')
          })
          assert.ok(quiz.text().includes(`You scored ${choices[0] === 1 ? 3 : 0} / 3`))
          assert.ok(quiz.text().includes(apollo.reward)); page.render(); assert.equal(pilot().props.canComplete, true); pilot().props.onNext()
          globalThis.__apolloProgress = store.useProgress.getState()
          quiz.click('TRY AGAIN')
          assert.ok(quiz.text().includes('QUESTION 1 / 3'))
        }
      } finally { quiz.dispose() }
    } finally { page.dispose() }
    assert.deepEqual(globalThis.__apolloNavigations, [2, 3, 4, 5].map(n => `/story/${apollo.id}/${n}`))
    const saved = JSON.parse(memory.get(key))
    assert.equal(saved.version, 0); assert.deepEqual(Object.keys(saved.state).sort(), Array.from(new Set([...Object.keys(initial),'roverJourneys'])).sort())
    for (const id of Object.keys(baseline.machineStories)) assert.deepEqual(saved.state.storyProgress[id], initial.storyProgress[id])
    assert.deepEqual(saved.state.completedChapters.filter(id => !id.startsWith(`${apollo.id}:`)), initial.completedChapters)
    assert.deepEqual(saved.state.badges, [...initial.badges, 'apollo-15-rover-storyteller'])
    assert.equal(saved.state.storyProgress[apollo.id].completedMission, true)
    const reload = await loadStore()
    assert.deepEqual(reload.useProgress.getState().storyProgress, saved.state.storyProgress)
    assert.deepEqual(reload.useProgress.getState().badges, saved.state.badges)
  } finally { delete globalThis.window; delete globalThis.__apolloProgress; delete globalThis.__apolloNavigations; delete globalThis.__apolloHooks }
})
