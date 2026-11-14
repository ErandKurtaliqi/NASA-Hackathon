import type { QuizQuestion } from '../../machineStories'
import { ingenuityVideoSources } from './ingenuityStoryMedia'

// Editorial basis: Haroon's INGENUITY Storytelling.pdf, seven pages.
// Paragraphs preserve the supplied account; scientific qualifications are
// displayed separately. Filename mapping is verified, listening/timing pending.
const segment = (chapter: number, number: number, title: string, text: string) => ({
  title, text, audio: `/audio/ingenuity/chapter-${chapter}/${number}.mp3`,
  sourceChapter: chapter, sourceSegment: number,
})
export const ingenuityContent = { chapters: [
  [
    segment(1, 1, 'Meet Me', 'I was tiny, but my dream was enormous. Mars had barely enough air to lift me... yet I was ready to try! I am Ingenuity, the little helicopter that dared to fly on another world!'),
    segment(1, 2, 'Who Built Me?', 'Engineers at NASA’s Jet Propulsion Laboratory in California built me. I have four lightweight carbon-fibre blades arranged into two rotors that spin in opposite directions. A solar panel charges my six batteries, and four little legs help me stand on Mars.'),
    segment(1, 3, 'Why Was I Created?', 'I wasn’t sent to Mars to search for little green aliens or collect rocks. I was a technology experiment! My job was to prove that a powered aircraft could fly in the Martian atmosphere, which is only about one percent as dense as Earth’s atmosphere.'),
    segment(1, 4, 'My Partner', 'I didn’t travel to Mars alone. My trusted partner, Perseverance, carried me across millions of kilometers. Once we arrived, we had different missions, but one shared world to explore!'),
  ],
  [
    segment(2, 1, 'My Launch', 'The day had come to leave my home! From Cape Canaveral, Florida, the mighty Atlas V rocket roared to life. On July 30, 2020, my journey to Mars began!'),
    segment(2, 2, 'Touchdown on Mars', 'At last... the red world was beneath us! After seven months in space, Perseverance touched down in Jezero Crater on February 18, 2021. I had finally reached Mars!'),
    segment(2, 3, 'First steps', 'April 3, 2021... Perseverance carefully placed me on Martian soil, then drove four metres away. My four little feet were finally on another world. I stood alone—what a beautiful moment!'),
    segment(2, 4, 'I Flew Myself', 'At Wright Brothers Field, April 19, 2021, I rose 03 metres, hovered for 30 seconds, and landed after 39.1 seconds—making the first powered, controlled flight on another world, all autonomously.'),
  ],
  [
    segment(3, 1, 'Harsh Winter', "May 3, 2022... dust dimmed my sunlight. My batteries weakened, and my heaters fell silent in Mars' freezing night. I lost contact... no one could hear me! but Perseverance kept listening. But on May 5, my signal finally returned!"),
    segment(3, 2, 'A Flight that nearly went wrong', 'May 22, 2021... my sixth flight turned terrifying! A camera glitch confused my navigation, sending me rocking over 20 degrees. My systems fought back, steadied me, and brought me safely home!'),
    segment(3, 3, 'My Eyes from Above', 'July 5, 2021... I flew 625 metres across dangerous Séítah, reaching 10 metres high in 2 minutes 46 seconds! I revealed hidden dunes, ancient rocks and possible pathways of underground water!'),
    segment(3, 4, '72 Flights', 'Scientists just planned 30 days and five test flights. But I kept rising—72 flights, 17 km, and 128.8 minutes across nearly 03 years! A tiny helicopter, far beyond expectations!'),
  ],
  [
    segment(4, 1, 'My Last Flight', "January 18, 2024... I rose 12 metres on flight 72. My camera couldn't find enough landmarks on the bare sand; I drifted into a hard landing, breaking my blades. Was this my final goodbye?"),
    segment(4, 2, 'When my Wings fell silent', 'January 25, 2024... NASA delivered the news: my damaged blades meant I could never fly again. I still stood on Mars, sending messages through Perseverance—but my days in the sky were over.'),
    segment(4, 3, 'My Dream Lives On', "NASA's three Skyfall helicopters will build on my lessons—searching for hidden ice, studying weather, and helping future explorers find safer landing places. My wings are silent, but the future I opened is only beginning."),
    segment(4, 4, 'I Opened the Sky', 'My greatest achievement was proving that powered flight is possible in the thin air of Mars. The information engineers learned from me can help shape future flying explorers. I had opened a new way for humanity to explore another world.'),
  ],
] }

export const ingenuitySource = { label: 'NASA Science — Ingenuity Mars Helicopter', url: 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/' }
export const ingenuitySources = [
  ingenuitySource,
  ...ingenuityVideoSources.map(video => ({ label: video.title, url: video.url })),
  { label: 'NASA — Flight 9 and geological context', url: 'https://www.jpl.nasa.gov/news/nasas-mars-helicopter-reveals-intriguing-terrain-for-rover-team/' },
  { label: 'NASA — Final flight accident investigation', url: 'https://www.nasa.gov/missions/mars-2020-perseverance/ingenuity-helicopter/nasa-performs-first-aircraft-accident-investigation-on-another-world/' },
  { label: 'NASA Science — SkyFall, a future mission', url: 'https://science.nasa.gov/mission/skyfall/' },
]
// Correct choices are highlighted in orange on PDF page 7 (verified visually)
// and cross-checked against NASA's mission page, not inferred from audio titles.
export const ingenuityQuiz: QuizQuestion[] = [
  { question: 'Where did Ingenuity arrive on Mars with Perseverance?', options: ['Gale Crater', 'Jezero Crater', 'Eagle Crater', 'Victoria Crater'], answer: 1, explanation: 'Ingenuity arrived with Perseverance in Jezero Crater.' },
  { question: 'How many flights did Ingenuity complete, although it was designed for only five?', options: ['12 flights', '25 flights', '72 flights', '100 flights'], answer: 2, explanation: 'Ingenuity completed 72 flights, exceeding the five-flight demonstration.' },
  { question: 'How long did Ingenuity remain active on Mars?', options: ['About 6 months', 'About 1 year', 'Almost 3 years', 'About 5 years'], answer: 2, explanation: 'The flight mission lasted nearly three years, ending in January 2024. This does not imply that every electronic system stopped that day.' },
]
export const ingenuityIdentity = { name: 'Ingenuity', type: 'Mars helicopter', mission: 'Mars 2020 technology demonstration', site: 'Jezero Crater', reward: 'Jezero Flight Explorer', dates: 'Launched Jul 30, 2020 · First flight Apr 19, 2021 · Final flight Jan 18, 2024', instruments: ['Navigation camera', 'Color camera', 'Inertial sensors', 'Solar panel and batteries'] }

export function ingenuityReviewNote(chapter: number, segment: number): string | undefined {
  if (chapter === 2 && segment === 2) return 'Scientific qualification: these aerial images show geological features that may record ancient water processes. Ingenuity did not detect underground water. NASA describes the ridges as possible former fluid pathways in rock; the original wording needs editorial review.'
  if (chapter === 2 && segment === 3) return 'The original 30-sol demonstration was approximately 31 Earth days. The script rounds the total distance and flight duration.'
  if (chapter === 3 && segment === 0) return 'NASA’s later accident investigation reconstructed the likely sequence from limited data. A hard landing and subsequent blade failure are an investigation finding, not footage of the impact.'
  if (chapter === 3 && segment === 2) return 'SkyFall is a future mission, not a flight already completed on Mars. NASA’s November 2026 mission page describes three planned helicopters. The linked artist’s concept is not a photograph of Ingenuity.'
}
