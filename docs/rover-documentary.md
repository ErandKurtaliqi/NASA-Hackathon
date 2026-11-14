# Cinematic rover documentaries

## Integration

The existing `/story/:storyId/:chapter` routes now enter one continuous documentary for the three missions already in the project: Perseverance, Apollo 15 and Apollo 17. Hardware Lab and homepage links use those same routes. `?view=reader` opens the original chapter reader. Old chapter 4 deep links still enter the legacy scene; chapter 5 still opens the original quiz. The homepage and planetary explorer are unchanged.

The five documentary sections are Meet Me, My Journey, My Discoveries, My Challenges and My Legacy. Native document scrolling drives a persistent React Three Fiber scene through Framer Motion's scroll value. Chapter navigation uses standard scrollIntoView; scrolling is never trapped by a challenge. Camera transitions reverse on backward scroll. Inspection temporarily locks the page only while the user explicitly opens 3D mode.

## Modules

- `src/components/rover/roverExperience.ts`: existing mission-content adapter, camera shots, model credit, narration mapping and challenge selection.
- `CinematicRoverExperience.tsx`: scroll sections, milestone/discovery selection, completion and accessible inspection dialog.
- `CinematicScene.tsx`: one persistent Canvas, procedural terrain, instanced rocks, shared mission models, camera director, model loading and render error boundary.
- `RoverChallenge.tsx`: pointer brushing with keyboard-equivalent buttons; three-step navigation using mouse, touch or arrow keys.
- `NarrationDock.tsx`: on-demand chapter audio, matching transcripts and evidence links. All 19 supplied Apollo 15 recordings remain reachable: 16 in the documentary and the three question recordings in the original quiz.

Add a mission to the existing machineStories data and extend getRoverExperience with its authentic model, camera configuration and scientifically appropriate activity. No new frontend framework or runtime dependency was introduced.

## Scientific and asset limits

Perseverance reuses the official local NASA/JPL-Caltech GLB. The Apollo LRVs reuse the existing illustrative reconstruction, labelled in the experience and inspection mode. This reconstruction is **not** a production-quality scanned Apollo 15 or Apollo 17 vehicle. A licensed, detailed mission-specific Apollo GLB remains an asset upgrade for future work. No unrelated rover is substituted.

Terrain, rock placement, camera views and lighting are illustrative. They are not surveyed reconstructions of the landing sites. Lunar scenes have no atmospheric fog; Mars uses a restrained distance haze. Mission text and narration come from the project's existing sources. Historical challenges are shown separately from the activities.

The lunar dust activity illustrates cleaning a television-camera cooling radiator; LRVs were battery-powered, not solar-powered. The navigation game is an educational illustration of hazard avoidance, not a recorded Perseverance traverse. Neither activity claims to repair the real spacecraft. External NASA photographs and evidence links may be unavailable; the original-image link remains available with an explicit load-failure message.

## Progress and compatibility

The existing Zustand/localStorage store adds `roverJourneys`, retaining original saves and quiz progress. A chapter is recorded after it remains active for 700 ms in a visible document. A mission badge requires all five visited chapters plus a solved activity and the final completion button. The atomic completion action rejects incomplete journeys and duplicate awards. Finishing also marks the four corresponding original reading chapters complete, making the original optional quiz accessible without fabricating a completed quiz. The documentary badge is stored in the same badge array and displayed in Mission Control.

Storage key: `beyond-earth-progress`. Documentary badge IDs: `<storyId>-documentary`. Reset clears both original progress and documentary progress.

## Accessibility and performance

Visible chapter navigation, skip-to-challenge link, focus-visible styles, keyboard/touch challenge alternatives, live status feedback, inspection focus containment, Escape-to-close and restored focus are included. Reduced motion uses immediate camera transitions, native non-smooth chapter navigation and a demand render loop outside inspection. Low Detail is selected on small screens and is user-adjustable in inspection; it lowers DPR, terrain/rock complexity and disables shadows. Geometry/textures created for the environment are disposed on unmount; rover GLBs use the existing loader cache and load on demand. Scene failures leave narration, chapter content and activities available.

These are performance-conscious choices, not a measured guarantee of 60 FPS on every device. The lunar model's fidelity and real-device GPU performance remain practical review points. Test on target phones before broad release.

## Validation

- `npm run test:rover` (Node 22.6+): completion gates, repeated visits, duplicate awards, quiz compatibility, save rehydration, old-save defaults and reset. Uses in-memory storage.
- `npx tsc -b`: project TypeScript check.
- `npm run build`: standard production build; sandbox environments that cannot run Vite's config bundler can use `npx vite build --configLoader runner --config vite.config.ts` after TypeScript.
- No lint script exists in this repository.
- Browser QA covers all five chapters, reverse navigation, persistent Canvas identity, Apollo narration mapping/playback, both activities, 3D inspection/reset/detail controls and keyboard focus, achievement persistence, original reader/quiz links, mobile layout, reduced motion and rendering failures.
