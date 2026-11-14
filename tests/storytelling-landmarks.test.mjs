import { beforeContinuousStory } from './helpers/continuous-story-contract.mjs'
import { historicalPerseverance } from './helpers/historical-perseverance.mjs'
import { legacyApolloQuizMarkup } from './helpers/apollo-quiz-contract.mjs'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { build } from 'esbuild'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
const checkpoint = execFileSync('git', ['show', 'c7f8bdc:src/components/MachineStoryPage.tsx'], { cwd: root, encoding: 'utf8' })

async function app(storySource) {
  const result = await build({ stdin: { contents: "export {default as App} from './src/App'", resolveDir: root },
    bundle: true, write: false, outfile: `${root}/.landmarks-check.cjs`, platform: 'node', format: 'cjs', packages: 'external',
    jsx: 'automatic', loader: { '.css': 'local-css' }, logLevel: 'silent', plugins: [{ name: 'landmark-render', setup(build) {
      // Render the actual App/Shell/Routes with its story chunk already loaded.
      // Only GPU components and persisted progress are isolated; no browser data is touched.
      build.onLoad({ filter: /[\\/]App\.tsx$/ }, () => {
        // This historical regression compares the old stage markup. The actual
        // continuous App routes have separate unnormalized SSR/browser coverage.
        const source = beforeContinuousStory(readFileSync(`${root}/src/App.tsx`, 'utf8').replace(/\r\n/g, '\n'))
        const lazyStory = "const MachineStoryPage = lazy(() => import('./components/MachineStoryPage'))"
        assert.ok(source.includes(lazyStory))
        return { loader: 'tsx', contents: source.replace(lazyStory, "import MachineStoryPage from './components/MachineStoryPage'") }
      })
      if (storySource) build.onLoad({ filter: /[\\/]MachineStoryPage\.tsx$/ }, () => ({ loader: 'tsx', contents: storySource }))
      build.onLoad({ filter: /[\\/]store\.ts$/ }, () => ({ loader: 'ts', contents: `
        const progress={badges:[],completedChapters:[],storyProgress:{
          'follow-perseverance':{completed:['meet','journey','challenges','legacy'],lastChapter:5},
          'apollo-17-rover':{completed:['meet','journey','challenges','legacy'],lastChapter:5}},
          completeStoryChapter(){throw Error('Rendering must not write progress')},awardBadge(){throw Error('Rendering must not award badges')}};
        export const useProgress=selector=>selector?selector(progress):progress;
        export const useProgressPersistence=()=>({status:'saved',reason:null}),retryProgressSave=()=>true;` }))
      build.onLoad({ filter: /[\\/](RoverScene|LunarRoverScene|LandingSequence|PlanetScene|PlanetMap|CinematicScene)\.tsx$/ }, () => ({ loader: 'tsx', contents: 'export const OfficialRover=()=>null,LunarRover=()=>null;export default function Scene(){return null}' }))
      build.onResolve({ filter: /^@react-three\/(fiber|drei)$/ }, args => ({ path: args.path, namespace: 'no-gpu' }))
      build.onLoad({ filter: /.*/, namespace: 'no-gpu' }, () => ({ loader: 'js', contents: 'export const Canvas=()=>null,Stars=()=>null,useFrame=()=>{},useThree=()=>({});' }))
    } }, historicalPerseverance] })
  const module = { exports: {} }
  new Function('require', 'module', 'exports', result.outputFiles.find(file => file.path.endsWith('.cjs')).text)(require, module, module.exports)
  return module.exports.App
}

const Before = await app(checkpoint), After = await app()
const render = (App, route) => renderToStaticMarkup(React.createElement(StaticRouter, { location: route }, React.createElement(App)))
const mainCount = html => (html.match(/<main\b/g) || []).length
function assertSingleLandmark(html, route) {
  assert.equal(mainCount(html), 1, route)
  assert.equal((html.match(/role="main"/g) || []).length, 0, 'no extra explicit main role')
  let depth = 0
  for (const tag of html.match(/<\/?main\b[^>]*>/g) || []) {
    depth += tag.startsWith('</') ? -1 : 1
    assert.ok(depth >= 0 && depth <= 1, `${route}: no nested main`)
  }
  assert.equal(depth, 0)
}

for (const id of ['follow-perseverance', 'apollo-17-rover']) for (let chapter = 1; chapter <= 5; chapter++) {
  const route = `/story/${id}/${chapter}`
  test(`${route}: one rendered main; protected content retained with the authorized Apollo 17 presentation`, () => {
    const before = render(Before, route), after = render(After, route)
    const affected = id === 'apollo-17-rover' || chapter >= 3
    assert.equal(mainCount(before), affected ? 2 : 1, 'reproduce the original eight affected routes')
    assertSingleLandmark(after, route)
    // Exact rendered comparison permits only the authorized stage tag and the
    // min-height formerly inherited from the global main selector. It also checks
    // all links, buttons, disabled states, tabindex, ARIA and heading structure.
    const expected = affected ? before
      .replace('<main class="machine-story-stage">', '<div class="machine-story-stage" style="min-height:calc(100vh - 160px)">')
      .replace('</main>', '</div>') : before
    if(id === 'apollo-17-rover') {
      assert.ok(after.includes('data-story-pilot="apollo-17"')); assert.ok(after.includes(chapter === 5 ? 'QUESTION 1 / 3' : 'Segment 1 of'))
    } else assert.equal(legacyApolloQuizMarkup(after), legacyApolloQuizMarkup(expected))
  })
}

test('invalid story/chapter routes retain a single shell main and the existing recovery link', () => {
  for (const route of ['/story/missing/1', '/story/follow-perseverance/0', '/story/follow-perseverance/6', '/story/apollo-17-rover/abc']) {
    const html = render(After, route)
    assertSingleLandmark(html, route)
    assert.ok(html.includes('Story not found')); assert.ok(html.includes('href="/hardware"'))
    assert.equal(html, render(Before, route))
  }
})
