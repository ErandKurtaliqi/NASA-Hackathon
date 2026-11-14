// Production-browser visual evidence. Outputs and references remain outside Git.
// No private recordings, user profile, saved user progress or uploads are used.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { connectChrome } from './story-browser-qa.mjs'

const output = resolve(process.argv[2])
const base = process.argv[3] ?? 'http://127.0.0.1:5204'
const approved = process.argv[4]
assert.match(base, /^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/)
assert.ok(approved, 'Pass the approved Apollo 15 screenshot as the fourth argument')
mkdirSync(output, { recursive: true })
const missions = [
  ['apollo-11-reflector', 'Apollo 11 · Stationary reflector', 'stationary-experiment'],
  ['apollo-15-rover', 'Apollo 15 · LRV-1', 'lunar-rover'],
  ['apollo-16-rover', 'Apollo 16 · LRV-2', 'lunar-rover'],
  ['apollo-17-rover', 'Apollo 17 · LRV-3', 'lunar-rover'],
  ['sojourner', 'Sojourner · Rover', 'rover'],
  ['opportunity', 'Opportunity · Rover', 'rover'],
  ['viking-1', 'Viking 1 · Stationary lander', 'lander'],
  ['ingenuity', 'Ingenuity · Helicopter', 'helicopter'],
]
const browser = await connectChrome(Number(process.env.CHROME_QA_PORT ?? 9341))
const results = [], requests = []
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex')
const approvedHash = hash(approved)
try {
  for (const [width, height] of [[1440,900], [1024,768], [390,844]]) for (const [id, label, kind] of missions) {
    await browser.size(width, height)
    await browser.goto(`${base}/story/${id}/1`)
    await browser.waitFor('document.readyState === "complete" && [...document.images].every(i => i.complete && i.naturalWidth > 0)')
    // Finish the existing image entrance transition; no DOM/style alterations.
    await browser.evaluate('new Promise(resolve => setTimeout(resolve, 550))')
    const metrics = await browser.metrics()
    assert.equal(new URL(metrics.url).pathname, `/story/${id}/1`)
    assert.equal(metrics.overflow, false)
    assert.equal(await browser.evaluate('document.querySelectorAll("main").length'), 1)
    assert.equal(await browser.evaluate('document.querySelectorAll("[data-cinematic-story]").length'), 1)
    assert.equal(await browser.evaluate('document.querySelector("[data-hardware-kind]").dataset.hardwareKind'), kind)
    if (id !== 'apollo-15-rover') assert.equal(metrics.audio.length, 0)
    const screenshot = resolve(output, `opening-${id}-${width}.jpg`)
    await browser.capture(screenshot)
    results.push({ id, label, kind, ...metrics, screenshot })
    console.log(`Opening verified: ${id} ${width}x${height}`)
  }
  requests.push(...browser.events.filter(e => e.method === 'Network.requestWillBeSent').map(e => e.params.request.url))
  assert.ok(!requests.some(url => /\/audio\/(?:apollo-(?:11|16|17)|sojourner|opportunity|viking-1|ingenuity)\//.test(url)), 'No private narration requests')
  const errors = browser.events.filter(e => e.method === 'Runtime.exceptionThrown')
  assert.equal(errors.length, 0)

  const panel = (label, path) => `<section><h2>${label}</h2><div class="frame"><img alt="${label}" src="data:image/jpeg;base64,${readFileSync(path).toString('base64')}"></div></section>`
  async function sheet(name, heading, panels, columns, width, height, frameHeight) {
    const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>${heading}</title><style>*{box-sizing:border-box}body{margin:0;padding:20px;background:#07101c;color:#e7f1ff;font-family:Arial,sans-serif}h1{font-size:26px;margin:0 0 10px}p{font-size:14px;color:#bac9dc;margin:0 0 18px}.grid{display:grid;grid-template-columns:repeat(${columns},minmax(0,1fr));gap:16px}section{min-width:0;border:1px solid #43566d;border-radius:8px;overflow:hidden}h2{font-size:17px;line-height:1.3;margin:0;padding:14px}.frame{height:${frameHeight}px;background:#000}.frame img{width:100%;height:100%;object-fit:contain}</style><h1>${heading}</h1><p>Real production screenshots · Complete frames, proportional sizing · Human visual review pending for the seven adapted missions</p><div class="grid">${panels.join('')}</div></html>`
    writeFileSync(resolve(output, `${name}.html`), html)
    await browser.size(width, height)
    await browser.send('Page.navigate', { url: 'about:blank' })
    await browser.waitFor('location.href === "about:blank"')
    await browser.evaluate(`document.open();document.write(${JSON.stringify(html)});document.close();true`)
    await browser.waitFor('[...document.images].every(i => i.complete && i.naturalWidth > 0)')
    assert.ok(await browser.evaluate('document.documentElement.scrollHeight <= innerHeight && document.documentElement.scrollWidth <= innerWidth'), 'Sheet must not crop panels')
    const shot = await browser.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    writeFileSync(resolve(output, `${name}.png`), Buffer.from(shot.data, 'base64'))
  }
  const desktop = results.filter(r => r.viewport[0] === 1440)
  await sheet('contact-sheet-desktop', 'AURORALYS · Eight cinematic missions · Desktop 1440 × 900', desktop.map(r => panel(r.label, r.screenshot)), 4, 3000, 1170, 455)
  const mobile = results.filter(r => r.viewport[0] === 390)
  await sheet('contact-sheet-mobile', 'AURORALYS · Eight cinematic missions · Mobile 390 × 844', mobile.map(r => panel(r.label, r.screenshot)), 4, 1640, 1940, 844)
  await sheet('apollo15-approved-vs-integrated', 'Apollo 15 · Approved presentation preserved', [panel('APPROVED · 7129c6b · Existing reference capture', approved), panel('INTEGRATED · New production capture', desktop.find(r => r.id === 'apollo-15-rover').screenshot)], 2, 1520, 650, 450)
  assert.equal(hash(approved), approvedHash)
  writeFileSync(resolve(output, 'cinematic-verification.json'), JSON.stringify({ base, gitHeadAtCapture: execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(), workingChanges: execFileSync('git',['status','--short'],{encoding:'utf8'}), buildIndexSha256: hash('dist/index.html'), approved, approvedHash, results, errors, privateAudioRequests: 0 }, null, 2) + '\n')
} finally { await browser.close() }
