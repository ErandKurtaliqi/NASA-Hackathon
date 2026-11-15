# Perseverance — My Journey: verified mission imagery

Sources verified. Scope: `follow-perseverance`, chapter 2 only.
Official captions and their download links were checked before downloading;
all five local images were decoded and visually inspected. No AI-generated
imagery, substitute mission photographs, autoplay video or audio was added.

## Asset provenance

The typed manifest in `src/features/storytelling/journeyMedia.ts` records each
source page, original download URL, exact credit, media type, caption, English
alternative text, usage-policy link and verification date. These descriptions
are deliberately independent from the existing journey facts and dates.

### launch — Leaving Earth

- Source: [Mars 2020 Perseverance Launches Off Florida Coast](https://science.nasa.gov/resource/mars-2020-perseverance-launches-off-florida-coast/).
- Credit: **NASA/Joel Kowsky**. Real photograph, July 30, 2020.
- Depicts the Atlas V carrying Perseverance lifting off from Space Launch
  Complex 41 at Cape Canaveral, viewed across the launch site toward the coast.
- [Original download](https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/downloadable_items/4/5/45114_liftOff-from-distance-original.jpg?crop=faces%2Cfocalpoint&fit=clip&h=3086&w=4629).
  Download decoded at 4629×3085 (the page labels it 4629×3086).
- Alt: “An Atlas V rocket rises above its launch pad, with a bright exhaust plume
  and clouds of smoke beside the Florida coast.”
- Conditions: NASA media guidelines below; educational, factual presentation
  with the named photographer’s credit and no suggestion of endorsement.

### cruise — Between two worlds

- Source: [Mars 2020 Spacecraft Mid-Cruise (Illustration)](https://science.nasa.gov/resource/mars-2020-spacecraft-mid-cruise-illustration/).
- Credit: **NASA/JPL-Caltech**. Illustration generated using NASA’s Eyes on the
  Solar System imagery, published October 27, 2020; **not a spacecraft photograph**.
- Shows Mars 2020’s solar-panel-covered cruise stage and part of its backshell
  at the mission’s midpoint. The labels and orbit lines belong to the original.
- [Original download](https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/downloadable_items/4/5/45366_PIA24231.png?crop=faces%2Cfocalpoint&fit=clip&h=1700&w=3360), 3360×1700.
- Alt: “Illustration of the circular, solar-panel-covered Mars 2020 cruise stage
  in interplanetary space, with orbit lines behind it.”
- Conditions: NASA media guidelines; retain NASA/JPL-Caltech attribution and
  identify the image as a visualization rather than documentary photography.

### entry — Into the atmosphere

- Source: [PIA24315 — Perseverance Guides Itself Towards the Surface (Illustration)](https://www.jpl.nasa.gov/images/pia24315-perseverance-guides-itself-towards-the-surface-illustration/).
- Credit: **NASA/JPL-Caltech**. Illustration, published December 16, 2020.
- Depicts the aeroshell containing Perseverance during guided entry above Mars.
  It is a prelanding visualization, not a camera record of atmospheric entry.
- [Original download](https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA24315.jpg), 10240×5760.
- Alt: “Illustration of Perseverance’s rounded aeroshell descending above the
  cratered, rust-colored surface of Mars.”
- Conditions: JPL image-use policy; preserve the stated credit, classification
  and factual context. No separate third-party copyright notice in the caption.

### landing — The real descent

- Source: [PIA24428 — High-Resolution Still Image of Perseverance’s Landing](https://www.jpl.nasa.gov/images/pia24428-high-resolution-still-image-of-perseverances-landing/).
- Credit: **NASA/JPL-Caltech**. Real video frame captured February 18, 2021;
  published February 19. The image is displayed as a still, without playback.
- A descent-stage camera looks down at the rover and surface during landing.
  This evidence is separate from the optional educational 3D reconstruction.
- [Original download](https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA24428.jpg), 2048×1536.
- Alt: “A real descent-camera frame looking down at Perseverance suspended on
  sky-crane cables above the dusty Martian surface.”
- Conditions: JPL image-use policy, stated credit, no implied endorsement;
  no separate third-party copyright notice in the caption.

### explore — Reading the rocks

- Source: [PIA24836 — Perseverance’s Selfie at Rochette](https://www.jpl.nasa.gov/images/pia24836-perseverances-selfie-at-rochette/).
- Credit: **NASA/JPL-Caltech/MSSS**. Photographic mosaic from WATSON images
  acquired September 10, 2021 (sol 198), published September 20.
- Shows Perseverance beside Rochette and the drill holes from rock-core sampling.
  Each selfie version combines 57 photographs. The downloaded landscape JPEG
  is the source’s supplied presentation, not an Auroralys-generated composite.
- [Original download](https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA24836.jpg), 3840×2160.
- Alt: “A stitched rover selfie shows Perseverance beside the flat Rochette rock
  and its drill holes on the rocky floor of Jezero Crater.”
- Conditions: JPL image-use policy; retain the **MSSS** credit. No separate
  restrictive copyright notice appears in this caption. This review covers
  educational display, not a blanket license for future merchandising.

## Usage review

- [NASA Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)
  permit educational/informational use subject to their conditions, require
  acknowledgement and distinguish NASA content from third-party copyrighted
  material. NASA identifiers/logos have separate restrictions. This feature does
  not use an agency logo as Auroralys branding or imply NASA endorsement.
- [JPL Image Use Policy](https://www.jpl.nasa.gov/jpl-image-use-policy/)
  generally allows use without individual permission, subject to its special
  cases, credit requirements and disclaimer of ownership warranties. Specific
  caption credits take precedence over the default credit. Third-party material,
  identifiable people, promotional use and logos may require separate review.
- All selected images are used as factual mission evidence in an educational
  story. No recognizable human subject is used. Full credit and an official
  caption-page link stay visible, including during image loading or failure.

## Local derivatives

Files live in `public/media/perseverance-journey/`. Originals were downloaded
from the source pages’ own links. Derivatives use System.Drawing bicubic resize
and JPEG quality 82, retain the entire frame/aspect ratio (rounded to whole
pixels), and add no recoloring, objects, crop or scientific overlays. The viewer
uses `object-fit: contain`. Original downloads are not added to the repository.

| Step | 720 px file / dimensions / bytes | 1440 px file / dimensions / bytes |
| --- | --- | --- |
| launch | `launch-720.jpg` / 720×480 / 55,902 | `launch-1440.jpg` / 1440×960 / 183,766 |
| cruise | `cruise-720.jpg` / 720×364 / 16,157 | `cruise-1440.jpg` / 1440×729 / 55,834 |
| entry | `entry-720.jpg` / 720×405 / 47,446 | `entry-1440.jpg` / 1440×810 / 163,669 |
| landing | `landing-720.jpg` / 720×540 / 51,949 | `landing-1440.jpg` / 1440×1080 / 159,258 |
| explore | `explore-720.jpg` / 720×405 / 57,659 | `explore-1440.jpg` / 1440×810 / 208,744 |

Total: 1,000,384 bytes for both sizes of all five assets. Responsive `srcSet`
lets the browser select a variant; only the active image is mounted. No remote
image service or new dependency is needed at runtime.

## Integration and behavior

- `PerseverancePilot` selects media with `steps[active].id` only for `journey`.
  Both natural scroll and existing step buttons therefore update the same view.
  Neither controller, narration hook, chapter navigation nor progress schema changed.
- Reusable `StoryMedia` accepts typed provenance plus optional fallback content.
  A missing verified record preserves the existing rover view. Image errors
  display an explanation and retry, preserving the source and credit; they do
  not mount another heavy scene. A changed image source resets loading/error state.
- Images fade in over 240 ms after loading. Pause visuals and reduced motion
  disable the fade; stills continue following the reader. There is no camera
  movement, video autoplay or background music. No rover is remounted on normal
  step changes. The existing rover remains unchanged in Meet Me.
- Desktop uses the existing two-column story grid. Mobile retains a compact
  sticky image/type/credit/source panel. Full captions remain available to
  assistive technology; the narrative supplies the visible step title. At heights
  of 650 px or less the panel returns to normal flow with full captions, avoiding
  persistent obstruction of text and reconstruction controls.
- `LandingSequence.tsx` is unchanged: heat shield, parachute and sky crane remain
  explicitly optional, labeled reconstruction/not NASA footage, and stop on
  leaving landing, hiding the document or pausing visuals. A media load/failure
  never completes a chapter or starts the reconstruction.

## Validation and limits

Automated command: `node --test tests/storytelling-pilot.test.mjs tests/explorer-popup-layout.test.mjs tests/storytelling-media.test.mjs`.
The new hook/effect host executes the real pilot, scroll hook, controller and
event handlers against simulated card geometry; scene loading is stubbed.
It exercises forward/reverse scroll, Previous/Next, matching media and provenance,
image failure/retry/source reset, reduced motion, explicit landing opening,
leaving/reentering landing, document hiding and Meet Me isolation. Other checks
compare protected files and legacy rendered chapters against checkpoint `49f7545`.
These checks do not measure browser layout or execute Three.js/GPU rendering.

Results: **23 tests passed** (16 existing, 7 new). `npm.cmd run build` passed,
including TypeScript; `git diff --check` passed. All 10 derivatives decoded at
the dimensions above and returned HTTP 200 with `image/jpeg` through a temporary
local Vite server. Vite retains the existing 823.49 kB shared Three.js chunk
warning. No dependencies changed. The seven new tests were rerun successfully
after adding explicit reconstruction Stop/Pause/Resume lifecycle assertions.

The browser inventory had no browser connector. A native Chrome inspection was
attempted, but Computer Use stopped because it could not confidently establish
the current URL for policy enforcement. No browser visual acceptance is claimed.

Manual acceptance still required:

1. At 360×800, 390×844, 439×591, 1280×720 and larger desktop sizes, scroll forward
   and backward and use Previous/Next/numbered buttons. Confirm the image, type,
   title/step, credit and source stay consistent and no horizontal overflow occurs.
2. Check the mobile sticky panel does not obscure the reading line, focus or
   buttons. In short viewports it is intentionally in document flow; confirm
   reading and reconstruction controls stay usable. Test browser zoom and rotation.
3. Use keyboard navigation and a screen reader; confirm alt text, source links,
   loading/error messages and visible focus without unwanted focus movement.
4. Enable reduced motion before loading and while reading. Confirm stills update
   without fades, and Pause visuals stops transitions and reconstruction. Test
   blocked/slow JPEG requests, retry, cached reloads and source links.
5. At landing, distinguish the actual camera frame from the reconstruction;
   open all three reconstruction stages and test Stop, Pause, fullscreen and tab
   hiding. Leave/reenter landing: there must be no automatic restart.
6. Verify actual GPU/touch behavior, optional voice, saved progress, Apollo 17,
   Perseverance’s other chapters and both explorers on target devices.

No commit, push, merge, publication or branch change is part of this task.
