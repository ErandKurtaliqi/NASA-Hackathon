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
globalThis.__navReact = React
const result = await build({ stdin: { contents: "export {Shell} from './src/App'", resolveDir: root }, bundle: true,
  write: false, outfile: `${root}/.shared-navigation-check.cjs`, platform: 'node', format: 'cjs', packages: 'external',
  jsx: 'automatic', loader: { '.css': 'local-css' }, logLevel: 'silent', plugins: [{ name: 'shared-navigation-fixture', setup(build) {
    build.onLoad({ filter: /[\\/]App\.tsx$/ }, args => ({ loader: 'tsx', contents: readFileSync(args.path, 'utf8') + '\nexport {Shell}' }))
    build.onResolve({ filter: /^react$/ }, () => ({ path: 'hooks', namespace: 'navigation-hooks' }))
    build.onLoad({ filter: /.*/, namespace: 'navigation-hooks' }, () => ({ loader: 'js', contents: `
      export const Component=globalThis.__navReact.Component,Suspense=p=>p.children,lazy=()=>()=>null,useMemo=fn=>fn(),useCallback=fn=>fn,useReducer=()=>{};
      export const useId=()=>{const cell=globalThis.__navHooks.ref(null);return cell.current??=("host-id-"+(globalThis.__releaseHookId=(globalThis.__releaseHookId??0)+1))};
    export const useLayoutEffect=(...a)=>useEffect(...a);export const useState=(...a)=>globalThis.__navHooks.state(...a),useRef=(...a)=>globalThis.__navHooks.ref(...a),useEffect=(...a)=>globalThis.__navHooks.effect(...a);` }))
    build.onResolve({ filter: /^react-router-dom$/ }, () => ({ path: 'router', namespace: 'navigation-router' }))
    build.onLoad({ filter: /.*/, namespace: 'navigation-router' }, () => ({ loader: 'js', contents: `
      export const Link='a',NavLink='a',Route='route',Routes='routes',Navigate='redirect';
      export const useSearchParams=()=>[new URLSearchParams()];export const useNavigationType=()=> 'PUSH';export const useLocation=()=>globalThis.__navLocation,useNavigate=()=>{},useParams=()=>({});` }))
    build.onLoad({ filter: /[\\/](RoverScene|LunarRoverScene|IngenuityScene|LandingSequence|PlanetScene|PlanetMap|CinematicScene)\.tsx$/ }, () => ({ loader: 'tsx', contents: 'export const OfficialRover=()=>null,LunarRover=()=>null;export default function Scene(){return null}' }))
    build.onResolve({ filter: /^@react-three\/(fiber|drei)$/ }, args => ({ path: args.path, namespace: 'no-gpu' }))
    build.onLoad({ filter: /.*/, namespace: 'no-gpu' }, () => ({ loader: 'js', contents: 'export const Canvas=()=>null,Stars=()=>null,useFrame=()=>{},useThree=()=>({});' }))
  } }] })
const module = { exports: {} }
new Function('require', 'module', 'exports', result.outputFiles.find(f => f.path.endsWith('.cjs')).text)(require, module, module.exports)
const text = node => Array.isArray(node) ? node.map(text).join('') : typeof node === 'object' && node ? text(node.props?.children) : String(node ?? '')
function nodes(node, predicate) {
  if (Array.isArray(node)) return node.flatMap(n => nodes(n, predicate))
  if (!node || typeof node !== 'object') return []
  return [...(predicate(node) ? [node] : []), ...nodes(node.props?.children, predicate)]
}

