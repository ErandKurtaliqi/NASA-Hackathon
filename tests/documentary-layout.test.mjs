import assert from 'node:assert/strict'
import { test } from 'node:test'
import { build } from 'esbuild'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
const bundle = await build({
  stdin: { contents: `export {default as Page} from './src/components/storytelling/ContinuousStoryPage'; export {storyCatalog} from './src/features/storytelling/storyCatalog'; export {documentarySegments} from './src/features/storytelling/continuousStory'`, resolveDir: root },
  bundle: true, write: false, outfile: 'documentary-layout.cjs', platform: 'node', format: 'cjs', packages: 'external',
  jsx: 'automatic', loader: { '.css': 'empty' }, logLevel: 'silent',
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', bundle.outputFiles.find(file => file.path.endsWith('.cjs')).text)(mod, mod.exports, require)
const { Page, storyCatalog, documentarySegments } = mod.exports

for (const story of Object.values(storyCatalog)) test(`${story.id}: clean narrative retains every scientific review note and source in Mission sources`, () => {
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [`/story/${story.id}/1`] },
    React.createElement(Routes, null, React.createElement(Route, { path: '/story/:storyId/:chapter', element: React.createElement(Page) }))))
  const articles = [...html.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map(match => match[1]).join('')
  assert.ok(articles.length > 0)
  assert.ok(!articles.includes('Scientific clarification'))
  assert.ok(!articles.includes('role="note"'))
  assert.equal((html.match(/Mark [^<]+ complete<\/button>/g) ?? []).length, 4)
  assert.ok(html.includes('COMPLETE STORY'))
  assert.ok(html.includes('aria-label="Story chapters"'))
  const notes = documentarySegments(story).filter(item => item.note)
  if (notes.length) {
    const review = html.match(/<details data-scientific-review="[^"]*">([\s\S]*?)<\/details>/)?.[1]
    assert.ok(review, 'Scientific discrepancies remain available through a native disclosure')
    for (const item of notes) {
      assert.ok(review.includes(renderToStaticMarkup(React.createElement('p', null, item.note))), item.id)
      assert.ok(review.includes(renderToStaticMarkup(React.createElement('a', { href: item.source }, 'source')).split('>')[0]), item.source)
    }
  }
  assert.ok(html.indexOf('<h1>') < html.indexOf('</header>'), 'Mission title shares the compact header')
})
