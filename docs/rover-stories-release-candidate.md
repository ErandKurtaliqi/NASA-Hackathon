# Local Rover Stories release candidate

The candidate was prepared for Haroon’s review. This report distinguishes the combined candidate from isolated workstreams; their results are not added up as if they were a single build.

## Git status and provenance

- Protected branch at the repository root: `integration/main-feature-review`, commit `8120d9ecba6babb9e2c0695c02c6ef96234b359b`.
- Candidate: branch `review/rover-stories-release-candidate`, worktree `rover-stories-release-candidate`, created from that base.
- **The candidate HEAD remains at 8120d9e. The combined changes are unstaged, uncommitted, and unpushed**, pending review. The binary patches were checked with `git apply --check` and applied with `git apply`. The original branch ancestry is intact and no merge was performed.
- The actual references of GitHub were consulted using `git ls-remote --heads origin`; they match the following local objects. They all have merge-base `8120d9e`.

| Remote workstream | Verified HEAD | Review result |
|---|---|---|
| A — audio | `a6a8629354691655ff632131e49df5607450628e` | 12 files: reviewer/ASR candidates and playback/cues corrections. Inspected; **not integrated**. 0/19 certified listening recordings, pending production cuis. |
| B — Apollo 17 | `f1bd132f202ec0006a0f41674100466b3e84db7d` | 18 files locally reviewed and applied to the candidate. 2D/scroll presentation and optional browser voice, no MP3 invented. |
| C — activity | `64c046273074e135e3c4759ee56a83b43618b924` | 9 new files, without direct overlap with B. Applied and connected as optional activity in Apollo 15, Chapter 4. |
| D — map contract | `3e8fa5922aaa7718e9c8e57d272ba8fdb9805574` | 2 documents inspected; proposed contract, not approved by Erand. No integrated GIS code. |

Documents B/C copied to the candidate describe their original revision and retain that historical context. This report records the current local integration.

E remains independent in `mars-stories`, branch `review/workstream-e-mars-stories`, commit local `814d0443f65c77164635bc43b643a2aea2799d5f`: **92 locally compromised files and worktree clean**. Sojourner/Opportunity/Viking 1 did not join the candidate; its 56 MP3 and three PDFs remain local with pending redistribution permission.

F was implemented separately in `apollo16`, branch `review/workstream-f-apollo16`, from `8120d9e`, without commit or tagging: **43 files, 9 modified and 34 new**. Its editorial results and reservations are documented in its independent Apollo 16 report. Neither its recordings nor PDFs are copied to the candidate.

Checked status of Apollo 16: identity `apollo-16-rover`, hardware `lrv-2`, five chapters and original B/A/B quiz of four options. Reuse layout, scroll, player, evidence and save confirmation; the fifteen original texts remain accompanied by editorial notes and the voice is only started by explicit action. 18 MP3 (4/4/3/4/3; 4.111.629 bytes) retain all their bytes and tags. Six NASA images of Apollo 16, 353.377 bytes, with distinguished photographs and frames; no photos of another mission are used as substitutes. Eight-page PDF is still inside the external ZIP, outside of public/dist.

Independent F validation: **176/176 tests passed, none skipped**, repeated by the coordinator, correct production build and TypeScript, whitespace of the diff and all new texts correct. render of five new routes, preservation of the previous fifteen, 64 combinations of quiz, navigation/real progress/storage/retry/signia rejection and shared player. preview of local production `http://127.0.0.1:5187/story/apollo-16-rover/1`; five routes and Hardware/Dashboard serve HTML; 18 audios and six images match HTTP with its hashes and audio supports Range 206. No actual visual or auditory validation is declared.

The 18 F recordings contain ID3v2.4/GEOB `application/c2pa` with Eleven Labs Inc. and trainedAlgorithmicMedia statements, preserved without modification. The signature was not cryptographically verified or rights deducted from those labels; permission to re-distribution pending. Scientific notes distinguish UTC/EST dates, script metaphors, walking path limits, Stone Mountain/North Ray, mudguards and independent ultraviolet chamber. Original ultraviolet source counts require specialized review. All cues follow `pending`.

**176 does not add to 188:**F is not yet integrated into the B+C candidate. Any future integration must coordinate catalog/registration/page and its tests, and pass a new combined suite.

No commit/push/PR, merge, overlay or public deployment was made in this preparation. Main, protected integration, A–D, E, worktrees, backups and stashes are preserved. Revision servers are linked only to `127.0.0.1`.

## What is truly integrated

The candidate contains **three stories and fifteen chapters**:

