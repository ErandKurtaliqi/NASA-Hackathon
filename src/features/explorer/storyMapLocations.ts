import { markers } from '../../data'
import type { MissionMarker } from '../../types'
import { storyCatalog } from '../storytelling/storyCatalog'

export function getMapStory(marker: MissionMarker) {
  const id = marker.id === 'apollo-11' ? 'apollo-11-reflector' : marker.id
  const story = storyCatalog[id]
  return story?.planet === marker.planet ? story : undefined
}

export const storyMapLocations: MissionMarker[] = [
  ...markers,
  { id: 'opportunity', planet: 'mars', name: 'Opportunity · Landing Site', subtitle: 'Eagle Crater', latitude: -1.9483, longitude: -5.52583, precision: 'exact', category: 'landing-site', description: 'Opportunity began its traverse in Eagle Crater and later reached Perseverance Valley.', source: { label: 'NASA — Opportunity', url: 'https://science.nasa.gov/mission/mer-opportunity/' } },
  { id: 'sojourner', planet: 'mars', name: 'Sojourner · Pathfinder Landing Site', subtitle: 'Ares Vallis', latitude: 19.17, longitude: -33.21, precision: 'feature-center', category: 'landing-site', description: 'This marker identifies the Pathfinder landing site from which Sojourner explored.', source: { label: 'NASA — Mars Pathfinder Landing Site', url: 'https://science.nasa.gov/resource/mars-pathfinder-landing-site/' } },
  { id: 'viking-1', planet: 'mars', name: 'Viking 1 · Landing Site', subtitle: 'Chryse Planitia', latitude: 22.483, longitude: -47.968, precision: 'exact', category: 'landing-site', description: 'Viking 1 carried out its surface experiments here.', source: { label: 'NASA — Revised Viking 1 location', url: 'https://ntrs.nasa.gov/citations/19810041868' } },
  { id: 'ingenuity', planet: 'mars', name: 'Ingenuity · Final Flight Area', subtitle: 'Valinor Hills, Jezero Crater', latitude: 18.50, longitude: 77.32, precision: 'region', category: 'mission-region', description: 'Approximate area of the final flight. NASA photographed the helicopter at Valinor Hills.', source: { label: 'NASA — Ingenuity at Valinor Hills', url: 'https://science.nasa.gov/resource/ingenuity-at-valinor-hills/' } },
]
