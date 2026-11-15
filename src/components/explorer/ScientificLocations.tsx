import { ArrowUpRight, ExternalLink, MapPin, Map as MapIcon } from 'lucide-react'
import { getPlanetLocations, getSelectedLocation } from '../../features/explorer/storyMapLocations'
import type { PlanetId } from '../../types'
import styles from '../../pages/ExplorerPage.module.css'

export default function ScientificLocations({ planet, selectedId, onSelect, onViewMap }: {
  planet: PlanetId
  selectedId: string
  onSelect: (id: string) => void
  onViewMap: (id: string) => void
}) {
  const locations = getPlanetLocations(planet)
  const selected = getSelectedLocation(planet, selectedId)
  return <section className={styles.scienceSection} id="scientific-locations" tabIndex={-1} aria-labelledby="science-title">
    <div className={styles.scienceHeading}>
      <div><span className={styles.eyebrow}>Every place has a story</span><h2 id="science-title">Final Mission Locations</h2></div>
      <p>Discover where these machines and experiments remain. Where final coordinates were not supplied, only the official location is shown.</p>
    </div>
    <div className={styles.atlasLayout}>
      <div className={styles.locationList}>
        <h3>{planet === 'mars' ? 'Mars' : 'Moon'} missions <span>{locations.length}</span></h3>
        <ul>{locations.map(location => <li key={location.id}>
          <button type="button" aria-pressed={location.id === selected.id} aria-controls="location-information" onClick={() => onSelect(location.id)}>
            <MapPin size={17} aria-hidden="true" /><span><b>{location.name}</b><small>{location.location}</small></span>
          </button>
        </li>)}</ul>
      </div>
      <article className={styles.locationDetails} id="location-information" aria-labelledby="location-title">
        <div role="status" aria-live="polite" aria-atomic="true">
          <span className={styles.eyebrow}>{selected.kind}</span>
          <h3 id="location-title">{selected.name}</h3>
          <dl className={styles.coordinates}>
            <div><dt>Final mission location</dt><dd>{selected.location}</dd></div>
            <div><dt>Coordinates</dt><dd>{selected.coordinates?.display ?? 'Not provided'}</dd></div>
          </dl>
          {!selected.coordinates && <p className={styles.locationNote}>Official location only. The map opens a global Mars view without an exact final-position pin for this mission.</p>}
        </div>
        <div className={styles.locationActions}>
          <button type="button" className={styles.outlineButton} onClick={() => onViewMap(selected.id)}><MapIcon size={16} aria-hidden="true" />View on 2D map<ArrowUpRight size={16} aria-hidden="true" /></button>
          <a href={selected.source.url} target="_blank" rel="noreferrer" className={styles.sourceLink}>{selected.source.label}<ExternalLink size={13} aria-hidden="true" /></a>
        </div>
      </article>
    </div>
  </section>
}
