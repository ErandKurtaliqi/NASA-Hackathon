import { useEffect, useReducer, useRef } from 'react'
import type { MachineStory } from '../../machineStories'
import { createQuizAttempt, quizResultMessage, reduceQuizAttempt, scoreQuiz } from '../../features/storytelling/quizAttempt'
import { perseveranceQuizLearning, type QuizLearning } from '../../features/storytelling/quizLearning'
import { useStoryReducedMotion } from '../../features/storytelling/motionPreference'
import styles from './PerseveranceQuiz.module.css'

function Sources({ learning }: { learning: QuizLearning }) {
  return <ul className={styles.sources}>{learning.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a></li>)}</ul>
}

export default function PerseveranceQuiz({ story, onComplete, onRetry, alreadyCompleted }: {
  story: MachineStory; onComplete: () => void; onRetry: () => void; alreadyCompleted: boolean
}) {
  const [attempt, dispatch] = useReducer((state: ReturnType<typeof createQuizAttempt>, action: Parameters<typeof reduceQuizAttempt>[2]) => reduceQuizAttempt(story.quiz, state, action), undefined, createQuizAttempt)
  const reducedMotion = useStoryReducedMotion()
  const questionHeading = useRef<HTMLHeadingElement>(null)
  const feedbackHeading = useRef<HTMLHeadingElement>(null)
  const resultsHeading = useRef<HTMLHeadingElement>(null)
  const entered = useRef(false)
  const complete = useRef(onComplete)
  const total = story.quiz.length
  const score = scoreQuiz(story.quiz, attempt.answers)
  const item = story.quiz[attempt.question]
  const learning: QuizLearning = perseveranceQuizLearning[attempt.question]
  const answer = attempt.answers[attempt.question]
  const submitted = answer !== undefined
  const correct = submitted && answer === item.answer
  const phase = attempt.showResults ? 'results' : submitted ? 'feedback' : 'question'

  useEffect(() => { complete.current = onComplete }, [onComplete])
  useEffect(() => { if (attempt.showResults) complete.current() }, [attempt.showResults])
  useEffect(() => {
    if (!entered.current) { entered.current = true; return }
    const heading = phase === 'results' ? resultsHeading.current : phase === 'feedback' ? feedbackHeading.current : questionHeading.current
    heading?.focus({ preventScroll: true })
    heading?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'auto', block: 'nearest' })
  }, [attempt.question, phase])

  return <section className={styles.chapter} aria-label="Perseverance knowledge assessment">
    <header className={styles.intro}>
      <div className={styles.brand}><img src="/images/home/auroralys-mark.svg" width="32" height="32" alt="" /><span>AURORALYS · MISSION CHECK</span></div>
      <h2>Think like a field scientist.</h2><p>Choose an answer, then submit it to explore the evidence. Completing the activity and answering correctly are shown separately.</p>
      {alreadyCompleted && <p className={styles.saved}>Your story is already complete in this session. This practice attempt does not change it. Check the mission record below for save status.</p>}
    </header>
    <div className={styles.progress}>
      <ol aria-label="Question progress">{story.quiz.map((_, index) => <li key={index} aria-current={!attempt.showResults && attempt.question === index ? 'step' : undefined}
        className={attempt.answers[index] !== undefined ? styles.submitted : ''}>
        <span>Question {index + 1}</span><small>{attempt.answers[index] !== undefined ? 'Submitted' : attempt.question === index && !attempt.showResults ? 'Current' : 'Not answered'}</small>
      </li>)}</ol>
      <p role="status" aria-live="polite"><strong>{score} correct</strong><span>{attempt.answers.length} of {total} answers submitted</span></p>
    </div>

    {attempt.showResults ? <div className={styles.results}>
      <span className={styles.eyebrow}>ACTIVITY COMPLETE</span><h2 id="quiz-results-title" ref={resultsHeading} tabIndex={-1} className={styles.focusTarget}>Your mission check results</h2>
      <div className={styles.score}><strong>{Math.round(score / total * 100)}%</strong><p>{score} of {total} correct answers<span>All {total} questions submitted</span></p></div>
      <p className={styles.resultMessage}>{quizResultMessage(score, total)}</p>
      <div className={styles.reward}><img src="/images/home/auroralys-mark.svg" width="44" height="44" alt="" /><div><span className={styles.eyebrow}>MISSION REWARD</span><h3>{story.reward}</h3><p>Recognition for completing the activity. Your score describes this attempt’s accuracy.</p></div></div>
      <section className={styles.review} aria-labelledby="quiz-review-title"><h3 id="quiz-review-title">Keep the evidence with you</h3><ol>{story.quiz.map((question, index) => <li key={question.question}>
        <h4>{question.question}</h4><strong className={attempt.answers[index] === question.answer ? styles.correctText : styles.reviewText}>{attempt.answers[index] === question.answer ? 'Correct' : 'Review this topic'}</strong>
        <p>Your answer: {question.options[attempt.answers[index]]}<br />Correct answer: {question.options[question.answer]}</p>
        <p>{question.explanation}</p><Sources learning={perseveranceQuizLearning[index]} />
      </li>)}</ol></section>
      <div className={styles.resultActions}><button type="button" onClick={() => { dispatch({ type: 'retry' }); onRetry() }}>Try again</button>
        <p>{alreadyCompleted ? 'Retrying changes only this temporary quiz attempt. Your completed chapters stay intact in this session.' : 'Choose Complete Story below to save your mission completion. Retrying starts a new temporary attempt.'}</p></div>
    </div> : <form className={styles.question} onSubmit={event => { event.preventDefault(); dispatch({ type: 'submit' }) }}>
      <fieldset disabled={submitted} aria-describedby="quiz-instructions"><legend><span className={styles.eyebrow}>QUESTION {attempt.question + 1} OF {total}</span>
        <h2 id="quiz-question-title" ref={questionHeading} tabIndex={-1} className={styles.focusTarget}>{item.question}</h2></legend>
        <p id="quiz-instructions" className={styles.instructions}>{submitted ? 'Your answer is submitted. Read the explanation before continuing.' : 'Select one option. You can change your selection before submitting.'}</p>
        <div className={styles.options}>{item.options.map((option, index) => <label key={option} className={`${styles.option} ${submitted && index === item.answer ? styles.correctOption : submitted && index === answer ? styles.incorrectOption : ''}`}>
          <input type="radio" name="perseverance-quiz-answer" value={index} checked={attempt.selected === index} onChange={() => dispatch({ type: 'select', option: index })} />
          <span className={styles.letter} aria-hidden="true">{String.fromCharCode(65 + index)}</span><span>{option}</span>
          {submitted && index === item.answer && <strong>Correct answer</strong>}{submitted && index === answer && !correct && <strong>Your answer</strong>}
        </label>)}</div>
      </fieldset>
      {!submitted ? <button type="submit" className={styles.primary} disabled={attempt.selected === null}>Submit answer</button> : <section className={styles.feedback} aria-labelledby="quiz-feedback-title">
        <h3 id="quiz-feedback-title" ref={feedbackHeading} tabIndex={-1} className={styles.focusTarget}>{correct ? 'Correct — connect it to the evidence' : 'Not quite — let’s look at the evidence'}</h3>
        <p><strong>Your answer:</strong> {item.options[answer]}</p>{!correct && <p><strong>Correct answer:</strong> {item.options[item.answer]}</p>}
        {!correct && <p>{learning.wrongAnswers[answer]}</p>}
        <p>{item.explanation}</p><p className={styles.scienceNote}>{learning.note}</p><Sources learning={learning} />
        <button type="button" className={styles.primary} onClick={() => dispatch({ type: 'advance' })}>{attempt.question === total - 1 ? 'View results' : 'Next question'}</button>
      </section>}
    </form>}
  </section>
}
