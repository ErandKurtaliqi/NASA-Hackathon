# Final frontend popup positioning and accessibility review

Scope: the shared Mars/Moon 2D presentation adapter on
`feat/planetary-explorer-redesign`. The user's latest manual review confirms
metadata below the map and visible lunar imagery. This review does not change
imagery, geographic layers, scientific records, or the earlier GIS findings.

## Confirmed behavior and limitations

- Both planets use the same `PlanetMap` popup markup and frontend CSS adapter.
- Protected `PlanetMap.tsx` uses `<Popup>` without layout options. Installed
  Leaflet defaults to `autoPan: true`, 5px auto-pan padding, and
  `keepInView: false`.
- Existing CSS bounded popup width against the browser viewport, which is not
  necessarily the available map width. Its footprint did not reserve the native
  right-hand control rail. A popup fitted to the right edge could therefore be
  painted beneath those controls. These are confirmed layout weaknesses, not a
  diagnosis of any particular screenshot.
- Native auto-pan fits a popup when opened. A capture taken during that movement
  can show a transient position. `keepInView: false` also allows subsequent map
  dragging to move an open popup out of view. CSS alone cannot change that
  lifecycle without overriding geographic positioning.
- The popup content was already vertically scrollable with 44px source and close
  targets. Those behaviors are retained. Native Leaflet provides marker keyboard
  activation, a labelled Close popup control, and Escape handling; these were
  inspected in installed source, not verified with a physical keyboard/browser.

No new screenshots were attached to this request. Whether their apparent cutoff
is screenshot cropping, mid-animation state, or persistent clipping cannot be
classified from source alone. A close shadow or tip at an edge is not sufficient
evidence that the text/source/close control is inaccessible.

## Frontend changes

Only `src/components/explorer/ScientificMap.module.css` changed at runtime:

1. The map shell is an inline-size query container. Popup content is bounded by
   the map's actual width using `cqw`, including native map fullscreen. A `vw`
   fallback covers the existing responsive layouts in browsers without container
   query units. Text retains its 250px maximum width.
2. A transparent 64px right gutter is part of the popup's measured box. Leaflet's
   existing auto-pan reads its full `offsetWidth`, so it fits the painted card
   clear of the native 44px control rail. The close button is inset by the same
   gutter and remains inside the card. Native left/bottom/transform positioning
   and the geographic tip are not overridden. Controls are not hidden or moved.
3. Source-link focus rings are inset to avoid clipping in the scrollable content;
   DIV-based map markers now receive a visible keyboard focus ring. The close
   button retains a 44px target with its focus ring inside the target.
4. Popup content keeps its bounded scroll area, allows vertical touch scrolling,
   contains scroll chaining, and supplies scroll padding for focused content.
   Existing `Interact with map` / `Done` gating and metadata links are unchanged.

`tests/explorer-popup-layout.test.mjs` adds regression coverage using existing
PostCSS/TypeScript dev dependencies and Node's built-in test runner. No dependency
or package script was added. It reads the installed Leaflet auto-pan method only
in offline tests; application code does not access private Leaflet state.

## GIS coordination required for a complete lifecycle guarantee

These changes must be made by the GIS owner, not in this frontend task:

- Expose an additive `popupLayout` presentation option on `PlanetMap`, forwarding
  `keepInView`, `maxHeight`, and `autoPanPaddingTopLeft` /
  `autoPanPaddingBottomRight` to the native `Popup`. Consider `keepInView: true`
  and explicit control-rail padding to maintain visibility after map movement.
  Keep geographic anchors, coordinates, selection and progress events unchanged.
  When adopting explicit GIS padding, replace the CSS gutter with an agreed
  sizing contract; do not blindly apply both reservations.
- Observe actual map-container size changes, including fullscreen and orientation.
  Use public `map.invalidateSize({ pan: false, animate: false })` and refresh the
  open popup through its public `update()` method after layout settles. Leaflet
  caches popup width during layout; changing CSS dimensions alone does not
  guarantee recomputation of that cache or a new auto-pan after resizing.
- Test popup auto-pan together with the current `maxBounds`, especially in the
  global overview at low zoom. Leaflet enforces those bounds again on `moveend`,
  which can counteract the popup's requested pan. This interaction is confirmed
  in installed source; its involvement in the reported screenshots is unconfirmed.
  GIS must agree on a bounds-aware presentation strategy without changing the
  scientific coordinates or projection. Enabling `keepInView` alone is not a
  sufficient fix if two movement constraints conflict.
- Give each DIV marker an accessible name from its existing scientific record
  (for example the supported Marker `title`, or an explicit `aria-label` on its
  element via the public marker API). Current icon HTML contains no text, and
  `PlanetMap` does not supply a marker title. CSS can show focus but cannot provide
  its scientific name to assistive technology.
- Provide a named, keyboard-focusable popup scroll region so users can reach and
  scroll its full content without relying solely on the source link. Preserve
  Leaflet's existing close behavior and avoid an unnecessary modal focus trap.

The frontend cannot promise that an open popup stays on screen after arbitrary
dragging, container resizing or fullscreen changes with the current protected
interface (`planet` / `focusId` only). Existing scientific information remains
available in the separate accessible atlas below the map.

## Verification

- `node --test tests/explorer-popup-layout.test.mjs`: 5 tests passed. Geometry
  fixtures exercise nine edge/center positions at 320x568, 360x800, 390x844,
  439x591, 820x640, 1024x768, 1280x720, 1440x900 and 1920x1080, with normal and
  fullscreen boxes, and with/without container-query support for both planets.
  The 648 fixtures check the complete auto-pan footprint, painted card/control
  separation, and unchanged native tip alignment. They model box dimensions and
  completed auto-pan; they do not measure browser text, GPU output, animation,
  constrained geographic panning, or user gestures.
- Accessibility/style checks cover scroll containment, focus rings, 44px close
  targets, in-flow metadata, scope isolation and unchanged scientific pane order.
- `npm.cmd run build`: passed, including TypeScript. The existing approximately
  823 kB React Three Fiber chunk warning remains.
- Baseline hashes confirm every pre-existing file except the intended map CSS is
  identical, including `PlanetMap.tsx`, `PlanetScene.tsx`, `RoverScene.tsx`,
  `planetaryConfig.ts`, data, routes, stories, progress, homepage and 3D frontend.
- `git diff --check`: passed. The browser connector returned no applications or
  browser tabs, so visual and physical keyboard/touch checks remain manual.

## Manual acceptance / screenshot classification

1. Show the entire map rectangle and wait for map movement to finish before
   capturing each edge popup. If the screenshot itself cuts off the map boundary,
   repeat with the full map visible before classifying it as map clipping.
2. With the map fully visible and idle, check the painted popup body, Close popup,
   all text via internal scrolling, and the source link against the map's visible
   rectangle. Persistent inaccessible content is a real defect. Shadows extending
   outside the card are not by themselves inaccessible content.
3. For Mars and Moon, select markers near all edges, use Tab/Enter and Escape,
   scroll the popup to its source, and check zoom/reset controls and focus rings.
4. On mobile, test ordinary page scrolling, Interact with map, popup scrolling,
   drag/pinch and Done. Test browser zoom, orientation changes, both fullscreen
   controls, resizing with an already-open popup, and reduced-motion preferences.
5. Recheck the lifecycle cases after GIS implements the proposed options; do not
   treat the geometry fixtures as a guarantee for those currently unsupported
   cases. Verify existing story navigation and persisted progress remain intact.

No commit, push or merge was performed.
