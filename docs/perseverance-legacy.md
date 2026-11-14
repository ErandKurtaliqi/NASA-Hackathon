# Perseverance Chapter 4 — My Legacy

Scope: `/story/follow-perseverance/4` only. Source/status review: **2026-11-04**.

## Inspection and retained behavior

The original `LegacyChapter` used five records from `machineStories.ts`: launch,
landing, the helicopter partnership, ongoing exploration and future influence.
It started at index 0; selecting a record called `onInteract`. Selection was
temporary. The unchanged parent saved completion only through Next Chapter.
The original chapter-level voice used the existing last legacy entry.

Those five titles and educational paragraphs are still rendered verbatim, using
typed `legacyIndex` links to the unchanged story data. The original `2021–24`
record is clarified as Ingenuity's partnership period, not a rover mission end.
Three additional records extend the selected history. This is explicitly a set
of selected milestones, not an exhaustive history through 2026.

## Files and integration

Created:

- `src/features/storytelling/legacyMilestones.ts`: typed milestone manifest,
  dated references, review date, category labels, new media records and explicit
  relationships between image dates and event dates.
- `src/components/storytelling/PerseveranceLegacy.tsx`: manual timeline,
  explanation/evidence/source view and optional original rover presentation.
- `src/components/storytelling/PerseveranceLegacy.module.css`: isolated layout,
  full mobile captions, touch targets and reduced-motion rules.
- `tests/storytelling-legacy.test.mjs`: interaction, dates, storage, accessibility
  contracts and protected-route comparisons.
- This document and four JPEG derivatives under `public/media/perseverance-legacy/`.

Modified:

- `src/components/MachineStoryPage.tsx`: one import and a Perseverance-only
  branch inside chapter 4. `LegacyChapter` and every other original helper stay
  unchanged, including voice. The original scene is passed via `MachineVisual`
  with the same `interactive={false}` public prop.
- `tests/storytelling-challenges.test.mjs` and `tests/storytelling-media.test.mjs`:
  acknowledge the now-authorized Chapter 4 seam in older regression assertions.
  The new suite compares all nine other routes against the pre-legacy route,
  including the reviewed Chapter 3 and current My Journey.

No homepage, explorer, GIS/3D internals, scene assets, original story data,
progress store, shared media renderer, Chapter 1/2/3/5 implementation or dependency
was edited. All previous working-tree changes were preserved.

## Timeline and source verification

