import { historicalPerseverance } from './helpers/historical-perseverance.mjs'
import { legacyApolloQuizMarkup } from './helpers/apollo-quiz-contract.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { build } from 'esbuild'
import postcss from 'postcss'
import React from 'react'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
async function bundle(contents, plugins = []) {
  const result = await build({ stdin: { contents, resolveDir: root, sourcefile: 'legacy-check.tsx' }, bundle: true,
    write: false, outfile: `${root}/.legacy-check.cjs`, platform: 'node', format: 'cjs', packages: 'external',
    jsx: 'automatic', loader: { '.css': 'local-css' }, plugins: [...plugins, ...(contents.includes('MachineStoryPage') ? [historicalPerseverance] : [])], logLevel: 'silent' })
  const module = { exports: {} }
  new Function('require', 'module', 'exports', result.outputFiles.find(f => f.path.endsWith('.cjs')).text)(require, module, module.exports)
  return module.exports
}
const api = await bundle(`export {default as Chapter} from './src/components/storytelling/PerseveranceLegacy';
  export * from './src/features/storytelling/legacyMilestones'; export {machineStories} from './src/machineStories';`, [{ name: 'legacy-hooks', setup(build) {
  build.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'legacy-hooks' }))
  build.onLoad({ filter: /.*/, namespace: 'legacy-hooks' }, () => ({ loader: 'js', contents: `
    export const useId=()=>{const cell=globalThis.__legacyHooks.ref(null);return cell.current??=("host-id-"+(globalThis.__releaseHookId=(globalThis.__releaseHookId??0)+1))};
    export const useLayoutEffect=(...a)=>useEffect(...a);export const useState=(...args)=>globalThis.__legacyHooks.state(...args);
    export const useRef=(...args)=>globalThis.__legacyHooks.ref(...args);
    export const useEffect=(...args)=>globalThis.__legacyHooks.effect(...args);` }))
} }])
const story = api.machineStories['follow-perseverance']
const text = node => Array.isArray(node) ? node.map(text).join(' ') : typeof node === 'object' && node ? text(node.children) : String(node ?? '')

// Real component, shared image renderer and effect handlers; no browser/3D is
// simulated beyond references, visibility and a scene marker. GPU QA is manual.
function fixture(reduced = false) {
  const instances = new Map(), listeners = new Map(), refs = new Map()
  let current, cursor, pending = [], dirty = false, tree, interacted = 0, sceneMounts = 0, visited
  const query = { matches: reduced, addEventListener(_, fn) { this.change = fn }, removeEventListener() {} }
  globalThis.window = { matchMedia: () => query }
  globalThis.document = { hidden: false,
    addEventListener(n, fn) { listeners.set(n, [...(listeners.get(n) || []), fn]) },
    removeEventListener(n, fn) { listeners.set(n, listeners.get(n).filter(f => f !== fn)) } }
  const slot = init => { const i = cursor++; return current[i] ||= init() }
  const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]))
  const hooks = globalThis.__legacyHooks = {
    state(init) { const cell = slot(() => ({ value: typeof init === 'function' ? init() : init })); return [cell.value, value => {
      const next = typeof value === 'function' ? value(cell.value) : value
      if (!Object.is(next, cell.value)) { cell.value = next; dirty = true }
    }] },
    ref(value) { return slot(() => ({ current: value })) },
    effect(fn, deps) { const cell = slot(() => ({})); if (!same(cell.deps, deps)) { cell.deps = deps; pending.push(() => { cell.cleanup?.(); cell.cleanup = fn() }) } },
  }
  function SceneMarker() { hooks.effect(() => { sceneMounts++ }, []); return React.createElement('test-scene', { interactive: false }) }
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
      const refKey = node.props['aria-label'] || node.props.id || path
      const element = refs.get(refKey) || { focus() { this.focused = true }, scrollIntoView(options) { this.scrolled = options }, contains: () => false }
      refs.set(refKey, element)
      if (typeof node.ref === 'function') node.ref(element); else node.ref.current = element
    }
    return { type: node.type, props: node.props, children: walk(node.props.children, `${path}/children`) }
  }
  function render() {
    let passes = 0
    do {
      dirty = false; visited = new Set()
      tree = walk(React.createElement(api.Chapter, { story, onInteract: () => interacted++, rover: React.createElement(SceneMarker) }), 'chapter')
      for (const [key, cells] of instances) if (!visited.has(key)) { cells.forEach(c => c.cleanup?.()); instances.delete(key) }
      const effects = pending; pending = []; effects.forEach(fn => fn()); assert.ok(++passes < 15)
    } while (dirty)
  }
  function all(predicate, node = tree) {
    if (Array.isArray(node)) return node.flatMap(child => all(predicate, child))
    if (!node || typeof node !== 'object') return []
    return [...(predicate(node) ? [node] : []), ...all(predicate, node.children)]
  }
  render()
  return { all, render, query, refs, interacted: () => interacted, sceneMounts: () => sceneMounts,
    click(label) { const button = all(n => n.type === 'button' && text(n).includes(label))[0]; assert.ok(button, label); if (button.props.disabled) throw Error('Disabled button: '+label); button.props.onClick(); render() },
    hide() { document.hidden = true; listeners.get('visibilitychange').forEach(fn => fn()); render() },
    dispose() { instances.forEach(cells => cells.forEach(c => c.cleanup?.())); delete globalThis.window; delete globalThis.document; delete globalThis.__legacyHooks },
  }
}

