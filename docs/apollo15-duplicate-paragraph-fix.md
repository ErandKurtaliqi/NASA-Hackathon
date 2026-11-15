# Apollo 15 duplicated narrative paragraphs

Base main: `7606aaf787cc3d2aeaffaef6cdba6a5d320847e5`.

## Cause and targeted correction

`ContinuousStoryPage` rendered the primary narration as `<p>{item.text}</p>`,
then also rendered `story.journey[item.segment].copy` for Apollo 15 chapter 2 and
`story.legacy[item.segment].copy` for chapter 4. These were two narrative paths
for the same segment. In current main, the active `machineStories` catalog uses
adapted summaries, so the redundant paragraphs are not always literal copies;
the separate cinematic catalog maps directly to narration.

The production fix deletes only the two Apollo 15 conditional paragraph lines
(zero-based `item.chapter === 1` and `item.chapter === 3`). The primary paragraph
and original recording mapping remain unchanged. No global paragraph removal,
CSS adjustment, documentary redesign or narration edit is involved.

| Chapter | Four affected segments | Result |
| --- | --- | --- |
| My Journey | Launch & Landing; Lunar Environment & Controls; One-sixth Gravity; Milestones | Exactly one unchanged main narration paragraph per segment |
| My Legacy | Final Science Moment; Filming Liftoff; Current Status; Reflection | Exactly one unchanged main narration paragraph per segment |

Underlying journey/legacy data remains available to other components and optional
activities. Legitimate nested paragraphs, engineering challenges, scientific
sources, evidence, titles, audio controls, quiz, completion and timeline remain.
Apollo 11 and Apollo 17 scripts, approval states and published fixes are unchanged.

## Validation

- The eight focused rendering regressions reproduced the extra paragraphs before
  the fix. All pass after the two-line deletion.
- Focused suite: **62 passed, 0 failed**, including the eight reported segments,
  the other eight Apollo 15 segments, retained engineering/activity panels,
  legitimate additional Apollo 16 paragraphs, Moon approvals, audio behavior,
  quizzes and progress persistence.
- Full baseline: **291/364 passed, 73 failed**. Final full suite:
  **301/374 passed, the same 73 failed**. Failure names match: **zero new
  regressions**. Historical failures remain outside this presentation fix.
- `npm run build` passed, including `tsc -b` and the production Vite build.
  Git whitespace checks passed. The existing large-bundle warning remains.
- Real Chrome production QA passed **10 journeys**: Apollo 15 at **1600x667,
  1366x768 and 390x844**, plus the other seven documentaries at 1366x768.
- All **16 Apollo 15 segments** were checked at each required viewport: **48
  segment/viewport checks**, including **24 checks for the eight affected
  segments**. Each had one direct main paragraph matching the original script,
  the correct active recording, real advancing playback, immediate mute with a
  stopped clock, restart, visible NASA evidence and no horizontal overflow.
- Reverse jumps selected all eight affected recordings again correctly. Chapter
  shortcuts, four optional activity areas, engineering panels, complete quizzes,
  badges and persisted results after reload passed in every journey.
- All **16 original Apollo 15 MP3 SHA-256 hashes** match the inventory.
  `src/machineStories.ts`, `src/apollo15Narration.ts`, recording metadata,
  shared data, public assets and progress storage are unchanged.
- No JavaScript exceptions or audio errors occurred. Chrome logged only the
  existing unrelated favicon 404. Chrome was headless: media state and playback
  clocks were measured, not listening through physical speakers.

Local evidence is in `../qa-artifacts/apollo15-duplicates/`, including the
before-fix regressions, full baseline comparison, browser `results.json` and
24 screenshots of the corrected affected segments. Browser QA is reproducible
with `scripts/verify-apollo15-paragraphs.mjs` using the Playwright/Chrome/preview
environment variables documented by the existing QA scripts.

## Files changed

- `src/components/storytelling/ContinuousStoryPage.tsx` - two redundant lines removed.
- `tests/documentary-layout.test.mjs` - focused rendering regressions.
- `scripts/verify-apollo15-paragraphs.mjs` - real browser and original-hash checks.
- This report.

No new unresolved issue was found. The inherited test failures, favicon 404,
bundle warning and independent Apollo 11 editorial holds remain unchanged.
