import { startExplorerIntro } from '../explorer/useExplorerIntro'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowRight, LoaderCircle, Moon, Orbit } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PlanetId } from '../../types'
import styles from '../../pages/HomePage.module.css'
import openingStyles from './PlanetGatewayOpening.module.css'

const PlanetScene = lazy(() => import('../PlanetScene'))
const OPENING_PAUSE_MS = 650

class PreviewBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onError() }
  render() { return this.state.failed ? null : this.props.children }
}

/** A presentation adapter only. The scientific scene and its data remain untouched. */
export default function PlanetGateway({ planet, animated, webgl, onHighlight, onNarrate }: {
  planet: PlanetId
  animated: boolean
  webgl: boolean
  onHighlight: (planet: PlanetId | null) => void
  onNarrate: (planet: PlanetId) => void
}) {
  const pointerX=useMotionValue(0),pointerY=useMotionValue(0)
  const x=useSpring(pointerX,{stiffness:110,damping:24}),y=useSpring(pointerY,{stiffness:110,damping:24})
  const host = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const [documentVisible, setDocumentVisible] = useState(true)
  const [touchActive, setTouchActive] = useState(false)
  const [sceneReady,setSceneReady]=useState(false)
  const [openingComplete, setOpeningComplete] = useState(false)
  const ready=useCallback(()=>setSceneReady(true),[])
  const [sceneFailed, setSceneFailed] = useState(false)
  const failed = useCallback(() => {
    setSceneReady(false)
    setSceneFailed(true)
  }, [])
  const name = planet === 'moon' ? 'Moon' : 'Mars'
  const sceneActive = webgl && visible && documentVisible
  const sceneVisible = sceneActive && sceneReady && !sceneFailed
  const sceneLoading = sceneActive && !sceneReady && !sceneFailed

  useEffect(() => {
    if (!sceneVisible || !animated) {
      setOpeningComplete(false)
      return
    }
    const timer = setTimeout(() => setOpeningComplete(true), OPENING_PAUSE_MS)
    return () => clearTimeout(timer)
  }, [sceneVisible, animated])

  useEffect(() => {
    const update = () => setDocumentVisible(!document.hidden)
    update()
    document.addEventListener('visibilitychange', update)
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '60px' })
    if (host.current) observer.observe(host.current)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update) }
  }, [])

  useEffect(() => {
    if (!sceneActive) { setTouchActive(false); setSceneReady(false); setSceneFailed(false) }
  }, [sceneActive])

  return <article
    ref={host}
    onPointerMove={event=>{if(!openingComplete||!animated||event.pointerType!=='mouse')return;const rect=event.currentTarget.getBoundingClientRect();pointerX.set(((event.clientX-rect.left)/rect.width-.5)*10);pointerY.set(((event.clientY-rect.top)/rect.height-.5)*8)}}
    onPointerLeave={()=>{pointerX.set(0);pointerY.set(0)}}
    className={`${styles.gateway} ${openingStyles.gateway} ${planet === 'moon' ? styles.moon : styles.mars} ${touchActive ? styles.touchInteractive : ''}`}
    aria-label={planet === 'moon' ? 'Explore the Moon' : 'Explore Mars'}
    onMouseEnter={() => onHighlight(planet)}
    onMouseLeave={() => onHighlight(null)}
    onFocus={() => { onHighlight(planet); onNarrate(planet) }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) onHighlight(null) }}
  >
    <motion.div className={styles.planetMotion} style={{x:animated&&openingComplete?x:0,y:animated&&openingComplete?y:0}}><div className={styles.planetStage}
      onPointerDown={event => { if (event.pointerType !== 'touch' && event.button === 0) onNarrate(planet) }}
      onClick={() => onNarrate(planet)}>
      <div className={styles.planetHalo} aria-hidden="true" /><div className={styles.orbitAccent} aria-hidden="true" />
      <div className={styles.planetDisc}>
        {sceneActive && <div className={styles.scene} style={{ visibility: sceneVisible ? 'visible' : 'hidden' }}>
          <PreviewBoundary onError={failed}><Suspense fallback={null}><PlanetScene planet={planet} compact onReady={ready} openingPaused={!animated || !openingComplete} /></Suspense></PreviewBoundary>
        </div>}
        <div className={`${styles.planetPoster} ${openingStyles.poster} ${animated ? openingStyles.transition : ''} ${sceneVisible ? openingStyles.faded : ''}`} aria-hidden="true">
          {planet==='mars'?<img src="/images/mars-nasa-poster.jpg" alt="" width="512" height="512" />:<><img src="/nasa-fallback/moon/west.jpg" alt="" width="256" height="256" /><img src="/nasa-fallback/moon/east.jpg" alt="" width="256" height="256" /></>}
        </div>
        <div className={styles.planetRim} aria-hidden="true" />
        {sceneLoading && <span className={openingStyles.loading} role="status" aria-label={`Loading ${name} in 3D`}><LoaderCircle aria-hidden="true" /></span>}
      </div>
    </div></motion.div>
    <Link className={styles.exploreLink} to={`/explore/${planet}`} aria-label={`Explore ${name}`} onClick={event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) startExplorerIntro(planet) }}>
      {planet === 'moon' ? <Moon aria-hidden="true" /> : <Orbit aria-hidden="true" />}
      <span>Explore {name}</span><ArrowRight aria-hidden="true" />
    </Link>
    <span className={styles.planetHint}>{animated && sceneVisible ? 'Drag to look around' : 'A world of stories awaits'}</span>
    <div className={styles.touchControls}>
      {sceneActive && !sceneFailed && <button
        type="button"
        className={styles.touchToggle}
        aria-label={touchActive ? `Finish interacting with ${name}` : `Rotate and zoom ${name}`}
        aria-pressed={touchActive}
        aria-describedby={`${planet}-touch-help`}
        onClick={() => { setTouchActive(active => !active); onHighlight(planet); onNarrate(planet) }}
      >{touchActive ? 'Done' : 'Rotate & zoom'}</button>}
      <span className={styles.touchHelp} id={`${planet}-touch-help`}>
        {sceneActive && !sceneFailed ? touchActive ? 'Drag to rotate. Pinch to zoom.' : 'Tap above to interact.' : 'A world of stories awaits.'}
      </span>
    </div>
  </article>
}
