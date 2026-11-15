# Local integration of AURORALYS missions

## Results and limitations

Local candidate with eight stories and 40 chapters. It is not a final published story: private recordings are deliberately excluded and are not requested from the browser. After receiving the route of the Ingenuity package, your real history was integrated as a helicopter, reusing your existing Hardware/Explorer record.

Branch: `review/mission-integration-office`. Worktree created from `8a77514` because the expected checkout did not exist in OFFICE. The protected root checkout or previous work is not changed. The final commit is recorded in the delivery report, is not automatically published.

## Audit of sources

| Workstream | Commit local | Common base with 8a77514 | Inventory of the commission | Dependencias excluidas |
| --- | --- | --- | --- | --- |
| F - Apollo 16 | 44e6a65 | 8120d9e | 43 files; Apollo16ScrollStory/Apollo16Quiz components, story/recordings/media, manifests, tests and records | 18 MP3 (4/4/3/4/3), six local JPEG; original PDF only in external ZIP |
| E - Mars | 814d044 | 8120d9e | 92 files; MarsScrollStory, three definitions/guions, average, tests and records | 56 MP3, three PDFs and raw extractions, six local JPEGs |

Both have a unique commit of their own over 8120d9e. They do not merge or cherry-pickean; their commit is not the ancestor of the candidate. Git objects are read and only 13 revised source/text files are transferred. `source-inventory.json` retain commit and blob of origin, without requiring those private objects to run future tests.

E contains 47 narrative segments: Sojourner 4/4/4/4, Opportunity 4/4/4/4 and Viking 1 3/4/4/4. Quizzes have three questions of four options per mission. Their 56 audio paths correspond to 19/19/18 recordings; there is no Viking track 19. The duplicate Opportunity of the Viking ZIP was already excluded in E and is not re-imported.

F contains 15 narrative segments and three questions: 4/4/3/4/3 recordings. LRV-2, Orion, Casper and their hardware are maintained `lrv-2`, without changing Apollo 15/17 identities. Your dedicated quiz is reused, protecting double sending and retrying.

Integration conflicts identified and resolved:

1. E/F recorded missions by modifying `data.ts` and `machineStories.ts`; the current visual base uses `storyCatalog.ts` as the publication boundary. The new content/hardware is registered there, keeping both scientific and historical files intact.
2. The E/F components were titled/nav outside the composition. They adapt their slots to RoverStoryLayout, StoryEnvironment, StoryHardware and Haroon visual labels/layers; hooks, activities and texts are preserved.
3. Its references were local MP3/JPEG files. MP3s are left behind an explicit omission adapter, without mounting audio or inventing TTS. New JPEGs are replaced in mapping by their original official URLs, regardless of binary or altering feet/credits.
4. MachineStoryPage needed internal render routes and the same reconciliation of old prerequisites as the other missions. Separate branches and the termination condition for F/E are added; neither store nor scheme changes.
5. The previous tests assumed three stories/15 chapters and absence of all Mars missions. Only those counts are updated and the specific exclusion of Perseverance is preserved; accurate fragments of behavior are normalized.

## Status of the eight missions

| Mission | Candidate status | Narration / hardware |
| --- | --- | --- |
| Apollo 11 | Five chapters, laser activity, quiz, and progress preserved | Stationary reflector; private recordings excluded as on the base |
| Apollo 15 | Five chapters and hammer-and-feather activity preserved | 19 existing MP3s preserved; playback verified |
| Apollo 16 | Integrated from F: five chapters, conceptual controller, discoveries, maybe, ending | LRV-2; support of 18 preserved recordings, excluded files |
| Apollo 17 | Five chapters, activities, quiz, and progress preserved | LRV-3; private recordings excluded as on the base |
| Sojourner | Integrated from E: five chapters, profile/discovery/reflection, quiz and completion | Rover; 19 recordings supported, excluded files |
| Opportunity | Integrated from E with the same functions | Rover; 19 recordings, excluded files; assembly photo identified as terrestrial |
| Viking 1 | Integrated from E with the same functions | Stationary Lander without Wheels; 18 Recordings Stand; Photographed Model on Earth Tagged |
| Ingenuity | Integrated from the package found: five chapters, profile, discoveries, reflection, maybe and ending | Helicopter; 19 originals checked outside Git, preserved support, excluded files |

