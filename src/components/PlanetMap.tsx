import { ImageOverlay, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, Layers3, LocateFixed, Maximize2, Minus, Plus, RotateCcw, Wifi, WifiOff } from 'lucide-react'
import { getMapStory, storyMapLocations } from '../features/explorer/storyMapLocations'
import { planetaryLayers } from '../planetaryConfig'
import { useProgress } from '../store'
import type { MissionMarker, PlanetId } from '../types'

const planetaryCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1 / 180, 1, -1 / 180, 0.5),
  scale: (zoom: number) => 256 * 2 ** zoom,
  zoom: (scale: number) => Math.log(scale / 256) / Math.LN2,
  infinite: false,
  wrapLng: [-180, 180],
}) as L.CRS

const makeIcon = (marker: MissionMarker) => L.divIcon({
  className: '',
  html: `<span class="map-pin ${marker.planet} ${marker.category}"><i></i></span>`,
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

function FocusLocation({ marker, maxZoom }: { marker?: MissionMarker; maxZoom: number }) {
  const map = useMap()
  useEffect(() => {
    if (!marker) return
    const zoom = marker.precision === 'exact' ? Math.min(6, maxZoom) : Math.min(4, maxZoom)
    map.flyTo([marker.latitude, marker.longitude], zoom, { duration: 1.35, easeLinearity: 0.22 })
  }, [map, marker, maxZoom])
  return null
}

const formatCoordinate = (value: number, axis: 'lat' | 'lon') => {
  const suffix = axis === 'lat' ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W')
  return `${Math.abs(value).toFixed(5)}°${suffix}`
}

export default function PlanetMap({ planet, focusId }: { planet: PlanetId; focusId?: string }) {
  const explore = useProgress(s => s.exploreLocation)
  const navigate = useNavigate()
  const config = planetaryLayers[planet]
  const points = storyMapLocations.filter(m => m.planet === planet)
  const focused = points.find(m => m.id === focusId)
  const [tileState, setTileState] = useState<'loading' | 'live' | 'fallback'>('loading')
  const icons = useMemo(() => new Map(points.map(point => [point.id, makeIcon(point)])), [points])

  return <div className={`map-shell ${planet}`}>
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
          loading: () => setTileState('loading'),
          load: () => setTileState('live'),
          tileerror: () => setTileState('fallback'),
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
          position={[marker.latitude, marker.longitude]}
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
            <span className="popup-kicker">{marker.category.replace('-', ' ')}</span>
            <h3>{marker.name}</h3>
            <strong>{marker.subtitle}</strong>
            <div className="popup-coordinates">{formatCoordinate(marker.latitude, 'lat')} · {formatCoordinate(marker.longitude, 'lon')}</div>
            <p>{marker.description}</p>
            <a href={marker.source.url} target="_blank" rel="noreferrer">{marker.source.label} ↗</a>
          </Popup>}
        </Marker>
      })}
      <FocusLocation marker={focused} maxZoom={config.maxZoom}/>
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
