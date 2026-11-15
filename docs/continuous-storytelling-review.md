# AURORALYS continuous documentaries

Base: `origin/review/eight-mission-release-safe`, `4ddd64cb709e93ebfe4fc2afa56b1438afd8d80f`. Local
branch: `review/continuous-storytelling-office`. No automatic publication.

## Diagnosis and architecture

The previous presentation mounted an adapter per chapter and navigated through
`/story/:storyId/:chapter`. The change of path reconstructed scene and players; some adapters also
advanced as they crossed a travel limit. This prevented keeping the hardware in position throughout
the mission.

`ContinuousStoryPage` mounts a single scene, a single hardware, and a single audio element per
mission. The central reader contains the five full chapters, activities, quiz, and sources.
It moves its content by native scroll; it does not intercept wheel/touch, does not snap, or changes
URL. Chapter and segment buttons are scroll/focus shortcuts.

`/story/<mission-id>` opens the full documentary. The forty old links `/story/<mission-id>/1`...`/5`
open the same document in the requested chapter, even without previous progress. Read is available;
saving the completion still requires intentional actions and the prerequisite of the chapters.

The detection uses real positions relative to the reader, a 22% activation line (maximum 96 px),
12-px hysteresis and a single requestAnimationFrame per update. The same calculation handles forward scrolling, jumps, and backward scrolling. It never completes a chapter on scroll.

The background and `StoryHardware` reuse the approved resources and components without modifying
their internals. The three-column structure and photographic composition of Apollo 15 remain; change
the reading container and controls. On mobile it is initially adapted to hardware/evidence above and
reader below. Long credits have their own scroll without moving the image.

A real overlap was corrected at 1024×768: the height of evidence and hardware credits could be
extended behind the audio. The panel now uses the available flexible space and the presentation is
adjusted to low screens. The limits are checked in the browser QA, in addition to the measurements
during the tour.

## Evidence, audio and subtitles

`continuousStory.ts` adapts existing manifests: 126 narrative segments, 40 logical chapters and
existing questionnaires. Each segment has mission/chapter/segment identity, script, recording,
evidence, source and explicit requirement. It does not contain coordinates or invent photographs.

`DocumentaryEvidence` retains the above image, caption, and credits while loading the next one. The
frame maintains its dimensions. Segments without direct image tell and link the source. Photographs,
terrestrial models, diagrams and frames are distinguished. No new videos or automatic playback were
incorporated.

`DocumentaryAudio` retains the same HTMLAudioElement. Before pressing Play Narration does not play
anything. Then switch to the audio of the active segment, restarting it from the beginning as well
when you go back. Pause persists while moving; Play resumes the current recording. It maintains
accessible volume, position and controls. Loads/reproduction are cancelled when changing context or
exiting. An autoplay rejection requests Play; an absent recording lets you continue reading and
allows you to retry. The questionnaire shares the player and stops it when displaying results.

The synchronization is **per segment**, not by word or by sentence. All scripts are visible.
Estimated times were not added: existing manifests still have pending cue timing. Decoding does not verify a transcription.

### Original coverage verified locally

| Mission | Available recordings | Total duration measured |
|---|---:|---:|
| Apollo 15 | 19 | 295,78 s |
| Apollo 16 | 18 (4/4/3/4/3) | 237,92 s |
| Sojourner | 19 | 265,04 s |
| Opportunity | 19 | 297,77 s |
| Viking 1 | 18 | 246,99 s |
| Ingenuity | 19 | 262,66 s |
| Apollo 11 | 0 local recordings; 18 in the manifest | Pending |
| Apollo 17 | 0 local recordings; 20 in the manifest | Pending |

The 112 available MP3s were verified by SHA-256, size and actual decoding in Chrome. The five
external packages provide 93 originals; the 19 Apollo 15 were already published. No inventory group
has duplicated hashes. 19 copies of Opportunity were excluded from Viking 1's ZIP.

The 78 segments of the five local PDFs are entirely consistent with their standard texts
(spacing and punctuation), without rewriting them. A rendered page of Apollo 16 PDF was also inspected. This
documentary comparison does not replace the editorial listening of the recordings. Apollo 11/17 did
not appear in Downloads (including ZIP/hidden folders), input locations or revised worktrees.

The private originals remain outside the repository. `localStoryMedia.mjs` only uses known MP3 paths
when an external directory is expressly configured. It works in dev/preview, only by loopback;
checks Host and Origin, realpath, methods and Range requests. It does not copy files to public/dist or
include them in the bundle. Vite prioritizes the existing JS file: they were updated both JS/TS
configurations and a regression was added for this precedence.

## Scientific review pending

The existing clarifications and the seven Moon audio recordings remain on hold:

- Apollo 11 `journey:3`, `journey:4`, `legacy:4`: deployment/distance attribution.
- Apollo 17 `journey:4`, `challenges:2`, `challenges:3`, `legacy:1`: distances, battery indicators,
  age of volcanic glass and parking.
- Viking 1 `legacy:1`: script from January 1981; existing revision indicates January 1982. Requires
  editorial decision/recordation. `challenges:3`: biology did not demonstrate life. It remains a
  stationary lander.
