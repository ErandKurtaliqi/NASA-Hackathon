# Perseverance controlled storytelling pilot

Historical scope of the original pilot: only `follow-perseverance` chapters 1
(Meet Me) and 2 (My Journey). The work stayed on
`feat/planetary-explorer-redesign` and preserved pre-existing uncommitted explorer
work. That milestone changed no dependency, scientific data, model, protected
scene, homepage, explorer layout, or localStorage schema.

Current AURORALYS integration retains this scroll/narration pilot for Chapters
1–2. My Journey now also uses `StoryMedia` and verified step-aware imagery; see
[journey media](perseverance-journey-media.md). Subsequent implementations are
documented in [Challenges](perseverance-challenges.md), [Legacy](perseverance-legacy.md)
and [the quiz](perseverance-quiz.md). Chapter 5 now uses
`src/components/storytelling/PerseveranceCompletion.tsx` and the existing progress
store, with [confirmed-save status and recovery](progress-persistence.md).
The implementation and verification records below describe the original pilot
unless explicitly identified as current behavior.

## Runtime files

- `src/components/MachineStoryPage.tsx`: safe route validation, pilot integration,
  chapter-heading focus, and immediate protection of a locked pilot chapter.
  The pilot retained the chapter completion and quiz handlers then in use.
- `src/components/storytelling/PerseverancePilot.tsx`: narrative cards, active-step
  navigation, voice controls, original rover presentation, touch gating, visual
  pause, and an explicitly opened landing reconstruction.
- `src/components/storytelling/PerseverancePilot.module.css`: isolated responsive
  presentation. Shared shell clipping and chapter/source tap-target adjustments
  apply only while this uniquely scoped pilot is mounted.
- `src/features/storytelling/pilot.ts`: route guards, data-derived substeps, and
  the visible-card reading-line calculation.
- `src/features/storytelling/scrollController.ts`: passive, frame-throttled scroll
  observation and explicit focused step navigation.
- `src/features/storytelling/useScrollStory.ts`: React lifecycle adapter.
- `src/features/storytelling/narration.ts`: opt-in speech queue ownership and
  cancellation, English voice selection, stale-event protection and errors.
- `src/features/storytelling/useChapterNarration.ts`: speech capability detection,
  current-step synchronization and cleanup on route exit / hidden documents.
- `src/features/storytelling/motionPreference.ts`: initial and live reduced-motion
  preference subscription, without changing shared animation configuration.

Regression checks: `tests/storytelling-pilot.test.mjs`. This document is the only
new documentation file created during the original pilot task.

## Behavior and compatibility

Meet Me has four substeps: introduction, origins/development, home/purpose, and
power. Every existing profile value is retained. My Journey uses all five
existing events, dates and descriptions directly from `machineStories.ts`.
The original pilot added no new mission facts, media assets or scientific claims;
the later media integration is documented above.

Scrolling naturally selects the visible card nearest 45% of the viewport height.
There is no wheel/touch interception, snapping, forced automatic progression, or
3.6-second journey timer in the pilot. Previous/Next and numbered step buttons
provide a keyboard-accessible alternative. Explicit navigation scrolls instantly
and focuses the selected article; scrolling itself never moves keyboard focus.
All narrative cards remain readable in the DOM, including with voice/3D disabled.

The active step is identified by text, styling and `aria-current`. A single live
reading-status announcement avoids duplicate announcements from the repeated
navigation at the bottom of the chapter. Sources remain in their original footer.

Voice starts only after Hear this story. It follows subsequent active-step changes,
canceling the preceding utterance before speaking the next one. Read step again
replays the current text. Turn voice off, chapter exit, invalid-route exit and
document hiding cancel the session; returning to a hidden tab requires a fresh
opt-in. Unsupported browsers retain all text and a disabled, explained voice
control. Voice preferences and substeps are intentionally not persisted.

The existing NASA rover GLB is reused through `RoverScene`'s `interactive` prop.
By default its surface is inert, hidden from the accessibility tree, and cannot
consume page gestures. Enable 3D controls allows deliberate rotation/zoom; Done
or Escape returns to ordinary page interaction. Exiting its native fullscreen
also restores the controls button. The rover unmounts offscreen or in hidden
documents, while its existing asset loader/cache remains unchanged.

Pause visuals unmounts the rover and optional reconstruction; Resume visuals
restores the starting camera rather than claiming to preserve an internal paused
pose. Reduced motion starts visuals paused, disables CSS animation/transition,
and responds when the system preference changes. If explicitly enabled under
reduced motion, the rover omits hotspot-triggered camera flights. Narration stays
independent from the visual toggle.

Landing is an optional reconstruction inside the landing card, never a timed
journey transition. Play landing reconstruction mounts the unchanged component;
the student can stay on the card longer than eight seconds, choose its existing
stages, or stop it. Leaving the landing substep, pausing visuals, hiding the
document, or leaving the chapter unmounts it. Its canvas has no enabled camera
gestures, so only its canvas pointer targeting is disabled; native stage/play/
replay/fullscreen buttons remain available. The reconstruction is still explicitly
identified as educational and not NASA footage.

Selecting a step or scrolling into a later step satisfies the existing interaction
gate. This does not itself complete a chapter. Next chapter retains the original
`completeStoryChapter(story.id, meta.id, index + 1)` behavior and chapter links.
The original pilot changed no storage field, key, version, badge rule or quiz.
Reloading restores successfully saved chapter progress, not an ephemeral substep.
At that milestone, normal Apollo 17 routes and Perseverance chapters 3–5 retained
their existing markup and behavior; subsequent Perseverance changes are linked above.

