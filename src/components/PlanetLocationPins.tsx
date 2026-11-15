import { useRef } from 'react'
import { Html } from '@react-three/drei'
import { MapPin } from 'lucide-react'
import type { ExactMissionLocation } from '../features/explorer/storyMapLocations'
import styles from './PlanetLocationPins.module.css'

function surfacePosition(latitude: number, longitude: number): [number, number, number] {
  // Match SphereGeometry UVs to the NASA Trek equirectangular mosaic.
  const lat = latitude * Math.PI / 180
  const lon = longitude * Math.PI / 180
  const radius = 2.025
  return [radius * Math.cos(lat) * Math.cos(lon), radius * Math.sin(lat), -radius * Math.cos(lat) * Math.sin(lon)]
}

function LocationPin({ location, selected, onSelect, shift }: {
  location: ExactMissionLocation
  selected: boolean
  onSelect: (id: string) => void
  shift: 'above' | 'below' | undefined
}) {
  const pin = useRef<HTMLButtonElement>(null)
  const label = location.id === 'apollo-11-eagle' ? 'Apollo 11 LM-5' : location.name
  return <Html position={surfacePosition(location.coordinates.latitude, location.coordinates.longitude)}
    center occlude zIndexRange={[5, 1]} onOcclude={hidden => {
      const button = pin.current
      if (button) {
        button.hidden = hidden
        if (hidden && document.activeElement === button) button.blur()
      }
    }}>
    <button ref={pin} className={styles.pin} data-shift={shift} type="button" aria-pressed={selected}
      title={location.location + ' · ' + location.coordinates.display}
      onPointerDown={event => event.stopPropagation()} onClick={() => onSelect(location.id)}>
      <MapPin size={16} aria-hidden="true" />
      <span>{label}</span>
    </button>
  </Html>
}

export default function PlanetLocationPins({ locations, selectedId, onSelect }: {
  locations: readonly ExactMissionLocation[]
  selectedId?: string
  onSelect: (id: string) => void
}) {
  return <>{locations.map(location => <LocationPin key={location.id} location={location}
    selected={selectedId === location.id} onSelect={onSelect}
    shift={location.id === 'apollo-11-eagle' ? 'above' : location.id === 'apollo-11' ? 'below' : undefined} />)}</>
}
