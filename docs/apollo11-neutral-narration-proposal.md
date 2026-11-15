# Apollo 11 neutral replacement narration - decision pending

## Purpose and release state

The original 2/3 and 2/4 MP3s remain unchanged and under their individual
deployment-attribution review. No previously approved neutral replacement was
found in the project's recording inventory. Historical browser speech support
exists, but no approved asset-generation workflow was found for these two clips.

The user requested a functional, scientifically neutral solution and reviewable
scripts/assets if further editorial authorization was needed. Two separate
technical previews have therefore been generated outside `public/` and the
production build. They are not mapped into the application or published as
approved narration. Release authorization for this new synthetic voice/assets
has been requested and remains pending.

The previews use the existing supported neutral on-screen paragraphs verbatim.
They do not name an individual deployer or claim that generated audio is an
original NASA recording. No original MP3 is edited or overwritten.

## Carried Out by Hand - chapter 2, segment 3

> Buzz Aldrin carried the experiment packages away from Eagle. The crew placed the passive reflector on the lunar surface during the Apollo 11 moonwalk.

Preview: `../qa-artifacts/final-moon-fixes/replacements/3-neutral.mp3`.
Decoded duration: approximately 10.54 seconds. SHA-256:
`c6fdd72895d74e154e31feb5a4ebebe2a2b2b29e8415da8205e7388981f8ce05`.

## Set Down Once, Forever - chapter 2, segment 4

> The reflector was set on the lunar surface, leveled and pointed toward Earth. It needed no electrical power.

Preview: `../qa-artifacts/final-moon-fixes/replacements/4-neutral.mp3`.
Decoded duration: approximately 8.20 seconds. SHA-256:
`d1e0a6e9a5eb2def9aa217708b62a97eb9d46fcf514e8a67577c7f3d458c328e`.

## Scientific decision

These are the existing neutral readings, not newly invented mission claims.
Collective deployment attribution avoids the unresolved Armstrong/Aldrin naming
conflict. The supported approximate distance is not the reason for the original
hold; the neutral second paragraph does not require a distance claim. The
reflector remains a passive experiment without electrical power.

The primary source comparisons remain in
[scientific-decisions.md](review-safe/scientific-decisions.md), including
[NASA/ALSJ](https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11_eva_thumbs.html),
[NASA History](https://www.nasa.gov/history/50-years-ago-one-small-step-one-giant-leap/)
and the existing mission sources. Approval of either replacement must not be
recorded as approval of the disputed words in its original MP3.

## Generation and technical verification

- Engine: installed Windows `System.Speech.Synthesis.SpeechSynthesizer`.
- Voice: standard Microsoft Zira Desktop, en-US; rate -1. No voice cloning,
  imitation of an individual, astronaut-audio claim, or external audio upload.
- Output: separate mono 22050 Hz PCM preview WAVs, converted with PyAV/
  libmp3lame to 64 kb/s MP3. Original source files were read, not modified.
- Full decoded samples contain a real nonzero signal. Local faster-whisper small
  returned both complete neutral paragraphs exactly. This is a machine content
  check, not a human-listening certificate.
- Real Chrome headless played each preview through its end after a button
  gesture, measured nonzero Web Audio signal, and verified Stop. There were no
  media errors. This isolated technical preview does not establish approved
  in-documentary playback or permission to release it.

Local provenance, conversion code, transcript checks and browser measurements are
in `../qa-artifacts/final-moon-fixes/replacements/`, especially
`preview-manifest.json` and `browser-preview-results.json`.

## Exact remaining decision

Approve or reject these two neutral scripts with the supplied generic synthetic
voice for use as corrected project narration. If approved, install them as
separate corrected assets, document their hashes/origin, select them explicitly
for 2/3 and 2/4, retain the disputed originals under review, and validate native
documentary mute/scroll/return behavior on desktop and mobile before publishing.
Until then, both application voices remain held; they are not reported fixed.
