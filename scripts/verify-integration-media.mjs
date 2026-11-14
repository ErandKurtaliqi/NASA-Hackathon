// HTTP/file integrity QA only. Does not claim browser playback or listening QA.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const [externalRoot, development, production, output] = process.argv.slice(2)
if (!externalRoot || !development || !production || !output) throw Error('Expected external audio directory, loopback dev URL, loopback preview URL and output JSON')
for (const url of [development, production]) assert.equal(new URL(url).hostname, '127.0.0.1')
const root = fileURLToPath(new URL('../', import.meta.url)), hash = bytes => createHash('sha256').update(bytes).digest('hex')
const json = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const expected = new Map([
  ...json('src/features/storytelling/apollo16AudioManifest.json').map(row => [row.path, row.sha256]),
  ...json('docs/mission-integration/ingenuity-source-inventory.json').files.map(row => [row.path, row.sha256]),
  ...json('docs/moon-package/inventory.json').files.filter(row => row.mission === '15' && row.chapter && row.entry.endsWith('.mp3')).map(row => [`/audio/apollo-15/chapter-${row.chapter}/${row.segment}.mp3`, row.sha256]),
])
const missions = [], missing = ['apollo-11','apollo-17']
let total = 0, manifestHashesChecked = 0
for (const [mission, count] of Object.entries({'apollo-15':19,'apollo-16':18,sojourner:19,opportunity:19,'viking-1':18,ingenuity:19})) {
  const directory = mission === 'apollo-15' ? resolve(root, 'public/audio', mission) : resolve(externalRoot, mission)
  const paths = readdirSync(directory).filter(name => /^chapter-[1-5]$/.test(name)).flatMap(chapter => readdirSync(join(directory, chapter)).filter(name => /^[1-9]\.mp3$/.test(name)).map(name => `${chapter}/${name}`))
  assert.equal(paths.length, count)
  for (const path of paths) {
    const bytes = readFileSync(join(directory, path)), route = `/audio/${mission}/${path}`
    if (expected.has(route)) { assert.equal(hash(bytes), expected.get(route), route); manifestHashesChecked++ }
    const response = await fetch(development + route)
    assert.equal(response.status, 200, route)
    assert.match(response.headers.get('content-type'), /audio\/mpeg/)
    assert.equal(hash(Buffer.from(await response.arrayBuffer())), hash(bytes), route)
    const range = await fetch(development + route, { headers: { Range: 'bytes=0-15' } })
    assert.equal(range.status, 206, route)
    assert.deepEqual(Buffer.from(await range.arrayBuffer()), bytes.subarray(0, 16))
    const deployed = await fetch(production + route, { method: 'HEAD' })
    if (mission === 'apollo-15') assert.match(deployed.headers.get('content-type'), /audio\/mpeg/)
    else assert.ok(!deployed.headers.get('content-type')?.includes('audio/'), 'External originals leaked into preview')
  }
  total += paths.length
  missions.push({ mission, recordings: paths.length, developmentByteHashesAndRanges: true, productionAudioAvailable: mission === 'apollo-15' })
}
const sample = development + '/audio/sojourner/chapter-1/1.mp3'
assert.equal((await fetch(sample,{headers:{Origin:'https://unrelated.example'}})).status,403)
assert.equal((await fetch(sample,{method:'POST'})).status,405)
assert.equal((await fetch(sample,{headers:{Range:'bytes=999999999-'}})).status,416)
const report = { totalLocalOriginals: total, manifestHashesChecked, missions, missingOriginalMissions: missing,
  externalOriginalsAddedToGitOrDist: 0, developmentOriginMethodRangeChecks: 'passed',
  productionExternalAudioIsolation: 'passed, including with the development environment variable set',
  browserPlaybackVerified: false, limitation: 'HTTP integrity and range checks do not verify audible playback, synchronization, layout or physical devices.' }
writeFileSync(resolve(root, output), JSON.stringify(report, null, 2)+'\n')
console.log(JSON.stringify(report))
