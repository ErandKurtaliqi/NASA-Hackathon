import { apollo15StoryMedia } from './apollo15StoryMedia'
import { apollo17StoryMedia } from './apollo17StoryMedia'
import { apollo11StoryMedia } from './apollo11StoryMedia'
import { eaglePortrait } from './apollo11Eagle'
import { apollo16StoryMedia } from './apollo16StoryMedia'
import { marsHeroMedia, marsStoryMedia } from './marsStoryMedia'
import type { StoryEvidenceMedia } from '../../components/storytelling/StoryMedia'

export type StoryWorld = 'moon' | 'mars'
export type StoryHardwareKind = 'lunar-rover' | 'stationary-experiment' | 'rover' | 'lander' | 'helicopter'
export type StoryPresentation = {
  world: StoryWorld; hardware: StoryHardwareKind; subtitle: string; hardwareLabel: string
  portrait: StoryEvidenceMedia; portraitStyle: 'rover' | 'crew' | 'reflector' | 'lander' | 'helicopter'
  cutout?: 'apollo15-photo'
  portraitNote?: string
  portraitCrop?: { x: number; y: number; width: number; height: number; alt: string }
}

/** Visual configuration only. No mission registration, script, timing or GIS data. */
export const moonStoryPresentation = {
  'apollo-11-eagle': { world: 'moon', hardware: 'lander', subtitle: 'Eagle descent stage',
    hardwareLabel: 'LM-5 · Tranquility Base', portrait: eaglePortrait, portraitStyle: 'lander' },
  'apollo-15-rover': { world: 'moon', hardware: 'lunar-rover', subtitle: 'LRV · Lunar Roving Vehicle',
    hardwareLabel: 'LRV-1 · First Apollo lunar rover', portrait: apollo15StoryMedia.rover, portraitStyle: 'rover', cutout: 'apollo15-photo' },
  'apollo-17-rover': { world: 'moon', hardware: 'lunar-rover', subtitle: 'LRV-3 · Taurus-Littrow',
    hardwareLabel: 'LRV-3 · With Harrison Schmitt', portrait: apollo17StoryMedia.vehicle, portraitStyle: 'crew' },
  'apollo-11-reflector': { world: 'moon', hardware: 'stationary-experiment', subtitle: 'Laser Ranging Retroreflector',
    hardwareLabel: 'Passive reflector · No electrical power', portrait: apollo11StoryMedia.array, portraitStyle: 'reflector' },
  'apollo-16-rover': { world: 'moon', hardware: 'lunar-rover', subtitle: 'LRV-2 · Descartes Highlands',
    hardwareLabel: 'LRV-2 · Apollo 16', portrait: apollo16StoryMedia.rover, portraitStyle: 'rover', portraitCrop: { x: 5, y: 190, width: 360, height: 265, alt: 'Photographic detail of LRV-2 on the lunar surface, cropped from NASA AS16-116-18578.' } },
} as const satisfies Record<string, StoryPresentation>

export const marsStoryPresentation = {
  ingenuity: { world: 'mars', hardware: 'helicopter', subtitle: 'Mars helicopter · Technology demonstration', hardwareLabel: 'Ingenuity · First powered flight on another world', portrait: marsStoryMedia[marsHeroMedia.ingenuity], portraitStyle: 'helicopter', portraitCrop: { x: 300, y: 290, width: 600, height: 350, alt: 'Photographic detail of Ingenuity with both rotors and four landing legs visible on Mars, from NASA PIA24581.' }, portraitNote: 'Helicopter photographed on Mars' },
  sojourner: { world: 'mars', hardware: 'rover', subtitle: 'Mars Pathfinder · Sojourner', hardwareLabel: 'Sojourner · Mars Pathfinder', portrait: marsStoryMedia[marsHeroMedia.sojourner], portraitStyle: 'rover', portraitCrop: { x: 80, y: 70, width: 650, height: 550, alt: 'Photographic detail of Sojourner, its antenna and the rock Yogi on Mars, from NASA PIA00766.' } },
  opportunity: { world: 'mars', hardware: 'rover', subtitle: 'Mars Exploration Rover B', hardwareLabel: 'Opportunity · Rover 2', portrait: marsStoryMedia[marsHeroMedia.opportunity], portraitStyle: 'rover', portraitNote: 'Assembly photograph on Earth' },
  'viking-1': { world: 'mars', hardware: 'lander', subtitle: 'Stationary Mars science lander', hardwareLabel: 'Viking 1 · No wheels', portrait: marsStoryMedia[marsHeroMedia['viking-1']], portraitStyle: 'lander', portraitNote: 'Mission illustration' },
} as const satisfies Record<string, StoryPresentation>

export const shortChapterLabels = ['Meet Me', 'Journey', 'Discoveries', 'Legacy', 'Quiz'] as const

/** Shared lander contract; the Mars adapter now supplies the reviewed portrait.
 * Mission registration, private packages and geographic data remain outside this configuration. */
export const viking1PresentationContract = {
  world: 'mars', hardware: 'lander', hardwareLabel: 'Viking 1 lander',
} as const satisfies Pick<StoryPresentation, 'world' | 'hardware' | 'hardwareLabel'>
