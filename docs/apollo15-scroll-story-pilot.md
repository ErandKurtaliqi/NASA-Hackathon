# Apollo 15 scroll-story pilot

Implementation checkpoint: 2026-11-08. This is an isolated Apollo 15 presentation,
not a replacement for Apollo 17 or Perseverance. Haroon's supplied images guide
composition only; they are not historical evidence or application assets.

## Exact change inventory

Modified:

- `src/components/MachineStoryPage.tsx`
- `src/components/storytelling/StoryMedia.tsx` (accepted media type only)
- `tests/apollo-progress-persistence.test.mjs`
- `tests/apollo15-narration.test.mjs`
- `tests/apollo15-registration.test.mjs`
- `tests/helpers/apollo-quiz-contract.mjs`

Created:

- `src/components/storytelling/Apollo15ScrollStory.tsx`
- `src/components/storytelling/Apollo15ScrollStory.module.css`
- `src/components/storytelling/RoverStoryLayout.tsx`
- `src/components/storytelling/RoverStoryLayout.module.css`
- `src/components/storytelling/StoryRecording.tsx`
- `src/features/storytelling/apollo15CaptionTiming.ts`
- `src/features/storytelling/apollo15StoryMedia.ts`
- `src/features/storytelling/chapterScrollBoundary.ts`
- `src/features/storytelling/storyCues.ts`
- `tests/apollo15-scroll-story.test.mjs`
- `docs/apollo15-scroll-story-pilot.md`
- `public/images/apollo15-story/rover.jpg`
- `public/images/apollo15-story/rollout.jpg`
- `public/images/apollo15-story/field.jpg`
- `public/images/apollo15-story/genesis.jpg`
- `public/images/apollo15-story/hammer.jpg`
- `public/images/apollo15-story/final.jpg`

## Reused architecture and scope

- The existing `/story/:storyId/:chapter` resolver and five chapter IDs are retained.
  `/story/apollo-15-rover/1` begins at Meet Me; existing saved resume links still work.
- `RoverStoryLayout` supplies semantic rover / narrative / evidence slots. Apollo 15
  uses a real 2D rover photograph and requires no WebGL or new model.
- `useScrollStory` / `createScrollStoryController` retain natural scrolling, active
  segment selection, instant Previous/Next segment navigation and focused cards.
- `StoryMedia` retains loading/error/retry behavior and visible credits/source links.
  Its accepted type adds a generic actual-mission video-frame label; all existing
  media manifests and Perseverance presentation behavior remain unchanged.
- Existing Apollo 15 profile, journey, challenges/solutions, discovery log, legacy,
  questions, feedback, results/retry and reward data remain the source of content.
  Profile and discovery controls remain optional. A gravity prediction is an
  optional educational question, not a claimed historical event or repair task.
- `QuizChapter` is reused, including the final explanation and explicit View Results.
  Optional recording/reduced-motion props affect only the Apollo 15 pilot.
- The existing `finish` handler, legacy reconciliation, persistence acknowledgement,
  `ApolloProgressSaveStatus` and Retry saving are unchanged. No schema/IDs/badges or
  localStorage keys change. Reading/selecting steps does not save completion.

## Reading and chapter progression

