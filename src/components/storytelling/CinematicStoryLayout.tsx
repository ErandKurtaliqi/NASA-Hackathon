import type { ReactNode } from 'react'
import styles from './CinematicStoryLayout.module.css'
import { apollo15StageAssets } from '../../features/storytelling/storyStageAssets'
import type { StoryWorld } from '../../features/storytelling/storyPresentation'

/** Explicit presentation slots. Story hooks, refs, audio and progress remain
 * owned by the mission. Opening is rendered once, in native reading order. */
export default function CinematicStoryLayout({ rover, intro, opening, controls, children, evidence, sceneCredits, sceneNote, world = 'moon', storytellerLabel = 'Your rover storyteller' }: {
  rover: ReactNode; intro?: ReactNode; opening?: ReactNode; controls?: ReactNode; sceneNote?: ReactNode
  children: ReactNode; evidence: ReactNode; storytellerLabel?: string; sceneCredits?: boolean; world?: StoryWorld
}) {
  return <section className={styles.layout} aria-label="Scroll story and activities" data-cinematic-story="true" data-world={world}>
    <div className={styles.stage}>
      <div className={styles.center}>
        <div className={styles.intro}>{intro}</div>
        <div className={styles.opening}>{opening ?? children}</div>
      </div>
      <aside className={styles.hardware} aria-label={storytellerLabel}>{rover}</aside>
      <aside className={styles.evidence} aria-label="NASA evidence">{evidence}</aside>
    </div>
    {controls && <div className={styles.deck}>{controls}</div>}
    {sceneCredits && <p className={styles.sceneCredits} role="note">Photographic composition for storytelling · NASA <a href={apollo15StageAssets.surface.sourceUrl} target="_blank" rel="noreferrer">Apollo 15 surface panorama ↗</a> and a masked historical rover photograph. Decorative stars and lighting; not a single mission photograph or a geographic reconstruction.</p>}
    {sceneNote && <div className={styles.sceneCredits}>{sceneNote}</div>}
    {opening && <div className={styles.reading}>
      <div className={styles.readingTitle}><span aria-hidden="true">↓</span><p>THE STORY CONTINUES<small>Scroll at your own pace. Use Previous / Next at any time.</small></p></div>
      {children}
    </div>}
  </section>
}
