import { apollo15StoryMedia } from '../apollo15StoryMedia'
import type { EvidencePrediction } from './evidencePrediction'

/** Verified 2026-11-08. A prediction about a real demonstration, not a repair task. */
export const apollo15HammerFeatherPrediction = {
  id: 'apollo15-hammer-feather',
  title: 'Predict, then examine the evidence',
  context: 'During Apollo 15, David Scott compared a hammer and a falcon feather on the Moon. Imagine both released together, at rest, from the same height.',
  question: 'With almost no air resistance, which would reach the lunar surface first?',
  options: [
    {
      id: 'hammer', label: 'The hammer arrives first',
      feedback: 'A heavier object does not gain a greater gravitational acceleration just because it has more mass. On Earth, air resistance can make a feather fall differently.',
    },
    {
      id: 'together', label: 'They arrive together',
      feedback: 'That prediction matches the observed result. With negligible air resistance, objects released together from the same height share the same gravitational acceleration.',
    },
    {
      id: 'feather', label: 'The feather arrives first',
      feedback: 'Being lighter does not make the feather accelerate faster in a vacuum. Both objects respond to lunar gravity without the air drag familiar on Earth.',
    },
  ],
  answerId: 'together',
  observation: 'In the televised demonstration on August 2, 1971, the hammer and feather landed together within the accuracy of the release and observation.',
  interpretation: 'This still documents the demonstration; one still cannot establish the landing times. Open NASA’s original video and explanation to examine the motion. Gravity is present on the Moon.',
  evidence: apollo15StoryMedia.hammer,
  sources: [
    { label: 'NASA Science: demonstration, original video and explanation', url: 'https://science.nasa.gov/resource/the-apollo-15-hammer-feather-drop/' },
    { label: 'NASA history: Apollo 15 surface operations and image S71-43788', url: 'https://www.nasa.gov/history/50-years-ago-apollo-15-on-the-moon-at-hadley-apennine/' },
  ],
} as const satisfies EvidencePrediction