const selectedRecord = f => f.all(n => n.props.id === 'legacy-milestone-detail')[0]
const timelineButtons = f => f.all(n => n.type === 'button' && n.props['aria-controls'] === 'legacy-milestone-detail')
const currentImage = f => f.all(n => n.type === 'figure')[0].props['data-step-media']

test('every milestone selects its story, dated evidence and scientific references without changing the five original themes', () => {
  const f = fixture()
  try {
    assert.equal(f.interacted(), 0)
    assert.equal(timelineButtons(f)[0].props['aria-pressed'], true)
    api.legacyMilestones.forEach(item => {
      f.click(item.title)
      const original = item.legacyIndex === undefined ? null : story.legacy[item.legacyIndex]
      assert.ok(text(selectedRecord(f)).includes(original?.copy ?? item.copy))
      assert.ok(text(selectedRecord(f)).includes(item.detail))
      assert.equal(currentImage(f), item.media.id)
      assert.equal(timelineButtons(f).filter(n => n.props['aria-pressed']).length, 1)
      for (const ref of item.references) assert.ok(f.all(n => n.type === 'a' && n.props.href === ref.url).length)
      assert.ok(f.all(n => n.type === 'a' && n.props.href === item.media.sourceUrl).length)
      assert.ok(f.all(n => n.type === 'span' && text(n).includes(item.media.credit)).length)
    })
    assert.equal(f.interacted(), api.legacyMilestones.length)
    assert.deepEqual(api.legacyMilestones.filter(m => m.legacyIndex !== undefined).map(m => m.legacyIndex).sort(), [0, 1, 2, 3, 4])
  } finally { f.dispose() }
})

test('native selection, arrow keys, Home/End and Previous/Next share the same state and respect boundaries', () => {
  const f = fixture(true)
  const key = (index, name) => { let prevented = false; timelineButtons(f)[index].props.onKeyDown({ key: name, preventDefault() { prevented = true } }); f.render(); return prevented }
  try {
    assert.throws(() => f.click('Previous milestone'), /Disabled/)
    assert.equal(key(0, 'ArrowDown'), true); assert.equal(currentImage(f), 'landing')
    assert.equal(key(1, 'End'), true); assert.ok(text(selectedRecord(f)).includes('Possible future outcome'))
    assert.throws(() => f.click('Next milestone'), /Disabled/)
    assert.equal(key(7, 'ArrowLeft'), true); assert.ok(text(selectedRecord(f)).includes('Mission status snapshot'))
    assert.equal(key(6, 'Home'), true); assert.equal(currentImage(f), 'launch')
    assert.equal(key(0, 'Tab'), false)
    f.click('Next milestone'); assert.equal(currentImage(f), 'landing')
    f.click('Previous milestone'); assert.equal(currentImage(f), 'launch')
    assert.ok([...f.refs.values()].some(element => element.focused && element.scrolled.behavior === 'instant'))
  } finally { f.dispose() }
})

