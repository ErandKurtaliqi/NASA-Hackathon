import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { PassThrough } from 'node:stream'
import { test } from 'node:test'
import { build } from 'esbuild'
import React from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
const result = await build({ stdin: { contents: "export {default as App} from './src/App'", resolveDir: root },
  bundle: true, write: false, outfile: `${root}/.application-route-check.cjs`, platform: 'node', format: 'cjs',
  packages: 'external', jsx: 'automatic', loader: { '.css': 'local-css' }, logLevel: 'silent',
  plugins: [{ name: 'server-route-host', setup(build) {
    // Real routes, shell, explorer UI, stories, quiz and dashboard. Only GPU/map
    // internals and progress writes are isolated; this is not browser rendering.
    build.onLoad({ filter: /[\\/](PlanetScene|PlanetMap|RoverScene|LunarRoverScene|IngenuityScene|CinematicScene)\.tsx$/ }, () => ({
      loader: 'tsx', contents: 'export const OfficialRover=()=>null,LunarRover=()=>null;export default function Scene(){return null}' }))
    build.onLoad({ filter: /[\\/]store\.ts$/ }, () => ({ loader: 'ts', contents: `
      const state={completedChapters:[],badges:[],exploredLocations:[],inspectedInstruments:[],
        storyProgress:Object.fromEntries(['apollo-15-rover','apollo-17-rover','apollo-11-reflector','apollo-16-rover','sojourner','opportunity','viking-1','ingenuity'].map(id=>[id,{completed:['meet','journey','challenges','legacy','quiz'],lastChapter:5,completedMission:true}])),
        completeStoryChapter(){throw Error('Render must not complete a chapter')},awardBadge(){throw Error('Render must not award')},exploreLocation(){throw Error('Render must not explore')}};
      export const useProgress=selector=>selector?selector(state):state;
      export const useProgressPersistence=()=>({status:'saved'});
      export const retryProgressSave=()=>{throw Error('Render must not save')};` }))
  } }] })
const module = { exports: {} }
new Function('require', 'module', 'exports', result.outputFiles.find(f => f.path.endsWith('.cjs')).text)(require, module, module.exports)
const { App } = module.exports

function render(path) {
  return new Promise((resolve, reject) => {
    const stream = new PassThrough(), chunks = []
    const deadline = setTimeout(() => { reject(Error(`SSR did not settle: ${path}`)); controller.abort() }, 5000)
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => { clearTimeout(deadline); resolve(Buffer.concat(chunks).toString()) })
    const controller = renderToPipeableStream(React.createElement(StaticRouter, { location: path }, React.createElement(App)), {
      onAllReady() { controller.pipe(stream) },
      onError(error) { clearTimeout(deadline); reject(error) },
    })
  })
}
const validPath = path => /^\/inspection\/(apollo-(15|17)-rover)\/[1-5]$/.test(path) || /^(?:\/|\/explore\/(?:moon|mars)|\/discover|\/hardware|\/dashboard|\/sources|\/story\/(?:apollo-(?:15|16|17)-rover|apollo-11-reflector|sojourner|opportunity|viking-1|ingenuity|follow-perseverance)\/[1-5])$/.test(path)
function assertInternalLinks(html) {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1])
  assert.equal(new Set(ids).size, ids.length, 'No duplicate DOM IDs within a route')
  for (const [, href] of html.matchAll(/\shref="([^"]+)"/g)) {
    if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), `Missing anchor ${href}`)
    else if (href.startsWith('/')) assert.ok(validPath(new URL(href, 'https://example.test').pathname), `Unknown internal destination ${href}`)
  }
}

test('application primary routes render their real frontend and valid internal navigation', async () => {
  for (const [path, heading] of [['/', 'Their missions ended.'], ['/explore/moon', 'Explore Moon'],
    ['/explore/mars', 'Explore Mars'], ['/discover', 'Discover missions'], ['/hardware', 'Machines built'], ['/dashboard', 'Mission control'], ['/sources', 'Sources &amp; attribution']]) {
    const html = await render(path)
    assert.ok(html.replace(/<!--[\s\S]*?-->/g, '').includes(heading), path)
    assert.ok(html.includes('AURORALYS'), path)
    assert.equal((html.match(/<main[\s>]/g) ?? []).length, 1, path)
    assertInternalLinks(html)
  }
})