Dashboard discovers eight stories and uses 40 chapters as a denominator. A smaller percentage of an old record represents more missions available, not erased from achievements. `beyond-earth-progress`, existing IDs, badges and formats remain compatible. Perseverance remains out of the catalog; neither its historical progress nor its scientific protected locations are erased.

## Preserved functionality and audiovisual limitations

Native Scroll, Previous/Next, chapters blocked by progress, fonts, full chapters/texts, optional activities, quizzes, retry, termination eligibility, idepotent badges, actual save confirmation and error recovery. F retains chapter advance by scroll opt-in; E retains its advance by button. No scroll hijacking, travel timers or changes to 3D scenes.

`ReviewStoryRecording` keeps the player-shared contract and delegates to it when the resource is not excluded. In this review reports the omission and lets read on. No deliberate absence is interpreted as corrupt file, nor is real voice promised in seven missions without its authorized resources. The mappings and 18 states hanging on Apollo 16 are preserved. No new timestamps, word synchronization or declared human listening.

The lunar/Mars surface is decorative SVG, not cartography. The photographs/contexts correspond to the mission, with official descriptions and links. Viking uses a photograph of Earth model and Opportunity a photo of Earth assembly; they are not advertised as selfies from Mars. There are still missing cuts/approved presentation models to match exactly the references of Haroon.

## Scientific and editorial review

Original notes and texts received are maintained, without rewriting the script to hide disagreements. NASA primary sources were reopened:

