import { perseveranceJourneyMedia, type StoryImageMedia } from './journeyMedia'
import { challengeEvidence } from './challengeMedia'

export const legacyReviewedOn = '2026-11-04'
export type LegacyReference = { label: string; url: string; publishedOn?: string }
export type LegacyMilestone = {
  id: string
  dateLabel: string
  startDate?: string
  endDate?: string
  category: 'accomplished' | 'ongoing' | 'possible'
  title: string
  copy?: string
  /** Retain the five existing legacy story entries verbatim without editing shared data. */
  legacyIndex?: 0 | 1 | 2 | 3 | 4
  detail: string
  significance: string
  caution?: string
  expectation?: string
  media: StoryImageMedia
  mediaContext: string
  references: readonly LegacyReference[]
}

export const legacyReferences = {
  mission: { label: 'NASA — Perseverance mission and active status', url: 'https://science.nasa.gov/mission/mars-2020-perseverance/' },
  landingVideo: { label: 'JPL — High-definition descent and touchdown footage', url: 'https://www.jpl.nasa.gov/news/nasas-mars-perseverance-rover-provides-front-row-seat-to-landing-first-audio-recording-of-red-planet/', publishedOn: '2021-02-22' },
  ingenuity: { label: 'NASA — Ingenuity mission ends', url: 'https://www.nasa.gov/news-release/after-three-years-on-mars-nasas-ingenuity-helicopter-mission-ends/', publishedOn: '2024-01-25' },
  oxygenFirst: { label: 'NASA — MOXIE first oxygen production', url: 'https://science.nasa.gov/blog/moxie-celebrates-2-years-on-mars-discoveries-and-work-left-to-do/' },
  oxygenFinal: { label: 'JPL — MOXIE completes its experiment', url: 'https://www.jpl.nasa.gov/news/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/', publishedOn: '2023-09-06' },
  samples: { label: 'JPL — Completed backup sample depot', url: 'https://www.jpl.nasa.gov/news/nasas-perseverance-rover-shows-off-collection-of-mars-samples/', publishedOn: '2023-02-14' },
  record: { label: 'NASA — Off-world driving record, October 2026', url: 'https://science.nasa.gov/blogs/perseverance-mars-rover/2026/10/12/nasas-perseverance-sets-off-world-record-for-total-distance-driven/', publishedOn: '2026-10-12' },
} as const satisfies Record<string, LegacyReference>

const image = (id: string, width: number, height: number) => ({
  src: `/media/perseverance-legacy/${id}-${width}.jpg`,
  srcSet: `/media/perseverance-legacy/${id}-720.jpg 720w, /media/perseverance-legacy/${id}-${width}.jpg ${width}w`,
  width, height, verifiedOn: legacyReviewedOn,
  usagePolicyUrl: 'https://www.jpl.nasa.gov/jpl-image-use-policy/',
  usageNotes: 'Factual educational use with the full caption credit under JPL image-use policy. No agency endorsement implied; logos and third-party rights remain separate.',
})
export const legacyMedia = {
  ingenuity: {
    ...image('ingenuity', 1280, 960), id: 'ingenuity', title: 'A first flight on another planet', kind: 'Photograph', credit: 'NASA/JPL-Caltech',
    caption: 'Perseverance’s Navcam captured this still of Ingenuity’s first flight on April 19, 2021. The small helicopter is visible above the terrain near the center. No animation is played.',
    alt: 'A Navcam photograph shows the small Ingenuity helicopter hovering near the center of a wide rocky Martian landscape, with hills behind it.',
    sourceUrl: 'https://www.jpl.nasa.gov/images/pia24586-perseverances-navcam-view-of-ingenuitys-first-flight/',
    originalUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA24586.jpg',
  },
  moxie: {
    ...image('moxie', 1440, 1080), id: 'moxie', title: 'The experiment inside the rover', kind: 'Photograph', credit: 'NASA/JPL-Caltech',
    caption: 'Hardware photograph published January 19, 2021: MOXIE installed inside Perseverance before landing. This is not a photograph of oxygen being produced on Mars.',
    alt: 'A close-up hardware photograph shows the gold-colored MOXIE instrument inside Perseverance, with white intake tubing, wiring and metal fittings.',
    sourceUrl: 'https://www.jpl.nasa.gov/images/pia24203-moxie-all-tucked-in/',
    originalUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA24203.jpg',
  },
} as const satisfies Record<string, StoryImageMedia>

