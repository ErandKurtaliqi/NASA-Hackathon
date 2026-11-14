import { apollo15ChapterRecordings, apollo15QuizRecordings } from './apollo15Recordings'
import { pendingCues, type RecordingCues } from './storyCues'

/** All original recordings are registered; none has manually approved cue times yet.
 * Replace an entry with reviewed cues after listening, never estimated timestamps.
 */
export const apollo15CaptionTiming: Readonly<Record<string, RecordingCues>> = Object.fromEntries(
  [...apollo15ChapterRecordings.flat().map(track => track.audio), ...apollo15QuizRecordings]
    .map(src => [src, pendingCues]),
)
