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
  stdin: { contents: `export {default as Page} from './src/components/storytelling/ContinuousStoryPage'; export {storyCatalog} from './src/features/storytelling/storyCatalog'; export {documentarySegments} from './src/features/storytelling/continuousStory'; export {apollo15Narration} from './src/apollo15Narration'; export {apollo16ChapterRecordings} from './src/features/storytelling/apollo16Recordings'`, resolveDir: root },
  bundle: true, write: false, outfile: 'documentary-layout.cjs', platform: 'node', format: 'cjs', packages: 'external',
  jsx: 'automatic', loader: { '.css': 'empty' }, logLevel: 'silent',
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', bundle.outputFiles.find(file => file.path.endsWith('.cjs')).text)(mod, mod.exports, require)
const { Page, storyCatalog, documentarySegments, apollo15Narration, apollo16ChapterRecordings } = mod.exports

function renderStory(id) {
  return renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [`/story/${id}/1`] },
    React.createElement(Routes, null, React.createElement(Route, { path: '/story/:storyId/:chapter', element: React.createElement(Page) }))))
}
function articleFor(html, id) {
  const article = html.match(new RegExp(`<article\\b(?=[^>]*data-segment="${id}")[^>]*>([\\s\\S]*?)<\\/article>`))?.[1]
  assert.ok(article, id)
  return article
}
// Only the narrative paragraphs immediately after the title. Nested activity
// details may legitimately repeat legacy text and must remain available.
const narrativeParagraphs = article => article.match(/<\/h2>((?:<p>[\s\S]*?<\/p>)+)/)?.[1].match(/<p>[\s\S]*?<\/p>/g) ?? []

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

for (const chapter of [1, 3]) for (const [index, recording] of apollo15Narration[chapter].entries()) {
  test(`Apollo 15 ${recording.title}: one unchanged main paragraph without the redundant second paragraph`, () => {
    const story = storyCatalog['apollo-15-rover'], segment = documentarySegments(story).find(s => s.chapter === chapter && s.segment === index)
    const article = articleFor(renderStory(story.id), segment.id)
    assert.deepEqual(narrativeParagraphs(article), [renderToStaticMarkup(React.createElement('p', null, recording.text))])
    assert.equal(segment.text, recording.text)
    assert.equal(segment.audio, recording.audio)
    const shared = (chapter === 1 ? story.journey : story.legacy)[index]
    assert.equal(shared.title, recording.title)
    assert.ok(shared.copy.length > 0, 'Shared summaries remain available to activities and other components')
  })
}

test('remaining Apollo 15 narration, engineering panels, optional activities and completion remain intact', () => {
  const story = storyCatalog['apollo-15-rover'], html = renderStory(story.id)
  for (const segment of documentarySegments(story).filter(s => s.chapter === 0 || s.chapter === 2)) {
    const article = articleFor(html, segment.id)
    assert.deepEqual(narrativeParagraphs(article), [renderToStaticMarkup(React.createElement('p', null, apollo15Narration[segment.chapter][segment.segment].text))])
    if (segment.chapter === 2 && story.challenges[segment.segment]) {
      assert.ok(article.includes('Engineering challenge'))
      assert.ok(article.includes('Engineering solution'))
    }
  }
  for (let chapter = 1; chapter <= 4; chapter++) assert.ok(html.includes(`aria-label="Chapter ${chapter} optional mission activities"`))
  assert.ok(html.includes('COMPLETE STORY') && html.includes('NASA evidence') && html.includes('Mission sources'))
})

for (const [index, recording] of apollo16ChapterRecordings[1].entries()) test(`Apollo 16 ${recording.title}: one unchanged main paragraph without the redundant summary`, () => {
  const story = storyCatalog['apollo-16-rover'], segment = documentarySegments(story).find(s => s.chapter === 1 && s.segment === index)
  assert.deepEqual(narrativeParagraphs(articleFor(renderStory(story.id), segment.id)), [renderToStaticMarkup(React.createElement('p', null, recording.text))])
  assert.equal(segment.audio, recording.audio)
  assert.ok(story.journey[index].copy.length > 0, 'Shared journey data is not deleted')
})

test('the legitimate extra Apollo 17 student-context paragraph is preserved', () => {
  const story = storyCatalog['apollo-17-rover'], segment = documentarySegments(story).find(s => s.chapter === 3 && s.segment === 4)
  assert.deepEqual(narrativeParagraphs(articleFor(renderStory(story.id), segment.id)), [segment.text, 'An invitation to students, not a claim that a particular classroom activity occurred on the mission.'].map(text => renderToStaticMarkup(React.createElement('p', null, text))))
})
