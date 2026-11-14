import { cinematicMachineStories as machineStories, type MachineStory } from '../../machineStories'

export const narrativeChapters = [
  { id: 'meet', title: 'Meet Me', label: '01' },
  { id: 'journey', title: 'My Journey', label: '02' },
  { id: 'discoveries', title: 'My Discoveries', label: '03' },
  { id: 'challenge', title: 'My Challenges', label: '04' },
  { id: 'legacy', title: 'My Legacy', label: '05' },
] as const
export type NarrativeChapter = typeof narrativeChapters[number]['id']
export type CameraShot = { position: [number, number, number]; target: [number, number, number] }
export type RoverExperience = {
  story: MachineStory
  displayName: string
  place: string
  accent: string
  challenge: 'dust' | 'navigation'
  assetLabel: string
  photograph?: string
  shots: CameraShot[]
}

export function getRoverExperience(id: string): RoverExperience | undefined {
  if (!Object.prototype.hasOwnProperty.call(machineStories, id)) return undefined
  const story = machineStories[id]
  if (!story) return undefined
  const lunar = story.planet === 'moon'
  return {
    story,
    displayName: lunar ? story.shortName : story.name,
    place: lunar ? (id === 'apollo-15-rover' ? 'HADLEY–APENNINE · THE MOON' : 'TAURUS–LITTROW · THE MOON') : 'JEZERO CRATER · MARS',
    accent: lunar ? '#b9e4f4' : '#e8ac82',
    challenge: lunar ? 'dust' : 'navigation',
    assetLabel: lunar ? 'Illustrative LRV reconstruction · not a scanned flight vehicle' : 'Official NASA / JPL-Caltech 3D model',
    photograph: id === 'apollo-17-rover' ? '/images/apollo17-launch.jpg' : story.narration?.[1]?.[0]?.sources.find(source=>source.url.includes('wp-content'))?.url,
    shots: [
      { position: [6.2, 2.5, 7.4], target: [.1, -.15, 0] },
      { position: [7.5, 1.3, 5], target: [.5, -.1, 0] },
      { position: [4.5, 2.2, 4.3], target: [.5, .05, 0] },
      { position: [5.7, 3.3, 5.4], target: [.4, -.25, 0] },
      { position: [8, 2.4, 10], target: [.4, -.1, 0] },
    ],
  }
}

export function chapterTracks(story: MachineStory, chapter: NarrativeChapter) {
  if (!story.narration) return []
  if (chapter === 'discoveries') return story.narration[2].slice(2)
  if (chapter === 'challenge') return story.narration[2].slice(0, 2)
  return story.narration[chapter === 'meet' ? 0 : chapter === 'journey' ? 1 : 3] || []
}
