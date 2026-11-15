# Workstream D — Map contract and quality audit

Read-only review of `8120d9e`. No change in application code, GIS/3D, coordinates, textures or
progress scheme. This document is a proposal for coordination, not a contract approved by Erand.

## Current interfaces and responsibilities

| File | Verified behavior |
| --- | --- |
| `src/types.ts:19` | `MissionMarker` has ID, planet, coordinates, accuracy, source and `storyChapter?`; it has no hardware/story ID. |
| `src/data.ts:45` | 11 registered locations, including `perseverance-landing`, `jezero`, and `apollo-17`. Apollo 15 has no pin. |
| `src/data.ts:58` | Hardware from Perseverance (`perseverance`), Apollo 17 (`lrv`) and Apollo 15 (`lrv-1`) registered; other teams lack published history. |
| `src/features/explorer/storyEntry.ts:6` | `getStoryEntry` resolves by explicit hardware + planet identity; returns existing path and reboots bounded to 1–5. It does not deduce name identity. |
| `src/pages/ExplorerPage.tsx:25` | `machineId` and `locationId` are different states. Choosing location does not automatically change the computer. |
| `src/pages/ExplorerPage.tsx:46` | `selectLocation` validates belonging to the planet and records exploration. `viewMap` changes view and focuses the viewer. |
| `src/components/explorer/PlanetViewport.tsx:23` | It consumes `focusId` and passes that data to `PlanetMap`; it does not receive selection events from the map or the balloon. |
| `src/components/PlanetMap.tsx:50` | Public API `{ planet, focusId? }`. The marker click records `explore(marker.id)` and opens native popup. It does not communicate selection to the external atlas. |
| `src/components/explorer/MachineDetails.tsx:9` | It already offers history/resumption link through `getStoryEntry` and progress of the correct mission. |
| `src/App.tsx:60` | A dynamic route `/story/:storyId/:chapter` covers all three missions. No other route is needed for maps. |
| `src/features/storytelling/pilot.ts:15` | Validation of history and chapter before accessing arrays. The father of history retains the blockade by prerequisites. |

`storyChapter` isolated does not identify a mission or segment. It should not be used as URL, nor
should its historical numbers be assumed to reflect the new narrative. Nor should stories be derived
by close coordinates, names or categories.

## Proposed link table — required approval

| Existing location | Hardware | Registered story | Recommended entry point |
| --- | --- | --- | --- |
| `perseverance-landing` / Mars | `perseverance` | `follow-perseverance` | Start or restart validated. Journey context only if unlocked and approved. |
| `jezero` / Mars | `perseverance` | `follow-perseverance` | Same identity, but scientific region; not present it as the exact co-ordinate of the rover. |
| `apollo-17` / Moon | `lrv` | `apollo-17-rover` | Start or restart validated. |
| Apollo 15 | `lrv-1` | `apollo-15-rover` | No pin currently available. Erand must provide/confirm location, provenance, coordinates and accuracy ID. |
| Curiosity, Ingenuity, Other Sites and Geology | No applicable registered history | None | Maintain profile, evidence and source; not make links. |

The proposed relationship of pins with stories is different from the already confirmed
hardware/stories identifiers. The first one is missing; the second ones are unchanged.

## Suggested additive contract for Erand

```ts
type LocationSelection = {
  planet: 'mars' | 'moon'
  locationId: string // Registered GIS ID. The UI does not provide coordinates.
  origin: 'pointer' | 'keyboard'
}

// Optional extension. Existing calls continue to work without a callback.
type PlanetMapSelectionProps = {
  onLocationSelect?: (selection: LocationSelection) => void
}
```

Responsibility GIS: Issue events from native markers for mouse, keyboard and touch; maintain your
popups, coordinates, accuracy and scanning record; omit obsolete events after planet
change/disassembly. The equivalent interface of the balloon requires separate revision; pins must
not be simulated from the frontend. No Leaflet, Esri or Three instance is displayed nor is your
private DOM inspected.

Frontend responsibility: validate the event against `markers` from the same planet, update
atlas/selection and consult an explicit log of approved links. Solve hardware/story using
`getStoryEntry`; use the current path and its saves. Do not complete chapters, grant badges or
modify progress by opening a story.

Recommended UX: the first click selects and displays context; an explicit link "Start/Continue
story" opens the story. Avoid unexpected page changes when exploring a keyboard map. If immediate
navigation is preferred, Haroon and Erand must agree to it before implementing. A location without
history retains its source.

A future chapter/segment context would be frontend and optional:

```ts
type StoryLocationBinding = {
  planet: 'mars' | 'moon'
  locationId: string
  machineId: string
  chapterId?: 'meet' | 'journey' | 'challenges' | 'legacy' | 'quiz'
  segmentId?: string // Pending a stable registry. Avoid deriving IDs from titles or indexes.
}
```

Do not open blocked chapters or mark prerequisites as performed. Entry by context should degrade at
allowed startup/resumption. `lastChapter` is a restart track; the history guard remains unlocking
authority.

The return to the map can retain planet/location and focus target by means of router transient
status, without new fields in `beyond-earth-progress`. Today the browser restarts selection when
entering: restoration requires a later frontend change and testing, does not exist yet. Validate the
return ID and have a focus fallback if it no longer exists; view fullscreen output before browsing.

## What can be prepared independently

- Evidence of a pure resolution on approved links, unknown IDs and planet.
- CTA/resumption design, no history messages and return focus contract.
- Stable segment registration and validation of unlocked destinations.
- QA of stories, evidence, audio and progress, without touching maps.

