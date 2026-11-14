import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { build } from 'esbuild'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
async function bundle(contents, plugins = []) {
  const result = await build({ stdin: { contents, resolveDir: root }, bundle: true, write: false,
    outfile: `${root}/.activity-check.cjs`, platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic',
    loader: { '.css': 'local-css' }, plugins, logLevel: 'silent' })
  const module = { exports: {} }
  new Function('require', 'module', 'exports', result.outputFiles.find(f => f.path.endsWith('.cjs')).text)(require, module, module.exports)
  return module.exports
}
const entry = `export * from './src/features/storytelling/activities/evidencePrediction';
  export {apollo15HammerFeatherPrediction as activity} from './src/features/storytelling/activities/apollo15Prediction';
  export {apollo15StoryMedia} from './src/features/storytelling/apollo15StoryMedia';
  export {default as Activity} from './src/components/storytelling/activities/EvidencePredictionActivity';`
const api = await bundle(entry)
const interactive = await bundle(entry, [{ name: 'activity-hooks', setup(build) {
  build.onResolve({ filter: /^react$/ }, () => ({ path: 'hooks', namespace: 'activity-hooks' }))
  build.onLoad({ filter: /.*/, namespace: 'activity-hooks' }, () => ({ loader: 'js', contents: `
    export const useLayoutEffect=(...a)=>useEffect(...a);export const useState=(...a)=>globalThis.__activityHooks.state(...a),useRef=(...a)=>globalThis.__activityHooks.ref(...a),useEffect=(...a)=>globalThis.__activityHooks.effect(...a),useId=()=>globalThis.__activityHooks.id();` }))
} }])

const text = n => Array.isArray(n) ? n.map(text).join('') : typeof n === 'object' && n ? text(n.children) : String(n ?? '')
function fixture({ activity = interactive.activity, strictEffects = true } = {}) {
  const instances = new Map(), refs = new Map()
  let current, cursor, pending = [], dirty, tree, visited, focused = null, id = 0
  const slot = init => current[cursor++] ||= init()
  globalThis.__activityHooks = {
    state(init) { const c = slot(() => ({ value: typeof init === 'function' ? init() : init })); return [c.value, value => {
      const next = typeof value === 'function' ? value(c.value) : value
      if (!Object.is(next, c.value)) { c.value = next; dirty = true }
    }] },
    ref(value) { return slot(() => ({ current: value })) },
    id() { return slot(() => ({ value: `activity-${++id}` })).value },
    effect(fn, deps) { const c = slot(() => ({})); if (!c.deps || deps.some((value, i) => !Object.is(value, c.deps[i]))) {
      const mount = !c.deps; c.deps = deps
      pending.push(() => { c.cleanup?.(); c.cleanup = fn(); if (strictEffects && mount) { c.cleanup?.(); c.cleanup = fn() } })
    } },
  }
  function walk(node, path) {
    if (node == null || typeof node === 'boolean') return null
    if (Array.isArray(node)) return node.map((child, i) => walk(child, `${path}/${child?.key ?? i}`))
    if (typeof node !== 'object') return node
    if (typeof node.type === 'function') {
      const key = `${path}:${node.type.name}:${node.key ?? ''}`
      visited.add(key); current = instances.get(key) ?? []; instances.set(key, current); cursor = 0
      return walk(node.type(node.props), `${key}/out`)
    }
    if (node.ref) {
      const key = node.props.id ?? `${path}:${node.type}`
      const element = refs.get(key) ?? { focus() { focused = key }, scrollIntoView(options) { this.scroll = options } }
      refs.set(key, element); node.ref.current = element
    }
    return { type: node.type, props: node.props, children: walk(node.props.children, `${path}/children`) }
  }
  function render(nextActivity = activity) {
    activity = nextActivity; let passes = 0
    do {
      dirty = false; visited = new Set(); tree = walk(React.createElement(interactive.Activity, { activity }), 'root')
      for (const [key, cells] of instances) if (!visited.has(key)) { cells.forEach(cell => cell.cleanup?.()); instances.delete(key) }
      const effects = pending; pending = []; effects.forEach(fn => fn()); assert.ok(++passes < 12)
    } while (dirty)
  }
  function all(predicate, node = tree) {
    if (Array.isArray(node)) return node.flatMap(child => all(predicate, child))
    if (!node || typeof node !== 'object') return []
    return [...(predicate(node) ? [node] : []), ...all(predicate, node.children)]
  }
  render()
  return { render, all, refs, focused: () => focused, text: () => text(tree),
    choose(choice) { all(node => node.type === 'input' && node.props.value === choice)[0].props.onChange(); render() },
    submit() { let prevented = false; all(node => node.type === 'form')[0].props.onSubmit({ preventDefault() { prevented = true } }); render(); assert.ok(prevented) },
    retry() { all(node => node.type === 'button' && text(node) === 'Try another prediction')[0].props.onClick(); render() },
    dispose() { instances.forEach(cells => cells.forEach(cell => cell.cleanup?.())); delete globalThis.__activityHooks },
  }
}

