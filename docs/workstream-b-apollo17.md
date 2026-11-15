# Workstream B — Apollo 17 reusable Rover Story

Isolated detached worktree:
`apollo17 (repository-relative)`, based on `8120d9e`.
No changes have been transferred to `integration/main-feature-review`, committed,
merged, or pushed. Dependencies are reused read-only through a `node_modules`
junction; no dependency was installed or changed.

Status: implemented and automatically validated; real-browser visual, touch and
screen-reader review is still required. No recorded Apollo 17 narration exists in
the approved assets, and none is invented here.

## Exact files

Modified:

- `src/components/MachineStoryPage.tsx` — seven-line Apollo 17-only presentation seam.
- `tests/apollo-progress-persistence.test.mjs` — real page/store regressions retained;
  updated optional reading navigation/focus expectations and added two Apollo 17
  scroll/save-recovery tests. Browser-voice DOM is isolated here and tested directly below.
- `tests/apollo15-registration.test.mjs` — preserve exact Perseverance comparisons,
  verify authorized Apollo 17 presentation rather than obsolete layout snapshots.
- `tests/helpers/apollo-quiz-contract.mjs` — remove only the authorized Apollo 17
  import/branch when protecting historical shared completion source.
- `tests/storytelling-challenges.test.mjs`
- `tests/storytelling-landmarks.test.mjs`
- `tests/storytelling-legacy.test.mjs` — retain historical helper/source checks and
  exact protected Perseverance comparisons; verify Apollo 17's authorized presentation
  and single main landmark. Full mission content is checked in the new dedicated suite.

Created:

- `src/components/storytelling/Apollo17ScrollStory.tsx`
- `src/components/storytelling/Apollo17ScrollStory.module.css`
- `src/components/storytelling/Apollo17BrowserVoice.tsx`
- `src/features/storytelling/apollo17StorySteps.ts`
- `src/features/storytelling/apollo17StoryMedia.ts`
- `tests/workstream-b-apollo17.test.mjs`
- `public/images/apollo17-story/vehicle.jpg`
- `public/images/apollo17-story/launch.jpg`
- `public/images/apollo17-story/rover.jpg`
- `public/images/apollo17-story/orange.jpg`
- `docs/workstream-b-apollo17.md`

`src/apollo15Narration.ts` was restored to the exact baseline Git blob as part of
worktree line-ending setup by the coordinator; it has no logical or staged diff and
is not a workstream modification. All original MP3s and prior images are untouched.

## Behavior and reuse

Open `/story/apollo-17-rover/1`. Existing chapter unlocks, saved resume links, route
validation, story ID `apollo-17-rover`, hardware ID `lrv`, reward and badge IDs remain.

`Apollo17ScrollStory` reuses `RoverStoryLayout`, `StoryMedia`, `useScrollStory`,
`useStoryReducedMotion`, `createChapterScrollBoundary`, `ApolloProgressSaveStatus`
and the existing `QuizChapter`. Existing Apollo 15 presentation CSS is reused without
editing it; the new CSS contains only Apollo 17 background/source-card presentation.
No shared GIS/3D component or scientific dataset changes.

The step adapter reads the canonical mission record directly: 7 Meet Me steps,
5 journey steps, 6 challenges/discoveries steps, 5 legacy steps, and the unchanged
three-question quiz. Every profile value, journey account, challenge/problem/solution,
discovery and legacy explanation remains readable. There is no copied mission fact
database to drift independently.

Desktop has rover / reading / evidence areas; tablet and mobile reuse the existing
layout reflow. Mobile evidence is included per reading step, preserving captions,
credits and source links. The rover presentation is a real NASA 2D photograph, with
no canvas, WebGL requirement or new model. Image errors use the shared retry/source
fallback. A missing direct photograph produces a factual source card, not an unrelated
placeholder. Surface context photographs identify what they actually depict.

Natural scrolling selects reading steps and evidence; Previous/Next segment selects
and focuses the card. Previous/Next chapter remain explicit native controls. Reading
chapters do not require clicking optional profile/discovery controls. A labelled
checkbox permits opting out of continuation by scrolling past a chapter's end.
Mounting, programmatic segment selection and audio completion do not save chapters.
The quiz never completes by scrolling: the third explanation remains visible until
View Results, followed by the existing explicit Complete Story action.