| Record | Date meaning | Official evidence |
| --- | --- | --- |
| A precise new explorer | Launch: **2020-07-30** | [NASA mission overview](https://science.nasa.gov/mission/mars-2020-perseverance/) |
| Touchdown at Jezero | Landing: **2021-02-18** | Mission overview, [JPL descent-footage report, 2021-02-22](https://www.jpl.nasa.gov/news/nasas-mars-perseverance-rover-provides-front-row-seat-to-landing-first-audio-recording-of-red-planet/) and [landing hazard graphic](https://www.jpl.nasa.gov/images/pia23970-avoiding-hazards-at-jezero-crater/) |
| A helicopter partnership | First/last flight: **2021-04-19 / 2024-01-18**. End announcement: **2024-01-25** | [NASA Ingenuity conclusion](https://www.nasa.gov/news-release/after-three-years-on-mars-nasas-ingenuity-helicopter-mission-ends/) |
| Making oxygen on Mars | First/final production: **2021-04-20 / 2023-08-07** | [NASA first-run history](https://science.nasa.gov/blog/moxie-celebrates-2-years-on-mars-discoveries-and-work-left-to-do/), [JPL final report, 2023-09-06](https://www.jpl.nasa.gov/news/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/) |
| A backup sample collection | Depot construction: **2022-12-21 to 2023-01-28** | [JPL depot report, 2023-02-14](https://www.jpl.nasa.gov/news/nasas-perseverance-rover-shows-off-collection-of-mars-samples/) |
| A new off-world driving record | Event **2026-10-11**, report **2026-10-12** | [NASA October 2026 report](https://science.nasa.gov/blogs/perseverance-mars-rover/2026/10/12/nasas-perseverance-sets-off-world-record-for-total-distance-driven/) |
| My story is still being written | Status checked **2026-11-04**, not an event or live feed | NASA's current mission page labels Perseverance active; the October report supplies ongoing research context. |
| Pathfinder for explorers | **Undated possibilities** | Mission overview and MOXIE final report; no return/crew schedule is asserted. |

Records are ordered by starting date; multi-year intervals naturally overlap.
The date of a report is shown separately where available. No estimated image
acquisition date is invented when a caption only gives its publication date.

Categories are visible text: **Accomplished event**, **Mission status snapshot**
and **Possible future outcome**. The ongoing record separately labels its
scientific expectation as **not an established finding**. Ingenuity and MOXIE
are not presented as still operating. The future record promises neither sample
return nor a human landing, and the depot is not treated as a completed return.

The status badge is deliberately a dated snapshot. It needs renewed source
review for later editorial updates; the browser does not fabricate live status.

## Media provenance and meaning

The manifest reuses the existing complete `StoryImageMedia` records, preserving
source/original URLs, credits, alt text and usage-policy metadata. Every selected
record adds `mediaContext` to distinguish image dates from milestone dates.
All images are stills; there is no animated GIF, video autoplay or reconstruction.

| Media / record use | Official image source and credit | What is displayed |
| --- | --- | --- |
| Launch / launch | [NASA launch photograph](https://science.nasa.gov/resource/mars-2020-perseverance-launches-off-florida-coast/) — **NASA/Joel Kowsky** | Atlas V lifting off on July 30, 2020. Reuses My Journey's local derivatives. |
| Landing / touchdown | [PIA24428](https://www.jpl.nasa.gov/images/pia24428-high-resolution-still-image-of-perseverances-landing/) — **NASA/JPL-Caltech** | Actual descent-camera frame, not an educational reconstruction. Reuses My Journey assets. |
| Ingenuity / partnership | [PIA24586](https://www.jpl.nasa.gov/images/pia24586-perseverances-navcam-view-of-ingenuitys-first-flight/) — **NASA/JPL-Caltech** | Navcam still of the April 19, 2021 first flight. The small helicopter is near the center of the scene. |
| MOXIE / oxygen | [PIA24203](https://www.jpl.nasa.gov/images/pia24203-moxie-all-tucked-in/) — **NASA/JPL-Caltech** | Prelanding hardware photograph published January 19, 2021, not oxygen production photographed on Mars. Acquisition date is unspecified. |
| Tubes / depot and future | [PIA25738](https://www.jpl.nasa.gov/images/pia25738-watsons-photomontage-of-mars-sample-depot/) — **NASA/JPL-Caltech/MSSS** | Separate tube photographs in a montage; not their ground arrangement, not samples already on Earth. Reuses Chapter 3 derivatives. |
| AutoNav / 2026 driving record | [PIA26071](https://www.jpl.nasa.gov/images/pia26071-perseverances-autonav-leads-the-way/) — **NASA/JPL-Caltech** | Supporting annotated composite from June 29, 2023. Existing JPL visualization overlays explain navigation; the caption/context explicitly say this is not the October 2026 record drive. |
| Rochette portrait / ongoing mission | [PIA24836](https://www.jpl.nasa.gov/images/pia24836-perseverances-selfie-at-rochette/) — **NASA/JPL-Caltech/MSSS** | Archival WATSON photographic mosaic dated September 10, 2021, not the rover's November 2026 location or a live view. |

Meaningful alt text for the two new images:

- Ingenuity: “A Navcam photograph shows the small Ingenuity helicopter hovering
  near the center of a wide rocky Martian landscape, with hills behind it.”
- MOXIE: “A close-up hardware photograph shows the gold-colored MOXIE instrument
  inside Perseverance, with white intake tubing, wiring and metal fittings.”

The five reused records retain their existing descriptive alt text: rocket and
plume, suspended rover and cables, separate tube panels, annotated boulder-field
paths and the Rochette rover/rock scene. See the manifests and the previously
documented [journey media](perseverance-journey-media.md) and
[challenge media](perseverance-challenges.md) for full original URLs and text.

New original download links, followed from the JPL caption pages:

- <https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA24586.jpg>
- <https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA24203.jpg>

Usage: factual educational display with exact attribution under the
[JPL Image Use Policy](https://www.jpl.nasa.gov/jpl-image-use-policy/), and for the
NASA launch photo the [NASA media guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).
No agency endorsement is implied; logo and third-party rights remain separate.
No separate restrictive copyright notice was found in the selected captions.
The feature uses no recognizable human subject or agency logo as branding.
These conditions apply per image; reuse does not remove its original credit.

## New local derivatives

Both downloads were decoded and the 720 px derivatives visually inspected.
JPEG quality 82, full frame and unchanged color/content. Ingenuity is not
upscaled beyond its 1280×960 source; MOXIE's source is 4032×3024.

| File in `public/media/perseverance-legacy/` | Dimensions | Bytes |
| --- | --- | --- |
| `ingenuity-720.jpg` | 720×540 | 82,812 |
| `ingenuity-1280.jpg` | 1280×960 | 209,636 |
| `moxie-720.jpg` | 720×540 | 112,855 |
| `moxie-1440.jpg` | 1440×1080 | 335,800 |

`srcSet` chooses a local variant; only the selected record's image is mounted.
The other five images reuse existing assets and browser caching.

## Interaction and accessibility

- Native buttons provide mouse, touch, Tab and Enter/Space selection, with
  `aria-pressed`, `aria-controls`, visible focus and 44 px minimum targets.
- Arrow keys, Home/End and Previous/Next use the same selection state. Keyboard
  movement focuses the chosen timeline button; scroll is instant under reduced
  motion. Selecting a record does not force focus into the article.
- One concise live status names the selected milestone. Each record shows its
  date/category, story, significance, image provenance and scientific references.
- Desktop uses timeline/detail columns. Tablet/phone use a two-column button
  grid above the detail; full captions stay visible. No sticky view, timer,
  oversized empty canvas or forced story scrolling is introduced.
- Existing rover scene/public props are unchanged. Its compact 280 px view opens
  explicitly, with gated controls and Done/Escape. Selection does not remount it;
  hiding the document or newly enabling reduced motion closes it. Reopening is
  a deliberate choice. Fullscreen exit restores the control button.
- Header narration remains the original optional chapter-level behavior. It does
  not automatically follow the new records. Route, locks, Next Chapter completion
  and localStorage schema are unchanged; no requirement to visit all eight items.

## Validation and browser acceptance

```powershell
node --test tests/storytelling-pilot.test.mjs tests/explorer-popup-layout.test.mjs tests/storytelling-media.test.mjs tests/storytelling-challenges.test.mjs tests/storytelling-legacy.test.mjs
npm.cmd run build
git diff --check
```

The legacy suite executes the real component, media renderer and event/effect
handlers against a lightweight hook host; the scene is a marker, not a GPU test.
It checks all records and original story paragraphs, matching image/credit/source,
date ordering, chronology/publication distinctions, uncertainty labels, keyboard
and button selection, boundaries, retry, reduced motion and stable optional 3D.
It also uses the actual store with in-memory localStorage for saved legacy
completion and Apollo preservation. A separate render comparison covers all nine
unaffected routes against the pre-legacy route integration; all legacy helper
functions, including narration, are compared with the checkpoint.

Results: **37 tests passed** (30 existing, 7 new); `npm.cmd run build` passed
including TypeScript, and `git diff --check` passed. The existing 823.49 kB shared
Three.js chunk warning remains. All four new JPEGs decoded at the stated sizes
and returned HTTP 200 / `image/jpeg` through a temporary production preview.
Perseverance chapters 3/4 and Apollo 17 chapter 4 also returned HTTP 200. These
are serving checks, not browser interaction tests. The owned preview was stopped.
New JPEGs total 741,103 bytes.

SHA-256 comparison with a start-of-task snapshot confirms that the only changed
pre-existing files are `MachineStoryPage.tsx` and the two named regression test
files. Previously reviewed chapter/media code and assets are byte-identical.

Real browser layout, screen-reader speech, native voice and WebGL still require
manual checks. Previous visual acceptance of Chapters 2/3 does not establish
Chapter 4 acceptance.

1. With legacy unlocked, open `/story/follow-perseverance/4`. Select all records
   in both directions and arbitrary order. Check media, original story themes,
   event/report dates, source links and visible accomplishments/status/future labels.
2. Use Tab/Enter/Space, arrows, Home/End and Previous/Next. Confirm one selected
   button, useful announcements, visible focus, no unexpected article-focus jump,
   and disabled boundaries. Verify keyboard focus remains visible on phones too.
3. At 360×800, 390×844, 439×591, 820×640 and 1280×720, check readable buttons,
   full captions, no horizontal overflow and no oversized empty panels. Test zoom,
   rotation, normal touch scrolling and a screen reader.
4. Check reduced motion before load and after a live preference change: no image
   fade or shared-shell movement, and instant keyboard scroll. Block/slow a JPEG
   and use Retry; attribution and scientific references must remain available.
5. Show the rover; test gated touch/orbit/zoom, Done, Escape and native fullscreen
   exit. Switch milestones: camera state should stay. Hide the tab: the model
   closes and does not resume without another explicit choice.
6. Test the unchanged Hear My Story/Stop Voice and Next Chapter behavior. Reload
   with saved progress; ensure chapter/quiz continuation works, temporary record
   selection resets, and real progress is not cleared for testing.
7. Revisit all other Perseverance chapters, Apollo 17 and both explorers. Confirm
   reviewed media, reconstruction, discovery log and persisted progress remain.

No branch, commit, push, merge, publication or new dependency is part of this work.
