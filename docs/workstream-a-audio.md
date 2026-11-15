# Workstream A — Apollo 15 audio, captions, and evidence

The work was performed in the isolated `audio` worktree at detached HEAD `8120d9e`. It has yet to be integrated into a branch.

## Results and limitations

- **19 of 19 MP3s were inspected and transcribed locally to produce ASR drafts.**
- **54 candidate phrases or fragments** were grouped by punctuation using token offsets from the original MP3s. The process used actual audio offsets and avoided inferring timings from equal intervals or script length.
- **0 of 19 recordings have been certified by human listening, and 0 cues were published as `verified`.** All 19 entries in `apollo15CaptionTiming.ts` remain `pending`.
- All 19 files retain their original bytes, **5,054,347 bytes** in total. The MPEG frames add up to **295.784490 seconds**, including encoder padding. The duration shown by the player can differ slightly, and ASR estimates may exceed it. Phrase boundaries require separate review.
- The recordings were processed locally. The application, system, and `node_modules` required no package installations.

The original scripts and quiz questions do not establish what the recordings say. ASR drafts for all three quiz recordings are available for review. Approved transcripts are still pending. The drafts were kept out of the quiz and answers remain hidden until the student interacts.

## Review tool

Open `docs/workstream-a-audio-review.html` from this worktree in Chrome. It works with `file://` and needs neither installed dependencies nor localStorage. To serve it from the worktree over HTTP, run:

```powershell
python -m http.server 5181 --bind 127.0.0.1
```

Then open `http://127.0.0.1:5181/docs/workstream-a-audio-review.html`. Audio and image URLs resolve through `../public/...` from `/docs` in both modes, without Vite URL mapping. Avoid running `npm run dev` with the default cache in the shared junction.

The tool has one player, a selector for all 19 tracks, original candidate scripts, question context, and six NASA images from the existing verified manifest. **Load local ASR draft — unreviewed** loads draft text and timings for correction. Approval remains a separate action.

Reviewers can play, pause, seek, capture start and end times from `audio.currentTime`, edit sentence text, and choose relevant evidence. Drafts can be downloaded. Exporting reviewed cues requires a reviewer name, explicit listening confirmation, and validation of cue order, intervals, and decoded duration. Changing text, timings, or images clears previous approval. Download the draft before closing the tab.

The export contains the MP3 path and hash. It leaves application files untouched. Before copying a reviewed entry into the production registry, compare the recorded hash against the current audio, read the complete transcript, and run the tests. The production cue type excludes `candidate-not-approved` entries, and the tool never imports them automatically.

## Runtime fixes

- Replay refreshes the cue at media time zero.
- Seeking and seek completion use `currentTime` to handle forward and backward jumps and caption gaps.
- Playback end, errors, source changes, and unmounts clear stale captions and evidence.
- A pending Play rejection from a previous source cannot surface as an error for a new source. Synchronous playback errors are also recoverable.
- A cue belongs to the audio path that produced it. Desktop and mobile show cue-specific imagery on the active card, while other cards retain segment evidence. An unknown image ID falls back to the contextual manifest.
- Mute, pause, resume, replay, exclusive voice playback, audio-free reading, `preload="none"`, and disabled autoplay remain available. The player avoids announcing every timeupdate.
- Browser `timeupdate` cadence varies. Seeking and restarting update the cue immediately from media time. Listening is still required to verify phrase boundaries.
- The changes leave GIS/3D, other missions, persistence, MP3s, original scripts, and NASA credits intact. The six verified pilot images are reused.

## Recording inventory

The table shows actual duration encoded by frames. All rows require human listening to confirm words
and times. Full hashes, samples, frames, original text, ASR, offsets per token and references are in
the JSONs.

| Chapter.segment | Recording | MPEG duration | Text source | Human Review |
| --- | --- | --- | --- | --- |
| 1.1 | Hook & Machine Intro | 16.927 s | Original script + ASR | Pending |
| 1.2 | Developed & Destination | 16.588 s | Original script + ASR | Pending |
| 1.3 | Who Built Me | 8.751 s | Original script + ASR | Pending |
| 1.4 | Designed to Accomplish | 14.106 s | Original script + ASR | Pending |
| 2.1 | Launch & Landing | 21.969 s | Original script + ASR | Pending |
| 2.2 | Lunar Environment & Controls | 22.988 s | Original script + ASR | Pending |
| 2.3 | One-sixth Gravity | 16.588 s | Original script + ASR | Pending |
| 2.4 | Milestones | 17.868 s | Original script + ASR | Pending |
| 3.1 | Steering Scare | 17.554 s | Original script + ASR | Pending |
| 3.2 | Steep Slopes, Heat & Lunar Dust | 20.767 s | Original script + ASR | Pending |
| 3.3 | Genesis Rock | 18.678 s | Original script + ASR | Pending |
| 3.4 | Observations | 15.229 s | Original script + ASR | Pending |
| 4.1 | Final Science Moment | 13.401 s | Original script + ASR | Pending |
| 4.2 | Filming Liftoff | 15.804 s | Original script + ASR | Pending |
| 4.3 | Current Status | 17.946 s | Original script + ASR | Pending |
| 4.4 | Reflection | 17.084 s | Original script + ASR | Pending |
| 5.1 | Quiz question 1 | 4.754 s | ASR only; original script unavailable | Pending |
| 5.2 | Quiz question 2 | 7.549 s | ASR only; original script unavailable | Pending |
| 5.3 | Quiz question 3 | 11.233 s | ASR only; original script unavailable | Pending |

