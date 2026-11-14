import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { build } from 'esbuild'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
const bundle = await build({ stdin: { resolveDir: root, contents: `
  export * from './src/features/storytelling/storyPresentation';
  export {default as Environment} from './src/components/storytelling/StoryEnvironment';
  export {default as Hardware} from './src/components/storytelling/StoryHardware';` },
  bundle: true, write: false, outfile: `${root}/.presentation-check.cjs`, platform: 'node', format: 'cjs',
  packages: 'external', jsx: 'automatic', loader: { '.css': 'local-css' }, logLevel: 'silent' })
const mod = { exports: {} }
new Function('require', 'module', 'exports', bundle.outputFiles.find(f => f.path.endsWith('.cjs')).text)(require, mod, mod.exports)
const api = mod.exports, render = (component, props) => renderToStaticMarkup(React.createElement(component, props))

test('each Moon presentation uses its own verified hardware, not a substitute mission or a GPU scene', () => {
  for (const [id, config] of Object.entries(api.moonStoryPresentation)) {
    const html = render(api.Hardware, { presentation: config, name: id, tagline: 'Read, listen and explore.' })
    assert.ok(html.includes(`data-hardware-kind="${config.hardware}"`))
    assert.ok(html.includes(`aria-label="${id}"`))
    assert.ok(html.includes(config.portrait.sourceUrl) && html.includes('Official source'))
    assert.ok(html.includes('Credit: NASA'))
    assert.ok(!html.includes('<canvas') && !html.includes('<audio'))
    assert.ok(html.includes(`data-hardware-diagram="${config.hardware}"`))
    assert.ok(html.includes('2D') && html.includes('Reference credit: NASA'))
    assert.ok(!html.includes('<img') && !html.includes(config.portrait.src))
    if (id === 'apollo-11-reflector') {
      assert.equal((html.match(/<circle /g) ?? []).length, 100)
      assert.ok(html.includes('100 corner cubes'))
    }
  }
})

test('every Mars presentation resolves a real portrait and renders its hardware panel', () => {
  assert.deepEqual(Object.keys(api.marsStoryPresentation).sort(), ['ingenuity','opportunity','sojourner','viking-1'])
  for (const [id, config] of Object.entries(api.marsStoryPresentation)) {
    assert.ok(config.portrait?.id && config.portrait.credit && config.portrait.sourceUrl, id)
    const html = render(api.Hardware, { presentation: config, name: id, tagline: 'Read, listen and explore.' })
    assert.ok(html.includes(`aria-label="${id}"`), id)
    assert.ok(html.includes(`data-hardware-kind="${config.hardware}"`), id)
    assert.ok(html.includes(config.portrait.sourceUrl), id)
  }
})
test('decorative Moon/Mars terrain has independent SVG resources and no geographic or media claims', () => {
  const html = ['moon', 'mars'].map(world => render(api.Environment, { world, idPrefix: `${world}-test` })).join('')
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1])
  assert.equal(ids.length, new Set(ids).size)
  for (const [, ref] of html.matchAll(/url\(#([^\)]+)\)/g)) assert.ok(ids.includes(ref))
  assert.equal((html.match(/aria-hidden="true"/g) ?? []).length, 2)
  assert.ok(!/<image|<img|<canvas|latitude|longitude/.test(html))
  assert.deepEqual(api.viking1PresentationContract, { world: 'mars', hardware: 'lander', hardwareLabel: 'Viking 1 lander' })
  assert.deepEqual(api.shortChapterLabels, ['Meet Me', 'Journey', 'Discoveries', 'Legacy', 'Quiz'])
})

test('compact visual chapter labels retain the full accessible names and original routing/handlers', () => {
  for (const file of ['Apollo15ScrollStory.tsx', 'MoonPackageStory.tsx']) {
    const source = readFileSync(`${root}/src/components/storytelling/${file}`, 'utf8')
    assert.ok(source.includes('<StoryEnvironment world="moon"'))
    assert.ok(source.includes('<StoryHardware') && source.includes('name={story.name}'))
    assert.match(source, /aria-label=\{`\$\{i \+ 1\}\. \$\{(?:item|chapter)\.title\}`\}/)
    assert.ok(source.includes('to={`/story/${story.id}/${i + 1}`}'))
    assert.ok(source.includes('createChapterScrollBoundary') && source.includes('renderQuiz('))
  }
})

test('source portrait metadata remains valid while the persistent hardware panel stays a lightweight 2D model', () => {
  const configurations = [...Object.values(api.moonStoryPresentation), ...Object.values(api.marsStoryPresentation)]
  for (const config of configurations) {
    if (config.portraitCrop) {
      const crop = config.portraitCrop
      assert.ok(crop.x >= 0 && crop.y >= 0 && crop.width > 0 && crop.height > 0)
      assert.ok(crop.x + crop.width <= config.portrait.width)
      assert.ok(crop.y + crop.height <= config.portrait.height)
    }
    const html = render(api.Hardware, { presentation: config, tagline: 'Mission model' })
    assert.ok(html.includes(`data-hardware-diagram="${config.hardware}"`))
    assert.ok(html.includes(config.portrait.sourceUrl) && html.includes('Official source'))
    assert.ok(!html.includes('data-photo-detail') && !html.includes('<img') && !html.includes('<canvas'))
  }
  assert.equal(api.moonStoryPresentation['apollo-15-rover'].portraitCrop, undefined)
})

test('mission surfaces are isolated by mission and world; fallback remains decorative without invented geography', () => {
  const ids = ['apollo11-terrain','apollo16-terrain','apollo17-terrain','sojourner-terrain','opportunity-terrain','viking-1-terrain','ingenuity-terrain']
  for (const idPrefix of ids) {
    const world = idPrefix.startsWith('apollo') ? 'moon' : 'mars'
    const html = render(api.Environment, { world, idPrefix })
    assert.ok(html.includes(`data-stage-mission="${idPrefix}"`) && html.includes('aria-hidden="true"'))
    assert.ok(html.includes('<img') && !html.includes('jsc2011e118360'))
    assert.ok(!html.includes('latitude') && !html.includes('longitude') && !html.includes('<canvas'))
    const wrongWorld = render(api.Environment, { world: world === 'moon' ? 'mars' : 'moon', idPrefix })
    assert.ok(!wrongWorld.includes('<img') && wrongWorld.includes('<svg'))
  }
})
