// Real Chrome QA. Use the same Playwright/Chrome environment variables as
// verify-documentary-layout.mjs; start Vite or preview before running this file.
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { build } from 'esbuild'

const { chromium } = await import(process.env.AURORALYS_PLAYWRIGHT_MODULE ? pathToFileURL(resolve(process.env.AURORALYS_PLAYWRIGHT_MODULE)).href : 'playwright')
const base = process.env.AURORALYS_QA_URL ?? 'http://127.0.0.1:5179'
const output = resolve(process.env.AURORALYS_QA_OUTPUT ?? 'qa-apollo11-narration')
const root = fileURLToPath(new URL('../', import.meta.url)), require = createRequire(import.meta.url)
await mkdir(output, { recursive: true })
const built = await build({ stdin: { contents: `export {storyCatalog} from './src/features/storytelling/storyCatalog'; export {documentarySegments} from './src/features/storytelling/continuousStory'`, resolveDir: root }, bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', logLevel: 'silent' })
const mod = { exports: {} }
new Function('module', 'exports', 'require', built.outputFiles[0].text)(mod, mod.exports, require)
const { storyCatalog, documentarySegments } = mod.exports
const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=document-user-activation-required'],
  ...(process.env.AURORALYS_CHROME_PATH ? { executablePath: process.env.AURORALYS_CHROME_PATH } : {}) })
