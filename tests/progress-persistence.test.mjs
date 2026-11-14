import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { build } from 'esbuild'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
async function freshStore() {
  const result = await build({ stdin: { contents: "export * from './src/store'", resolveDir: root }, bundle: true,
    write: false, platform: 'node', format: 'cjs', packages: 'external', logLevel: 'silent' })
  const module = { exports: {} }
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(require, module, module.exports)
  return module.exports
}
const seed = () => ({ completedChapters: ['apollo-17-rover:meet'], exploredLocations: ['jezero'], inspectedInstruments: ['supercam'],
  badges: ['existing-badge'], storyProgress: { 'apollo-17-rover': { completed: ['meet'], lastChapter: 2, completedMission: false } } })
const key = 'beyond-earth-progress'
function storage(initial = seed()) {
  const memory = new Map([[key, JSON.stringify({ state: initial, version: 0 })]])
  let writes = 0, failure = false
  const localStorage = { getItem: name => memory.get(name) ?? null, setItem(name, value) {
    writes++
    if (failure) throw new DOMException('Storage rejected', 'QuotaExceededError')
    memory.set(name, value)
  }, removeItem: name => memory.delete(name) }
  globalThis.window = { localStorage }
  return { memory, localStorage, writes: () => writes, reject(value) { failure = value } }
}

test('successful writes preserve the exact schema; existing progress reloads without rewriting or duplicate badges', async () => {
  const device = storage(), store = await freshStore()
  try {
    assert.equal(device.writes(), 0)
    assert.deepEqual(store.useProgressPersistence.getState(), { status: 'saved', reason: null })
    store.useProgress.getState().completeStoryChapter('follow-perseverance', 'meet', 1)
    store.useProgress.getState().awardBadge('follow-perseverance-storyteller')
    store.useProgress.getState().awardBadge('follow-perseverance-storyteller')
    const saved = JSON.parse(device.memory.get(key))
    assert.equal(saved.version, 0)
    assert.deepEqual(Object.keys(saved.state).sort(), Array.from(new Set([...Object.keys(seed()),'roverJourneys'])).sort())
    assert.deepEqual(saved.state.badges, ['existing-badge', 'follow-perseverance-storyteller'])
    assert.deepEqual(saved.state.storyProgress['apollo-17-rover'], seed().storyProgress['apollo-17-rover'])
    const writes = device.writes()
    assert.ok(store.retryProgressSave()); assert.equal(device.writes(), writes, 'retry is a no-op when already saved')
    const reload = await freshStore()
    assert.deepEqual(reload.useProgress.getState().badges, saved.state.badges)
    assert.deepEqual(reload.useProgress.getState().storyProgress, saved.state.storyProgress)
    assert.equal(device.writes(), writes)
  } finally { delete globalThis.window }
})

test('a rejected write keeps session changes but reload sees only the last successful save', async () => {
  const device = storage(), before = device.memory.get(key), store = await freshStore()
  try {
    device.reject(true)
    assert.doesNotThrow(() => store.useProgress.getState().awardBadge('unsaved-badge'))
    assert.ok(store.useProgress.getState().badges.includes('unsaved-badge'))
    assert.deepEqual(store.useProgressPersistence.getState(), { status: 'error', reason: 'write' })
    assert.equal(device.memory.get(key), before)
    assert.equal(store.retryProgressSave(), false)
    const reload = await freshStore()
    assert.deepEqual(reload.useProgress.getState().badges, seed().badges)
    assert.equal(device.memory.get(key), before)
  } finally { delete globalThis.window }
})

