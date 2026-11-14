import { historicalPerseverance } from './helpers/historical-perseverance.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { build } from 'esbuild'
import postcss from 'postcss'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
async function bundle(contents, plugins = []) {
  const result = await build({ stdin: { contents, resolveDir: root, sourcefile: 'story-check.tsx' },
    bundle: true, write: false, outfile: `${root}/.in-memory-story-check.cjs`, platform: 'node', format: 'cjs',
    packages: 'external', jsx: 'automatic', loader: { '.css': 'local-css' }, plugins: [...plugins, ...(contents.includes('MachineStoryPage') ? [historicalPerseverance] : [])], logLevel: 'silent' })
  const module = { exports: {} }
  new Function('require', 'module', 'exports', result.outputFiles.find(file => file.path.endsWith('.cjs')).text)(require, module, module.exports)
  return module.exports
}
const api = await bundle(`export * from './src/features/storytelling/pilot';
  export * from './src/features/storytelling/scrollController'; export * from './src/features/storytelling/narration';
  export * from './src/features/storytelling/motionPreference'; export {machineStories,chapterMeta} from './src/machineStories';`)

test('safe routing preserves both stories and all five valid chapter numbers', () => {
  for (const id of ['apollo-15-rover','apollo-17-rover','apollo-11-reflector']) for (let chapter = 1; chapter <= 5; chapter++) {
    assert.equal(api.resolveStoryRoute(id, String(chapter)).index, chapter - 1)
    assert.equal(api.isPilotChapter(id, chapter - 1), id === 'follow-perseverance' && chapter <= 2)
  }
  for (const chapter of ['', '0', '-1', '6', '2.5', 'abc', 'Infinity', '01', '1e0']) assert.equal(api.resolveStoryRoute('follow-perseverance', chapter), null)
  for (const id of ['missing', '__proto__', 'constructor', 'toString']) assert.equal(api.resolveStoryRoute(id, '1'), null)
})

test('pilot substeps reuse every profile fact, journey event and narration text', () => {
  const story = api.machineStories['follow-perseverance']
  const meet = api.getPilotSteps(story, 'meet'), journey = api.getPilotSteps(story, 'journey')
  assert.equal(meet.length, 4); assert.equal(journey.length, 5)
  assert.equal(meet[0].copy, story.intro)
  assert.deepEqual(meet.flatMap(step => step.facts), story.profile)
  for (const fact of story.profile) assert.ok(meet.some(step => step.narration.includes(fact.value)))
  journey.forEach((step, index) => {
    assert.equal(step.copy, story.journey[index].copy)
    assert.equal(step.label, story.journey[index].date)
    assert.ok(step.narration.includes(step.copy))
  })
  assert.deepEqual(journey.filter(step => step.landing).map(step => step.id), ['landing'])
})

test('reading line chooses visible cards only, including gaps and reverse scroll', () => {
  assert.equal(api.findReadingStep([{ top: 900, bottom: 1200 }], 800), null)
  assert.equal(api.findReadingStep([{ top: -500, bottom: -1 }], 800), null)
  assert.equal(api.findReadingStep([{ top: -100, bottom: 250 }, { top: 280, bottom: 700 }], 800), 1)
  assert.equal(api.findReadingStep([{ top: 50, bottom: 400 }, { top: 424, bottom: 700 }], 800), 0)
})

test('scroll observation is passive and frame-throttled; buttons focus instantly without scroll interception', () => {
  const listeners = new Map(), frames = new Map(), selected = [], scrolls = [], focus = []
  let id = 0, engaged = 0
  const target = { innerHeight: 800,
    addEventListener(name, handler, options) { listeners.set(name, { handler, options }) },
    removeEventListener(name, handler) { assert.equal(listeners.get(name).handler, handler); listeners.delete(name) },
    requestAnimationFrame(handler) { frames.set(++id, handler); return id }, cancelAnimationFrame(value) { frames.delete(value) } }
  const bounds = [{ top: -400, bottom: -10 }, { top: 50, bottom: 600 }]
  const cards = bounds.map((_, index) => ({ getBoundingClientRect: () => bounds[index], scrollIntoView: value => scrolls.push(value), focus: value => focus.push(value) }))
  const controller = api.createScrollStoryController(target, () => cards, value => selected.push(value), () => engaged++)
  assert.deepEqual([...listeners.keys()], ['scroll', 'resize'])
  assert.equal(listeners.get('scroll').options.passive, true)
  listeners.get('scroll').handler(); listeners.get('scroll').handler()
  assert.equal(frames.size, 1)
  const [key, frame] = frames.entries().next().value; frames.delete(key); frame()
  assert.deepEqual(selected, [1]); assert.equal(engaged, 1); assert.equal(scrolls.length, 0)
  controller.select(0)
  assert.deepEqual(scrolls, [{ behavior: 'instant', block: 'center' }])
  assert.deepEqual(focus, [{ preventScroll: true }])
  controller.select(-1); controller.select(2); controller.select(1.5)
  assert.equal(selected.length, 2)
  listeners.get('scroll').handler(); assert.equal(frames.size, 1)
  controller.dispose(); assert.equal(frames.size, 0); assert.equal(listeners.size, 0)
  controller.select(1); assert.equal(selected.length, 2)
})

