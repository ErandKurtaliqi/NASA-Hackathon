import { ArrowRight, BookOpen, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getExplorerStoryEntry as getStoryEntry } from '../../features/explorer/integratedStoryEntry'
import { machineStories } from '../../machineStories'
import { useProgress } from '../../store'
import type { HardwareProfile } from '../../types'
import styles from '../../pages/ExplorerPage.module.css'

export default function MachineDetails({ machine }: { machine: HardwareProfile }) {
  const story = Object.values(machineStories).find(item => item.machineId === machine.id && item.planet === machine.planet)
  const progress = useProgress(state => story ? state.storyProgress[story.id] : undefined)
  const entry = getStoryEntry(machine, progress)
  return <section id="machine-information" className={styles.machineDetails} aria-labelledby="machine-information-title">
    <span className={styles.eyebrow}>Meet the machine</span>
    <h2 id="machine-information-title">{machine.name}</h2>
    <p className={styles.machineOverview}>{machine.overview}</p>
    {entry ? <Link className={styles.storyLink} to={entry.href} aria-label={`${entry.label}: ${entry.story.name}`}><BookOpen size={16} aria-hidden="true" />{entry.label}<ArrowRight size={16} aria-hidden="true" /></Link>
      : <p className={styles.profileNote}>Explore this machine’s mission profile below.</p>}
    <details className={styles.profileDetails} key={machine.id}>
      <summary>Mission profile & instruments</summary>
      <p className={styles.missionDate}>{machine.missionDate}</p>
      <p>{machine.purpose}</p>
      <h3>Key systems</h3>
      <ul>{machine.instruments.map(instrument => <li key={instrument}>{instrument}</li>)}</ul>
    </details>
    <a href={machine.source.url} target="_blank" rel="noreferrer" className={styles.sourceLink}>{machine.source.label}<ExternalLink size={12} aria-hidden="true" /></a>
  </section>
}
