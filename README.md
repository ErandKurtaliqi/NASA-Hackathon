# AURORALYS — Moon & Mars Explorer

An educational exploration project for ages 8–16 with NASA planetary imagery, interactive globes and maps, eight five-chapter machine documentaries, science activities, hardware profiles, and locally saved progress. The separate Perseverance expedition is available at `/story/follow-perseverance/1`.

The AURORALYS gradient A logo lives at `public/images/home/auroralys-mark.svg`. See [the homepage documentation](docs/homepage-redesign.md) for its provenance.

The production build includes Apollo 15 narration. Read the [integration notes](docs/master-integration-finalization.md) for the remaining recordings, caption timing, and scientific editorial review.


## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://127.0.0.1:5173`). Production check:

```bash
npm run build
npm run preview
```

## Planetary imagery

| World | NASA Trek layer | CRS / projection | Matrix levels | Format |
| --- | --- | --- | --- | --- |
| Mars | MGS MOLA Global Color Hillshade (`Mars_MGS_MOLA_ClrShade_merge_global_463m`) | IAU 2000 Mars equirectangular, EPSG 104905 | 0–7 | JPEG |
| Moon | LRO WAC Global Mosaic 303 ppd v02 (`LRO_WAC_Mosaic_Global_303ppd_v02`) | IAU 2000 Moon equirectangular, EPSG 104903 | 0–8 | JPEG |

The RESTful WMTS templates, tile dimensions, extents, matrix sets, and level limits come directly from the live GetCapabilities documents:

- [Mars Trek API and layer catalog](https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars)
- [Mars WMTS GetCapabilities](https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/WMTSCapabilities.xml)
- [Moon Trek API and layer catalog](https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=moon)
- [Moon WMTS GetCapabilities](https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/WMTSCapabilities.xml)

Leaflet uses a custom longitude/latitude CRS rather than Earth Web Mercator. It maps −180°…180° longitude and −90°…90° latitude into NASA’s 2:1 matrix: zoom 0 is two 256 px columns by one row; each level doubles both dimensions. Coordinates use east-positive longitudes.

### Reliability and caching

Live imagery is requested directly from `trek.nasa.gov`, which currently allows cross-origin image requests. Browser HTTP caching follows NASA Trek response headers; the app does not operate a separate server-side tile cache. Each map keeps bundled copies of NASA’s two level-0 tiles underneath the live layer, so service failures reveal an authentic low-resolution NASA mosaic instead of fictional imagery or an unrelated Earth map.

The 3D globes assemble NASA zoom-2 tiles into a 2048×1024 equirectangular texture at runtime, with the same bundled NASA level-0 imagery as fallback. No displacement or invented elevation is applied. Mars MOLA shading communicates topography visually but is not used as geometry.

## Location coordinates

Landing markers are labeled **exact**; crater/volcano markers are labeled **feature center**; large terrain extents are labeled **region**. Mission coordinates come from NASA mission resources, while named feature centers follow NASA/USGS planetary references. The map is educational and not a navigation product.

Included locations:

- Mars: Perseverance landing site, Jezero Crater, Curiosity landing site, Gale Crater, Olympus Mons, Valles Marineris.
- Moon: Apollo 11, Apollo 17, Tycho Crater, Copernicus Crater, Mare Tranquillitatis.

## Architecture

- `src/planetaryConfig.ts` — audited WMTS layer definitions, capabilities links, projections, and fallbacks.
- `src/data.ts` — strongly typed stories, hardware, real coordinates, and authoritative source links.
- `src/components/PlanetMap.tsx` — Leaflet custom planetary CRS, live WMTS tiles, progressive loading, fallback mosaics, markers, fly-to navigation, and data status.
- `src/components/PlanetScene.tsx` — React Three Fiber globe with NASA mosaic assembly, physically directional lighting, orbit/zoom/reset controls, and fallback handling.
- `src/components/RoverScene.tsx` — official NASA/JPL Perseverance GLB with PBR lighting, shadows, camera controls, loading/error states, and attached educational hotspots.
- `src/components/LandingSequence.tsx` — cinematic three-stage educational EDL reconstruction with accurate event ordering and timeline controls.
- `src/machineStories.ts` — reusable, NASA-sourced first-person story records for Perseverance and the Apollo 17 Lunar Roving Vehicle.
- `src/components/MachineStoryPage.tsx` — shared five-chapter story engine: Meet Me, My Journey, Challenges & Discoveries, My Legacy, and Test Your Knowledge.
- `src/components/storytelling/PerseveranceCompletion.tsx` — Perseverance Chapter 5 completion, existing progress-store actions, confirmed-save status and recovery controls; see [progress persistence](docs/progress-persistence.md).
- `src/components/LunarRoverScene.tsx` — interactive Apollo LRV reconstruction with documented wheel, antenna, and navigation systems.
- `src/store.ts` — Zustand progress persisted to local storage.

## Scientific integrity and reuse

The interface identifies the selected NASA datasets and links directly to their capabilities/catalog pages. NASA content is generally reusable under NASA’s media usage guidelines, subject to restrictions on implied endorsement, logos/identifiers, and identifiable people; this project does not claim NASA endorsement. USGS-authored data are generally public domain unless a product identifies third-party material. Always retain dataset credits and verify the source metadata before redistributing derivative assets.

- [NASA media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)
- [USGS copyright and credits](https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits)

## Known limits

- The global layers are equirectangular products; polar distortion is inherent. NASA Trek exposes separate polar products, but this MVP does not switch projections at high latitudes.
- Mars zoom levels stop at 7 and Moon at 8 for the chosen global layers. The interface does not upscale past those limits.
- High-resolution local products such as HiRISE Jezero mosaics are not silently substituted because their coverage and matrix definitions differ from the global layer.
- Perseverance uses NASA/JPL’s official GLB from NASA 3D Resources. Other hardware views remain clearly labeled stylized representations.
- The landing visualization is an educational reconstruction, not official NASA footage or an engineering simulation.

## Five-chapter machine stories

Each supported rover or spacecraft can plug into the same story schema with first-person copy, profile facts, a journey timeline, engineering challenges, discoveries, legacy milestones, quizzes, rewards, optional browser voice narration, and authoritative source links. Initial stories:

- `/story/follow-perseverance/1`
- `/story/apollo-17-rover/1`
- The app has no backend; progress is stored only in the current browser.

## Mars visual colour and NASA Trek

The Mars globe uses the original model, materials and UV mapping from NASA/JPL-Caltech's [Mars GLB](https://solarsystem.nasa.gov/gltf_embed/2372/), stored locally as `public/models/mars-nasa.glb`. Neutral white illumination replaces the former warm tint. This is a visual texture, not a claim of calibrated true colour. NASA's MOLA colour hillshade remains in Map View as a topographic visualization; its colours must not be interpreted as surface colour.

The NASA Mars Trek tab links to the [official terrain and 3D explorer](https://trek.nasa.gov/mars/) and the [Perseverance location map](https://science.nasa.gov/resource/where-is-perseverance-location-map/). Mars Trek opens separately because its frame policy restricts embedding. Map View pins show published landing sites and scientific features.

## Cinematic rover stories

The existing story routes now open a continuous five-chapter rover documentary with a persistent 3D surface, scroll-directed camera, instrument inspection, mission-specific educational activities, matching Apollo 15 narration and saved achievements. Use **Chapter reader** for the original reading/quiz experience. See [the rover experience notes](docs/rover-documentary.md) for architecture, accessibility, validation, asset provenance and the remaining Apollo model fidelity limitation.

Run `npm run test:rover` for the documentary progress and badge checks (Node 22.6+).