test('all forty active story routes render in the real shell with controls, evidence and source access', async () => {
  for (const id of ['apollo-15-rover', 'apollo-17-rover', 'apollo-11-reflector', 'apollo-16-rover', 'sojourner', 'opportunity', 'viking-1', 'ingenuity']) for (let chapter = 1; chapter <= 5; chapter++) {
    const html = await render(`/story/${id}/${chapter}`)
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `${id}/${chapter}`)
    assert.ok(html.includes('Story chapters') && html.includes('Mission sources'), `${id}/${chapter}`)
    assert.ok(html.includes('Scientific') || html.includes('scientific'), `${id}/${chapter}`)
    assert.ok(html.includes(chapter === 5 ? 'COMPLETE STORY' : 'NEXT CHAPTER'))
    assert.ok(!html.includes('Play optional narration'), 'No legacy browser TTS control')
    assertInternalLinks(html)
  }
})

test('invalid and unpublished stories recover without mounting narration or quiz', async () => {
  for (const path of ['/story/apollo-15-rover/0', '/story/apollo-17-rover/6', '/story/apollo-11-reflector/1.5',
    '/story/apollo-15-rover/01', '/story/__proto__/1', '/story/follow-perseverance/6', '/story/not-a-mission/1']) {
    const html = await render(path)
    assert.ok(html.includes('Story not found'), path)
    assert.ok(!html.includes('<audio') && !html.includes('COMPLETE STORY'), path)
  }
  assert.ok((await render('/unknown-route')).includes('Signal lost'))
})

test('eight canonical routes and forty legacy links render the full continuous document with one narrator and an in-page quiz', async () => {
  for (const id of ['apollo-15-rover','apollo-17-rover','apollo-11-reflector','apollo-16-rover','sojourner','opportunity','viking-1','ingenuity']) {
    for (const suffix of ['', '/1','/2','/3','/4','/5']) {
      const html = await render(`/story/${id}${suffix}`)
      assert.ok(html.includes(`data-continuous-story="${id}"`))
      assert.equal((html.match(/<audio[\s>]/g) ?? []).length,1)
      for (const chapter of ['meet','journey','challenges','legacy']) assert.ok(html.includes(`data-segment="${id}:${chapter}:1"`))
      assert.ok(html.includes(`data-segment="${id}:quiz"`) && html.includes('COMPLETE STORY'))
      assert.ok(html.includes('Scrollable mission narrative') && html.includes('Recorded narration'))
      assert.equal((html.match(/<main[\s>]/g) ?? []).length,1)
      assertInternalLinks(html)
    }
  }
})

test('master Perseverance and optional lunar 3D expeditions stay reachable without taking over approved documentary routes', async () => {
  for (const path of ['/story/follow-perseverance/1', '/story/follow-perseverance/4', '/inspection/apollo-15-rover/1', '/inspection/apollo-17-rover/1']) {
    const html = await render(path)
    assert.ok(html.includes('rover-documentary') && html.includes('Explore in 3D'), path)
    assert.ok(!html.includes('data-continuous-story='), path)
    assert.equal((html.match(/<main[\s>]/g) ?? []).length, 1)
  }
  for (const id of ['apollo-15-rover','apollo-17-rover']) {
    const html = await render(`/story/${id}/1?view=reader`)
    assert.ok(html.includes(`data-continuous-story="${id}"`))
    assert.ok(!html.includes('rover-documentary'))
  }
  const guide = await render('/discover')
  assert.ok(guide.includes('Science is a story.') && guide.includes('Perseverance tells') && guide.includes('Three clues. One ancient world.'))
  const mars = await render('/explore/mars'), moon = await render('/explore/moon')
  assert.ok(mars.includes('NASA Mars Trek') && !moon.includes('NASA Mars Trek'))
  assert.match(mars, /Loading Mars in 3D/)
  assert.match(moon, /Loading the Moon in 3D/)
  for (const path of ['/inspection/__proto__/1','/inspection/constructor/1','/inspection/unknown/1']) {
    const html = await render(path)
    assert.ok(html.includes('Mission not found') && !html.includes('rover-documentary'))
  }
})
