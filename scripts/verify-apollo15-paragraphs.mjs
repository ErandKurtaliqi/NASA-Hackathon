// Start production preview first. Playwright/Chrome configuration follows
// verify-documentary-layout.mjs; keep QA output outside the source checkout.
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { build } from 'esbuild'

const { chromium } = await import(process.env.AURORALYS_PLAYWRIGHT_MODULE ? pathToFileURL(resolve(process.env.AURORALYS_PLAYWRIGHT_MODULE)).href : 'playwright')
const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
const base = process.env.AURORALYS_QA_URL ?? 'http://127.0.0.1:5179'
const output = resolve(process.env.AURORALYS_QA_OUTPUT ?? 'qa-apollo15-paragraphs')
await mkdir(output, { recursive: true })
const built = await build({ stdin: { contents: `export {storyCatalog} from './src/features/storytelling/storyCatalog';export {documentarySegments} from './src/features/storytelling/continuousStory';export {apollo15Narration} from './src/apollo15Narration';export {apollo16ChapterRecordings} from './src/features/storytelling/apollo16Recordings'`, resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', logLevel: 'silent' })
const mod = { exports: {} }
new Function('module', 'exports', 'require', built.outputFiles[0].text)(mod, mod.exports, require)
const { storyCatalog, documentarySegments, apollo15Narration, apollo16ChapterRecordings } = mod.exports
const inventory = JSON.parse(await readFile(resolve(root, 'docs/moon-package/inventory.json'), 'utf8'))
const results = { integrity: [], journeys: [], errors: [] }
for (const [chapter, tracks] of apollo15Narration.entries()) for (const [segment, track] of tracks.entries()) {
  const original = inventory.files.find(row => row.mission === '15' && row.chapter === chapter + 1 && row.segment === segment + 1)
  const hash = createHash('sha256').update(await readFile(resolve(root, `public${track.audio}`))).digest('hex')
  assert.equal(hash, original.sha256)
  results.integrity.push({ audio: track.audio, sha256: hash })
}
const browser = await chromium.launch({ headless: true, ...(process.env.AURORALYS_CHROME_PATH ? { executablePath: process.env.AURORALYS_CHROME_PATH } : {}) })
const cases = ['apollo-15-rover', 'apollo-16-rover'].flatMap(id => [[1600, 667], [1366, 768], [390, 844]].map(([width, height]) => ({ id, width, height })))
cases.push(...['apollo-11-reflector', 'apollo-17-rover', 'ingenuity', 'sojourner', 'opportunity', 'viking-1'].map(id => ({ id, width: 1366, height: 768 })))
try {
  for (const { id, width, height } of cases) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' })
    page.setDefaultTimeout(10000)
    page.on('pageerror', error => results.errors.push({ id, error: error.message }))
    const consoleErrors = []
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push({ message: message.text(), location: message.location() }) })
    await page.goto(`${base}/story/${id}/1`, { waitUntil: 'domcontentloaded' })
    const reader = page.locator('[data-documentary-reader]'), sound = page.locator('[data-documentary-audio] button')
    const chapters = page.getByRole('navigation', { name: 'Story chapters' }).getByRole('button')
    const evidence = page.getByRole('complementary', { name: 'NASA evidence' })
    const segments = documentarySegments(storyCatalog[id])
    const rover = id === 'apollo-15-rover' || id === 'apollo-16-rover'
    const narration = id === 'apollo-15-rover' ? apollo15Narration : apollo16ChapterRecordings
    const selected = rover ? segments : segments.slice(0, 2)
    const checked = []
    const select = async segment => {
      await reader.evaluate((root, id) => { const card = [...root.querySelectorAll('[data-segment]')].find(card => card.dataset.segment === id); root.scrollTo({ top: root.scrollTop + card.getBoundingClientRect().top - root.getBoundingClientRect().top - 20, behavior: 'instant' }) }, segment.id)
      await page.waitForFunction(id => document.querySelector('[data-continuous-story]').dataset.activeSegment === id, segment.id)
    }
    for (const segment of selected) {
      await select(segment)
      const card = reader.locator(`[data-segment="${segment.id}"]`), paragraphs = card.locator(':scope > p')
      assert.equal(await paragraphs.first().textContent(), segment.text)
      if (rover) {
        assert.equal(await paragraphs.count(), 1, segment.title)
        assert.equal(await paragraphs.first().textContent(), narration[segment.chapter][segment.segment].text)
        assert.equal(segment.audio, narration[segment.chapter][segment.segment].audio)
      }
      await page.waitForFunction(src => document.querySelector('[data-documentary-audio] audio').getAttribute('src') === src, segment.audio)
      if (await sound.getAttribute('aria-pressed') === 'true') await sound.click()
      await sound.click()
      await page.waitForFunction(() => { const a = document.querySelector('[data-documentary-audio] audio'); return !a.paused && a.currentTime > 0.15 })
      assert.equal(await page.locator('[data-documentary-audio] audio').evaluate(a => a.error?.code ?? null), null)
      await sound.click()
      const stopped = await page.locator('[data-documentary-audio] audio').evaluate(a => a.currentTime)
      await page.waitForTimeout(120)
      assert.ok(await page.locator('[data-documentary-audio] audio').evaluate(a => a.paused))
      assert.ok(Math.abs(await page.locator('[data-documentary-audio] audio').evaluate(a => a.currentTime) - stopped) < 0.02)
      await sound.click()
      await page.waitForFunction(() => { const a = document.querySelector('[data-documentary-audio] audio'); return !a.paused && a.currentTime > 0.1 })
      assert.ok(await page.evaluate(() => [...document.querySelectorAll('audio,video')].filter(a => !a.paused).length <= 1))
      assert.ok(await evidence.isVisible())
      const expectsFigure = segment.gallery?.length !== 0
      assert.equal(await evidence.locator('figure').isVisible(), expectsFigure, segment.title)
      const box = await evidence.boundingBox(), timeline = await chapters.first().boundingBox()
      assert.ok(box.width > 100 && box.height > 100 && box.y + box.height <= timeline.y + 1)
      checked.push({ title: segment.title, audio: segment.audio, mainParagraphs: await paragraphs.count(), playback: true, muteAndRestart: true, evidenceVisible: expectsFigure, intentionallyEmptyEvidence: !expectsFigure })
      if (id === 'apollo-15-rover' && [1, 3].includes(segment.chapter) || id === 'apollo-16-rover' && segment.chapter === 1) await page.screenshot({ path: resolve(output, `${id}-${segment.chapter + 1}-${segment.segment + 1}-${width}x${height}.png`) })
    }
    if (id === 'apollo-15-rover') {
      // Reverse jumps must select each affected recording again correctly.
      for (const segment of segments.filter(s => [1, 3].includes(s.chapter)).reverse()) {
        await select(segment)
        await page.waitForFunction(src => { const a = document.querySelector('[data-documentary-audio] audio'); return a.getAttribute('src') === src && !a.paused && a.currentTime > 0.1 }, segment.audio)
      }
      assert.equal(await reader.locator('article > aside').count(), 2)
      assert.equal(await reader.locator('[aria-label$="optional mission activities"]').count(), 4)
    }
    const overflow = await page.evaluate(() => { const r = document.querySelector('[data-documentary-reader]'); return { page: document.documentElement.scrollWidth - innerWidth, reader: r.scrollWidth - r.clientWidth } })
    assert.ok(overflow.page <= 1 && overflow.reader <= 1, JSON.stringify(overflow))
    for (let chapter = 0; chapter < 4; chapter++) {
      await chapters.nth(chapter).click()
      await page.waitForFunction(chapter => document.querySelector('[data-continuous-story]').dataset.activeChapter === String(chapter + 1), chapter)
      await reader.getByRole('button', { name: /^Mark .+ complete$/ }).nth(chapter).click()
    }
    await chapters.nth(4).click()
    for (const [index, item] of storyCatalog[id].quiz.entries()) {
      await page.locator('.quiz-options button').nth(item.answer).click()
      await page.getByRole('region', { name: 'Answer feedback' }).getByRole('button', { name: index === 2 ? 'View Results' : 'NEXT QUESTION' }).click()
    }
    await reader.getByRole('button', { name: 'COMPLETE STORY', exact: true }).click()
    await reader.getByText('Mission badge earned', { exact: true }).waitFor()
    await page.reload({ waitUntil: 'domcontentloaded' })
    await reader.getByText('Saved quiz result: 3 / 3', { exact: true }).waitFor()
    assert.ok(await page.evaluate(id => JSON.parse(localStorage.getItem('beyond-earth-progress')).state.badges.includes(`${id}-storyteller`), id))
    results.journeys.push({ id, viewport: { width, height }, checked, overflow, completionAndPersistence: true, consoleErrors })
    console.log(`PASS ${id} ${width}x${height}: ${checked.length} segments and complete mission flow`)
    await page.close()
  }
  assert.deepEqual(results.errors, [])
} finally {
  await browser.close()
  await writeFile(resolve(output, 'results.json'), JSON.stringify(results, null, 2))
}
console.log(`Passed ${results.integrity.length} original hashes and ${results.journeys.length} browser journeys`)
