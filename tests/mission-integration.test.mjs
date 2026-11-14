import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { ui, freshStore, device, seed, fixture, finishQuiz, key, chapters, text, assertOtherProgress, warning, confirmation, assertDashboard } from './helpers/mission-story-host.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const ids = ['apollo-16-rover', 'sojourner', 'opportunity', 'viking-1', 'ingenuity']
const read = path => readFileSync(`${root}/${path}`, 'utf8').replace(/\r\n/g, '\n')
const inventory = JSON.parse(read('docs/mission-integration/source-inventory.json'))

test('source transfer preserves the original story scripts, notes, questions and media metadata without private Git ancestry or assets', () => {
  // marsStories.ts now adds the separately reviewed Ingenuity registration;
  // the original E scripts and media inventory remain byte-identical.
  const untouched = ['apollo16Story.ts','apollo16Recordings.ts','apollo16AudioManifest.json','apollo16ImageManifest.json','marsStoryContent.json','marsMediaFiles.json']
  for (const name of untouched) {
    const item = inventory.files.find(f => f.path.endsWith(`/${name}`)), bytes = Buffer.from(read(item.path))
    const blob = createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex')
    assert.equal(blob, item.sourceBlob, name)
  }
  const ancestry = new Set(execFileSync('git', ['rev-list','HEAD'], {cwd:root,encoding:'utf8'}).trim().split('\n'))
  for (const ref of ['44e6a65982e86d050a5305a708bb945f1669c13b','814d0443f65c77164635bc43b643a2aea2799d5f']) assert.ok(!ancestry.has(ref))
  for (const mission of ['apollo-16','sojourner','opportunity','viking-1','ingenuity']) assert.equal(existsSync(`${root}/public/audio/${mission}`),false)
  for (const dir of ['docs/mars-stories-source','docs/apollo16-source','public/images/apollo16-story','public/images/mars-stories']) assert.equal(existsSync(`${root}/${dir}`),false)
  const content = JSON.parse(read('src/features/storytelling/marsStoryContent.json'))
  assert.deepEqual(content['viking-1'].chapters.map(c=>c.length),[3,4,4,4])
  assert.equal(Object.values(content).flatMap(c=>c.chapters.flat()).length,47)
  const audio = JSON.parse(read('src/features/storytelling/apollo16AudioManifest.json'))
  assert.equal(audio.length,18)
  assert.deepEqual([1,2,3,4,5].map(ch=>audio.filter(a=>a.chapter===ch).length),[4,4,3,4,3])
})

test('eight real stories have independent identities; Ingenuity is a helicopter with its supplied story', () => {
  assert.equal(Object.keys(ui.machineStories).length,8)
  assert.equal(ui.machineStories['follow-perseverance'],undefined)
  assert.equal(ui.machineStories.ingenuity.machineId,'ingenuity')
  assert.equal(new Set(Object.values(ui.machineStories).map(s=>s.machineId)).size,8)
  assert.equal(ui.machineStories['viking-1'].machineId,'viking-1')
  assert.match(ui.machineStories['viking-1'].heroLine,/stationary lander/)
  assert.equal(ui.machineStories['apollo-16-rover'].machineId,'lrv-2')
  assert.deepEqual(ids.map(id=>ui.machineStories[id].quiz.map(q=>q.answer)),[[1,0,1],[2,0,0],[0,1,0],[2,0,1],[1,2,2]])
})