None of these adapters were implemented here: the D front is read-only. They require GIS
coordination native callback, new pins, geographic binding, balloon focus, projections, precision
and any internal loading solution.

## Defects verified against risks to be validated

| Priority / status | Evidence of code | Proposed minimum consequence/correction |
| --- | --- | --- |
| High, confirmed | `PlanetMap.tsx:50–107`: no selection callback; `focusId` only enter the map. | A click does not synchronize the atlas or resolve history. Optional public extension, reviewed by Erand; no patch applied. |
| High, confirmed | `data.ts:45–56`: no Apollo 15 location log. | Do not implement invented pin/path. Expect scientific registration of the owner GIS. |
| Medium, confirmed | `PlanetMap.tsx`: opaque fallback in `overlayPane` by default, above tiles; `tileerror` can be overwritten by `load`. Previous detail in `docs/explorer-map-integration-review.md`. | LIVE state does not prove success and fallback can hide tiles. Existing GIS Incidence; conserve scientific/CRS and correct internally with coordination. NASA drop is not attributed. |
| Medium, confirmed | `MachineStoryPage.tsx:1–3` imports Fiber and Drei statically even when Apollo 15 renders without a canvas. Baseline minified chunks: Fiber 823.49 kB and the story ~103.86 kB. | The 2D experience prevents active WebGL, but does not eliminate the cost of downloading JS Three shared. Separate dynamic 3D chapters by import in an approved performance phase. |
| Medium, confirmed | `Apollo15ScrollStory.tsx:26`, with parent keyed per chapter, restart Sound on and autoAdvance when mounting each chapter. | Temporary settings do not survive the chapter; there is no autoplay. Agree to preferences range and, if desired, keep them in session shell without changing schema. |
| Medium, confirmed | `StoryMedia.tsx` does not use `loading="lazy"`; on mobile evidence of the four steps is rendered. | The 19 audios (preload none) are not loaded, but images of later steps can be requested. Optional delayed load; measure before asserting a network regression. |
| Medium, visual risk pending | `Apollo15ScrollStory.module.css`: sticky controls; 300/240px focus margins. `findReadingStep` uses 45% of the viewport and does not measure the actual height of controls. | With zoom, long text or 439×591, check if the active line is covered. Measurement with dynamic ResizeObserver/offset only if played. |
| Average, risk pending | Scroll selection can change/recreate a track just when crossing the line between cards. | Confirm that the user understands why he pauses, that there are no layout oscillations and that Replay/Resume remain accessible; there is no fine synchronization approved yet. |
| Average, confirmed on basis | Apollo 17 Ancient Journey uses 3.6s interval and FlightScene usesFrame; it does not depend on reduced motion. | B proposes to replace only its presentation with 2D; check its result without changing Perseverance. |
| Mean, human review pending | Recording of 19 pending times; original script sources include external context references. | Do not activate quaes by estimation or automatically display any script URLs as evidence. Use verified NASA manifests and audible revision. |
| Low, visual risk pending | Grid with minmax and rearrangement at 1100/700px; some sticky columns are deactivated under 800px high. | Check 360×800, 390×844, 439×591, tablet, desktop and zoom200%; do not declare overflow without browser measurement. |

Size measurements come from the build, not a mobile CPU/network profile. No capture/rendering of
Chrome was done in this audit.

## Acceptance criteria before integrating maps

1. Known pin: correct selection and CTA; unknown/crossing planet: no false link. `lrv` and `lrv-1`
   remain isolated. The Apollo 15 pin requires source.
2. Mouse/Enter/touch retain popups and record scanning without completing chapters.
3. New, partially saved, legacy and completed history: valid path and saves. Back to browser retains
   context/focus by contract approved.
4. Rejected save and Retry saving still work; navigation does not imply a confirmation of
   persistence. Keys/schema/version/badges are not altered.
5. Audio stops when opening/changing/exiting; it does not automatically play from pins.
6. Reduced motion does not activate unsolicited flights/animations. Touch block of the map allows
   reading/scrolling outside explicit interaction.
7. Map/callback tests: change of planet, late callbacks, fullscreen, failed images/tiles, offline
   and always accessible sources.
8. Regression of 15 chapters, perhaps/reintend/rewards and homepage/narration/captions.

## Baseline and isolation

- Four worktrees decoupled from the review.
- Existing dependencies via Junction `node_modules`, read only; each worktree has source files,
  `dist` and own build caches. No npm install.
- Demos must use Vite `createServer` with `cacheDir` explicit local (e.g.
  `dist/.vite-workstream-c`), or a static server for the HTML reviewer. The default Vite dev command
  uses `node_modules/.vite`: do not run it simultaneously over the shared Junction. Builds and tests
  do not use that dev preoptimization.
- The first Windows checkout converted the original script to CRLF and activated a binary text
  comparison bug. Exact bytes of the HEAD blob were replaced in that file of each worktree, without
  functional difference or Git; MP3 was not played.
- Base suite checked after it: **165/165**, exit code 0.
- Production Build and TypeScript correct; the Fiber warning of 823.49 kB remains correct. `git diff --check` passed. No files were staged and no code changes were applied.
- This workstream adds only this document; code is not integrated across workstreams.
- Before integrating A/B/C, you need to review differences by ownership, complete tests in an
  approved review environment and explicit approval. Do not add independent worktrees results as if
  they were an integrated suite.
