# Perseverance Chapter 3 — Challenges & Discoveries

Scope: only `/story/follow-perseverance/3`. Sources verified on **2026-11-04**.
The uncommitted My Journey implementation from the previous task is preserved.

## Inspection before editing

`ChallengeChapter` in `MachineStoryPage.tsx` originally renders a large rover
panel with overlaid problem/solution text, three selection buttons and a
three-entry discovery bank. Initial selection is index 0. Selecting any challenge
calls `onInteract`. Each discovery click reveals its existing detail, adds its
index to an in-memory list once, and also calls `onInteract`. Entries remain
revealed when switching challenges; they reset when leaving/remounting the
chapter. Interaction enables the existing Next Chapter gate, without requiring
all entries or changing persistence. The existing header voice button narrates
the chapter's original text rather than the currently selected challenge.

The existing data is retained verbatim from `machineStories.ts`:

| Challenge | Engineering solution |
| --- | --- |
| Landing among hazards | Terrain-Relative Navigation compares camera images with an onboard map to choose safer terrain. |
| Working alone | Autonomous navigation and onboard fault protection work alongside the Earth team's plans despite radio delay. |
| Protecting samples | Selected rock cores are sealed in titanium tubes with geologic context recorded. |

The three discovery records remain **AN ANCIENT LAKE**, **WATER-ALTERED ROCKS**
and **A SAMPLE LIBRARY**, with their original details. No mission accomplishment,
coordinate, geologic finding or return-mission guarantee was added.

## Implementation

- Added `src/components/storytelling/PerseveranceChallenges.tsx` and its CSS
  Module. The selected challenge now has distinct problem, solution and science
  connection sections. Three native buttons retain direct selection in any
  order, with `aria-pressed`, visible focus, 44 px targets and a concise status.
- Added `src/features/storytelling/challengeMedia.ts`, using the existing
  `StoryImageMedia` type. `challengeLessons` and `discoveryLessons` explicitly
  map the existing array positions to educational evidence. They do not replace
  scientific records or imply a unique cause for any discovery. Their connections
  are teaching links between engineering capabilities and opportunities for science.
- Reused **unchanged** `StoryMedia.tsx`, its error/retry handling, full attribution,
  source links and keyed image-loading lifecycle. All full captions remain
  visible on mobile through CSS scoped to this chapter. Layout is in normal
  document flow; there is no scroll controller, timed progression or sticky panel.
- The discovery log retains independent reveal-once behavior and the original
  interaction callbacks. A new Open log control reveals and explicitly focuses
  the related entry. It does not collapse other entries or add completion gates.
  Media loads only for the selected challenge and revealed discoveries.
- The original `MachineVisual` passes `interactive={false}` to the unchanged
  Perseverance rover scene. The model is available through Show 3D rover in a
  compact 290 px view, closed initially. Controls require explicit activation;
  Done/Escape restores ordinary page interaction. Challenge/discovery selection
  does not remount it. Hiding the document or newly enabling reduced motion
  closes the view. Explicitly reopening it is allowed under reduced motion.
- Existing voice and chapter-progress handlers are untouched. CSS suppresses
  local/shared-shell motion under reduced motion only while the new chapter is
  mounted. No storage field, dependency, model asset or 3D public API changed.
- `MachineStoryPage.tsx` changes only an import and the chapter-3 render choice:
  Perseverance uses the new component; Apollo uses the original `ChallengeChapter`.
  Every original helper function remains intact. Other routes keep their output.

## Verified media and provenance

All five original download links were followed from official JPL caption pages.
The downloads were decoded and all five 720 px derivatives visually inspected.
The manifest records exact alt text, source and original URLs, credit, media
classification, verification date and policy. There are no generated substitutes.

