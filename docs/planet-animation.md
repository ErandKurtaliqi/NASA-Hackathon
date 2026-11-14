# Planet animation upgrade

The Moon and Mars share PlanetEffects motion/lighting and the existing PlanetScene camera. NASA Mars model/texture and lunar imagery are preserved. The visual motion is presentation timing, not a simulation of real planetary rotation rates.

- A short opening rotation and sun-light reveal settle into a slow idle turn.
- Hovering eases the rotation to a stop; manual interaction suspends automatic motion until 1.2 seconds after interaction ends.
- Homepage planets use restrained floating motion, pointer parallax, breathing portal light, decorative orbital guides and a one-time surface reveal. Floating pauses while a planet is hovered, keyboard-focused or touch-controlled.
- Mars alone has a faint, daylight-weighted limb shader. Moon receives no atmospheric shader. The portal guides are decorative UI, not rings around either world.
- Zoom buttons, keyboard orbit and reset ease through a quaternion direction transition with clamped radius. The zoom-out ceiling remains exactly the initial camera distance, on both homepage and explorer. Interpolation never cuts through the globe, including a reset from the far side.
- Canvas remains transparent. Homepage poster images are hidden after 3D readiness, retaining the earlier black-background fix.
- Arrow keys orbit the focused planet; + / - zoom; R resets. Existing mouse/touch controls and mobile interaction toggle remain.
- Reduced-motion and stored app motion preferences suppress automatic motion and reveal effects. Offscreen/hidden scenes use demand rendering; homepage scenes already unload when inactive. Camera math reuses scratch vectors/quaternions. No new dependency or model asset was added.
- Lunar live mosaic tiles no longer get overwritten by a slower fallback request. Completed live mosaics are reused from the existing texture cache.

Validation: TypeScript, existing rover state regression tests, production build, and browser checks for both transparent canvases, camera distance limits, button/keyboard zoom, keyboard orbit, opposite-side camera reset, mobile layout/touch toggle and reduced motion. Camera observations for the browser checks use Three.js's devtools observation hook only in the test context; no testing hooks were added to application code.
