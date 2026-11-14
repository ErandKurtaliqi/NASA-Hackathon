import type { ComponentProps } from 'react'
import { isOmittedReviewRecording } from '../../features/storytelling/reviewMediaPolicy'
import StoryRecording from './StoryRecording'
import styles from './Apollo15ScrollStory.module.css'

/** Keep the final recorded-player contract; never request an intentionally
 * excluded recording or substitute synthetic speech in this asset-safe build. */
export default function ReviewStoryRecording(props: ComponentProps<typeof StoryRecording>) {
  return isOmittedReviewRecording(props.src)
    ? <p className={styles.reviewRecording} role="note" data-review-omitted-recording={props.src}>Recorded narration omitted from this code review: {props.label}. Read the script and continue. Original recordings require an authorized media release; caption timing awaits listening review.</p>
    : <StoryRecording {...props} />
}
