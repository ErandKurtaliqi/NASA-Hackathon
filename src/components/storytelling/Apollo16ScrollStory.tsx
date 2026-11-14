import MissionSceneCredits from './MissionSceneCredits'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { chapterMeta, type MachineStory } from '../../machineStories'
import { apollo16ChapterRecordings, apollo16CaptionTiming } from '../../features/storytelling/apollo16Recordings'
import { apollo16StoryMedia, apollo16SegmentMedia, type Apollo16MediaId } from '../../features/storytelling/apollo16StoryMedia'
import { useScrollStory } from '../../features/storytelling/useScrollStory'
import { useStoryReducedMotion } from '../../features/storytelling/motionPreference'
import { createChapterScrollBoundary } from '../../features/storytelling/chapterScrollBoundary'
import { stopRecordedNarration } from '../../features/storytelling/recordedNarration'
import ApolloProgressSaveStatus from './ApolloProgressSaveStatus'
import RoverStoryLayout from './CinematicStoryLayout'
import StoryRecording from './ReviewStoryRecording'
import StoryEnvironment from './StoryEnvironment'
import StoryHardware from './StoryHardware'
import { moonStoryPresentation, shortChapterLabels } from '../../features/storytelling/storyPresentation'
import StoryMedia from './StoryMedia'
import Apollo16Quiz from './Apollo16Quiz'
import styles from './Apollo15ScrollStory.module.css'

