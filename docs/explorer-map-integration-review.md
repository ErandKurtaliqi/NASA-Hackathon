# Explorer 2D map integration review

Scope: frontend presentation on `feat/planetary-explorer-redesign`. Existing
uncommitted stage-1 work was preserved. No GIS source, scientific data, imagery,
projection, homepage, route, story, progress store, or dependency was changed.

## Findings before editing

### Confirmed: metadata overlaps scientific popups

`src/index.css` positions `.map-data-panel` and `.map-service-state` absolutely
with `z-index: 999`. They share the map's visual area. Leaflet's installed CSS
places its map pane at 400 and popup pane at 700; the popup is inside the
transformed map-pane stacking context. The external panels can therefore cover
the popup even when it opens normally. Raising a popup's z-index alone would not
reliably resolve the ancestor stacking context.

The previous explorer adapter also hid metadata at <=1100px, while the global
stylesheet hid it at <=680px. This avoided some collisions by removing information
instead of providing a consistent hierarchy. Machine details already live outside
the map, in normal document flow; they were not the source of this collision.

### Confirmed GIS defects; screenshot-specific gray cause is unconfirmed

`PlanetMap.tsx` mounts two opaque `ImageOverlay` fallback JPEGs without specifying
a pane. In installed Leaflet 1.9.4:

- `Layer.js` defaults to `overlayPane`; `ImageOverlay.js` defaults to opacity 1.
- `GridLayer.js` defaults the WMTS `TileLayer` to `tilePane`.
- `leaflet.css` orders `overlayPane` at 400 above `tilePane` at 200.

Thus the fallback images cover successfully loaded NASA tiles. This is a GIS
layer-ordering defect, independent of NASA availability. Both Moon fallback
images decode successfully as 256x256 JPEGs with varying pixel values; they are
not empty gray assets. They are very low resolution when magnified: the existing
initial Apollo 11 focus flies to zoom 6, where a fallback pixel covers roughly
64 map pixels with the current CRS. A nearly uniform gray patch from the
magnified lunar fallback is a plausible explanation for the reported screenshot,
but it has not been reproduced in a browser.

Other confirmed behavior: initial focus animates for 1.35s and tiles use
`updateWhenIdle` / `updateWhenZooming={false}`. The loading period can differ from
the settled view. The original wrapper already specified nonzero map heights;
source inspection does not establish a collapsed CSS container as the cause.

The reported screenshot cannot establish a network failure, CORS problem,
incomplete tile loading, or stale Leaflet size. No browser network trace of that
incident is available. Local asset HTTP checks do not test the remote WMTS
service. No NASA outage or scientific data error is asserted here.

### Confirmed: the imagery badge can misreport success

`PlanetMap.tsx` sets fallback on `tileerror`, then unconditionally sets live on
`load`. Leaflet's `GridLayer._tileReady` records errored requests as finished and
fires `load` when no requests remain. Therefore a completed batch containing
errors can overwrite the fallback state with `LIVE NASA IMAGERY`. This protected
logic was not changed. The badge is not evidence that imagery loaded correctly.

### Confirmed: selection surfaces have different responsibilities

Machine selection updates its mission/story panel. Scientific location selection
updates the atlas and passes `focusId` to the map. Native marker clicks open their
popup and retain progress recording, but the current map interface has no
selection callback to synchronize the external atlas. No machine-to-coordinate
relationship is inferred or fabricated by this correction.

## Frontend correction

- `src/components/explorer/ScientificMap.module.css`: scoped presentation adapter
  for the existing map DOM. Metadata and status occupy normal-flow rows below a
  separately sized Leaflet viewport. Both remain visible at all breakpoints.
- The map keeps an explicit responsive height, including space while lazy loading
  or displaying an error. The parent no longer fixes the combined height of the
  map plus its metadata. Native fullscreen retains metadata in flow and permits
  vertical scrolling on short screens.
- Popup content has a bounded, scrollable height, responsive width, larger body
  text, and 44px source-link / close targets. Native zoom controls keep 44px targets.
- Mobile interaction gating applies only to the Leaflet viewport and all its
  descendants, including markers with their own explicit pointer events. Metadata
  links remain available while ordinary gestures scroll the page. `Interact with
  map` / `Done`, keyboard access, native controls, and existing handlers remain.
