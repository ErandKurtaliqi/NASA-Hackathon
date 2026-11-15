import type { MachineStory } from '../../machineStories'
import type { HardwareProfile } from '../../types'
import type { DocumentaryGalleryItem, StoryEvidenceMedia } from '../../components/storytelling/StoryMedia'
import evidence from './apollo11EagleEvidence.json'

const sources = [
  { label: 'NASA — Apollo 11', url: 'https://www.nasa.gov/mission/apollo-11/' },
  { label: 'NASA — Apollo 11 mission overview', url: 'https://www.nasa.gov/wp-content/uploads/static/history/alsj/a11/a11ov.html' },
  { label: 'NASA — Apollo 11 lunar surface experiments', url: 'https://www.nasa.gov/history/alsj/a11/a11.lrrr.html' },
]

export const eagleHardware: HardwareProfile = {
  id: 'lunar-module', name: 'Apollo 11 Lunar Module Eagle', type: 'Lunar lander descent stage', planet: 'moon',
  missionDate: 'Landed July 20, 1969',
  overview: 'Eagle carried Neil Armstrong and Buzz Aldrin to Tranquility Base. Its descent stage remains on the Moon.',
  purpose: 'Land two astronauts on the Moon and support their surface stay. The ascent stage returned them to lunar orbit.',
  instruments: ['Throttleable descent engine', 'Landing radar', 'Landing gear', 'Crew cabin and life support'],
  source: sources[0],
}

export const eagleAudioPath = (chapter: number, track: number) => `/audio/apollo-11-eagle/chapter-${chapter}/${track}.mp3`

export const eagleChapters = evidence.map((chapter, c) => chapter.map((segment, s) => ({
  ...segment,
  audio: eagleAudioPath(c + 1, s + 1),
  gallery: segment.gallery.map((item): DocumentaryGalleryItem => {
    if (item.src) {
      return { ...item, kind: 'Photograph', originalUrl: item.src, srcSet: '',
        verifiedOn: '2026-11-15', usagePolicyUrl: 'https://www.nasa.gov/nasa-brand-center/images-and-media/',
        usageNotes: 'Educational evidence from the supplied Eagle story package.' }
    }
    if (item.url && item.label) return { type: 'link', url: item.url, label: item.label }
    throw new Error('Missing Eagle evidence link')
  }),
})))

const portrait = eagleChapters[2][1].gallery.find((item): item is StoryEvidenceMedia =>
  'src' in item && item.src.includes('as11-40-5927'))
if (!portrait) throw new Error('Missing Eagle portrait')
export const eaglePortrait = portrait

export const eagleStory: MachineStory = {
  id: 'apollo-11-eagle', machineId: eagleHardware.id, name: eagleHardware.name,
  shortName: 'LM-5', missionLabel: 'Apollo 11', planet: 'moon', status: 'DESCENT STAGE AT TRANQUILITY BASE',
  heroLine: 'Eagle brought the first people to land on the Moon. Its descent stage still stands at Tranquility Base.',
  intro: eagleChapters[0][0].text,
  profile: [{ label: 'TYPE', value: 'Two-stage crewed lunar module' }, { label: 'SITE', value: 'Tranquility Base' }],
  sources,
  journey: eagleChapters[1].map(({ title, text }) => ({ label: title, date: 'July 1969', title, copy: text })),
  challenges: [{ title: 'Finding a safe landing spot', problem: 'Hazards lay ahead during descent.', solution: 'Armstrong guided Eagle to a clearer landing area.' }],
  discoveries: [{ title: 'An instrument left for science', detail: 'Buzz Aldrin deployed a laser retroreflector that observatories can use to measure the Earth–Moon distance.' }],
  legacy: eagleChapters[3].map(({ title, text }) => ({ year: '1969', title, copy: text })),
  quiz: [
    { question: 'What was the name of the Apollo 11 Lunar Module?', options: ['Eagle', 'Columbia', 'Apollo', 'Saturn'], answer: 0, explanation: 'Eagle was the lunar module and Columbia was the command module.' },
    { question: 'On which date did Eagle land on the Moon?', options: ['July 16, 1969', 'July 20, 1969', 'July 21, 1969', 'July 24, 1969'], answer: 1, explanation: 'Eagle touched down on July 20, 1969.' },
    { question: 'What happened to Eagle after its astronauts returned to Columbia?', options: ['Both stages returned to Earth.', 'Both stages stayed together on the Moon.', 'The entire Lunar Module was brought back to Earth.', 'The lower stage stayed on the Moon, while the upper stage was left in lunar orbit.'], answer: 3, explanation: 'The descent stage remains at Tranquility Base. The ascent stage was jettisoned in lunar orbit.' },
  ],
  reward: 'Tranquility Base Explorer',
}
