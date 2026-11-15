# Moon narration safeguards and combined status

## Publication scope

Base main: `5556273ff67a5732bd6af3c2bf6c926e798c18e5`, the published Apollo 11
correction. That commit and its fixes are preserved. The user explicitly stated
that no individual listening/editorial approval has been confirmed for the four
Apollo 17 originals and requested a restoration proposal while obtaining it.

This change publishes the independent safeguards, verified scientific notes,
source links, tests, and proposal documentation. It does **not** deploy the four
original Apollo 17 texts as approved narrative or activate their recordings.
Existing alternate readings remain until confirmation. The complete proposed
paragraphs and per-recording decisions are in
[apollo17-restoration-proposal.md](apollo17-restoration-proposal.md).

## Seven-recording status

All seven original MP3s match their inventory SHA-256 values, parse as MPEG
Layer III, decode to nonzero audio samples, and played fully to their end in an
isolated real Chrome player after a button gesture. This isolated test verifies
file health without changing application approval states or MP3 bytes.

| Mission / segment | Root cause | Original verified | Displayed text / proposal | Scientific review | Actual documentary playback | Result |
| --- | --- | --- | --- | --- | --- | --- |
| Apollo 11 2/3, Carried Out by Hand | Intentional editorial hold | Hash, frames, full native playback | Supported crew-wide reading retained | Individual deployment attribution differs across NASA accounts | Held in desktop/mobile; no original audio plays | Editorial decision pending |
| Apollo 11 2/4, Set Down Once, Forever | Intentional editorial hold | Hash, frames, full native playback | Supported collective reading retained | Approximate 14 m supported; individual attribution pending | Held in desktop/mobile | Editorial decision pending |
| Apollo 11 4/4, More Than a Mirror | Former editorial hold | Hash, frames, full native playback | Approved original text retained | Complete original listening/approval explicitly confirmed by the user for Haroon | Correct original plays, stops, restarts and survives return navigation | Fixed in preserved Apollo 11 commit |
| Apollo 17 2/4, Three Journeys, One Moon | Alternate reading plus ignored hold | Hash, frames, full native playback | Original proposed; current alternate remains published | 35.9 km and 4 h 26 min are driving figures, not total lunar EVA time; original says exploring | Hold now enforced in desktop/mobile | Safeguard fixed; restoration pending |
| Apollo 17 3/2, A Warning from My Battery | Alternate reading plus ignored hold | Hash, frames, full native playback | Original proposed; current alternate retained | Temperature indicator fault supported by Mission Report section 9.1, not battery power loss | Hold now enforced | Safeguard fixed; restoration pending |
| Apollo 17 3/3, Mystery of Orange Soil | Alternate reading plus ignored hold | Hash, frames, full native playback | Original 3.7-billion-year wording proposed; published alternative remains 3.6 billion | NASA historical cooling-age range is 3.5-3.7 billion years; source/approximation must be explicitly accepted | Hold now enforced; no contradictory original voice plays with the alternative reading | Safeguard fixed; restoration pending |
| Apollo 17 4/1, My Final Place | Alternate reading plus ignored hold | Hash, frames, full native playback | Original proposed; current alternate retained | Approximate 158 m supported by NASA History | Hold now enforced | Safeguard fixed; restoration pending |

Meet Me remains fixed: the first Apollo 11 paragraph starts naturally with
`The Moon was about to welcome its first human explorers`, without the duplicate
heading or opening quote. The four original Apollo 17 package scripts, all
original MP3s, quizzes, and progress schema are unchanged.

## Implementation

- The continuous adapter now honors `review-required` for both Moon missions.
  Previously it enforced that state only for Apollo 11, so Apollo 17 could play
  an original while displaying a different editorial alternative.
- Each Apollo 17 review note links directly to the verified primary source in
  Mission sources. No scientific clarification boxes were restored in the
  narrative. Notes distinguish driving/EVA time, indicator/power failure,
  published age estimates, and approximate final parking distance.
