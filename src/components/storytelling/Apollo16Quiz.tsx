import type { QuizResult } from '../../store'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { MachineStory } from '../../machineStories'
import { stopRecordedNarration } from '../../features/storytelling/recordedNarration'
import { apollo16CaptionTiming, apollo16QuizRecordings } from '../../features/storytelling/apollo16Recordings'
import StoryRecording from './ReviewStoryRecording'
import styles from './ApolloQuiz.module.css'

export default function Apollo16Quiz({ story, sound, onSound, onComplete, onRetry, onResult, renderRecording, onQuestionHover }: {
  story: MachineStory; sound: boolean; onSound: (enabled: boolean) => void; onComplete: () => void; onRetry: () => void
  onResult?: (result: QuizResult) => void
  renderRecording?: (question: number) => ReactNode
  onQuestionHover?: (question: number) => void
}) {
  const [question, setQuestion] = useState(0), [answers, setAnswers] = useState<number[]>([]), [finished, setFinished] = useState(false)
  const submitted = useRef<number[]>([])
  const questionHeading = useRef<HTMLHeadingElement>(null), feedback = useRef<HTMLParagraphElement>(null), result = useRef<HTMLHeadingElement>(null)
  const answered = answers[question] !== undefined, item = story.quiz[question]
  const score = answers.reduce((total, answer, i) => total + Number(answer === story.quiz[i].answer), 0)
  const phase = finished ? 'results' : answered ? 'feedback' : 'question'
  const previous = useRef('0:question'), complete = useRef(onComplete)
  complete.current = onComplete
  useEffect(() => { if (finished) { complete.current(); onResult?.({ answers: [...answers], score, total: story.quiz.length }) } }, [finished])
  useEffect(() => {
    const next = `${question}:${phase}`
    if (previous.current === next) return
    previous.current = next
    const target = finished ? result.current : answered ? feedback.current : questionHeading.current
    target?.focus({ preventScroll: true }); target?.scrollIntoView({ behavior: 'instant', block: 'nearest' })
  }, [question, phase, finished, answered])
  if (finished) return <section className="quiz-reward" aria-label="Apollo 16 quiz results">
    <h2 id="apollo16-quiz-results" ref={result} tabIndex={-1} className={styles.focusTarget}>Your Apollo 16 results</h2>
    <p>You scored {score} / {story.quiz.length}. Choose Complete Story below to record your completion and {story.reward} badge.</p>
    <button type="button" onClick={() => { stopRecordedNarration(); onRetry(); submitted.current = []; setQuestion(0); setAnswers([]); setFinished(false) }}>TRY AGAIN</button>
  </section>
  const audio = apollo16QuizRecordings[question]
  return <section className="quiz-experience" aria-label="Apollo 16 knowledge assessment">
    <p id="apollo16-quiz-position">QUESTION {question + 1} / {story.quiz.length}</p>
    <h2 id="apollo16-quiz-question" ref={questionHeading} tabIndex={-1} onPointerEnter={event => { if (event.pointerType === 'mouse') onQuestionHover?.(question) }} className={styles.focusTarget} aria-describedby="apollo16-quiz-position">{item.question}</h2>
    {renderRecording ? renderRecording(question) : <StoryRecording key={audio} src={audio} label={`Original question ${question + 1} recording. Question and answer choices are below; listening review is pending.`} sound={sound} onSound={onSound} timing={apollo16CaptionTiming[audio]} />}
    <div className="quiz-options">{item.options.map((option, i) => <button key={option} type="button" disabled={answered}
      aria-pressed={answered ? answers[question] === i : undefined}
      className={answered ? i === item.answer ? 'correct' : answers[question] === i ? 'wrong' : '' : ''}
      onClick={() => {
        if (submitted.current[question] !== undefined) return
        submitted.current = [...submitted.current, i]; setAnswers(submitted.current)
      }}><span>{String.fromCharCode(65 + i)}</span>{option}</button>)}</div>
    {answered && <div className={`quiz-explanation ${styles.feedback}`} role="region" aria-label="Answer feedback">
      <p id="apollo16-quiz-feedback" ref={feedback} tabIndex={-1} className={styles.focusTarget}>{answers[question] === item.answer ? 'Correct. ' : `Incorrect. Correct answer: ${item.options[item.answer]}. `}{item.explanation}</p>
      <button type="button" onClick={() => { stopRecordedNarration(); if (question === story.quiz.length - 1) setFinished(true); else setQuestion(value => value + 1) }}>{question === story.quiz.length - 1 ? 'View Results' : 'NEXT QUESTION'}</button>
    </div>}
  </section>
}
