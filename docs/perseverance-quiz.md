# Perseverance Chapter 5 — Test Your Knowledge

Scope: `/story/follow-perseverance/5` only. Scientific explanations reviewed
against official sources on **2026-11-04**. Original implementation and validation
records are retained below; current completion and save behavior are described
separately from that initial milestone.

## Historical inspection before the quiz redesign

The original `QuizChapter` read the three Perseverance questions in
`machineStories.ts`, scored immediately on option click and prevented re-answering.
Its `finished` condition became true as soon as the third answer was appended,
so the reward screen replaced the third question before its explanation could be
read. The parent marked the activity ready; its Complete Story button then called
`completeStoryChapter` and awarded the existing storyteller badge. This describes
the pre-redesign Perseverance flow; Apollo still uses the original quiz component.

Preserved verbatim:

| Question | Correct answer |
| --- | --- |
| Why did I land in Jezero Crater? | It has an ancient river delta (index 0) |
| Which system lowered me on cables? | The sky crane (index 1) |
| What do my sample tubes contain? | Documented Martian rock and regolith (index 0) |

All original choices and explanations remain unchanged in shared data. The
reward remains **Jezero Field Scientist**. Apollo's original quiz stays intact.

## Files and integration

Created during the initial quiz milestone:

- `src/components/storytelling/PerseveranceQuiz.tsx`: accessible staged quiz and
  results, chapter-local AURORALYS treatment using the existing gradient A asset.
- `src/components/storytelling/PerseveranceQuiz.module.css`: scoped styling,
  responsive layout, focus states and reduced-motion adaptations.
- `src/features/storytelling/quizAttempt.ts`: typed temporary state/actions,
  transition guards, derived scoring and appropriate result messages.
- `src/features/storytelling/quizLearning.ts`: typed explanatory notes,
  misconception-specific feedback and official source links. This is not a media
  manifest; no existing media or NASA credit record changes.
- `tests/storytelling-quiz.test.mjs`: real component/parent/reducer/store checks.
- This document.

Modified during that milestone:

- `src/components/MachineStoryPage.tsx`: one import and the Perseverance-only
  final-chapter render choice. Results use the existing activity-ready setter;
  retry clears that temporary readiness while retaining saved completion.
- `tests/storytelling-challenges.test.mjs`, `tests/storytelling-legacy.test.mjs`
  and `tests/storytelling-media.test.mjs`: older regression assertions now
  acknowledge the authorized Chapter 5 integration. The new suite compares the
  other nine routes and all original helpers against their prior behavior.

The initial quiz milestone changed no original question data, reward, storage
schema, route, voice helper, scene, homepage, explorer, Chapters 1–4, Apollo
implementation, media manifest, credit or dependency. Shared branding was outside
that milestone's scope. The current
`src/components/branding/FooterBrand.tsx` and quiz both display **AURORALYS**,
using the approved gradient A asset.

Current completion integration: `MachineStoryPage.tsx` mounts
`src/components/storytelling/PerseveranceCompletion.tsx` alongside the quiz for
Perseverance Chapter 5. Results signal readiness; this completion component owns
the Complete Story action and uses `src/store.ts`. It keeps the quiz mounted,
requires the preceding four chapters, and reconciles legacy flat chapter records
through the existing store actions. The original parent handler still serves
other chapters and Apollo; it is not Perseverance Chapter 5's completion action.

## Learning sequence, score and completion

1. **Choose:** one question, three native radio options. A selection may be
   changed. No correctness marker, explanation, question-specific source or
   reward is rendered before submission.
2. **Submit:** one answer is recorded, options lock, and feedback explains the
   correct answer and the selected misconception. The original explanation,
   additional scientific context and official links appear. Submission is
   idempotent; repeated/late events cannot increase the score.
3. **Continue:** Next Question advances only after submission. The third
   answer also stays in feedback until **View results** is chosen.
4. **Results:** show activity complete, submitted count, correct count, rounded
   percentage, review of all answers/explanations/sources, the original reward,
   retry and guidance to the existing Complete Story action below.
5. **Save:** Complete Story in `PerseveranceCompletion` calls the store's
   `completeStoryChapter` and `awardBadge` actions for the mission record and
   `follow-perseverance-storyteller` badge. It announces saved completion only
   when `useProgressPersistence` confirms a successful write and the badge is
   present. A low score still completes the activity. Completion recognition and
   accuracy are labeled separately;
   only 3/3 receives the factual “Every answer is correct in this attempt” message.
6. **Retry:** resets question, draft selection, answers and results in memory.
   Before the mission is complete in the session, retry clears readiness until
   the new attempt is finished. Already completed chapters remain valid during
   practice; save status is reported separately. Nothing is deleted from localStorage.

A rejected write preserves session progress and displays an accessible warning
with **Retry saving**. That control retries storage, not the quiz, and does not
replay badge awards. The key `beyond-earth-progress`, version and serialized schema
are unchanged. Initial read failures pause writes to protect existing records;
see [progress persistence and recovery](progress-persistence.md).

Scores are derived from the original answer indices, not accumulated click
counters. Percentages are rounded to whole numbers; the fraction stays exact.
There is no stored score, best-attempt field, forced pass threshold or new badge.
Reloading starts a new temporary attempt and restores successfully saved mission
completion, other chapters, Apollo progress, discoveries, instruments and badges.
Changes held only in memory after a failed save may be lost on reload.

## Scientific evidence

