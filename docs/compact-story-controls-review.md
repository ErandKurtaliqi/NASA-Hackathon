# Adjustment of documentary controls

Status: Visually implemented and approved by the user in Chrome for the compact design of Apollo 15. The user authorized the completion of the existing merge, only publish the integration branch and prepare a PR versus master. That approval does not set up full QA of the other missions, all segments, audio, activities or viewport sizes. No captures or replacement images have been generated. The closure and its gates are registered in [master-integration-finalization.md](master-integration-finalization.md).

## Product changes

- `src/components/storytelling/ContinuousStoryPage.module.css`: the deck moves from a fixed height of 154 px on desktop and 152 px on mobile to a grid in normal flow, with height determined by controls and a two-line status area. The 138 px fixed height of low mobile screens is also removed.
- Navigation, playback, position and volume are gathered in a row. The status area retains its space when changing segment or audio status; a long message can be navigated with keyboard. Buttons and sliders maintain minimum areas of 44 px. On mobile, buttons use icons with their full accessible names. On exceptionally narrow screens, the grid allows a second row instead of forcing controls to fit.
- The reader gains the space released by the deck. Margins are adjusted, spacing between segments, interlined to 1,7, narrative weight and header/metadata size; the main text retains 18–22 px on desktop and 17 px on mobile. The scrollbar channel is reserved to avoid text width variations.
- `src/components/storytelling/ContinuousStoryPage.tsx`: adds icons accessible to Previous/Next and brings together the chapter and segment in the player state, eliminating the duplicate context that occupied another row. It does not change handlers, segment detection, navigation, quizzes, activities or save.
- `src/components/storytelling/DocumentaryAudio.tsx`: adds Play/Pause icons, explicit accessible names and keyboard access to the status message. Effects, callbacks, position/volume controls and audio lifecycle remain identical.

The background rules, hardware, evidence, panel positions and their breakpoints were not modified. The reader's native scroll and deck are maintained as a flow element, without absolute/fixed positioning above the narrative. Stability and absence of overlap in a real browser must still be checked manually.

## Sizes requested

These values are **estimates derived from CSS**, no browser measurements or visual QA results. The actual height can be adapted to viewport content, zoom and restrictions.

| Viewport | Previous specified height | Approximate target height | Planned reduction | Visual verification |
|---|---:|---:|---:|---|
| 1440 × 900 | 154 px | 93 px | 40% | Pending on Chrome |
| 1366 × 768 | 154 px | 93 px | 40% | Pending on Chrome |
| 1024 × 768 | 154 px | 93 px | 40% | Pending on Chrome |
| 390 × 844 | 152 px | 96 px | 37% | Pending on Chrome |

## Validation executed

- `node --test tests/*.test.mjs`: **286 passed, 0 failed, 0 skipped**. Includes actual SSR routes of the eight missions/forty chapters, narration, quizzes and persistence.
- `npm.cmd run test:rover`: passed.
- `npx.cmd tsc -b --pretty false`: passed.
- `npm.cmd run build`: approved; warning of chunks greater than 500 kB is retained.
- `git diff --check`: passed.
- `tests/master-integration.test.mjs`: The historical comparison that prevented any CSS/audio change is adapted. It now requires equality of all panel and background rules, including responsive contexts; it maintains exact audio equality except for icons, accessible names and authorized focus. It also checks that the deck does not again have fixed height or absolute/fixed position. No evidence is removed or omitted.
- Local servers respond to HTTP and serve the old CSS and the adjusted CSS respectively. This check does not amount to visual inspection, geometric measurement, real playback or gesture testing.

## Manual comparison before/after

- **Before:** [Previous Apollo 15 layout](http://127.0.0.1:5214/story/apollo-15-rover).
- **Then:** [Apollo 15 adjusted](http://127.0.0.1:5226/story/apollo-15-rover).

The previous view comes from a frontend copy of the index tree, `b9e78d000a9f6c775ade4008bd72e08c6b8948c3`, in an external QA directory. The adjusted view uses this worktree. Both views are development, listen only to loopback and maintain independent storage by port. It was not necessary to restore files from the worktree or touch the index to prepare the comparison.

In Chrome, use the four table sizes, zooming at 100%, and capture both versions in the same chapter and segment. Check legibility, buttons, sliders, Tab navigation and make long messages accessible. Go forward/back: you should only change text, evidence and corresponding audio; hardware, background, panels and controls should remain stable during scrolling. Also check the quiz, activities and reloading progress.

Repeat with `apollo-11-reflector`, `apollo-16-rover`, `apollo-17-rover`, `sojourner`, `opportunity`, `viking-1` and `ingenuity`, changing the ID in both URLs. Screenshots at the four resolutions remain pending; screenshots from earlier reviews are not reused as evidence of this change.

## Adjustment checkpoint: merge and index preserved before closure

- Branch: `integration/haroon-master-continuous-storytelling`.
- `HEAD`: `3b45e8f2324e8af85e55d81a1020306e95e1706e`.
- `MERGE_HEAD`: `ddb458657e1fa5fca0bd117f265e95b444090712`.
- Index tree before/after: `b9e78d000a9f6c775ade4008bd72e08c6b8948c3`.
- This checkpoint also compared the hash of all prepared entries: it exactly coincided with the initial. The settings were left unprepared for revision. The user's subsequent instruction authorizes preparing and completing/publishing the merge; this section retains the previous record and does not describe the final status of publication.
