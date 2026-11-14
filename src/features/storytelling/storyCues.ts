/** Publish cues only after listening to the original recording and reviewing times. */
export type StoryCue = { start: number; end: number; text: string; mediaId?: string }
export type RecordingCues =
  | { status: 'pending'; cues: readonly [] }
  | { status: 'verified'; reviewedBy: string; reviewedOn: string; cues: readonly StoryCue[] }

export function cueAt(timing: RecordingCues, seconds: number): StoryCue | undefined {
  if (timing.status !== 'verified' || !timing.reviewedBy.trim() || !timing.reviewedOn || !Number.isFinite(seconds) || seconds < 0) return
  let previousEnd = 0
  for (const cue of timing.cues) {
    if (!Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.start < previousEnd || cue.end <= cue.start || !cue.text.trim()) return
    previousEnd = cue.end
  }
  return timing.cues.find(cue => seconds >= cue.start && seconds < cue.end)
}

// Intentionally no guessed timestamps or word-count interpolation.
export const pendingCues: RecordingCues = { status: 'pending', cues: [] }
