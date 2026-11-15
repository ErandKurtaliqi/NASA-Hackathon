# AURORALYS — Eight-mission cinematic integration

Local branch `review/eight-mission-cinematic`, created from `b9de4fe`. User-approved Apollo 15 visual direction: `7129c6b`. It is not an automatic visual approval of the other seven missions.

## Safe transfer

The 17 visual correction files and 37 integration files were reviewed from `8a77514`. 14 visual files were selectively transferred without overlap; no branch was merged or cherry-picked. All three shared paths were explicitly combined:

- `Apollo15ScrollStory.module.css`: approved styles plus `.reviewRecording` and `.scienceNote a` integration targets.
- `StoryHardware.tsx`: original Apollo 15 plus `portraitNote` mask, preserving Viking/Opportunity's ground identification. New frames are details of original photo pixels, not models or parts generated.
- `storyPresentation.ts`: part of the visual catalog of eight missions, preserving Apollo 16 and the four Mars entries, and add the exclusive Apollo 15 trim flag. The mission catalogue and the dispatcher were not overwritten.

`CinematicStoryLayout` offers introductory slots, first reading, hardware, evidence, controls and later readings. Apollo 16 and Mars reuse that composition by extracting JSX; they retain hooks, callbacks, refs, texts, notes, activities, quizzes and advance conditions. The first reading and player are mounted only once. Navigation continues to use native scroll and Previous/Next.

The Apollo 15 and `CinematicStoryLayout.module.css` adapter remain exactly the same as in `7129c6b`; the shared styles keep the approved prefix in full. Additional changes of scenes and frames are restricted to the other missions. The Chrome comparison of the approved build and the integrated one confirmed seven main boxes with geometry equivalent to less than one pixel, same fonts and colors. The approved server HTML hash was verified against its QA record. No pixel identity is affirmed to pixel of captures taken at different times of the image opacity transition.

## Eight identities, 40 chapters

| Mission / story ID | Presentation and scene | Voice status in this review |
| --- | --- | --- |
| Apollo 11 / `apollo-11-reflector` | Educational diagram of the passive reflector with 100 corner cubes, without wheels; NASA Tranquility Base panorama jsc2008e040725; real evidence separated | UI and scripts preserved; private originals excluded |
| Apollo 15 / `apollo-15-rover` | LRV-1, Photo Mask and Station panorama 8 original approved design; S71-41356 release | Inherited records available, actual playback verified |
| Apollo 16 / `apollo-16-rover` | Photographic detail of LRV-2 AS16-116-18578 and complete documentary photo; Station panorama 10 jsc2011e118362 | Interface of 18 preserved recordings; originals omitted |
| Apollo 17 / `apollo-17-rover` | Authentic LRV-3/Schmitt photo; Station panorama 5 jsc2004e20304, without landscape Apollo 15 | UI and scripts preserved; originals excluded |
| Sojourner / `sojourner` | Detail of Sojourner/Yogi, complete photography and panorama Pathfinder PIA01005 | Interface of 19 preserved recordings; originals omitted |
| Opportunity / `opportunity` | Earth assembly explicitly identified, without pretending to be a picture of Mars; landscape of Opportunity PIA18393 | Interface of 19 preserved recordings; originals omitted |
| Viking 1 / `viking-1` | Lander model photographed on Earth and labeled, without wheels; Viking surface image 1 PIA00563 | Interface of 18 preserved recordings; originals omitted; duplicates Opportunity not imported |
| Ingenuity / `ingenuity` | Detail of the PIA24581 helicopter and full picture; aerial image of its flight 9 PIA24727, identified as aerial | Interface of 19 preserved recordings; originals omitted |

The eight stories retain five chapters and their IDs. `MachineStoryPage.tsx`, `storyCatalog.ts`, `ReviewStoryRecording.tsx`, `reviewMediaPolicy.ts`, `store.ts`, script data and questions remain unchanged against `b9de4fe`. Badges, schema and key `beyond-earth-progress` are maintained; no user profile is reset.

## Evidence, resources and limits

`missionStageAssets.ts` configures only landscapes by mission. `MissionSceneCredits` links each source and distinguishes a composition from a unique photograph or a geographic reconstruction. NASA panoramas may include original agency assembly/processing. Apollo 11 diagram is never labeled as a photograph.

