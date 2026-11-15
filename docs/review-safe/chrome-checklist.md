# Chrome: Manual acceptance pending

The tool inventory is still without browser/native host; there is no new visual, auditory or real E2E test. Automated testing does not match this list. Use a separate QA profile; do not clean up personal progress.

## Preparation and scope

**Code review**, port 5197:

```powershell
Set-Location -LiteralPath $env:AURORALYS_REVIEW_WORKTREE
npm.cmd run build
npm.cmd run preview -- --port 5197 --strictPort
```

**Original local ** description, use another terminal and port 5196:

```powershell
Set-Location -LiteralPath $env:AURORALYS_NARRATED_WORKTREE
npm.cmd run preview -- --port 5196 --strictPort
```

Do not assume that they are started; if a port is occupied, check which server responds or choose another free port. Do not stop other people's services. Both are only loopback, no display. The original build has already been validated in `4f6d380`; do not copy your MP3/PDF to the review.

| Priority and steps | Expected result | Record on failure |
|---|---|---|
| 1. Open `/`, activate gesture sound and select Moon/Mars; pause sound and exit | Available guidance/captions, no initial autoplay or overlap; navigation to both explorers; voice ending on exit | Path/origin, recording, pulsed control, Console/Network error, if sound is left after exit |
| 2. Open `/story/apollo-15-rover/1` in 5197; advance through the five chapters with Previous/Next and scroll | Existing mission voice, corresponding content/photo, reading without sound, natural navigation; optional activities do not block | Chapter/active segment and destination; focus, photo/legend, auto-advance enabled or disabled |
| 3. Open Apollo 11 and Apollo 17 in 5197, five chapters each | Code review build warning; no promise to play excluded audios; read, maybe/progress and fonts work | If there is `<audio>`/Play misleading or MP3 requests missing; distinguish from remote images blocked |
| 4. In 5196 listen to 53 audios enabled from stories/homepage; for the seven retentions use original editing, not enable them | Correct mission, chapter, script and voice; visible/silent retentions in the app, with reading | File name/SHA, different audible phrase, font and decision required; do not approve by HTTP |
| 5. During audio: Play, Pause, Summary, Replay, mute/unmute; change chapter/question/history; back/back and hide tab | Pause retains position; Replay returns to the beginning; unmute does not auto-reduce; single voice and cleanup; historical TTS does not compete | Pre/new track, observed positions, exact sequence and Play error if there is |
| 6. Compare NASA text and evidence to each segment | Voiceless readable chapters; credits/accessible sources; distinguishing photography/illustration and timed phrase text | Record the specific discrepancy and source. Avoid inventing timings or editing audio during QA. |
| 7. Apollo 15 chapter 4, hammer and feather activity; Apollo 11 chapter 1, reflection activity | Optional prediction/feedback/retry; stationary reflector, not actual measurement; no activity-blocking or badge | Option, feedback, focus and if progress changed unexpectedly |
| 8. Quiz of each mission: correct/mistakes, three explanations, View Results, TRY AGAIN and Complete Story | Last visible explanation; honest score; incomplete new attempt does not allow completion; chapter already completed retains unique status/badge | Answers, score, button status, focus and snapshot before/after without sharing personal data |
| 9. Reload Dashboard and resume stories; try storage rejection in QA profile and Retry saving | Persisting progress is preserved; session/saved fault; retry recovers snapshot without repeating quiz or duplicating badges | Record the error and exact steps. Avoid clear/removeItem and schema changes. |
| 10. Tab/Shift-Tab/Escape, zoom 200%, reduced motion; test 360×800, 390×844, 430×932, 768×1024, 1366×768, and 1920×1080 | Visible focus, navigation/touch controls usable, no overflow or text/overlay photos; full fonts | Track/viewport/state capture; document width, overflowing element and inaccessible controls |

For Console/Network, filter failed errors and requests, write down status/MIME and play with normal and slow cache/network. Don't share cookies, signed URLs or credentials. The remote Apollo 11 evidence has failback if it doesn't load; a network lock is not evidence of bad attribution.

Compare the first Apollo 15 viewport with the Haroon reference of 1364×768: left machine, title/central story, right evidence, typography/space, background/horizon, sound and chapter line. The app retains five chapters; the reference has four. 2D approved cuts and surface/horizon are still pending; no equivalence is claimed. Do not copy the captures as NASA evidence. Register changes GIS/3D for Erand, do not alter camera, pins or coordinates during QA.

The seven listening files and checklists are in [scientific-decisions.md](scientific-decisions.md) and [held-recordings.json](held-recordings.json). There is no human approval registered yet.
