import { chapterMeta } from '../../machineStories'
import { storyCatalog } from '../storytelling/storyCatalog'
import type { MachineProgress } from '../../store'
import type { HardwareProfile } from '../../types'

/** Resolve only published stories; never construct a story ID from a machine name. */
export function getStoryEntry(machine: HardwareProfile, progress?: MachineProgress) {
  const story = Object.values(storyCatalog).find(item => item.machineId === machine.id && item.planet === machine.planet)
  if (!story) return null
  const saved = progress?.lastChapter
  const chapter = typeof saved === 'number' && Number.isInteger(saved)
    ? Math.min(chapterMeta.length, Math.max(1, saved)) : 1
  return {
    story,
    href: `/story/${story.id}/${chapter}`,
    label: progress?.completed.length ? 'Continue story' : 'Start story',
  }
}