/** Selected milestones ordered by their starting date, not a complete mission log. */
export const legacyMilestones = [
  { id: 'launch', dateLabel: '30 JUL 2020', startDate: '2020-07-30', category: 'accomplished', title: 'A precise new explorer', legacyIndex: 0,
    detail: 'I launched on July 30, 2020, carrying science instruments, precision-landing technology and experiments for future exploration.',
    significance: 'A rover can investigate Mars and test new ways to explore at the same time.',
    media: perseveranceJourneyMedia.launch, mediaContext: 'A real photograph from launch day.', references: [legacyReferences.mission] },
  { id: 'landing', dateLabel: '18 FEB 2021', startDate: '2021-02-18', category: 'accomplished', title: 'Touchdown at Jezero', legacyIndex: 1,
    detail: 'I landed on February 18, 2021. Terrain-Relative Navigation helped me avoid hazardous terrain during descent.',
    significance: 'Precision landing helps robotic explorers reach scientifically interesting places safely.',
    media: perseveranceJourneyMedia.landing, mediaContext: 'Actual landing-camera frame; separate from the educational reconstruction in My Journey.',
    references: [legacyReferences.mission, legacyReferences.landingVideo, { label: 'JPL — Landing hazard avoidance', url: challengeEvidence.hazards.sourceUrl }] },
  { id: 'ingenuity', dateLabel: '19 APR 2021 – 18 JAN 2024', startDate: '2021-04-19', endDate: '2024-01-18', category: 'accomplished', title: 'A helicopter partnership', legacyIndex: 2,
    detail: 'Ingenuity first flew on April 19, 2021. Its last flight was January 18, 2024; NASA announced the end of its mission on January 25 after 72 flights.',
    significance: 'The helicopter demonstrated powered, controlled flight on another planet and later helped scout terrain for the rover team.',
    caution: 'Ingenuity’s flight mission ended. This date range describes the helicopter partnership, not the end of Perseverance’s mission.',
    media: legacyMedia.ingenuity, mediaContext: 'The picture records the first flight, not the final flight.', references: [legacyReferences.ingenuity] },
  { id: 'oxygen', dateLabel: '20 APR 2021 – 7 AUG 2023', startDate: '2021-04-20', endDate: '2023-08-07', category: 'accomplished', title: 'Making oxygen on Mars',
    copy: 'MOXIE tested how to extract oxygen from the carbon-dioxide-rich Martian atmosphere.',
    detail: 'Its first oxygen production was April 20, 2021. By its final run on August 7, 2023, the experiment had produced 122 grams of oxygen across 16 runs.',
    significance: 'The demonstration gives engineers evidence for designing larger systems that could support future exploration.',
    caution: 'MOXIE completed its experiment in 2023. It was not a full-scale oxygen supply for a crew.',
    media: legacyMedia.moxie, mediaContext: 'Prelanding hardware photograph; the dated results come from the linked experiment reports.',
    references: [legacyReferences.oxygenFirst, legacyReferences.oxygenFinal] },
  { id: 'depot', dateLabel: '21 DEC 2022 – 28 JAN 2023', startDate: '2022-12-21', endDate: '2023-01-28', category: 'accomplished', title: 'A backup sample collection',
    copy: 'I placed ten sample tubes at Three Forks, creating a documented backup collection on the Martian surface.',
    detail: 'The depot was assembled from December 21, 2022 to January 28, 2023. Its tubes include rock and regolith samples, an atmospheric sample and a witness tube.',
    significance: 'Preserving material with its context keeps options open for more detailed future study.',
    caution: 'A depot on Mars is an accomplishment. Bringing these samples to Earth is a possible future outcome, not a completed achievement.',
    media: challengeEvidence.tubes, mediaContext: 'Photomontage of separate tube images, not their physical arrangement.', references: [legacyReferences.samples] },
  { id: 'distance', dateLabel: '11 OCT 2026', startDate: '2026-10-11', category: 'accomplished', title: 'A new off-world driving record',
    copy: 'NASA reported that on October 11, 2026, my total driving distance reached 45.22 kilometers, exceeding Opportunity’s off-world record.',
    detail: 'NASA published the milestone on October 12. The distance belongs to that event date; it is not a live odometer reading.',
    significance: 'AutoNav lets a rover evaluate terrain while moving between waypoints chosen by its Earth-based team.',
    media: challengeEvidence.autonav, mediaContext: 'Supporting archival image: JPL’s annotated June 29, 2023 AutoNav composite illustrates the capability. It does not depict the October 2026 record drive.',
    references: [legacyReferences.record] },
  { id: 'ongoing', dateLabel: 'STATUS CHECK · 4 NOV 2026', startDate: legacyReviewedOn, category: 'ongoing', title: 'My story is still being written', legacyIndex: 3,
    detail: 'NASA lists Perseverance as an active mission. Its October 2026 report describes exploration beyond Jezero’s western rim.',
    significance: 'An ongoing mission can revisit scientific questions as new terrain becomes accessible.',
    expectation: 'The October report says the team hopes to find traces of ancient hydrothermal systems near Idubi. That is a research expectation, not a confirmed discovery.',
    caution: 'Status checked on November 4, 2026. This is a dated snapshot, not a live mission feed or a complete list of discoveries.',
    media: perseveranceJourneyMedia.explore, mediaContext: 'Archival rover portrait at Rochette, September 10, 2021; not an image of the rover’s November 2026 location.',
    references: [legacyReferences.mission, legacyReferences.record] },
  { id: 'future', dateLabel: 'FUTURE POSSIBILITIES · UNDATED', category: 'possible', title: 'Pathfinder for explorers', legacyIndex: 4,
    detail: 'Navigation experience, sample documentation and MOXIE’s results can help engineers and scientists evaluate future exploration ideas.',
    significance: 'A legacy is useful knowledge that other explorers may build on; it is not a promise that a particular mission will happen.',
    caution: 'Possible sample return, larger oxygen systems and human exploration are not completed outcomes. No launch date, crewed landing or successful return is promised here.',
    media: challengeEvidence.tubes, mediaContext: 'Existing tubes on Mars illustrate material available for potential study. This is not an image of samples returned to Earth.',
    references: [legacyReferences.mission, legacyReferences.oxygenFinal] },
] as const satisfies readonly LegacyMilestone[]

export const legacyCategoryLabels = {
  accomplished: 'Accomplished event', ongoing: 'Mission status snapshot', possible: 'Possible future outcome',
} as const
