import useExplorerIntro from '../components/explorer/useExplorerIntro'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { ArrowDown, Globe2 } from 'lucide-react'
import { useLocation, useNavigate, useNavigationType, useParams, useSearchParams } from 'react-router-dom'
import ExplorerHeader from '../components/explorer/ExplorerHeader'
import FooterBrand from '../components/branding/FooterBrand'
import ExplorerGuide from '../components/explorer/ExplorerGuide'
import MachineList from '../components/explorer/MachineList'
import MachineDetails from '../components/explorer/MachineDetails'
import PlanetViewport, { type ExplorerView } from '../components/explorer/PlanetViewport'
import ScientificLocations from '../components/explorer/ScientificLocations'
import { getPlanetLocations, getSelectedLocation } from '../features/explorer/storyMapLocations'
import { explorerHardware as hardware } from '../features/explorer/integratedStoryEntry'
import { getExplorerStoryEntry as getStoryEntry } from '../features/explorer/integratedStoryEntry'
import { useProgress } from '../store'
import type { PlanetId } from '../types'
import styles from './ExplorerPage.module.css'
import { clearDocumentaryPlanetReturn, isDocumentaryPlanetReturn } from '../features/explorer/documentaryPlanetReturn'

export default function ExplorerPage() {
  const { planet: raw } = useParams()
  const [search] = useSearchParams()
  const navigationType = useNavigationType(), routeLocation = useLocation(), navigate = useNavigate()
  // Preserve the existing route fallback for unsupported planet parameters.
  const planet: PlanetId = raw === 'moon' ? 'moon' : 'mars'
  const entry = useRef({ key: routeLocation.key, fromDocumentary: isDocumentaryPlanetReturn(planet) })
  const documentaryBack = navigationType === 'POP' && entry.current.key === routeLocation.key && entry.current.fromDocumentary
  const entryMode = search.get('view') === 'map' && !documentaryBack ? 'map' : 'globe'
  const handledReturn = useRef(false)
  useEffect(() => {
    if (handledReturn.current) return
    handledReturn.current = true
    clearDocumentaryPlanetReturn()
    if (documentaryBack && search.get('view') === 'map') {
      const next = new URLSearchParams(search)
      next.delete('view')
      navigate({ pathname: routeLocation.pathname, search: next.toString() }, { replace: true })
    }
  }, [documentaryBack, navigate, routeLocation.pathname, search])
  const machines = hardware.filter(machine => machine.planet === planet)
  const locations = getPlanetLocations(planet)
  const [machineId, setMachineId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [focusRequest, setFocusRequest] = useState(0)
  const [mode, setMode] = useState<ExplorerView>(entryMode)
  const intro = useExplorerIntro(planet)
  const reducedMotion = !!useReducedMotion()
  const viewport = useRef<HTMLDivElement>(null)
  const exploreLocation = useProgress(state => state.exploreLocation)
  const machine = machines.find(item => item.id === machineId) || machines.find(item => getStoryEntry(item)) || machines[0]
  const location = getSelectedLocation(planet, locationId)
  const world = planet === 'mars' ? 'Mars' : 'Moon'

  useEffect(() => {
    const title = document.title
    document.title = `Explore ${world} — Auroralys`
    setMode(entryMode)
    setMachineId('')
    setLocationId('')
    return () => { document.title = title }
  }, [world, entryMode])

  useEffect(() => {
    // A browser Back across a full reload may restore an existing map document
    // from BFCache instead of remounting React. Apply the same return intent.
    const restored = (event: PageTransitionEvent) => {
      if (!event.persisted || !isDocumentaryPlanetReturn(planet)) return
      clearDocumentaryPlanetReturn()
      setMode('globe'); setLocationId('')
      const next = new URLSearchParams(window.location.search)
      if (next.get('view') === 'map') {
        next.delete('view')
        navigate({ pathname: routeLocation.pathname, search: next.toString() }, { replace: true })
      }
    }
    window.addEventListener('pageshow', restored)
    return () => window.removeEventListener('pageshow', restored)
  }, [planet, navigate, routeLocation.pathname])

  const selectLocation = (id: string) => {
    if (!locations.some(item => item.id === id)) return
    setLocationId(id)
    exploreLocation(id)
  }

  const viewMap = (id = location.id) => {
    if (!locations.some(item => item.id === id)) return
    selectLocation(id)
    setFocusRequest(value => value + 1)
    setMode('map')
    viewport.current?.focus({ preventScroll: true })
    viewport.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' })
  }

  return <div className={`${styles.explorer} ${planet === 'moon' ? styles.moon : styles.mars} ${reducedMotion ? styles.still : ''}`}>
    <section className={styles.hero} aria-labelledby="explorer-title">
      <div className={styles.space} aria-hidden="true"><div className={styles.nebula} /><div className={styles.stars} /></div>
      <ExplorerHeader planet={planet} sound={intro.sound} onToggleSound={intro.toggle} />
      <h1 id="explorer-title" className={styles.srOnly}>Explore {world}: rovers, machines, and scientific locations</h1>
      <div className={styles.composition}>
        <ExplorerGuide machine={machine} caption={intro.caption} />
        <div className={styles.roster}>
          {/* GIS integration: machine selection changes frontend details only. Coordinate bindings and globe markers belong to the GIS developer. */}
          <MachineList machines={machines} selectedId={machine.id} onSelect={setMachineId} />
          <MachineDetails machine={machine} />
          <p className={styles.srOnly} role="status">{machine.name} selected. {getStoryEntry(machine) ? 'A story is available in the machine information panel.' : 'Its mission profile is available in the machine information panel.'}</p>
        </div>
        <PlanetViewport planet={planet} mode={mode} onModeChange={setMode} focusId={location.id} focusRequest={focusRequest} onSelectLocation={selectLocation} viewportRef={viewport} />
      </div>
      <div className={styles.heroBottom}>
        <div className={styles.worldSignature}><Globe2 size={23} aria-hidden="true" /><b>{world}</b><span>Real missions. Lasting legacies.</span></div>
        <a href="#scientific-locations" className={styles.scrollLink}><span><ArrowDown size={15} aria-hidden="true" /></span>Explore scientific locations</a>
      </div>
    </section>
    <ScientificLocations planet={planet} selectedId={location.id} onSelect={selectLocation} onViewMap={viewMap} />
    <footer className={styles.footer}>
      <FooterBrand linked />
    </footer>
  </div>
}
