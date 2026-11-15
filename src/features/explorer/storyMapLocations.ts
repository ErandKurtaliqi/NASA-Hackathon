import type { PlanetId, SourceRef } from '../../types'
import { storyCatalog } from '../storytelling/storyCatalog'

type LocationRecord = {
  id: string
  planet: PlanetId
  name: string
  location: string
  kind: 'Stationary reflector' | 'Lunar rover' | 'Rover' | 'Lander' | 'Helicopter'
  source: SourceRef
}

/** Approved final-location data, not legacy landing sites or inferred positions. */
export type FinalMissionLocation = LocationRecord & (
  | { precision: 'provided'; coordinates: { latitude: number; longitude: number; display: string } }
  | { precision: 'location-only'; coordinates?: never }
)
export type ExactMissionLocation = FinalMissionLocation & { precision: 'provided' }

// Place names and coordinate strings are verbatim from Haroon's final inventory.
// Mission references provide context, not certification of every supplied decimal.
// Never replace missing values with a landing site or approximate region center.
export const storyMapLocations: readonly FinalMissionLocation[] = [
  { id: 'apollo-11-eagle', planet: 'moon', name: 'Apollo 11 Eagle Descent Stage', kind: 'Lander',
    location: 'Tranquility Base, Mare Tranquillitatis', precision: 'provided',
    coordinates: { latitude: 0.67408, longitude: 23.47297, display: '0.67408° N, 23.47297° E' },
    source: { label: 'NASA — Apollo artifacts and coordinates', url: 'https://www.nasa.gov/wp-content/uploads/2023/12/nasa-usg-lunar-historic-sites-reva.pdf' } },
  { id: 'apollo-11', planet: 'moon', name: 'Apollo 11 LRRR', kind: 'Stationary reflector',
    location: 'Mare Tranquillitatis, Sea of Tranquillity', precision: 'provided',
    coordinates: { latitude: 0.67345, longitude: 23.47307, display: '0.67345° N, 23.47307° E' },
    source: { label: 'NASA — Apollo 11', url: 'https://www.nasa.gov/mission/apollo-11/' } },
  { id: 'apollo-15-rover', planet: 'moon', name: 'Apollo 15 LRV', kind: 'Lunar rover',
    location: 'Hadley-Apennine Region, Hadley Rille', precision: 'provided',
    coordinates: { latitude: 26.13110, longitude: 3.63972, display: '26.13110° N, 3.63972° E' },
    source: { label: 'NASA — Apollo 15', url: 'https://www.nasa.gov/mission/apollo-15/' } },
  { id: 'apollo-16-rover', planet: 'moon', name: 'Apollo 16 LRV', kind: 'Lunar rover',
    location: 'Descartes Highlands, near Orion Lunar Module', precision: 'provided',
    coordinates: { latitude: -8.97292, longitude: 15.50279, display: '8.97292° S, 15.50279° E' },
    source: { label: 'NASA — Apollo 16', url: 'https://www.nasa.gov/mission/apollo-16/' } },
  { id: 'apollo-17-rover', planet: 'moon', name: 'Apollo 17 LRV', kind: 'Lunar rover',
    location: 'Taurus-Littrow Valley, near Challenger Lunar Module', precision: 'provided',
    coordinates: { latitude: 20.19043, longitude: 30.77726, display: '20.19043° N, 30.77726° E' },
    source: { label: 'NASA — Apollo 17', url: 'https://www.nasa.gov/mission/apollo-17/' } },
  { id: 'opportunity', planet: 'mars', name: 'Opportunity Rover', kind: 'Rover',
    location: 'Perseverance Valley, Endeavour Crater', precision: 'location-only',
    source: { label: 'NASA — Opportunity', url: 'https://science.nasa.gov/mission/mer-opportunity/' } },
  { id: 'sojourner', planet: 'mars', name: 'Sojourner Rover', kind: 'Rover',
    location: 'Ares Vallis, Mars Pathfinder Landing Site', precision: 'location-only',
    source: { label: 'NASA — Mars Pathfinder', url: 'https://science.nasa.gov/mission/mars-pathfinder/' } },
  { id: 'viking-1', planet: 'mars', name: 'Viking 1 Lander', kind: 'Lander',
    location: 'Chryse Planitia', precision: 'provided',
    coordinates: { latitude: 22.483, longitude: -47.968, display: '22.483° N, 47.968° W' },
    source: { label: 'NASA NTRS — Revised Viking 1 location', url: 'https://ntrs.nasa.gov/citations/19810041868' } },
  { id: 'ingenuity', planet: 'mars', name: 'Ingenuity Helicopter', kind: 'Helicopter',
    location: 'Valinor Hills, Jezero Crater', precision: 'location-only',
    source: { label: 'NASA — Ingenuity at Valinor Hills', url: 'https://science.nasa.gov/resource/ingenuity-at-valinor-hills/' } },
]

export function hasCoordinates(location: FinalMissionLocation): location is ExactMissionLocation {
  return location.precision === 'provided'
}

export function getPlanetLocations(planet: PlanetId) {
  return storyMapLocations.filter(location => location.planet === planet)
}

export function getSelectedLocation(planet: PlanetId, id?: string) {
  const locations = getPlanetLocations(planet)
  return locations.find(location => location.id === id) ?? locations[0]
}

export function getMapStory(marker: { id: string; planet: PlanetId }) {
  const id = marker.id === 'apollo-11' ? 'apollo-11-reflector' : marker.id
  const story = storyCatalog[id]
  return story?.planet === marker.planet ? story : undefined
}