`docs/mission-cinematic-assets.json` records primary URLs, sizes and hashes of the new inspected sources. The attribution remains visible. Examples: [Pathfinder PIA01005](https://science.nasa.gov/photojournal/360-degree-color-panorama/), [Opportunity PIA18393](https://science.nasa.gov/photojournal/pillinger-point-overlooking-endeavour-crater-on-mars/), [Viking 1 PIA00563](https://science.nasa.gov/resource/first-color-image-from-viking-lander-1/). NASA attribution does not imply endorsement or confer rights to third-party material.

No MP3, PDF, ZIP, JPEG, PNG, texture or model is added to Git. Inspection downloads, captures and references remain in external QA. The deliberate omission of seven groups of recordings continues: Apollo 11/16/17, Sojourner, Opportunity, Viking 1 and Ingenuity. Texts remain legible; TTS is not invented, duration or word synchronization to supply them.

The six Apollo 15 maskless hardware and reflector diagram do not become insulated renders of equivalent quality by applying the layout. Honest photo frames are used; future revisions can provide higher resolution authorized cuts. Viking retains a terrestrial model and Opportunity an assembly photo. Viking image is historical of limited resolution; Ingenuity landscape is aerial. It does not simulate the same physical perspective between these documents and portraits.

The backgrounds depend on NASA/CDN; Apollo 16 and 17 use panoramas of approximately 1.5 and 1.9 MB. The new scene offers decorative SVG fallback if your photo fails; hardware/evidence retain descriptions and access to sources. No dependencies are added or WebGL loaded in these presentations. Chunk Three.js previous warning is maintained >500 kB, foreign to change.

The existing scientific/editorial clarifications remain: Viking dates and biology, Sojourner script statements, Apollo 16 nuances and Ingenuity geological/future inferences. Activating private originals and resolving those revisions requires separate editorial/authorized delivery.

## Validation executed

- Complete final suite, executed without concurrent build/QA: **255 approved, zero failures/missed**. There are 16 additional tests compared to 239 of the original integration.
- Focused layout tests, fonts, hardware and the eight missions: **19 approved**. They include the 40 chapters, single first reading, a single set of controls and accessible selection, plus exact protection of Apollo 15/catalogue/progress.

- Production: `npm.cmd run build`, including TypeScript, correct. `npx.cmd tsc -b --pretty false` correct.
- Chrome real headless over local production, not SSR presented as visual proof. Disposable incognito contexts, without reading user progress.
- 40 complete routes at 1366×768 and 390×844; eight additional openings at 360×800, 439×591 and 1024×768; and reduced motion variants: 106 route and variant captures, plus activity, completion, and evidence captures.
- The eight visual revision openings are captured at 1440×900, 1024×768 and 390×844: 24 images, contact desk/mobile sheet and comparison against Apollo 15 approved. Full proportions and original images are maintained on the comparison panels.
- Checked: a correct main, chapters and hardware, absence of horizontal overflow, image upload, no JavaScript error or private audio request. MP3 reproduction Apollo 15, Pause/Resume and cancellation when changing segment; quiz, completion, recharge, ID of badges, hammer and feather activity, Escape, Tab, Enter and tactile swipe emulated.
- The first pass detected a local collision named `surface`, corrected to `stageSurface`. Two new assertions mistakenly assumed that Apollo 11/17 had numerical segment navigation; they were corrected to check its real interface, without changing the stories.
- An initial capture recorded pending images after generic six-second wait; the QA routes now waits for really loaded images before capturing. Final Chrome repeat approved, without hiding image/network errors. Unique HTTP 404 observed: favicon.ico inherited.
- A simultaneous test run with build/captures exhausted the five-second SSR timeout. That timeout is retained and the suite closure is repeated without those concurrent loads; protections are not relaxed.

Validation is not stated on physical devices, Safari/iOS or real screen reader. Human revision of the seven new compositions remains, zoom 200%, authorized listening, verified timings, resilience/offline and refinement of cuts.

## Local evidence and reproduction

QA externo: `$env:AURORALYS_QA_DIR` (external directory selected for this review).

- `openings/contact-sheet-desktop.png`, `openings/contact-sheet-mobile.png`.
- `openings/apollo15-approved-vs-integrated.png`.
- `openings/opening-<story-id>-1440.jpg`, `-1024.jpg`, `-390.jpg`.
- `openings/cinematic-verification.json`: build hash, source and SHA of approved catch, metrics and catches.
- `apollo15-approved-layout-verification.json`: comparison of approved build and calculated geometry.
- `regression-final/verification.json`: 40 routes and functional checks.
- `tests-final.log`, `tests-focused-final.log`, `build.log`, inventories and publication audit.

From the root of the cinematic review worktree:

```powershell
npm.cmd run build
npm.cmd run preview -- --port 5204 --strictPort
node --test --test-concurrency=1 tests/*.test.mjs
npx.cmd tsc -b --pretty false
```

Open `http://127.0.0.1:5204/story/<story-id>/1` using the eight table IDs. The preview server is available on that port when you deliver. Do not delete localStorage to open chapters: use Next Chapter or a standalone QA context.

Tools `scripts/story-cinematic-qa.mjs` and `scripts/story-visual-qa.mjs --all-missions` use dedicated Chrome QA; port is configured with `CHROME_QA_PORT`. They do not use the usual profile. Pass existing approved capture as fourth story-cinematic-qa argument; do not recapture a fake BEFORE from the new application.

## Security

Commit only local in the new branch. No push, merge, cherry-pick, PR or modification of original/protected branches. Stash and other preserved workstrees. Out of reach and unchanged: homepage, explorers, GIS/3D, coordinates, maps, Esri, scientific data and storage. No new permission to publish documents or private voices.

## Exact inventory of this integration (26 files)

- `docs/eight-mission-cinematic-review.md`
- `docs/mission-cinematic-assets.json`
- `docs/visual-correction-review.md`
- `docs/visual-stage-assets.json`
- `scripts/story-cinematic-qa.mjs`
- `scripts/story-design-qa.mjs`
- `scripts/story-visual-qa.mjs`
- `src/components/storytelling/Apollo15ScrollStory.module.css`
- `src/components/storytelling/Apollo15ScrollStory.tsx`
- `src/components/storytelling/Apollo16ScrollStory.tsx`
- `src/components/storytelling/CinematicStoryLayout.module.css`
- `src/components/storytelling/CinematicStoryLayout.tsx`
- `src/components/storytelling/MarsScrollStory.tsx`
- `src/components/storytelling/MissionSceneCredits.tsx`
- `src/components/storytelling/MoonPackageStory.tsx`
- `src/components/storytelling/StoryEnvironment.tsx`
- `src/components/storytelling/StoryHardware.tsx`
- `src/components/storytelling/StoryPresentation.module.css`
- `src/features/storytelling/missionStageAssets.ts`
- `src/features/storytelling/storyPresentation.ts`
- `src/features/storytelling/storyStageAssets.ts`
- `tests/cinematic-story.test.mjs`
- `tests/eight-mission-cinematic.test.mjs`
- `tests/helpers/cinematic-contract.mjs`
- `tests/helpers/story-visual-contract.mjs`
- `tests/story-presentation.test.mjs`
