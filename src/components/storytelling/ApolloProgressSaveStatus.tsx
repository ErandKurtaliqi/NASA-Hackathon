import { useEffect, useRef, useState } from 'react'
import type { MachineStory } from '../../machineStories'
import { retryProgressSave, useProgress, useProgressPersistence } from '../../store'
import styles from './ApolloProgressSaveStatus.module.css'

/** Observe the existing save acknowledgement without repeating progress actions. */
export default function ApolloProgressSaveStatus({ story }: { story: MachineStory }) {
  const { storyProgress, badges } = useProgress()
  const { status, reason } = useProgressPersistence()
  const missionComplete = !!storyProgress?.[story.id]?.completedMission
  const badgeEarned = badges.includes(`${story.id}-storyteller`)
  const saved = status === 'saved'
  const [failedRetries, setFailedRetries] = useState(0)
  const [recoveries, setRecoveries] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (status !== 'error' && !recoveries) return
    heading.current?.focus({ preventScroll: true })
    heading.current?.scrollIntoView({ behavior: 'instant', block: 'nearest' })
  }, [status, reason, recoveries])

  // Successful intermediate chapter navigation needs no extra panel. Failures
  // survive route remounts in the existing acknowledgement store; retry success
  // stays visible here so the focused recovery button is not simply removed.
  if (saved && !missionComplete && !recoveries) return null

  return <section className={styles.record} aria-label={`${story.missionLabel} progress saving`}>
    <h2 ref={heading} tabIndex={-1}>{story.missionLabel} {missionComplete ? 'mission complete' : 'progress'}</h2>
    <p role="status" aria-live="polite" aria-atomic="true">{saved
      ? missionComplete
        ? badgeEarned ? 'Your mission completion and badge are saved on this device.' : 'Your completed chapters are saved on this device. Choose Complete Story to record your mission badge.'
        : 'Your latest progress is saved on this device.'
      : missionComplete ? 'Your mission is complete in this session. Saving to this device has not been confirmed.' : 'Your latest progress is available in this session. Saving to this device has not been confirmed.'}</p>
    {missionComplete && <p>{story.reward} · {badgeEarned ? saved ? 'Badge saved on this device' : 'Badge unlocked in this session · not saved' : 'Badge not yet recorded'}</p>}
    {status === 'saving' && <p>Saving progress. Keep this page open until saving is confirmed.</p>}
    {status === 'error' && <div className={styles.warning} role="alert" aria-atomic="true">
      <h3>Progress is not saved on this device</h3>
      {reason === 'read' ? <>
        <p>Your existing progress could not be loaded. Saving is paused to protect it. Allow browser storage, then reload to recover your saved records. Reloading will discard changes made in this session.</p>
        <button type="button" onClick={() => window.location.reload()}>Reload saved progress</button>
      </> : <>
        <p>Your latest changes and any newly unlocked badge are available only in this session. Previously saved records remain intact. Keep this page open, allow browser storage or free device space, then retry. Closing or reloading may lose unsaved changes. You do not need to answer the quiz again.</p>
        <button type="button" onClick={() => {
          if (retryProgressSave()) setRecoveries(count => count + 1)
          else setFailedRetries(count => count + 1)
        }}>Retry saving</button>
        {failedRetries > 0 && <p role="status" aria-live="polite" aria-atomic="true">Save retry {failedRetries} failed. Your progress is still only in this session.</p>}
      </>}
    </div>}
  </section>
}