test('C: verified Apollo 15 activity reuses actual mission evidence with source, credit and a careful observation claim', () => {
  const activity = api.activity
  assert.equal(activity.evidence, api.apollo15StoryMedia.hammer)
  assert.equal(activity.evidence.kind, 'Video frame · actual mission footage')
  assert.ok(activity.evidence.credit.includes('NASA'))
  assert.ok(activity.observation.includes('August 2, 1971'))
  assert.ok(activity.observation.includes('within the accuracy'))
  assert.ok(activity.interpretation.includes('one still cannot establish'))
  assert.equal(new Set(activity.options.map(item => item.id)).size, 3)
  assert.ok(activity.options.some(item => item.id === activity.answerId))
  for (const source of activity.sources) assert.match(new URL(source.url).hostname, /(^|\.)nasa.gov$/)
})

test('C: every prediction has specific educational feedback; unknown choices never produce a result', () => {
  const before = JSON.stringify(api.activity)
  for (const option of api.activity.options) {
    const review = api.reviewPrediction(api.activity, option.id)
    assert.equal(review.correct, option.id === 'together'); assert.equal(review.feedback, option.feedback)
    assert.ok(review.feedback.length > 80)
  }
  for (const choice of [null, '', 'unknown', '__proto__']) assert.equal(api.reviewPrediction(api.activity, choice), undefined)
  assert.equal(JSON.stringify(api.activity), before)
})

test('C: prediction selection reveals no answer, evidence image or scientific explanation before submission', () => {
  const f = fixture()
  try {
    assert.equal(f.focused(), null, 'StrictMode entry never steals focus')
    const button = () => f.all(node => node.type === 'button' && node.props.type === 'submit')[0]
    assert.equal(button().props.disabled, true); f.submit()
    assert.equal(f.all(node => node.type === 'img').length, 0)
    for (const option of api.activity.options) {
      f.choose(option.id); assert.equal(button().props.disabled, false)
      assert.equal(f.all(node => node.type === 'img').length, 0)
      assert.ok(!f.text().includes(option.feedback)); assert.ok(!f.text().includes(api.activity.observation))
    }
  } finally { f.dispose() }
})

test('C: all correct/incorrect submissions show feedback, original NASA attribution and deliberate retry', () => {
  for (const option of api.activity.options) {
    const f = fixture()
    try {
      f.choose(option.id); f.submit()
      assert.ok(f.text().includes(option.feedback)); assert.ok(f.text().includes(api.activity.observation))
      assert.ok(f.text().includes(option.id === 'together' ? 'matches the observation' : 'refine your prediction'))
      assert.equal(f.all(node => node.type === 'fieldset')[0].props.disabled, true)
      assert.equal(f.all(node => node.type === 'img')[0].props.src, api.activity.evidence.src)
      assert.equal(f.all(node => node.type === 'img')[0].props.alt, api.activity.evidence.alt)
      assert.ok(f.text().includes('Credit: NASA'))
      assert.ok(f.all(node => node.type === 'a' && node.props.href === api.activity.sources[0].url).length)
      const heading = f.all(node => node.type === 'h3' && node.props.tabIndex === -1)[0]
      assert.equal(f.focused(), heading.props.id); assert.equal(f.refs.get(f.focused()).scroll.behavior, 'instant')
      assert.equal(f.all(node => node.props['aria-live']).length, 0, 'no duplicate feedback announcement')
      f.choose(option.id === 'together' ? 'hammer' : 'together'); f.submit()
      assert.ok(f.text().includes(option.feedback), 'submitted choice is locked')
      f.retry(); assert.equal(f.all(node => node.type === 'input' && node.props.checked).length, 0)
      assert.equal(f.all(node => node.type === 'img').length, 0)
      assert.equal(f.all(node => node.type === 'button' && node.props.type === 'submit')[0].props.disabled, true)
      assert.ok(f.focused().endsWith(':legend'))
    } finally { f.dispose() }
  }
})

