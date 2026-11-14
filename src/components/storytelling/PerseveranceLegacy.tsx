import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { MachineStory } from '../../machineStories'
import { legacyCategoryLabels, legacyMilestones, legacyReferences, legacyReviewedOn, type LegacyMilestone } from '../../features/storytelling/legacyMilestones'
import { useStoryReducedMotion } from '../../features/storytelling/motionPreference'
import StoryMedia from './StoryMedia'
import styles from './PerseveranceLegacy.module.css'

function LegacyRover({ children, reducedMotion }: { children: ReactNode; reducedMotion: boolean }) {
  const [open, setOpen] = useState(false)
  const [controls, setControls] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const surface = useRef<HTMLDivElement | null>(null)
  useEffect(() => { if (reducedMotion) { setOpen(false); setControls(false) } }, [reducedMotion])
  useEffect(() => {
    const hide = () => { if (document.hidden) { setOpen(false); setControls(false) } }
    let ownFullscreen = false
    const fullscreen = () => {
      if (document.fullscreenElement) ownFullscreen = !!surface.current?.contains(document.fullscreenElement)
      else if (ownFullscreen) { ownFullscreen = false; setControls(false); button.current?.focus() }
    }
    document.addEventListener('visibilitychange', hide)
    document.addEventListener('fullscreenchange', fullscreen)
    return () => { document.removeEventListener('visibilitychange', hide); document.removeEventListener('fullscreenchange', fullscreen) }
  }, [])
  return <section className={styles.rover} aria-label="Legacy rover model">
    <div className={styles.roverHeading}><div><h2>The explorer behind the milestones</h2><p>The original NASA rover model is optional. All timeline records remain available without 3D.</p></div>
      <button type="button" aria-expanded={open} aria-controls="legacy-rover-view" onClick={() => { setOpen(value => !value); setControls(false) }}>{open ? 'Hide 3D rover' : 'Show 3D rover'}</button>
    </div>
    <div id="legacy-rover-view" hidden={!open}>{open && <>
      <div ref={element => { surface.current = element; if (element) element.inert = !controls }} className={`${styles.roverSurface} ${!controls ? styles.locked : ''}`} aria-hidden={!controls}
        onKeyDown={event => { if (event.key === 'Escape') { setControls(false); button.current?.focus() } }}>{children}</div>
      <button ref={button} type="button" aria-pressed={controls} onClick={() => setControls(value => !value)}>{controls ? 'Done with 3D controls' : 'Enable 3D controls'}</button>
      <p>Enable controls to rotate or zoom. Done or Escape returns to reading. 3D asset: NASA/JPL-Caltech.</p>
    </>}</div>
    {reducedMotion && <p>Reduced motion is enabled. The model stays closed until you choose to open it.</p>}
  </section>
}

export default function PerseveranceLegacy({ story, onInteract, rover }: { story: MachineStory; onInteract: () => void; rover: ReactNode }) {
  const [selected, setSelected] = useState(0)
  const reducedMotion = useStoryReducedMotion()
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const milestone: LegacyMilestone = legacyMilestones[selected]
  const original = milestone.legacyIndex === undefined ? undefined : story.legacy[milestone.legacyIndex]
  const title = original?.title ?? milestone.title
  const select = (index: number) => {
    if (index < 0 || index >= legacyMilestones.length) return
    setSelected(index)
    onInteract()
  }
  const navigateKey = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? legacyMilestones.length - 1
      : ['ArrowRight', 'ArrowDown'].includes(event.key) ? Math.min(index + 1, legacyMilestones.length - 1)
      : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? Math.max(index - 1, 0) : null
    if (next === null) return
    event.preventDefault()
    select(next)
    buttons.current[next]?.focus({ preventScroll: true })
    buttons.current[next]?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'auto', block: 'nearest' })
  }

  return <section className={styles.chapter} aria-label="Perseverance legacy timeline">
    <header className={styles.intro}><span className={styles.eyebrow}>KNOWLEDGE FOR THE NEXT EXPLORERS</span>
      <h2>A mission’s legacy keeps growing.</h2><p>Choose a milestone to see what happened, why it matters and what remains possible. These are selected milestones, not a complete mission history.</p>
      <div className={styles.review}><strong>Active on Mars</strong><span>Status checked <time dateTime={legacyReviewedOn}>4 November 2026</time> · dated snapshot</span><a href={legacyReferences.mission.url} target="_blank" rel="noreferrer">NASA mission status ↗</a></div>
    </header>
    <div className={styles.layout}>
      <nav className={styles.timeline} aria-label="Choose a legacy milestone"><p>Explore in any order · use Tab, Enter or the arrow keys.</p><ol>{legacyMilestones.map((item, index) => <li key={item.id}>
        <button type="button" ref={element => { buttons.current[index] = element }} aria-pressed={selected === index} aria-controls="legacy-milestone-detail"
          onClick={() => select(index)} onKeyDown={event => navigateKey(event, index)}>
          <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span><span><small>{item.dateLabel}</small><strong>{item.title}</strong></span>
        </button>
      </li>)}</ol></nav>
      <div className={styles.record}>
        <p className={styles.readingStatus} role="status" aria-live="polite" aria-atomic="true">Milestone {selected + 1} of {legacyMilestones.length}: {title}</p>
        <article id="legacy-milestone-detail" aria-labelledby="legacy-milestone-title">
          <div className={styles.recordMeta}><span className={milestone.category === 'possible' ? styles.possible : styles.category}>{legacyCategoryLabels[milestone.category]}</span>
            {milestone.startDate ? <time dateTime={milestone.startDate}>{milestone.dateLabel}</time> : <span>{milestone.dateLabel}</span>}
          </div>
          <h2 id="legacy-milestone-title">{title}</h2>
          <p className={styles.storyCopy}>{original?.copy ?? milestone.copy}</p>
          <p className={styles.detail}>{milestone.detail}</p>
          <div className={styles.significance}><h3>Why it matters</h3><p>{milestone.significance}</p></div>
          {milestone.expectation && <aside className={styles.expectation}><h3>Scientific expectation · not an established finding</h3><p>{milestone.expectation}</p></aside>}
          {milestone.caution && <p className={styles.caution}><strong>Keep the distinction</strong>{milestone.caution}</p>}
          <div className={styles.evidence}><StoryMedia media={milestone.media} motionEnabled={!reducedMotion} /><p className={styles.mediaContext}>{milestone.mediaContext}</p></div>
          <section className={styles.references} aria-label="Milestone scientific references"><h3>Check the evidence</h3><ul>{milestone.references.map(source => <li key={source.url}>
            <a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>{source.publishedOn && <small>Published <time dateTime={source.publishedOn}>{source.publishedOn}</time></small>}
          </li>)}</ul></section>
        </article>
        <nav className={styles.recordControls} aria-label="Move through legacy milestones">
          <button type="button" disabled={selected === 0} onClick={() => select(selected - 1)}>Previous milestone</button>
          <button type="button" disabled={selected === legacyMilestones.length - 1} onClick={() => select(selected + 1)}>Next milestone</button>
        </nav>
      </div>
    </div>
    <LegacyRover reducedMotion={reducedMotion}>{rover}</LegacyRover>
    <p className={styles.endNote}>Your selected milestone is temporary. Use Next Chapter below to save your existing chapter progress.</p>
  </section>
}