Risks observed in ASR: Hadley-Apennine appears as “Hadley Apanine”; Hadley Rille as “Rill” or
“Real”; 4.3 has fragmented punctuation; 3.2 predicts sighs or coughs that require audible verification. Do not
correct them by guess. Review numbers, units, “mass/weight”, final time marks and complete
questions. Some ASR fragments include an incomplete phrase; 54 candidates do not amount to 54
certified phrases. Historical simplifications of the original scripts also require editorial
criteria; recordings were not regenerated or altered.

## ASR provenance and reproduction

The official portable CPU binary of [whisper.cpp
b5454](https://github.com/ggml-org/whisper.cpp/releases/tag/b5454), which supports MP3 directly, and
the quantized English model
[ggml-tiny.en-q5_1](https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en-q5_1.bin) were used. The Windows installed recognition device, which only offered es-ES for these English
recordings, was not used. ASR was executed without a prompt to copy the script:

```text
whisper-cli.exe -m MODEL -f ORIGINAL_MP3 -l en -t 4 -ng -ojf -otxt -of OUTPUT_PREFIX
```

Run for the 19 paths in the inventory using prefixes `1-1` ... `5-3` in an isolated output directory, and
then:

```text
node scripts/workstream-a-prepare-asr.mjs DIRECTORIO_DE_JSON_RAW
node scripts/workstream-a-audio-review.mjs
```

The second script inspects each frame, checks linking by SHA and regenerates the reviewer data. None
changes MP3, scripts, or production cubes. The MIT licenses of
[whisper.cpp](https://github.com/ggml-org/whisper.cpp/blob/master/LICENSE) and
[Whisper](https://github.com/openai/whisper/blob/main/LICENSE) are referenced in the manifest; the
temporary binary/model were removed after processing the tracks. They are not part of the files
proposed to integrate.

Hashes of reproducible analysis:

- ZIP oficial b5454: `6ba69e3482d7826214f90a6a9c84ca07782aec1e1d0c6a7c30c994fd5d816ccb`.
- `whisper-cli.exe`: `331dba46d6427105d2b802cdbc7eae916ea1c5abf9b0d3b5cfe460d8db8e4366`.
- Modelo, 32,166,155 bytes: `c77c5766f1cef09b6b7d47f21b546cbddd4157886b3b5d6d4f709e91e66c7c2b`.

## Files and Validation

Modified files:

- `src/components/storytelling/StoryRecording.tsx`
- `src/components/storytelling/Apollo15ScrollStory.tsx`

New:

- `src/features/storytelling/apollo15CueEvidence.ts`
- `scripts/workstream-a-audio-review.mjs`
- `scripts/workstream-a-prepare-asr.mjs`
- `docs/workstream-a-audio.md`
- `docs/workstream-a-audio-review.html`
- `docs/workstream-a-audio-review.js`
- `docs/workstream-a-audio-review-data.js`
- `docs/workstream-a-audio-review.json`
- `docs/workstream-a-asr-candidates.json`
- `tests/workstream-a-audio.test.mjs`

Validation: 9 new targeted tests approved; full suite **174/174** (165 baseline + 9), TypeScript,
production build, and `git diff --check` all passed. The existing Three.js bundle warning (823.49 kB) remains.
Tests verify real inventory, integrity, candidates and their production isolation, currentTime
capture and export lock without approval, replay/seek/end, obsolete rejections and mobile and desktop
evidence selection. The additional HTTP test uses the URLs actually generated by the reviewer from
the documented location and checks the first/last MP3 bytes and image, without any special mapping
of `/audio` a `/public/audio`.

Pending in Chrome: Human Listening of the 19 Tracks, Correction/Approval of Phrases and Times;
Responsive Visual Check, Native Controls When Opening the Reviewer by `file://`, Downloaded Export
and Real Chapter Change. DOM/Media Tests are simulated and do not replace that review. For complete
compliance the cues must still be approved and additional images must be cured when a specific
action has no direct evidence. The student continues to see evidence by segment; perfect timing is
not affirmed.
