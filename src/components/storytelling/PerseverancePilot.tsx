import { Component, lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import type { MachineStory } from '../../machineStories'
import { getPilotSteps, type PilotChapter } from '../../features/storytelling/pilot'
import { useScrollStory } from '../../features/storytelling/useScrollStory'
import { useChapterNarration } from '../../features/storytelling/useChapterNarration'
import { useStoryReducedMotion } from '../../features/storytelling/motionPreference'
import { getPerseveranceJourneyMedia } from '../../features/storytelling/journeyMedia'
import StoryMedia from './StoryMedia'
import mediaStyles from './StoryMedia.module.css'
import styles from './PerseverancePilot.module.css'

const RoverScene = lazy(() => import('../RoverScene'))
const LandingSequence = lazy(() => import('../LandingSequence'))

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed ? <p className={styles.sceneMessage} role="status">The 3D view is unavailable. All story steps and scientific sources remain available below.</p> : this.props.children
  }
}

function RoverView({ paused, reducedMotion }: { paused: boolean; reducedMotion: boolean }) {
  const [visible, setVisible] = useState(false)
  const [documentVisible, setDocumentVisible] = useState(true)
  const [interactive, setInteractive] = useState(false)
  const surface = useRef<HTMLDivElement>(null)
  const controlsButton = useRef<HTMLButtonElement>(null)
  const live = !paused && visible && documentVisible

  useEffect(() => {
    const update = () => setDocumentVisible(!document.hidden)
    update()
    document.addEventListener('visibilitychange', update)
    if (typeof IntersectionObserver === 'undefined') setVisible(true)
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '100px' })
    if (surface.current) observer?.observe(surface.current)
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', update) }
  }, [])
  useEffect(() => { if (!live) setInteractive(false) }, [live])
  useEffect(() => { if (surface.current) surface.current.inert = !interactive }, [interactive, live])
  useEffect(() => {
    let ownFullscreen = false
    const update = () => {
      if (document.fullscreenElement) ownFullscreen = !!surface.current?.contains(document.fullscreenElement)
      else if (ownFullscreen) { ownFullscreen = false; setInteractive(false); controlsButton.current?.focus() }
    }
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [])

  const leaveControls = () => { setInteractive(false); controlsButton.current?.focus() }
  return <aside className={styles.roverPanel} aria-label="Perseverance presentation">
    <p className={styles.visualLabel}>YOUR STORYTELLER · PERSEVERANCE</p>
    <div ref={surface} className={`${styles.scene} ${!interactive ? styles.sceneLocked : ''}`} aria-hidden={!interactive}
      onKeyDown={event => { if (event.key === 'Escape' && interactive) { event.stopPropagation(); leaveControls() } }}>
      {live ? <SceneBoundary><Suspense fallback={<p className={styles.sceneMessage} role="status">Loading the NASA rover model…</p>}>
        {/* Public API only. Reduced motion omits automatic hotspot camera flights. */}
        <RoverScene interactive={interactive && !reducedMotion} />
      </Suspense></SceneBoundary> : <p className={styles.sceneMessage}>{paused ? 'Visuals paused. Your story is ready to read.' : 'The NASA rover view appears here while it is on screen.'}</p>}
    </div>
    <button ref={controlsButton} type="button" disabled={!live} aria-pressed={interactive}
      onClick={() => interactive ? leaveControls() : setInteractive(true)}>
      {interactive ? 'Done with 3D controls' : 'Enable 3D controls'}
    </button>
    <p className={styles.visualHint}>{interactive ? 'Drag to rotate. Use the zoom buttons. Choose Done or press Escape to return to page scrolling.' : 'Scroll to read. Enable 3D controls only when you want to rotate or zoom.'}</p>
    <p className={styles.credit}>3D asset: NASA / JPL-Caltech · educational presentation</p>
  </aside>
}