- Important narration status messages now occupy a responsive width instead of
  the sound button's 44 px column. Mobile screenshots and browser assertions
  verify the complete review notice remains readable without overlap.
- The proposed four-line restoration patch was compiled separately and verified
  to restore the original texts while still retaining playback holds. It is not
  applied to the source or included in the production bundle.

## Scientific evidence

The Apollo 17 Mission Report was downloaded and PDF page 129, printed page 9-1,
was text-extracted and checked. NASA NSSDCA's rover overview confirms the driving
figures. NASA SP-350 chapter 14.6 and the sample 74220 compendium provide the
historical age context; NASA History supports the final VIP parking distance.
Links, precise findings and the historical review record are preserved in
[scientific-decisions.md](review-safe/scientific-decisions.md).

Local faster-whisper small analysis corroborates the four original scripts,
including exploring, temperature gauge, 3.7 billion years and 158 meters. It is
an unverified machine candidate, not human listening or editorial approval.
No replacement audio, verbatim transcript, or caption timing was fabricated.

## Validation

- Focused tests: **52 passed, 0 failed**, covering all seven mappings, original
  integrity, review states, future Apollo 17 holds, preserved Apollo 11 fixes,
  audio controls, autoplay handling, quiz results and persistence.
- Full baseline on current main: **283 passed / 356 tests, 73 failed**.
  Final suite: **291 passed / 364 tests, the same 73 failed**. Failure names were
  compared: **zero new regressions**.
- Production build and TypeScript passed. The existing large-bundle warning
  remains. Git whitespace checks passed with `core.whitespace=cr-at-eol` to
  respect the existing CRLF files.
- Real Chrome: **7 full native playback checks** and **10 documentary journeys**.
  All eight requested stories were tested at 1366x768; Apollo 11 and Apollo 17
  were also tested at 390x844, including all 15 and 17 narration segments.
- Both runs checked Sound On/Off, stopped playback clocks, source changes,
  returning to segments, absence of overlapping playback, timeline, complete
  quizzes, badges, completion and saved progress after reload. A fresh document
  verified autoplay rejection before user activation.
- Scientific disclosures and all four direct Apollo 17 source links were tested.
  Final UI checks confirmed review-notice width, full text visibility, and no
  horizontal overflow. No JavaScript exceptions or media errors occurred. The
  existing favicon 404 is unrelated to narration.

Chrome ran headless. Playback, signal, volume, mute, timing and media error state
were measured; this does not claim the agent listened through physical speakers.
Only Apollo 11 4/4 has the explicit human listening approval supplied in this
session. No such approval is claimed for Apollo 17.

Local evidence is in `../qa-artifacts/apollo17-alignment/`: `browser/` contains
the seven full native checks and initial journeys; `browser-final/` contains the
final responsive journeys after the warning-layout adjustment. Unchanged MP3s
were not needlessly replayed for the layout-only rerun. Proposal artifacts are
`proposed-texts.json`, `proposed-moonRecordings.ts`,
`restoration-proposal.patch`, and `proposal-validation.json`.

## Changed files

- `src/features/storytelling/continuousStory.ts`
- `src/features/storytelling/moonRecordings.ts`
- `src/components/storytelling/ContinuousStoryPage.module.css`
- `docs/review-safe/held-recordings.json`
- `docs/review-safe/scientific-decisions.md`
- `docs/apollo17-restoration-proposal.md`
- This combined report.
- `tests/moon-review-playback.test.mjs`
- `tests/continuous-story.test.mjs`
- `tests/documentary-ux.test.mjs`
- `scripts/verify-apollo11-narration.mjs`

Pending: Haroon's per-recording Apollo 17 listening/editorial decisions, including
the driving-time wording and age/source choice; the two disputed Apollo 11
deployment recordings; the inherited test failures and favicon warning. The
eight originally reported issues are not represented as fully resolved.
