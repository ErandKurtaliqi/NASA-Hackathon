export type PlanetId = 'mars' | 'moon'

export interface SourceRef { label: string; url: string }
export interface Choice { label: string; correct?: boolean; feedback: string }
export interface StoryChapter {
  id: string
  number: number
  title: string
  kicker: string
  narrative: string
  narration: string
  fact: string
  source: SourceRef
  interaction: 'orbit' | 'landing' | 'hotspots' | 'clues' | 'sample' | 'reflection'
  instruction: string
  choices?: Choice[]
}
export interface Story { id: string; title: string; targetAge: string; planet: PlanetId; chapters: StoryChapter[] }
export interface MissionMarker {
  id: string
  planet: PlanetId
  name: string
  subtitle: string
  latitude: number
  longitude: number
  precision: 'exact' | 'feature-center' | 'region'
  category: 'landing-site' | 'mission-region' | 'geology'
  description: string
  source: SourceRef
  storyChapter?: number
}
export interface HardwareProfile { id: string; name: string; type: string; planet: PlanetId; missionDate: string; overview: string; purpose: string; instruments: string[]; source: SourceRef }
