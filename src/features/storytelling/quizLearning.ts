export type QuizLearning = {
  id: string
  note: string
  wrongAnswers: Readonly<Partial<Record<number, string>>>
  sources: readonly { label: string; url: string }[]
}

/** Explanations supplement, never replace, the existing question/answer data. */
export const perseveranceQuizLearning = [
  {
    id: 'jezero',
    note: 'Past habitability means an environment could have supported life. It does not establish that life was present.',
    wrongAnswers: {
      1: 'NASA chose Jezero for evidence of an ancient river and lake system. Being the warmest place is not the reason described by the mission.',
      2: 'An ancient delta preserves clues to past environments. It is not evidence of active forests or confirmed life on Mars.',
    },
    sources: [{ label: 'NASA — Why Jezero Crater?', url: 'https://science.nasa.gov/mission/mars-2020-perseverance/' }],
  },
  {
    id: 'landing',
    note: 'The parachute slowed the spacecraft earlier. The powered descent stage then performed the cable-lowering sky-crane maneuver.',
    wrongAnswers: {
      0: 'Perseverance was lowered by cables from its powered descent stage. The name of that maneuver is sky crane, rather than lunar module.',
      2: 'A balloon was not the cable-lowering system. The sky crane used the powered descent stage to lower the rover onto its wheels.',
    },
    sources: [{ label: 'NASA — How Perseverance landed', url: 'https://science.nasa.gov/planetary-science/programs/mars-exploration/mission-timeline/how-we-land-on-mars/' }],
  },
  {
    id: 'samples',
    note: 'This question focuses on geological samples. The mission also uses atmospheric and witness tubes; not every tube contains a rock core.',
    wrongAnswers: {
      1: 'Collecting a sample does not mean living organisms have been found. The tubes preserve scientific material for study, not confirmed Martian animals.',
      2: 'The collected rock and regolith are scientific samples, not engine fuel. Their documented context helps scientists interpret what they contain.',
    },
    sources: [
      { label: 'NASA — Mission science and samples', url: 'https://science.nasa.gov/mission/mars-2020-perseverance/' },
      { label: 'JPL — Rock, regolith, atmospheric and witness tubes', url: 'https://www.jpl.nasa.gov/news/nasas-perseverance-rover-shows-off-collection-of-mars-samples/' },
    ],
  },
] as const satisfies readonly QuizLearning[]

export const quizSourcesReviewedOn = '2026-11-04'