| Local ID / use | Official source / credit | What it depicts and classification |
| --- | --- | --- |
| `hazards` / landing challenge | [PIA23970 — Avoiding Hazards at Jezero Crater](https://www.jpl.nasa.gov/images/pia23970-avoiding-hazards-at-jezero-crater/) — **NASA/JPL-Caltech** | Published hazard visualization: blue safer zones, red more hazardous terrain, green touchdown marker. Labeled illustration, not a photograph. This is a static educational image, not a new GIS layer. |
| `autonav` / working-alone challenge | [PIA26071 — Perseverance's AutoNav Leads the Way](https://www.jpl.nasa.gov/images/pia26071-perseverances-autonav-leads-the-way/) — **NASA/JPL-Caltech** | June 29, 2023 navigation-camera composite with JPL visualization overlays. The caption identifies the paths and rover visualization as overlays. |
| `tubes` / protecting samples and sample-library entry | [PIA25738 — WATSON's Photomontage of Mars Sample Depot](https://www.jpl.nasa.gov/images/pia25738-watsons-photomontage-of-mars-sample-depot/) — **NASA/JPL-Caltech/MSSS** | Separate photographs of ten deposited tubes, December 2022–January 2023. The displayed montage is not their physical arrangement. It does not assert all tubes contain rock cores or that samples have returned to Earth. |
| `delta` / ancient-lake entry | [PIA24683 — Mars' Delta Scarp From More Than a Mile Away](https://www.jpl.nasa.gov/images/pia24683-mars-delta-scarp-from-more-than-a-mile-away/) — **NASA/JPL-Caltech/LANL/CNES/CNRS/ASU/MSSS** | Five-image RMI mosaic acquired March 17, 2021, supporting discussion of sediment deposits interpreted as an ancient river/lake setting. |
| `foux` / water-altered-rocks entry | [PIA24728 — WATSON Views Foux](https://www.jpl.nasa.gov/images/pia24728-watson-views-foux/) — **NASA/JPL-Caltech/MSSS** | WATSON close-up from July 11, 2021. Its relevance is established by [JPL's water-altered crater-floor rocks report](https://www.jpl.nasa.gov/news/nasas-perseverance-makes-new-discoveries-in-mars-jezero-crater/), also linked in the entry. The caption explicitly cautions that the photograph alone does not establish chemistry or habitability. |

Alt text describes the observed visual evidence: hazard colors and landing
marker; boulders with annotated wheel paths; separate tube-photo panels; layered
delta outcrop; and Foux's grains, pits and dust. Full English strings are in the
typed manifest rather than inferred from filenames or repeated as vague titles.

Original downloads:

- `hazards`: <https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA23970.jpg>
- `autonav`: <https://d2pn8kiwq2w21t.cloudfront.net/original_images/PIA26071.jpg>
- `tubes`: <https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA25738.jpg>
- `delta`: <https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA24683.jpg>
- `foux`: <https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA24728.jpg>

Usage review: the [JPL Image Use Policy](https://www.jpl.nasa.gov/jpl-image-use-policy/)
allows use subject to its special cases, exact caption attribution and no implied
NASA/JPL/Caltech endorsement. Each selected caption supplies the credits above
and no separate restrictive copyright notice. Use here is factual educational
display; this is not a blanket license for merchandise, third-party rights or
agency logos. There are no recognizable people in these selected images.

## Optimized local assets

Ten JPEG files in `public/media/perseverance-challenges/`. System.Drawing bicubic
resize, quality 82; full source frame, no color edits, invented annotations or
crop. NASA/JPL's own existing image borders/annotations are retained.

| ID | Original dimensions | 720 px derivative / bytes | 1440 px derivative / bytes |
| --- | --- | --- | --- |
| hazards | 1920×1080 | 720×405 / 132,399 | 1440×810 / 421,093 |
| autonav | 2513×1095 | 720×314 / 48,562 | 1440×627 / 141,458 |
| tubes | 2860×1608 | 720×405 / 68,826 | 1440×810 / 261,052 |
| delta | 2479×922 | 720×268 / 39,324 | 1440×536 / 132,037 |
| foux | 1584×1184 | 720×538 / 106,453 | 1440×1076 / 365,971 |

File names are `<id>-720.jpg` and `<id>-1440.jpg`. Responsive `srcSet` and the
browser cache avoid downloading every variant and reuse `tubes` between the
challenge and discovery. No image network service is needed at runtime.

## Validation

Commands:

```powershell
node --test tests/storytelling-pilot.test.mjs tests/explorer-popup-layout.test.mjs tests/storytelling-media.test.mjs tests/storytelling-challenges.test.mjs
npm.cmd run build
git diff --check
```

The new tests execute real challenge/media components and event handlers using
a small hook/effect host. They cover all original problem/solution text, direct
selection, persistent reveal-once entries, correct evidence mapping, related-log
focus/scroll, image error/retry, reduced motion, explicit rover controls,
Escape, no rover remount during selection, hidden-document cleanup and CSS scope.
Scene rendering and browser layout are not exercised by this host.

Results: **30 tests passed** (23 existing, 7 new). `npm.cmd run build` passed
including TypeScript; the existing 823.49 kB shared Three.js chunk warning remains.
`git diff --check` passed. All ten JPEGs decoded with the dimensions above and
returned HTTP 200 / `image/jpeg` from a temporary production preview; Chapter 3,
My Journey and Apollo 17 Chapter 3 also returned HTTP 200. These are serving
checks, not client-interaction checks. The owned preview server was stopped.
The ten assets total 1,717,175 bytes.

SHA-256 comparisons against a snapshot taken at the start of this task show
that only `MachineStoryPage.tsx` and `tests/storytelling-media.test.mjs` changed
among pre-existing files. The previously reviewed journey assets, component,
manifest, pilot and documentation remain byte-identical. New chapter files and
assets are additive; no dependency or protected GIS/3D/homepage file changed.

Separate server-render comparisons check all nine unaffected story routes,
including current My Journey, against the original route component with the
current pilot. Every legacy helper, including voice, is compared with checkpoint
`49f7545`. The previous media suite's whole-file checkpoint assertion now excludes
the intentionally changed route file; the new focused checks protect that seam.

No real browser interaction or screenshot acceptance is claimed for this stage.
The user's visual acceptance of My Journey remains separate from Chapter 3 QA.

## Manual browser acceptance

1. With chapter 3 unlocked, open `/story/follow-perseverance/3`. Select challenges
   in different orders. Confirm exact original problem/solution text, relevant
   evidence, one selected button, credits, full captions and working sources.
2. Open discoveries independently; click an open one again, switch challenges,
   and confirm entries stay open and the count never duplicates. Use each Open
   log link; check focus/scroll reaches the appropriate entry. Reload/leave the
   chapter: these temporary selections reset as before, saved chapter progress does not.
3. Check existing Hear My Story / Stop Voice before and after changing challenges;
   narration should retain its previous chapter-level behavior. Confirm one
   interaction enables Next Chapter and the old progress/return controls still work.
4. At 360×800, 390×844, 439×591, 820×640 and 1280×720, verify readable text,
   full captions, no horizontal overflow, native page scrolling and compact media.
   Use keyboard-only navigation, zoom and a screen reader to check focus, pressed
   and expanded states, announcements and links. Challenge selection must not jump focus.
5. Block/slow a JPEG request; check error, retained attribution and Retry. Under
   reduced motion, check no image fades or shared-shell entrance movement.
6. Show the rover, enable controls, zoom/rotate, choose Done, press Escape and
   test native fullscreen exit. Switch challenges/reveal entries while it is open:
   camera pose should remain. Hide the tab or enable reduced motion: it should
   close and remain closed until explicitly reopened. Test actual WebGL/touch behavior.
7. Revisit Apollo 17, Perseverance chapters 1/2/4/5 and both explorers. Confirm
   existing output, voice, landing reconstruction and saved progress remain intact.

No branch, commit, push, merge or publication was created.
