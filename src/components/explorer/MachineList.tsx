import { Bot, ChevronRight, Plane, Satellite } from 'lucide-react'
import { eaglePortrait } from '../../features/storytelling/apollo11Eagle'
import { apollo11StoryMedia } from '../../features/storytelling/apollo11StoryMedia'
import { apollo15StoryMedia } from '../../features/storytelling/apollo15StoryMedia'
import { apollo16StoryMedia } from '../../features/storytelling/apollo16StoryMedia'
import { apollo17StoryMedia } from '../../features/storytelling/apollo17StoryMedia'
import type { HardwareProfile } from '../../types'
import styles from '../../pages/ExplorerPage.module.css'

const moonPortraits: Partial<Record<string, string>> = {
  'lunar-module': eaglePortrait.src,
  'apollo-11-lrrr': apollo11StoryMedia.array.src,
  'lrv-1': apollo15StoryMedia.rover.src,
  'lrv-2': apollo16StoryMedia.rover.src,
  lrv: apollo17StoryMedia.vehicle.src,
}

export default function MachineList({ machines, selectedId, onSelect }: {
  machines: HardwareProfile[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  return <section className={styles.machineList} id="explorer-machines" tabIndex={-1} aria-labelledby="machine-list-title">
    <h2 id="machine-list-title" className={styles.eyebrow}>Rovers & machines <span>{String(machines.length).padStart(2, '0')}</span></h2>
    <ul>
      {machines.map(machine => {
        const portrait = moonPortraits[machine.id]
        return <li key={machine.id}>
          <button type="button" className={`${styles.machineButton} ${selectedId === machine.id ? styles.selectedMachine : ''}`} aria-pressed={selectedId === machine.id} aria-controls="machine-information" onClick={() => onSelect(machine.id)}>
            <span className={styles.machineArt} aria-hidden="true">
              {portrait ? <img src={portrait} alt="" width="56" height="56" loading="lazy" />
                : machine.id === 'ingenuity' ? <Plane /> : machine.id === 'lunar-module' ? <Satellite /> : <Bot />}
            </span>
            <span className={styles.machineName}><b>{machine.name}</b><small>{machine.type}</small></span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </li>
      })}
    </ul>
  </section>
}
