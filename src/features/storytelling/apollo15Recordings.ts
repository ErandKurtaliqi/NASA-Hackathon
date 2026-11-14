import { apollo15Narration } from '../../apollo15Narration'
import type { SourceRef } from '../../types'

export type RecordedSegment = {
  title: string
  text: string
  audio: string
  sources: SourceRef[]
}

// Preserve Erand's original scripts and references verbatim. No story/progress
// fields depend on this optional presentation data.
export const apollo15ChapterRecordings: readonly (readonly RecordedSegment[])[] = apollo15Narration

// Original main@4d31563 mapping: question index + 1, not answer index.
export const apollo15QuizRecordings = [
  '/audio/apollo-15/chapter-5/1.mp3',
  '/audio/apollo-15/chapter-5/2.mp3',
  '/audio/apollo-15/chapter-5/3.mp3',
] as const
