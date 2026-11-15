# Coordinated delivery of Rover Stories — isolated review

Common base: `8120d9ecba6babb9e2c0695c02c6ef96234b359b`. No results have been integrated or changes
applied to the protected branch.

## Ownership and isolation

| Workstream | Name | File ownership |
| --- | --- | --- |
| A | Audio | Apollo15ScrollStory, StoryRecording; new Apollo 15 helpers; new scripts/data/reviewer and A tests. |
| B | Apollo 17 | Seam MachineStoryPage; new Apollo 17 components/manifests/media; historical tests adjusted only to the authorized layout and new B tests. |
| C | Apollo 15 activity | Only new generic activity files, Apollo 15 case, demo HTML, C tests and document. No injection into stories. |
| D | Map audit | Map analysis/QA and this report; does not modify application code. |

The four workstreams were reviewed in separate worktrees.

Existing dependencies are shared for reading by Junction `node_modules`; no agent installs
application dependencies or edits that folder. Demos use explicit local caches within each `dist`.
B/C HTTP ephemeral servers were closed at the end; there is no deployment or permanent revision
server.

A Windows checkout converted the original script to CRLF, making a failed test that compares its
bytes to the original blob. The same blob was replaced and the stat-cache of that single file was
refreshed, without staged diff or functional modification. MP3s were not altered. The baseline passed 165/165 tests after the correction.

## Other review workstreams

| Workstream name | Identifier |
| --- | --- |
| Apollo 16 | `apollo16` |
| Mars stories | `mars-stories` |
| Rover Stories release candidate | `rover-stories-release-candidate` |
| Review of lunar stories | `moon-storytelling-qa` |
| Integration of Ingenuity | `mission-integration-ingenuity` |
| Visual correction | `visual-correction` |
| Integration of storytelling | `master-integration` |

## Results and limits

### A — audio and cue review

The 19 recordings have been processed locally using whisper.cpp portable, without uploading them to
external services or modifying MP3. The package contains automatic transcription and 54 candidate
groups with audio token offsets, not word-disaggregated times. Toponyms and some phrases require
human correction. These candidates are not confused with approved captions: 0 human reviews and 19
pending production records. The reviewer captures/edits times using the actual player and allows
exporting an explicit review.

Final validation and inventory A: see `./workstream-a-audio.md`. Fine synchronization is not
declared complete until the cues are approved by listening.

Workstream A passed 174/174 tests (165 + 9), TypeScript checks, and the build. The review verified all 5,054,347 original MP3 bytes and 295.784490 seconds of total MPEG duration. The coordinator found incorrect media paths when serving the reviewer over HTTP. After the fix, a regression test checked the generated URLs for the first and last MP3s and an image, verifying HTTP 200 responses and identical bytes. The reviewer HTML/JS fix left the application runtime untouched. The Whisper executable, model, and temporary files were removed after the reproducible data was generated.

| Workstream | Full suite in its own worktree | Checks |
| --- | --- | --- |
| A | 174/174 | 9 new; TypeScript/build/diff-check; real HTTP reviewer resources. |
| B | 173/173 | 8 new; TypeScript/build/diff-check; SPA/module/JPEG by HTTP. |
| C | 173/173 | 8 new; Normal TypeScript/build and preview/diff-check; HTML/module/JPEG per HTTP. |
| D/base | 165/165 | TypeScript/build/diff-check; read-only analysis. |

These are separate results; there is no integrated joint suite result yet. Builds retain the
Three.js previous warning of 823.49 kB.

### B — Apollo 17 using the shared layout

Apollo17ScrollStory consumes RoverStoryLayout, scroll controller, StoryMedia and existing quiz. Its
five chapters retain facts, discovery log, data and reward/persistence conditions. It does not
require WebGL. It offers optional browser voice, not invented MP3 recordings; clean playback and
retains independent reading.

Four new traceable NASA images (254,780 bytes): Schmitt on the rover, night launch, rover on rocky
terrain and orange soil. Scenes without direct photo show documentation, without replacing it with
other historical images. Document B includes a Perseverance adaptation plan, without modifying it.

Validation: 173/173 (165 previous + 8 new), TypeScript, production and diff-check. Smoke HTTP: SPA
path, transformed module and image return 200; it is not a visual or browser hearing test. Manual
pending review.

Inventory and sources: `./workstream-b-apollo17.md`.

### C — standalone activity

Generic prediction and evidence activity: Apollo 15 hammer and feather. Radio options, explicit submission,
feedback by response, NASA evidence and local retry. It does not change mission score, chapters,
badges or progress. Frame S71-43788 is identified as real television; the activity clarifies that a
single frame does not measure drop times and links the NASA video. The component is not yet inserted
into stories.

Validation: 173/173 (165 + 8), TypeScript, normal build and build independent of the correct
preview; diff-check. HTML, module and JPEG served by HTTP with 200; closed server. Real DOM, touch
and screen reader remain pending.