- `PlanetViewport.tsx`: only the map wrapper class and CSS import changed.
- `ExplorerPage.module.css`: only map-specific declarations/adapters changed;
  the shared globe declarations retain the same effective values. The 3D branch
  and its visual layout were not changed.

No Leaflet panes were reordered in CSS, no DOM nodes were moved imperatively,
and no private map fields, synthetic resize events, replacement data, or fake
loading indicators were introduced.

## Exact GIS coordination needed

1. **Fallback ordering (confirmed defect):** in `PlanetMap.tsx`, put the fallback
   `ImageOverlay`s in a dedicated pane below `tilePane`, for example a named
   fallback pane at z-index 100. Keep the existing imagery, geographic bounds,
   coordinates, CRS and WMTS source. This should expose successfully loaded tiles
   while retaining the fallback underneath failed/missing tiles. This internal
   change is deliberately not implemented in the frontend adapter.
2. **Reliable imagery state (confirmed defect):** count pending, successful and
   failed tile requests per active view; track fallback image load/error as well.
   Do not interpret Leaflet `load` as unconditional success. A proposed additive
   public callback is `onImageryStateChange({ status, pending, loaded, failed,
   fallbackReady })`, with statuses such as loading/live/partial/fallback/error.
   It would allow the frontend to report a gray/unavailable map accurately without
   reading internal DOM classes or guessing from elapsed time.
3. **Container resize (defensive improvement, not a proven screenshot cause):**
   Leaflet tracks window resize, but this map has no observer for changes to its
   own container. GIS can use `ResizeObserver` inside the map and call its public
   `invalidateSize({ pan: false, animate: false })` after real size changes,
   including fullscreen. No private Leaflet handle should be exposed to frontend.
4. **Popup space around native controls:** consider an additive `popupLayout`
   presentation prop forwarding supported max-height and auto-pan-padding options
   to `Popup`. This would reserve the native control rail explicitly. The frontend
   did not alter geographic layers or native control behavior to force this.
5. **Selection synchronization:** an optional `onLocationSelect(locationId)`
   callback can synchronize the external atlas with native marker clicks. It
   should emit existing validated IDs and preserve current progress recording.

## Validation and limits

- `npm.cmd run build`: passed, including TypeScript. Vite retains the existing
  warning for the approximately 823 kB shared React Three Fiber chunk.
- In-memory PostCSS cascade checks: 360x800, 390x844, 439x591, 1280x720. Checked
  metadata/status normal flow and visibility, nonzero responsive canvas height,
  bounded popup scrolling, 44px controls, descendant touch gating, and absence of
  scientific pane-order overrides. These are source/cascade checks, not measured
  browser layouts.
- Production CSS checked for both normal-flow metadata rows and reserved loading
  height, verifying that the module rules survive the production build.
- In-memory React render checks: both explorer routes, existing scientific
  locations, real story links, and propagation of `planet` / `focusId` plus the
  interaction toggle. GIS views were stubbed only for these frontend contract
  tests; those checks do not validate Leaflet rendering or NASA requests.
- Temporary production preview: HTTP 200 for `/explore/mars`, `/explore/moon`
  and all four fallback JPEGs, with the expected content types. The owned preview
  process was stopped after verification. Existing user servers were not stopped.
- Baseline hashes confirmed all pre-existing source, assets, scientific data,
  homepage, store, dependencies and stage-1 documentation remained identical
  except the two intended integration files. Reversing only the intended map
  selector/wrapper edits reproduced their baseline hashes, protecting the 3D
  branch and unrelated CSS. `git diff --check` passed.
- The browser automation inventory exposed no controllable browser. Visual
  screenshot comparison, physical touch gestures and live NASA loading remain
  manual checks; the gray screenshot is not claimed fixed.

Manual checks after the frontend correction and subsequent GIS fix: open popups
near each map edge; follow sources using Tab/Enter and close popups; confirm
metadata does not cover the location; test page scrolling, map activation,
drag/pinch, Done and both fullscreen controls at the listed sizes; switch planets;
test slow/failed NASA requests with and without cached fallback assets; verify
real tiles become visible above the fallback and the badge reflects failures;
confirm saved progress and existing story entry/resume behavior.

No commit, push or merge was performed.
