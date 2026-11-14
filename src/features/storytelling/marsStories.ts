import originalContent from './marsStoryContent.json'
import { ingenuityContent, ingenuityIdentity, ingenuityQuiz, ingenuityReviewNote, ingenuitySource, ingenuitySources } from './ingenuityStory'
import type { MachineStory, QuizQuestion } from '../../machineStories'
import type { HardwareProfile } from '../../types'

const content = { ...originalContent, ingenuity: ingenuityContent }
export type MarsStoryId = keyof typeof content
export const marsStoryIds: readonly MarsStoryId[] = ['sojourner', 'opportunity', 'viking-1', 'ingenuity']
export const isMarsStory = (id: string): id is MarsStoryId => Object.prototype.hasOwnProperty.call(content, id)
export const marsStoryContent = content

export const marsMissionSources = {
  ingenuity: ingenuitySource,
  sojourner: { label: 'NASA Science — Mars Pathfinder', url: 'https://science.nasa.gov/mission/mars-pathfinder/' },
  opportunity: { label: 'NASA Science — Opportunity', url: 'https://science.nasa.gov/mission/mer-opportunity/' },
  'viking-1': { label: 'NASA Science — Viking 1', url: 'https://science.nasa.gov/mission/viking-1/' },
}

// Questions, answer choices and keys follow the supplied PDFs. Explanations do
// not add claims about life, coordinates, mass or unverified future discoveries.
export const marsQuizzes: Record<MarsStoryId, QuizQuestion[]> = {
  ingenuity: ingenuityQuiz,
  sojourner: [
    { question: 'Sojourner made history on Mars! What was the special achievement that made it a pioneer?', options: ['First spacecraft to orbit Mars', 'First human to walk on Mars', 'First wheeled vehicle operated on another planet', 'First rover to bring Martian rocks to Earth'], answer: 2, explanation: 'Sojourner was the first wheeled vehicle operated on another planet.' },
    { question: 'Sojourner could not send messages directly to Earth. Which trusted partner helped carry its messages home?', options: ['The Pathfinder lander', 'The Mars Reconnaissance Orbiter', 'The Viking 1 lander', 'The Hubble Space Telescope'], answer: 0, explanation: 'Pathfinder was the rover’s communications partner.' },
    { question: 'Sojourner was designed to explore Mars for just 7 days. How long did its little wheels keep exploring?', options: ['83 Martian days', '180 Martian days', '200 Martian days', '30 Martian days'], answer: 0, explanation: 'The supplied account describes 83 Martian days against a seven-day plan.' },
  ],
  opportunity: [
    { question: 'Opportunity was designed to explore Mars for just 90 Martian days. How long did its adventure actually last?', options: ['Almost 15 Earth years', 'About 1 Earth year', 'More than 30 Earth years', 'About 5 Earth years'], answer: 0, explanation: 'Opportunity operated for almost 15 Earth years.' },
    { question: 'What was the name of the crater where Opportunity first landed on Mars?', options: ['Gusev Crater', 'Eagle Crater', 'Endeavour Crater', 'Victoria Crater'], answer: 1, explanation: 'Opportunity first came to rest inside Eagle Crater.' },
    { question: 'What was Opportunity’s biggest discovery about Mars?', options: ['Mars once had flowing liquid water', 'Mars once had forests and trees.', 'Mars has oceans of liquid water today.', 'Mars once had active dinosaurs.'], answer: 0, explanation: 'Its geological evidence supported an ancient watery environment, not forests, dinosaurs or proof of life.' },
  ],
  'viking-1': [
    { question: 'Where did Viking 1 successfully land on Mars on July 20, 1976?', options: ['Jezero Crater', 'Gale Crater', 'Chryse Planitia', 'Utopia Planitia'], answer: 2, explanation: 'Viking 1 landed at Chryse Planitia.' },
    { question: "What was the final scientific conclusion of Viking 1's biology experiments?", options: ['Unexpected chemical activity, no proof of life.', 'They confirmed living microorganisms', 'They proved Mars had no water', 'They discovered large fossils'], answer: 0, explanation: 'The experiments did not establish the presence of living microorganisms.' },
    { question: 'Viking 1 was designed for about 90 days. How long did its lander actually operate on Mars?', options: ['More than eight years', 'More than six years.', 'About 180 days', 'More than one year'], answer: 1, explanation: 'The lander operated for more than six years.' },
  ],
}

