import type { MachineStory } from '../../machineStories'
import type { Apollo17MediaId } from './apollo17StoryMedia'

export type Apollo17StoryStep = { id: string; title: string; text: string; detail?: string; date?: string; media?: Apollo17MediaId }

/** Adapt existing mission facts; no scientific or progress records are duplicated. */
export function getApollo17StorySteps(story: MachineStory, chapter: number): Apollo17StoryStep[] {
  if (story.id !== 'apollo-17-rover') return []
  if (chapter === 0) return [
    { id: 'introduction', title: 'Meet LRV-3', text: story.intro, media: 'vehicle' },
    ...story.profile.map((item, i) => ({ id: `profile-${i}`, title: item.label, text: item.value, media: 'vehicle' as const })),
  ]
  if (chapter === 1) return story.journey.map((item, i) => ({ id: `journey-${i}`, title: item.title, text: item.copy, date: item.date,
    media: i === 0 ? 'launch' : i >= 2 ? 'field' : undefined }))
  if (chapter === 2) return [
    ...story.challenges.map((item, i) => ({ id: `challenge-${i}`, title: item.title, text: item.problem, detail: item.solution, media: 'vehicle' as const })),
    ...story.discoveries.map((item, i) => ({ id: `discovery-${i}`, title: item.title, text: item.detail, media: i === 0 ? 'orange' as const : 'field' as const })),
  ]
  if (chapter === 3) return story.legacy.map((item, i) => ({ id: `legacy-${i}`, title: item.title, text: item.copy, date: item.year,
    media: i === 1 ? 'field' : i === 2 || i === 3 ? 'vehicle' : undefined }))
  return []
}
