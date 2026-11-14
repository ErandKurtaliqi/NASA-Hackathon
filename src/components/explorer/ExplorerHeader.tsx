import { useRef, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Menu, Volume2, VolumeX, X } from 'lucide-react'
import { startExplorerIntro } from './useExplorerIntro'
import { Link, NavLink } from 'react-router-dom'
import type { PlanetId } from '../../types'
import styles from '../../pages/ExplorerPage.module.css'

export default function ExplorerHeader({ planet, sound, onToggleSound }: {
  planet: PlanetId
  sound: boolean
  onToggleSound: () => void
}) {
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  return <>
    <a className={styles.skipLink} href="#explorer-machines">Skip to machines</a>
    <header className={styles.header} onKeyDown={event => {
      if (event.key === 'Escape' && open) { setOpen(false); toggle.current?.focus() }
    }}>
      <Link to="/" className={styles.brand} aria-label="Auroralys home">
        <img src="/images/home/auroralys-mark.svg" width="42" height="42" alt="" />
        <span>AURORALYS</span>
      </Link>
      <nav className={styles.planetSwitch} aria-label="Choose a world">
        <NavLink to="/explore/mars" onClick={event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && planet !== 'mars') startExplorerIntro('mars') }}>Mars</NavLink>
        <NavLink to="/explore/moon" onClick={event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && planet !== 'moon') startExplorerIntro('moon') }}>Moon</NavLink>
      </nav>
      <div className={styles.headerActions}>
        <button type="button" className={styles.iconButton} onClick={onToggleSound} aria-label={sound ? 'Turn sound off' : 'Turn sound on'} aria-pressed={sound}>
          {sound ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
        </button>
        <button type="button" ref={toggle} className={styles.iconButton} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="explorer-navigation" onClick={() => setOpen(value => !value)}>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      {open && <nav id="explorer-navigation" className={styles.menu} aria-label="Main navigation">
        <Link to="/" onClick={() => setOpen(false)}>Home <ArrowUpRight aria-hidden="true" /></Link>
        <Link to="/story/apollo-15-rover/1" onClick={() => setOpen(false)}>Story <ArrowUpRight aria-hidden="true" /></Link>
        <Link to="/hardware" onClick={() => setOpen(false)}>Machines & stories <ArrowUpRight aria-hidden="true" /></Link>
        <Link to="/dashboard" onClick={() => setOpen(false)}>Mission control <ArrowUpRight aria-hidden="true" /></Link>
        <Link to="/sources" onClick={() => setOpen(false)}>Science & sources <ArrowUpRight aria-hidden="true" /></Link>
      </nav>}
    </header>
    <div className={styles.breadcrumb}>
      <Link to="/" className={styles.backLink}><span><ArrowLeft aria-hidden="true" /></span>Back to Home</Link>
      <span className={styles.worldLabel}>{planet === 'mars' ? 'The red planet' : 'Our celestial neighbor'}</span>
    </div>
  </>
}
