import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { MachineStory } from '../../machineStories'
import { challengeLessons, discoveryLessons } from '../../features/storytelling/challengeMedia'
import { useStoryReducedMotion } from '../../features/storytelling/motionPreference'
import StoryMedia from './StoryMedia'
import styles from './PerseveranceChallenges.module.css'

function RoverPreview({ children, reducedMotion }: { children: ReactNode; reducedMotion: boolean }) {
  const [open, setOpen] = useState(false)
  const [controls, setControls] = useState(false)
  const controlButton = useRef<HTMLButtonElement>(null)
  const surface = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const hide = () => { if (document.hidden) { setOpen(false); setControls(false) } }
    document.addEventListener('visibilitychange', hide)
    return () => document.removeEventListener('visibilitychange', hide)
  }, [])
  useEffect(() => { if (reducedMotion) { setOpen(false); setControls(false) } }, [reducedMotion])
  useEffect(() => {
    let ownFullscreen = false
    const change = () => {
      if (document.fullscreenElement) ownFullscreen = !!surface.current?.contains(document.fullscreenElement)
      else if (ownFullscreen) { ownFullscreen = false; setControls(false); controlButton.current?.focus() }
    }
    document.addEventListener('fullscreenchange', change)
    return () => document.removeEventListener('fullscreenchange', change)
  }, [])
  return <section className={styles.rover} aria-label="Perseverance rover model">
    <div className={styles.roverHeading}><div><h2>Meet the machine behind the solutions</h2><p>The original NASA rover model is optional. Your reading and discoveries stay available without 3D.</p></div>
      <button type="button" aria-expanded={open} aria-controls="challenge-rover-view" onClick={() => { setOpen(value => !value); setControls(false) }}>{open ? 'Hide 3D rover' : 'Show 3D rover'}</button>
    </div>
    <div id="challenge-rover-view" hidden={!open}>
      {open && <><div ref={element => { surface.current = element; if (element) element.inert = !controls }} className={`${styles.roverSurface} ${!controls ? styles.locked : ''}`} aria-hidden={!controls}
        onKeyDown={event => { if (event.key === 'Escape') { setControls(false); controlButton.current?.focus() } }}>{children}</div>
      <button ref={controlButton} type="button" aria-pressed={controls} onClick={() => setControls(value => !value)}>{controls ? 'Done with 3D controls' : 'Enable 3D controls'}</button>
      <p>Drag and zoom only after enabling controls. Choose Done or press Escape to return to reading. 3D asset: NASA/JPL-Caltech.</p></>}
    </div>
    {reducedMotion && <p>Reduced motion is enabled. The 3D view stays closed until you choose to open it.</p>}
  </section>
}

/** Chapter-local state intentionally follows the existing selection/reveal rules. */
export default function PerseveranceChallenges({ story, onInteract, rover }: { story: MachineStory; onInteract: () => void; rover: ReactNode }) {
  const [selected, setSelected] = useState(0)
  const [found, setFound] = useState<number[]>([])
  const reducedMotion = useStoryReducedMotion()
  const discoveries = useRef<(HTMLElement | null)[]>([])
  const challenge = story.challenges[selected]
  const lesson = challengeLessons[selected]
  const reveal = (index: number) => {
    setFound(values => values.includes(index) ? values : [...values, index])
    onInteract()
  }

  return <section className={styles.chapter} aria-label="Perseverance engineering and discoveries">
    <div className={styles.intro}><span className={styles.eyebrow}>ENGINEERING MAKES SCIENCE POSSIBLE</span>
      <h2>Three challenges. A world to investigate.</h2>
      <p>Choose a challenge, compare the problem with my solution, then open my discovery log. You can explore in any order.</p>
    </div>
    <nav className={styles.choices} aria-label="Choose an engineering challenge">{story.challenges.map((item, index) => <button type="button" key={item.title}
      aria-pressed={selected === index} aria-controls="perseverance-challenge-detail" onClick={() => { setSelected(index); onInteract() }}>
      <span>0{index + 1}</span>{item.title}</button>)}</nav>
    <p className={styles.status} role="status" aria-live="polite">Challenge {selected + 1} of {story.challenges.length}: {challenge.title}</p>
    <div className={styles.challengeGrid}>
      <article id="perseverance-challenge-detail" className={styles.explanation} aria-labelledby="perseverance-challenge-title">
        <h2 id="perseverance-challenge-title">{challenge.title}</h2>
        <div className={styles.problem}><h3>The challenge</h3><p>{challenge.problem}</p></div>
        <div className={styles.solution}><h3>My engineering solution</h3><p>{challenge.solution}</p></div>
        <div className={styles.connection}><h3>Why it matters for science</h3><p>{lesson.connection}</p>
          <button type="button" onClick={() => { reveal(lesson.discovery); discoveries.current[lesson.discovery]?.focus({ preventScroll: true }); discoveries.current[lesson.discovery]?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'auto', block: 'nearest' }) }}>
            Open log: {story.discoveries[lesson.discovery].title}</button>
        </div>
      </article>
      <div className={styles.evidence}><StoryMedia media={lesson.media} motionEnabled={!reducedMotion} />
        <p className={styles.notice}><strong>Look closely</strong> {lesson.notice}</p>
      </div>
    </div>
    <section className={styles.log} aria-labelledby="perseverance-log-title">
      <div className={styles.logHeading}><div><span className={styles.eyebrow}>OPEN MY DISCOVERY LOG</span><h2 id="perseverance-log-title">From engineering to evidence</h2></div>
        <p role="status" aria-live="polite">{found.length} of {story.discoveries.length} discoveries opened</p>
      </div>
      <p className={styles.logHint}>Open any entry. Revealed entries stay open while you explore this chapter.</p>
      <div className={styles.discoveryGrid}>{story.discoveries.map((item, index) => {
        const entry = discoveryLessons[index], opened = found.includes(index)
        return <article key={item.title} ref={element => { discoveries.current[index] = element }} tabIndex={-1} className={styles.discovery} aria-label={item.title}>
          <button type="button" aria-expanded={opened} aria-controls={`discovery-${entry.id}`} onClick={() => reveal(index)}>
            <span>DISCOVERY 0{index + 1}</span><strong>{item.title}</strong><small>{opened ? 'Discovery opened' : 'Tap to reveal this discovery'}</small>
          </button>
          <div id={`discovery-${entry.id}`} hidden={!opened}>
            <p className={styles.finding}>{item.detail}</p>
            {opened && <div className={`${styles.evidence} ${styles.discoveryEvidence}`}><StoryMedia media={entry.media} motionEnabled={!reducedMotion} /></div>}
            {'contextUrl' in entry && <a className={styles.contextLink} href={entry.contextUrl} target="_blank" rel="noreferrer">Read JPL’s scientific explanation ↗</a>}
          </div>
        </article>
      })}</div>
    </section>
    <RoverPreview reducedMotion={reducedMotion}>{rover}</RoverPreview>
  </section>
}
