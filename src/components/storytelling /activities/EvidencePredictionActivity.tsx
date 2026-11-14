import { useEffect, useId, useRef, useState } from 'react'
import type { EvidencePrediction, PredictionReview } from '../../../features/storytelling/activities/evidencePrediction'
import { reviewPrediction } from '../../../features/storytelling/activities/evidencePrediction'
import StoryMedia from '../StoryMedia'
import styles from './EvidencePredictionActivity.module.css'

function PredictionAttempt({ activity }: { activity: EvidencePrediction }) {
  const prefix = useId()
  const [choice, setChoice] = useState<string | null>(null)
  const [review, setReview] = useState<PredictionReview>()
  const question = useRef<HTMLLegendElement>(null), feedback = useRef<HTMLHeadingElement>(null)
  const previousReview = useRef(review)

  useEffect(() => {
    if (previousReview.current === review) return
    previousReview.current = review
    // Focus announces the new phase once; no competing live-region message.
    const target = review ? feedback.current : question.current
    target?.focus({ preventScroll: true })
    target?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
  }, [review])

  return <section className={styles.activity} aria-labelledby={`${prefix}-title`}>
    <header><span className={styles.eyebrow}>OPTIONAL EVIDENCE LAB</span><h2 id={`${prefix}-title`}>{activity.title}</h2><p>{activity.context}</p></header>
    <p id={`${prefix}-optional`} className={styles.hint}>A prediction is a starting idea, not a mission score. This activity does not unlock chapters, award badges or change saved progress.</p>
    <form onSubmit={event => {
      event.preventDefault()
      if (review) return
      const result = reviewPrediction(activity, choice)
      if (result) setReview(result)
    }}>
      <fieldset disabled={!!review} aria-describedby={`${prefix}-optional ${prefix}-instructions`}>
        <legend ref={question} tabIndex={-1}>{activity.question}</legend>
        <p id={`${prefix}-instructions`} className={styles.hint}>Choose one prediction, then compare it with the mission evidence.</p>
        <div className={styles.options}>{activity.options.map(option => <label key={option.id} className={choice === option.id ? styles.selected : undefined}>
          <input type="radio" name={`${prefix}-prediction`} value={option.id} checked={choice === option.id} onChange={() => { if (!review) setChoice(option.id) }} />
          <span>{option.label}</span>
        </label>)}</div>
      </fieldset>
      {!review && <button type="submit" disabled={choice === null}>Compare with evidence</button>}
    </form>
    {review && <section className={styles.review} aria-labelledby={`${prefix}-feedback`}>
      <h3 id={`${prefix}-feedback`} ref={feedback} tabIndex={-1} aria-describedby={`${prefix}-reason`}>{review.correct ? 'Your prediction matches the observation' : 'Let the evidence refine your prediction'}</h3>
      <p id={`${prefix}-reason`}>{review.feedback}</p>
      <h4>What was observed?</h4><p>{activity.observation}</p>
      <StoryMedia media={activity.evidence} motionEnabled={false} />
      <p>{activity.interpretation}</p>
      <div className={styles.sources}>{activity.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div>
      <a className={styles.policy} href={activity.evidence.usagePolicyUrl} target="_blank" rel="noreferrer">NASA media usage guidelines ↗</a>
      <button type="button" onClick={() => { setChoice(null); setReview(undefined) }}>Try another prediction</button>
    </section>}
  </section>
}

/** A new activity starts a new local attempt. No store, router, audio or GPU dependency. */
export default function EvidencePredictionActivity({ activity }: { activity: EvidencePrediction }) {
  return <PredictionAttempt key={activity.id} activity={activity} />
}
