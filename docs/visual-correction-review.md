# AURORALYS - Visual correction review

## Scope and baseline

Isolated branch `review/haroon-visual-correction`, worktree `visual-correction`, from the safe visual baseline `8a77514`. No integration of Apollo 16 or Mars workstreams. The eight-mission integration at `b9de4fe` is preserved separately. This correction is not a declaration of director approval or pixel equivalence.

## Observed gaps, from actual OLD Chrome captures

OLD build: npm production build from 8a77514, served at `http://127.0.0.1:5202`, captured before editing at 1440x900, 1024x768 and 390x844. The reference files are the two WhatsApp JPEGs supplied in Downloads/Imagenes_Mues (Apollo 15 and Viking 1). References are not application backgrounds or tracked project assets.

| Area | Confirmed OLD appearance | Reference direction | NEW result and remaining difference |
| --- | --- | --- | --- |
| Hardware | Small rover inside a faded rectangular surface photograph; much of its box was empty sky/ground | Large isolated vehicle grounded in the scene at left | High-resolution original Apollo 15 pixels with a hand-traced SVG presentation mask, substantially larger and without the radial fade. Side-view angle differs from the reference's three-quarter render; fine mask edges still need a production alpha asset. |
| Surface | Flat SVG horizon, regular procedural craters and little scale/depth | Detailed surface, footprints, real horizon and hard light | Verified NASA Apollo 15 Station 8 photographic panorama with terrain detail and directional shading. It is explicitly labelled a composition, not one unaltered mission photograph, a landing-site reconstruction or GIS. |
| Hierarchy | Timeline above narrative; a large center control box competed with the story | Mission title and narration central, chapter line below | Separate cinematic opening stage, large title, opening paragraph and chapter line. Audio is a single persistent deck below the stage; later reading and activities are distinct. |
| Evidence | The same rover photograph appeared again at right | An elegant documentary memory file, with launch imagery | Verified Apollo 15 liftoff S71-41356, without replacing or relabelling the later May rollout. The original is portrait format, preserved within the frame; it does not fill the wide reference image. |
| Typography | Small technical labels and outlined auto-focused heading | Clean title, spacious readable narrative | Larger central title, less opening-card chrome, 18-22px opening text, subtle metadata. Native heading focus remains; its programmatic focus no longer draws a decorative box. Interactive focus indicators remain. |
| Desktop balance | Photo/card/control columns looked like a conventional application | One immersive scene | Vehicle, horizon, title and evidence share one composition; reading continues naturally below. Existing AURORALYS header/menu is retained, unlike the sparse reference header. |
| Tablet/mobile | Tablet repositioned evidence into a long second row; mobile had a small faded hardware photo | Responsive adaptation, no supplied mobile mockup | Three compact columns at 1024; mobile orders introduction, hardware, narrative, audio and evidence. No forced viewport crop or global scrolling lock. |

The new presentation is visibly different in the side-by-side sheets. It approaches the composition, but is not equivalent to Haroon's final artwork. Original scripts are intentionally preserved, so their wording differs from the mockup.

## Actual implementation

`CinematicStoryLayout` introduces explicit intro/opening/controls/hardware/evidence slots. The first article is rendered once in the scene and subsequent articles once in the reading area. It does not select chapters or mutate progress. The single audio deck remains sticky while reading subsequent segments; no duplicate audio player or chapter navigation is mounted.

Apollo 15 and the existing Apollo 11/17 adapter use the new slots. Their hooks, callbacks, paragraphs, quizzes, activities, chapter refs and audio arguments remain intact. An exact reversible JSX contract plus compiled behavior tests verify this; snapshot guards still protect all unrelated source. Apollo 11 remains a labelled passive reflector diagram with 100 corner cubes, not a rover. Apollo 17 retains its own historical photograph and existing review holds. Neither receives an unrelated Apollo 15 terrain photograph.

Mars preparation: the layout accepts `world="mars"`, with a warm evidence accent and explicit storyteller label. The Viking contract remains stationary lander. Required approved assets are enumerated in `marsStageAssetRequirements`; no Viking routes, narratives, recordings, fake wheels, geographic points or office-only implementation are imported. The existing generic SVG remains a fallback for missions without approved scene backgrounds, not a claim that their visual upgrade is complete.

## Assets, provenance and limitations

Three remotely loaded public NASA originals are documented in `visual-stage-assets.json`: AS15-88-11901 (vehicle), jsc2011e118360 (Station 8 panorama), S71-41356 (actual launch). The original public URLs, credits, file hashes and sizes are recorded. NASA image-use guidance applies; no NASA endorsement is implied. No generated artwork or new raster/model binary enters Git.

The vehicle uses an SVG clip over the original photograph. No machine parts are generated, painted or replaced. The scene adds decorative stars, lighting and a contact shadow; the visible note identifies the photographic composition and links to the panorama. Documentary evidence remains separate, labelled and credited. Existing local NASA evidence and all 22 inherited MP3 files remain byte-identical.

