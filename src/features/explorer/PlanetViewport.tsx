import { Component, lazy, Suspense, useEffect, useState, type ReactNode, type RefObject } from 'react'
import { Globe2, Map as MapIcon, Maximize2, Orbit } from 'lucide-react'
import type { PlanetId } from '../../types'
import styles from '../../pages/ExplorerPage.module.css'
import mapStyles from './ScientificMap.module.css'

const PlanetScene = lazy(() => import('../PlanetScene'))
const PlanetMap = lazy(() => import('../PlanetMap'))
const EsriMarsView = lazy(() => import('../EsriMarsView'))
export type ExplorerView = 'globe' | 'map' | 'esri'

class ViewBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function LoadingView({ map = false }: { map?: boolean }) {
  return <div className={styles.loadingView} role="status"><Orbit aria-hidden="true" /><span>{map ? 'Preparing the scientific map…' : 'Preparing your planetary view…'}</span></div>
}

export default function PlanetViewport({ planet, mode, onModeChange, focusId, viewportRef }: {
  planet: PlanetId
  mode: ExplorerView
  onModeChange: (mode: ExplorerView) => void
  focusId?: string
  viewportRef: RefObject<HTMLDivElement>
}) {
  const [webgl, setWebgl] = useState<boolean | null>(null)
  const [touchActive, setTouchActive] = useState(false)
  const [visible, setVisible] = useState(true)
  const [documentVisible, setDocumentVisible] = useState(true)
  const [fullscreenNotice, setFullscreenNotice] = useState('')
  const name = planet === 'mars' ? 'Mars' : 'the Moon'
  const [sceneReady, setSceneReady] = useState(false)
  const liveGlobe = !!webgl && visible && documentVisible

  useEffect(() => {
    try {
      const context = document.createElement('canvas').getContext('webgl2')
      setWebgl(Boolean(context))
      context?.getExtension('WEBGL_lose_context')?.loseContext()
    } catch { setWebgl(false) }
    const update = () => setDocumentVisible(!document.hidden)
    update()
    document.addEventListener('visibilitychange', update)
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '120px' })
    if (viewportRef.current) observer.observe(viewportRef.current)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update) }
  }, [viewportRef])

  useEffect(() => { setSceneReady(false) }, [planet, mode, liveGlobe])
  useEffect(() => { setTouchActive(false); setFullscreenNotice('') }, [planet, mode])

  const fullscreen = async () => {
    try {
      if (!viewportRef.current?.requestFullscreen) throw new Error('Fullscreen unavailable')
      await viewportRef.current.requestFullscreen()
    } catch { setFullscreenNotice('Fullscreen is unavailable here. You can continue exploring in this view.') }
  }

  const fallback = <div className={styles.viewError} role="status">
    <Globe2 size={26} aria-hidden="true" />
    <p>{mode === 'globe' ? 'The interactive globe is unavailable.' : 'The scientific map is unavailable.'}</p>
    {mode === 'globe' ? <button type="button" onClick={() => onModeChange('map')}>Explore the 2D map</button> : <a href="#scientific-locations">Explore scientific locations</a>}
  </div>

  return <div ref={viewportRef} className={`${styles.viewer} ${mode === 'map' ? styles.mapViewer : ''} ${touchActive ? styles.touchActive : ''}`} tabIndex={-1} role="region" aria-label={`${name} ${mode === 'esri' ? 'Esri 3D map' : mode === 'map' ? 'scientific map' : 'planetary view'}`}>
    <div className={styles.viewerToolbar}>
      <div className={styles.viewSwitch} role="group" aria-label="Planet view">
        <button type="button" aria-pressed={mode === 'globe'} onClick={() => onModeChange('globe')}><Globe2 size={15} aria-hidden="true" />3D globe</button>
        <button type="button" aria-pressed={mode === 'map'} onClick={() => onModeChange('map')}><MapIcon size={15} aria-hidden="true" />2D map</button>
        {planet === 'mars' && <button type="button" aria-pressed={mode === 'esri'} onClick={() => onModeChange('esri')}><Globe2 size={15} aria-hidden="true" />Esri 3D map</button>}
      </div>
      <button type="button" className={styles.fullscreenButton} onClick={fullscreen} aria-label="Enter fullscreen exploration"><Maximize2 size={17} aria-hidden="true" /></button>
    </div>
    <div className={styles.viewerContent}>
      {mode === 'esri' && planet === 'mars' ? <div className={`${styles.esriSurface} ${styles.touchSurface}`}><ViewBoundary key="esri" fallback={fallback}><Suspense fallback={<LoadingView map />}><EsriMarsView /></Suspense></ViewBoundary></div> : mode === 'globe' ? <div className={styles.globeSurface}>
        <div className={styles.globeHalo} aria-hidden="true" />
        <div className={`${styles.staticGlobe} ${planet === 'mars' ? styles.marsPoster : ''}`} aria-hidden={liveGlobe && sceneReady} style={{ opacity: liveGlobe && sceneReady ? 0 : 1 }} role="img" aria-label={`Static preview of ${name}`}>
          {planet === 'mars' ? <img src="/images/mars-nasa-poster.jpg" alt="" width="512" height="512" /> : <>
            <img src="/nasa-fallback/moon/west.jpg" width="256" height="256" alt="" />
            <img src="/nasa-fallback/moon/east.jpg" width="256" height="256" alt="" />
          </>}
        </div>
        {liveGlobe && <div className={`${styles.globeScene} ${styles.touchSurface}`}>
          <ViewBoundary key={planet} fallback={fallback}>
            <Suspense fallback={null}>
              {/* GIS boundary: only the existing public API is consumed. No pins or geographic focus are simulated. */}
              <PlanetScene planet={planet} onReady={() => setSceneReady(true)} />
            </Suspense>
          </ViewBoundary>
        </div>}
        {!liveGlobe && <div className={styles.previewNotice}>
          {webgl === null ? 'Preparing your view…' : 'Static preview · explore locations in the 2D map'}
        </div>}
      </div> : <div className={`${mapStyles.frame} ${touchActive ? mapStyles.interactive : ''}`}>
        <ViewBoundary key={planet} fallback={fallback}>
          <Suspense fallback={<LoadingView map />}>
            <PlanetMap planet={planet} focusId={focusId} />
          </Suspense>
        </ViewBoundary>
      </div>}
    </div>
    {(mode !== 'globe' || liveGlobe) && <div className={styles.touchInteraction}>
      <button type="button" aria-pressed={touchActive} onClick={() => setTouchActive(value => !value)}>{touchActive ? 'Done' : mode !== 'globe' ? 'Interact with map' : 'Rotate & zoom'}</button>
      <span>{touchActive ? mode !== 'globe' ? 'Drag to move. Pinch to zoom.' : 'Drag to rotate. Pinch to zoom.' : 'Scroll freely. Tap to interact.'}</span>
    </div>}
    <p className={styles.viewerHint}>{mode === 'esri' ? 'Esri Explore Mars · External 3D terrain and rover locations.' : mode === 'map' ? 'Pan, zoom, and select a location on the scientific map.' : liveGlobe ? 'Drag to orbit · Scroll to zoom' : 'Scientific locations and their sources are available below.'}</p>
    {fullscreenNotice && <p className={styles.fullscreenNotice} role="status">{fullscreenNotice}</p>}
  </div>
}
