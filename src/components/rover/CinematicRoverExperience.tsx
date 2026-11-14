import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowRight, Award, BookOpen, Check, ChevronRight, Compass, ExternalLink, Layers, RotateCcw, Scan, X } from 'lucide-react'
import { useProgress } from '../../store'
import { getRoverExperience, narrativeChapters, type NarrativeChapter } from './roverExperience'
import { DustChallenge, NavigationChallenge } from './RoverChallenge'
import NarrationDock from './NarrationDock'
import './roverExperience.css'

const CinematicScene = lazy(() => import('./CinematicScene'))

export default function CinematicRoverExperience({ storyId, initialChapter = 0 }: { storyId: string; initialChapter?: number }) {
  const experience = getRoverExperience(storyId)
  if (!experience) return <div className="unknown-mission"><h1>Mission not found</h1><Link to="/hardware">Meet the machines</Link></div>
  return <RoverDocumentary key={storyId} experience={experience} initialChapter={initialChapter} />
}

function RoverDocumentary({ experience, initialChapter }: { experience: NonNullable<ReturnType<typeof getRoverExperience>>; initialChapter: number }) {
  const { story } = experience
  const root = useRef<HTMLDivElement>(null), narrative = useRef<HTMLDivElement>(null), inspectButton = useRef<HTMLButtonElement>(null), dialog = useRef<HTMLDivElement>(null)
  const chapters = useRef<(HTMLElement | null)[]>([])
  const systemReduced = useReducedMotion()
  const reduced = !!systemReduced || (typeof localStorage!=='undefined'&&localStorage.getItem('auroralys-calm')==='true')
  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end end'] })
  const [active, setActive] = useState(initialChapter), [inspect, setInspect] = useState(false), [reset, setReset] = useState(0)
  const [info, setInfo] = useState('Select a labeled component on the rover. You can also use the component buttons below.')
  const [unavailable, setUnavailable] = useState(false)
  const [photoUnavailable,setPhotoUnavailable]=useState(false)
  const [lowDetail, setLowDetail] = useState(() => (typeof localStorage!=='undefined'&&localStorage.getItem('auroralys-low-detail') === 'true') || (typeof matchMedia!=='undefined'&&matchMedia('(max-width: 700px)').matches))
  const [milestone, setMilestone] = useState(0), [discovery, setDiscovery] = useState(0)
  const progress = useProgress(s => s.roverJourneys?.[story.id])
  const visit = useProgress(s => s.visitRoverChapter), solve = useProgress(s => s.solveRoverChallenge), finish = useProgress(s => s.finishRoverJourney)
  const chapter = narrativeChapters[active]
  const visited = progress?.visited || []
  const ready = narrativeChapters.every(c => visited.includes(c.id)) && !!progress?.challengeComplete
  const finished = !!progress?.completedAt
  const missing = narrativeChapters.findIndex(c => !visited.includes(c.id))
  const goTo = (index: number) => chapters.current[index]?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  const notifyUnavailable = useCallback(() => setUnavailable(true), [])
  const solveChallenge = useCallback(() => solve(story.id), [solve, story.id])

  useLayoutEffect(() => {
    if (initialChapter) chapters.current[initialChapter]?.scrollIntoView({ behavior: 'auto' })
    else window.scrollTo({ top: 0, behavior: 'auto' })
  }, [initialChapter])
  useEffect(() => {
    let observer:IntersectionObserver
    const connect=()=>{
      observer?.disconnect()
      const margin=Math.round(window.innerHeight*.35)
      observer=new IntersectionObserver(entries=>{
        const visible=entries.find(e=>e.isIntersecting)
        if(visible)setActive(Number((visible.target as HTMLElement).dataset.chapter))
      },{rootMargin:`-${margin}px 0px -${margin}px 0px`,threshold:0})
      chapters.current.forEach(section=>section&&observer.observe(section))
    }
    connect();window.addEventListener('resize',connect)
    return ()=>{observer.disconnect();window.removeEventListener('resize',connect)}
  }, [])
  useEffect(() => {
    if (inspect) return
    const timer = setTimeout(() => { if (!document.hidden) visit(story.id, chapter.id) }, 700)
    return () => clearTimeout(timer)
  }, [active, chapter.id, inspect, story.id, visit])
  useEffect(() => {
    if (!inspect) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'; narrative.current?.setAttribute('inert', '')
    dialog.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const keys=(e:KeyboardEvent)=>{
      if(e.key==='Escape'){e.preventDefault();setInspect(false)}
      if(e.key==='Tab'){
        const buttons=Array.from(document.querySelectorAll<HTMLButtonElement>('.cinema-inspector button, .persistent-surface .hotspot-html button')).filter(b=>!b.disabled)
        const first=buttons[0],last=buttons[buttons.length-1]
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
      }
    }
    document.addEventListener('keydown',keys)
    return () => { document.removeEventListener('keydown',keys);document.body.style.overflow = original; narrative.current?.removeAttribute('inert'); inspectButton.current?.focus() }
  }, [inspect])
  const selectComponent = (index: number) => {
    const lunar = story.planet === 'moon'
    const descriptions = lunar ? [
      'Wire-mesh wheels — Airless metal-mesh tires gripped the lunar regolith.',
      'High-gain antenna — A directional antenna linked surface television and communications with Earth.',
      'Navigation console — Gyro and wheel measurements helped the crew find the lunar module.',
    ] : [
      'Mastcam-Z — Twin zoom cameras record colour panoramas and stereoscopic views.',
      'SuperCam — Remote-sensing instruments study rock chemistry and mineralogy.',
      'Robotic arm — The arm places the drill, PIXL and SHERLOC against selected rocks.',
    ]
    setInfo(descriptions[index]); useProgress.getState().inspectInstrument((lunar?['mesh-wheels','high-gain','navigation']:['mastcam-z','supercam','robotic-arm'])[index])
  }

  return <div ref={root} className={`rover-documentary ${story.planet} ${inspect ? 'inspecting' : ''} ${reduced ? 'reduced' : ''}`} style={{ '--mission-accent': experience.accent } as React.CSSProperties}>
    <a className="cinema-skip" href="#rover-chapter-3">Skip to the interactive challenge</a>
    <div className="persistent-surface" aria-label={`${story.name} on an illustrative planetary landscape`}>
      <Suspense fallback={<div className="cinema-scene-fallback">Preparing your planetary surface…</div>}><CinematicScene experience={experience} progress={scrollYProgress} inspect={inspect} reset={reset} reduced={reduced} lowDetail={lowDetail} onInfo={setInfo} onUnavailable={notifyUnavailable} /></Suspense>
    </div>
    <div className="cinema-vignette" aria-hidden="true" />
    <header className="cinema-header"><Link to="/hardware" aria-label="Back to the hardware lab"><ArrowLeft size={17} /><span>HARDWARE LAB</span></Link><span className="cinema-mission-name">{story.missionLabel} <i /> {experience.displayName}</span><button ref={inspectButton} onClick={() => setInspect(true)} disabled={unavailable}><Scan size={17} /> Explore in 3D</button></header>
    {!inspect && <><nav className="cinema-chapter-nav" aria-label="Story chapters">{narrativeChapters.map((c, i) => <button key={c.id} className={active === i ? 'active' : ''} onClick={() => goTo(i)} aria-label={`Chapter ${i + 1}: ${c.title}`} aria-current={active === i ? 'step' : undefined}><span>{visited.includes(c.id) ? <Check size={11} /> : c.label}</span><i>{c.title}</i></button>)}</nav><div className="cinema-chapter-counter" aria-live="polite">{chapter.label}<span> / 05</span></div></>}
    <div ref={narrative} className="cinema-narrative" aria-hidden={inspect}>
      {narrativeChapters.map((c, index) => <section key={c.id} ref={element => { chapters.current[index] = element }} id={`rover-chapter-${index}`} data-chapter={index} className={`cinema-chapter chapter-${c.id}`} aria-labelledby={`heading-${c.id}`}>
        <motion.div className="cinema-copy" initial={false} animate={{ opacity: active === index ? 1 : .32, y: reduced || active === index ? 0 : 20 }} transition={{ duration: reduced ? 0 : .5 }}>
          <span className="cinema-kicker">{c.label} / {c.title.toUpperCase()} <i /> {index === 0 ? experience.place : story.missionLabel.toUpperCase()}</span>
          {c.id === 'meet' && <><h1 id={`heading-${c.id}`}>I’m {experience.displayName}<span>.</span></h1><p className="cinema-lead">{story.heroLine}</p><dl className="cinema-facts"><div><dt>MISSION</dt><dd>{story.missionLabel}</dd></div><div><dt>DESTINATION</dt><dd>{story.profile.find(p => p.label === 'MY HOME')?.value.split(' · ')[0] || experience.place}</dd></div></dl><button className="cinema-next" onClick={() => goTo(1)}>Scroll to explore <ArrowDown size={17} /></button></>}
          {c.id === 'journey' && <><h2 id={`heading-${c.id}`}>From Earth.<br />Into history.</h2><div className="cinema-milestones" role="group" aria-label="Mission milestones">{story.journey.map((event, i) => <button key={event.label} aria-pressed={milestone === i} onClick={() => setMilestone(i)}><span>{String(i + 1).padStart(2, '0')}</span>{event.label}</button>)}</div><AnimatePresence mode="wait"><motion.div key={milestone} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .2 }}><span className="cinema-date">{story.journey[milestone].date}</span><h3>{story.journey[milestone].title}</h3><p>{story.journey[milestone].copy}</p></motion.div></AnimatePresence>{experience.photograph && <details className="cinema-photo"><summary>See the mission photograph</summary><img hidden={photoUnavailable} onError={()=>setPhotoUnavailable(true)} src={experience.photograph} alt={`${story.missionLabel} launch, from NASA mission records`} loading="lazy" /><a href={experience.photograph} target="_blank" rel="noreferrer">{photoUnavailable?'Photo unavailable here — open NASA image':'NASA image'} <ExternalLink size={12} /></a></details>}</>}
          {c.id === 'discoveries' && <><h2 id={`heading-${c.id}`}>Look closer.<br />Think bigger.</h2><div className="cinema-discoveries" role="group" aria-label="Discoveries">{story.discoveries.map((d, i) => <button key={d.title} aria-pressed={discovery === i} onClick={() => setDiscovery(i)}><span>0{i + 1}</span>{d.title}</button>)}</div><p className="discovery-detail" aria-live="polite">{story.discoveries[discovery].detail}</p><button className="cinema-text-button" onClick={() => setInspect(true)}>Meet the instruments <Scan size={16} /></button></>}
          {c.id === 'challenge' && <><h2 id={`heading-${c.id}`}>A little help.<br />A big discovery.</h2><p className="historical-context">{story.challenges[experience.challenge==='dust'?1:0].problem} {story.challenges[experience.challenge==='dust'?1:0].solution}</p>{experience.challenge === 'dust' ? <DustChallenge completed={!!progress?.challengeComplete} onComplete={solveChallenge} /> : <NavigationChallenge completed={!!progress?.challengeComplete} onComplete={solveChallenge} />}</>}
          {c.id === 'legacy' && <><h2 id={`heading-${c.id}`}>{story.planet === 'moon' ? <>The tracks stay.<br />The story travels.</> : <>The next question<br />is still out there.</>}</h2><p className="cinema-lead">{story.legacy[story.legacy.length - 1].copy}</p><div className={`cinema-achievement ${finished ? 'earned' : ''}`}><div className="mission-badge" aria-hidden="true"><i /><Award size={42} /></div><div><span>{finished ? 'MISSION EXPLORER · EARNED' : 'YOUR NEXT ACHIEVEMENT'}</span><h3>Mission Explorer — {experience.displayName}</h3><p>{finished ? 'You followed the journey, explored every chapter and completed the field challenge.' : 'Explore all five chapters and complete the field challenge to leave your own mark.'}</p></div></div>{finished ? <div className="cinema-finale-actions"><Link to="/dashboard">See my achievement <Award size={16} /></Link><Link to={`/story/${story.id}/5?view=reader`}>Try the mission quiz <ArrowRight size={16} /></Link></div> : <><button className="cinema-complete" disabled={!ready} onClick={() => finish(story.id)}>Complete my journey <Check size={17} /></button>{!ready && <button className="cinema-unfinished" onClick={() => goTo(!progress?.challengeComplete ? 3 : Math.max(0, missing))}>{!progress?.challengeComplete ? 'Complete the field challenge' : `Visit ${narrativeChapters[Math.max(0, missing)].title} to finish your journey`} <ChevronRight size={14} /></button>}</>}<details className="cinema-sources"><summary>Mission sources & model credits</summary><p>{experience.assetLabel}. The landscape is an illustrative environment, not a surveyed landing-site reconstruction.</p>{story.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}<ExternalLink size={12} /></a>)}</details></>}
        </motion.div>
      </section>)}
    </div>
    {!inspect && <div className="cinema-bottom-bar"><span>{experience.assetLabel}</span><Link to={`?view=reader`}><BookOpen size={14} /> Chapter reader</Link><NarrationDock key={chapter.id} story={story} chapter={chapter.id} /></div>}
    {inspect && <div ref={dialog} className="cinema-inspector" role="dialog" aria-modal="true" aria-label={`Explore ${story.name} in 3D`}><div className="inspector-toolbar"><button onClick={() => setInspect(false)}><X size={17} /> Back to story</button><button onClick={() => setReset(n => n + 1)}><RotateCcw size={16} /> Reset camera</button><button aria-pressed={lowDetail} onClick={() => setLowDetail(value => { localStorage.setItem('auroralys-low-detail', String(!value)); return !value })}><Layers size={16} />{lowDetail ? 'Low detail' : 'Full detail'}</button></div><div className="inspector-note"><span><Compass size={15} /> DRAG TO ROTATE · PINCH OR SCROLL TO ZOOM</span><p aria-live="polite">{info}</p><div className="inspector-components" role="group" aria-label="Inspect rover components">{(story.planet === 'moon' ? ['Wire-mesh wheels', 'High-gain antenna', 'Navigation console'] : ['Mastcam-Z', 'SuperCam', 'Robotic arm']).map((label, i) => <button key={label} onClick={() => selectComponent(i)}>{label}</button>)}</div><small>{experience.assetLabel}</small></div></div>}
  </div>
}
