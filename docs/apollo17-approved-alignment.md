# Apollo 17 approved text/audio alignment

## Authorization and scope

Base main: `4de8aab39dbc49244bf2c6f8b4ca845167f05488`.
The user supplied Haroon's explicit response:
**"Yes. We must have to match our text with narration."** The user confirmed that
this authorizes restoring the four Apollo 17 original scripts and aligning them
with their existing recordings. It supersedes the previous proposal-only state
for these four records and does not authorize pending Apollo 11 recordings.

## Result

| Apollo 17 segment | Displayed story and recording | Separate scientific context |
| --- | --- | --- |
| 2/4, Three Journeys, One Moon | Original script restored; original MP3 enabled and played completely inside the documentary | 35.9 km and 4 h 26 min describe rover driving across the traverses, not total lunar EVA time; the approved original says exploring |
| 3/2, A Warning from My Battery | Original script restored; original MP3 enabled and played completely inside the documentary | Battery 2 temperature indication fault, not a loss of battery power; Mission Report section 9.1, printed page 9-1 |
| 3/3, Mystery of Orange Soil | Original 3.7-billion-year wording restored; the original MP3 says the same figure and played completely inside the documentary | NASA's historical 3.5-3.7-billion-year cooling range and other approximately 3.6-billion-year summaries remain scientific context |
| 4/1, My Final Place | Original script restored; original MP3 enabled and played completely inside the documentary | Approximately 158 meters from Challenger, positioned to televise liftoff |

The four alternate `readingText` overrides are removed. The existing supplied
scripts are used directly rather than rewriting the story from an ASR transcript.
All original MP3 bytes and both package script archives are unchanged.

Scientific explanations and direct NASA links remain in the separate Mission
sources disclosure. No clarification boxes are added to the narrative. The
approximately 3.6-billion-year alternative is not displayed as a transcript of
the recording that says approximately 3.7 billion years. Source details remain in
[scientific-decisions.md](review-safe/scientific-decisions.md).

The per-recording `editorialApproval` explicitly records Haroon's authorization.
`listening: machine-verified` distinguishes the actual local content checks from
human listening. No separate personal listening confirmation by Haroon or the
agent is inferred. The general `review-required` guard remains functional and
continues to stop any held original.

## Actual audio verification

The four original files were fully decoded and compared with their supplied
scripts using local faster-whisper small and base, without a script prompt. Both
models corroborate the main phrases and figures: exploring, temperature gauge,
3.7 billion years and 158 meters. Their punctuation, articles, tense and proper
name predictions vary; these machine predictions are not promoted to verbatim
transcripts or used to rewrite the approved source. No new factual contradiction
was found in the checked claims. Caption timing remains pending.

All four SHA-256 values match both original inventories:

- 2/4: `bb7c552d17fbc9560e2e7185210f55d1e8ce2970095980ac7332be91fabfb935`
- 3/2: `fb948c4e26aaa95e5f31ee9c70a98a2d51f808c4d4bd79588230a85cb490df19`
- 3/3: `11e94734da411667e9c1c528797695bf295b664c7cf31c4e44276e049ac4edf4`
- 4/1: `3597a3efdcbb07d793d481e7deae2ff8f8484b0b42e4f1f6ea994b44d6b2669a`

## Preserved Apollo 11 state

- Meet Me still starts naturally without its duplicate heading or opening quote.
- More Than a Mirror retains its earlier, separately confirmed approval and
  working narration.
- Carried Out by Hand (2/3) and Set Down Once, Forever (2/4) remain held for their
  independent deployment-attribution review. Safe collective readings remain.
- All Apollo 11 audit records are unchanged. The Apollo 17 authorization is not
  applied to those two recordings.

## Validation

- Focused tests: **52 passed, 0 failed**. They cover hashes, mappings, exact
  restored scripts, approval versus listening state, future hold enforcement,
  Apollo 11 regression checks, audio controls, quiz results and persistence.
- Complete baseline and final suite: **291 passed / 364 tests, 73 inherited
  failures** in both runs. Failure names match: **zero new regressions**.
- TypeScript and production build passed. Git whitespace checks passed with
  `core.whitespace=cr-at-eol`, respecting existing CRLF files. The existing
  large-bundle warning remains.
- Real Chrome production QA: **7 complete native playback checks and 10 story
  journeys**. All eight stories were tested at 1366x768; Apollo 11 and Apollo 17
  were additionally tested at 390x844, including all 15 and 17 segments.
- The four affected Apollo 17 recordings also played completely inside the real
  documentary, with their matching paragraphs and stable active-segment state.
  Forward and reverse scroll, returning to each approved segment, Sound On/Off,
  stopped playback clocks, restart and absence of overlapping playback passed.
- Scientific notes and all four source links, timeline, complete quiz, badges,
  completion and persistence after reload passed. Autoplay rejection before a
  user gesture was verified. No horizontal overflow, JavaScript exceptions or
  media errors occurred. The existing favicon 404 is unrelated to narration.

Chrome ran headless. Actual playback, decoded signal, volume, mute, timing and
media-error state were measured; no claim is made that the agent heard physical
speakers. Evidence, transcripts and screenshots are under
`../qa-artifacts/apollo17-approved/`, including `spoken-verification.json`,
`browser/browser-results.json` and `test-comparison.json`.

## Files changed

- `src/features/storytelling/moonRecordings.ts`
- `docs/review-safe/held-recordings.json`
- `docs/review-safe/scientific-decisions.md`
- `docs/apollo17-restoration-proposal.md` (updated to approved status)
- `docs/moon-narration-combined-status.md` (marked as the historical stage)
- This approved-alignment report.
- `tests/moon-review-playback.test.mjs`
- `tests/continuous-story.test.mjs`
- `tests/moon-scope.test.mjs`
- `tests/workstream-b-apollo17.test.mjs`
- `scripts/verify-apollo11-narration.mjs`

Remaining: the two independent Apollo 11 editorial holds, the inherited test
failures, favicon 404 and existing build-size warning. The four requested Apollo
17 text/audio alignments are complete.
