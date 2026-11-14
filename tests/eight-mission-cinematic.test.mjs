import { beforeMasterIntegration } from './helpers/master-integration-contract.mjs'
import { beforeContinuousStory } from './helpers/continuous-story-contract.mjs'
import { beforeAllBranches } from './helpers/all-branches-contract.mjs'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const baselines = JSON.parse(readFileSync(new URL('./fixtures/release-source-baselines.json', import.meta.url),'utf8'))
const sha256 = value => createHash('sha256').update(value).digest('hex')
const source = file => readFileSync(new URL('../'+file, import.meta.url),'utf8').replaceAll('\r\n','\n')
import { ui, freshStore, device, seed, fixture, text } from './helpers/mission-story-host.mjs'

const ids = ['apollo-11-reflector','apollo-15-rover','apollo-16-rover','apollo-17-rover','sojourner','opportunity','viking-1','ingenuity']
for (const id of ids) test(id + ': all cinematic chapters retain one opening, controls, captions, activities and geographic-independent hardware', async () => {
  for (let chapter = 1; chapter <= 5; chapter++) {
    device(seed(id, true)); globalThis.__saveStore = await freshStore()
    const f = fixture(id, chapter)
    try {
      assert.equal(f.all(n => n.props['data-cinematic-story'] === 'true').length, 1)
      assert.equal(f.all(n => n.type === 'h1').length, 1)
      assert.equal(f.all(n => n.props['aria-label'] === 'Story chapters').length, 1)
      const hardware = f.all(n => n.props['data-hardware-kind'])[0]
      assert.ok(hardware)
      assert.equal(hardware.props['data-hardware-kind'], id === 'apollo-11-reflector' ? 'stationary-experiment' : id === 'viking-1' ? 'lander' : id === 'ingenuity' ? 'helicopter' : id.startsWith('apollo') ? 'lunar-rover' : 'rover')
      if (chapter < 5) {
        const articles = f.all(n => n.type === 'article' && (n.props['aria-labelledby']?.includes('segment-') || n.props['aria-labelledby']?.startsWith('moon-')))
        const segmentNavigation = f.all(n => n.props['aria-label'] === 'Story segments')[0]
        const expected = Number(f.text().match(/Segment 1 of (\d+)/)?.[1])
        assert.ok(expected > 0)
        assert.equal(articles.length, expected, 'Every original segment remains rendered exactly once')
        assert.equal(!!segmentNavigation, !['apollo-11-reflector','apollo-17-rover'].includes(id))
        const paragraphs = f.all(n => n.type === 'p')
        const first = f.all(n => n.type === 'p', articles[0])[0]
        assert.ok(first)
        assert.equal(paragraphs.filter(n => text(n) === text(first)).length, 1, 'Opening script must not be duplicated')
        assert.equal(f.all(n => n.type === 'button' && text(n) === 'Next segment').length, 1)
        f.click('Next segment')
        assert.match(f.text(), /Segment 2 of/)
        assert.ok(f.all(n => n.type === 'section' && n.props['aria-label'] === 'Optional mission activities').length)
      }
      if (id !== 'apollo-15-rover') assert.equal(f.all(n => n.props['data-recording-src']).length, 0, 'Private recordings remain deliberately omitted')
    } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window; delete globalThis.document }
  }
})

test('approved Apollo 15 files and CSS prefixes match portable reviewed baselines', () => {
  for (const [file, expected] of Object.entries(baselines.approvedFiles)) assert.equal(sha256(beforeAllBranches(source(file))), expected, file)
  for (const [file, expected] of Object.entries(baselines.approvedPrefixes)) assert.equal(sha256(source(file).slice(0,expected.prefixLength)), expected.sha256, file)
})

test('eight-mission registration, omission policy and progress match reviewed baselines without unpublished Git objects', () => {
  for (const [file, expected] of Object.entries(baselines.integrationFiles)) assert.equal(sha256(file === 'src/components/MachineStoryPage.tsx' ? beforeContinuousStory(source(file)) : beforeMasterIntegration(source(file))), expected, file)
  assert.deepEqual(Object.keys(ui.machineStories).sort(), [...ids].sort())
})
