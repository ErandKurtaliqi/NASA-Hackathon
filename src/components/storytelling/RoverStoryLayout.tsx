import type { ReactNode } from 'react'
import styles from './RoverStoryLayout.module.css'

/** Presentation slots only: missions keep ownership of activity/progress logic. */
export default function RoverStoryLayout({ rover, children, evidence, intro, storytellerLabel = 'Your rover storyteller' }: { rover: ReactNode; children: ReactNode; evidence: ReactNode; intro?: ReactNode; storytellerLabel?: string }) {
  return <div className={intro ? `${styles.layout} ${styles.withIntro}` : styles.layout}>
    {intro && <div className={styles.intro}>{intro}</div>}
    <aside className={styles.rover} aria-label={storytellerLabel}>{rover}</aside>
    <section className={styles.narrative} aria-label="Scroll story and activities">{children}</section>
    <aside className={styles.evidence} aria-label="NASA evidence">{evidence}</aside>
  </div>
}
