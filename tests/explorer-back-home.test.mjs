import assert from 'node:assert/strict'
import {test} from 'node:test'
import {readFileSync} from 'node:fs'
import {build} from 'esbuild'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {StaticRouter} from 'react-router-dom'
import postcss from 'postcss'
const root=fileURLToPath(new URL('../',import.meta.url)),require=createRequire(import.meta.url)
const css=postcss.parse(readFileSync(root+'src/pages/ExplorerPage.module.css','utf8'))
function values(selector){const v={};css.walkRules(r=>{if(r.selector===selector&&!r.parent.name)r.walkDecls(d=>v[d.prop]=d.value)});return v}
test('breadcrumb stays above the overlapping composition and below the header menu',()=>{const crumb=values('.breadcrumb'),header=values('.header');assert.equal(crumb.position,'relative');assert.ok(Number(crumb['z-index'])>0);assert.ok(Number(crumb['z-index'])<Number(header['z-index']));assert.equal(values('.composition')['margin-top'],'-24px','The approved composition is unchanged')})
test('Back to Home retains a 44px native link target and visible keyboard focus without canvas overrides',()=>{assert.equal(values('.backLink')['min-height'],'44px');assert.equal(values('.backLink').display,'inline-flex');let focus=false;css.walkRules(r=>{if(r.selector.includes('a:focus-visible'))r.walkDecls('outline',()=>focus=true)});assert.ok(focus)})
const result=await build({stdin:{contents:"export {default as Header} from './src/components/explorer/ExplorerHeader'",resolveDir:root},bundle:true,write:false,outfile:root+'.back-home.cjs',platform:'node',format:'cjs',packages:'external',jsx:'automatic',loader:{'.css':'local-css'},logLevel:'silent'})
const m={exports:{}};new Function('require','module','exports',result.outputFiles.find(f=>f.path.endsWith('.cjs')).text)(require,m,m.exports)
for(const planet of ['moon','mars'])test(`${planet}: breadcrumb remains an accessible route to the homepage`,()=>{const html=renderToStaticMarkup(React.createElement(StaticRouter,{location:"/explore/"+planet},React.createElement(m.exports.Header,{planet,sound:false,onToggleSound(){}})));assert.match(html,/<a[^>]*href="\/"[^>]*class="[^"]*backLink[^"]*"[^>]*>.*?Back to Home<\/a>|<a[^>]*class="[^"]*backLink[^"]*"[^>]*href="\/"[^>]*>.*?Back to Home<\/a>/);assert.ok(html.includes('Choose a world'))})