function voiceFixture() {
  const utterances = [], states = [], calls = []
  const driver = { cancel() { calls.push('cancel') }, getVoices: () => [{ lang: 'es', localService: true }, { lang: 'en-GB', localService: true }],
    speak(value) { calls.push('speak'); utterances.push(value) } }
  return { utterances, states, calls, driver, session: api.createNarrationSession(driver, text => ({ text }), state => states.push(state)) }
}
test('voice is opt-in, replaces old substeps and ignores stale utterance callbacks', () => {
  const f = voiceFixture()
  f.session.setText('First step'); assert.equal(f.utterances.length, 0)
  f.session.toggle(); assert.equal(f.utterances[0].text, 'First step')
  assert.equal(f.utterances[0].lang, 'en-US'); assert.equal(f.utterances[0].voice.lang, 'en-GB')
  f.session.setText('Next step'); assert.deepEqual(f.calls, ['cancel', 'speak', 'cancel', 'speak'])
  const count = f.states.length
  f.utterances[0].onend(); f.utterances[0].onerror(); assert.equal(f.states.length, count)
  f.session.setText('Next step'); assert.equal(f.utterances.length, 2)
  f.utterances[1].onend(); assert.deepEqual(f.states.at(-1), { enabled: true, status: 'ready' })
  f.session.replay(); assert.equal(f.utterances.length, 3)
  f.session.stop(); f.session.setText('No automatic restart'); assert.equal(f.utterances.length, 3)
  assert.deepEqual(f.states.at(-1), { enabled: false, status: 'off' })
})
test('voice cancellation on chapter exit/disposal and errors leave no active session', () => {
  const f = voiceFixture(); f.session.setText('Read'); f.session.toggle()
  const old = f.utterances[0], count = f.states.length
  f.session.dispose(); assert.equal(f.calls.at(-1), 'cancel')
  old.onend(); old.onerror(); f.session.toggle(); f.session.setText('Unmounted')
  assert.equal(f.states.length, count); assert.equal(f.utterances.length, 1)
  const broken = voiceFixture(); broken.driver.speak = () => { throw Error('Voice unavailable') }
  broken.session.setText('Readable text'); broken.session.toggle()
  assert.deepEqual(broken.states.at(-1), { enabled: false, status: 'error' })
})

test('reduced motion preference is observed initially and when changed, with cleanup', () => {
  let listener, removed
  const values = [], query = { matches: true, addEventListener(type, fn) { assert.equal(type, 'change'); listener = fn }, removeEventListener(type, fn) { removed = fn } }
  const cleanup = api.observeMotionPreference(query, value => values.push(value))
  listener({ matches: false }); listener({ matches: true }); cleanup()
  assert.deepEqual(values, [true, false, true]); assert.equal(removed, listener)
})

const ui = await bundle(`export {default as Page} from './src/components/MachineStoryPage';`, [{ name: 'isolate-3d-and-store-for-render-check', setup(build) {
  build.onLoad({ filter: /[\\/]store\.ts$/ }, () => ({ loader: 'ts', contents: `export const useProgressPersistence=()=>({status:'saved',reason:null}),retryProgressSave=()=>true;export function useProgress(selector){const p=globalThis.__storyPilotProgress;return selector?selector(p):p}` }))
  build.onLoad({ filter: /[\\/](RoverScene|LunarRoverScene|LandingSequence)\.tsx$/ }, () => ({ loader: 'tsx', contents: `export const OfficialRover=()=>null,LunarRover=()=>null;export default function Scene(){return null}` }))
  build.onResolve({ filter: /^@react-three\/(fiber|drei)$/ }, args => ({ path: args.path, namespace: 'scene-test' }))
  build.onLoad({ filter: /.*/, namespace: 'scene-test' }, () => ({ loader: 'tsx', contents: `export function Canvas(){return null};export function Stars(){return null};export function useFrame(){}` }))
} }])
const React = require('react'), { renderToStaticMarkup } = require('react-dom/server'), { StaticRouter, Routes, Route } = require('react-router-dom')
function markup(id, chapter) {
  return renderToStaticMarkup(React.createElement(StaticRouter, { location: `/story/${id}/${chapter}` }, React.createElement(Routes, null,
    React.createElement(Route, { path: '/story/:storyId/:chapter', element: React.createElement(ui.Page) }))))
}
function completedProgress() {
  return { badges: [], completedChapters: [], storyProgress: Object.fromEntries(Object.keys(api.machineStories).map(id => [id, { completed: api.chapterMeta.slice(0, 4).map(c => c.id), lastChapter: 5, completedMission: false }])), completeStoryChapter() {}, awardBadge() {} }
}
test('render checks keep Apollo and Perseverance chapters 3–5 outside the pilot; invalid routes are safe', () => {
  globalThis.__storyPilotProgress = completedProgress()
  for (const id of Object.keys(api.machineStories)) for (let chapter = 1; chapter <= 5; chapter++) {
    const html = markup(id, chapter)
    assert.ok(html.includes(api.chapterMeta[chapter - 1].title.replace(/&/g, '&amp;')), `${id}/${chapter}: chapter title`)
    assert.equal(html.includes('Scroll to follow my story.'), id === 'follow-perseverance' && chapter <= 2)
    for (const source of api.machineStories[id].sources) assert.ok(html.includes(source.url))
    if (id === 'follow-perseverance' && chapter <= 2) {
      assert.ok(html.includes('aria-label="Next story step"'))
      assert.ok(html.includes('aria-label="Previous story step"'))
      assert.ok(html.includes('aria-current="step"'))
      assert.ok(html.includes('tabindex="-1"'))
      assert.ok(!html.includes('HEAR MY STORY'), 'Legacy narrator must not compete with pilot voice')
    }
  }
  for (const [id, chapter] of [['missing', '1'], ['toString', '1'], ['follow-perseverance', 'abc'], ['follow-perseverance', '2.5']]) assert.ok(markup(id, chapter).includes('Story not found'))
  delete globalThis.__storyPilotProgress
})

