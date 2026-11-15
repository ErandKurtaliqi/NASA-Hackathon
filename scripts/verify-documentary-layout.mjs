// Start Vite first. Install Playwright in your QA environment, or set
// AURORALYS_PLAYWRIGHT_MODULE to its index.mjs. No browser mocks are used.
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { build } from 'esbuild'

const { chromium } = await import(process.env.AURORALYS_PLAYWRIGHT_MODULE
  ? pathToFileURL(resolve(process.env.AURORALYS_PLAYWRIGHT_MODULE)).href : 'playwright')
const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
const bundle = await build({ stdin: { contents: `export {storyCatalog} from './src/features/storytelling/storyCatalog'; export {documentarySegments} from './src/features/storytelling/continuousStory'`, resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', logLevel: 'silent' })
const mod = { exports: {} }
new Function('module', 'exports', 'require', bundle.outputFiles[0].text)(mod, mod.exports, require)
const { storyCatalog, documentarySegments } = mod.exports
const ids = ['apollo-11-reflector', 'apollo-15-rover', 'apollo-16-rover', 'apollo-17-rover', 'ingenuity', 'sojourner', 'opportunity', 'viking-1']
const sizes = [[1600, 667], [1366, 768], [1440, 900], [1024, 768], [390, 844]]
const output = resolve(process.env.AURORALYS_QA_OUTPUT ?? 'qa-documentary-layout')
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true,
  ...(process.env.AURORALYS_CHROME_PATH ? { executablePath: process.env.AURORALYS_CHROME_PATH } : {}) })
const results = [], failures = []
try {
  for (const [width, height] of sizes) for (const id of ids) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: width < 700 ? 'reduce' : 'no-preference' })
    page.setDefaultTimeout(10000)
    const errors = [], networkFailures = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('requestfailed', request => networkFailures.push({ url: request.url(), error: request.failure()?.errorText }))
    const story = storyCatalog[id], segments = documentarySegments(story)
    const label = `${id}-${width}x${height}`
    try {
      await page.goto(`${process.env.AURORALYS_QA_URL ?? 'http://127.0.0.1:5178'}/story/${id}/1`, { waitUntil: 'domcontentloaded' })
      await page.locator('[data-documentary-reader] article').first().waitFor()
      const reader = page.locator('[data-documentary-reader]')
      const chapters = page.getByRole('navigation', { name: 'Story chapters' }).getByRole('button')
      assert.equal(await chapters.count(), 5)
      assert.equal(await reader.locator('article [role="note"]').count(), 0)
      assert.equal(await reader.locator('article').getByText('Scientific clarification', { exact: true }).count(), 0)
      assert.ok((await page.locator('[data-continuous-story] header h1').textContent()).length > 0)
      const initial = await page.evaluate(() => {
        const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom } }
        return { reader: rect('[data-documentary-reader]'), stage: rect('[data-documentary-stage]'), evidence: rect('[aria-label="NASA evidence"]'), title: rect('h1'), header: rect('[data-continuous-story] header'), timeline: rect('[aria-label="Story chapters"]') }
      })
      assert.ok(initial.reader.height > (width < 700 ? 240 : 400), JSON.stringify(initial))
      assert.ok(initial.evidence.height > 170)
      assert.ok(initial.timeline.bottom <= height + 1)
      assert.ok(initial.title.bottom <= initial.stage.y)
      const checkOverflow = async () => {
        const overflow = await page.evaluate(() => {
          const reader = document.querySelector('[data-documentary-reader]')
          return { page: document.documentElement.scrollWidth - innerWidth, reader: reader.scrollWidth - reader.clientWidth, top: document.documentElement.scrollTop }
        })
        assert.ok(overflow.page <= 1 && overflow.reader <= 1 && overflow.top === 0, JSON.stringify(overflow))
        return overflow
      }
      await reader.focus()
      await page.keyboard.press('PageDown')
      await page.waitForFunction(() => document.querySelector('[data-documentary-reader]').scrollTop > 0)
      await chapters.nth(0).click()
      await reader.hover()
      await page.mouse.wheel(0, initial.reader.height)
      await page.waitForFunction(() => document.querySelector('[data-documentary-reader]').scrollTop > 0)
      await chapters.nth(0).click()

      // Check real narration, mute, and the unchanged planet return destination.
      const audio = page.locator('[data-documentary-audio] audio')
      const sound = page.locator('[data-documentary-audio] button')
      await page.waitForFunction(() => !!document.querySelector('[data-documentary-audio] audio')?.getAttribute('src'))
      if (await sound.getAttribute('aria-pressed') === 'true') await sound.click()
      await sound.click()
      await page.waitForFunction(() => { const a = document.querySelector('[data-documentary-audio] audio'); return a && !a.paused && a.currentTime > 0 })
      await sound.click()
      assert.ok(await audio.evaluate(a => a.paused))
      assert.equal(await page.locator('[data-continuous-story] header > a').getAttribute('href'), `/explore/${story.planet}`)

      if ((id === 'apollo-16-rover' || id === 'viking-1') && width === 1600) {
        await page.screenshot({ path: resolve(output, `${label}-narrative.png`) })
      }
      // Sources remain reviewable even when they are no longer in each narrative card.
      await page.getByRole('button', { name: 'Mission sources' }).click()
      const review = reader.locator('[data-scientific-review]')
      const notes = segments.filter(item => item.note)
      if (notes.length) {
        await review.locator('summary').click()
        assert.equal(await review.locator('li').count(), notes.length)
        for (const item of notes) {
          assert.ok((await review.textContent()).includes(item.note), item.id)
          assert.ok((await review.locator('a').evaluateAll(links => links.map(a => a.href))).includes(item.source), item.source)
        }
        await review.locator('summary').click()
      }
      for (let chapter = 0; chapter < 4; chapter++) {
        await chapters.nth(chapter).click()
        await page.waitForFunction(c => document.querySelector('[data-continuous-story]').dataset.activeChapter === String(c + 1), chapter)
        const complete = reader.getByRole('button', { name: /^Mark .+ complete$/ }).nth(chapter)
        await complete.click()
        assert.ok(await complete.isDisabled())
      }
      await chapters.nth(4).click()
      await page.getByRole('button', { name: 'Hear question 1', exact: true }).click()
      await page.waitForFunction(() => document.querySelector('[data-documentary-audio] audio')?.getAttribute('src')?.includes('/chapter-5/1.mp3'))
      for (let question = 0; question < story.quiz.length; question++) {
        const item = story.quiz[question]
        const choice = question === 1 ? (item.answer + 1) % item.options.length : item.answer
        const option = page.locator('.quiz-options button').nth(choice)
        if (question === 0) { await option.focus(); await page.keyboard.press('Enter') }
        else await option.click()
        const feedback = page.getByRole('region', { name: 'Answer feedback' })
        await feedback.waitFor()
        assert.ok((await feedback.textContent()).includes(item.explanation))
        assert.ok((await feedback.locator('p').textContent()).includes(question === 1 ? 'Incorrect.' : 'Correct.'))
        const rect = await feedback.locator('p').boundingBox()
        assert.ok(rect.width > (width < 700 ? 180 : 280), `${label}: feedback width ${rect.width}`)
        assert.ok(await feedback.locator('p').evaluate(p => p === document.activeElement), 'Feedback receives accessible focus')
        const next = feedback.getByRole('button', { name: question === story.quiz.length - 1 ? 'View Results' : 'NEXT QUESTION' })
        await next.scrollIntoViewIfNeeded()
        await checkOverflow()
        if (id === 'apollo-16-rover' && (question === 0 || question === 1)) {
          await page.screenshot({ path: resolve(output, `${label}-${question === 0 ? 'correct' : 'incorrect'}.png`) })
        }
        // Tab from the feedback reaches the enabled next action.
        await feedback.locator('p').focus()
        await page.keyboard.press('Tab')
        assert.ok(await next.evaluate(button => button === document.activeElement))
        await page.keyboard.press('Enter')
      }
      assert.ok((await page.locator('.quiz-reward').textContent()).includes('2 / 3'))
      await checkOverflow()
      const completeStory = reader.getByRole('button', { name: 'COMPLETE STORY', exact: true })
      await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent === 'COMPLETE STORY' && !button.disabled))
      assert.ok(await completeStory.isEnabled())
      if (id === 'apollo-16-rover') await page.screenshot({ path: resolve(output, `${label}-results.png`) })
      await completeStory.click()
      await reader.getByText('Mission badge earned', { exact: true }).waitFor()
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('beyond-earth-progress')).state)
      assert.equal(saved.storyProgress[id].quizResult.score, 2)
      assert.ok(saved.storyProgress[id].completedMission)
      assert.ok(saved.badges.includes(`${id}-storyteller`))
      // Retry must preserve the saved badge/result; reload must recover them.
      await page.getByRole('button', { name: 'TRY AGAIN' }).click()
      assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('beyond-earth-progress')).state), saved)
      await page.reload({ waitUntil: 'domcontentloaded' })
      await reader.getByText('Saved quiz result: 2 / 3', { exact: true }).waitFor()
      assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('beyond-earth-progress')).state), saved)
      await chapters.nth(0).click()
      await chapters.nth(4).click()
      const overflow = await checkOverflow()
      assert.deepEqual(errors, [])
      results.push({ label, initial, overflow, networkFailures, status: 'passed' })
      console.log(`PASS ${label}`)
    } catch (error) {
      await page.screenshot({ path: resolve(output, `${label}-FAILED.png`) }).catch(() => {})
      failures.push({ label, error: error.stack, errors, networkFailures })
      console.error(`FAIL ${label}: ${error.message}`)
    } finally { await page.close() }
  }
} finally {
  await browser.close()
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ results, failures }, null, 2))
}
assert.equal(failures.length, 0, `${failures.length} browser cases failed; see ${output}/results.json`)
console.log(`Passed all ${results.length} story/viewport cases`)