test('C: native form/radio semantics preserve keyboard operation, unique groups and descriptive focus targets', () => {
  const f = fixture()
  try {
    const radios = f.all(node => node.type === 'input')
    assert.equal(radios.length, 3); assert.ok(radios.every(node => node.props.type === 'radio'))
    assert.equal(new Set(radios.map(node => node.props.name)).size, 1)
    assert.ok(radios.every(node => node.props.onKeyDown === undefined && node.props.tabIndex === undefined))
    assert.equal(f.all(node => node.type === 'label').length, 3)
    assert.ok(f.all(node => node.type === 'fieldset')[0].props['aria-describedby'])
    const markup = renderToStaticMarkup(React.createElement(React.Fragment, null,
      React.createElement(api.Activity, { activity: api.activity }), React.createElement(api.Activity, { activity: api.activity })))
    const names = [...markup.matchAll(/name="([^"]+)"/g)].map(match => match[1])
    assert.equal(new Set(names).size, 2, 'two instances do not share a radio group')
  } finally { f.dispose() }
})

test('C: changing the activity resets the local attempt without any store, navigation, audio or WebGL dependency', () => {
  const f = fixture()
  const previousWindow = globalThis.window
  globalThis.window = { localStorage: { setItem() { throw Error('Activity must not write progress') } } }
  try {
    f.choose('together'); f.submit()
    f.render({ ...api.activity, id: 'another-evidence-prediction' })
    assert.equal(f.all(node => node.type === 'img').length, 0)
    assert.equal(f.all(node => node.type === 'input' && node.props.checked).length, 0)
    const source = readFileSync(`${root}/src/components/storytelling/activities/EvidencePredictionActivity.tsx`, 'utf8')
    assert.ok(!/useProgress\s*\(|localStorage|useNavigate\s*\(|<Canvas|<audio/.test(source))
    assert.ok(!/from ['"][^'"]*(store|router|three|Narration)/.test(source))
  } finally { f.dispose(); globalThis.window = previousWindow }
})

test('C: evidence errors retain original source access; retry does not require repeating the prediction', () => {
  const f = fixture()
  try {
    f.choose('hammer'); f.submit()
    f.all(node => node.type === 'img')[0].props.onError(); f.render()
    assert.ok(f.text().includes('The mission image could not load'))
    assert.ok(f.all(node => node.type === 'a' && node.props.href === api.activity.evidence.sourceUrl).length)
    f.all(node => node.type === 'button' && text(node) === 'Retry image')[0].props.onClick(); f.render()
    assert.equal(f.all(node => node.type === 'img').length, 1)
    assert.ok(f.text().includes(api.activity.options[0].feedback))
  } finally { f.dispose() }
})

test('C: responsive activity CSS keeps captions, touch targets and focus visible without animations', () => {
  const css = readFileSync(`${root}/src/components/storytelling/activities/EvidencePredictionActivity.module.css`, 'utf8')
  for (const token of ['min-height: 44px', 'min-height: 52px', 'focus-visible', 'max-width: 480px', 'prefers-reduced-motion', 'position: static', 'clip-path: none']) assert.ok(css.includes(token))
  assert.ok(!css.includes('position: fixed')); assert.ok(!css.includes('animation-name'))
})