The shared `finish` handler, quiz scoring/retry, legacy reconciliation, store,
schema/key, badge deduplication and save acknowledgement/retry are unchanged.
Storage rejection remains visible after chapter navigation; Retry saving persists
the current complete snapshot. No badges are inferred or awarded by merely reading.

Browser voice is explicitly labelled as browser-generated speech, not an approved
mission recording. The shared narration hook remains opt-in, supports the selected
step's existing text, and is cancelled on route exits/disposal. Apollo 17-local controls
add pause/resume and replay; Sound off stops the queue. Recorded narration is stopped
before starting browser speech. Navigation intent, history changes, page hide and
hidden tabs stop narration. Pause → hide → return resets paused state and offers Play
for a fresh start, rather than resuming a cancelled utterance. No timed captions or
sentence alignment are claimed for browser-generated voice.

## NASA evidence and verification

Verified through official NASA sources. Exact URLs, descriptions, meaningful
alt text, dimensions, credits, dates and usage notes are in `apollo17StoryMedia.ts`.
These are unchanged downloaded JPEG renditions, not generated or locally edited art.
Four assets total 254,780 bytes.

| Local image | Official record / actual subject | Credit | Original rendition and source |
| --- | --- | --- | --- |
| `vehicle.jpg` | AS17-134-20454, Schmitt seated in LRV-3 at Station 9 (Van Serg Crater), third EVA | NASA / Eugene A. Cernan, identified as photographer by NASA | [NASA gallery](https://www.nasa.gov/specials/apollo50th/photos.html), [served image](https://www.nasa.gov/wp-content/uploads/static/apollo50th/img/apollo17-07.jpg) |
| `launch.jpg` | S72-55070, actual nighttime Saturn V launch, 12:33 a.m. EST December 7, 1972 | NASA | [NASA catalogue](https://images.nasa.gov/details/S72-55070), [small rendition](https://images-assets.nasa.gov/image/S72-55070/S72-55070~small.jpg) |
| `rover.jpg` | Catalogue 7036668, LRV parked near a large boulder at Taurus-Littrow; fieldwork context, not a landing/failure photograph | NASA | [NASA catalogue](https://images.nasa.gov/details/7036668), [small rendition](https://images-assets.nasa.gov/image/7036668/7036668~small.jpg) |
| `orange.jpg` | AS17-137-20990, orange soil at Shorty Crater during EVA 2, with gnomon/photometric reference | NASA | [NASA gallery](https://www.nasa.gov/specials/apollo50th/photos.html), [served image](https://www.nasa.gov/wp-content/uploads/static/apollo50th/img/apollo17-08.jpg) |

NASA catalogue metadata was retrieved from
`https://images-api.nasa.gov/search?nasa_id={ID}`. Historical catalogue text can
contain errors in mission counts, elapsed hours and sample mass; those summaries
were **not** copied into the scientific story. The existing reviewed mission record
remains authoritative for this implementation. The new manifest describes only the
verified photographic subjects.

[NASA media guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)
govern factual educational use. Credit NASA; do not imply endorsement, and respect
third-party copyright and identifiable-person publicity/privacy rights. No NASA
branding rights are granted. Existing `apollo17-rover.jpg` / `apollo17-launch.jpg`
remain untouched; the new presentation uses independently traceable renditions rather
than inventing provenance for those older local copies.

For coast, initial LRV development and future engineering lessons no dedicated direct
photograph is selected. Source cards retain the NASA mission reference; further image
curation can add verified evidence without changing progress or chapter logic.

## Validation

- Baseline reproduced: **165 tests passed** after correcting worktree CRLF vs original
  narration-blob setup; no test was removed to hide that environment issue.
- New dedicated suite: **6 tests passed** for complete canonical content, all five
  rendered screens without canvas/audio recordings, four exact NASA asset hashes,
  protected Apollo 15/Perseverance/store/data bytes, and actual optional browser-voice
  lifecycle/exclusivity/error/visibility behavior.
- Two additional real page/store tests cover scroll-selected evidence, focused segment
  navigation, no reading writes, deliberate chapter boundary, rejected storage writes,
  recovery, opt-out and explicit quiz completion.
- Complete suite: `node --test tests/*.test.mjs` — **173 passed, 0 failed**.
- `npm.cmd run build` — passed (2,650 modules; existing Three.js 823.49 kB warning).
- `tsc.cmd -p tsconfig.app.json --noEmit --pretty false` — passed.
- `git diff --check` — passed; Git can emit the existing LF/CRLF conversion notices.
- Isolated Vite HTTP smoke check on port 5182 — **200 OK** for the story SPA HTML
  (`/story/apollo-17-rover/1`, 804 bytes with the root mount), transformed
  `/src/components/storytelling/Apollo17ScrollStory.tsx` (`text/javascript`), and
  `/images/apollo17-story/vehicle.jpg` (`image/jpeg`, 72,525 bytes). The smoke check
  used `cacheDir: 'dist/.vite-workstream-b'` and disabled dependency discovery only
  for these HTTP requests; `server.close()` completed in `finally`, process exit 0.
  An initial immediate shutdown interrupted Vite's background optimizer; rerunning
  this bounded HTTP check without discovery confirmed clean shutdown. This checks
  serving and transformation only, not browser execution, rendering, audio or UI.

All existing 165 tests still execute. Historical visual assertions changed only where
Apollo 17's layout was explicitly authorized to change. The existing 27-combination
quiz, score, last-explanation, retry, persistence rejection/recovery, reload, legacy
and badge-isolation cases remain active. These are meaningful runtime tests, not
claims of browser screenshot or audible voice verification.

## Isolated demo and browser review

Use this worktree only. Avoid default Vite dev caching into the shared dependency
junction. Start with an isolated cache and port:

```powershell
node --input-type=module -e "import {createServer} from 'vite'; const s=await createServer({cacheDir:'dist/.vite-workstream-b',server:{host:'127.0.0.1',port:5182,strictPort:true}}); await s.listen(); s.printUrls();"
```

Then visit `http://127.0.0.1:5182/story/apollo-17-rover/1`. Use a separate test browser
profile to avoid changing any real progress already stored on this demo origin.
Different ports are separate origins; progress on port 5182 remains local to that origin.
The coordinator must not run two dev servers writing the same cache directory.

Pending manual checks: desktop/tablet and 360×800 / 390×844 / 439×591, 200% zoom,
sticky controls and caption visibility, actual touch/scroll and chapter boundary opt-out,
Tab/Enter/Space and focus after navigation, screen-reader announcements, reduced motion,
image failures, offline/browser speech availability and English voice quality,
pause/resume/replay/mute, background-tab recovery, chapter/browser Back and cleanup.
Test save failure/recovery in that isolated profile and verify dashboard reload/badges.
No real-browser or listening pass is claimed by this workstream.

## Perseverance adaptation plan — no implementation

1. Retain its existing pilot, chapters 3–5, landing reconstruction, verified NASA media,
   quiz/completion and progress owner. Do not copy Apollo mission data or replace its
   existing 3D scene internals.
2. After Apollo 15/17 visual review, extract a mission-neutral presentation adapter for
   chapter steps, narration slot and evidence slot. `RoverStoryLayout` already supplies
   the composition; keep the story controller and all completion handlers outside it.
3. Feed existing Perseverance step IDs/media/controller into the adapter, preserving
   landing reconstruction's explicit educational label and public scene interface.
4. Keep recorded audio and browser speech separate optional providers. Apollo 15 timing
   review is not transferable to Perseverance. Do not guess cues or introduce autoplay.
5. Verify all existing Perseverance quizzes/save/retry/legacy/badges and NASA credit
   regressions before enabling any new layout. Require desktop/mobile accessibility
   review before replacing the approved presentation.

## Coordination before integration

No map-pin integration is added. Erand retains GIS identifiers, coordinates and
selection ownership; this workstream only uses existing story routes and machine IDs.

This workstream does not modify files owned by A or C. Its new baseline scope test
intentionally protects those files at `8120d9e`; when A's approved patch is integrated,
update that guard to the approved A checkpoint without weakening store/science/mission
content protections. This is an assertion-baseline coordination decision, not a runtime
dependency on A or C. `MachineStoryPage` is the only application integration seam here.

Review the mission adapter/evidence first, then run the isolated browser demo and quiz/
save-recovery checks. Integrate only after approval; do not merge workstreams automatically.
