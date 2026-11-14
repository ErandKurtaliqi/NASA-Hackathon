import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

/** Sentence candidates use ASR token offsets, never character/word-count timing.
 * All offsets remain unreviewed model predictions, not published caption cues.
 */
export function prepareCandidate(recording, raw) {
  const transcript = raw.transcription.map(segment => segment.text.trim()).join(' ')
  const sentences = [], tokens = []
  let pending = []
  const finish = () => {
    if (!pending.length) return
    const offsets = pending.flatMap(token => [token.offsets.from, token.offsets.to]).filter(value => Number.isFinite(value) && value >= 0)
    sentences.push({ start: offsets.length ? Math.min(...offsets) / 1000 : null,
      end: offsets.length ? Math.max(...offsets) / 1000 : null,
      text: pending.map(token => token.text).join('').trim(), status: 'asr-candidate-not-reviewed' })
    pending = []
  }
  for (const segment of raw.transcription) {
    for (const token of segment.tokens ?? []) {
      if (token.text.startsWith('[_')) continue
      tokens.push({ text: token.text, startMs: token.offsets.from, endMs: token.offsets.to, probability: token.p })
      pending.push(token)
      if (/[.!?]["')]*\s*$/.test(token.text)) finish()
    }
  }
  finish()
  return { recordingPath: recording.path, recordingSha256: recording.sha256,
    status: 'asr-candidate-not-reviewed', transcript, sentenceCandidates: sentences, tokenPredictions: tokens,
    rawSegments: raw.transcription.map(segment => ({ text: segment.text.trim(), offsetsMs: segment.offsets })),
    requiredReview: ['Listen to the complete original MP3', 'Correct all words, proper names, numbers and punctuation',
      'Check each candidate start/end against actual playback', 'Select only directly relevant verified imagery; contextual imagery must retain its caption',
      'Verify quiz transcripts separately; existing question text is not proof of recorded wording'],
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = fileURLToPath(new URL('../', import.meta.url))
  const input = resolve(root, process.argv[2] || 'dist/workstream-a-asr-raw')
  const inventory = JSON.parse(readFileSync(resolve(root, 'docs/workstream-a-audio-review.json'), 'utf8'))
  const recordings = inventory.recordings.map(recording => {
    const path = resolve(input, `${recording.chapter}-${recording.segment}.json`), bytes = readFileSync(path)
    return { ...prepareCandidate(recording, JSON.parse(bytes)), rawOutputSha256: createHash('sha256').update(bytes).digest('hex') }
  })
  const output = {
    status: 'candidates-only-not-runtime-captions', generatedOn: '2026-11-08',
    method: 'Fully local whisper.cpp inference against unchanged original MP3 files, then sentence grouping using returned token offsets. No script-based timestamp interpolation and no human listening certification.',
    engine: { name: 'whisper.cpp', release: 'b5454', binaryArchiveUrl: 'https://github.com/ggml-org/whisper.cpp/releases/download/b5454/whisper-bin-x64.zip',
      binaryArchiveSha256: '6ba69e3482d7826214f90a6a9c84ca07782aec1e1d0c6a7c30c994fd5d816ccb',
      cliSha256: '331dba46d6427105d2b802cdbc7eae916ea1c5abf9b0d3b5cfe460d8db8e4366',
      licenseUrl: 'https://github.com/ggml-org/whisper.cpp/blob/master/LICENSE' },
    model: { name: 'ggml-tiny.en-q5_1.bin', sourceUrl: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en-q5_1.bin',
      bytes: 32166155, sha256: 'c77c5766f1cef09b6b7d47f21b546cbddd4157886b3b5d6d4f709e91e66c7c2b',
      licenseUrl: 'https://github.com/openai/whisper/blob/main/LICENSE' },
    commandPattern: 'whisper-cli.exe -m MODEL -f ORIGINAL_MP3 -l en -t 4 -ng -ojf -otxt -of OUTPUT_PREFIX',
    limitations: ['Tiny quantized ASR is fallible, especially proper names and numeric language.', 'Token offsets and sentence grouping require human listening review.',
      'No candidate is registered as verified in the application.', 'No recording was uploaded to an external transcription service.'], recordings,
  }
  writeFileSync(resolve(root, 'docs/workstream-a-asr-candidates.json'), JSON.stringify(output, null, 2) + '\n')
  console.log(`Prepared ${recordings.length} local ASR transcripts and ${recordings.reduce((sum, track) => sum + track.sentenceCandidates.length, 0)} unreviewed sentence candidates.`)
}
