import { beforeMoonScope } from './helpers/moon-scope-contract.mjs'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter, Routes, Route } from 'react-router-dom'
import { withoutReleaseActivity } from './helpers/release-activity-contract.mjs'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
const read = path => readFileSync(`${root}/${path}`, 'utf8').replace(/\r\n/g, '\n')
const baseline = path => execFileSync('git', ['show', `8120d9e:${path}`], { cwd: root, encoding: 'utf8' }).replace(/\r\n/g, '\n')
const publicFiles = (dir = 'public') => readdirSync(`${root}/${dir}`, { withFileTypes: true }).flatMap(item => item.isDirectory() ? publicFiles(`${dir}/${item.name}`) : [`${dir}/${item.name}`])

test('RC preserves the complete existing audio inventory and excludes restricted E/F resources', () => {
  const actual = publicFiles().filter(p => p.endsWith('.mp3')).sort()
  const original = execFileSync('git', ['ls-tree', '-r', '--name-only', '8120d9e', '--', 'public'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(p => p.endsWith('.mp3')).sort()
  assert.deepEqual(actual.filter(p=>!/^public\/audio\/apollo-(11|17)\//.test(p)), original)
  for (const path of original) assert.deepEqual(readFileSync(`${root}/${path}`), execFileSync('git', ['show', `8120d9e:${path}`], { cwd: root, maxBuffer: 2 * 1024 * 1024 }), path)
  for (const path of ['public/audio/apollo-16', 'public/audio/sojourner', 'public/audio/opportunity', 'public/audio/viking-1', 'docs/mars-stories-source', 'docs/apollo16-source']) assert.equal(existsSync(`${root}/${path}`), false, path)
  assert.equal(publicFiles().filter(p => p.endsWith('.pdf')).length, 0)
})

test('RC keeps homepage, explorers, mission identities, science, GIS/3D and persistence unchanged', () => {
  for (const path of ['src/App.tsx', 'src/pages/HomePage.tsx', 'src/pages/HomePage.module.css',
    'src/components/PlanetScene.tsx', 'src/components/RoverScene.tsx', 'src/components/LunarRoverScene.tsx',
    'src/planetaryConfig.ts', 'src/store.ts', 'src/data.ts', 'src/machineStories.ts', 'src/apollo15Narration.ts',
    'src/components/storytelling/StoryRecording.tsx', 'src/features/storytelling/apollo15CaptionTiming.ts']) assert.equal(beforeMoonScope(read(path)), baseline(path), path)
  assert.equal(withoutReleaseActivity(read('src/components/storytelling/Apollo15ScrollStory.tsx')), baseline('src/components/storytelling/Apollo15ScrollStory.tsx'))
})

test('reviewed B and C production modules retain their published candidate contents', () => {
  const groups = [
    ['e9573dad6fd9e61f221a0bb7e1d07775c2da8974', ['src/components/storytelling/Apollo17BrowserVoice.tsx', 'src/components/storytelling/Apollo17ScrollStory.tsx', 'src/components/storytelling/Apollo17ScrollStory.module.css', 'src/features/storytelling/apollo17StorySteps.ts', 'src/features/storytelling/apollo17StoryMedia.ts']],
    ['e9573dad6fd9e61f221a0bb7e1d07775c2da8974', ['src/components/storytelling/activities/EvidencePredictionActivity.tsx', 'src/components/storytelling/activities/EvidencePredictionActivity.module.css', 'src/features/storytelling/activities/apollo15Prediction.ts', 'src/features/storytelling/activities/evidencePrediction.ts']],
  ]
  for (const [ref, paths] of groups) for (const path of paths) assert.equal(read(path), execFileSync('git', ['show', `${ref}:${path}`], { cwd: root, encoding: 'utf8' }).replace(/\r\n/g, '\n'), path)
})

test('all fifteen combined story routes render; the optional activity appears only in Apollo 15 legacy', async () => {
  const output = await build({ stdin: { contents: "export {default as Page} from './src/components/MachineStoryPage'", resolveDir: root }, bundle: true, write: false,
    outfile: `${root}/.release-render.cjs`, platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic', loader: { '.css': 'local-css' }, logLevel: 'silent', plugins: [{ name: 'render-progress', setup(b) {
      b.onLoad({ filter: /[\\/]store\.ts$/ }, () => ({ loader: 'js', contents: `export const useProgress=()=>({badges:[],completedChapters:[],storyProgress:Object.fromEntries(['apollo-15-rover','apollo-17-rover','apollo-11-reflector'].map(id=>[id,{completed:['meet','journey','challenges','legacy'],lastChapter:5}])),completeStoryChapter(){throw Error('render cannot save')},awardBadge(){throw Error('render cannot award')}});export const useProgressPersistence=()=>({status:'saved'}),retryProgressSave=()=>true;` }))
      b.onLoad({ filter: /[\\/](RoverScene|LunarRoverScene|LandingSequence)\.tsx$/ }, () => ({ loader: 'tsx', contents: 'export const OfficialRover=()=>null,LunarRover=()=>null;export default function Scene(){return null}' }))
    } }] })
  const module = { exports: {} }
  new Function('require', 'module', 'exports', output.outputFiles.find(f => f.path.endsWith('.cjs')).text)(require, module, module.exports)
  for (const id of ['apollo-15-rover', 'apollo-17-rover', 'apollo-11-reflector']) for (let chapter = 1; chapter <= 5; chapter++) {
    const html = renderToStaticMarkup(React.createElement(StaticRouter, { location: `/story/${id}/${chapter}` }, React.createElement(Routes, null,
      React.createElement(Route, { path: '/story/:storyId/:chapter', element: React.createElement(module.exports.Page) }))))
    assert.ok(!html.includes('Story not found')); assert.match(html, /complete story|next chapter/i, `${id}/${chapter}`)
    assert.equal(html.includes('OPTIONAL EVIDENCE LAB'), id === 'apollo-15-rover' && chapter === 4, `${id}/${chapter}`)
    if (id === 'apollo-17-rover') assert.ok(html.includes('data-story-pilot="apollo-17"'))
  }
})
