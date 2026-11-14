import { beforeAllBranches } from './helpers/all-branches-contract.mjs'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import postcss from 'postcss'
import { localStoryMedia } from '../scripts/localStoryMedia.mjs'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
const master = '3b45e8f2324e8af85e55d81a1020306e95e1706e'
const feature = 'ddb458657e1fa5fca0bd117f265e95b444090712'
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).replaceAll('\r\n', '\n')
const source = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8').replaceAll('\r\n', '\n')
async function bundle(contents) {
  const built = await build({ stdin: { contents, resolveDir: root, loader: 'ts' }, bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', logLevel: 'silent' })
  const module = { exports: {} }
  new Function('require', 'module', 'exports', built.outputFiles[0].text)(require, module, module.exports)
  return module.exports
}

test('master GPU, planetary globe, animation, model, challenge and narration implementations remain byte identical', () => {
  for (const path of ['src/components/PlanetScene.tsx','src/components/PlanetEffects.tsx',
    'src/components/RoverScene.tsx','src/components/LunarRoverScene.tsx','src/components/EsriMarsView.tsx',
    'src/components/MissionAnimations.tsx','src/components/home/HomeEducation.tsx','src/components/rover/CinematicScene.tsx','src/components/rover/NarrationDock.tsx',
    'src/components/rover/RoverChallenge.tsx','src/components/rover/roverExperience.css','src/apollo15Narration.ts']) {
    assert.equal(beforeAllBranches(source(path)), git('show', `${master}:${path}`), path)
  }
})

test('each documentary has one map location and other map markers still have no story entry', async () => {
  const api = await bundle("export * from './src/features/explorer/storyMapLocations'; export * from './src/features/storytelling/storyCatalog'; export { markers } from './src/data'")
  const entries = api.storyMapLocations.flatMap(marker => {
    const story = api.getMapStory(marker)
    return story ? [story.id] : []
  })
  assert.deepEqual(entries.sort(), Object.keys(api.storyCatalog).sort())
  assert.deepEqual(api.storyMapLocations.slice(0, api.markers.length), api.markers)
  assert.equal(api.getMapStory(api.markers.find(marker => marker.id === 'tycho')), undefined)
})

test('approved documentary scripts, mappings and fixed stage geometry survive story refinements', () => {
  for (const path of ['src/features/storytelling/continuousStory.ts','src/features/storytelling/storyCatalog.ts',
    'src/features/storytelling/marsStoryContent.json','src/features/storytelling/moonRecordings.ts',
    'src/features/storytelling/apollo16Recordings.ts','src/features/storytelling/ingenuityStory.ts']) {
    assert.equal(source(path), git('show', `${feature}:${path}`), path)
  }
  // The story viewport, navigation, reader and controls can adapt to available height.
  // Every other selector, declaration and responsive context stays protected.
  const cssPath = 'src/components/storytelling/ContinuousStoryPage.module.css'
  const protectedRules = css => {
    const rules = []
    postcss.parse(css).walkRules(rule => {
      if (/^\.(?:reader|deck|shortcuts|chapters|header|headerActions|title|hint)(?![\w-])/.test(rule.selector) || ['.document', '.document .chapters button', '.document .hardwareLink'].includes(rule.selector) || rule.selector.startsWith(':global(.app-shell):has(.document)')) return
      const context = []
      for (let parent = rule.parent; parent?.type === 'atrule'; parent = parent.parent) context.unshift(`@${parent.name} ${parent.params}`)
      rules.push({ context, selector: rule.selector, declarations: rule.nodes.map(node => node.toString()) })
    })
    return rules
  }
  assert.deepEqual(protectedRules(source(cssPath)), protectedRules(git('show', `${feature}:${cssPath}`)))
  postcss.parse(source(cssPath)).walkRules(rule => {
    if (rule.selector !== '.deck') return
    for (const node of rule.nodes) {
      assert.ok(!['height','block-size'].includes(node.prop), 'Control deck must size from content')
      assert.ok(node.prop !== 'position' || !['absolute','fixed'].includes(node.value), 'Controls remain in document flow')
    }
  })

})

test('master and documentary catalogs retain separate mission data with a single hardware identity and all master map records', async () => {
  const api = await bundle("export * from './src/data';export * from './src/machineStories';export * from './src/features/explorer/integratedStoryEntry';export * from './src/components/rover/roverExperience'")
  assert.equal(new Set(api.hardware.map(h => h.id)).size, api.hardware.length)
  assert.equal(new Set(api.explorerHardware.map(h => h.id)).size, api.explorerHardware.length)
  assert.equal(api.machineStories['apollo-15-rover'].machineId, 'lrv-1')
  assert.equal(api.machineStories['apollo-17-rover'].machineId, 'lrv')
  assert.equal(api.machineStories['apollo-15-rover'].narration, undefined)
  assert.equal(api.getRoverExperience('apollo-15-rover').story.narration.flat().length, 16)
  assert.equal(api.getRoverExperience('apollo-17-rover').story.profile.length, 9)
  assert.equal(api.getRoverExperience('__proto__'), undefined)
  assert.equal(api.getRoverExperience('constructor'), undefined)
  assert.equal(api.getRoverExperience('unknown'), undefined)
  assert.deepEqual(api.explorerHardware.filter(item => item.planet === 'mars').map(item => item.id),
    ['ingenuity', 'sojourner', 'opportunity', 'viking-1'])
  const moonRoster = api.explorerHardware.filter(item => item.planet === 'moon')
  assert.deepEqual(moonRoster.map(item => item.id), ['apollo-11-lrrr', 'lrv', 'lrv-1', 'lrv-2'])
  assert.equal(moonRoster.find(item => item.id === 'lrv').name, 'Apollo 17 Lunar Roving Vehicle')
  const ids = api.explorerHardware.map(h => api.getExplorerStoryEntry(h)?.story.id).filter(Boolean)
  assert.equal(new Set(ids).size, 8)
  assert.ok(!ids.includes('follow-perseverance'))
  assert.ok(api.sources.esriMars && api.sources.marsVisual)
  const masterData = await bundle(git('show', `${master}:src/data.ts`).replace("import type { HardwareProfile, MissionMarker, Story } from './types'", ''))
  for (const marker of masterData.markers) assert.deepEqual(api.markers.find(row => row.id === marker.id), marker)
  for (const [key, value] of Object.entries(masterData.sources)) assert.deepEqual(api.sources[key], value)
})

const key = 'beyond-earth-progress'
for (const variant of ['legacy', 'master', 'documentary', 'combined']) test(`${variant} saves retain progress, journeys, quiz metadata and badges across both workflows and reload`, async () => {
  const initial = { completedChapters: ['apollo-17-rover:meet'], exploredLocations: ['jezero'], inspectedInstruments: ['supercam'],
    badges: ['previous-badge'], storyProgress: { 'apollo-17-rover': { completed: ['meet'], lastChapter: 2, completedMission: false, quizResults: { score: 2 } } },
    quizResults: { archivedAttempt: [1, 0, 2] } }
  if (variant === 'legacy') delete initial.storyProgress
  if (variant === 'master' || variant === 'combined') initial.roverJourneys = { 'follow-perseverance': { visited: ['meet'], challengeComplete: true, completedAt: null } }
  if (variant === 'documentary' || variant === 'combined') initial.storyProgress['apollo-15-rover'] = { completed: ['meet','journey','challenges','legacy','quiz'], lastChapter: 5, completedMission: true }
  let writes = 0, failure = false
  const memory = new Map([[key, JSON.stringify({ state: initial, version: 0 })]])
  globalThis.window = { localStorage: { getItem: k => memory.get(k) ?? null, setItem(k, v) { if (failure) throw Error('Rejected save'); writes++; memory.set(k, v) }, removeItem: k => memory.delete(k) } }
  try {
    const api = await bundle("export * from './src/store'")
    const state = () => api.useProgress.getState()
    assert.equal(writes, 0, 'Hydration does not rewrite old saves')
    assert.deepEqual(state().roverJourneys, initial.roverJourneys ?? {})
    for (const chapter of ['meet','journey','discoveries','challenge','legacy']) state().visitRoverChapter('follow-perseverance', chapter)
    state().solveRoverChallenge('follow-perseverance'); state().finishRoverJourney('follow-perseverance')
    for (const [index, chapter] of ['meet','journey','challenges','legacy','quiz'].entries()) state().completeStoryChapter('apollo-17-rover', chapter, index + 1)
    state().saveStoryQuiz('apollo-17-rover', {answers:[1,0,2],score:2,total:3})
    state().awardBadge('apollo-17-rover-storyteller'); state().awardBadge('apollo-17-rover-storyteller')
    const saved = JSON.parse(memory.get(key))
    assert.equal(saved.version, 0)
    assert.deepEqual(saved.state.quizResults, initial.quizResults)
    if (initial.storyProgress) assert.deepEqual(saved.state.storyProgress['apollo-17-rover'].quizResults, { score: 2 })
    assert.equal(saved.state.storyProgress['apollo-17-rover'].completedMission, true)
    assert.deepEqual(saved.state.storyProgress['apollo-17-rover'].quizResult,{answers:[1,0,2],score:2,total:3})
    assert.equal(saved.state.storyProgress['follow-perseverance'].completed.includes('quiz'), false)
    if (initial.storyProgress?.['apollo-15-rover']) assert.deepEqual(saved.state.storyProgress['apollo-15-rover'], initial.storyProgress['apollo-15-rover'])
    assert.equal(saved.state.badges.filter(id => id === 'follow-perseverance-documentary').length, 1)
    assert.equal(saved.state.badges.filter(id => id === 'apollo-17-rover-storyteller').length, 1)
    const stamp = state().roverJourneys['follow-perseverance'].completedAt
    state().finishRoverJourney('follow-perseverance'); assert.equal(state().roverJourneys['follow-perseverance'].completedAt, stamp)
    const reload = await bundle("export * from './src/store'")
    assert.deepEqual(JSON.parse(JSON.stringify(reload.useProgress.getState())), saved.state)
    failure = true; state().awardBadge('session-only')
    assert.equal(api.useProgressPersistence.getState().status, 'error')
    assert.ok(!JSON.parse(memory.get(key)).state.badges.includes('session-only'))
    failure = false; assert.equal(api.retryProgressSave(), true)
    assert.ok(JSON.parse(memory.get(key)).state.badges.includes('session-only'))
  } finally { delete globalThis.window }
})

test('external original media is opt-in development middleware and has no preview/production hook', () => {
  const plugin = localStoryMedia(undefined)
  assert.equal(typeof plugin.configureServer, 'function')
  assert.equal(plugin.configurePreviewServer, undefined)
  assert.equal(plugin.generateBundle, undefined)
  assert.equal(plugin.load, undefined)
})
