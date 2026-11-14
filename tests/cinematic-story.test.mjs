import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeCinematicSlots } from './helpers/cinematic-contract.mjs'

const root=fileURLToPath(new URL('../',import.meta.url)),require=createRequire(import.meta.url)
const out=await build({stdin:{contents:"export {default as Layout} from './src/components/storytelling/CinematicStoryLayout'; export * from './src/features/storytelling/storyStageAssets';",resolveDir:root},bundle:true,write:false,outfile:`${root}/.cinematic-check.cjs`,platform:'node',format:'cjs',packages:'external',jsx:'automatic',loader:{'.css':'local-css'},logLevel:'silent'})
const mod={exports:{}};new Function('require','module','exports',out.outputFiles.find(f=>f.path.endsWith('.cjs')).text)(require,mod,mod.exports)
const api=mod.exports

test('cinematic slots render opening, player, later reading and evidence once in a heading-first semantic region',()=>{
  const e=React.createElement
  const html=renderToStaticMarkup(e(api.Layout,{intro:e('h1',null,'MISSION'),opening:e('article',{id:'first'},'OPENING'),controls:e('button',null,'PLAYER'),rover:'HARDWARE',evidence:'EVIDENCE',sceneCredits:true},e('article',{id:'later'},'LATER')))
  for(const word of ['OPENING','PLAYER','LATER','HARDWARE','EVIDENCE'])assert.equal((html.match(new RegExp(word,'g'))||[]).length,1,word)
  assert.ok(html.indexOf('<h1')<html.indexOf('<aside'))
  assert.ok(html.indexOf('OPENING')<html.indexOf('PLAYER')&&html.indexOf('PLAYER')<html.indexOf('LATER'))
  assert.equal((html.match(/aria-label="Scroll story and activities"/g)||[]).length,1)
  assert.ok(html.includes('Photographic composition')&&html.includes('not a single mission photograph'))
  assert.ok(!html.includes('<canvas')&&!html.includes('<audio'))
})

test('quiz and stationary lander presentations retain their supplied controls and hardware labels without a fake rover',()=>{
  const html=renderToStaticMarkup(React.createElement(api.Layout,{intro:React.createElement('h1',null,'Viking 1 preview'),world:'mars',storytellerLabel:'Stationary lander presentation',rover:'LANDER',evidence:'SOURCE'},React.createElement('button',null,'QUIZ')))
  assert.ok(html.includes('data-world="mars"')&&html.includes('Stationary lander presentation'))
  assert.equal((html.match(/QUIZ/g)||[]).length,1)
  assert.ok(!html.includes('rover storyteller')&&!html.includes('OPENING'))
  assert.equal(api.marsStageAssetRequirements.status,'awaiting-approved-stage-assets')
})

test('new scene sources are independently attributed NASA Apollo 15 originals; launch is not a relabelled rollout',()=>{
  const assets=api.apollo15StageAssets
  for(const asset of [assets.surface,assets.hardware,api.apollo15OpeningEvidence]){
    for(const key of ['src','sourceUrl'])assert.match(new URL(asset[key]).hostname,/(^|\.)nasa\.gov$/)
    assert.equal(asset.credit,'NASA')
  }
  assert.match(assets.surface.src,/jsc2011e118360/)
  assert.match(assets.hardware.src,/as15-88-11901/)
  assert.match(api.apollo15OpeningEvidence.caption,/S71-41356.*July 26, 1971/)
  assert.match(api.apollo15OpeningEvidence.caption,/distinct from the May rollout/)
})

test('presentation extraction leaves every original hook, callback, story paragraph and activity intact',()=>{
  for(const file of ['Apollo15ScrollStory.tsx','MoonPackageStory.tsx']){
    const p=`src/components/storytelling/${file}`,source=readFileSync(`${root}/${p}`,'utf8').replaceAll('\r\n','\n')
    const baseline=execFileSync('git',['show',`8a77514:${p}`],{cwd:root,encoding:'utf8'}).replaceAll('\r\n','\n')
    assert.equal(beforeCinematicSlots(source),baseline)
    assert.notEqual(beforeCinematicSlots(source.replace('stopRecordedNarration(); navigate','navigate')),baseline,'The contract must not erase handler changes')
  }
})
