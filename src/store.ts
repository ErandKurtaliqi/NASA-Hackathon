import { create } from 'zustand'
import { persist, type PersistStorage } from 'zustand/middleware'

export type RoverJourney = { visited: string[]; challengeComplete: boolean; completedAt: string | null }
const roverChapterIds = ['meet','journey','discoveries','challenge','legacy']
const emptyJourney = (): RoverJourney => ({visited:[],challengeComplete:false,completedAt:null})

type ProgressState = {
  saveStoryQuiz: (storyId: string, result: QuizResult) => void
  roverJourneys: Record<string, RoverJourney>
  visitRoverChapter: (storyId: string, chapter: string) => void
  solveRoverChallenge: (storyId: string) => void
  finishRoverJourney: (storyId: string) => void
  completedChapters: string[]
  exploredLocations: string[]
  inspectedInstruments: string[]
  badges: string[]
  storyProgress: Record<string, MachineProgress>
  completeChapter: (id: string) => void
  exploreLocation: (id: string) => void
  inspectInstrument: (id: string) => void
  awardBadge: (id: string) => void
  completeStoryChapter: (storyId: string, chapterId: string, chapterNumber: number) => void
  reset: () => void
}

export type MachineProgress = {
  quizResult?: QuizResult
  completed: string[]
  lastChapter: number
  completedMission: boolean
}

export type QuizResult = { answers: number[]; score: number; total: number }

const add = (items: string[], id: string) => items.includes(id) ? items : [...items, id]

// Runtime-only save acknowledgement. Keep it outside the persisted progress
// object so the existing key, version and serialized schema stay unchanged.
export const useProgressPersistence = create<{
  status: 'saved' | 'saving' | 'error'
  reason: 'read' | 'write' | null
}>(() => ({ status: 'saved', reason: null }))

let unreadProgress = false
const progressStorage: PersistStorage<ProgressState> = {
  getItem: name => {
    try {
      const value = window.localStorage.getItem(name)
      const progress = value === null ? null : JSON.parse(value)
      unreadProgress = false
      useProgressPersistence.setState({ status: 'saved', reason: null })
      return progress
    } catch {
      // Never overwrite records we could not read (including invalid JSON).
      unreadProgress = true
      useProgressPersistence.setState({ status: 'error', reason: 'read' })
      return null
    }
  },
  setItem: (name, value) => {
    if (unreadProgress) return
    try {
      window.localStorage.setItem(name, JSON.stringify(value))
      useProgressPersistence.setState({ status: 'saved', reason: null })
    } catch {
      // Zustand has already updated memory. Preserve that session and let the
      // student retry the full current snapshot without repeating achievements.
      useProgressPersistence.setState({ status: 'error', reason: 'write' })
    }
  },
  removeItem: name => {
    try { window.localStorage.removeItem(name) }
    catch { useProgressPersistence.setState({ status: 'error', reason: 'write' }) }
  },
}

export const useProgress = create<ProgressState>()(persist((persistedSet) => {
  const set = (update: Partial<ProgressState> | ((state: ProgressState) => Partial<ProgressState>)) => {
    // Invalidate the acknowledgement before memory subscribers see new data.
    if (!unreadProgress) useProgressPersistence.setState({ status: 'saving', reason: null })
    persistedSet(update)
  }
  return {
  roverJourneys: {},
  saveStoryQuiz: (storyId, result) => set(s => {
    if (!Number.isInteger(result.total) || result.total < 1 || result.total > 50 || result.answers.length !== result.total ||
      !Number.isInteger(result.score) || result.score < 0 || result.score > result.total || !result.answers.every(n => Number.isInteger(n) && n >= 0)) return s
    const current = s.storyProgress[storyId] || { completed: [], lastChapter: 1, completedMission: false }
    return { storyProgress: { ...s.storyProgress, [storyId]: { ...current, quizResult: { ...result, answers: [...result.answers] } } } }
  }),
  completedChapters: [], exploredLocations: [], inspectedInstruments: [], badges: [], storyProgress: {},
  completeChapter: (id) => set((s) => ({ completedChapters: add(s.completedChapters, id) })),
  exploreLocation: (id) => set((s) => ({ exploredLocations: add(s.exploredLocations, id) })),
  inspectInstrument: (id) => set((s) => ({ inspectedInstruments: add(s.inspectedInstruments, id) })),
  awardBadge: (id) => set((s) => ({ badges: add(s.badges, id) })),
  completeStoryChapter: (storyId, chapterId, chapterNumber) => set((s) => {
    const current = s.storyProgress[storyId] || { completed: [], lastChapter: 1, completedMission: false }
    const completed = add(current.completed, chapterId)
    return {
      completedChapters: add(s.completedChapters, `${storyId}:${chapterId}`),
      storyProgress: {
        ...s.storyProgress,
        [storyId]: {
          ...current,
          completed,
          lastChapter: Math.min(5, chapterNumber + 1),
          completedMission: completed.length >= 5,
        },
      },
    }
  }),
  visitRoverChapter: (storyId,chapter) => set(s=>{
    if(!roverChapterIds.includes(chapter))return s
    const current=s.roverJourneys[storyId]||emptyJourney()
    if(current.visited.includes(chapter))return s
    return {roverJourneys:{...s.roverJourneys,[storyId]:{...current,visited:add(current.visited,chapter)}}}
  }),
  solveRoverChallenge: storyId => set(s=>{
    const current=s.roverJourneys[storyId]||emptyJourney()
    if(current.challengeComplete)return s
    return {roverJourneys:{...s.roverJourneys,[storyId]:{...current,challengeComplete:true}}}
  }),
  finishRoverJourney: storyId => set(s=>{
    const current=s.roverJourneys[storyId]
    if(!current||current.completedAt||!current.challengeComplete||!roverChapterIds.every(id=>current.visited.includes(id)))return s
    // The documentary covers the four original reading chapters. The quiz remains separate.
    const previous=s.storyProgress[storyId]||{completed:[],lastChapter:1,completedMission:false}
    const completed=Array.from(new Set([...previous.completed,'meet','journey','challenges','legacy']))
    return {roverJourneys:{...s.roverJourneys,[storyId]:{...current,completedAt:new Date().toISOString()}},badges:add(s.badges,`${storyId}-documentary`),storyProgress:{...s.storyProgress,[storyId]:{...previous,completed,lastChapter:5}},completedChapters:Array.from(new Set([...s.completedChapters,...['meet','journey','challenges','legacy'].map(id=>`${storyId}:${id}`)]))}
  }),
  reset: () => set({ roverJourneys: {}, completedChapters: [], exploredLocations: [], inspectedInstruments: [], badges: [], storyProgress: {} }),
  }
}, { name: 'beyond-earth-progress', storage: progressStorage }))

export function retryProgressSave() {
  // A failed initial read needs a reload, not a write of incomplete defaults.
  if (useProgressPersistence.getState().reason === 'read') return false
  if (useProgressPersistence.getState().status === 'error') {
    useProgressPersistence.setState({ status: 'saving', reason: null })
    useProgress.setState({})
  }
  return useProgressPersistence.getState().status === 'saved'
}