// Real Shell state/effects/handlers; DOM focus targets are isolated. Native Tab
// order, computed responsive visibility and screen-reader output require Chrome.
function fixture(pathname = '/hardware') {
  const cells = []; let cursor, tree, dirty, pending = [], focused = 'outside', prevented = 0, focusMoves = 0
  globalThis.__navLocation = { pathname, search: '', hash: '', key: 'initial' }
  const toggle = { getClientRects: () => [{}], focus() { focused = 'toggle'; document.activeElement = toggle; focusMoves++ } }
  const firstLink = { focus() { focused = 'first-link'; document.activeElement = firstLink; focusMoves++ } }
  globalThis.document = { activeElement: null }
  const header = { contains: target => target === toggle || target === firstLink || target?.insideHeader === true }
  const nav = { contains: target => target === firstLink, querySelector(selector) { assert.ok(selector === 'a' || selector === 'a[href]'); return firstLink } }
  const slot = init => cells[cursor++] ||= init()
  globalThis.__navHooks = {
    state(init) { const c = slot(() => ({ value: init })); return [c.value, value => {
      const next = typeof value === 'function' ? value(c.value) : value
      if (next !== c.value) { c.value = next; dirty = true }
    }] },
    ref(value) { return slot(() => ({ current: value })) },
    effect(fn, deps) { const c = slot(() => ({})); if (!c.deps || deps.some((v, i) => !Object.is(v, c.deps[i]))) {
      c.deps = deps; pending.push(() => { c.cleanup?.(); c.cleanup = fn() })
    } },
  }
  function all(predicate) { return nodes(tree, predicate) }
  const button = () => all(n => n.type === 'button' && n.props.className === 'menu-button')[0]
  const navigation = () => all(n => n.type === 'nav')[0]
  function render() {
    let passes = 0
    do {
      dirty = false; cursor = 0
      tree = module.exports.Shell({ children: React.createElement('div', { id: 'test-content' }, 'Protected page content') })
      for (const c of cells) if (c.current === toggle || c.current === nav) c.current = null
      for (const n of all(n => n.ref)) n.ref.current = n.type === 'button' ? toggle : n.type === 'nav' ? nav : header
      const effects = pending; pending = []; effects.forEach(fn => fn()); assert.ok(++passes < 10)
    } while (dirty)
  }
  render()
  return { all, button, navigation, render, focus: () => focused, moves: () => focusMoves, prevented: () => prevented,
    clickToggle() { focused = 'toggle'; button().props.onClick(); render() },
    key(key) { all(n => n.type === 'header')[0].props.onKeyDown?.({ key, preventDefault() { prevented++ } }); render() },
    blur(target) { all(n => n.type === 'header')[0].props.onBlur?.({ currentTarget: header, relatedTarget: target }); render() },
    firstLink, toggle,
    navigate(pathname, extra = {}, destinationFocused = true) {
      if (destinationFocused) { focused = 'destination'; document.activeElement = { id: 'page-heading' } }
      globalThis.__navLocation = { pathname, search: '', hash: '', key: String(Math.random()), ...extra }; render()
    },
    dispose() { cells.forEach(c => c.cleanup?.()); delete globalThis.__navHooks; delete globalThis.__navLocation; delete globalThis.document },
  }
}

test('toggle names its action and exposes a stable disclosure relationship without hiding desktop links', () => {
  const f = fixture()
  try {
    const button = f.button(), nav = f.navigation()
    assert.equal(button.props.type, 'button'); assert.equal(button.props['aria-label'], 'Open navigation')
    assert.equal(button.props['aria-expanded'], false); assert.equal(button.props['aria-controls'], nav.props.id)
    assert.ok(nav.props.id); assert.equal(nav.props['aria-label'], 'Main navigation')
    assert.equal(nav.props.hidden, undefined); assert.equal(nav.props['aria-hidden'], undefined); assert.equal(nav.props.inert, undefined)
    assert.equal(nav.props.role, undefined, 'site links keep native navigation semantics, not application menu roles')
    f.clickToggle()
    assert.equal(f.button().props['aria-label'], 'Close navigation'); assert.equal(f.button().props['aria-expanded'], true)
    assert.equal(f.navigation().props.className, 'open'); assert.equal(f.button().props['aria-controls'], f.navigation().props.id)
    for (const icon of nodes(f.button().props.children, n => typeof n === 'object')) assert.equal(icon.props['aria-hidden'], 'true')
  } finally { f.dispose() }
})

