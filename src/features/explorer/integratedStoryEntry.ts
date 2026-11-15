import { machineStories } from '../../machineStories'
import { missionHardware } from '../storytelling/storyCatalog'
import { getStoryEntry } from './storyEntry'
import type { HardwareProfile } from '../../types'
import type { MachineProgress } from '../../store'

const moonRoster = ['lunar-module', 'apollo-11-lrrr', 'lrv-1', 'lrv-2', 'lrv']
const marsRoster = ['ingenuity', 'sojourner', 'opportunity', 'viking-1']

export const explorerHardware = [
  ...moonRoster.flatMap(id => missionHardware.filter(item => item.planet === 'moon' && item.id === id))
    .map(item => item.id === 'lrv' ? { ...item, name: 'Apollo 17 Lunar Roving Vehicle' } : item),
  ...marsRoster.flatMap(id => missionHardware.filter(item => item.planet === 'mars' && item.id === id)),
]
export function getExplorerStoryEntry(machine: HardwareProfile, progress?: MachineProgress) {
  if (machine.id !== 'perseverance' || machine.planet !== 'mars') return getStoryEntry(machine, progress)
  const saved = progress?.lastChapter
  const chapter = Number.isInteger(saved) ? Math.min(5, Math.max(1, saved!)) : 1
  return { story: machineStories['follow-perseverance'], href: `/story/follow-perseverance/${chapter}`, label: progress?.completed.length ? 'Continue story' : 'Start story' }
}