test('dates distinguish event, publication, dated status, scientific expectation and undated possibilities', () => {
  assert.equal(api.legacyReviewedOn, '2026-11-04')
  const dated = api.legacyMilestones.filter(m => m.startDate)
  assert.deepEqual(dated.map(m => m.startDate), [...dated.map(m => m.startDate)].sort())
  for (const item of dated) {
    assert.ok(item.startDate <= api.legacyReviewedOn)
    if (item.endDate) assert.ok(item.endDate >= item.startDate && item.endDate <= api.legacyReviewedOn)
    for (const ref of item.references) if (ref.publishedOn) assert.ok(ref.publishedOn <= api.legacyReviewedOn)
  }
  const byId = Object.fromEntries(api.legacyMilestones.map(m => [m.id, m]))
  assert.equal(byId.ingenuity.endDate, '2024-01-18')
  assert.equal(byId.oxygen.startDate, '2021-04-20'); assert.equal(byId.oxygen.endDate, '2023-08-07')
  assert.equal(byId.depot.endDate, '2023-01-28')
  assert.equal(byId.distance.startDate, '2026-10-11'); assert.equal(byId.distance.references[0].publishedOn, '2026-10-12')
  assert.ok(byId.distance.mediaContext.includes('2023') && byId.distance.mediaContext.includes('does not depict'))
  assert.equal(byId.ongoing.category, 'ongoing'); assert.ok(byId.ongoing.expectation.includes('not a confirmed discovery'))
  assert.equal(byId.future.category, 'possible'); assert.equal(byId.future.startDate, undefined)
  const f = fixture()
  try {
    f.click(byId.ongoing.title)
    assert.ok(f.all(n => n.type === 'h3' && text(n).includes('not an established finding')).length)
    f.click(byId.future.title)
    assert.ok(text(selectedRecord(f)).includes('not completed outcomes'))
    assert.ok(text(selectedRecord(f)).includes('No launch date'))
  } finally { f.dispose() }
})

test('local images, provenance, responsive captions and reduced-motion styling remain complete and chapter-scoped', () => {
  for (const item of api.legacyMilestones) {
    const media = item.media
    assert.ok(media.alt.length > 60 && media.credit && media.caption && media.usageNotes && item.mediaContext)
    assert.match(new URL(media.sourceUrl).hostname, /(^|\.)nasa\.gov$/)
    for (const variant of media.srcSet.split(', ')) {
      const bytes = readFileSync(`${root}/public${variant.split(' ')[0]}`)
      assert.equal(bytes.readUInt16BE(0), 0xffd8)
    }
  }
  const css = postcss.parse(readFileSync(`${root}/src/components/storytelling/PerseveranceLegacy.module.css`, 'utf8'))
  css.walkRules(rule => { if (rule.selector.includes(':global(.machine-story-')) assert.ok(rule.selector.includes(':has(.chapter)')) })
  assert.ok(css.toString().includes('clip-path: none'))
  assert.ok(css.toString().includes('min-height: 44px'))
  assert.ok(css.toString().includes('prefers-reduced-motion'))
})