test('reduced motion starts pilot visuals paused and does not mount the landing automatically', () => {
  globalThis.__storyPilotProgress = completedProgress()
  globalThis.window = { matchMedia: () => ({ matches: true }) }
  try {
    const html = markup('follow-perseverance', '2')
    assert.ok(html.includes('Reduced motion: visuals start paused.'))
    assert.ok(html.includes('Resume visuals'))
    assert.ok(html.includes('Play landing reconstruction'))
    assert.ok(!html.includes('Stop reconstruction'))
  } finally { delete globalThis.window; delete globalThis.__storyPilotProgress }
})

test('existing storage schema, saved progress and Apollo records survive pilot completion', async () => {
  const seed = { completedChapters: ['follow-perseverance:meet'], exploredLocations: ['jezero'], inspectedInstruments: ['supercam'], badges: [],
    storyProgress: { 'follow-perseverance': { completed: ['meet'], lastChapter: 2, completedMission: false }, 'apollo-17-rover': { completed: ['meet', 'journey'], lastChapter: 3, completedMission: false } } }
  const memory = new Map([['beyond-earth-progress', JSON.stringify({ state: seed, version: 0 })]])
  globalThis.window = { localStorage: { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) } }
  try {
    const { useProgress } = await bundle(`export {useProgress} from './src/store';`)
    assert.equal(useProgress.getState().storyProgress['follow-perseverance'].lastChapter, 2)
    useProgress.getState().completeStoryChapter('follow-perseverance', 'journey', 2)
    const saved = JSON.parse(memory.get('beyond-earth-progress'))
    assert.equal(saved.version, 0)
    assert.deepEqual(Object.keys(saved.state).sort(), Array.from(new Set([...Object.keys(seed),'roverJourneys'])).sort())
    assert.deepEqual(saved.state.storyProgress['apollo-17-rover'], seed.storyProgress['apollo-17-rover'])
    assert.deepEqual(saved.state.storyProgress['follow-perseverance'], { completed: ['meet', 'journey'], lastChapter: 3, completedMission: false })
    assert.deepEqual(saved.state.exploredLocations, seed.exploredLocations)
    assert.deepEqual(saved.state.inspectedInstruments, seed.inspectedInstruments)
    assert.deepEqual([...memory.keys()], ['beyond-earth-progress'])
  } finally { delete globalThis.window }
})

test('pilot CSS keeps tap targets, motion alternatives and touch gating scoped', () => {
  const source = readFileSync(new URL('../src/components/storytelling/PerseverancePilot.module.css', import.meta.url), 'utf8')
  const css = postcss.parse(source)
  let targets = false, motion = false, touch = false
  css.walkRules(rule => {
    if (rule.selector === '.pilot button') targets = rule.nodes.some(node => node.prop === 'min-height' && node.value === '44px')
    if (rule.selector.includes('.sceneLocked')) touch = rule.nodes.some(node => node.prop === 'pointer-events' && node.value === 'none' && node.important)
    if (rule.selector.includes(':global(.app-shell)')) assert.ok(rule.selector.includes(':has(.pilot)'), 'Shell change must apply only while the pilot is mounted')
  })
  css.walkAtRules('media', rule => { if (rule.params.includes('prefers-reduced-motion')) motion = /animation: none !important/.test(rule.toString()) })
  assert.ok(targets && motion && touch)
})