test('opening reaches the first link; Escape closes and restores focus; Tab and other keys are not intercepted', () => {
  const f = fixture()
  try {
    assert.equal(f.moves(), 0, 'initial render does not steal focus')
    f.clickToggle(); assert.equal(f.focus(), 'first-link')
    const before = f.moves()
    for (const key of ['Tab', 'ArrowDown', 'Home', 'Enter', ' ']) f.key(key)
    assert.equal(f.moves(), before); assert.equal(f.prevented(), 0)
    assert.equal(f.button().props['aria-expanded'], true)
    f.key('Escape'); assert.equal(f.focus(), 'toggle'); assert.equal(f.button().props['aria-expanded'], false)
    assert.equal(f.navigation().props.className, ''); assert.equal(f.prevented(), 1)
    const closed = f.moves(); f.key('Escape'); assert.equal(f.moves(), closed)
    f.clickToggle(); f.clickToggle(); assert.equal(f.focus(), 'toggle'); assert.equal(f.button().props['aria-expanded'], false)
  } finally { f.dispose() }
})

test('each existing navigation link closes the mobile menu and restores focus even on the current route', () => {
  const f = fixture()
  try {
    const expected = ['/hardware', '/dashboard', '/sources']
    assert.deepEqual(nodes(f.navigation(), n => n.type === 'a').map(n => n.props.to), expected)
    assert.deepEqual(nodes(f.navigation(), n => n.type === 'a').map(text), ['Hardware', 'Mission control', 'Sources'])
    for (const path of expected) {
      f.clickToggle()
      nodes(f.navigation(), n => n.type === 'a' && n.props.to === path)[0].props.onClick(); f.render()
      assert.equal(f.button().props['aria-expanded'], false); assert.equal(f.focus(), 'toggle')
    }
  } finally { f.dispose() }
})

test('route, query/hash and history changes close stale menus without stealing the destination focus', () => {
  const f = fixture()
  try {
    for (const [path, extra] of [['/dashboard', {}], ['/dashboard', { search: '?tab=badges' }], ['/dashboard', { hash: '#rewards' }], ['/hardware', {}]]) {
      f.clickToggle(); const before = f.moves()
      f.navigate(path, extra)
      assert.equal(f.button().props['aria-expanded'], false); assert.equal(f.moves(), before)
    }
    for (const path of ['/', '/explore/mars', '/explore/moon']) {
      f.clickToggle(); const before = f.moves(); f.navigate(path)
      assert.equal(f.all(n => n.type === 'header').length, 0); assert.equal(f.moves(), before)
      f.navigate('/hardware'); assert.equal(f.button().props['aria-expanded'], false)
    }
  } finally { f.dispose() }
})

test('focus can leave the disclosure naturally; internal focus changes do not close it', () => {
  const f = fixture()
  try {
    f.clickToggle(); f.blur(f.firstLink); assert.equal(f.button().props['aria-expanded'], true)
    f.blur(f.toggle); assert.equal(f.button().props['aria-expanded'], true)
    const before = f.moves(); f.blur({ insideHeader: false })
    assert.equal(f.button().props['aria-expanded'], false); assert.equal(f.moves(), before, 'no focus trap or forced restoration on Tab exit')
    f.clickToggle(); f.blur(null); assert.equal(f.button().props['aria-expanded'], false)
  } finally { f.dispose() }
})

test('history navigation rescues focus from the collapsed mobile menu, but never focuses the hidden desktop toggle', () => {
  const f = fixture()
  try {
    f.clickToggle(); f.navigate('/sources', {}, false)
    assert.equal(f.button().props['aria-expanded'], false); assert.equal(f.focus(), 'toggle')
    f.clickToggle(); f.toggle.getClientRects = () => []
    const before = f.moves(); f.navigate('/dashboard', {}, false)
    assert.equal(f.button().props['aria-expanded'], false); assert.equal(f.moves(), before)
  } finally { f.dispose() }
})

