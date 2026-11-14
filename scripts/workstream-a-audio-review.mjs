import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { build } from 'esbuild'

/** Parse actual MPEG Layer III frames. This is encoded duration, not speech timing. */
export function inspectMp3(bytes) {
  let offset = 0
  if (bytes.toString('ascii', 0, 3) === 'ID3') {
    if (bytes.length < 10) throw Error('Truncated ID3 header')
    const tagSize = [...bytes.subarray(6, 10)].reduce((size, value) => (size << 7) + (value & 127), 0)
    offset = 10 + tagSize + ((bytes[5] & 16) ? 10 : 0)
  }
  const samplesByRate = [44100, 48000, 32000]
  let frames = 0, encodedDurationSeconds = 0
  const sampleRates = new Set(), channelCounts = new Set()
  while (offset < bytes.length) {
    if (bytes.toString('ascii', offset, offset + 3) === 'TAG' && bytes.length - offset === 128) break
    if (offset + 4 > bytes.length) throw Error('Truncated frame header')
    const header = bytes.readUInt32BE(offset), version = (header >>> 19) & 3
    const layer = (header >>> 17) & 3, rate = (header >>> 10) & 3, bitrate = (header >>> 12) & 15
    if (header >>> 21 !== 0x7ff || version === 1 || layer !== 1 || rate === 3 || bitrate < 1 || bitrate > 14) throw Error(`Invalid MPEG Layer III frame at byte ${offset}`)
    const sampleRate = samplesByRate[rate] / ({ 3: 1, 2: 2, 0: 4 }[version])
    const bitrates = version === 3 ? [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320] : [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160]
    const length = Math.floor((version === 3 ? 144 : 72) * bitrates[bitrate] * 1000 / sampleRate) + ((header >>> 9) & 1)
    if (offset + length > bytes.length) throw Error('Truncated MPEG frame')
    sampleRates.add(sampleRate); channelCounts.add(((header >>> 6) & 3) === 3 ? 1 : 2)
    encodedDurationSeconds += (version === 3 ? 1152 : 576) / sampleRate
    frames++; offset += length
  }
  if (!frames) throw Error('No MPEG frames')
  return { bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), frames,
    encodedDurationSeconds: Number(encodedDurationSeconds.toFixed(6)), sampleRatesHz: [...sampleRates], channels: [...channelCounts] }
}

export async function createAudioReview(root) {
  const require = createRequire(import.meta.url)
  const result = await build({ stdin: { contents: `export * from './src/features/storytelling/apollo15Recordings';
    export * from './src/features/storytelling/apollo15StoryMedia'; export { machineStories } from './src/machineStories';`, resolveDir: root },
    bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', logLevel: 'silent' })
  const module = { exports: {} }
  new Function('require', 'module', 'exports', result.outputFiles[0].text)(require, module, module.exports)
  const { apollo15ChapterRecordings, apollo15QuizRecordings, apollo15SegmentMedia, apollo15StoryMedia, machineStories } = module.exports
  const recordings = apollo15ChapterRecordings.flatMap((chapter, chapterIndex) => chapter.map((track, segmentIndex) => ({
    path: track.audio, chapter: chapterIndex + 1, segment: segmentIndex + 1, title: track.title,
    candidateScript: track.text, candidateScriptSource: 'Original project script; not verified verbatim against audio',
    questionContext: null, originalScriptSources: track.sources, contextualMediaId: apollo15SegmentMedia[chapterIndex][segmentIndex],
  }))).concat(apollo15QuizRecordings.map((path, index) => ({ path, chapter: 5, segment: index + 1, title: `Quiz question ${index + 1}`,
    candidateScript: '', candidateScriptSource: 'No original verbatim transcript supplied',
    questionContext: machineStories['apollo-15-rover'].quiz[index].question, originalScriptSources: [], contextualMediaId: null,
  }))).map(track => ({ ...track, ...inspectMp3(readFileSync(resolve(root, `public${track.path}`))),
    transcriptStatus: track.candidateScript ? 'original-script-unverified' : 'missing',
    timingStatus: 'pending-human-listening', sentenceCues: [],
  }))
  const candidatesPath = resolve(root, 'docs/workstream-a-asr-candidates.json')
  if (existsSync(candidatesPath)) {
    const candidates = JSON.parse(readFileSync(candidatesPath, 'utf8'))
    for (const track of recordings) {
      const candidate = candidates.recordings.find(item => item.recordingPath === track.path)
      if (!candidate || candidate.recordingSha256 !== track.sha256 || candidate.status !== 'asr-candidate-not-reviewed') throw Error(`ASR source mismatch for ${track.path}`)
      track.asrCandidate = { transcript: candidate.transcript, sentenceCandidates: candidate.sentenceCandidates,
        status: candidate.status, engine: candidates.engine.name, model: candidates.model.name }
    }
  }
  return { missionId: 'apollo-15-rover', hardwareId: 'lrv-1', generatedOn: '2026-11-08',
    durationMethod: 'Sum of actual MPEG Layer III frame sample counts / sample rate. Includes encoding padding; native decoded duration can differ. No sentence timestamps inferred.',
    audioProvenance: 'Original project narration, not NASA mission audio. MP3 files unchanged.',
    evidenceNote: 'Contextual media are verified stills from the existing Apollo 15 manifest. Original script source links are preserved as history, not automatically certified for display.',
    media: apollo15StoryMedia, recordings }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = fileURLToPath(new URL('../', import.meta.url))
  const report = await createAudioReview(root)
  writeFileSync(resolve(root, 'docs/workstream-a-audio-review.json'), JSON.stringify(report, null, 2) + '\n')
  // A script data file works offline/file:// without a server or fetch permission.
  writeFileSync(resolve(root, 'docs/workstream-a-audio-review-data.js'), `window.apollo15AudioReview = ${JSON.stringify(report).replaceAll('<', '\\u003c')};\n`)
  console.log(`Prepared ${report.recordings.length} originals, ${report.recordings.reduce((sum, track) => sum + track.bytes, 0)} bytes, ${report.recordings.reduce((sum, track) => sum + track.encodedDurationSeconds, 0).toFixed(3)} encoded seconds. No verified sentence cues.`)
}
