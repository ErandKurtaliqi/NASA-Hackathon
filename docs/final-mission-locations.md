# Final Mission Locations — Planet Explorer

Implemented 2026-11-14 in `ErandKurtaliqi/NASA-Hackathon`.
Base: `main` at `a912a7e7ef646a43cdd81ad16ada7af243dde494`.
Review branch: `feat/final-mission-locations`.

## Authoritative inventory

`src/features/explorer/storyMapLocations.ts` is the single typed inventory for
the lower list, details, map selection and final-position pins. Names, places
and coordinate strings reproduce Haroon's final approved inventory exactly.
Numerical values retain directional signs; text preserves trailing zeroes.

| Planet | Mission | Location supplied | Coordinates supplied |
| --- | --- | --- | --- |
| Moon | Apollo 11 LRRR | Mare Tranquillitatis, Sea of Tranquility | 0.67345° N, 23.47307° E |
| Moon | Apollo 15 LRV | Hadley-Apennine Region, Hadley Rille | 26.13110° N, 3.63972° E |
| Moon | Apollo 16 LRV | Descartes Highlands, near Orion Lunar Module | 8.97292° S, 15.50279° E |
| Moon | Apollo 17 LRV | Taurus-Littrow Valley, near Challenger Lunar Module | 20.19043° N, 30.77726° E |
| Mars | Opportunity Rover | Perseverance Valley, Endeavour Crater | Not provided |
| Mars | Sojourner Rover | Ares Vallis, Mars Pathfinder Landing Site | Not provided |
| Mars | Viking 1 Lander | Chryse Planitia | 22.483° N, 47.968° W |
| Mars | Ingenuity Helicopter | Valinor Hills, Jezero Crater | Not provided |

Apollo 11 is a stationary reflector, never a parked rover. The Apollo decimal
positions are the supplied project inventory; general NASA mission pages must
not be presented as independent verification of these particular decimal pairs
or their implied measurement accuracy.

## Official context references

- [NASA Apollo 11](https://www.nasa.gov/mission/apollo-11/).
- [NASA Apollo 15](https://www.nasa.gov/mission/apollo-15/).
- [NASA Apollo 16](https://www.nasa.gov/mission/apollo-16/).
- [NASA Apollo 17](https://www.nasa.gov/mission/apollo-17/).
- [NASA Opportunity](https://science.nasa.gov/mission/mer-opportunity/).
- [NASA Mars Pathfinder](https://science.nasa.gov/mission/mars-pathfinder/).
- [NASA NTRS revised Viking 1 location](https://ntrs.nasa.gov/citations/19810041868)
  explicitly reports 22.483 degrees north and 47.968 degrees west.
- [NASA Ingenuity at Valinor Hills](https://science.nasa.gov/resource/ingenuity-at-valinor-hills/).

No images, recordings, PDFs, models or dependencies were added. Map layer titles,
capabilities links, projection metadata and fallback imagery remain in the map
infrastructure. `data.ts` retains historical scientific records separately.

## Map behavior and boundaries

Five supplied positions create pins and focus Leaflet at their numerical pairs.
Apollo 16 uses negative latitude; Viking 1 uses negative longitude. Display text
comes directly from the inventory, without rounding.

Opportunity, Sojourner and Ingenuity have no numerical coordinate properties or
final-position pins. Their action opens global Mars bounds with the selected
name, exact official location string and an explicit location-only notice. A
separately identified Viking 1 pin may be visible; it is never a substitute
target. No regional centers are inferred.

Repeated map actions refocus after panning. Switching planets immediately resolves
selection within the new planet. CRS, layers, native controls, keyboard, mobile
interaction switch and existing pin-to-story links are retained. Reduced motion
disables selected-location flight animation. A tile batch containing errors now
retains fallback status instead of falsely reporting live imagery; a subsequent
successful batch restores live status.

Rover components, storytelling routes, narration, progress schema, catalogs,
GIS/3D internals and homepage remain unchanged.

## Validation

- Focused tests: **17/17 passed**.
- Full suite before changes: 288 tests, 230 passed, **58 failed**.
- Full suite after changes: 305 tests, 247 passed, **the same 58 failed**;
  no newly failing test names. This is not a green full-suite result.
- Existing failures include absent historical Git objects/snapshots, old asset
  expectations and pre-existing presentation/inventory assertions. No unrelated
  test was rewritten or skipped. Only the old map-inventory assertion in
  `master-integration.test.mjs` was updated for this approved replacement.
- `npm.cmd run test:rover`: passed completion gates, duplicate protection, quiz
  compatibility, persistence, old saves and reset.
- `npx.cmd tsc -b --pretty false`: passed.
- `npm.cmd run build`: passed; existing large Three.js chunk warning remains.
- `git diff --check`: passed with repository-local CRLF line-ending handling;
  actual trailing-space and extra-end-of-file checks remain enabled.

Real Chrome 157 headless QA used a disposable context, not the user's profile.
All eight map actions passed at 1440×900, 768×1024, 360×800, 390×844 and 439×591
(40 cases). Checks cover exact display strings, numerical focus calls in the
actual Leaflet runtime, pin counts, no horizontal overflow, lower controls at
least 44px, Tab/Enter selection, visible focus, planet switching, normal/reduced
motion, mobile interaction switch, Leaflet arrow panning, tile failure fallback,
and an unchanged Apollo 15 story route without autoplay. No runtime exceptions.
Canceled imagery requests during rapid navigation are recorded separately from
intentionally blocked NASA tile requests in the offline simulation.

Genuine app screenshots and JSON results stay outside Git in the supplied QA
directory. They are not reference artwork or generated images.

## Reproduce on Windows

```powershell
Set-Location C:\xampp\htdocs\NASA-Hackathon
npm.cmd ci --no-audit --no-fund
npm.cmd run dev -- --port 5199 --strictPort
```

Open `http://127.0.0.1:5199/explore/moon#scientific-locations` or
`http://127.0.0.1:5199/explore/mars#scientific-locations`. Select each mission and
use **View on 2D map**. Check text, pin distinctions and map gestures with a
physical touch device and screen reader.

Automated Chrome QA needs an installed Chrome launched with a NEW external
profile directory and loopback debugging port 9338. Never use a personal profile.
With Chrome and Vite running:

```powershell
node scripts/final-mission-locations-qa.mjs C:\path\outside-checkout\qa http://127.0.0.1:5199 9338
node --test tests/*.test.mjs
npm.cmd run test:rover
npx.cmd tsc -b --pretty false
npm.cmd run build
git diff --check
```

Physical multitouch and human screen-reader testing remain pending. The 58
inherited suite failures need a separate repository maintenance decision before
claiming a completely green release.