test('retry acknowledges only a successful write and saves all session changes exactly once', async () => {
  const device = storage(), store = await freshStore(), observed = []
  const unsubscribe = store.useProgressPersistence.subscribe(value => observed.push(value.status))
  try {
    device.reject(true)
    store.useProgress.getState().completeStoryChapter('follow-perseverance', 'quiz', 5)
    store.useProgress.getState().awardBadge('follow-perseverance-storyteller')
    assert.equal(store.retryProgressSave(), false)
    assert.ok(observed.every(status => status !== 'saved'))
    device.reject(false)
    assert.ok(store.retryProgressSave())
    assert.equal(observed.at(-1), 'saved')
    const after = device.memory.get(key), count = device.writes()
    assert.ok(store.retryProgressSave()); assert.equal(device.writes(), count)
    const saved = JSON.parse(after).state
    assert.deepEqual(saved.badges, ['existing-badge', 'follow-perseverance-storyteller'])
    assert.deepEqual(saved.storyProgress['follow-perseverance'].completed, ['quiz'])
    assert.deepEqual(saved.storyProgress['apollo-17-rover'], seed().storyProgress['apollo-17-rover'])
    assert.deepEqual((await freshStore()).useProgress.getState().badges, saved.badges)
  } finally { unsubscribe(); delete globalThis.window }
})

test('save acknowledgement is invalidated before memory changes and stays unconfirmed inside setItem', async () => {
  const device = storage(), store = await freshStore(), observations = []
  const unsubscribe = store.useProgress.subscribe(() => observations.push(store.useProgressPersistence.getState().status))
  const originalWrite = device.localStorage.setItem
  device.localStorage.setItem = (...args) => {
    assert.equal(store.useProgressPersistence.getState().status, 'saving')
    originalWrite(...args)
  }
  try {
    store.useProgress.getState().awardBadge('confirmed-badge')
    assert.deepEqual(observations, ['saving'])
    assert.equal(store.useProgressPersistence.getState().status, 'saved')
    device.reject(true); store.useProgress.getState().awardBadge('session-badge')
    assert.deepEqual(observations, ['saving', 'saving'])
    assert.equal(store.useProgressPersistence.getState().status, 'error')
    assert.equal(store.retryProgressSave(), false)
    assert.equal(observations.at(-1), 'saving')
  } finally { unsubscribe(); delete globalThis.window }
})

test('a later normal progress action also persists previous unsaved changes after storage recovers', async () => {
  const device = storage(), store = await freshStore()
  try {
    device.reject(true); store.useProgress.getState().inspectInstrument('pixl')
    device.reject(false); store.useProgress.getState().exploreLocation('delta')
    assert.equal(store.useProgressPersistence.getState().status, 'saved')
    const saved = JSON.parse(device.memory.get(key)).state
    assert.deepEqual(saved.inspectedInstruments, ['supercam', 'pixl'])
    assert.deepEqual(saved.exploredLocations, ['jezero', 'delta'])
  } finally { delete globalThis.window }
})

test('storage access becoming blocked is handled like a rejected write and remains retryable', async () => {
  const device = storage(), store = await freshStore(), before = device.memory.get(key)
  try {
    Object.defineProperty(globalThis.window, 'localStorage', { configurable: true, get() { throw new DOMException('Blocked', 'SecurityError') } })
    assert.doesNotThrow(() => store.useProgress.getState().awardBadge('session-badge'))
    assert.equal(store.retryProgressSave(), false); assert.equal(device.memory.get(key), before)
    Object.defineProperty(globalThis.window, 'localStorage', { configurable: true, value: device.localStorage })
    assert.ok(store.retryProgressSave())
    assert.ok(JSON.parse(device.memory.get(key)).state.badges.includes('session-badge'))
  } finally { delete globalThis.window }
})

test('unreadable or malformed existing records are never overwritten by default session state or retry', async () => {
  for (const malformed of [false, true]) {
    const device = storage()
    if (malformed) device.memory.set(key, '{broken JSON')
    else device.localStorage.getItem = () => { throw new DOMException('Blocked read', 'SecurityError') }
    const before = device.memory.get(key), store = await freshStore()
    try {
      assert.deepEqual(store.useProgressPersistence.getState(), { status: 'error', reason: 'read' })
      store.useProgress.getState().awardBadge('session-badge')
      assert.equal(store.retryProgressSave(), false)
      assert.equal(device.writes(), 0); assert.equal(device.memory.get(key), before)
      if (!malformed) {
        device.localStorage.getItem = name => device.memory.get(name) ?? null
        const reload = await freshStore()
        assert.deepEqual(reload.useProgress.getState().badges, seed().badges)
        assert.equal(reload.useProgressPersistence.getState().status, 'saved')
        assert.equal(device.memory.get(key), before)
      }
    } finally { delete globalThis.window }
  }
})
