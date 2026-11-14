import { startExplorerIntro } from '../explorer/useExplorerIntro'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowRight, Moon, Orbit } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PlanetId } from '../../types'
import styles from '../../pages/HomePage.module.css'

const PlanetScene = lazy(() => import('../PlanetScene'))

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
  const ready=useCallback(()=>setSceneReady(true),[])
  const failed=useCallback(()=>setSceneReady(false),[])
  const name = planet === 'moon' ? 'Moon' : 'Mars'
  const sceneActive = webgl && visible && documentVisible

  useEffect(() => {
    const update = () => setDocumentVisible(!document.hidden)
    update()
    document.addEventListener('visibilitychange', update)
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '60px' })
    if (host.current) observer.observe(host.current)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update) }
  }, [])

  useEffect(() => {
    if (!sceneActive) { setTouchActive(false); setSceneReady(false) }
  }, [sceneActive])

  return <article
    ref={host}
    onPointerMove={event=>{if(!animated||event.pointerType!=='mouse')return;const rect=event.currentTarget.getBoundingClientRect();pointerX.set(((event.clientX-rect.left)/rect.width-.5)*10);pointerY.set(((event.clientY-rect.top)/rect.height-.5)*8)}}
    onPointerLeave={()=>{pointerX.set(0);pointerY.set(0)}}
    className={`${styles.gateway} ${planet === 'moon' ? styles.moon : styles.mars} ${touchActive ? styles.touchInteractive : ''}`}
    aria-label={planet === 'moon' ? 'Explore the Moon' : 'Explore Mars'}
    onMouseEnter={() => onHighlight(planet)}
    onMouseLeave={() => onHighlight(null)}
    onFocus={() => { onHighlight(planet); onNarrate(planet) }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) onHighlight(null) }}
  >
    <motion.div className={styles.planetMotion} style={{x:animated?x:0,y:animated?y:0}}><div className={styles.planetStage}
      onPointerDown={event => { if (event.pointerType !== 'touch' && event.button === 0) onNarrate(planet) }}
      onClick={() => onNarrate(planet)}>
      <div className={styles.planetHalo} aria-hidden="true" /><div className={styles.orbitAccent} aria-hidden="true" />
      <div className={styles.planetDisc}>
        <div className={styles.planetPoster} aria-hidden="true" hidden={sceneActive&&sceneReady}>
          {planet==='mars'?<img src="/images/mars-nasa-poster.jpg" alt="" width="512" height="512" />:<><img src="/nasa-fallback/moon/west.jpg" alt="" width="256" height="256" /><img src="/nasa-fallback/moon/east.jpg" alt="" width="256" height="256" /></>}
        </div>
        {sceneActive && <div className={`${styles.scene} ${sceneReady?styles.sceneReady:''}`}>
          <PreviewBoundary onError={failed}><Suspense fallback={null}><PlanetScene planet={planet} compact onReady={ready} /></Suspense></PreviewBoundary>
        </div>}
        <div className={styles.planetRim} aria-hidden="true" />
      </div>
    </div></motion.div>
    <Link className={styles.exploreLink} to={`/explore/${planet}`} aria-label={`Explore ${name}`} onClick={event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) startExplorerIntro(planet) }}>
      {planet === 'moon' ? <Moon aria-hidden="true" /> : <Orbit aria-hidden="true" />}
      <span>Explore {name}</span><ArrowRight aria-hidden="true" />
    </Link>
    <span className={styles.planetHint}>{animated && webgl ? 'Drag to look around' : 'A world of stories awaits'}</span>
    <div className={styles.touchControls}>
      {sceneActive && <button
        type="button"
        className={styles.touchToggle}
        aria-label={touchActive ? `Finish interacting with ${name}` : `Rotate and zoom ${name}`}
        aria-pressed={touchActive}
        aria-describedby={`${planet}-touch-help`}
        onClick={() => { setTouchActive(active => !active); onHighlight(planet); onNarrate(planet) }}
      >{touchActive ? 'Done' : 'Rotate & zoom'}</button>}
      <span className={styles.touchHelp} id={`${planet}-touch-help`}>
        {sceneActive ? touchActive ? 'Drag to rotate. Pinch to zoom.' : 'Tap above to interact.' : 'A world of stories awaits.'}
      </span>
    </div>
  </article>
}