- [NASA — Perseverance mission / Why Jezero](https://science.nasa.gov/mission/mars-2020-perseverance/):
  supports the delta/lake rationale, sampling objectives and the distinction
  between past habitability, potential clues and confirmed life. The quiz does
  not claim a discovery of living organisms.
- [NASA — How We Land on Mars](https://science.nasa.gov/planetary-science/programs/mars-exploration/mission-timeline/how-we-land-on-mars/):
  explains Perseverance's powered descent stage and sky-crane cable lowering,
  distinct from earlier parachute braking.
- [JPL — Collection of Mars samples](https://www.jpl.nasa.gov/news/nasas-perseverance-rover-shows-off-collection-of-mars-samples/):
  supports the post-answer caveat that the mission's tubes also include
  atmospheric and witness tubes. The retained multiple-choice answer concerns
  geological material; it should not imply every mission tube holds a rock core.

No media was added, no mission outcome is promised, and no scientific coordinate
or existing NASA credit was edited. Links appear after submission and in review.

## Accessibility and motion

- Native form, fieldset/legend and labeled radios support keyboard and touch.
  Browser-native arrows/Space choose a radio; Tab/Enter reach and submit the
  answer. The entire option label is a large target with visible focus.
- A three-step indicator and separate correct/submitted counts distinguish
  progress from score. Correct/incorrect feedback uses text as well as color.
- After deliberate actions, focus moves to the feedback heading, next question
  or results heading. There is no focus/scroll change on initial mount or draft
  selection. Reduced motion makes explicit scroll instant and suppresses local
  and chapter-scoped shared-shell transitions.
- Mobile uses one readable question card, stacked options and full-width main
  actions. No animation library, timer, sound, camera or 3D view is added.
- The original optional header voice stays chapter-level; it neither reads the
  answer key nor automatically narrates changing quiz feedback.

## Automated validation

```powershell
node --test tests/*.test.mjs
npm.cmd run build
git diff --check
```

The new suite covers all 27 answer combinations, invalid/duplicate submissions,
all incorrect options, no early answer disclosure, the third explanation,
0/1/2/3 correct results, retry, completion signaling and focus/reduced-motion
contracts. The Complete Story action in `PerseveranceCompletion` is exercised
against the real store with in-memory localStorage, including legacy/other-mission
progress, badge preservation, rehydration, retry before save and practice after save.
Storage rejection and recovery also have dedicated coverage in
`tests/progress-persistence.test.mjs`.

The component host executes real JSX, effects, event handlers and the reducer;
browser geometry, native radio key events, screen-reader announcements and actual
speech are not measured. Separate server-render comparisons protect all nine
other story routes. Original helper functions, including Apollo's quiz and voice,
are compared unchanged with checkpoint `49f7545`.

Historical results from the initial quiz milestone: **46 tests passed** (37 existing,
9 new), including an older flat completed-chapter record without `storyProgress`.
`npm.cmd run build` passed
including TypeScript; `git diff --check` passed. The existing 823.49 kB shared
Three.js chunk warning remains. A temporary production preview returned HTTP 200
for Perseverance chapters 4/5, Apollo 17 chapter 5 and the existing gradient A
asset. Those are serving checks, not browser interaction acceptance. The owned
preview server was stopped.

At that milestone, SHA-256 comparison with the start-of-task snapshot confirmed
only the route integration and three named regression tests changed among pre-existing files.
All existing chapter, homepage, explorer, branding, scientific/media, credit,
progress and 3D files/assets remained byte-identical during that task. These are
historical results, not a new test run or a description of later completion changes.

## Manual browser checks

1. With chapter 5 unlocked, open `/story/follow-perseverance/5`. Confirm AURORALYS,
   one question and three options. Change a selection without submitting: no
   correctness, source, explanation or reward should appear. Submit should be
   disabled until an option is chosen.
2. Test every wrong option and each correct answer. Confirm specific feedback,
   original explanation, official links and locked answers. The last question
   must retain its explanation until View results. Repeated activation must not
   increase the score or skip a question.
3. Finish attempts scoring 0/3, 1/3, 2/3 and 3/3. Verify fractions, percentages,
   appropriate messages, activity completion and the unchanged reward. A partial
   score must not suggest perfect performance.
4. Before saving, retry and confirm a clean temporary attempt with Complete Story
   locked again. Finish and choose Complete Story with Chapters 1–4 complete:
   verify the confirmed save or explicit storage warning. Test storage recovery
   separately using the progress-persistence guide above. Retry the quiz after
   saving: saved completion and unrelated mission progress
   must remain. Reload and verify the schema/progress works as before. Do not
   reset the team's real progress for testing; use a separate browser profile.
5. Use Tab, radio arrows/Space, Enter, a screen reader and touch. Check large
   targets, visible focus and sensible heading announcements without duplicate
   speech. Test reduced motion before loading and after changing the preference.
6. At 360×800, 390×844, 439×591, 820×640 and 1280×720, check overflow, answer
   labels, feedback, review links and the existing Complete Story action. Test
   zoom and rotation. Confirm original optional voice still starts/stops normally.
7. Revisit Chapters 1–4, Apollo 17, explorers and homepage; prior reviewed visuals,
   interactions, source credits, branding state and progress must be unchanged.

No real browser acceptance was claimed in the initial quiz implementation pass.
Attempts are temporary by design; only successfully saved mission progress persists.

No branch, commit, push, merge, publication or dependency installation was made.
