import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Award, Check } from 'lucide-react'
import { chapterMeta, type MachineStory } from '../../machineStories'
import { retryProgressSave, useProgress, useProgressPersistence } from '../../store'
import styles from './PerseveranceCompletion.module.css'

/** Completion UI for Perseverance chapter 5; the quiz stays mounted during saving. */
export default function PerseveranceCompletion({ story, canComplete, onPrevious }: {
  story: MachineStory; canComplete: boolean; onPrevious: () => void
}) {
  const { completedChapters, storyProgress, badges, completeStoryChapter, awardBadge } = useProgress()
  const { status, reason } = useProgressPersistence()
  const saved = status === 'saved'
  const progress = storyProgress?.[story.id]
  const hasChapter = (id: string) => progress?.completed.includes(id) || completedChapters.includes(`${story.id}:${id}`)
  const prerequisitesDone = chapterMeta.slice(0, -1).every(chapter => hasChapter(chapter.id))
  const missionComplete = chapterMeta.every(chapter => hasChapter(chapter.id))
  const badgeEarned = badges.includes(`${story.id}-storyteller`)
  const [confirmation, setConfirmation] = useState<{ first: boolean; count: number } | null>(null)
  const [failedRetries, setFailedRetries] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!confirmation) return
    heading.current?.focus({ preventScroll: true })
    // Immediate scrolling also respects reduced motion; never auto-focus on refresh.
    heading.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [confirmation])

  const finish = () => {
    if (!canComplete || !prerequisitesDone) return
    // The route also accepts legacy flat chapter records. Reconcile those known
    // chapters through existing actions so completedMission agrees with the UI.
    chapterMeta.forEach((chapter, index) => {
      if (!progress?.completed.includes(chapter.id) || (index === 4 && !progress.completedMission)) {
        completeStoryChapter(story.id, chapter.id, index + 1)
      }
    })
    if (!badgeEarned) awardBadge(`${story.id}-storyteller`)
    setConfirmation(previous => ({ first: !missionComplete, count: (previous?.count ?? 0) + 1 }))
  }

  return <section className={styles.completion} aria-label="Perseverance mission completion">
    <div className={styles.controls}>
      <button type="button" onClick={onPrevious}><ArrowLeft aria-hidden="true" />Previous chapter</button>
      <span>{missionComplete ? saved ? 'MISSION COMPLETE' : 'MISSION COMPLETE · NOT SAVED' : canComplete ? 'READY TO COMPLETE' : 'FINISH THE QUIZ TO CONTINUE'}</span>
      <button id="complete-perseverance-story" type="button" className={styles.primary} disabled={!canComplete || !prerequisitesDone}
        aria-controls="perseverance-completion" onClick={finish}>
        {missionComplete ? saved ? 'View saved completion' : 'View session completion' : 'Complete Story'}<ArrowRight aria-hidden="true" />
      </button>
    </div>
    {!saved && <section className={styles.warning} role="alert" aria-atomic="true" aria-labelledby="progress-save-warning">
      <h3 id="progress-save-warning">Progress is not saved on this device</h3>
      {reason === 'read' ? <>
        <p>Your existing progress could not be loaded. Saving is paused to protect it. Allow browser storage, then reload to recover your saved records. Reloading will discard changes made in this session.</p>
        <button type="button" onClick={() => window.location.reload()}>Reload saved progress</button>
      </> : <>
        <p>Your latest progress changes and any newly unlocked badge are available only in this session. Previously saved records remain intact. Keep this page open, allow browser storage or free device space, then retry. Closing or reloading may lose unsaved changes.</p>
        <button type="button" onClick={() => {
          if (retryProgressSave()) {
            setConfirmation(previous => ({ first: previous?.first ?? false, count: (previous?.count ?? 0) + 1 }))
          } else setFailedRetries(count => count + 1)
        }}>Retry saving</button>
        {failedRetries > 0 && <p role="status" aria-live="polite" aria-atomic="true">Save retry {failedRetries} failed. Your progress is still only in this session.</p>}
      </>}
    </section>}
    <section id="perseverance-completion" className={styles.panel} hidden={!missionComplete} aria-labelledby="perseverance-completion-title">
      <div className={styles.brand}><img src="/images/home/auroralys-mark.svg" width="36" height="36" alt="" /><span>AURORALYS · MISSION RECORD</span></div>
      <h2 id="perseverance-completion-title" ref={heading} tabIndex={-1}><Check aria-hidden="true" />Perseverance mission complete</h2>
      <p role="status" aria-live="polite" aria-atomic="true">{!saved
        ? 'All five chapters are complete in this session. Saving has not been confirmed.'
        : !badgeEarned ? 'Your chapters are saved. Choose Complete Story to save your mission badge.'
        : confirmation?.first
        ? 'Mission accomplished! All five chapters and your badge are now saved on this device.'
        : 'Your mission completion is already saved on this device. Reviewing it does not earn a second badge.'}</p>
      <div className={styles.reward}><Award aria-hidden="true" /><div><h3>{story.reward}</h3>
        <p>{badgeEarned ? saved ? 'Badge earned · 5 of 5 chapters complete' : 'Badge unlocked in this session · not saved' : 'Complete Story to save your mission badge.'}</p></div></div>
      <p>You can review your answers or try the quiz again. Practice keeps your completed mission and earned badges intact.</p>
      <nav className={styles.actions} aria-label="Continue after Perseverance">
        <Link className={styles.primary} to="/dashboard">View mission dashboard<ArrowRight aria-hidden="true" /></Link>
        <Link to="/explore/mars">Return to Mars explorer<ArrowRight aria-hidden="true" /></Link>
      </nav>
    </section>
  </section>
}