test('image failure/retry, reduced motion and optional 3D preserve model identity across timeline selection', () => {
  const f = fixture(true)
  try {
    assert.equal(f.sceneMounts(), 0)
    assert.ok(!f.all(n => n.type === 'img')[0].props.className.includes('motion'))
    f.all(n => n.type === 'img')[0].props.onError(); f.render()
    assert.equal(f.all(n => n.type === 'img').length, 0)
    assert.ok(f.all(n => n.type === 'a' && text(n).includes('Official source')).length)
    f.click('Retry image'); assert.equal(f.all(n => n.type === 'img').length, 1)
    f.click('Show 3D rover'); assert.equal(f.sceneMounts(), 1)
    f.click('Next milestone'); f.click('Making oxygen on Mars'); assert.equal(f.sceneMounts(), 1)
    f.click('Enable 3D controls')
    f.all(n => n.type === 'div' && n.props.onKeyDown)[0].props.onKeyDown({ key: 'Escape' }); f.render()
    assert.ok(f.all(n => n.type === 'button' && text(n).includes('Enable 3D controls')).length)
    f.hide(); assert.equal(f.all(n => n.type === 'test-scene').length, 0)
    f.query.change({ matches: false }); f.render(); f.click('Show 3D rover')
    f.query.change({ matches: true }); f.render(); assert.equal(f.all(n => n.type === 'test-scene').length, 0)
  } finally { f.dispose() }
})

test('legacy completion retains the real saved-progress schema and Apollo progress', async () => {
  const seed = { completedChapters: ['follow-perseverance:meet', 'follow-perseverance:journey', 'follow-perseverance:challenges'], exploredLocations: ['jezero'], inspectedInstruments: ['supercam'], badges: [],
    storyProgress: { 'follow-perseverance': { completed: ['meet', 'journey', 'challenges'], lastChapter: 4, completedMission: false }, 'apollo-17-rover': { completed: ['meet'], lastChapter: 2, completedMission: false } } }
  const memory = new Map([['beyond-earth-progress', JSON.stringify({ state: seed, version: 0 })]])
  globalThis.window = { localStorage: { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) } }
  try {
    const { useProgress } = await bundle(`export {useProgress} from './src/store';`)
    assert.equal(useProgress.getState().storyProgress['follow-perseverance'].lastChapter, 4)
    useProgress.getState().completeStoryChapter('follow-perseverance', 'legacy', 4)
    const saved = JSON.parse(memory.get('beyond-earth-progress'))
    assert.equal(saved.version, 0); assert.deepEqual(Object.keys(saved.state).sort(), Array.from(new Set([...Object.keys(seed),'roverJourneys'])).sort())
    assert.deepEqual(saved.state.storyProgress['apollo-17-rover'], seed.storyProgress['apollo-17-rover'])
    assert.deepEqual(saved.state.storyProgress['follow-perseverance'], { completed: ['meet', 'journey', 'challenges', 'legacy'], lastChapter: 5, completedMission: false })
    assert.deepEqual(saved.state.exploredLocations, seed.exploredLocations)
  } finally { delete globalThis.window }
})

