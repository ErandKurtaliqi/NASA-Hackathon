# Planetary explorer — frontend stage 1

The existing `/explore/mars` and `/explore/moon` routes now use the shared
`src/pages/ExplorerPage.tsx` and its isolated CSS Module. The approved homepage
and its assets are reused without modifications. All user-facing copy is English.

## Frontend behavior

- Machine lists are filtered directly from `hardware` in `src/data.ts`.
- Selecting a machine updates its profile without changing geographic selection.
- `getStoryEntry` resolves an existing story by `machineId` and planet. Only
  Perseverance and the Apollo 17 LRV currently receive story links. Continuation
  uses the existing browser progress and clamps the chapter to the actual schema.
- Other machines expose their existing purpose, dates, instruments and source;
  no additional story, mission fact, geographic coordinate, or model was created.
- The scientific atlas retains all six Mars and five Moon locations, including
  descriptions, coordinates, precision, scientific sources and dataset metadata.
- Explicit selection of a scientific location records its existing progress ID.
  Machine selection and generic globe interactions do not fabricate location progress.
- `View on 2D map` passes the selected location's ID to the existing map's
  `focusId` interface and moves focus to the viewport.
- Native map marker clicks retain their original popup and progress behavior.
- Existing story pages and their return-to-hardware behavior are unchanged.
- Only one heavy planetary view is mounted at a time. Globe rendering is
  suspended by unmounting when hidden, offscreen, or ambient motion is paused.
- In reduced-motion mode, a static preview replaces automatic globe rotation.
  The map and scientific atlas remain accessible.
- On mobile, explicit `Rotate & zoom` / `Interact with map` controls enable native
  gestures; `Done` restores page scrolling. The default touch surface does not
  consume gestures. Native zoom/reset controls and fullscreen remain accessible.

Machine list artwork uses the existing Apollo rover photograph where available,
and clearly illustrative Lucide glyphs elsewhere. No fake photographs or models
were added. The astronaut and monogram are the same provisional assets documented
for the approved homepage; the background is procedural CSS.

## GIS / 3D integration points

`PlanetViewport.tsx` consumes only existing public interfaces:

- `PlanetScene`: `planet` (full view, with native zoom/reset controls).
- `PlanetMap`: `planet` and `focusId`.

No fixed HTML geographic overlays or simulated pins are present. Machine
selection intentionally does not rotate or focus the globe. Scientific data,
textures, projections, coordinates, camera implementation and 3D model internals
remain owned by GIS / 3D.

Future work to agree with that developer:

1. Validated machine-to-location identifiers and their location semantics.
2. Geographic globe markers, surface labels, occlusion and selection callbacks.
3. Public globe focus and map selection callbacks. Currently a native map click
   opens its popup but cannot synchronize the external atlas selection.
4. A transparent/cinematic presentation variant and approved planet textures /
   lighting. Mars still uses the existing MOLA color hillshade dataset.
5. Public active/reduced-motion/readiness/error interfaces, allowing scenes to
   pause without remounting or repeating texture requests. Native map `flyTo`
   animations currently follow the unchanged GIS implementation.

No changes were made to `PlanetScene.tsx`, `PlanetMap.tsx`, `planetaryConfig.ts`,
`RoverScene.tsx`, other model scenes, `data.ts`, `types.ts`, `store.ts`, stories,
homepage components, global styles, dependencies, or scientific assets.

## Validation for this stage

- Confirmed a clean working tree on `feat/planetary-explorer-redesign` before
  editing. No branch, commit, push or merge was created by this implementation.
- `npm.cmd run build` passed after integration. Vite retains the warning about
  its shared 823 kB Three.js / React Three Fiber chunk; no dependency was added.
- In-memory React render checks verified both explorer routes, one page heading,
  the appropriate catalog (three Mars machines / two Moon machines), all eleven
  scientific locations, map access, dataset metadata and existing navigation.
- Story helper checks verified that only the two existing stories receive links,
  saved chapter continuation is resolved correctly, and invalid chapter numbers
  are constrained to the existing five-chapter schema. Server-rendered output
  uses initial progress; saved progress was tested separately as helper input.
- A temporary production preview returned HTTP 200 for both explorer URLs and
  the reused brand, astronaut and NASA preview assets. The owned preview server
  was stopped after verification.
- CSS cascade checks covered 360x800, 390x844, 439x591 and 1280x720, including
  responsive ordering, tap targets, interaction gating and CSS class references.
- Hashes confirmed protected files and the approved homepage remained identical;
  the other existing page handlers and route paths were also compared unchanged.
- Visual browser and physical touch/GPU checks remain pending: the available
  Computer Use inventory exposed no controllable browser. CSS / React render
  checks do not replace a visual or touch-device review.
