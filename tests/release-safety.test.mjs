import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, existsSync, readdirSync, symlinkSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root=fileURLToPath(new URL('../',import.meta.url))
const script=resolve(root,'scripts/story-design-qa.mjs')
function sandbox(){const dir=mkdtempSync(join(tmpdir(),'auroralys-qa-arguments-'));return{dir,out:join(dir,'output'),reference:join(dir,'reference.txt')}}
function run(cwd,args=[],extra={}){
  const env={...process.env,...extra};delete env.AURORALYS_QA_DIR;delete env.AURORALYS_APOLLO15_REFERENCE
  Object.assign(env,extra)
  return spawnSync(process.execPath,[script,...args],{cwd,env,encoding:'utf8',timeout:10000})
}
test('visual QA requires explicit output and reference without creating a default directory',()=>{
  const s=sandbox(),r=run(s.dir)
  assert.notEqual(r.status,0);assert.match(r.stderr,/Supply an external QA directory/)
  assert.deepEqual(readdirSync(s.dir),[])
})
test('visual QA rejects a missing reference before writing or connecting to Chrome',()=>{
  const s=sandbox(),r=run(s.dir,[s.out])
  assert.notEqual(r.status,0);assert.match(r.stderr,/Supply Haroon reference/)
  assert.equal(existsSync(s.out),false)
})
test('portable environment arguments cannot direct QA output into the checkout',()=>{
  const s=sandbox();writeFileSync(s.reference,'Path validation fixture; not a screenshot.')
  const r=run(s.dir,[],{AURORALYS_QA_DIR:root,AURORALYS_APOLLO15_REFERENCE:s.reference})
  assert.notEqual(r.status,0);assert.match(r.stderr,/QA output must be outside the checkout/)
})
test('QA rejects a junction into the checkout before creating its output directory',()=>{
  const s=sandbox(),link=join(s.dir,'checkout-link'),name='qa-should-not-be-created-'+Date.now()
  writeFileSync(s.reference,'Path validation fixture; not a screenshot.')
  symlinkSync(root,link,'junction')
  try {
    const r=run(s.dir,[join(link,name),s.reference])
    assert.notEqual(r.status,0);assert.match(r.stderr,/QA output must not resolve into the checkout/)
    assert.equal(existsSync(join(root,name)),false)
  }finally{unlinkSync(link)}
})
test('environment configuration rejects non-loopback QA origins before creating output',()=>{
  const s=sandbox();writeFileSync(s.reference,'Path validation fixture; not a screenshot.')
  const r=run(s.dir,[],{AURORALYS_QA_DIR:s.out,AURORALYS_APOLLO15_REFERENCE:s.reference,AURORALYS_QA_BASE_URL:'https://example.invalid'})
  assert.notEqual(r.status,0);assert.match(r.stderr,/AssertionError/)
  assert.equal(existsSync(s.out),false)
})