test('authorized Chapters 4/5 retain protected Perseverance routes and legacy voice helpers; Apollo 17 uses its authorized presentation', async () => {
  const originalRoute = execFileSync('git', ['show', '49f7545:src/components/MachineStoryPage.tsx'], { cwd: root, encoding: 'utf8' })
  // Bring the historical fixture to the authorized landmark/sizing correction
  // before comparing every other part of the rendered routes.
  const landmarkRoute = originalRoute.replace("const Stage=pilot?'section':'main'", "const Stage=pilot?'section':'div'")
    .replace('<Stage className="machine-story-stage">', "<Stage className=\"machine-story-stage\" style={pilot?undefined:{minHeight:'calc(100vh - 160px)'}}>")
  // Reconstruct the already-reviewed Chapter 3 seam on the checkpoint route.
  // Both versions use the current approved pilot and Chapter 3 implementations.
  const beforeLegacy = landmarkRoute.replace("import PerseverancePilot from './storytelling/PerseverancePilot'", "import PerseverancePilot from './storytelling/PerseverancePilot'\nimport PerseveranceChallenges from './storytelling/PerseveranceChallenges'")
    .replace('index===2?<ChallengeChapter story={story} onInteract={()=>setInteracted(true)}/>', "index===2?(story.id==='follow-perseverance'?<PerseveranceChallenges story={story} onInteract={()=>setInteracted(true)} rover={<MachineVisual story={story} interactive={false}/>}/>:<ChallengeChapter story={story} onInteract={()=>setInteracted(true)}/>)")
  const currentRoute = readFileSync(`${root}/src/components/MachineStoryPage.tsx`, 'utf8')
  for (const name of ['StoryLoader', 'NarrationButton', 'MachineVisual', 'MeetChapter', 'FlightScene', 'JourneyChapter', 'ChallengeChapter', 'LegacyChapter']) {
    const extract = source => source.slice(source.indexOf(`function ${name}(`), source.indexOf('\n}', source.indexOf(`function ${name}(`)) + 2).replace(/\r\n/g, '\n')
      // Authorized Apollo 15 seam: the historical image belongs only to Apollo 17.
      .replace("const image=story.id==='apollo-17-rover'?", "const image=story.planet==='moon'?")
      // Apollo 15-only recorded question player; scoring/feedback stay identical.
      .replace("{story.id==='apollo-15-rover'&&<Apollo15QuizNarration key={question} question={question}/>}", '')
    assert.equal(extract(currentRoute), extract(originalRoute), name)
  }
  const isolate = { name: 'route-fixtures', setup(build) {
    build.onLoad({ filter: /[\\/]store\.ts$/ }, () => ({ loader: 'ts', contents: `export const useProgressPersistence=()=>({status:'saved',reason:null}),retryProgressSave=()=>true;export function useProgress(){return {badges:[],completedChapters:[],storyProgress:{'follow-perseverance':{completed:['meet','journey','challenges','legacy']},'apollo-17-rover':{completed:['meet','journey','challenges','legacy']}},completeStoryChapter(){},awardBadge(){}}}` }))
    build.onLoad({ filter: /[\\/](RoverScene|LunarRoverScene|LandingSequence)\.tsx$/ }, () => ({ loader: 'tsx', contents: 'export const OfficialRover=()=>null,LunarRover=()=>null;export default function Scene(){return null}' }))
    build.onResolve({ filter: /^@react-three\/(fiber|drei)$/ }, args => ({ path: args.path, namespace: 'scene' }))
    build.onLoad({ filter: /.*/, namespace: 'scene' }, () => ({ loader: 'tsx', contents: 'export function Canvas(){return null};export function Stars(){return null};export function useFrame(){}' }))
  } }
  const entry = `export {default as Page} from './src/components/MachineStoryPage';`
  const before = await bundle(entry, [isolate, { name: 'before-legacy', setup(build) {
    build.onLoad({ filter: /[\\/]MachineStoryPage\.tsx$/ }, () => ({ loader: 'tsx', contents: beforeLegacy }))
  } }])
  const after = await bundle(entry, [isolate])
  const { renderToStaticMarkup } = require('react-dom/server'), { StaticRouter, Routes, Route } = require('react-router-dom')
  const markup = (Page, id, chapter) => renderToStaticMarkup(React.createElement(StaticRouter, { location: `/story/${id}/${chapter}` }, React.createElement(Routes, null,
    React.createElement(Route, { path: '/story/:storyId/:chapter', element: React.createElement(Page) }))))
  for (const id of ['follow-perseverance', 'apollo-17-rover']) for (let chapter = 1; chapter <= 5; chapter++) {
    const a = markup(after.Page, id, chapter), b = markup(before.Page, id, chapter)
    if (id === 'follow-perseverance' && (chapter === 4 || chapter === 5)) {
      assert.notEqual(a, b); assert.ok(a.includes(chapter === 4 ? 'Choose a legacy milestone' : 'Perseverance knowledge assessment')); assert.ok(a.includes('HEAR MY STORY')); assert.ok(a.includes(chapter === 4 ? 'NEXT CHAPTER' : 'Complete Story'))
    } else if(id === 'apollo-17-rover') {
      assert.ok(a.includes('data-story-pilot="apollo-17"')); assert.ok(a.includes(chapter === 5 ? 'QUESTION 1 / 3' : 'Segment 1 of'))
    } else assert.equal(legacyApolloQuizMarkup(a), legacyApolloQuizMarkup(b), `${id}/${chapter}`)
  }
})