Inventory and sources: `./workstream-c-activity.md`.

### D — maps and risks

The public map receives `focusId`, but does not issue selection to the browser. Location and
hardware identities are different. Apollo 15 has no pin registered. The proposal requires additive
callback, explicit bindings approved by planet and resolution by getStoryEntry; it does not derive
name paths/coordinates or force blocked chapters. It includes return/focus contract and GIS
responsibilities.

The analysis separates proven defects (unsynchronised selection, existing layering/style status,
Three sharing cost) from browser-required risks (sticky controls, 45% viewport reading, zoom and
mobile). GIS patch is not applied.

Base Validation D: 165/165, TypeScript, production and diff-check correct. Full contract:
`workstream-d-map-contract.md`.

## Recommended review and integration

1. Start listening/revisioning all 19 tracks with package A. Correct names and contrast each
   sentence limit in real audio; associate only relevant evidence.
2. Review the small runtime changes of A (seek/replay/end/change of resource and mobile evidence)
   and activity C on your independent demos.
3. Review workstream B for Apollo 17 on desktop and tablet and at 360×800, 390×844, and 439×591. Check 200% zoom, keyboard navigation, reduced motion, browser narration, quiz, save rejection, Retry saving, and reload.
4. Only after explicit approval, prepare a revision integration environment. B contains a scope test
   that protects Apollo 15 against 8120d9e; it must be updated to approved A content, maintaining
   data protections/store and Perseverance. It is a test-baseline, not runtime conflict.
5. Run complete suite, build, TypeScript and diff-check on that joint result. Do not add independent
   results as if the set was already validated.
6. Coordinate D with Erand: callback, pin/story ratio, new scientific record of Apollo 15,
   input/resumption behavior and focus of return. Do not touch GIS or reuse the pending homepage
   handoff contract for those changes.

The workstream changes remain uncommitted. The `integration/main-feature-review`, main, original feature, stash
and documentary backup are preserved. Homepage, its audios/captions, IDs, storage schema, maps, 3D
and scientific data are not changed in the protected checkout. Worktrees contain the results for
review.

## Exact final inventory by worktree

### A: Audio (12 files)

- Modified: `src/components/storytelling/Apollo15ScrollStory.tsx`
- Modified: `src/components/storytelling/StoryRecording.tsx`
- New: `docs/workstream-a-asr-candidates.json`
- New: `docs/workstream-a-audio-review-data.js`
- New: `docs/workstream-a-audio-review.html`
- New: `docs/workstream-a-audio-review.js`
- New: `docs/workstream-a-audio-review.json`
- New: `docs/workstream-a-audio.md`
- New: `scripts/workstream-a-audio-review.mjs`
- New: `scripts/workstream-a-prepare-asr.mjs`
- New: `src/features/storytelling/apollo15CueEvidence.ts`
- New: `tests/workstream-a-audio.test.mjs`

### B: Apollo 17 (18 files)

- Modified: `src/components/MachineStoryPage.tsx`
- Modified: `tests/apollo-progress-persistence.test.mjs`
- Modified: `tests/apollo15-registration.test.mjs`
- Modified: `tests/helpers/apollo-quiz-contract.mjs`
- Modified: `tests/storytelling-challenges.test.mjs`
- Modified: `tests/storytelling-landmarks.test.mjs`
- Modified: `tests/storytelling-legacy.test.mjs`
- New: `docs/workstream-b-apollo17.md`
- New: `public/images/apollo17-story/launch.jpg`
- New: `public/images/apollo17-story/orange.jpg`
- New: `public/images/apollo17-story/rover.jpg`
- New: `public/images/apollo17-story/vehicle.jpg`
- New: `src/components/storytelling/Apollo17BrowserVoice.tsx`
- New: `src/components/storytelling/Apollo17ScrollStory.module.css`
- New: `src/components/storytelling/Apollo17ScrollStory.tsx`
- New: `src/features/storytelling/apollo17StoryMedia.ts`
- New: `src/features/storytelling/apollo17StorySteps.ts`
- New: `tests/workstream-b-apollo17.test.mjs`

### C: Apollo 15 activity (9 files)

- New: `activity-preview.html`
- New: `docs/workstream-c-activity.md`
- New: `src/components/storytelling/activities/ActivityPreview.module.css`
- New: `src/components/storytelling/activities/ActivityPreview.tsx`
- New: `src/components/storytelling/activities/EvidencePredictionActivity.module.css`
- New: `src/components/storytelling/activities/EvidencePredictionActivity.tsx`
- New: `src/features/storytelling/activities/apollo15Prediction.ts`
- New: `src/features/storytelling/activities/evidencePrediction.ts`
- New: `tests/workstream-c-activity.test.mjs`

### D: Map audit (2 files)

- New: `docs/workstream-d-map-contract.md`
- New: `docs/workstreams-review.md`

There are no file intersections proposed across workstreams. This does not replace a joint test of behavior.