for (const id of ids) {
  test(`${id}: every four-choice quiz attempt scores accurately without prematurely saving or awarding`, async () => {
    const d=device(seed(id));globalThis.__saveStore=await freshStore()
    try {
      for(let a=0;a<4;a++)for(let b=0;b<4;b++)for(let c=0;c<4;c++) {
        const f=fixture(id,5),choices=[a,b,c]
        try {
          assert.equal(f.all(n=>n.type==='button'&&text(n).includes('COMPLETE STORY'))[0].props.disabled,true)
          choices.forEach((answer,i)=>{f.answer(answer);f.click(i<2?'NEXT QUESTION':'View Results')})
          assert.ok(f.text().includes(`You scored ${choices.filter((v,i)=>v===ui.machineStories[id].quiz[i].answer).length} / 3`))
        } finally {f.dispose()}
      }
      assert.equal(d.writes(),0)
      assert.deepEqual(globalThis.__saveStore.useProgress.getState().badges,['previous-badge'])
    } finally {delete globalThis.__saveStore;delete globalThis.window}
  })
  test(`${id}: real durable save, write failure/recovery, reload, practice retry and badge idempotence preserve other missions`, async () => {
    const initial=seed(id),d=device(initial);globalThis.__saveStore=await freshStore();const f=fixture(id,5)
    try {
      finishQuiz(f,id);d.reject(true);f.click('COMPLETE STORY')
      assert.equal(warning(f).length,1);assert.equal(confirmation(f).length,0)
      assert.equal(JSON.parse(d.memory.get(key)).state.storyProgress[id].completedMission,false)
      d.reject(false);f.click('Retry saving')
      assert.equal(warning(f).length,0);assert.equal(confirmation(f).length,1)
      assertDashboard(id,5,5,true)
      f.click('COMPLETE STORY');f.click('TRY AGAIN');finishQuiz(f,id);f.click('COMPLETE STORY')
      const saved=JSON.parse(d.memory.get(key)).state
      assert.deepEqual(saved.storyProgress[id].completed,chapters)
      assert.equal(saved.badges.filter(b=>b===`${id}-storyteller`).length,1)
      assertOtherProgress(saved,initial)
      const reloaded=await freshStore()
      assert.deepEqual(reloaded.useProgress.getState().storyProgress[id],saved.storyProgress[id])
      assert.deepEqual(reloaded.useProgress.getState().badges,saved.badges)
    } finally {f.dispose();delete globalThis.__saveStore;delete globalThis.window}
  })
  test(`${id}: original reading steps, accessible alternative selection, missing-audio notice and cleanup remain usable`, async () => {
    const d=device(seed(id,false));globalThis.__saveStore=await freshStore();const f=fixture(id,1)
    try {
      assert.ok(f.text().includes('Recorded narration omitted from this code review'))
      assert.equal(f.all(n=>n.props['data-recording-src']).length,0,'No absent recording mounts a player')
      assert.equal(f.all(n=>n.type==='figure'&&n.props['data-hardware-kind']).length,1)
      f.click('Next segment')
      assert.ok(f.text().includes('Segment 2 of'))
      assert.equal(d.writes(),0)
      f.click('NEXT CHAPTER')
      assert.deepEqual(JSON.parse(d.memory.get(key)).state.storyProgress[id].completed,['meet'])
      assert.equal(f.navigations.at(-1),`/story/${id}/2`)
    } finally {f.dispose();delete globalThis.__saveStore;delete globalThis.window}
    assert.equal([...d.listeners.values()].reduce((n,set)=>n+set.size,0),0)
  })
  test(`${id}: legacy flat prerequisites reconcile; partial badge-write failure never confirms a saved badge`, async () => {
    const initial=seed(id);delete initial.storyProgress[id]
    const d=device(initial);globalThis.__saveStore=await freshStore();const f=fixture(id,5)
    try {
      finishQuiz(f,id);d.rejectBadge(true);f.click('COMPLETE STORY')
      const partial=JSON.parse(d.memory.get(key)).state
      assert.equal(partial.storyProgress[id].completedMission,true)
      assert.ok(!partial.badges.includes(`${id}-storyteller`))
      assert.equal(warning(f).length,1);assert.equal(confirmation(f).length,0)
      d.rejectBadge(false);f.click('Retry saving')
      const saved=JSON.parse(d.memory.get(key)).state
      assert.deepEqual(saved.storyProgress[id].completed,chapters)
      assert.equal(saved.badges.filter(b=>b===`${id}-storyteller`).length,1)
      assert.equal(confirmation(f).length,1);assertOtherProgress(saved,initial)
    } finally {f.dispose();delete globalThis.__saveStore;delete globalThis.window}
  })
}