export default function Apollo16ScrollStory({ story, index, unlockedIndex, isDone, canComplete, engaged, onEngage, onQuizRetry, onNext }: {
  story: MachineStory; index: number; unlockedIndex: number; isDone: (id: string) => boolean | undefined
  canComplete: boolean; engaged: boolean; onEngage: () => void; onQuizRetry: () => void; onNext: () => void
}) {
  const tracks = apollo16ChapterRecordings[index] ?? []
  const { active, cards, select } = useScrollStory(tracks.length, onEngage)
  const reduced = useStoryReducedMotion(), navigate = useNavigate()
  const [sound, setSound] = useState(true), [autoAdvance, setAutoAdvance] = useState(false), [inlineEvidence, setInlineEvidence] = useState(false)
  const [profile, setProfile] = useState(0), [control, setControl] = useState(''), [found, setFound] = useState<number[]>([])
  const boundary = useRef<HTMLDivElement>(null), heading = useRef<HTMLHeadingElement>(null)
  const entrance = useRef<HTMLDivElement>(null)
  const current = useRef({ active, canComplete, onNext, autoAdvance })
  current.current = { active, canComplete, onNext, autoAdvance }
  const mediaId = apollo16SegmentMedia[index]?.[active] ?? 'rover'
  const media = apollo16StoryMedia[mediaId]
  useEffect(() => {
    if (typeof document === 'undefined' || !document.activeElement?.closest('[role="alert"]')) {
      heading.current?.focus({ preventScroll: true }); entrance.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
    const query = window.matchMedia?.('(max-width: 700px)')
    if (!query) return
    const update = () => setInlineEvidence(query.matches)
    update(); query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (index === 4) return
    return createChapterScrollBoundary(window, () => boundary.current, () => {
      const state = current.current
      return state.autoAdvance && state.active === tracks.length - 1 && state.canComplete
    }, () => current.current.onNext())
  }, [index, tracks.length])
  const evidence = (id: Apollo16MediaId) => <StoryMedia media={apollo16StoryMedia[id]} motionEnabled={!reduced} />
  const leave = (chapter: number) => { stopRecordedNarration(); navigate(`/story/${story.id}/${chapter}`) }
  const controls = [
    ['Push forward', 'Concept: command forward motion. An electric motor at each wheel provided traction.'],
    ['Pull back', 'Concept: reduce speed and brake. Real handling depended on terrain and loading.'],
    ['Steer left or right', 'Concept: turn the hand controller. Front and rear steering systems could operate independently.'],
  ]
  const renderTrack = (track: typeof tracks[number], i: number) => <article key={track.audio} ref={element => { cards.current[i] = element }} tabIndex={-1} aria-labelledby={`apollo16-segment-${i}`} className={`${styles.card} ${active === i ? styles.active : ''}`}>
          <small>0{i + 1} / {chapterMeta[index].title}</small><h2 id={`apollo16-segment-${i}`}>{track.title}</h2>
          <small>Original supplied script · audio transcript and caption timing await listening review</small><p>{track.text}</p>
          <aside className={styles.scienceNote} aria-label="Evidence and editorial note"><b>Evidence & editorial note</b><p>{track.note.text}</p><a href={track.note.source.url} target="_blank" rel="noreferrer">{track.note.source.label} ↗</a></aside>
          {index === 1 && <p className={styles.scienceNote}>{story.journey[i].copy}</p>}
          {inlineEvidence && i > 0 && evidence(apollo16SegmentMedia[index][i])}
        </article>
  const readingControls = index < 4 ? <div className={styles.readingControls}>
          <p role="status" aria-atomic="true">Segment {active + 1} of {tracks.length}: {tracks[active].title}</p>
          <div className={styles.controls}><button type="button" disabled={active === 0} onClick={() => select(active - 1)}>Previous segment</button><button type="button" disabled={active === tracks.length - 1} onClick={() => select(active + 1)}>Next segment</button></div>
          <nav className={styles.segmentLinks} aria-label="Story segments">{tracks.map((track, i) => <button type="button" key={track.audio} aria-current={active === i ? 'step' : undefined} aria-label={`${i + 1}. ${track.title}`} title={track.title} onClick={() => select(i)}>{i + 1}</button>)}</nav>
          <StoryRecording key={tracks[active].audio} src={tracks[active].audio} label={`Original narration: ${tracks[active].title}`} sound={sound} onSound={setSound} timing={apollo16CaptionTiming[tracks[active].audio]} />
        </div> : undefined
  const introduction = <div className={styles.missionIntro}>
    <p>MOON ROVER · LRV-2 · 1972</p><h1 id={`apollo16-chapter-${index + 1}`} ref={heading} tabIndex={-1}>Apollo 16 <span className={styles.chapterHeading}>{chapterMeta[index].title}</span></h1>
    <p className={styles.missionSubtitle}>{moonStoryPresentation['apollo-16-rover'].subtitle}</p><p>{story.heroLine}</p>
    <nav className={styles.chapters} aria-label="Story chapters">{chapterMeta.map((chapter, i) => i > unlockedIndex
      ? <span key={chapter.id} aria-label={`${chapter.title}, locked`}>{i + 1}. {shortChapterLabels[i]}</span>
      : <Link key={chapter.id} to={`/story/${story.id}/${i + 1}`} aria-label={`${i + 1}. ${chapter.title}`} aria-current={index === i ? 'step' : undefined}>{isDone(chapter.id) ? '✓ ' : ''}{i + 1}. {shortChapterLabels[i]}</Link>)}</nav>
  </div>
  return <div ref={entrance} className={styles.page} data-story-pilot="apollo-16">
    <header className={styles.header}>
      <Link to="/explore/moon"><span className={styles.backIcon} aria-hidden="true">←</span>Back to Moon missions</Link><Link to="/hardware">Hardware Lab</Link>
      <a href="#apollo16-sources">Mission sources <span aria-hidden="true">↘</span></a>
    </header>
    <StoryEnvironment world="moon" idPrefix="apollo16-terrain" />
    <ApolloProgressSaveStatus story={story} />
    <RoverStoryLayout sceneNote={<MissionSceneCredits idPrefix={`apollo16-terrain`} />} opening={index < 4 ? renderTrack(tracks[0], 0) : undefined} controls={readingControls} intro={introduction} rover={<StoryHardware name={story.name} presentation={moonStoryPresentation['apollo-16-rover']} tagline={story.heroLine} />}
      evidence={<><p className={styles.eyebrow}>NASA EVIDENCE · {index < 4 ? `SEGMENT ${active + 1}` : 'MISSION RECORD'}</p><StoryMedia media={media} motionEnabled={!reduced} /></>}>
      {index < 4 ? <>
        {tracks.slice(1).map((track, i) => renderTrack(track, i + 1))}
        <section className={styles.activities} aria-label="Optional mission activities"><h2>Explore the mission</h2><p>These activities are optional. You may continue after reading.</p>
          {index === 0 && <div className="profile-grid">{story.profile.map((item, i) => <button type="button" key={item.label} aria-pressed={profile === i} onClick={() => { setProfile(i); onEngage() }}><small>{item.label}</small><b>{item.value}</b></button>)}</div>}
          {index === 1 && <><h3>Explore the hand controller</h3><p>Conceptual learning activity; no vehicle is being simulated.</p><div className={styles.controls}>{controls.map(([label, result]) => <button type="button" key={label} aria-pressed={control === result} onClick={() => { setControl(result); onEngage() }}>{label}</button>)}</div><p role="status" aria-atomic="true">{control || 'Choose a control to learn what it commanded.'}</p></>}
          {index === 2 && <div className="discovery-bank">{story.discoveries.map((item, i) => <button type="button" key={item.title} aria-expanded={found.includes(i)} onClick={() => { setFound(values => values.includes(i) ? values : [...values, i]); onEngage() }}><span><b>{item.title}</b><small>{found.includes(i) ? item.detail : 'Reveal this discovery'}</small></span></button>)}</div>}
          {index === 3 && story.legacy.map(item => <details key={item.title} onToggle={event => { if (event.currentTarget.open) onEngage() }}><summary>{item.year}: {item.title}</summary><p>{item.copy}</p></details>)}
        </section>
      </> : <Apollo16Quiz story={story} sound={sound} onSound={setSound} onComplete={onEngage} onRetry={onQuizRetry} />}
    </RoverStoryLayout>
    <section className={styles.footer} aria-label="Chapter navigation">
      {index < 4 && <><label><input type="checkbox" checked={autoAdvance} onChange={event => setAutoAdvance(event.target.checked)} /> Continue to the next chapter when I scroll past the end</label><div ref={boundary} className={styles.boundary}><p>End of {chapterMeta[index].title}. Choose Next Chapter{autoAdvance ? ' or continue scrolling' : ''}.</p></div></>}
      <div className={styles.chapterActions}><button type="button" disabled={index === 0} onClick={() => leave(index)}>PREVIOUS CHAPTER</button><span>{engaged ? 'INTERACTION COMPLETE' : index === 4 ? 'FINISH THE QUIZ TO CONTINUE' : 'READ OR EXPLORE AT YOUR PACE'}</span><button type="button" disabled={!canComplete} onClick={onNext}>{index === 4 ? 'COMPLETE STORY' : 'NEXT CHAPTER'}</button></div>
    </section>
    <div id="apollo16-sources" tabIndex={-1} role="region" aria-label="Apollo 16 scientific sources" className={styles.sources}>{story.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}<a href={media.usagePolicyUrl} target="_blank" rel="noreferrer">NASA media usage guidelines ↗</a></div>
  </div>
}