Missing for final visual equivalence: a director-approved Apollo 15 isolated alpha image/render at the desired three-quarter angle, with fully reviewed thin antenna/mesh edges; an approved wider launch composition if the exact mockup framing is required; mission-specific high-quality scene backgrounds/cutouts for Apollo 11 and 17; and an approved Viking 1 lander cutout plus credited Chryse surface panorama. Do not solve these gaps with unrelated mission photographs or generated evidence.

New private MP3/PDF/ZIP resources are absent. Apollo 11/17 recorded-narration support remains intact, but their deliberately omitted originals are still not playable in this review. No caption timestamps are invented.

## Verification and evidence

- Production build passes, including TypeScript. The pre-existing Three.js chunk-size warning remains.
- Full suite: 218 passed, zero failures/omissions. Four new cinematic contract/provenance tests supplement the existing chapter, audio, quiz, store, badge, retry, NASA attribution and protected-file checks.
- Actual Chrome production rendering at 1440x900, 1024x768, 390x844. All image loads, main landmarks, interactive target sizes and horizontal overflow checks passed.
- `story-design-qa.mjs` generates OLD / NEW / HAROON comparison JPEG and standalone HTML sheets at all three sizes. OLD files are required and never regenerated from NEW. Build-index hash and dirty-worktree source context are recorded.
- Real browser regression: all fifteen Apollo 11/15/17 chapter routes, 40 route/variant captures plus activity/completion screenshots, with additional openings at 360x800 and 439x591 and reduced motion.
- Actual Apollo 15 MP3 Play/Pause/Resume, segment change without autoplay; native activity; quiz/completion/reload/idempotent badge; Escape/Tab and emulated touch scrolling passed. The sticky audio deck remains reachable after selecting a later reading segment.
- No JavaScript, image or application/media HTTP errors; favicon.ico remains an unrelated 404. Browser contexts are disposable; ordinary user progress is neither read nor reset.
- `git diff --check` and staged checks pass. Legacy source snapshots initially flagged the intentional presentation extraction; a precise reversal contract was added, with a test confirming it cannot hide changed handlers.

Local screenshots/comparisons: `$env:AURORALYS_QA_DIR` (external visual-review artifacts). `design-verification.json` records required-size checks; `regression/verification.json` records full browser regression. These files and the references are not staged.

Manual pending: director visual approval, physical touch devices, Safari/iOS, screen-reader reading order, 200% zoom, offline/CDN failure review and production-quality alpha edges. The panorama/high-resolution portrait depend on NASA availability; the hardware retains a readable load-error state and source access.

## Reproduce locally

From the isolated worktree:

```powershell
npm.cmd run build
npm.cmd run preview -- --port 5202 --strictPort
node --test --test-concurrency=1 tests/*.test.mjs
npx.cmd tsc -b --pretty false
```

Open `http://127.0.0.1:5202/story/apollo-15-rover/1`. Apollo 11 and 17 remain at their existing story IDs. Progress uses the unchanged `beyond-earth-progress` key per origin/port.

With dedicated headless QA Chrome on port 9339, profile outside dist:

```powershell
$env:CHROME_QA_PORT='9339'
node scripts/story-design-qa.mjs ../qa-artifacts/visual-correction "$env:AURORALYS_APOLLO15_REFERENCE" http://127.0.0.1:5202
node scripts/story-visual-qa.mjs ../qa-artifacts/visual-correction/regression http://127.0.0.1:5202
```

Capture OLD images before modifying/building the baseline if repeating this review in a fresh worktree. No browser package or new application dependency is required.

## Exact file inventory

- `docs/visual-correction-review.md`
- `docs/visual-stage-assets.json`
- `scripts/story-design-qa.mjs`
- `src/components/storytelling/Apollo15ScrollStory.module.css`
- `src/components/storytelling/Apollo15ScrollStory.tsx`
- `src/components/storytelling/CinematicStoryLayout.module.css`
- `src/components/storytelling/CinematicStoryLayout.tsx`
- `src/components/storytelling/MoonPackageStory.tsx`
- `src/components/storytelling/StoryEnvironment.tsx`
- `src/components/storytelling/StoryHardware.tsx`
- `src/components/storytelling/StoryPresentation.module.css`
- `src/features/storytelling/storyPresentation.ts`
- `src/features/storytelling/storyStageAssets.ts`
- `tests/cinematic-story.test.mjs`
- `tests/helpers/cinematic-contract.mjs`
- `tests/helpers/story-visual-contract.mjs`
- `tests/story-presentation.test.mjs`

Only a local text-only commit is authorized. No push, merge, private asset import or modification to protected branches, GIS/3D, homepage, explorer, persistence, stashes or existing implementation worktrees.