Only known story IDs and integer chapters 1–5 are accepted. Unknown/prototype-like
IDs, text/decimal/zero/out-of-range chapters receive a safe Story not found view
with a Hardware Lab link. Existing chapter locks still redirect to the first
unlocked chapter; locked pilot content is not mounted before that redirect.

## Historical automated verification of the original pilot

Commands used for that milestone (still available as targeted checks):

```powershell
node --test tests/storytelling-pilot.test.mjs tests/explorer-popup-layout.test.mjs
npm.cmd run build
git diff --check
```

The combined suite passed 16 tests: 11 pilot tests plus 5 existing map tests.
Pilot coverage includes route validation, pilot scope, preservation of profile /
journey content, forward/reverse scroll selection, passive listeners, frame
throttling, cleanup, instant keyboard-compatible focus navigation, speech opt-in,
replacement/cancellation/stale callbacks, errors, motion preference changes,
route render contracts, reduced-motion initial state and real progress-store
rehydration/completion against an in-memory localStorage substitute.

Render checks stub only the 3D views and, for route snapshots, progress state.
The separate storage test used the actual store, unchanged at that milestone.
No test alters a real browser's progress. These checks do not validate GPU rendering, actual speech
engine output, screen-reader announcements, or physical touch behavior.

A separate before/after comparison against the original tracked story component
confirmed all nine legacy chapter/voice/scene helper functions are unchanged,
and normalized rendered HTML is identical for all five Apollo 17 chapters and
Perseverance chapters 3–5. Baseline hashes confirmed all pre-existing files except
`MachineStoryPage.tsx` are unchanged, including the previous uncommitted work.

Production build passed including TypeScript. The pre-existing warning about the
approximately 823 kB shared React Three Fiber chunk remains. No dependency was
added. Browser visual, voice-device and physical touch verification must be
distinguished from the automated checks above.

A temporary production preview returned HTTP 200 for both pilot chapters,
Perseverance chapter 3, Apollo 17 chapter 1, both explorer routes and the original
GLB. These are serving checks, not client interaction checks. The owned preview
server was stopped. The browser connector exposed no applications or controllable
tabs, so screenshots, actual speech output and touch/GPU checks remain manual.

## Manual acceptance

Use existing progress, or a separate browser profile for fresh-progress tests;
do not reset the team's real progress simply to test the pilot.

1. Open `/story/follow-perseverance/1`. Confirm four cards and all six original
   profile facts. Scroll down/up: the active step follows the visible card, without
   jumping or taking over page scrolling. Try Previous/Next and numbered steps.
2. Use Tab and Enter/Space on navigation and voice controls. Explicit step changes
   must focus the article with a visible outline. Read every card without 3D.
3. Enable voice. Change steps while it speaks: the old utterance must stop, and
   only the current step should be read. Test replay, voice off, hidden-tab return,
   chapter exit, and a browser with no speech synthesis. Check for overlapping
   or stale narration on the actual target devices.
4. Enable 3D controls and try native orbit/zoom. Done or Escape must restore page
   interaction. Test native fullscreen and its exit. Pause/Resume visuals should
   stop rendering and restore the initial camera, while text remains accessible.
5. After engaging with a step, choose Next chapter. Verify chapter 2 unlocks and
   the five journey events appear. A fresh direct visit to locked chapter 2 must
   return to chapter 1; previously completed chapters must remain unlocked.
6. At the landing card choose Play landing reconstruction. Remain there for more
   than eight seconds: the story must not auto-advance at 3.6 seconds. Exercise
   the three native stages, Stop reconstruction, and Pause visuals. Scroll away
   and back: the animation must not restart without another explicit choice.
7. Finish chapter 2 and continue to the Challenges chapter. Reload and
   verify saved chapter continuation, Apollo 17 progress, map discoveries and
   inspected instruments. Visit all Apollo chapters and both explorers.
8. Test 360x800, 390x844, 439x591, 1280x720 and a larger desktop. Check active-step
   controls, native page/popup scrolling, no horizontal page overflow, readable
   cards, sources, and touch scroll before/after enabling 3D controls.
9. Enable reduced motion before loading, then change it while the page is open.
   Visuals must pause and no reconstruction should autoplay. Explicitly opted-in
   3D remains optional; the story must be completable using text and buttons.
10. Try `/story/follow-perseverance/abc`, `/story/follow-perseverance/2.5`,
    `/story/follow-perseverance/6` and `/story/unknown/1`: safe recovery, no crash.

## Protected-scene limitations / next stage

- Full camera/animation pause with pose preservation needs a GIS/3D-owned public
  interface such as active/motionEnabled. The pilot deliberately unmounts instead
  of accessing private scene state or modifying `RoverScene.tsx`.
- `LandingSequence.tsx` has an internal timer, camera and partially independent
  animation loops. Its native pause does not provide a complete scene-freeze
  guarantee; Pause visuals / Stop reconstruction provide a full wrapper-level
  stop. Strict animation completion and stage-selection callbacks should be
  separated by its owner before using them as learning-assessment gates.
- Hotspot-to-narration synchronization needs a public instrument-selection
  callback. None was simulated using DOM scraping or private 3D handles.
- Since the original pilot, verified still imagery and Perseverance Chapters 3–5
  have been implemented as linked above. Recorded narration, a timed 4–5 minute
  full script and expansion of the pilot to other rovers remain possible later work.
- Browser voice availability and quality vary. CSS :has/overflow:clip enables
  sticky presentation only while the pilot is mounted; older browsers can fall
  back to ordinary document flow without losing content or bottom navigation.

No branch, commit, push or merge was created.
