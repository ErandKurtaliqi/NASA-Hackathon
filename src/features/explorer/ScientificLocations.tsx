import { ArrowUpRight, ExternalLink, MapPin, Map as MapIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { markers } from '../../data'
import { planetaryLayers } from '../../planetaryConfig'
import type { PlanetId } from '../../types'
import styles from '../../pages/ExplorerPage.module.css'

const coordinate = (value: number, axis: 'latitude' | 'longitude') => `${Math.abs(value).toFixed(4)}° ${axis === 'latitude' ? value >= 0 ? 'N' : 'S' : value >= 0 ? 'E' : 'W'}`

export default function ScientificLocations({ planet, selectedId, onSelect, onViewMap }: {
  planet: PlanetId
  selectedId: string
  onSelect: (id: string) => void
  onViewMap: (id: string) => void
}) {
  const locations = markers.filter(marker => marker.planet === planet)
  const selected = locations.find(location => location.id === selectedId) || locations[0]
  const layer = planetaryLayers[planet]
  return <section className={styles.scienceSection} id="scientific-locations" tabIndex={-1} aria-labelledby="science-title">
    <div className={styles.scienceHeading}>
      <div><span className={styles.eyebrow}>The scientific atlas</span><h2 id="science-title">Every place has a story.</h2></div>
      <p>Explore landing sites, craters, and landscapes. Follow the coordinates and discover the evidence behind each place.</p>
    </div>
    <div className={styles.atlasLayout}>
      <div className={styles.locationList}>
        <h3>{planet === 'mars' ? 'Mars' : 'Moon'} locations <span>{locations.length}</span></h3>
        <ul>{locations.map(location => <li key={location.id}>
          <button type="button" aria-pressed={location.id === selected.id} aria-controls="location-information" onClick={() => onSelect(location.id)}>
            <MapPin size={17} aria-hidden="true" /><span><b>{location.name}</b><small>{location.subtitle}</small></span>
          </button>
        </li>)}</ul>
      </div>
      <article className={styles.locationDetails} id="location-information" aria-labelledby="location-title">
        <span className={styles.eyebrow}>{selected.category.replace(/-/g, ' ')} · {selected.precision.replace(/-/g, ' ')}</span>
        <h3 id="location-title">{selected.name}</h3>
        <p>{selected.description}</p>
        <dl className={styles.coordinates}>
          <div><dt>Latitude</dt><dd>{coordinate(selected.latitude, 'latitude')}</dd></div>
          <div><dt>Longitude</dt><dd>{coordinate(selected.longitude, 'longitude')}</dd></div>
          <div><dt>Location precision</dt><dd>{selected.precision.replace(/-/g, ' ')}</dd></div>
        </dl>
        <div className={styles.locationActions}>
          <button type="button" className={styles.outlineButton} onClick={() => onViewMap(selected.id)}><MapIcon size={16} aria-hidden="true" />View on 2D map<ArrowUpRight size={16} aria-hidden="true" /></button>
          <a href={selected.source.url} target="_blank" rel="noreferrer" className={styles.sourceLink}>{selected.source.label}<ExternalLink size={13} aria-hidden="true" /></a>
        </div>
      </article>
    </div>
    <details className={styles.datasetDetails}>
      <summary>Imagery, projection & scientific sources</summary>
      <dl><div><dt>NASA dataset</dt><dd>{layer.title}</dd></div><div><dt>Projection</dt><dd>{layer.projection}</dd></div><div><dt>Tile matrix</dt><dd>{layer.matrixSet} · Zoom 0–{layer.maxZoom}</dd></div></dl>
      <p>Landing sites, feature centers, and regions describe different levels of location precision. A mission landing site does not indicate a rover’s current position.</p>
      <div><a href={layer.capabilitiesUrl} target="_blank" rel="noreferrer">Dataset capabilities <ExternalLink size={13} aria-hidden="true" /></a><a href={layer.metadataUrl} target="_blank" rel="noreferrer">NASA Trek catalog <ExternalLink size={13} aria-hidden="true" /></a><Link to="/sources">All scientific sources <ArrowUpRight size={13} aria-hidden="true" /></Link></div>
    </details>
  </section>
}
