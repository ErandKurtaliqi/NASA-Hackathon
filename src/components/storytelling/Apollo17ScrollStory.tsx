import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { chapterMeta, type MachineStory } from '../../machineStories'
import { getApollo17StorySteps } from '../../features/storytelling/apollo17StorySteps'
import { apollo17StoryMedia, type Apollo17MediaId } from '../../features/storytelling/apollo17StoryMedia'
import { useScrollStory } from '../../features/storytelling/useScrollStory'
import { useStoryReducedMotion } from '../../features/storytelling/motionPreference'
import { createChapterScrollBoundary } from '../../features/storytelling/chapterScrollBoundary'
import { stopRecordedNarration } from '../../features/storytelling/recordedNarration'
import RoverStoryLayout from './RoverStoryLayout'
import StoryMedia from './StoryMedia'
import ApolloProgressSaveStatus from './ApolloProgressSaveStatus'
import Apollo17BrowserVoice from './Apollo17BrowserVoice'
import styles from './Apollo15ScrollStory.module.css'
import local from './Apollo17ScrollStory.module.css'

export default function Apollo17ScrollStory({ story, index, unlockedIndex, isDone, canComplete, engaged, onEngage, onNext, renderQuiz }: {
  story: MachineStory; index: number; unlockedIndex: number; isDone: (id: string) => boolean | undefined
  canComplete: boolean; engaged: boolean; onEngage: () => void; onNext: () => void
  renderQuiz: (narration: (question: number) => ReactNode, reducedMotion: boolean) => ReactNode
}) {
  const steps = useMemo(() => getApollo17StorySteps(story, index), [story, index])
  const { active, cards, select } = useScrollStory(steps.length, onEngage)
  const reduced = useStoryReducedMotion(), navigate = useNavigate()
  const [inlineEvidence, setInlineEvidence] = useState(false), [autoAdvance, setAutoAdvance] = useState(true)
  const [profile, setProfile] = useState(0), [found, setFound] = useState<number[]>([])
  const boundary = useRef<HTMLDivElement>(null), heading = useRef<HTMLHeadingElement>(null)
  const current = useRef({ active, canComplete, onNext, autoAdvance })
  current.current = { active, canComplete, onNext, autoAdvance }
  const step = steps[active]
  useEffect(() => {
    if (typeof document === 'undefined' || !document.activeElement?.closest('[role="alert"]')) {
      heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
    const query = window.matchMedia?.('(max-width: 700px)')
    if (!query) return
    const update = () => setInlineEvidence(query.matches)
    update(); query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (index === 4) return
    return createChapterScrollBoundary(window, () => boundary.current,
      () => current.current.autoAdvance && current.current.canComplete && current.current.active === steps.length - 1,
      () => { window.speechSynthesis?.cancel(); current.current.onNext() })
  }, [index, steps.length])
  const evidence = (id?: Apollo17MediaId) => <StoryMedia media={id ? apollo17StoryMedia[id] : undefined} motionEnabled={!reduced}
    fallback={<div className={local.sourceCard}><h3>Read the mission evidence</h3><p>No direct photograph is selected for this step. The source below supports the mission account; no illustration is presented as historical evidence.</p><a href={story.sources[0].url} target="_blank" rel="noreferrer">NASA mission details ↗</a></div>} />
  const stop = () => { stopRecordedNarration(); window.speechSynthesis?.cancel() }
  return <div className={`${styles.page} ${local.page}`} data-story-pilot="apollo-17">
    <header className={styles.header}>
      <Link to="/explore/moon">← Back to Moon missions</Link><Link to="/hardware">Hardware Lab</Link>
      <p>MOON ROVER · LRV-3 · 1972</p><h1 id={`apollo17-chapter-${index + 1}`} ref={heading} tabIndex={-1}>Apollo 17 <span>{chapterMeta[index].title}</span></h1><p>{story.heroLine}</p>
    </header>
    <nav className={styles.chapters} aria-label="Story chapters">{chapterMeta.map((item, i) => i > unlockedIndex
      ? <span key={item.id} aria-label={`${item.title}, locked`}>{i + 1}. {item.title}</span>
      : <Link key={item.id} aria-current={i === index ? 'step' : undefined} to={`/story/${story.id}/${i + 1}`}>{isDone(item.id) ? '✓ ' : ''}{i + 1}. {item.title}</Link>)}</nav>
    <ApolloProgressSaveStatus story={story} />
    <RoverStoryLayout rover={<><p className={styles.eyebrow}>YOUR STORYTELLER</p><h2>{story.name}</h2>{evidence('vehicle')}<p className={styles.roverTag}>LRV-3 · Taurus-Littrow</p><p>Read and explore without WebGL. Browser voice is optional.</p></>}
      evidence={!inlineEvidence && <><p className={styles.eyebrow}>NASA EVIDENCE</p>{evidence(step?.media ?? (index === 4 ? 'vehicle' : undefined))}</>}>
      {index < 4 ? <>
        <div className={styles.readingControls}>
          <p role="status" aria-atomic="true">Segment {active + 1} of {steps.length}: {step.title}</p>
          <div className={styles.controls}><button type="button" disabled={active === 0} onClick={() => select(active - 1)}>Previous segment</button><button type="button" disabled={active === steps.length - 1} onClick={() => select(active + 1)}>Next segment</button></div>
          <Apollo17BrowserVoice text={`${step.title}. ${step.text} ${step.detail ?? ''}`} />
        </div>
        {steps.map((item, i) => <article key={item.id} id={`apollo17-step-${index}-${i}`} tabIndex={-1} ref={element => { cards.current[i] = element }}
          aria-labelledby={`apollo17-title-${index}-${i}`} className={`${styles.card} ${active === i ? styles.active : ''}`}>
          <small>{i + 1} / {steps.length}{item.date ? ` · ${item.date}` : ''}</small><h2 id={`apollo17-title-${index}-${i}`}>{item.title}</h2>
          {item.date === 'FUTURE' && <p className={styles.scienceNote}>Engineering lessons for future exploration, not a promised mission outcome.</p>}
          <p>{item.text}</p>{item.detail && <div className={styles.scienceNote}><b>Engineering solution</b><p>{item.detail}</p></div>}
          {inlineEvidence && evidence(item.media)}
        </article>)}
        <section className={styles.activities} aria-label="Optional mission activities"><h2>Explore the mission</h2><p>Optional exploration. You can continue without clicking every item.</p>
          {index === 0 && <div className="profile-grid">{story.profile.map((item, i) => <button type="button" key={item.label} className={profile === i ? 'active' : ''} aria-pressed={profile === i} onClick={() => { setProfile(i); onEngage() }}><small>{item.label}</small><b>{item.value}</b></button>)}</div>}
          {index === 1 && <div className={styles.controls}>{story.journey.map((item, i) => <button type="button" key={item.label} aria-current={active === i ? 'step' : undefined} onClick={() => select(i)}>{item.label}</button>)}</div>}
          {index === 2 && <><div className={styles.controls}>{story.challenges.map((item, i) => <button type="button" key={item.title} aria-pressed={active === i} onClick={() => select(i)}>{item.title}</button>)}</div><div className="discovery-bank"><span>OPEN MY DISCOVERY LOG</span>{story.discoveries.map((item, i) => <button type="button" key={item.title} aria-expanded={found.includes(i)} onClick={() => { setFound(values => values.includes(i) ? values : [...values, i]); onEngage() }}><span><b>{item.title}</b><small>{found.includes(i) ? item.detail : 'Tap to reveal this discovery'}</small></span></button>)}</div></>}
          {index === 3 && <div className={styles.controls}>{story.legacy.map((item, i) => <button type="button" key={i} aria-pressed={active === i} onClick={() => select(i)}>{item.year}: {item.title}</button>)}</div>}
        </section>
      </> : renderQuiz(question => <Apollo17BrowserVoice key={question} text={story.quiz[question].question} />, reduced)}
    </RoverStoryLayout>
    <section className={styles.footer} aria-label="Chapter navigation">
      {index < 4 && <><label><input type="checkbox" checked={autoAdvance} onChange={event => setAutoAdvance(event.target.checked)} /> Continue to the next chapter when I scroll past the end</label><div ref={boundary} id="apollo17-chapter-boundary" className={styles.boundary}><p>End of {chapterMeta[index].title}. Continue scrolling or choose Next Chapter.</p></div></>}
      <div className={styles.chapterActions}><button type="button" disabled={index === 0} onClick={() => { stop(); navigate(`/story/${story.id}/${index}`) }}>PREVIOUS CHAPTER</button><span>{engaged ? 'INTERACTION COMPLETE' : 'EXPLORE OR CONTINUE'}</span><button type="button" disabled={!canComplete} onClick={() => { stop(); onNext() }}>{index === 4 ? 'COMPLETE STORY' : 'NEXT CHAPTER'}</button></div>
    </section>
    <div className={styles.sources}>{story.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}<a href={apollo17StoryMedia.vehicle.usagePolicyUrl} target="_blank" rel="noreferrer">NASA media usage guidelines ↗</a></div>
  </div>
}
