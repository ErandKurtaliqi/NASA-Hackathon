import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Menu, Volume2, VolumeX, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import PlanetGateway from '../components/home/PlanetGateway'
import AstronautGuide from '../components/home/AstronautGuide'
import useHomeNarration from '../components/home/useHomeNarration'
import type { PlanetId } from '../types'
import styles from './HomePage.module.css'

// Original provisional artwork. Replace these paths when approved brand assets arrive.
const artwork = { logo: '/images/home/auroralys-mark.svg', astronaut: '/images/home/astronaut-guide.png' }

const navigation = [
  { to: '/explore/mars', label: 'Explore' },
  { to: '/story/apollo-15-rover/1', label: 'Story' },
  { to: '/hardware', label: 'Spacecraft & rovers' },
  { to: '/dashboard', label: 'Mission control' },
  { to: '/sources', label: 'Science & sources' },
  { to: '/discover', label: 'Mission guide' },
]

function Brand() {
  return <Link className={styles.brand} to="/" aria-label="Auroralys home"><img src={artwork.logo} width="48" height="48" alt="" /><span>AURORALYS</span></Link>
}

export default function HomePage() {
  const reducedMotion = useReducedMotion()
  const narration = useHomeNarration()
  const [menuOpen, setMenuOpen] = useState(false)
  const [highlighted, setHighlighted] = useState<PlanetId | null>(null)
  const [selectedDialogue, setSelectedDialogue] = useState<PlanetId | null>(null)
  const [webgl, setWebgl] = useState(false)
  const animated = !reducedMotion && (typeof localStorage==='undefined'||localStorage.getItem('auroralys-calm')!=='true')
  const narratePlanet = (planet: PlanetId) => {
    setSelectedDialogue(planet)
    setHighlighted(planet)
    narration.select(planet)
  }

  useEffect(() => {
    const originalTitle = document.title
    document.title = 'Auroralys — Their stories live on'
    try {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl')
      setWebgl(Boolean(context))
      context?.getExtension('WEBGL_lose_context')?.loseContext()
    } catch { setWebgl(false) }
    return () => { document.title = originalTitle }
  }, [])

  return <div className={`${styles.home} ${!animated ? styles.still : ''}`}>
    <a className={styles.skipLink} href="#home-content">Skip to content</a>
    <section className={styles.hero} aria-labelledby="home-heading">
      <div className={styles.space} aria-hidden="true"><div className={styles.nebula} /><div className={styles.stars} />
        {Array.from({ length: 15 }, (_, i) => <i key={i} className={styles.brightStar} style={{ left: `${(i * 37 + 8) % 100}%`, top: `${(i * 23 + 7) % 95}%`, animationDelay: `${i * -.7}s` }} />)}
      </div>
      <header className={styles.header}>
        <Brand />
        <div className={styles.headerActions}>
          <button type="button" className={styles.iconButton} onClick={narration.toggle} aria-label={narration.enabled ? 'Turn sound off' : 'Turn sound on'} aria-pressed={narration.enabled} aria-describedby="home-audio-status" title={narration.enabled ? 'Turn astronaut sound off' : 'Turn astronaut sound on'}>{narration.enabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}</button>
          <button id="home-menu-toggle" className={styles.iconButton} onClick={() => setMenuOpen(value => !value)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="home-navigation">{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
        </div>
        <p id="home-audio-status" className={narration.error ? styles.audioError : styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{narration.message}</p>
        {menuOpen && <nav className={styles.menu} id="home-navigation" aria-label="Main navigation" onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); document.getElementById('home-menu-toggle')?.focus() } }}>
          {navigation.map(item => <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}>{item.label}<ArrowRight size={16} aria-hidden="true" /></Link>)}
        </nav>}
      </header>
      <div className={styles.heroContent} id="home-content" tabIndex={-1}>
        <motion.div className={styles.headline} initial={reducedMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
          <h1 id="home-heading">Their missions ended.<br />Their stories <span>live on.</span></h1>
          <svg className={styles.comet} viewBox="0 0 340 40" fill="none" aria-hidden="true"><defs><linearGradient id="comet-stroke"><stop stopColor="#6576ff" stopOpacity="0" /><stop offset=".6" stopColor="#38c9ff" /><stop offset="1" stopColor="#b69bff" /></linearGradient></defs><path d="M5 34Q150 -4 310 17" stroke="url(#comet-stroke)" strokeWidth="2.4" /><path d="m311 6 3.5 8 9 3-9 3.5-3.5 8-3-8-8.5-3.5 8.5-3z" fill="#8ebeff" /></svg>
        </motion.div>
        <AstronautGuide highlighted={highlighted} selected={selectedDialogue} narration={narration} astronaut={artwork.astronaut} />
        <div className={styles.worldSelection}>
          <PlanetGateway planet="moon" animated={animated} webgl={webgl} onHighlight={setHighlighted} onNarrate={narratePlanet} />
          <PlanetGateway planet="mars" animated={animated} webgl={webgl} onHighlight={setHighlighted} onNarrate={narratePlanet} />
        </div>
      </div>
      <div className={styles.foreground} aria-hidden="true"><div className={styles.lunarHorizon} /></div>
    </section>
  </div>
}
