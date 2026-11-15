# Final Moon presentation fixes and Apollo 11 narration decision

## Git coordination

Initial main was `5b72bd6f44b141bd99e3f8150003f162dfac4627`, containing the
published Apollo 15 correction. During validation, main advanced to
`9a0c755a0cd0b94319abbd2d426e291541a0aae7` with the planet-preview startup change.
That change was integrated with a fast-forward and preserved. Main then advanced
to `0eedbb30acf25cfe27b392e219b9e071ab87285c` with the loading-indicator change.
It was also integrated with a fast-forward, followed by a fresh baseline, build
and browser rerun. No parallel source-editing process was used.

## Paragraph status

- **Apollo 15: all eight corrections preserved.** Launch & Landing, Lunar
  Environment & Controls, One-sixth Gravity, Milestones, Final Science Moment,
  Filming Liftoff, Current Status and Reflection retain one original main
  paragraph. Their data and MP3 mappings are unchanged.
- **Apollo 16: all four redundant paragraphs removed.** Launch & Arrival, The
  Lunar Environment & Interactive Controls, Three Surface Excursions and The
  Lunar Rover Grand Prix now render only the approved main narration paragraph.
- The production change is exactly one deleted Apollo 16 conditional rendering
  line in `ContinuousStoryPage.tsx`. Shared journey data, original scripts,
  headings, evidence, activities, quizzes, sources and navigation remain.
- Four new rendering regressions failed before that deletion and pass after it.
  The test suite also preserves Apollo 17's legitimate extra student-context
  paragraph. This is not a global removal of second paragraphs.

## Two Apollo 11 voices - separate technical and editorial status

| Segment | Current application | Functional replacement prepared | Remaining decision |
| --- | --- | --- | --- |
| Carried Out by Hand, 2/3 | Disputed original remains held; neutral reading remains available | New, separate generic synthetic MP3 of the existing neutral paragraph; exact local ASR match, real nonzero signal and complete native Chrome playback verified | Approve the supplied neutral script and synthetic voice/assets for project publication |
| Set Down Once, Forever, 2/4 | Disputed original remains held; neutral reading remains available | New, separate generic synthetic MP3 of the existing neutral paragraph; exact local ASR match, real nonzero signal and complete native Chrome playback verified | Same explicit replacement-release decision |

The issue was not dismissed because the original files are valid. No approved
neutral recording was found. A working replacement candidate was generated for
each clip using installed Microsoft Zira Desktop via System.Speech, without
cloning a person or claiming NASA/astronaut provenance. The preview MP3s are
separate files, generated from the supported neutral readings, without disputed
individual deployment attribution. Original MP3s were not modified.

No approved asset-generation workflow for these clips was found in the project.
The new voice/assets were therefore prepared as reviewable previews and release
authorization was requested. That decision remains pending. They are outside
`public/` and the production build and are not selected by the application.
**The two in-documentary voices are not reported fixed or authorized.**

The exact two scripts, files, SHA-256 values, generation method and full preview
checks are in [apollo11-neutral-narration-proposal.md](apollo11-neutral-narration-proposal.md).
If approved, the next step is explicit replacement mapping, provenance labels,
retention of original holds, and desktop/mobile in-documentary playback,
mute/scroll/return validation before release. No unsupported original words or
unapproved synthetic assets are activated in this commit.

## Scientific and editorial decisions

The Apollo 11 neutral readings use collective deployment attribution and passive
reflection without electrical power. This avoids choosing silently between the
conflicting individual attributions. The supported approximate placement distance
is not the reason for the original attribution hold.

The earlier Apollo 11 Meet Me fix and More Than a Mirror approval remain intact.
All four approved Apollo 17 text/audio alignments and their separate NASA source
context remain unchanged. The Apollo 17 authorization does not apply to the two
disputed Apollo 11 originals or to the proposed replacement voice.

## Combined validation

- Focused tests: **66 passed, 0 failed**, covering all eight Apollo 15 duplicates,
  all four Apollo 16 duplicates, legitimate additional content, original mappings,
  Moon review decisions, quiz and persistence.
- Latest main baseline: **302 passed / 375 tests, 73 failed**. Final integrated
  suite: **306 passed / 379 tests, the same 73 failures**. Failure names were
  compared; **zero new regressions**. The earlier initial main also had 73
  inherited failures.
- TypeScript and production build passed after integrating the concurrent change.
  Git whitespace checks passed. The existing large-bundle warning remains.
- Paragraph browser QA: **12 complete journeys**. Apollo 15 and Apollo 16 were
  tested at **1600x667, 1366x768 and 390x844**, including all 16 and 15 segments:
  **93 rover segment/viewport checks**, with **36 checks of the twelve reported
  affected segments**. Correct original paragraph, recording, Sound On/Off,
  restart, active-segment changes, visible configured evidence, timeline, quiz,
  badges and persisted completion were checked. Other six stories passed smoke
  journeys with audio and completion.
- Apollo 16's pre-existing empty gallery for Fender Accident remains deliberately
  empty; it is not one of the four reported journey segments. No unrelated
  photograph was invented to satisfy a blanket evidence assertion.
- Additional integrated Moon QA: **10 journeys**, including every Apollo 11 and
  Apollo 17 segment at desktop/mobile sizes, both original Apollo 11 holds, all
  four approved Apollo 17 recordings fully played inside the documentary,
  source disclosures, reverse jumps, mute, quiz, badge and reload.
- Both synthetic previews played fully in an isolated Chrome player after a
  gesture, with nonzero Web Audio signal, functional Stop and no media errors.
  This is technical preview success, not in-documentary publication approval.
- Browser runs used real headless Chrome. No JavaScript exceptions or audio
  errors occurred. Existing favicon 404 and bundle/test warnings remain outside
  this focused correction. Playback/signal measurements are not human listening
  or a voice-approval certificate.

Evidence is under `../qa-artifacts/final-moon-fixes/`, including integrated browser
results, screenshots, `test-comparison.json` and `replacements/` preview assets.

## Files changed

- `src/components/storytelling/ContinuousStoryPage.tsx`
- `tests/documentary-layout.test.mjs`
- `scripts/verify-apollo15-paragraphs.mjs`
- `docs/apollo11-neutral-narration-proposal.md`
- This report.

Pending: authorization to release the two new neutral synthetic replacements and
their final in-application integration/QA. The independently verified paragraph
fixes are ready for normal main publication without activating unapproved audio.