const results = { nativeFiles: [], stories: [], errors: [] }
try {
  // Test a fresh document before any gesture has granted playback permission.
  const restricted = await browser.newPage()
  await restricted.goto(`${base}/story/apollo-11-reflector/1`, { waitUntil: 'domcontentloaded' })
  // Let the initial play attempt happen before any evaluate/waitForFunction:
  // DevTools evaluations can themselves grant transient user activation.
  await restricted.waitForTimeout(1000)
  await restricted.waitForFunction(() => document.querySelector('[data-documentary-audio] [role=status]')?.textContent.includes('browser blocked'))
  assert.ok(await restricted.locator('[data-documentary-audio] audio').evaluate(a => a.paused))
  results.autoplayRestrictionVerified = true
  await restricted.close()
  // Isolated native decoding proves file/playback health. It never changes the
  // documentary's holds or substitutes this test player into the application.
  for (const path of ['/audio/apollo-11/chapter-2/3.mp3', '/audio/apollo-11/chapter-2/4.mp3', '/audio/apollo-11/chapter-4/4.mp3']) {
    const page = await browser.newPage()
    await page.goto(base + '/__native_audio_qa__', { waitUntil: 'domcontentloaded' })
    const response = await page.request.get(base + path)
    assert.equal(response.status(), 200)
    assert.match(response.headers()['content-type'], /^audio\/mpeg/)
    await page.setContent('<button id="play">Play original</button><button id="stop">Stop</button><audio></audio>')
    await page.evaluate(src => {
      const audio = document.querySelector('audio'), context = new AudioContext(), analyser = context.createAnalyser()
      context.createMediaElementSource(audio).connect(analyser); analyser.connect(context.destination)
      audio.src = src
      window.audioProbe = { context, analyser }
      document.querySelector('#play').onclick = () => { context.resume(); audio.play().catch(error => { window.playError = error.message }) }
      document.querySelector('#stop').onclick = () => audio.pause()
    }, base + path)
    await page.getByRole('button', { name: 'Play original', exact: true }).click()
    await page.waitForFunction(() => {
      const audio = document.querySelector('audio'), samples = new Float32Array(window.audioProbe.analyser.fftSize)
      window.audioProbe.analyser.getFloatTimeDomainData(samples)
      window.audioProbe.peak = Math.max(...samples.map(Math.abs))
      return audio.currentTime > 0.3 && !audio.paused && window.audioProbe.peak > 0.001
    })
    const state = await page.evaluate(() => { const a = document.querySelector('audio'); return { duration: a.duration, currentTime: a.currentTime, paused: a.paused, muted: a.muted, volume: a.volume, error: a.error?.code ?? null, peak: window.audioProbe.peak, context: window.audioProbe.context.state, playError: window.playError ?? null } })
    assert.equal(state.error, null); assert.equal(state.playError, null); assert.equal(state.context, 'running')
    await page.waitForFunction(() => document.querySelector('audio').ended, undefined, { timeout: 30000 })
    assert.equal(await page.locator('audio').evaluate(a => a.error?.code ?? null), null)
    await page.getByRole('button', { name: 'Stop', exact: true }).click()
    assert.ok(await page.locator('audio').evaluate(a => a.paused))
    results.nativeFiles.push({ path, contentType: response.headers()['content-type'], ...state, playedToEnd: true, stopped: true })
    console.log(`PASS native decode and signal ${path}`)
    await page.close()
  }
  for (const id of ['apollo-11-reflector', 'apollo-15-rover', 'apollo-16-rover', 'apollo-17-rover', 'ingenuity', 'sojourner', 'opportunity', 'viking-1']) {
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' })
    page.setDefaultTimeout(10000)
    page.on('pageerror', error => results.errors.push({ id, error: error.message }))
    const mediaErrors = [], consoleErrors = [], httpErrors = []
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push({ message: message.text(), location: message.location() }) })
    page.on('response', response => { if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() }) })
    await page.goto(`${base}/story/${id}/1`, { waitUntil: 'domcontentloaded' })
    const reader = page.locator('[data-documentary-reader]'), sound = page.locator('[data-documentary-audio] button')
    const chapters = page.getByRole('navigation', { name: 'Story chapters' }).getByRole('button')
    const segments = documentarySegments(storyCatalog[id])
    await page.waitForFunction(() => !!document.querySelector('[data-documentary-audio] audio')?.getAttribute('src'))
    const autoplayBlocked = (await page.locator('[data-documentary-audio] [role=status]').textContent()).includes('browser blocked')
    const select = async segment => {
      await reader.evaluate((root, id) => { const card = [...root.querySelectorAll('[data-segment]')].find(card => card.dataset.segment === id); root.scrollTo({ top: root.scrollTop + card.getBoundingClientRect().top - root.getBoundingClientRect().top - 20, behavior: 'instant' }) }, segment.id)
      await page.waitForFunction(id => document.querySelector('[data-continuous-story]').dataset.activeSegment === id, segment.id)
    }
    const checked = []
    for (const segment of id === 'apollo-11-reflector' ? segments : segments.slice(0, 2)) {
      await select(segment)
      if (segment.audioHold) {
        await page.waitForFunction(() => { const a = document.querySelector('[data-documentary-audio] audio'); return a.paused && !a.getAttribute('src') })
        if (await sound.getAttribute('aria-pressed') === 'true') await sound.click()
        await sound.click()
        assert.ok((await page.locator('[data-documentary-audio] [role=status]').textContent()).includes('under review'))
        assert.ok(await page.locator('[data-documentary-audio] audio').evaluate(a => a.paused && !a.getAttribute('src')))
        checked.push({ title: segment.title, audio: segment.audio, held: true, silentInDocumentary: true })
      } else {
        await page.waitForFunction(src => document.querySelector('[data-documentary-audio] audio').getAttribute('src') === src, segment.audio)
        if (await sound.getAttribute('aria-pressed') !== 'true') await sound.click()
        await page.waitForFunction(() => { const a = document.querySelector('[data-documentary-audio] audio'); return !a.paused && a.currentTime > 0.15 })
        const state = await page.locator('[data-documentary-audio] audio').evaluate(a => ({ src: a.getAttribute('src'), currentTime: a.currentTime, paused: a.paused, muted: a.muted, volume: a.volume, error: a.error?.code ?? null }))
        assert.equal(state.error, null); assert.equal(state.muted, false); assert.ok(state.volume > 0)
        await sound.click()
        assert.ok(await page.locator('[data-documentary-audio] audio').evaluate(a => a.paused))
        const stopped = await page.locator('[data-documentary-audio] audio').evaluate(a => a.currentTime)
        await page.waitForTimeout(120)
        assert.ok(Math.abs(await page.locator('[data-documentary-audio] audio').evaluate(a => a.currentTime) - stopped) < 0.02)
        await sound.click()
        await page.waitForFunction(() => document.querySelector('[data-documentary-audio] audio').currentTime > 0.1)
        assert.ok(await page.evaluate(() => [...document.querySelectorAll('audio,video')].filter(a => !a.paused).length <= 1))
        checked.push({ title: segment.title, audio: segment.audio, held: false, ...state, muteAndRestart: true })
      }
      if (id === 'apollo-11-reflector' && (segment.audioHold || segment.title === 'More Than a Mirror' || segment.segment === 0 && segment.chapter === 0)) {
        await page.screenshot({ path: resolve(output, `${id}-${segment.chapter + 1}-${segment.segment + 1}.png`) })
      }
    }
    if (id === 'apollo-11-reflector') {
      assert.ok((await reader.locator('article').first().textContent()).includes('The Moon was about to welcome'))
      assert.ok(!(await reader.locator('article').first().textContent()).includes('1. Meet Me'))
      await select(segments[0]); await select(segments.at(-1))
      await page.waitForFunction(() => { const a = document.querySelector('[data-documentary-audio] audio'); return a.getAttribute('src') === '/audio/apollo-11/chapter-4/4.mp3' && !a.paused && a.currentTime > 0.1 })
    }
    for (let chapter = 0; chapter < 4; chapter++) {
      await chapters.nth(chapter).click()
      await reader.getByRole('button', { name: /^Mark .+ complete$/ }).nth(chapter).click()
    }
    await chapters.nth(4).click()
    for (const [i, item] of storyCatalog[id].quiz.entries()) {
      await page.locator('.quiz-options button').nth(item.answer).click()
      await page.getByRole('region', { name: 'Answer feedback' }).getByRole('button', { name: i === 2 ? 'View Results' : 'NEXT QUESTION' }).click()
    }
    await reader.getByRole('button', { name: 'COMPLETE STORY', exact: true }).click()
    await reader.getByText('Mission badge earned', { exact: true }).waitFor()
    const saved = await page.evaluate(id => JSON.parse(localStorage.getItem('beyond-earth-progress')).state.storyProgress[id], id)
    assert.equal(saved.quizResult.score, 3); assert.ok(saved.completedMission)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await reader.getByText('Saved quiz result: 3 / 3', { exact: true }).waitFor()
    assert.ok(await page.evaluate(id => JSON.parse(localStorage.getItem('beyond-earth-progress')).state.badges.includes(`${id}-storyteller`), id))
    mediaErrors.push(...await page.locator('audio').evaluateAll(audios => audios.flatMap(a => a.error ? [a.error.code] : [])))
    assert.deepEqual(mediaErrors, [])
    results.stories.push({ id, checked, autoplayBlockedBeforeGesture: autoplayBlocked, quizTimelineBadgePersistence: true, mediaErrors, consoleErrors, httpErrors })
    console.log(`PASS documentary ${id}: ${checked.length} segments, quiz, timeline, badge and reload`)
    await page.close()
  }
  assert.deepEqual(results.errors, [])
} finally {
  await browser.close()
  await writeFile(resolve(output, 'browser-results.json'), JSON.stringify(results, null, 2))
}
console.log('Passed 3 native file checks and 8 documentary journeys; editorial holds remain explicit')
