import { hardware } from '../../data'
import { machineStories, type MachineStory } from '../../machineStories'
import { apollo11Hardware, apollo11Story } from './apollo11Story'
import { moonQuiz } from './moonRecordings'
import { eagleHardware, eagleStory } from './apollo11Eagle'
import { apollo16Story } from './apollo16Story'
import { marsMachineStories, marsStoryHardware } from './marsStories'
import type { HardwareProfile } from '../../types'

// Workstream F hardware registration, scoped away from protected GIS data.ts.
const apollo16Hardware: HardwareProfile = {
  id: 'lrv-2', name: 'Apollo 16 Lunar Roving Vehicle', type: 'Crewed lunar rover', planet: 'moon',
  missionDate: 'Launched Apr 16, 1972 - Landed Apr 21, 1972 UTC',
  overview: 'LRV-2 carried John Young and Charles Duke across the Descartes Highlands.',
  purpose: 'Carry astronauts, tools and lunar samples. Lunar Module: Orion. Command Module: Casper, piloted by Ken Mattingly.',
  instruments: ['Four wheel motors', 'Hand controller', 'Navigation system', 'Television camera', 'Silver-zinc batteries'],
  source: { label: 'NASA - Apollo 16', url: 'https://www.nasa.gov/mission/apollo-16/' },
}

// Historical records/assets and stored progress are retained. This explicit
// publication boundary controls discovery AND direct routes; it is not a migration.
export const storyCatalog: Record<string, MachineStory> = {
  'apollo-15-rover': machineStories['apollo-15-rover'],
  'apollo-17-rover': { ...machineStories['apollo-17-rover'], quiz: moonQuiz['17'], sources: [...machineStories['apollo-17-rover'].sources,
    { label: 'NASA: orange volcanic glass', url: 'https://science.nasa.gov/solar-system/moon/history-of-lunar-exploration/' },
  ] },
  'apollo-11-reflector': apollo11Story,
  'apollo-11-eagle': eagleStory,
  'apollo-16-rover': apollo16Story,
  ...marsMachineStories,
}
export const missionHardware = [apollo11Hardware, eagleHardware, ...hardware.filter(item => !['perseverance', 'lunar-module'].includes(item.id)), apollo16Hardware, ...marsStoryHardware]