export default function PerseverancePilot({ story, chapter, onEngage }: { story: MachineStory; chapter: PilotChapter; onEngage: () => void }) {
  const reducedMotion = useStoryReducedMotion()
  const steps = useMemo(() => getPilotSteps(story, chapter), [story, chapter])
  const { active, cards, select } = useScrollStory(steps.length, onEngage)
  const voice = useChapterNarration(steps[active].narration)
  const [visualsPaused, setVisualsPaused] = useState(reducedMotion)
  const [landingOpen, setLandingOpen] = useState(false)
  const root = useRef<HTMLElement>(null)
  const readingControls = useRef<HTMLElement>(null)
  const prefix = `perseverance-${chapter}`

  useEffect(() => { if (!steps[active].landing) setLandingOpen(false) }, [active, steps])
  useEffect(() => { if (reducedMotion) { setVisualsPaused(true); setLandingOpen(false) } }, [reducedMotion])
  useEffect(() => {
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
      root.current?.style.setProperty('--reading-offset', `${(readingControls.current?.offsetHeight || 80) + 24}px`)
    })
    if (readingControls.current) observer?.observe(readingControls.current)
    return () => observer?.disconnect()
  }, [])
  useEffect(() => {
    const hide = () => { if (document.hidden) setLandingOpen(false) }
    document.addEventListener('visibilitychange', hide)
    return () => document.removeEventListener('visibilitychange', hide)
  }, [])

  const stepButtons = (announce = false) => <>
    <button type="button" disabled={active === 0} aria-label="Previous story step" onClick={() => select(active - 1)}><ArrowLeft size={17} aria-hidden="true" />Previous</button>
    <p role={announce ? 'status' : undefined} aria-live={announce ? 'polite' : undefined} aria-atomic={announce ? true : undefined}><span>STEP {active + 1} OF {steps.length}</span><b>{steps[active].title}</b></p>
    <button type="button" disabled={active === steps.length - 1} aria-label="Next story step" onClick={() => select(active + 1)}>Next<ArrowRight size={17} aria-hidden="true" /></button>
  </>

  return <section ref={root} className={styles.pilot} aria-label={`${chapter === 'meet' ? 'Meet Perseverance' : 'Perseverance’s journey'} scroll story`}>
    <div className={styles.introduction}>
      <div><span className={styles.eyebrow}>YOU SET THE PACE</span><h2>Scroll to follow my story.</h2><p>Read the cards as you scroll, or choose a step with the controls. Use Next chapter below when you are ready to continue.</p></div>
      <div className={styles.preferences}>
        <button type="button" disabled={!voice.available} aria-pressed={voice.enabled} onClick={voice.toggle}>
          {voice.enabled ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}{voice.enabled ? 'Turn voice off' : 'Hear this story'}
        </button>
        {voice.enabled && <button type="button" onClick={voice.replay}><RotateCcw size={16} aria-hidden="true" />Read step again</button>}
        <button type="button" aria-pressed={visualsPaused} onClick={() => { setVisualsPaused(value => !value); setLandingOpen(false) }}>
          {visualsPaused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}{visualsPaused ? 'Resume visuals' : 'Pause visuals'}
        </button>
        <p role="status">{!voice.available ? 'Optional voice is unavailable in this browser. Every step is available as text.' : voice.status === 'error' ? 'Voice could not play. Try again, or keep reading the text.' : voice.enabled ? 'Voice on · narration follows the active step.' : 'Voice is optional. Turn it on to hear the active step.'}</p>
        <p>{chapter === 'journey' ? `${reducedMotion ? 'Reduced motion: visuals start paused. ' : ''}Mission stills follow your reading. Pause visuals stops transitions and the optional 3D reconstruction.` : reducedMotion ? 'Reduced motion: visuals start paused. Resume only if you want to view 3D.' : 'Pausing visuals stops the 3D views. Resuming restores the starting camera.'}</p>
      </div>
    </div>
    <nav ref={readingControls} className={styles.readingControls} aria-label="Story step navigation">{stepButtons(true)}</nav>
    <nav className={styles.stepIndex} aria-label="Choose a story step"><ol>{steps.map((step, index) => <li key={step.id}>
      <button type="button" aria-label={`Step ${index + 1}: ${step.title}`} aria-current={active === index ? 'step' : undefined}
        aria-controls={`${prefix}-${step.id}`} onClick={() => select(index)}>{String(index + 1).padStart(2, '0')}<span>{step.title}</span></button>
    </li>)}</ol></nav>
    <div className={styles.layout}>
      {chapter === 'journey' ? <aside className={mediaStyles.panel} aria-label="Journey mission imagery">
        <StoryMedia media={getPerseveranceJourneyMedia(steps[active].id)} motionEnabled={!visualsPaused && !reducedMotion}
          fallback={<RoverView paused={visualsPaused} reducedMotion={reducedMotion} />} />
      </aside> : <RoverView paused={visualsPaused} reducedMotion={reducedMotion} />}
      <div className={styles.steps}>{steps.map((step, index) => <article key={step.id} id={`${prefix}-${step.id}`} ref={element => { cards.current[index] = element }} tabIndex={-1}
        aria-labelledby={`${prefix}-${step.id}-title`} className={`${styles.card} ${active === index ? styles.activeCard : ''}`}>
        <div className={styles.cardMeta}><span>{step.label}</span><span>{active === index ? 'NOW READING' : `STEP ${index + 1}`}</span></div>
        <h3 id={`${prefix}-${step.id}-title`}>{step.title}</h3>
        {step.copy && <p>{step.copy}</p>}
        {!!step.facts.length && <dl>{step.facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>}
        {step.landing && <div className={styles.landingChoice}>
          <p>Optional educational reconstruction · not NASA footage. It plays only when you choose, without advancing the story.</p>
          <button type="button" disabled={visualsPaused} aria-expanded={landingOpen && active === index} aria-controls={`${prefix}-landing`}
            onClick={() => { select(index); setLandingOpen(value => !value) }}>
            {landingOpen && active === index ? 'Stop reconstruction' : 'Play landing reconstruction'}
          </button>
          {visualsPaused && <p>Resume visuals above to play the animation.</p>}
          <div id={`${prefix}-landing`} className={styles.landingSlot} hidden={!(landingOpen && active === index && !visualsPaused)}>
            {landingOpen && active === index && !visualsPaused && <SceneBoundary><Suspense fallback={<p role="status">Preparing the reconstruction…</p>}><LandingSequence onProgressComplete={onEngage} /></Suspense></SceneBoundary>}
          </div>
        </div>}
      </article>)}</div>
    </div>
    <nav className={styles.bottomControls} aria-label="Story steps at end of chapter">{stepButtons()}</nav>
    <p className={styles.endNote}>Step selection is temporary. Next chapter saves your existing mission progress on this device.</p>
  </section>
}
