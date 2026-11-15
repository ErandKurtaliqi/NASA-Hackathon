// Actual frontend navigation, without seeding or resetting stored progress.
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { connectChrome } from './story-browser-qa.mjs'

const output=resolve(process.argv[2] ?? '../qa-artifacts/mission-integration')
const base=process.argv[3] ?? 'http://127.0.0.1:5200'
assert.match(base,/^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/)
mkdirSync(output,{recursive:true})
const b=await connectChrome(Number(process.env.CHROME_QA_PORT??9338)),checks=[]
const ids=['apollo-11-reflector','apollo-15-rover','apollo-16-rover','apollo-17-rover','sojourner','opportunity','viking-1','ingenuity']
try {
  await b.size(1366,768)
  await b.goto(`${base}/hardware`)
  const names=await b.evaluate(`Array.from(document.querySelectorAll('.hardware-list button')).map(b=>b.querySelector('b').textContent)`)
  const seen=new Set()
  for(const name of names) {
    await b.evaluate(`Array.from(document.querySelectorAll('.hardware-list button')).find(b=>b.querySelector('b').textContent===${JSON.stringify(name)}).click()`,true)
    await b.waitFor(`document.querySelector('.hardware-info h2')?.textContent===${JSON.stringify(name)}`)
    const href=await b.evaluate(`document.querySelector('.hardware-actions a[href^="/story/"]')?.getAttribute('href')`)
    if(!href)continue
    const id=href.split('/')[2];assert.ok(ids.includes(id));seen.add(id)
    await b.evaluate(`document.querySelector('.hardware-actions a[href^="/story/"]').click()`,true)
    await b.waitFor(`location.pathname===${JSON.stringify(href)} && !!document.querySelector('[data-story-pilot],[data-mars-story]')`)
    checks.push({entry:'hardware',name,id,href,loaded:true})
    await b.goto(`${base}/hardware`)
  }
  assert.deepEqual([...seen].sort(),[...ids].sort())
  for(const world of ['moon','mars']) {
    // Explorer selection is frontend-only. Do not wait for or claim verification
    // of NASA textures, map tiles or GPU internals to validate its navigation.
    await b.send('Page.navigate',{url:`${base}/explore/${world}`})
    await b.waitFor(`!!document.querySelector('#explorer-machines button')`)
    const machines=await b.evaluate(`Array.from(document.querySelectorAll('#explorer-machines button')).map(b=>b.querySelector('b').textContent)`)
    const links=[]
    for(const name of machines) {
      await b.evaluate(`Array.from(document.querySelectorAll('#explorer-machines button')).find(b=>b.querySelector('b').textContent===${JSON.stringify(name)}).click()`,true)
      await b.waitFor(`document.querySelector('#explorer-machines button[aria-pressed="true"] b')?.textContent===${JSON.stringify(name)}`)
      const href=await b.evaluate(`document.querySelector('#machine-information a[href^="/story/"]')?.getAttribute('href')`)
      if(href)links.push(href.split('/')[2])
      checks.push({entry:`explore/${world}`,name,href:href??null})
    }
    const expected=world==='moon'?ids.slice(0,4):ids.slice(4)
    assert.deepEqual(links.sort(),expected.sort())
    await b.capture(resolve(output,`verified-catalog-${world}.jpg`))
  }
  assert.equal(await b.evaluate(`localStorage.getItem('beyond-earth-progress')`),null,'Discovery/navigation never completes missions or clears/writes progress')
} finally {
  const errors=b.events.filter(e=>e.method==='Runtime.exceptionThrown'||e.method==='Network.loadingFailed'&&!e.params.canceled)
  writeFileSync(resolve(output,'catalog-verification.json'),JSON.stringify({base,checks,errors},null,2)+'\n')
  await b.close()
}
console.log(JSON.stringify({checks},null,2))
