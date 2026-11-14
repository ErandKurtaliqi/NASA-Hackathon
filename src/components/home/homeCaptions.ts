import type { HomeRecording } from './homeNarration'

/** Haroon's approved scripts. Joining each set with spaces preserves the full wording. */
export const homeCaptions: Record<HomeRecording, readonly string[]> = {
  intro: [
    'Welcome, explorer.',
    "I'm so glad you found us.",
    'These robots finished their missions',
    'long ago... but their stories never did.',
    'Come choose a world and meet them.',
  ],
  moon: [
    'Look... the Moon still keeps',
    'the footprints and the quiet robots',
    'that once explored it.',
    'Their stories are waiting.',
  ],
  mars: [
    'Mars holds many brave robots',
    'who worked for years under its red sky.',
    "They're silent now...",
    'but they still have so much to tell us.',
  ],
}

// Approximate phrase boundaries, weighted by text length across the actual media
// duration. There are no supplied word/phrase timestamps; these are not word cues.
export function captionStartFraction(recording: HomeRecording, index: number) {
  const segments = homeCaptions[recording]
  const clamped = Math.max(0, Math.min(segments.length - 1, Math.trunc(index) || 0))
  const total = segments.reduce((sum, segment) => sum + segment.length, 0)
  return segments.slice(0, clamped).reduce((sum, segment) => sum + segment.length, 0) / total
}

export function captionAtTime(recording: HomeRecording, time: number, duration: number | null) {
  if (!duration || !Number.isFinite(duration) || duration <= 0 || !Number.isFinite(time)) return 0
  const fraction = Math.max(0, Math.min(1, time / duration))
  const segments = homeCaptions[recording]
  for (let index = segments.length - 1; index > 0; index--) {
    if (fraction + 1e-10 >= captionStartFraction(recording, index)) return index
  }
  return 0
}