The four original segments per chapter remain visible for reading. The active
segment selects one recording and contextual evidence. Desktop has three columns;
tablet puts the rover above two columns; mobile embeds evidence after each segment,
with all captions visible (overriding only the pilot's compact shared media styles).

Previous/Next Chapter remain explicit native controls. Chapters 1–4 can be continued
without mandatory activity clicks. A labelled checkbox enables/disables continuation
by scrolling past the end. This uses the same completion/save handler as Next Chapter,
only after the last segment, a downward reading gesture and the end boundary. Mount,
resize, programmatic segment navigation and audio ending do not complete chapters.
The quiz has no scroll completion: View Results and Complete Story retain their roles.
Storage failure remains visible on the next chapter and can be retried there.

Reduced motion removes pilot image transitions and quiz feedback motion; navigation
does not use smooth scrolling. Scrolling does not move keyboard focus; explicit
segment selection focuses its card, and route entry focuses its heading unless a
save warning already owns focus. Captions are not announced on every media update.

## Recordings and timing: deliberately incomplete

All 19 original MP3s and `src/apollo15Narration.ts` are unchanged from Erand's source.
They are the project's first-person story narration, not original NASA mission audio.
Chapter 1–4 segment index maps to `/audio/apollo-15/chapter-{1..4}/{1..4}.mp3`.
Quiz question index maps to chapter-5/{1..3}.mp3, never to an answer index.

`StoryRecording` reuses `bindRecordedNarration` for exclusive ownership and cleanup.
Sound on/off, Play, Pause, Resume and Replay are explicit. Muting pauses; unmuting,
scrolling, selecting another segment and entering a chapter never autoplay. Audio
is stopped/released on segment/question changes and unmount, and paused on route-link
intent, browser history navigation, page hide or document hiding. Network/play rejection
leaves reading available with a manual retry. `preload="none"` is used throughout;
only the next still image may be warmed, never all audio recordings.

`apollo15CaptionTiming.ts` registers all 19 paths as **pending** with empty cues.
There are no estimated timestamps. The 16 original scripts are readable segment
text, not certified verbatim captions. The quiz has question text, but no separately
approved verbatim transcripts of its three recordings.

To enable accurate synchronization, listen to each unchanged MP3, transcribe/check
its words, then enter `status: 'verified'`, reviewer/date and non-overlapping cue
start/end seconds in the timing registry. Each cue can specify a verified media ID.
`cueAt` uses actual `currentTime`, including seeks, and rejects invalid/unreviewed
cue sets. Times are start-inclusive/end-exclusive; gaps show no invented caption.
Until reviewed, imagery follows scroll segments, not sentence-level audio timing.
No perfect synchronization is claimed.

Original recordings contain simplifications (for example an "exact" return direction
and historical forward-looking Artemis language). Existing canonical journey/legacy
explanations remain visible alongside the original scripts, including navigation as
an estimate and future vehicles as engineering work, not promised outcomes. Further
script editorial changes need coordination; original recordings are preserved.

## Verified NASA evidence

Verified on 2026-11-08 against the NASA Image and Video Library search metadata and
NASA's [Apollo 15 surface history](https://www.nasa.gov/history/50-years-ago-apollo-15-on-the-moon-at-hadley-apennine/).
All exact original URLs, descriptions, meaningful alt text, dimensions, credit and
usage notes are recorded in `src/features/storytelling/apollo15StoryMedia.ts`.
Six local JPEG renditions total 441,052 bytes, downloaded without local image editing.

| Local file under `public/images/apollo15-story/` | Original ID / what it depicts | Type and credit | Official source |
| --- | --- | --- | --- |
| `rover.jpg` | AS15-88-11901, unoccupied rover at Hadley-Apennine, third EVA | Photograph; NASA | [NASA catalogue](https://images.nasa.gov/details/as15-88-11901) |
| `rollout.jpg` | S71-33786, May 11, 1971 rollout from the VAB; **not liftoff** | Photograph; NASA | [NASA catalogue](https://images.nasa.gov/details/S71-33786) |
| `field.jpg` | AS15-85-11451, David Scott at the rover beside Hadley Rille, July 31, 1971; not a photograph of the steering fault | Photograph; NASA / James B. Irwin (photographer identified in catalogue) | [NASA catalogue](https://images.nasa.gov/details/as15-85-11451) |
| `genesis.jpg` | AS15-86-11671, Genesis Rock before collection at Station 7 during EVA 2; not green volcanic glass | Photograph; NASA | [NASA history, Station 7 caption](https://www.nasa.gov/history/50-years-ago-apollo-15-on-the-moon-at-hadley-apennine/) |
| `hammer.jpg` | S71-43788, August 2, 1971 hammer/feather demonstration | Actual television frame; NASA | [NASA history](https://www.nasa.gov/history/50-years-ago-apollo-15-on-the-moon-at-hadley-apennine/), [demonstration explanation](https://science.nasa.gov/resource/the-apollo-15-hammer-feather-drop/) |
| `final.jpg` | AS15-88-11930, final surface photograph with Falcon and rover distant; not LRO imagery or ascent footage | Photograph; NASA | [NASA history, final surface photograph](https://www.nasa.gov/history/50-years-ago-apollo-15-on-the-moon-at-hadley-apennine/) |

Catalogue verification endpoint: `https://images-api.nasa.gov/search?nasa_id={ID}`.
Do not copy contradictory unit conversions from historical catalogue descriptions.
Date checks: [NASA mission](https://www.nasa.gov/mission/apollo-15/) and
[Apollo mission chronology](https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo.html):
launch July 26, lunar landing July 30, rover first driven July 31, return August 7, 1971.

Usage: [NASA Images and Media Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)
permit factual educational/informational uses subject to their conditions. Credit
NASA, do not imply NASA endorsement; respect third-party copyrights and identifiable
people's publicity/privacy rights, especially for commercial use. No NASA branding
rights are granted. These are original mission images, not generated reconstructions.

Segment evidence order:

| Chapter | Segment 1 | Segment 2 | Segment 3 | Segment 4 |
| --- | --- | --- | --- | --- |
| Meet Me | rover | field context | rollout context | rover |
| My Journey | rollout (labelled prelaunch) | rover | field context | field context |
| Challenges & Discoveries | field context | field context | Genesis Rock | field context |
| My Legacy | hammer/feather TV frame | final surface context | final surface context | rover |

Context photographs are not evidence of every spoken action. Dedicated verified
deployment/training/ascent/LRO photographs, additional evidence for green glass,
and a true launch photograph are future curation work; unrelated source links in
the original narration scripts are not automatically displayed as evidence.

## Proposed GIS contract — not implemented

Coordinate with Erand before map-pin navigation. A future optional event should
carry `{ storyId, chapterId, segmentId, locationId }` with a stable GIS-owned
`locationId`. GIS resolves coordinates/projections and validates mission ownership;
the story must not infer coordinates from narration or write geographic data.
Specify pin-to-story resume/unlock behavior, back navigation/focus restoration and
how unavailable locations degrade to reading before either side implements it.

## Validation and remaining review

Automated coverage includes cue validation/seeks, real scroll selection and explicit
selection, boundary intent/opt-out, audio controls/exclusivity/cleanup/retry, mobile
content availability, local NASA provenance, quiz/reward/legacy/save-recovery and
Apollo 17/Perseverance non-regression. Production build, TypeScript and diff checks
are required. These fixtures do not replace browser rendering or listening review.

Manually review `/story/apollo-15-rover/1` in Chrome at desktop, tablet and
360×800 / 390×844 / 439×591. Test natural wheel/touch/PageDown reading, chapter
continuation opt-out, focus and screen reader announcements, short viewports,
200% zoom, reduced motion, audio blocked/offline, pause/resume/replay, Back and
unmount. Check image loading failure/retry and blocked storage/Retry saving in a
separate test profile; do not erase real progress. Listen to all 19 recordings and
approve transcripts/cues before claiming synchronized captions or timed image cuts.

Validation at this checkpoint: 165 automated tests passed; production build and
TypeScript passed. The existing Three.js bundle-size warning remains.

The automated Windows browser inspection was blocked because Computer Use could
not determine the active Chrome URL confidently. No visual browser pass is claimed.
