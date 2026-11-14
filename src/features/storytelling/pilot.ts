import { chapterMeta, type MachineStory } from '../../machineStories'
import { storyCatalog } from './storyCatalog'

export type PilotChapter = 'meet' | 'journey'
export type StoryStep = {
  id: string
  label: string
  title: string
  copy: string
  narration: string
  facts: MachineStory['profile']
  landing?: boolean
}

/** Validate before any chapter array access, including prototype-like story IDs. */
export function resolveStoryRoute(storyId: string, chapter: string) {
  if (!Object.prototype.hasOwnProperty.call(storyCatalog, storyId) || !/^[1-9]\d*$/.test(chapter)) return null
  const number = Number(chapter)
  if (!Number.isSafeInteger(number) || number > chapterMeta.length) return null
  return { story: storyCatalog[storyId], index: number - 1 }
}

export function isPilotChapter(storyId: string, index: number) {
  return storyId === 'follow-perseverance' && (index === 0 || index === 1)
}

export function getPilotSteps(story: MachineStory, chapter: PilotChapter): StoryStep[] {
  if (chapter === 'journey') return story.journey.map(event => ({
    id: event.label.toLowerCase(), label: event.date, title: event.title, copy: event.copy,
    narration: `${event.title}. ${event.copy}`, facts: [], landing: event.label === 'LANDING',
  }))
  const groups = [
    { id: 'hello', label: 'MEET YOUR GUIDE', title: 'Meet Perseverance', copy: story.intro, facts: [] },
    { id: 'built', label: 'MY ORIGINS', title: 'Built for exploration', copy: '', facts: story.profile.slice(0, 3) },
    { id: 'mission', label: 'MY MISSION', title: 'My home and purpose', copy: '', facts: story.profile.slice(3, 5) },
    { id: 'power', label: 'MY ENGINEERING', title: 'Power for discovery', copy: '', facts: story.profile.slice(5) },
  ]
  return groups.map(step => ({ ...step, narration: [step.title, step.copy, ...step.facts.map(fact => `${fact.label}: ${fact.value}.`)].filter(Boolean).join(' ') }))
}

export type StepBounds = { top: number; bottom: number }

/** Pick a visible card nearest the reading line; never advance from an offscreen story. */
export function findReadingStep(bounds: StepBounds[], viewportHeight: number): number | null {
  const line = viewportHeight * .45
  let selected: number | null = null
  let distance = Infinity
  bounds.forEach((rect, index) => {
    if (rect.bottom <= 0 || rect.top >= viewportHeight) return
    const next = line < rect.top ? rect.top - line : line > rect.bottom ? line - rect.bottom : 0
    if (next < distance) { selected = index; distance = next }
  })
  return selected
}