- Sojourner `meet:2`: mass discrepancy; `challenges:1` and `challenges:4`: reports of the
  modem/white floor without sufficient direct evidence; `legacy:1`: distinguish sols from Earth days.
- Apollo 16 `meet:4`: bright rock metaphors/guard; `legacy:2`: UV camera independent of rover and
  number of objects pending specialist verification.
- Ingenuity `challenges:3`: geological interpretation, non-groundwater detection; `legacy:1`:
  accident reconstruction; `legacy:3`: Future SkyFall and conceptual image.

These are issues documented in the previous system, preserved and exhibited here. This
implementation does not constitute a new scientific approval of these stories. Complete listening,
pronunciation, omitted phrases and fine cues need human revision.

## Progress and accessibility

No change `beyond-earth-progress`, your schema, missions or badges. The real store, the durable
script confirmation, the shared questionnaire, `Apollo16Quiz`, `LaserRangingActivity` and
`EvidencePredictionActivity` are reused.

Each chapter is marked by explicit action and in order. The questionnaire still requires completion
of the answers before completing the mission. Retrying does not eliminate a mission already saved or
duplicate its badge. Completion reconciles the old flat format and modern record without deleting
other missions. Storage bugs show an accessible warning from any chapter and allow you to retry
without repeating the questionnaire. It is never stated to be durable if the browser refused the
writing.

The reader is a named and focused region; PageDown/PageUp, touch, wheel and native controls remain
available. There is a single shell main, full chapter names, controls of at least 44 px and
reduced-motion support. Polite ads correspond to status/segment, not to every word. NVDA, VoiceOver,
Safari, or physical devices have not been certified.

## Implementation Files

New:

- `src/components/storytelling/ContinuousStoryPage.tsx`
- `src/components/storytelling/ContinuousStoryPage.module.css`
- `src/components/storytelling/DocumentaryActivities.tsx`
- `src/components/storytelling/DocumentaryAudio.tsx`
- `src/components/storytelling/DocumentaryEvidence.tsx`
- `src/components/storytelling/DocumentarySaveWarning.tsx`
- `src/features/storytelling/continuousStory.ts`
- `src/features/storytelling/documentaryNarration.ts`
- `scripts/localStoryMedia.mjs` and `scripts/localStoryMedia.d.mts`
- `scripts/story-continuous-qa.mjs`
- `tests/continuous-story.test.mjs`
- `tests/helpers/continuous-story-contract.mjs`
- This report.

Modified files:

- `src/App.tsx`: two entries to the documentary; rest of the shell unchanged.
- `src/components/MachineStoryPage.tsx`: only export with aliases of the existing quiz.
- `src/components/storytelling/Apollo16Quiz.tsx`: optional point for storyteller sharing; previous
  behavior preserved when not provided.
- `vite.config.js` and `vite.config.ts`: optional local plugin.
- `tests/application-routes.test.mjs`: complete documents on 8 canonical routes and 40 old ones.
- `tests/eight-mission-cinematic.test.mjs`, `tests/helpers/moon-scope-contract.mjs` and
  `tests/storytelling-landmarks.test.mjs`: historical comparisons allow only exact route/export
  connections. Protected content is retained; new routes are tested separately against real code
  without such standardization.

No changes to homepage, browsers, GIS/3D, coordinates, images, narratives, questions, store or
manifests of existing ones.

## Validation and reproduction

The complete suite passed 269 tests. TypeScript and production are checked with `npm.cmd run build`;
also `git diff --check`. Three's big chunk notice is pre-existing; no dependencies were added.

Chrome’s real QA runs forward/back each segment in all eight missions, in 1440×900, 1024×768 and
390×844: 24 views, 804 contexts and forty old links. Compare rectangles/styles/sources of hardware
and its frame, background and image, scene, evidence and controls; check node identity and absence
of overlap/overflow. Includes slow wheel, jumps, recoil, native touch emulated, PageDown, Enter,
reduced-motion, real audio, pause, browsing cleanup, activities, quiz/completed/reload/repeat the
eight missions and quota recovery.

Commands, from this worktree and with authorized external resources already organized:

```powershell
$env:AURORALYS_LOCAL_STORY_AUDIO = '<external-authorized-audio-directory>'
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5212 --strictPort
# In another terminal, with Chrome isolated from QA and debugging enabled:
node scripts/story-continuous-qa.mjs http://127.0.0.1:5212 9344 '<external-QA-output>' --local-audio
node --test --test-concurrency=1 tests/*.test.mjs
npx.cmd tsc -b --pretty false
git diff --check
```

The external directory contains `apollo-16/chapter-1/1.mp3`, etc., depending on the existing routes,
without the prefix `audio/`. Do not activate this local server behind a public proxy or interpret
the permission to use as a redistribution permit.

The captures, original inventories, hashes, durations, PDF comparison, visual comparison and JSON
results are saved in the external QA directory of this task. They are not part of the commit nor are
recordings/PDF/ZIP published.

Pending a public narrated delivery: original Apollo 11/17, distribution/hosting decision, editorial
listening, verified cues and resolution of scientific discrepancies. Remote NASA images require
network. Available context photos do not individually document each action of the story.