test('only Shell/imports change; protected pages, routes, responsive styles and brand remain unchanged', () => {
  const before = execFileSync('git', ['show', '34e2c7c:src/App.tsx'], { cwd: root, encoding: 'utf8' }).replace(/\r\n/g, '\n')
  const after = beforeMoonScope(readFileSync(`${root}/src/App.tsx`, 'utf8').replace(/\r\n/g, '\n'))
  assert.equal(after.slice(after.indexOf('\nfunction Hardware()')), before.slice(before.indexOf('\nfunction Hardware()')))
  assert.equal(after.slice(after.indexOf("import { AnimatePresence"), after.indexOf('function Shell(')), before.slice(before.indexOf("import { AnimatePresence"), before.indexOf('function Shell(')))
  for (const path of ['src/index.css', 'src/pages/HomePage.tsx', 'src/components/explorer/ExplorerHeader.tsx', 'src/components/PlanetScene.tsx',
    'src/components/MachineStoryPage.tsx', 'src/components/MissionDashboard.tsx', 'src/store.ts']) {
    const baseline = execFileSync('git', ['show', `34e2c7c:${path}`], { cwd: root, encoding: 'utf8' }).replace(/\r\n/g, '\n')
    let current = beforeMoonScope(readFileSync(`${root}/${path}`, 'utf8').replace(/\r\n/g, '\n'))
    if (path === 'src/components/MachineStoryPage.tsx') {
      // Apollo quiz feedback is separately tested; preserve the other route seams.
      current = withBaselineApolloQuiz(current, baseline)
      // Authorized Apollo persistence panel and optional Meet Me progression only.
      current = current.replace("import ApolloProgressSaveStatus from './storytelling/ApolloProgressSaveStatus'\n", '')
        .replace("    {(story.id==='apollo-15-rover'||story.id==='apollo-17-rover')&&<ApolloProgressSaveStatus story={story}/>}\n", '')
        .replace("  const optionalMeet=index===0&&(story.id==='apollo-15-rover'||story.id==='apollo-17-rover')\n", '')
        .replace("{interacted||alreadyDone?'INTERACTION COMPLETE':optionalMeet?'EXPLORE OR CONTINUE':'EXPLORE TO CONTINUE'}", "{interacted||alreadyDone?'INTERACTION COMPLETE':'EXPLORE TO CONTINUE'}")
        .replace('disabled={!optionalMeet&&!interacted&&!alreadyDone}', 'disabled={!interacted&&!alreadyDone}')
      // Apollo final completion now reconciles legacy records; protect everything else.
      const start = current.indexOf('  const finish=')
      const end = current.indexOf('\n  const narration=', start)
      const finish = baseline.slice(baseline.indexOf('  const finish='), baseline.indexOf('\n  const narration='))
      current = current.slice(0, start) + finish + current.slice(end)
    }
    assert.equal(current, baseline, path)
  }
  const f = fixture()
  try {
    assert.equal(f.all(n => n.type === 'main').length, 1)
    assert.ok(f.all(n => n.props.className === 'brand').some(n => text(n).includes('AURORALYS')))
    assert.ok(f.all(n => n.type === 'img' && n.props.src === '/images/home/auroralys-mark.svg').length)
    assert.ok(f.all(n => n.type === 'div' && n.props.id === 'test-content').length)
  } finally { f.dispose() }
  const css = postcss.parse(readFileSync(`${root}/src/index.css`, 'utf8'))
  assert.ok(css.toString().includes('button:focus-visible,a:focus-visible'))
  assert.ok(css.toString().includes('.topbar nav.open{display:flex}'))
  assert.ok(css.toString().includes('@media(max-width:980px)'))
})
