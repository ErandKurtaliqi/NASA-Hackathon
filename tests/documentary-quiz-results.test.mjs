import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ui, freshStore, device, seed, fixture, key } from './helpers/mission-story-host.mjs'

for (const story of Object.values(ui.machineStories)) test(`${story.id}: quiz results are accurate, opt-in, durable and survive a new unfinished attempt`, async () => {
  const disk = device(seed(story.id)), store = globalThis.__saveStore = await freshStore()
  let summary, completed = 0
  const f = fixture(story.id, 5, { component: story.id === 'apollo-16-rover' ? ui.Apollo16Quiz : ui.DocumentaryQuiz,
    props: { story, sound: false, onSound() {}, onComplete() { completed++ }, onRetry() { summary = undefined }, onResult(value) { summary = value }, renderRecording: () => null } })
  try {
    const before = disk.memory.get(key)
    const answers = story.quiz.map((q, i) => i === 1 ? (q.answer + 1) % q.options.length : q.answer)
    for (const [i, answer] of answers.entries()) { f.answer(answer); f.click(i < 2 ? 'NEXT QUESTION' : 'View Results') }
    assert.equal(completed, 1)
    assert.deepEqual(summary, { answers, score: 2, total: 3 })
    assert.equal(disk.memory.get(key), before, 'Viewing results does not save without Complete Story')
    store.useProgress.getState().saveStoryQuiz(story.id, summary)
    const saved = disk.memory.get(key)
    assert.deepEqual((await freshStore()).useProgress.getState().storyProgress[story.id].quizResult, summary)
    f.click('TRY AGAIN'); f.answer(story.quiz[0].answer)
    assert.equal(summary, undefined)
    assert.equal(disk.memory.get(key), saved, 'An unfinished retry never erases the last saved result')
  } finally { f.dispose(); delete globalThis.__saveStore; delete globalThis.window; delete globalThis.document }
})
