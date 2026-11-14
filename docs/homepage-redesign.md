# AURORALYS homepage

The homepage lives in `src/pages/HomePage.tsx`, with CSS Modules in
`src/pages/HomePage.module.css`. The homepage is a single planetary-selection
hero. The former educational sections, scroll indicator and homepage footer were
removed following the director's approved simplification. Other routes retain
the existing shell and remain accessible through the hero's navigation menu.

Implementation and validation notes below record the homepage redesign milestone.
The current approved identity is **AURORALYS** with the existing gradient A logo;
the asset's original provenance is separate from its current approval status.

## Asset provenance and replacement

- `public/images/home/auroralys-mark.svg`: the currently approved gradient A logo
  for AURORALYS. It originated as a provisional vector monogram created for layout
  integration. The SVG title and source comment still describe that original
  provisional provenance; they do not reflect the subsequent approval decision.
- `public/images/home/astronaut-guide.png`: original provisional illustration,
  generated with the built-in ImageGen tool and originally supplied as provisional
  artwork rather than director-provided brand artwork. Alpha transparency was
  verified locally.
- The space atmosphere is procedural CSS, not an official background asset.
- Static planetary previews reuse the bundled NASA fallback tiles. They are
  decorative sphere presentations, not scientific projections or new datasets.

The `artwork` paths in `HomePage.tsx` currently use the approved logo and existing
astronaut illustration. Replacing either is a future integration step only if a
replacement is approved. Preserve transparent margins / full-body framing for the guide.
The space background is isolated in the `space`, `nebula`, and `stars` classes;
an approved background image can be integrated there without changing controls.
No audio asset was supplied, so the top-right playback control pauses ambient
motion rather than claiming to control sound.

### ImageGen prompt

Mode: built-in tool; `transparent_background: true`.

> Use case: stylized-concept. Asset type: a single transparent-background character cutout for the lower-left of a cinematic educational space website. Primary request: a friendly young astronaut guide, full body, large expressive brown eyes, smiling face, short dark brown hair visible through a crystal-clear bubble helmet, polished white and silver spacesuit with indigo joints and bright cyan illuminated earpieces, small life-support backpack, sturdy white moon boots. Charming premium 3D animated-film rendering, detailed fabric seams and molded suit parts, soft dimensional shading, cool blue rim lighting from left and subtle warm key light from upper right. Pose: standing with feet planted, looking up and to the right, right arm extending toward the upper right with one gloved finger pointing toward planets, other arm relaxed. Framing: entire character visible from boots to helmet with no cropping, character fills the canvas with small safe transparent margins, portrait composition. Scene/backdrop: genuinely transparent alpha background; no surface, no landscape, no shadow plane, no stars, no planets, no speech bubble. No text, no logo, no watermark. This is an original provisional website illustration, not official brand artwork.

## Planetary integration boundary

`PlanetGateway.tsx` consumes the existing public `PlanetScene` interface with
`planet` and `compact`. It does not duplicate geometry, fetch tiles, change camera
logic, alter coordinates, or mark locations as explored. Navigation is through
separate React Router links, so dragging a planet never triggers navigation.

The adapter clips the preview, adds CSS halos, and hides the scene's data-status
overlay only within homepage previews. Dataset details remain available in the
unchanged explorers and sources page. This scoped CSS selector depends on the
existing `.globe-data-state` presentation class.

The public scene currently cannot pause rendering or disable rotation through a
prop. Consequently, the adapter unmounts it when motion is paused, reduced motion
is requested, the preview leaves the viewport, or the tab is hidden. Static
previews and navigation remain available. Returning to live 3D may repeat tile
requests because request lifecycle is owned by the existing scene.

Future requests for the GIS / 3D developer, not implemented here:

- A presentation variant with configurable HUD and transparent background.
- Public active / reduced-motion controls to retain the scene without continuous
  rendering or reloading tiles.
- Optional controls for preview camera framing, scroll zoom, lighting, and shared
  rendering of both planets if profiling calls for a single WebGL context.
- Public readiness / error callbacks for more precise progressive loading.

The current Mars MOLA layer and globe lighting differ from the photorealistic
orange Mars in the reference. Scientific layers were preserved; no replacement
dataset or planetary material was introduced.

## Behavior and validation

- Moon and Mars controls retain `/explore/moon` and `/explore/mars`.
- Story, hardware, dashboard, and scientific source links remain available in
  homepage navigation.
- Zustand progress, story identifiers, data, scientific coordinates, maps, and
  planetary / rover implementations are unchanged.
- Desktop uses two columns, with planet and headline sizes that adapt to viewport
  height. The hero uses `100svh` / `100dvh` minimum sizing and may grow naturally
  when content needs more room, including at text zoom. Only decorative layers
  are clipped; no new global overflow restrictions are applied.
- On screens up to 800px wide the astronaut introduces the worlds in normal
  reading order. Narrow mobile screens place the worlds vertically; wider mobile
  screens use two columns, with a compact variant for short screens.
- Mobile planets retain explicit Rotate & zoom / Done controls so ordinary
  page gestures remain available outside interaction mode.
- Reduced motion uses static planetary previews and disables decorative animation.
- The title and document metadata identify AURORALYS; interface text stays English.

`npm.cmd run build` validates TypeScript and the production bundle. Vite reports a
large shared React Three Fiber / Three.js chunk; this work adds no dependencies.
`node --test tests/homepage-hero.test.mjs` checks the rendered hero, navigation,
absence of lower sections, the existing scene adapter's public interface,
interaction controls and responsive CSS contracts. GPU rendering and actual
browser geometry are not simulated by these tests. Review desktop viewport fit,
text zoom, touch gestures and the 360×800, 390×844 and 439×591 layouts in a browser
before release.