1. Apollo 15: retains identity `apollo-15-rover` / hardware `lrv-1`, its 19 MP3, scripts, chapters, controls, quiz, prizes and saved. Only the optional exercise of C is added to the legacy chapter, where is the historical experiment of the hammer and pen.
2. Apollo 17: retains identity `apollo-17-rover` / hardware `lrv`, scientific record, questions and award. B replaces its presentation with the Rover Story shared layout, selection by scroll, buttons, sources and optional browser voice. No new recordings approved for this mission.
3. Perseverance: preserves the five existing chapters, pilot, model, navigation, quiz, confirmation of completion and save.

The prediction activity has explicit radios and sending, specific feedback, NASA source, retry and focus. **Does not save progress, does not deliver badges and does not block progress**. It does not have its own callbacks, store, audio or navigation. It is included in the normal production bundle, not only in `activity-preview.html`; that page remains a demo development.

Apollo 16, Sojourner, Opportunity or Viking 1 are not yet integrated into this candidate. No new pins or geographical relationships are created.

## Conflicts and resolutions

- B and C did not share modified files: clean application of both patches, no Git text/binary conflicts.
- C was an isolated demo and was not mounted on the product. **two imports and a render line**to `Apollo15ScrollStory.tsx` were added, only under `index === 3`.
- The B ownership test required that all Apollo 15 be identical to the base. C was failed to mount. Added `withoutReleaseActivity`, which eliminates exactly those three lines when comparing; everything else remains protected by equal source. The test was not withdrawn.
- The handwritten React hosts did not display `useId`, used by C's accessible radios. The stable hook was added to those hosts, without replacing the actual component or the persistence adapter. The activity continues to have instance-separated identifiers.
- In Windows, the CRLF checkout of the Apollo 15 script failed a historical byte comparison against Git. The file was restored to the exact bytes of the `8120d9e` blob, without change of content or Git diff. Its Git hash remains `8a4f0c9ad8483f62f5d144d9000165d4e3d3c4de`; the index only refreshed its status, without change staged.
- A would modify `Apollo15ScrollStory.tsx` and `StoryRecording.tsx` and would require coordinating the new mount point and B guards. It was not applied by inertia. Its ASR candidates are not approved time Stamps.

## Validation of the combined candidate

| Fase | Focused tests | Suite completa | TypeScript / production |
|---|---:|---:|---|
| Reproduced baseline | — | 165/165 | Passed |
| B applied | 50/50 (B + real progress) | 173/173 | Passed |
| B + C, before connecting the activity | 14/14 (B + C) | 181/181 | Checked with the next final assembly |
| C connected to Apollo 15 | 61/61 (B, C, progress and integration) | 184/184 | Passed |
| Additional audit of the candidate | 4/4 | **188/188 passed, none failed** | Final application build passed; `tsc -p tsconfig.app.json --noEmit --pretty false` correct |

Comandos: `node --test tests/*.test.mjs`, `npm.cmd run build`, `node_modules/.bin/tsc.cmd -p tsconfig.app.json --noEmit --pretty false`.

The three new tests within the persistence host exercise correct and incorrect prediction from the real page: selection, sending, focus, evidence, retry, rejected storage without attempt to write the activity, preserved audio track and post-maybe step without automatically completing it. The actual store is preserved; only router/GPU/audio and test host hooks are isolated.

`tests/release-candidate.test.mjs` further checks:

- Inventory and bytes of **all pre-existing MP3**identical to the base.
- Absence of new audios/PDF E/F in the candidate.
- Homepage, explorers, mission identities, scientific records, GIS/3D and store equal to the base.
- B/C production sources identical to their revised branches.
- Render React of the fifteen chapters: C appears only in Apollo 15, chapter 4; Apollo 17 uses its new branch.

`git diff --check` correct; new text files were also checked with `git diff --no-index --check NUL <file>`. Git LF/CRLF notices may appear on Windows; Git settings were not altered.

Final Build: 2.654 modules. React Three Fiber pre-existing warning remains, 823.49 kB minified. The combined history chunk is approximately 120,39 kB; no mobile performance improvement is promised without measurement.

## Media, science, and permissions

The four B images retain their hashes and NASA source. The Apollo 50th gallery and NASA API records were checked `S72-55070` and `7036668`, and the local JPEGs were visually inspected. The catalogue 7036668 contains a historical description with an incorrect mission count; that phrase is not copied to the application content.

