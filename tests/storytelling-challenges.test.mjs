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
  const result = await build({ stdin: { contents, resolveDir: root, sourcefile: 'challenge-check.tsx' }, bundle: true,
    write: false, outfile: `${root}/.challenge-check.cjs`, platform: 'node', format: 'cjs', packages: 'external',
    jsx: 'automatic', loader: { '.css': 'local-css' }, plugins: [...plugins, ...(contents.includes('MachineStoryPage') ? [historicalPerseverance] : [])], logLevel: 'silent' })
  const module = { exports: {} }
  new Function('require', 'module', 'exports', result.outputFiles.find(f => f.path.endsWith('.cjs')).text)(require, module, module.exports)
  return module.exports
}
const api = await bundle(`export {default as Chapter} from './src/components/storytelling/PerseveranceChallenges';
  export * from './src/features/storytelling/challengeMedia'; export {machineStories} from './src/machineStories';`, [{ name: 'challenge-hooks', setup(build) {
  build.onResolve({ filter: /^react$/ }, () => ({ path: 'react', namespace: 'challenge-hooks' }))
  build.onLoad({ filter: /.*/, namespace: 'challenge-hooks' }, () => ({ loader: 'js', contents: `
    export const useId=()=>{const cell=globalThis.__challengeHooks.ref(null);return cell.current??=("host-id-"+(globalThis.__releaseHookId=(globalThis.__releaseHookId??0)+1))};
    export const useLayoutEffect=(...a)=>useEffect(...a);export const useState=(...args)=>globalThis.__challengeHooks.state(...args);
    export const useRef=(...args)=>globalThis.__challengeHooks.ref(...args);
    export const useEffect=(...args)=>globalThis.__challengeHooks.effect(...args);` }))
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
  const hooks = globalThis.__challengeHooks = {
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
    click(label) { const button = all(n => n.type === 'button' && text(n).includes(label))[0]; assert.ok(button, label); button.props.onClick(); render() },
    hide() { document.hidden = true; listeners.get('visibilitychange').forEach(fn => fn()); render() },
    dispose() { instances.forEach(cells => cells.forEach(c => c.cleanup?.())); delete globalThis.window; delete globalThis.document; delete globalThis.__challengeHooks },
  }
}
const evidence = f => f.all(n => n.type === 'figure').map(n => n.props['data-step-media'])
const revealed = f => f.all(n => n.props.id?.startsWith('discovery-') && n.props.hidden === false)

test('challenge selection preserves every original problem/solution and selects relevant evidence', () => {
  const f = fixture()
  try {
    assert.equal(f.interacted(), 0); assert.equal(revealed(f).length, 0)
    story.challenges.forEach((item, index) => {
      f.click(item.title)
      const article = f.all(n => n.props.id === 'perseverance-challenge-detail')[0]
      assert.ok(text(article).includes(item.problem)); assert.ok(text(article).includes(item.solution))
      assert.deepEqual(evidence(f), [api.challengeLessons[index].media.id])
      assert.equal(f.all(n => n.type === 'button' && n.props['aria-pressed'] === true).length, 1)
      assert.equal(revealed(f).length, 0, 'selection does not automatically reveal discoveries')
    })
    assert.equal(f.interacted(), 3)
  } finally { f.dispose() }
})

test('all discovery entries remain independently revealable and never collapse or reset on selection', () => {
  const f = fixture()
  try {
    story.discoveries.forEach((item, index) => {
      f.click(item.title)
      assert.equal(revealed(f).length, index + 1)
      assert.ok(text(revealed(f)[index]).includes(item.detail))
    })
    f.click(story.discoveries[0].title); assert.equal(revealed(f).length, 3)
    f.click(story.challenges[2].title); assert.equal(revealed(f).length, 3)
    assert.equal(f.interacted(), 5)
    assert.deepEqual(evidence(f), ['tubes', 'delta', 'foux', 'tubes'])
    assert.ok(f.all(n => n.type === 'a' && n.props.href.includes('makes-new-discoveries')).length)
  } finally { f.dispose() }
})

test('related log controls reveal the matching discovery and use explicit focus/scroll', () => {
  const f = fixture()
  try {
    api.challengeLessons.forEach((lesson, index) => {
      f.click(story.challenges[index].title); f.click('Open log:')
      const item = story.discoveries[lesson.discovery], element = f.refs.get(item.title)
      assert.ok(element.focused); assert.equal(element.scrolled.behavior, 'auto')
      assert.ok(f.all(n => n.props.id === `discovery-${api.discoveryLessons[lesson.discovery].id}` && n.props.hidden === false).length)
    })
  } finally { f.dispose() }
})

test('reduced motion, image retry, stable optional rover and hidden-document cleanup', () => {
  const f = fixture(true)
  try {
    assert.equal(f.sceneMounts(), 0)
    assert.ok(!f.all(n => n.type === 'img')[0].props.className.includes('motion'))
    f.all(n => n.type === 'img')[0].props.onError(); f.render()
    assert.ok(f.all(n => n.type === 'a' && n.props.href === api.challengeEvidence.hazards.sourceUrl).length)
    f.click('Retry image'); assert.equal(f.all(n => n.type === 'img').length, 1)
    f.click('Open log:'); assert.equal(f.refs.get(story.discoveries[0].title).scrolled.behavior, 'instant')
    f.click('Show 3D rover'); assert.equal(f.sceneMounts(), 1)
    f.click(story.challenges[1].title); f.click(story.discoveries[2].title)
    assert.equal(f.sceneMounts(), 1, 'ordinary interactions must not remount the rover')
    f.click('Enable 3D controls')
    assert.ok(f.all(n => n.type === 'button' && n.props['aria-pressed'] === true && text(n).includes('Done')).length)
    f.all(n => n.props.onKeyDown)[0].props.onKeyDown({ key: 'Escape' }); f.render()
    assert.ok(f.all(n => n.type === 'button' && text(n).includes('Enable 3D controls')).length)
    f.hide(); assert.equal(f.all(n => n.type === 'test-scene').length, 0)
    f.query.change({ matches: false }); f.render(); f.click('Show 3D rover')
    f.query.change({ matches: true }); f.render(); assert.equal(f.all(n => n.type === 'test-scene').length, 0)
  } finally { f.dispose() }
})

test('manifest contains five attributed verified JPEG pairs and explicit scientific caveats', () => {
  for (const media of Object.values(api.challengeEvidence)) {
    assert.ok(media.alt.length > 60 && media.credit && media.usageNotes)
    assert.equal(new URL(media.sourceUrl).hostname, 'www.jpl.nasa.gov')
    for (const width of [720, 1440]) {
      const bytes = readFileSync(`${root}/public/media/perseverance-challenges/${media.id}-${width}.jpg`)
      assert.equal(bytes.readUInt16BE(0), 0xffd8); assert.ok(bytes.length < 450000)
    }
  }
  assert.ok(api.challengeEvidence.autonav.caption.includes('overlays'))
  assert.ok(api.challengeEvidence.tubes.caption.includes('separate photograph'))
  assert.ok(api.challengeEvidence.foux.caption.includes('does not establish'))
  assert.ok(api.challengeEvidence.delta.credit.includes('LANL/CNES/CNRS/ASU/MSSS'))
})

test('chapter CSS keeps full mobile captions, touch targets and reduced motion scoped', () => {
  const css = postcss.parse(readFileSync(`${root}/src/components/storytelling/PerseveranceChallenges.module.css`, 'utf8'))
  let reduced = false
  css.walkRules(rule => {
    if (rule.selector.includes(':global(.machine-story-')) assert.ok(rule.selector.includes(':has(.chapter)'))
    for (const node of rule.nodes) if (node.prop === 'min-height') assert.ok(parseInt(node.value) < 400, 'no large empty panels')
  })
  css.walkAtRules('media', rule => { if (rule.params.includes('prefers-reduced-motion')) reduced = /transition: none !important/.test(rule.toString()) })
  assert.ok(reduced)
  assert.ok(css.toString().includes('clip-path: none'))
  assert.ok(css.toString().includes('min-height: 44px'))
})

test('authorized Chapters 3–5 remain isolated; legacy functions and protected Perseverance routes are identical; Apollo 17 uses the authorized scroll presentation', async () => {
  const baseline = execFileSync('git', ['show', '49f7545:src/components/MachineStoryPage.tsx'], { cwd: root, encoding: 'utf8' })
  // Apply only the authorized landmark/sizing fix to the historical fixture;
  // all other markup and legacy behavior must still compare exactly.
  const landmarkBaseline = baseline.replace("const Stage=pilot?'section':'main'", "const Stage=pilot?'section':'div'")
    .replace('<Stage className="machine-story-stage">', "<Stage className=\"machine-story-stage\" style={pilot?undefined:{minHeight:'calc(100vh - 160px)'}}>")
  const current = readFileSync(`${root}/src/components/MachineStoryPage.tsx`, 'utf8')
  for (const name of ['StoryLoader', 'NarrationButton', 'MachineVisual', 'MeetChapter', 'FlightScene', 'JourneyChapter', 'ChallengeChapter', 'LegacyChapter']) {
    const extract = source => source.slice(source.indexOf(`function ${name}(`), source.indexOf('\n}', source.indexOf(`function ${name}(`)) + 2).replace(/\r\n/g, '\n')
      // Authorized Apollo 15 seam: the historical image belongs only to Apollo 17.
      .replace("const image=story.id==='apollo-17-rover'?", "const image=story.planet==='moon'?")
      // Apollo 15-only recorded question player; scoring/feedback stay identical.
      .replace("{story.id==='apollo-15-rover'&&<Apollo15QuizNarration key={question} question={question}/>}", '')
    assert.equal(extract(current), extract(baseline), name)
  }
  const isolate = { name: 'route-fixtures', setup(build) {
    build.onLoad({ filter: /[\\/]store\.ts$/ }, () => ({ loader: 'ts', contents: `export const useProgressPersistence=()=>({status:'saved',reason:null}),retryProgressSave=()=>true;export function useProgress(){return {badges:[],completedChapters:[],storyProgress:{'follow-perseverance':{completed:['meet','journey','challenges','legacy']},'apollo-17-rover':{completed:['meet','journey','challenges','legacy']}},completeStoryChapter(){},awardBadge(){}}}` }))
    build.onLoad({ filter: /[\\/](RoverScene|LunarRoverScene|LandingSequence)\.tsx$/ }, () => ({ loader: 'tsx', contents: 'export const OfficialRover=()=>null,LunarRover=()=>null;export default function Scene(){return null}' }))
    build.onResolve({ filter: /^@react-three\/(fiber|drei)$/ }, args => ({ path: args.path, namespace: 'scene' }))
    build.onLoad({ filter: /.*/, namespace: 'scene' }, () => ({ loader: 'tsx', contents: 'export function Canvas(){return null};export function Stars(){return null};export function useFrame(){}' }))
  } }
  const entry = `export {default as Page} from './src/components/MachineStoryPage';`
  const before = await bundle(entry, [isolate, { name: 'before-route', setup(build) {
    build.onLoad({ filter: /[\\/]MachineStoryPage\.tsx$/ }, () => ({ loader: 'tsx', contents: landmarkBaseline }))
  } }])
  const after = await bundle(entry, [isolate])
  const { renderToStaticMarkup } = require('react-dom/server'), { StaticRouter, Routes, Route } = require('react-router-dom')
  const markup = (Page, id, chapter) => renderToStaticMarkup(React.createElement(StaticRouter, { location: `/story/${id}/${chapter}` }, React.createElement(Routes, null,
    React.createElement(Route, { path: '/story/:storyId/:chapter', element: React.createElement(Page) }))))
  for (const id of ['follow-perseverance', 'apollo-17-rover']) for (let chapter = 1; chapter <= 5; chapter++) {
    const a = markup(after.Page, id, chapter), b = markup(before.Page, id, chapter)
    if (id === 'follow-perseverance' && chapter >= 3) {
      assert.notEqual(a, b); assert.ok(a.includes(chapter === 3 ? 'Choose an engineering challenge' : chapter === 4 ? 'Choose a legacy milestone' : 'Perseverance knowledge assessment'))
      assert.ok(a.includes('HEAR MY STORY')); assert.ok(a.includes(chapter === 5 ? 'Complete Story' : 'NEXT CHAPTER'))
    } else if(id === 'apollo-17-rover') {
      assert.ok(a.includes('data-story-pilot="apollo-17"')); assert.ok(a.includes(chapter === 5 ? 'QUESTION 1 / 3' : 'Segment 1 of'))
    } else assert.equal(legacyApolloQuizMarkup(a), legacyApolloQuizMarkup(b), `${id}/${chapter}`)
  }
})