const identity = {
  ingenuity: ingenuityIdentity,
  sojourner: { name: 'Sojourner', type: 'Mars rover', mission: 'Mars Pathfinder', site: 'Ares Vallis', reward: 'Ares Vallis Explorer', dates: 'Launched Dec 4, 1996 · Landed with Pathfinder Jul 4, 1997', instruments: ['Cameras', 'Alpha Proton X-Ray Spectrometer'] },
  opportunity: { name: 'Opportunity', type: 'Mars rover', mission: 'Mars Exploration Rover B', site: 'Meridiani Planum', reward: 'Meridiani Field Explorer', dates: 'Launched Jul 7, 2003 · Landed Jan 2004', instruments: ['Pancam', 'APXS', 'Microscopic Imager', 'Rock Abrasion Tool'] },
  'viking-1': { name: 'Viking 1', type: 'Mars lander', mission: 'Viking 1 Lander', site: 'Chryse Planitia', reward: 'Chryse Science Investigator', dates: 'Launched Aug 20, 1975 · Landed Jul 20, 1976', instruments: ['Cameras', 'Biology laboratory', 'Sampling arm', 'Weather instruments'] },
}

export const marsMachineStories: Record<string, MachineStory> = Object.fromEntries(marsStoryIds.map(id => {
  const mission = identity[id], chapters = content[id].chapters
  return [id, {
    id, machineId: id, name: mission.name, shortName: mission.name, planet: 'mars', missionLabel: mission.mission,
    status: 'MISSION COMPLETE', heroLine: id === 'viking-1' ? 'A stationary lander studying Mars from one place.' : id === 'ingenuity' ? 'The little helicopter that changed the sky.' : 'Follow the original mission story, one discovery at a time.',
    intro: chapters[0][0].text,
    profile: [{ label: 'Mission', value: mission.mission }, { label: 'Machine', value: mission.type }, { label: 'Exploration region', value: mission.site }],
    sources: id === 'ingenuity' ? ingenuitySources : [marsMissionSources[id]],
    journey: chapters[1].map(segment => ({ label: segment.title, title: segment.title, date: 'MISSION RECORD', copy: segment.text })),
    challenges: chapters[2].map(segment => ({ title: segment.title, problem: segment.text, solution: 'Compare the original account with the linked NASA evidence and review notes.' })),
    discoveries: chapters[2].map(segment => ({ title: segment.title, detail: segment.text })),
    legacy: chapters[3].map(segment => ({ year: 'MISSION RECORD', title: segment.title, copy: segment.text })),
    quiz: marsQuizzes[id], reward: mission.reward,
  } satisfies MachineStory]
}))

// Ingenuity already has an approved hardware entry in data.ts; do not duplicate it.
export const marsStoryHardware: HardwareProfile[] = marsStoryIds.filter(id => id !== 'ingenuity').map(id => ({
  id, name: identity[id].name, type: identity[id].type, planet: 'mars', missionDate: identity[id].dates,
  overview: id === 'viking-1' ? 'A stationary science lander, not a wheeled rover.' : `${identity[id].name}: a robotic explorer of Mars.`,
  purpose: id === 'viking-1' ? 'Study the surface, weather and soil from a fixed landing site.' : 'Explore Martian rocks and the history of the surface.',
  instruments: identity[id].instruments, source: marsMissionSources[id],
}))

/** Display beside the unedited scripts, never silently alter the supplied audio. */
export function marsReviewNote(id: MarsStoryId, chapter: number, segment: number): string | undefined {
  if (id === 'ingenuity') return ingenuityReviewNote(chapter, segment)
  if (id === 'sojourner' && chapter === 0 && segment === 1) return 'Source discrepancy: the script says 10.5 kg; NASA’s mission page gives 10.6 kg. Treat the mass as approximate, about 11 kg.'
  if (id === 'sojourner' && chapter === 2 && [0, 3].includes(segment)) return 'Editorial review pending: the PDF’s evidence caption does not support this specific modem/white-soil account. The original narration is preserved; independent NASA verification is still required.'
  if (id === 'sojourner' && chapter === 3 && segment === 0) return 'A sol is a Martian day. The spoken “07 days” refers to the rover’s seven-sol design mission; distinguish this from Earth days.'
  if (id === 'viking-1' && chapter === 3 && segment === 0) return 'Correction to the original script: NASA’s mission history dates the memorial renaming to January 1982, not January 7, 1981. The supplied recording remains unchanged and needs editorial correction.'
  if (id === 'viking-1' && chapter === 2 && segment === 2) return 'These experiments did not prove that life existed on Mars. Keep the uncertain biology result separate from a confirmed discovery of life.'
}
