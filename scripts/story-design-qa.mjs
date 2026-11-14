// Actual Chrome render + comparison sheets. References/screenshots stay in the
// external QA directory; this script never copies them into public or Git.
import assert from 'node:assert/strict'
import { readFileSync,writeFileSync,mkdirSync,existsSync,realpathSync } from 'node:fs'
import { resolve,relative,isAbsolute,sep,dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { connectChrome } from './story-browser-qa.mjs'

// Required inputs: never infer a user's profile or write into the checkout.
const outputArg=process.argv[2]??process.env.AURORALYS_QA_DIR
const referenceArg=process.argv[3]??process.env.AURORALYS_APOLLO15_REFERENCE
assert.ok(outputArg,'Supply an external QA directory as argument 1 or AURORALYS_QA_DIR')
assert.ok(referenceArg,'Supply Haroon reference as argument 2 or AURORALYS_APOLLO15_REFERENCE')
const output=resolve(outputArg),reference=resolve(referenceArg)
const checkout=realpathSync(fileURLToPath(new URL('../',import.meta.url)))
const outside=path=>{const rel=relative(checkout,path);return rel.startsWith('..'+sep)||isAbsolute(rel)}
assert.ok(outside(output),'QA output must be outside the checkout')
let ancestor=output
while(!existsSync(ancestor)){
  const parent=dirname(ancestor)
  assert.notEqual(parent,ancestor,'QA output must have an existing parent directory')
  ancestor=parent
}
assert.ok(outside(resolve(realpathSync(ancestor),relative(ancestor,output))),'QA output must not resolve into the checkout')
const base=process.argv[4]??process.env.AURORALYS_QA_BASE_URL??'http://127.0.0.1:5202'
assert.match(base,/^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/)
assert.ok(existsSync(reference),'Haroon reference must be supplied, never invented')
mkdirSync(output,{recursive:true})
assert.ok(outside(realpathSync(output)),'Resolved QA directory must stay outside the checkout')
const b=await connectChrome(Number(process.env.CHROME_QA_PORT??9339)),results=[]
const data=p=>'data:image/jpeg;base64,'+readFileSync(p).toString('base64')
const shell=await fetch(base).then(r=>{assert.equal(r.status,200);return r.text()})
try {
  for(const [width,height] of [[1440,900],[1024,768],[390,844]]) {
    const old=resolve(output,`old-apollo15-${width}.jpg`),fresh=resolve(output,`new-apollo15-${width}.jpg`)
    assert.ok(existsSync(old),'Capture OLD build before editing; never substitute NEW for OLD')
    await b.size(width,height);await b.goto(`${base}/story/apollo-15-rover/1`)
    await b.waitFor(`!!document.querySelector('svg image[href*="as15-88-11901"]')`)
    const metrics=await b.metrics()
    assert.equal(metrics.overflow,false);assert.equal(metrics.images.filter(i=>!i.loaded).length,0)
    assert.equal(metrics.smallTargets.length,0)
    assert.equal(await b.evaluate('document.querySelectorAll("main").length'),1)
    await b.capture(fresh)
    results.push({...metrics,screenshot:fresh,oldScreenshot:old})
    const panels=[['OLD · verified 8a77514 build',data(old)],['NEW · cinematic presentation',data(fresh)],['HAROON · desktop reference'+(width<701?' (no mobile mockup supplied)':''),data(reference)]]
    const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>Auroralys visual comparison</title><style>*{box-sizing:border-box}body{margin:0;background:#050810;color:#edf4fc;font:16px system-ui}h1{font-size:22px;margin:20px}main{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:0 16px 20px}figure{margin:0;background:#0b1523;border:1px solid #536b84;border-radius:12px;overflow:hidden}figcaption{padding:14px;font-size:13px;min-height:55px}img{width:100%;height:${width<701?650:430}px;object-fit:contain;object-position:top;background:#02050b;display:block}</style><h1>AURORALYS · ${width} × ${height} · actual Chrome screenshots</h1><main>${panels.map(([title,src])=>`<figure><figcaption>${title}</figcaption><img alt="${title}" src="${src}"></figure>`).join('')}</main></html>`
    writeFileSync(resolve(output,`comparison-${width}.html`),html)
    await b.send('Page.navigate',{url:'about:blank'})
    await b.evaluate(`document.open();document.write(${JSON.stringify(html)});document.close();true`)
    await b.waitFor('document.images.length===3 && [...document.images].every(i=>i.complete&&i.naturalWidth>0)')
    await b.size(width<701?1200:2160,width<701?780:560)
    await b.capture(resolve(output,`comparison-${width}.jpg`))
  }
  await b.size(1440,900);await b.goto(`${base}/story/apollo-15-rover/1`)
  await b.click('Next segment')
  await b.waitFor(`document.body.innerText.includes('Segment 2 of 4')`)
  const audioTop=await b.evaluate('document.querySelector("audio").closest("section").getBoundingClientRect().top')
  assert.ok(audioTop>=0&&audioTop<900,'The single audio deck remains reachable while reading')
  await b.capture(resolve(output,'new-reading-audio.jpg'))
} finally {
  const errors=b.events.filter(e=>e.method==='Runtime.exceptionThrown'||e.method==='Network.loadingFailed'&&!e.params.canceled)
  const httpErrors=b.events.filter(e=>e.method==='Network.responseReceived'&&e.params.response.status>=400&&!e.params.response.url.endsWith('/favicon.ico'))
  writeFileSync(resolve(output,'design-verification.json'),JSON.stringify({base,gitHead:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),workingChanges:execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),buildIndexSha256:createHash('sha256').update(shell).digest('hex'),results,errors,httpErrors},null,2)+'\n')
  await b.close()
  assert.equal(errors.length,0);assert.equal(httpErrors.length,0)
}
console.log('Verified desktop/tablet/mobile and generated three OLD / NEW / HAROON comparison sheets.')
