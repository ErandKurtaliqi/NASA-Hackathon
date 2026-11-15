# Apollo 11 LRRR narration correction

## Git base and concurrent changes

Initial main: `c73f29d6c602dbe5dec910cb7218cbb9316b4c80`.
While the fix was being validated, main advanced to
`a531c5fb61c0bd499cb10cf053436bb7effa4c7e`. That update was integrated with a
fast-forward. Its English documentation was preserved, and the new editorial
decision was added in English. The full baseline was measured again on that main
before reapplying the fix. No other repository or developer worktree was changed.

## Narrative and editorial decisions

Meet Me now starts with `The Moon was about to welcome its first human explorers`.
Only the duplicate `1. Meet Me "` prefix was removed from the display script.
The rest of that paragraph, the source archive, and all original MP3 bytes remain
unchanged.

| Segment | Exact original | Runtime decision |
| --- | --- | --- |
| Carried Out by Hand, 2/3 | `/audio/apollo-11/chapter-2/3.mp3`, 295,297 bytes, 17.397551 encoded seconds | Remains held. The original names Neil as deployer; NASA sources A/B disagree. No corrected approved recording is available. The supported crew-wide reading remains. |
| Set Down Once, Forever, 2/4 | `/audio/apollo-11/chapter-2/4.mp3`, 256,845 bytes, 14.994286 encoded seconds | Remains held for individual deployment attribution. The supported approximate 14-meter distance is no longer described as the blocker. |
| More Than a Mirror, 4/4 | `/audio/apollo-11/chapter-4/4.mp3`, 326,226 bytes, 19.330612 encoded seconds | Enabled after the user explicitly confirmed Haroon listened to and approved the complete original. Displayed text uses the approved original script; the scientific provenance note remains. |

The human approval for 4/4 was explicitly confirmed in the session. It does not
authorize 2/3, 2/4, or changes to Apollo 17. Full details and the NASA sources are
recorded in [scientific-decisions.md](review-safe/scientific-decisions.md).

SHA-256 values match both the original inventory and held-recording audit:

- 2/3: `d93c30a9d98f9a1134e9312e1f471a9f7d04a91a5005305d0ef9ff0955494a96`
- 2/4: `3e312660649f703cc7d4dbdde40cf6a5ca601ecbd2ef88e1c932d3a54cd98689`
- 4/4: `4166f8c94a0b51b81bc113f1c81c31f6fc39c67621d76eda5eaabc3283d47bc4`

These were editorial holds, not missing files, incorrect segment mapping, invalid
HTTP content types, or defective MP3s. No playback-controller change was needed.

## Verification

- The MPEG Layer III frame parser verified original hashes, frame structure, and
  inventory durations for all three files. PyAV decoded every file to nonzero
  audio samples. A local faster-whisper small transcription corroborated the
  expected wording, including Neil in 2/3 and 2/4. This is an unverified machine
  transcript, not human listening or a published caption. Haroon's listening
  approval for 4/4 was supplied by the user, not inferred from ASR.
- Focused tests: **44 passed, 0 failed**. This covers narrative cleanup, all three
  mappings/hashes/editorial states, audio controls, context changes, autoplay
  rejection, quiz results, and progress persistence.
- Full suite on updated main: **278/351 passed, 73 failed**. With this fix:
  **283/356 passed, the same 73 failed**. Failure names were compared; there are
  **zero new failures**. The earlier main measured at the start had the same
  failure count. Historical test failures remain outside this fix.
- TypeScript and production build passed after integrating concurrent main.
  The existing bundle-size warning remains. Git whitespace checks passed with
  `core.whitespace=cr-at-eol`, respecting the repository's existing CRLF files.

Real Chrome tested the integrated production build at 1366x768:

- Each of the three original files returned `audio/mpeg`, played to its end after
  a button gesture in an isolated native player, produced a nonzero Web Audio
  signal, and had no media errors. This QA player does not bypass the application
  holds in the shipped documentary.
- In the actual Apollo 11 documentary, all 15 segments were checked. Both disputed
  clips remained silent with explicit review status. The other 13, including
  More Than a Mirror, played their correct files. Mute stopped the playback clock,
  unmute restarted the selected recording, scrolling replaced the previous voice,
  returning to 4/4 selected its approved file, and no overlap was observed.
- A fresh document verified blocked autoplay before user activation. The test
  waits for the initial attempt before DevTools evaluation, since evaluation can
  grant transient activation and invalidate an autoplay test.
- The other seven documentaries each passed two narration segments and a complete
  quiz/timeline/badge/reload journey. Apollo 11 passed the same completion flow.
- No JavaScript exceptions or audio/media errors occurred. Chrome logged an
  existing `/favicon.ico` 404; no narration request failed.

Browser limitation: Chrome ran headless. Playback, decoded signal, volume, mute,
timing, and error state were measured; this is not a claim that the agent heard
physical speakers. The complete original listening approval for 4/4 is Haroon's,
as explicitly confirmed by the user.

The browser run is reproducible with `scripts/verify-apollo11-narration.mjs` and
the same `AURORALYS_PLAYWRIGHT_MODULE`, `AURORALYS_CHROME_PATH`,
`AURORALYS_QA_URL`, and `AURORALYS_QA_OUTPUT` variables documented for
`verify-documentary-layout.mjs`. Local evidence is under
`../qa-artifacts/apollo11-narration/`, including screenshots and
`browser-integrated/browser-results.json`.

## Files changed

- `src/features/storytelling/apollo11PackageScripts.json`
- `src/features/storytelling/moonRecordings.ts`
- `docs/review-safe/held-recordings.json`
- `docs/review-safe/scientific-decisions.md`
- `tests/apollo11-narration.test.mjs`
- `tests/continuous-story.test.mjs`
- `tests/moon-scope.test.mjs`
- `tests/documentary-ux.test.mjs`
- `scripts/verify-apollo11-narration.mjs`
- This report.

Remaining editorial decision: reconcile the individual deployment attribution
for 2/3 and 2/4, then approve a consistent recording. Until then, their collective
reading remains available and their disputed original narration remains held.
