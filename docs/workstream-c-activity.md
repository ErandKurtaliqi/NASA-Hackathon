# Workstream C — Standalone prediction and evidence activity

Status: implemented for revision in the isolated worktree `activity` (relative to the repository), HEAD
decoupled into `8120d9e`. No history has been inserted or a shared path modified.

## Demonstrable result

The activity invites you to predict what happens when you drop a hammer and a pen from the same
height on the Moon. Choosing an answer does not reveal its correction. The explicit submission shows
educational feedback for the chosen choice, a precise historical observation, the NASA frame and
links to the video and sources.

The retry option restarts only the local state of activity. There is no connection to the store,
navigation, audio, 3D, badges or chapter completion. There is no new mandatory requirement to
continue a mission.

`EvidencePredictionActivity` receives a typed manifest `EvidencePrediction`. The Apollo 15 case
lives in a separate module and reuses the already verified resource `apollo15StoryMedia.hammer` and
the `StoryMedia` component, without editing any. `reviewPrediction` rejects empty or unknown
choices.

## Demo and future integration

From this worktree:

```powershell
node --input-type=module -e "import {createServer} from 'vite'; const s=await createServer({cacheDir:'dist/.vite-workstream-c',server:{host:'127.0.0.1',port:5183,strictPort:true}}); await s.listen(); s.printUrls();"
```

Open `http://127.0.0.1:5183/activity-preview.html`. It is a separate page for review; not a new
product path or a reading of the existing progress. The normal build of the application does not
post this additional entry. The development cache is left in this worktree, within `dist`; it is not
written in the `node_modules` shared by Junction. Do not use the default dev command in this
isolated environment, because Vite can write your dependencies cache there.

The independent build was also verified with Vite, without editing its configuration:

```powershell
node --input-type=module -e "import {build} from 'vite'; import {resolve} from 'node:path'; await build({build:{outDir:'dist-activity-preview',rollupOptions:{input:resolve('activity-preview.html')}}});"
```

Your temporary output `dist-activity-preview` was removed after checking the build; it can be
recreated with the command. The demo package has JavaScript 151,55 kB (49,36 kB gzip) and does not
load Three.js. Reuses the existing general CSS; its size could be reduced by integrating the
activity into the final architecture.

After approving front C, the owner of the story can import:

```tsx
import EvidencePredictionActivity from './activities/EvidencePredictionActivity'
import { apollo15HammerFeatherPrediction } from '../../features/storytelling/activities/apollo15Prediction'

<EvidencePredictionActivity activity={apollo15HammerFeatherPrediction} />
```

No callback to mark progress. Any future telemetry or completion link requires an explicit decision;
it is not necessary to use the activity. Changing `activity.id` starts a new attempt, so several
activities can reuse the component without sharing choices. Radio groups have independent React
identifiers even if two instances use the same case.

## Scientific evidence and limits

Source verification completed.

- [NASA Science: The Apollo 15 Hammer-Feather
  Drop](https://science.nasa.gov/resource/the-apollo-15-hammer-feather-drop/): explanation, original
  video and observation of the fall during the last EVA.
- [NASA: Apollo 15 on the Moon at
  Hadley-Apennine](https://www.nasa.gov/history/50-years-ago-apollo-15-on-the-moon-at-hadley-apennine/):
  date of 2 August 1971 and frame identification S71-43788.

The accuracy of the report is preserved: the objects arrived together within the accuracy of the
release and observation, without affirming a measurement of perfect simultaneity. Feedback
distinguishes gravity and resistance from the air. Activity is not presented as a repair, a new
achievement of the rover or a historical simulation.

Reused resource: `public/images/apollo15-story/hammer.jpg`, S71-43788, **real TV photo**, NASA
credit. It is not an independent photograph, a capture of the landing or a reconstruction generated.
The text makes it clear that an isolated frame does not set down down times; the video and NASA
explanation allow to examine that result. Alt text, credit, original URL and source of the existing
manifest are preserved. No images were downloaded or modified.

They apply the [NASA Images and Media
Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/): educational/informational use
factual, NASA credit, without suggesting institutional support, with restrictions on the rights of
relevant third parties and identifiable persons.

## Accessibility and presentation

- Native radios with legend, wide labels, a selection per group and form shipment. Tab, arrows and
  native browser activation are preserved.
- The explanation gets focus when sending. The retry returns the focus to the question. There is no
  duplicate live region or initial focus theft, also under StrintMode.
- Controls with minimum 44 px, options of at least 52 px, visible focus, text setting and mobile
  layout. Credits and descriptions remain visible on mobile.
- No animation or automatic playback; `StoryMedia` is used with disabled motion. Image error retains
  the source and retry button.

## Accurate new files

1. `activity-preview.html`
2. `src/components/storytelling/activities/ActivityPreview.tsx`
3. `src/components/storytelling/activities/ActivityPreview.module.css`
4. `src/components/storytelling/activities/EvidencePredictionActivity.tsx`
5. `src/components/storytelling/activities/EvidencePredictionActivity.module.css`
6. `src/features/storytelling/activities/evidencePrediction.ts`
7. `src/features/storytelling/activities/apollo15Prediction.ts`
8. `tests/workstream-c-activity.test.mjs`
9. `docs/workstream-c-activity.md`

No modifications of existing files. The end-of-line normalization of the original script performed
during the isolation retains the same Git hash of HEAD.

## Validation executed

- `node --test tests/workstream-c-activity.test.mjs`: **8/8**.
- `node --test tests/*.test.mjs`: **173/173**, baseline 165 plus 8 new.
- TypeScript `tsc -p tsconfig.app.json --noEmit --pretty false`: passed.
- `npm.cmd run build`: correct; the existing warning of 823.49 kB, which is foreign to this
  activity, remains.
- Build Vite independent from preview HTML: correct, 34 modules.
- `git diff --check`: correct. All functional changes are new files.
- Smoke HTTP with `createServer`, port 5183 and local worktree cache: `/activity-preview.html`
  returned **200** (`text/html`, 685 bytes),
  `/src/components/storytelling/activities/ActivityPreview.tsx` returned **200** (`text/javascript`,
  5.351 bytes) and `/images/apollo15-story/hammer.jpg` returned **200** (`image/jpeg`, 65.905
  bytes). The server was closed in `finally` and the process ended with code 0 (`SERVER_CLOSED`).

The first attempt of HTTP smoke served all three resources with 200, but the immediate shutdown
cancelled Vite's pre-optimization and ended with code 1. The repetition waited for the processing of
requests and scanning of dependencies before closing, and ended correctly. No source code was
altered for that check. Serve HTML/TSX/image by HTTP does not demonstrate DOM execution or visual
revision.

The tests exercise selection, rejection of invalid choices, three results, pre-/post-shipment
feedback, retry, focus, StrictMode, two radio groups, change of activity, image failure/reintendence
and absence of progress writing. Fixtures do not substitute for real-life tests of keyboard, screen
reader or design.

Browser pending: check 360×800, 390×844, 439×591, tablet and desktop; Tab/arrows/Space/Enter; zoom
200 %; focus on sending and retrying; screen reader; blocked image and reduced movement. There is
also the final pedagogical review of Haroon and choose in which chapter to insert the activity,
without making it mandatory.
