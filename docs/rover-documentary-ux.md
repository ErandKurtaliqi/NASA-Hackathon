# Documentary UX review

Worktree: `C:\xampp\htdocs\NASA-Hackathon-rover-ux`.
Branch: `feat/rover-documentary-ux`, from main
`a912a7e7ef646a43cdd81ad16ada7af243dde494`.
Following manual visual review, publication of this isolated branch and a Draft
PR targeting main is authorized. Integration and merging remain unapproved.

## Approved scope

All eight continuous stories use the same updated layout: Apollo 11 LRRR,
Apollo 15, Apollo 16, Apollo 17, Ingenuity, Sojourner, Opportunity and Viking 1.
All 40 logical chapters, approved scripts, original recordings, evidence,
activities, quiz questions, completion conditions, badge IDs and persistence
remain intact. The separate Perseverance cinematic implementation is unchanged.

The bottom playback deck is removed, including segment Previous/Next,
Pause/Resume and seeking controls. The five chapter buttons now form the final
row below the expanded stage, with the existing active/completed indicators and
focus/scroll behavior. Intentional chapter-completion and quiz actions remain.

The only narration control is under Mission sources in the story header.
Sound On starts the currently visible segment at zero; enabled scrolling stops
the old recording before starting the new one. Sound Off immediately pauses and
disarms the controller. HEAD checks are aborted on context changes, pending play
results are guarded, and only one upcoming recording's metadata is prefetched.
No new recordings or media were generated or added. Held, missing, network and
autoplay errors remain readable. Playback errors disarm sound and permit explicit
retry. Full scripts remain in the reader and any verified caption cues remain
outside the deleted deck; no caption timestamps were invented.

The reader uses a restrained dark translucent background without blur. In real
Chrome, Apollo 15 reader/evidence heights increased from 500.6/538.2 to
575.4/613.0 px at 1440×900; from 274.4/262.7 to 297.3/281.8 at 390×844; and
from 175.6/146.3 to 198.5/165.4 at 439×591. Hardware and environment rendering
are unchanged.

## Planet navigation

Both documentary return links use `/explore/moon` or `/explore/mars` without
`?view=map`. The completion link now explicitly names the planet's globe.
Existing other Rover links already use default globe routes and remain unchanged.

A dedicated tab navigation marker identifies browser Back from a documentary
to its planet, including a full reload or BFCache restoration. That entry opens
the globe and replaces only the stale `view=map`
query parameter, preserving other parameters and history length. This is not a
progress migration or a global map override. Direct map entries without documentary
return intent still work; the map switch and explicit location actions remain.
The marker is consumed on return. Storage denial falls back to in-memory intent;
that fallback cannot carry intent between separate documents.

## Files

Modified: `src/components/storytelling/ContinuousStoryPage.tsx`, its CSS module,
`DocumentaryAudio.tsx`, `src/features/storytelling/documentaryNarration.ts`,
`src/pages/ExplorerPage.tsx`, and tests `continuous-story.test.mjs`,
`master-integration.test.mjs`, `shared-navigation.test.mjs`.
Created: `src/features/explorer/documentaryPlanetReturn.ts`,
`tests/documentary-ux.test.mjs`, and this document.

Existing tests were adapted only for the expressly removed controls/new header
selectors and the router hook required by the history behavior. No test is
disabled or skipped. The new source-protection check uses Git's checkout filters
to account for Windows line endings while protecting binary/media contents.

## Validation and review

- New focused audio/scope tests: 13 passed.
- Full suite: 301 tests, 243 passed and the same 58 inherited failures as main
  (baseline 288 total / 230 passed / 58 failed). No newly failing test names.
- TypeScript, production build and whitespace checks pass. The existing large
  Three.js bundle warning remains.
- Installed Chrome, normal autoplay policy: eight documents × five timeline
  chapters at 1440×900, 390×844, 439×591 and 768×1024; no horizontal overflow,
  one header sound control below sources, no deck or removed segment controls,
  usable bottom timeline and expanded reader/evidence.
- Real playback, native wheel synchronization, mute and globe-return links passed
  for all eight missions. Moon and Mars browser Back from a map/story transition,
  including after a full story reload, returned to the globe. Other query
  parameters were retained and the return marker was consumed. Explicit map
  switching remained available.
- Generic Apollo 15 and custom Apollo 16 quizzes passed with 3/3 results, one
  persisted badge, retry preservation and reload. Store/quiz regression tests
  cover the shared paths and older saved progress.
- Additional Chrome checks passed for keyboard sound activation, departure cleanup,
  held recordings, a deliberately blocked recording and recovery on the next
  available segment. Logs/screenshots remain outside Git in
  `C:\xampp\htdocs\NASA-Hackathon-rover-ux-QA`.

Preview: `http://127.0.0.1:5210/story/apollo-15-rover` (replace the ID with any
of the eight published story IDs). The live server uses an isolated Vite cache.
If restarting, from the worktree use:

```powershell
npm.cmd run dev -- --port 5210 --strictPort
```

Visually inspect header controls, natural reader scrolling, evidence captions,
all timeline buttons, activities and quiz results on a physical touch device and
with a screen reader. Human audio listening and Safari/iOS policy remain manual.
Do not infer verified word synchronization from the existing pending cue data.
Keep this branch separate from the locations and Homepage review branches.
