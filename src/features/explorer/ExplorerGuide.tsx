import { getStoryEntry } from '../../features/explorer/storyEntry'
import type { HardwareProfile } from '../../types'
import styles from '../../pages/ExplorerPage.module.css'

export default function ExplorerGuide({ machine, caption }: { machine: HardwareProfile; caption: string }) {
  const entry = getStoryEntry(machine)
  return <aside className={styles.guide} aria-label="Your astronaut guide">
    <div className={styles.speech}>
      <p>{caption}</p>
      <small>{entry ? `${machine.name} has a story to tell.` : `Discover what ${machine.name} was built to do.`}</small>
    </div>
    <img className={styles.astronaut} src="/images/home/astronaut-guide.png" width="220" height="330" alt="A friendly astronaut guide pointing toward the planet" decoding="async" />
  </aside>
}
