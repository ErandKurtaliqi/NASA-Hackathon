import type { QuizQuestion } from '../../machineStories'

export type QuizAttempt = { question: number; selected: number | null; answers: readonly number[]; showResults: boolean }
export type QuizAction = { type: 'select'; option: number } | { type: 'submit' } | { type: 'advance' } | { type: 'retry' }

export const createQuizAttempt = (): QuizAttempt => ({ question: 0, selected: null, answers: [], showResults: false })

/** Temporary attempt only. No persistence, rewards or chapter mutations. */
export function reduceQuizAttempt(questions: readonly QuizQuestion[], state: QuizAttempt, action: QuizAction): QuizAttempt {
  if (action.type === 'retry') return state.showResults ? createQuizAttempt() : state
  if (state.showResults) return state
  const question = questions[state.question]
  if (!question) return state
  const submitted = state.answers[state.question] !== undefined
  if (action.type === 'select') {
    return !submitted && Number.isInteger(action.option) && action.option >= 0 && action.option < question.options.length
      ? { ...state, selected: action.option } : state
  }
  if (action.type === 'submit') {
    return !submitted && state.selected !== null && state.answers.length === state.question
      ? { ...state, answers: [...state.answers, state.selected] } : state
  }
  if (!submitted) return state
  return state.question === questions.length - 1
    ? { ...state, showResults: true } : { ...state, question: state.question + 1, selected: null }
}

export function scoreQuiz(questions: readonly QuizQuestion[], answers: readonly number[]) {
  return answers.reduce((score, answer, index) => score + (questions[index]?.answer === answer ? 1 : 0), 0)
}

export function quizResultMessage(score: number, total: number) {
  if (score === total) return 'Every answer is correct in this attempt. Keep connecting what you know to the scientific evidence.'
  if (score === 0) return 'This attempt is complete. Revisit the explanations and try another round; learning takes practice.'
  return 'This attempt is complete. Review the topics you missed, then try again when you are ready.'
}