- Sojourner: [NASA Pathfinder](https://science.nasa.gov/mission/mars-pathfinder/) indicates 10.6 kg, compared to 10.5 in the script. The note retains the approximate character. Concrete statements of the white modem/soil and the suns/days terrestrial distinction are still pending; photos are not presented as evidence of such actions.
- Viking: [NASA Viking 1](https://science.nasa.gov/mission/viking-1/) date the name change in January 1982. The visible correction to the original 1981 text and biological uncertainty is retained; no confirmed life is claimed. Haroon must review/record the script before activating it in a narrated delivery.
- Opportunity: [NASA Opportunity](https://science.nasa.gov/mission/mer-opportunity/) supports the reference of its legacy to the record surpassed in October 2026. The historical context is preserved, without reintroducing a Perseverance story to the catalog.
- Apollo 16: [NASA Descartes](https://www.nasa.gov/history/apollo-16-on-the-moon-at-descartes/) supports the context of Big Muley, Grand Prix and the photographs. Notes are preserved on the metaphores of bright rocks/guard, UTC dates, separate ultraviolet camera and outstanding numbers of specialized revision.

No exhaustive verification of each sentence, universal third party license or permission to redistribute voices/PDF is stated. Rights, editorial revision and times measured before a complete release with narrative are missing.

## Validation performed

- `npx.cmd tsc -b --pretty false`: correct. `npm.cmd run build` also runs TypeScript and passes; continues the known warning of chunk Three.js >500 kB.
- `node --test --test-concurrency=1 tests/*.test.mjs`: **239 approved, zero failed/missed**. Includes 22 integration tests (320 quiz combinations for F/E/Ingenuity) and three tests for the new package.
- Real Store: Normal save, write rejection, recovery, recharge, repeat, previous achievements, old Flat prerequisites and partial failure when saving the badge. Persistentness is not replaced by a component mock.
- Render of the 40 routes in the real shell, landmarks, destinations and anchovies; GIS/homepage/explorer/store files protected against the base. Previous stories are still under your regression tests.
- Chrome real headless over the production build: 106 routes/variant catches, seven activity/finalization, two science evidence of Ingenuity and two catalogs: **117 verified catches** in total. The 40 chapters are tested at 1366x768 and 390x844; the eight openings also at 360x800, 439x591 and 1024x768; included reduced motion in Apollo 15 and Ingenuity.
- Zero overflow horizontally, broken images, JavaScript errors or network load failures in history paths. No small targets in measured mobile views. The six images F, six E and three Ingenuity load from their original URLs, without Git copies.
- Real MP3 reproduction of Apollo 15, Pause/Resume, segment change without autoplay and evidence activity. No reproduction of excluded recordings is declared. The seven private groups do not mount audio or cause MP3 requests absent.
- Real details and ending of Apollo 15 and the five new stories, persistence after reloading and absence of duplicate badges. Real escape/Tab and emulated switch touch.
- Hardware Lab: eight history links actually activated. Explorers: ten machine selections, routes from the four Moon/four Mars stories, including the new real Ingenuity route. QA of tiles, projections or GPU renders are not claimed for validating those links.
- Disposable Chrome incognito contexts; synthetic data only there. No progress is deleted or used from the usual profile.
- The first seven story closure was 232/232; the Ingenuity extension closes with 239/239. The TS loader of a new test was corrected and Enter's CDP shipment (requires the return character), without altering controls or reducing protections.
- Only HTTP 404 observed in the story audit: `/favicon.ico`, inherited incidence out of reach.

Local artifacts: `$env:AURORALYS_QA_DIR` (external QA directory for the integration), with `verification.json`, `catalog-verification.json` and captures `verified-*.jpg`. Not added to Git. Tests/build logs are in the qa-artifacts parent directory.

## Reproduction and recommended final review

From this worktree:

```powershell
node --test --test-concurrency=1 tests/*.test.mjs
npx.cmd tsc -b --pretty false
npm.cmd run build
npm.cmd run preview -- --port 5200 --strictPort
```

In a dedicated Chrome QA with debugging port 9338 and time profile out of dist:

```powershell
$env:CHROME_QA_PORT = '9338'
node scripts/story-visual-qa.mjs ../qa-artifacts/mission-integration-ingenuity http://127.0.0.1:5200 --all-missions
node scripts/story-catalog-qa.mjs ../qa-artifacts/mission-integration-ingenuity http://127.0.0.1:5200
```

Start paths: `/story/apollo-11-reflector/1`, `/story/apollo-15-rover/1`, `/story/apollo-16-rover/1`, `/story/apollo-17-rover/1`, `/story/sojourner/1`, `/story/opportunity/1`, `/story/viking-1/1`, `/story/ingenuity/1`; also `/hardware`, `/explore/moon`, `/explore/mars`, `/dashboard`. Advance chapters with Next Chapter in manual test; do not erase progress to open the local storage quiz depends on the origin/port.

Before publishing: review this local diff and the eight tours with Haroon; resolve editorial notes and rights; authorize hosting/audio and verified times; complete listening, Safari/iOS, physical devices, screen readers and real zoom. Coordinate with Erand future geographic links of machines: no coordinates or pins are invented for new stories. Only after that review consider an authorized safe code push and a separate integration of approved media.

## Security Git

History based only on 8a77514 and its secure string. No merge, cherry-pick, overbase, push or PR. Original E/F, visual branch, protected branches and stashes preserved. No application dependencies are installed or locked. To review the PDF, temporary pypdf is reused and the PyMuPDF renderer is installed only in TEMP, outside the project. Junction ignored to existing node_modules is used. MP3/PDF/ZIP, raw extractions, new JPEG, models or caches are not copied. The final revision of the index should list only the following text files; the commit is local and does not authorize publication.

## Exact inventory of files of this work

- `docs/mission-integration/README.md`
- `docs/mission-integration/ingenuity-source-inventory.json`
- `docs/mission-integration/source-inventory.json`
- `scripts/story-catalog-qa.mjs`
- `scripts/story-visual-qa.mjs`
- `src/components/MachineStoryPage.tsx`
- `src/components/storytelling/Apollo15ScrollStory.module.css`
- `src/components/storytelling/Apollo16Quiz.tsx`
- `src/components/storytelling/Apollo16ScrollStory.tsx`
- `src/components/storytelling/MarsScrollStory.module.css`
- `src/components/storytelling/MarsScrollStory.tsx`
- `src/components/storytelling/ReviewStoryRecording.tsx`
- `src/components/storytelling/StoryHardware.tsx`
- `src/features/storytelling/apollo16AudioManifest.json`
- `src/features/storytelling/apollo16ImageManifest.json`
- `src/features/storytelling/apollo16Recordings.ts`
- `src/features/storytelling/apollo16Story.ts`
- `src/features/storytelling/apollo16StoryMedia.ts`
- `src/features/storytelling/ingenuityStory.ts`
- `src/features/storytelling/ingenuityStoryMedia.ts`
- `src/features/storytelling/marsMediaFiles.json`
- `src/features/storytelling/marsStories.ts`
- `src/features/storytelling/marsStoryContent.json`
- `src/features/storytelling/marsStoryMedia.ts`
- `src/features/storytelling/reviewMediaPolicy.ts`
- `src/features/storytelling/storyCatalog.ts`
- `src/features/storytelling/storyPresentation.ts`
- `tests/apollo-progress-persistence.test.mjs`
- `tests/apollo15-registration.test.mjs`
- `tests/application-routes.test.mjs`
- `tests/helpers/mission-integration-contract.mjs`
- `tests/helpers/mission-story-host.mjs`
- `tests/helpers/moon-scope-contract.mjs`
- `tests/ingenuity-package.test.mjs`
- `tests/mission-integration.test.mjs`
- `tests/moon-scope.test.mjs`
- `tests/storytelling-quiz.test.mjs`

## Ingenuity expansion after locating the package

The original package was found in `$env:AURORALYS_INGENUITY_PACKAGE` (5,169,369 bytes; SHA-256 `a2b61dd8fb35681250f0a35adf2fb2d171ae259c8deebdf4fb56a9eb8289f54f`). It contains a seven-page PDF and exactly 19 MP3 (4/4/4/4/3), without another duplicate package. The seven pages were read and rendered; page 7 orange marks the answers B/C/C. The 16 narrative paragraphs are transcribed as an editorial basis, without adding invented story; the three questions retain options and answers. NASA confirms the answers. The type-script punctuation/ortography of the PDF is normalized for web reading.

All originals are retained byte byte and crosschecked by hash. Chrome AudioContext.decodeAudioData decoded the 19 files: 262.661 seconds (approximately 4m23s). That verifies decoding, non-human listening, full verbal correspondence or synchronization. No cues are created from the duration. The manifest records original names, mappings, bytes, hashes, measured durations and listening/timing hanging states.

The inspection copy, PDF, MP3, renders and decoding diagnostic are exclusively in `$env:AURORALYS_PRIVATE_INPUTS_DIR` (external local inspection directory), outside of all worktrees. They are not served from Vite nor added to Git. The original ZIP remains in Downloads and remains intact. No recording is published; ReviewStoryRecording displays explicit omission and allows reading. The final narrative needs authorization and separate restoration of originals.

MarsScrollStory, StoryEnvironment, StoryHardware, the existing native scroll controls, shared quiz and store are reused. There is only one hardware `ingenuity` (preexisting record), classified as helicopter; it is not duplicated or modified data.ts. The new badge is `ingenuity-storyteller` / Jezero Flight Explorer. No previous identity, coordinate or schema changes. A test compares the three complete objects of Mars stories and their hardware to b146db0.

NASA evidence: PIA24581 (photograph of unlocked blades; Photojournal source), PIA24727 (ridges seen in flight 9; contextual photograph) and PIA26760 (artistic concept of future SkyFall, clearly identified). Only remote URLs with credits; not new image files. Official videos are opt-in links. Google and PNG thumbnails of a third party with insufficient provenance are excluded. It is not claimed that the helicopter photo documents the accident or each action of the script.

Visible scientific notes: crests can record ancient fluid processes, do not constitute a detection of subterranean water; 30 suns do not amount to 30 terrestrial days; the accident is a probable reconstruction, not a filming of impact; SkyFall is a future mission. Sources verified on 11-11-2026: [NASA Ingenuity](https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/), [Flight geology 9](https://www.jpl.nasa.gov/news/nasas-mars-helicopter-reveals-intriguing-terrain-for-rover-team/), [accident investigation](https://www.nasa.gov/missions/mars-2020-perseverance/ingenuity-helicopter/nasa-performs-first-aircraft-accident-investigation-on-another-world/) and [NASA SkyFall](https://science.nasa.gov/mission/skyfall/). Haroon must solve the underground water phrase before enabling that recording in a narrated release.

Changes to this extension: 17 text files; four new ones (inventory, history, evidence and evidence), thirteen adapted ones (README, two QA scripts, MarsScrollStory, MarsStoryMedia, MarsStoryMedia, reviewMediaPolicy, storyPresentation and five catalog/integration tests).The complete work since 8a77514 covers 37 text files. No binary or ancestry E/F. Integration committs are only local; there is neither push nor PR.