Activity C reuses S71-43788, **real TV pic.**. The [NASA source of the experiment](https://science.nasa.gov/resource/the-apollo-15-hammer-feather-drop/) allows the video to be examined; the UI does not claim that a fixed image proves exact drop times. [Nasa Apollo Gallery](https://www.nasa.gov/specials/apollo50th/photos.html).

Outstanding items:

- Apollo 15: the 19 entries of caption timing follow `pending`; A candidates were not activated. Listen, correct, and approve phrases before calling them synchronized. All three audios of maybe require approved transcription.
- Apollo 17: synthetic browser voice, clearly identified. Offline quality/availability depend on the device. There is no MP3 package of Haroon or timestamps that can be affirmed here.
- Some steps B do not have selected direct photograph: they show a source card, without replacing a photo of another mission. Additional healing is pending improvement.
- E: permission of the three pending PDFs and 56 MP3s; scientific notes from Sojourner and Viking require editorial closure. Sojourner/Viking's 37 MP3 include ElevenLabs metadata without plan/licence documentation.
- F: PDF permission and 18 MP3 also pending; not to publish because they are already implemented locally. Your own report separates original script from scientific notes.
- NASA/third party credits and restrictions are maintained, without asserting institutional support. Images outside the mission were not downloaded as substitutes.

Contract D remains pending from the owner GIS: external selection from pins, new IDs/locations for Apollo 15/16 and explicit bindings. No coordinates or overlays of fake pins are added for the demo. Hardware Lab and current routes allow you to enter the stories without that work.

## Local testing and manual review

The preview of the production build was started at `http://127.0.0.1:5186/`.

```powershell
Set-Location -LiteralPath $env:AURORALYS_RELEASE_WORKTREE
npm.cmd run build
npm.cmd run preview -- --port 5186 --strictPort
```

- `http://127.0.0.1:5186/story/apollo-15-rover/1`
- `http://127.0.0.1:5186/story/apollo-15-rover/4` (requires previous chapters; optional activity).
- `http://127.0.0.1:5186/story/apollo-17-rover/1`
- `http://127.0.0.1:5186/story/follow-perseverance/1`
- `http://127.0.0.1:5186/hardware`, `/dashboard`, `/explore/moon`.

Smoke HTTP: fifteen SPA routes, four JPEG B and nineteen MP3 Apollo 15 served with correct bytes. It was found that the bundle includes C and that `dist` retains only the original MP3 inventory, without PDF or new E/F audio folders. **HTTP 200 and SSR do not amount to browser revision.**

Computer Use returned `apps: [], browsers: []`; could not complete visual/touch revision or actual listening. Use test profile or private window, without deleting usual progress. Check:

1. Desktop and 360×800, 390×844, 439×591; text zoom 200%, sticky and visible active cards, no overflow that hides controls.
2. Tab/Enter/Space, arrow radios, focus after sending/retrying, return to chapter and screen reader.
3. Audio Apollo 15 and voice Apollo 17: play/pause/resume/replay/mute, segment/chapter change, Back, hide tab, errors and image not available. Confirm that there is no overlap or autoplay.
4. Reduced movement, native scroll/touch, opt-out of advance when crossing the end of chapter and absence of involuntary advance from the quiz or activity.
5. Quiz: correct/incorrect answers, last explanation, View Results, Complete Story, retry, unique badge and dashboard after reloading. Storage and Retry saving rejection without false confirmation.
6. Perseverance: existing chapters 1–5 and scene/landing. Code and testing are protected; no check with real GPU.

## Minimum sequence for a stable demo

1. Review this B+C diff and complete the manual smoke of the three stories. Keep the candidate free of proposed I/O and GIS APIs while missing permissions/approval.
2. Approve the candidate before any commit, push or deployment. The local build is already demonstrable; you don't need to integrate seven stories to demonstrate a stable path.
3. Review Apollo 16 in isolation with Haroon: script/voice, evidence, quiz, completion, mobile and permissions. Only after coordinating your three catalog/registration/page logs and counting tests with the candidate.
4. Close editorial notes/E-licences before considering your three-mission and new media record. Do not copy the ZIPs or duplicate Opportunity.
5. Review A separately: your runtime corrections can be evaluated without activating ASR/unapproved coles. Erand GIS/2D remains outside the release frontend until contract D is agreed.

## Exact inventory of the candidate

The file list is added at the end by Git matching; it includes imports/renderer B, C mount, tests, four NASA images and documentation. It does not include `dist`, logs, caches or the `node_modules` matching.

Current total: **34 files** (11 modified and 23 new), no changes staged.

- `activity-preview.html`
- `docs/rover-stories-release-candidate.md`
- `docs/workstream-b-apollo17.md`
- `docs/workstream-c-activity.md`
- `public/images/apollo17-story/launch.jpg`
- `public/images/apollo17-story/orange.jpg`
- `public/images/apollo17-story/rover.jpg`
- `public/images/apollo17-story/vehicle.jpg`
- `src/components/MachineStoryPage.tsx`
- `src/components/storytelling/Apollo15ScrollStory.tsx`
- `src/components/storytelling/Apollo17BrowserVoice.tsx`
- `src/components/storytelling/Apollo17ScrollStory.module.css`
- `src/components/storytelling/Apollo17ScrollStory.tsx`
- `src/components/storytelling/activities/ActivityPreview.module.css`
- `src/components/storytelling/activities/ActivityPreview.tsx`
- `src/components/storytelling/activities/EvidencePredictionActivity.module.css`
- `src/components/storytelling/activities/EvidencePredictionActivity.tsx`
- `src/features/storytelling/activities/apollo15Prediction.ts`
- `src/features/storytelling/activities/evidencePrediction.ts`
- `src/features/storytelling/apollo17StoryMedia.ts`
- `src/features/storytelling/apollo17StorySteps.ts`
- `tests/apollo-progress-persistence.test.mjs`
- `tests/apollo15-registration.test.mjs`
- `tests/helpers/apollo-quiz-contract.mjs`
- `tests/helpers/release-activity-contract.mjs`
- `tests/release-candidate.test.mjs`
- `tests/shared-navigation.test.mjs`
- `tests/storytelling-challenges.test.mjs`
- `tests/storytelling-landmarks.test.mjs`
- `tests/storytelling-legacy.test.mjs`
- `tests/storytelling-media.test.mjs`
- `tests/storytelling-quiz.test.mjs`
- `tests/workstream-b-apollo17.test.mjs`
- `tests/workstream-c-activity.test.mjs`

## Exact inventory of F, separated from candidate

These 43 files belong exclusively to `apollo16` (9 modified, 34 new); they are not part of the B+C diff. The original PDF remains outside the worktree, in the input ZIP.

- `docs/apollo16-input-manifest.json`
- `docs/workstream-f-apollo16.md`
- `public/audio/apollo-16/chapter-1/1.mp3`
- `public/audio/apollo-16/chapter-1/2.mp3`
- `public/audio/apollo-16/chapter-1/3.mp3`
- `public/audio/apollo-16/chapter-1/4.mp3`
- `public/audio/apollo-16/chapter-2/1.mp3`
- `public/audio/apollo-16/chapter-2/2.mp3`
- `public/audio/apollo-16/chapter-2/3.mp3`
- `public/audio/apollo-16/chapter-2/4.mp3`
- `public/audio/apollo-16/chapter-3/1.mp3`
- `public/audio/apollo-16/chapter-3/2.mp3`
- `public/audio/apollo-16/chapter-3/3.mp3`
- `public/audio/apollo-16/chapter-4/1.mp3`
- `public/audio/apollo-16/chapter-4/2.mp3`
- `public/audio/apollo-16/chapter-4/3.mp3`
- `public/audio/apollo-16/chapter-4/4.mp3`
- `public/audio/apollo-16/chapter-5/1.mp3`
- `public/audio/apollo-16/chapter-5/2.mp3`
- `public/audio/apollo-16/chapter-5/3.mp3`
- `public/images/apollo16-story/big-muley.jpg`
- `public/images/apollo16-story/field.jpg`
- `public/images/apollo16-story/grand-prix.jpg`
- `public/images/apollo16-story/liftoff.jpg`
- `public/images/apollo16-story/north-ray.jpg`
- `public/images/apollo16-story/rover.jpg`
- `src/components/MachineStoryPage.tsx`
- `src/components/storytelling/Apollo16Quiz.tsx`
- `src/components/storytelling/Apollo16ScrollStory.tsx`
- `src/data.ts`
- `src/features/storytelling/apollo16AudioManifest.json`
- `src/features/storytelling/apollo16ImageManifest.json`
- `src/features/storytelling/apollo16Recordings.ts`
- `src/features/storytelling/apollo16Story.ts`
- `src/features/storytelling/apollo16StoryMedia.ts`
- `src/machineStories.ts`
- `tests/apollo-progress-persistence.test.mjs`
- `tests/apollo15-narration.test.mjs`
- `tests/apollo15-registration.test.mjs`
- `tests/apollo16-story.test.mjs`
- `tests/helpers/apollo-quiz-contract.mjs`
- `tests/storytelling-media.test.mjs`
- `tests/storytelling-quiz.test.mjs`
