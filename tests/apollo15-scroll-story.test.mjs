import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
const result = await build({ stdin: { contents: `export * from './src/features/storytelling/storyCues';
  export * from './src/features/storytelling/apollo15CaptionTiming'; export * from './src/features/storytelling/apollo15StoryMedia';
  export * from './src/features/storytelling/chapterScrollBoundary'; export {default as Layout} from './src/components/storytelling/RoverStoryLayout';`, resolveDir: root },
  bundle: true, write: false, outfile: `${root}/.pilot-check.cjs`, platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic', loader: { '.css': 'local-css' }, logLevel: 'silent' })
const module = { exports: {} }
new Function('require', 'module', 'exports', result.outputFiles.find(f => f.path.endsWith('.cjs')).text)(require, module, module.exports)
const api = module.exports

test('all 19 Apollo recordings explicitly await timing review; no guessed timestamps are shipped', () => {
  assert.equal(Object.keys(api.apollo15CaptionTiming).length, 19)
  for (const [path, timing] of Object.entries(api.apollo15CaptionTiming)) {
    assert.ok(existsSync(`${root}/public${path}`)); assert.deepEqual(timing, { status: 'pending', cues: [] })
  }
})

test('cue boundaries, gaps, invalid/unreviewed times and backward seeks never fabricate captions', () => {
  const cues = [{ start: 1, end: 2, text: 'one' }, { start: 3, end: 4, text: 'two', mediaId: 'field' }]
  const timing = { status: 'verified', reviewedBy: 'Reviewer', reviewedOn: '2026-11-08', cues }
  for (const t of [-1, 0, 2, 4, NaN, Infinity]) assert.equal(api.cueAt(timing, t), undefined)
  assert.equal(api.cueAt(timing, 3).text, 'two'); assert.equal(api.cueAt(timing, 1).text, 'one')
  for (const invalid of [
    { ...timing, reviewedBy: '' }, { ...timing, reviewedOn: '' }, { status: 'pending', cues },
    { ...timing, cues: [{ start: 1, end: 1, text: 'bad' }] },
    { ...timing, cues: [cues[0], { start: 1.5, end: 4, text: 'overlap' }] },
    { ...timing, cues: [{ start: 0, end: NaN, text: 'bad' }] },
  ]) assert.equal(api.cueAt(invalid, 1.5), undefined)
})

test('six local NASA assets retain verifiable provenance, exact downloaded bytes, types and descriptive alt text', () => {
  const hashes = {
    rover: 'a4efd1fa77b8c9d72d2d81993be9166c8ebc0f1b91746d11e5a7d50a887b7bbd',
    rollout: 'b366eaccfaa2396f7b596d53b8a89dafbf5c2fe93b1e458d90fb256cbab8e405',
    field: '710aa0fc6632730b95ec2a02d7e12da79002aeaa1564a1ee8b8ebb253c8d8024',
    genesis: '11246615f62f9d3e69b13f1fcb22a95e390afa78c7b3b51ed5fcec204de0f2b9',
    hammer: '6f57562c0e0b9136480c47b5c22ed187f7de44a4f38c3843ee4ecc003b376bdb',
    final: '92bef67c89610d7739976ca8cc658f0690e4e52ba98c0fa435b7afc37faa60bb',
  }
  let total = 0
  for (const [id, media] of Object.entries(api.apollo15StoryMedia)) {
    const bytes = readFileSync(`${root}/public${media.src}`); total += bytes.length
    assert.equal(createHash('sha256').update(bytes).digest('hex'), hashes[id])
    for (const field of ['sourceUrl', 'originalUrl', 'usagePolicyUrl']) assert.match(new URL(media[field]).hostname, /(^|\.)nasa.gov$/)
    assert.ok(media.credit.includes('NASA')); assert.ok(media.alt.length > 50); assert.ok(media.caption.length > 80)
    assert.ok(media.usageNotes.includes('no endorsement')); assert.equal(media.verifiedOn, '2026-11-08')
  }
  assert.ok(total < 450000)
  assert.equal(api.apollo15StoryMedia.hammer.kind, 'Video frame · actual mission footage')
  assert.match(api.apollo15StoryMedia.rollout.caption, /not liftoff/)
  assert.match(api.apollo15StoryMedia.final.caption, /not an LRO/)
  assert.deepEqual(api.apollo15SegmentMedia.map(ch => ch.length), [4, 4, 4, 4])
  for (const id of api.apollo15SegmentMedia.flat()) assert.ok(api.apollo15StoryMedia[id])
})

test('three-area layout retains semantic reading order and every slot without a canvas', () => {
  const html = renderToStaticMarkup(React.createElement(api.Layout, { rover: 'ROVER', evidence: 'EVIDENCE' }, 'STORY'))
  assert.ok(html.indexOf('ROVER') < html.indexOf('STORY')); assert.ok(html.indexOf('STORY') < html.indexOf('EVIDENCE'))
  assert.ok(html.includes('aria-label="NASA evidence"')); assert.ok(!html.includes('canvas'))
  const css = readFileSync(`${root}/src/components/storytelling/RoverStoryLayout.module.css`, 'utf8')
  assert.match(css, /max-width: 1100px/); assert.match(css, /max-width: 700px/); assert.match(css, /flex-direction: column/)
})

function boundaryFixture() {
  const listeners = new Map(), target = { scrollY: 0, innerHeight: 800,
    addEventListener(type, fn) { listeners.set(type, fn) }, removeEventListener(type) { listeners.delete(type) } }
  let top = 1000, can = true, advances = 0
  const dispose = api.createChapterScrollBoundary(target, () => ({ getBoundingClientRect: () => ({ top, bottom: top + 100 }) }), () => can, () => advances++)
  return { target, listeners, dispose, top(value) { top = value }, allowed(value) { can = value }, advances: () => advances,
    event(type, event = {}) { listeners.get(type)?.({type,...event}) }, scroll(y) { target.scrollY = y; listeners.get('scroll')?.() } }
}

test('chapter scroll boundary requires downward user intent, reached content and permission; advances once only', () => {
  const f = boundaryFixture()
  assert.equal(f.advances(), 0); f.top(500); f.scroll(20); assert.equal(f.advances(), 0)
  f.event('wheel', { deltaY: -30 }); f.scroll(10); assert.equal(f.advances(), 0)
  f.allowed(false); f.event('wheel', { deltaY: 50 }); f.scroll(30); assert.equal(f.advances(), 0)
  f.allowed(true); f.top(1000); f.event('wheel', { deltaY: 50 }); f.scroll(50); assert.equal(f.advances(), 0)
  f.top(500); f.event('wheel', { deltaY: 50 }); f.scroll(70); assert.equal(f.advances(), 1)
  f.event('wheel', { deltaY: 50 }); f.scroll(90); assert.equal(f.advances(), 1)
  f.dispose(); assert.equal(f.listeners.size, 0)
})

test('chapter boundary supports keyboard/touch without consuming control keys or preventing natural scrolling', () => {
  for (const type of ['touchmove', 'keydown']) {
    const f = boundaryFixture(); f.top(500)
    f.event('keydown', { key: ' ', target: { tagName: 'BUTTON' } }); f.scroll(10); assert.equal(f.advances(), 0)
    f.event(type, { key: 'PageDown', target: { tagName: 'BODY' } }); f.scroll(20); assert.equal(f.advances(), 1); f.dispose()
  }
})
