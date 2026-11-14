import { apollo15ChapterRecordings } from './apollo15Recordings'
import { apollo15SegmentMedia, apollo15StoryMedia, type Apollo15MediaId } from './apollo15StoryMedia'
import type { StoryCue } from './storyCues'

/** StoryRecording emits only approved cues. Scope one emitted cue to its exact
 * recording and active card; other mobile cards retain contextual evidence.
 */
export function apollo15EvidenceForStep(chapter: number, step: number, active: number,
  selection?: { audio: string; cue: StoryCue | undefined }): Apollo15MediaId {
  const fallback = apollo15SegmentMedia[chapter]?.[step] ?? 'rover'
  const expectedRecording = apollo15ChapterRecordings[chapter]?.[active]?.audio
  const id = selection?.cue?.mediaId
  return step === active && selection?.audio === expectedRecording && id && Object.prototype.hasOwnProperty.call(apollo15StoryMedia, id)
    ? id as Apollo15MediaId : fallback
}
