import type { StoryEvidenceMedia } from '../../../components/storytelling/StoryMedia'

export type EvidencePrediction = {
  id: string
  title: string
  context: string
  question: string
  options: readonly { id: string; label: string; feedback: string }[]
  answerId: string
  observation: string
  interpretation: string
  evidence: StoryEvidenceMedia
  sources: readonly { label: string; url: string }[]
}

export type PredictionReview = { choiceId: string; correct: boolean; feedback: string }

/** Invalid/empty choices never manufacture an assessment or affect mission state. */
export function reviewPrediction(activity: EvidencePrediction, choiceId: string | null): PredictionReview | undefined {
  const choice = activity.options.find(option => option.id === choiceId)
  return choice ? { choiceId: choice.id, correct: choice.id === activity.answerId, feedback: choice.feedback } : undefined
}
