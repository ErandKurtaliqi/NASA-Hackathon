# Apollo 15 recorded narration — integration phase 2

Source checkpoint: `origin/main@4d31563` (Erand's implementation).
Integration base: `cc2759a`, branch `integration/main-feature-review`.

The 19 MP3 files and `src/apollo15Narration.ts` are copied byte for byte from
that checkpoint. Recordings, original script wording and source links are not
regenerated or edited. NASA evidence links in the scripts do not establish that
NASA produced or licensed the voice recordings; the source checkpoint does not
provide separate voice-production or licensing metadata. Preserve their project
provenance rather than inventing voice credits.

## Original mapping

All paths below are relative to `public/audio/apollo-15/`.

| Chapter | File | Original segment title / question |
| --- | --- | --- |
| 1 — Meet Me | `chapter-1/1.mp3` | Hook & Machine Intro |
| 1 | `chapter-1/2.mp3` | Developed & Destination |
| 1 | `chapter-1/3.mp3` | Who Built Me |
| 1 | `chapter-1/4.mp3` | Designed to Accomplish |
| 2 — My Journey | `chapter-2/1.mp3` | Launch & Landing |
| 2 | `chapter-2/2.mp3` | Lunar Environment & Controls |
| 2 | `chapter-2/3.mp3` | One-sixth Gravity |
| 2 | `chapter-2/4.mp3` | Milestones |
| 3 — Challenges & Discoveries | `chapter-3/1.mp3` | Steering Scare |
| 3 | `chapter-3/2.mp3` | Steep Slopes, Heat & Lunar Dust |
| 3 | `chapter-3/3.mp3` | Genesis Rock |
| 3 | `chapter-3/4.mp3` | Observations |
| 4 — My Legacy | `chapter-4/1.mp3` | Final Science Moment |
| 4 | `chapter-4/2.mp3` | Filming Liftoff |
| 4 | `chapter-4/3.mp3` | Current Status |
| 4 | `chapter-4/4.mp3` | Reflection |
| 5 — Test Your Knowledge | `chapter-5/1.mp3` | Question 1: folding inside Falcon |
| 5 | `chapter-5/2.mp3` | Question 2: Genesis Rock |
| 5 | `chapter-5/3.mp3` | Question 3: hammer and feather |

The original Chapter 5 mapping is `question index + 1`, independently of the
chosen answer. Main supplies 16 scripted segments for Chapters 1–4, and three
quiz MP3s without a separate verbatim quiz transcript. The existing visible quiz
questions/options remain the reading alternative; no transcript is invented.
Audible correspondence to those questions still needs human verification.

The original scripts retain their educational simplifications, including the
navigation wording in Chapter 2 segment 3 and approximate parking coordinates
spoken in Chapter 4 segment 3. These are not imported into GIS coordinates,
markers or the independently registered story data. Any future corrections to
the approved recordings should be coordinated separately with their owner.
Original evidence links remain visible as links only; this phase displays no new
NASA photographs (including no Apollo 11 image as Apollo 15 imagery).

## Integration and playback lifecycle

- `apollo15Recordings.ts` adds a typed presentation adapter, outside the story
  registry and persisted state. No narration field is added to mission progress.
- Chapters 1–4 show one selected script and one native audio player. A labeled
  native select chooses among the four original segments. Every new selection
  is silent until the student presses Play.
- Chapter 5 shows the corresponding single native player beside the current
  question. Advancing, reaching results and retrying unmount/reset the player.
- Apollo 15's synthetic narration button is suppressed. Perseverance and
  Apollo 17 keep their existing voice implementations.
- `recordedNarration.ts` gives one recording ownership of playback. Starting
  another player pauses its predecessor and cancels queued speech synthesis.
  It never calls `play()`; browser controls provide the explicit user gesture.
- Pause preserves position. Segment/chapter unmount pauses, removes handlers,
  resets time, clears the source and calls `load()` to release pending resources.
- Previous/Next/Complete stop playback before their navigation/progress action.
  Captured link clicks stop it before animated route exits. Back, pagehide and
  hidden-document events also stop playback, without automatic resumption.
- Load errors display an alert and a Reload audio button. Reload resets the
  resource; Play remains a separate explicit action. Reading always remains
  available.
- Styling is scoped to this panel, wraps on mobile, includes focus outlines and
  adds no animations. It does not mount or replace a rover scene.

## Validation

`tests/apollo15-narration.test.mjs` compares every asset and the original script
module against Git blobs at `4d31563`. It parses every MPEG Layer III frame,
checking for invalid/truncated structure. This does not replace audible codec
validation in Chrome. It also exercises playback ownership, pause/resume,
manual retry, late callbacks, disposal, StrictMode-style repeated setup,
segment/question selection, navigation events and listener cleanup.

Existing registration, scoring, retry, badge, persistence, homepage and
Perseverance/Apollo 17 regression tests remain active. Historical helper
comparisons allow only the Apollo 15-specific quiz-player insertion.

Chrome acceptance checks:

1. Start from Hardware, open Apollo 15, and play/listen to all 19 recordings.
   Verify speech against the original scripts and the three quiz questions;
   check accent/pronunciation, seeking, volume and playback speed.
2. Confirm silence on first entry, segment selection, question advancement,
   retry and page reload. Pause/resume should retain the current position.
3. Change segments quickly; use Previous/Next, chapter links, Hardware,
   navigation menus, Back/Forward and another tab while playback is pending or
   playing. Check that no old recording continues or resumes unexpectedly.
4. Block an MP3 in DevTools. Verify the readable alert, Reload audio and manual
   Play recovery. Confirm playback under normal Chrome autoplay restrictions.
5. Use Tab, arrows and Enter/Space with native controls; verify accessible
   labels with a screen reader and touch layout at 360px width. Check OS reduced
   motion. Native control appearance and key commands are browser-dependent.
6. Complete/retry the quiz and reload Dashboard. Verify the same badge once,
   saved chapter positions, and unchanged Apollo 17/Perseverance voices.
