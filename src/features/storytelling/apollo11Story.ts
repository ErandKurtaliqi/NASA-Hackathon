import type { MachineStory } from '../../machineStories'
import type { HardwareProfile } from '../../types'
import { moonQuiz, moonRecordings } from './moonRecordings'

export const apollo11Sources = [
  { label: 'NASA/JPL: lunar laser ranging', url: 'https://www.jpl.nasa.gov/news/the-apollo-experiment-that-keeps-on-giving/' },
  { label: 'NASA ILRS: Apollo and Luna reflectors', url: 'https://ilrs.cddis.eosdis.nasa.gov/missions/satellite_missions/current_missions/ap11_general.html' },
  { label: 'NASA: Apollo 11', url: 'https://www.nasa.gov/mission/apollo-11/' },
  { label: 'Lick Observatory: first successful returns', url: 'https://news.ucsc.edu/2019/07/lunar-laser-ranging/' },
  { label: 'Murphy et al.: reflector degradation research', url: 'https://arxiv.org/abs/1003.0713' },
  { label: 'Smithsonian: Apollo reflector collection record', url: 'https://airandspace.si.edu/collection-objects/laser-ranging-retro-reflector-apollo/nasm_A19820510000' },
]
export const apollo11Hardware: HardwareProfile = {
  id: 'apollo-11-lrrr', name: 'Apollo 11 Laser Ranging Retroreflector', type: 'Stationary lunar experiment', planet: 'moon',
  missionDate: 'Apollo 11 · July 1969', overview: 'A passive array of 100 corner-cube reflectors at Tranquility Base.',
  purpose: 'Return light toward Earth observatories so scientists can measure the Earth-Moon range. No electrical power, wheels or motors.',
  instruments: ['100 fused-silica corner cubes', 'Passive optical reflection', 'Leveling and alignment frame'], source: apollo11Sources[0],
}
const scripts = moonRecordings['11']
export const apollo11Story: MachineStory = {
  id: 'apollo-11-reflector', machineId: apollo11Hardware.id, category: 'stationary-experiment',
  name: apollo11Hardware.name, shortName: 'Apollo 11 LRRR', planet: 'moon', missionLabel: 'Apollo 11', status: 'PASSIVE LUNAR EXPERIMENT',
  heroLine: 'A small reflector helps Earth measure its changing relationship with the Moon.', intro: scripts[0][0].readingText,
  profile: [{ label: 'TYPE', value: 'Stationary scientific experiment, not a rover' }, { label: 'POWER', value: 'None: passive optics' }, { label: 'ARRAY', value: '100 corner cubes' }, { label: 'HOME', value: 'Tranquility Base' }],
  sources: apollo11Sources,
  journey: scripts[1].map(s => ({ label: s.title, date: 'JULY 1969', title: s.title, copy: s.readingText })),
  challenges: [{ title: 'Detecting a faint return', problem: 'Very little of each laser pulse returns to Earth.', solution: 'Specialized observatories time and detect faint returning light.' }],
  discoveries: [{ title: 'A changing distance', detail: 'Long-term laser ranging measures the Moon’s gradual recession from Earth.' }],
  legacy: scripts[3].map(s => ({ year: 'LUNAR SCIENCE', title: s.title, copy: s.readingText })),
  quiz: moonQuiz['11'], reward: 'Lunar Laser Investigator',
}
