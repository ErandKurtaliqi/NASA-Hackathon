import { ImageOverlay, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, Layers3, LocateFixed, Maximize2, Minus, Plus, RotateCcw, Wifi, WifiOff } from 'lucide-react'
import { getMapStory, getPlanetLocations, hasCoordinates, type ExactMissionLocation, type FinalMissionLocation } from '../features/explorer/storyMapLocations'
import { planetaryLayers } from '../planetaryConfig'
import { useProgress } from '../store'
import type { PlanetId } from '../types'
import styles from '../pages/ExplorerPage.module.css'

const planetaryCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1 / 180, 1, -1 / 180, 0.5),
  scale: (zoom: number) => 256 * 2 ** zoom,
  zoom: (scale: number) => Math.log(scale / 256) / Math.LN2,
  infinite: false,
  wrapLng: [-180, 180],
}) as L.CRS

const makeIcon = (marker: ExactMissionLocation) => L.divIcon({
  className: '',
  html: `<span class="map-pin ${marker.planet} mission-region"><i></i></span>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
})

function MapControls({ planet }: { planet: PlanetId }) {
  const map = useMap()
  return <div className="map-controls">
    <button aria-label="Zoom in" onClick={() => map.zoomIn()}><Plus size={17}/></button>
    <button aria-label="Zoom out" onClick={() => map.zoomOut()}><Minus size={17}/></button>
    <button aria-label="Reset global map" onClick={() => map.flyTo([0, 0], 1, { duration: 1.1 })}><RotateCcw size={16}/></button>
    <button aria-label="Center map" onClick={() => map.flyTo([0, 0], 2, { duration: 1.1 })}><LocateFixed size={16}/></button>
    <button aria-label="Toggle fullscreen" onClick={() => document.querySelector(`.map-shell.${planet}`)?.requestFullscreen?.()}><Maximize2 size={16}/></button>
  </div>
}

function FocusLocation({ location, maxZoom, request }: { location?: FinalMissionLocation; maxZoom: number; request?: number }) {
  const map = useMap()
  const reducedMotion = useReducedMotion()
  useEffect(() => {
    if (!location) return
    if (hasCoordinates(location)) {
      const { latitude, longitude } = location.coordinates
      map.flyTo([latitude, longitude], Math.min(6, maxZoom), { animate: !reducedMotion, duration: 1.35, easeLinearity: 0.22 })
    } else {
      // Explicit global context, never a surrogate point for a missing position.
      map.fitBounds([[-90, -180], [90, 180]], { animate: false })
    }
  }, [map, location, maxZoom, request, reducedMotion])
  return null
}

export default function PlanetMap({ planet, focusId, focusRequest }: { planet: PlanetId; focusId?: string; focusRequest?: number }) {
  const explore = useProgress(s => s.exploreLocation)
  const navigate = useNavigate()
  const config = planetaryLayers[planet]
  const locations = getPlanetLocations(planet)
  const points = locations.filter(hasCoordinates)
  const focused = locations.find(m => m.id === focusId)
  const [tileState, setTileState] = useState<'loading' | 'live' | 'fallback'>('loading')
  const tileFailed = useRef(false)
  const icons = useMemo(() => new Map(points.map(point => [point.id, makeIcon(point)])), [points])

  return <div className={`map-shell ${planet}`}>
    {focused && <div className={styles.mapFocusNotice} role="status" aria-live="polite" aria-atomic="true" data-mission-location={focused.id}>
      <b>{focused.name}</b><span>{focused.location}</span>
      <small>{focused.coordinates?.display ?? 'Official location only · Global Mars view · No exact final-position pin for this mission'}</small>
    </div>}
    <MapContainer
      crs={planetaryCRS}
      center={[0, 0]}
      zoom={1}
      minZoom={0}
      maxZoom={config.maxZoom}
      zoomControl={false}
      maxBounds={[[-90, -180], [90, 180]]}
      maxBoundsViscosity={0.85}
      attributionControl={false}
      preferCanvas
    >
      <ImageOverlay url={config.fallbackWest} bounds={[[-90, -180], [90, 0]]}/>
      <ImageOverlay url={config.fallbackEast} bounds={[[-90, 0], [90, 180]]}/>
      <TileLayer
        url={config.tileUrl}
        bounds={[[-90, -180], [90, 180]]}
        minZoom={0}
        maxZoom={config.maxZoom}
        tileSize={256}
        noWrap
        keepBuffer={3}
        updateWhenZooming={false}
        updateWhenIdle
        eventHandlers={{
          loading: () => { tileFailed.current = false; setTileState('loading') },
          load: () => setTileState(tileFailed.current ? 'fallback' : 'live'),
          tileerror: () => { tileFailed.current = true; setTileState('fallback') },
        }}
      />
      {points.map(marker => {
        const story = getMapStory(marker)
        const activate = () => {
          explore(marker.id)
          if (story) navigate(`/story/${story.id}/1`)
        }
        const label = story ? `Start ${story.name}: Meet Me` : marker.name
        return <Marker
          key={marker.id}
          position={[marker.coordinates.latitude, marker.coordinates.longitude]}
          icon={icons.get(marker.id)!}
          title={label}
          alt={label}
          zIndexOffset={story ? 1000 : 0}
          eventHandlers={{
            click: activate,
            keydown: (event: L.LeafletKeyboardEvent) => {
              if (!story || !['Enter', ' '].includes(event.originalEvent.key)) return
              event.originalEvent.preventDefault()
              activate()
            },
          }}
        >
          {!story && <Popup>
            <span className="popup-kicker">{marker.kind}</span>
            <h3>{marker.name}</h3>
            <strong>{marker.location}</strong>
            <div className="popup-coordinates">{marker.coordinates.display}</div>
            <a href={marker.source.url} target="_blank" rel="noreferrer">{marker.source.label} ↗</a>
          </Popup>}
        </Marker>
      })}
      <FocusLocation location={focused} maxZoom={config.maxZoom} request={focusRequest}/>
      <MapControls planet={planet}/>
    </MapContainer>

    <div className="map-data-panel">
      <div className="map-data-heading"><Layers3/><span><b>{config.shortTitle}</b><small>NASA TREK WMTS</small></span></div>
      <dl><div><dt>PROJECTION</dt><dd>{config.projection}</dd></div><div><dt>TILE MATRIX</dt><dd>{config.matrixSet} · Z0–{config.maxZoom}</dd></div></dl>
      <a href={config.capabilitiesUrl} target="_blank" rel="noreferrer">GETCAPABILITIES <ExternalLink/></a>
    </div>
    <div className={`map-service-state ${tileState}`}>
      {tileState === 'fallback' ? <WifiOff/> : <Wifi/>}
      <span><b>{tileState === 'live' ? 'LIVE NASA IMAGERY' : tileState === 'loading' ? 'LOADING NASA TILES' : 'NASA FALLBACK MOSAIC'}</b><small>{config.title}</small></span>
    </div>
  </div>
}
