import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode, type RefObject } from 'react'
import { ExternalLink, Globe2, Map as MapIcon, Maximize2, Orbit } from 'lucide-react'
import { sources } from '../../data'
import type { PlanetId } from '../../types'
import styles from '../../pages/ExplorerPage.module.css'
import mapStyles from './ScientificMap.module.css'

const PlanetScene = lazy(() => import('../PlanetScene'))
const PlanetMap = lazy(() => import('../PlanetMap'))
export type ExplorerView = 'globe' | 'map' | 'trek'

class ViewBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function LoadingView({ label }: { label: string }) {
  return <div className={styles.loadingView} role="status"><Orbit aria-hidden="true" /><span>{label}</span></div>
}

function GlobeView({ planet, loading, active, fallback }: {
  planet: PlanetId
  loading: boolean
  active: boolean
  fallback: ReactNode
}) {
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const name = planet === 'mars' ? 'Mars' : 'the Moon'

  return <div className={styles.globeSurface}>
    <div className={styles.globeHalo} aria-hidden="true" />
    {!ready && <div className={styles.staticGlobe} role="img" aria-label={'Static preview of ' + name}>
      {planet === 'mars' ? <img className={styles.marsPoster} src="/images/mars-nasa-poster.jpg" alt="" width="512" height="512" /> : <>
        <img src="/nasa-fallback/moon/west.jpg" width="256" height="256" alt="" />
        <img src="/nasa-fallback/moon/east.jpg" width="256" height="256" alt="" />
      </>}
    </div>}
    {active ? <ViewBoundary fallback={fallback}>
      <div className={`${styles.globeScene} ${styles.touchSurface}`} style={{ visibility: ready ? 'visible' : 'hidden' }}>
        <Suspense fallback={null}><PlanetScene planet={planet} onReady={onReady} /></Suspense>
      </div>
      {!ready && <LoadingView label={'Loading ' + name + ' in 3D…'} />}
    </ViewBoundary> : loading ? <LoadingView label={'Loading ' + name + ' in 3D…'} /> :
      <div className={styles.previewNotice}>Static preview · explore locations in the 2D map</div>}
  </div>
}

export default function PlanetViewport({ planet, mode, onModeChange, focusId, focusRequest, viewportRef }: {
  planet: PlanetId
  mode: ExplorerView
  onModeChange: (mode: ExplorerView) => void
  focusId?: string
  focusRequest?: number
  viewportRef: RefObject<HTMLDivElement>
}) {
  const [webgl, setWebgl] = useState<boolean | null>(null)
  const [touchActive, setTouchActive] = useState(false)
  const [visible, setVisible] = useState(true)
  const [documentVisible, setDocumentVisible] = useState(true)
  const [fullscreenNotice, setFullscreenNotice] = useState('')
  const name = planet === 'mars' ? 'Mars' : 'the Moon'
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

  return <div ref={viewportRef} className={`${styles.viewer} ${mode === 'map' ? styles.mapViewer : ''} ${touchActive ? styles.touchActive : ''}`} tabIndex={-1} role="region" aria-label={`${name} ${mode === 'trek' ? 'NASA Mars Trek' : mode === 'map' ? 'scientific map' : 'planetary view'}`}>
    <div className={styles.viewerToolbar}>
      <div className={styles.viewSwitch} role="group" aria-label="Planet view">
        <button type="button" aria-pressed={mode === 'globe'} onClick={() => onModeChange('globe')}><Globe2 size={15} aria-hidden="true" />3D globe</button>
        <button type="button" aria-pressed={mode === 'map'} onClick={() => onModeChange('map')}><MapIcon size={15} aria-hidden="true" />2D map</button>
        {planet === 'mars' && <button type="button" aria-pressed={mode === 'trek'} onClick={() => onModeChange('trek')}><Globe2 size={15} aria-hidden="true" />NASA Mars Trek</button>}
      </div>
      <button type="button" className={styles.fullscreenButton} onClick={fullscreen} aria-label="Enter fullscreen exploration"><Maximize2 size={17} aria-hidden="true" /></button>
    </div>
    <div className={styles.viewerContent}>
      {mode === 'trek' && planet === 'mars' ? <section className={styles.trekPanel} aria-label="NASA Mars Trek">
        <Globe2 size={32} aria-hidden="true" />
        <p>Explore Mars terrain, 3D views, and mission sites in NASA Mars Trek.</p>
        <a href={sources.marsTrekExplorer.url} target="_blank" rel="noreferrer">Open NASA Mars Trek <ExternalLink size={15} aria-hidden="true" /></a>
        <a href={sources.perseveranceLocation.url} target="_blank" rel="noreferrer">Track Perseverance <ExternalLink size={15} aria-hidden="true" /></a>
      </section> : mode === 'globe' ?
        <GlobeView key={planet + liveGlobe} planet={planet} active={liveGlobe} loading={webgl === null} fallback={fallback} /> : <div className={`${mapStyles.frame} ${touchActive ? mapStyles.interactive : ''}`}>
        <ViewBoundary key={planet} fallback={fallback}>
          <Suspense fallback={<LoadingView label="Preparing the scientific map…" />}>
            <PlanetMap planet={planet} focusId={focusId} focusRequest={focusRequest} />
          </Suspense>
        </ViewBoundary>
      </div>}
    </div>
    {(mode === 'map' || (mode === 'globe' && liveGlobe)) && <div className={styles.touchInteraction}>
      <button type="button" aria-pressed={touchActive} onClick={() => setTouchActive(value => !value)}>{touchActive ? 'Done' : mode !== 'globe' ? 'Interact with map' : 'Rotate & zoom'}</button>
      <span>{touchActive ? mode !== 'globe' ? 'Drag to move. Pinch to zoom.' : 'Drag to rotate. Pinch to zoom.' : 'Scroll freely. Tap to interact.'}</span>
    </div>}
    {mode !== 'trek' && <p className={styles.viewerHint}>{mode === 'map' ? 'Pan, zoom, and select a location on the scientific map.' : liveGlobe ? 'Drag to orbit · Scroll to zoom' : 'Scientific locations and their sources are available below.'}</p>}
    {fullscreenNotice && <p className={styles.fullscreenNotice} role="status">{fullscreenNotice}</p>}
  </div>
}
