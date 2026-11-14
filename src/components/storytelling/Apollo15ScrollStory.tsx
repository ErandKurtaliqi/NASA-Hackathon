import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { chapterMeta, type MachineStory } from '../../machineStories'
import { apollo15ChapterRecordings, apollo15QuizRecordings } from '../../features/storytelling/apollo15Recordings'
import { apollo15EvidenceForStep } from '../../features/storytelling/apollo15CueEvidence'
import { apollo15CaptionTiming } from '../../features/storytelling/apollo15CaptionTiming'
import { apollo15SegmentMedia, apollo15StoryMedia, type Apollo15MediaId } from '../../features/storytelling/apollo15StoryMedia'
import { createChapterScrollBoundary } from '../../features/storytelling/chapterScrollBoundary'
import { useScrollStory } from '../../features/storytelling/useScrollStory'
import { useStoryReducedMotion } from '../../features/storytelling/motionPreference'
import { stopRecordedNarration } from '../../features/storytelling/recordedNarration'
import type { StoryCue } from '../../features/storytelling/storyCues'
import ApolloProgressSaveStatus from './ApolloProgressSaveStatus'
import RoverStoryLayout from './CinematicStoryLayout'
import StoryEnvironment from './StoryEnvironment'
import StoryHardware from './StoryHardware'
import { moonStoryPresentation, shortChapterLabels } from '../../features/storytelling/storyPresentation'
import StoryMedia from './StoryMedia'
import StoryRecording from './StoryRecording'
import EvidencePredictionActivity from './activities/EvidencePredictionActivity'
import { apollo15HammerFeatherPrediction } from '../../features/storytelling/activities/apollo15Prediction'
import styles from './Apollo15ScrollStory.module.css'
import { apollo15OpeningEvidence } from '../../features/storytelling/storyStageAssets'

export default function Apollo15ScrollStory({ story, index, unlockedIndex, isDone, canComplete, engaged, onEngage, onNext, renderQuiz }: {
  story: MachineStory; index: number; unlockedIndex: number; isDone: (id: string) => boolean | undefined
  canComplete: boolean; engaged: boolean; onEngage: () => void; onNext: () => void
  renderQuiz: (recording: (question: number) => ReactNode, reducedMotion: boolean) => ReactNode
}) {
  const tracks = apollo15ChapterRecordings[index] ?? []
  const { active, cards, select } = useScrollStory(tracks.length, onEngage)
  const reduced = useStoryReducedMotion(), navigate = useNavigate()
  const [sound, setSound] = useState(true), [autoAdvance, setAutoAdvance] = useState(true)
  const [inlineEvidence, setInlineEvidence] = useState(false)
  const [profile, setProfile] = useState(0), [found, setFound] = useState<number[]>([])
  const [cue, setCue] = useState<{ audio: string; cue: StoryCue | undefined }>()
  const entrance = useRef<HTMLDivElement>(null)
  const boundary = useRef<HTMLDivElement>(null), heading = useRef<HTMLHeadingElement>(null)
  const current = useRef({ active, canComplete, onNext, autoAdvance })
  current.current = { active, canComplete, onNext, autoAdvance }
  const activeMedia = apollo15EvidenceForStep(index, active, active, cue)
  const media = index === 0 && active === 0 && activeMedia === apollo15SegmentMedia[index]?.[active] ? apollo15OpeningEvidence : apollo15StoryMedia[activeMedia]
  useEffect(() => {
    // A storage warning may already have claimed focus; never override recovery.
    if (typeof document === 'undefined' || !document.activeElement?.closest('[role="alert"]')) {
      heading.current?.focus({ preventScroll: true })
      entrance.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
    const query = window.matchMedia?.('(max-width: 700px)')
    if (!query) return
    const update = () => setInlineEvidence(query.matches)
    update(); query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  useEffect(() => { setCue(undefined) }, [active])
  useEffect(() => {
    if (index === 4) return
    return createChapterScrollBoundary(window, () => boundary.current, () => {
      const state = current.current
      return state.autoAdvance && state.active === tracks.length - 1 && state.canComplete
    }, () => current.current.onNext())
  }, [index, tracks.length])
  useEffect(() => {
    // Warm only the next still image. No audio is prefetched or auto-played.
    const next = apollo15SegmentMedia[index]?.[active + 1]
    if (!next || typeof Image === 'undefined') return
    const image = new Image(); image.src = apollo15StoryMedia[next].src
  }, [active, index])
  const leave = (chapter: number) => { stopRecordedNarration(); navigate(`/story/${story.id}/${chapter}`) }
  const evidence = (id: Apollo15MediaId) => <StoryMedia media={apollo15StoryMedia[id]} motionEnabled={!reduced} />
  const actions = <div className={styles.chapterActions}>
    <button type="button" disabled={index === 0} onClick={() => leave(index)}>PREVIOUS CHAPTER</button>
    <span>{engaged ? 'INTERACTION COMPLETE' : 'EXPLORE OR CONTINUE'}</span>
    <button type="button" disabled={!canComplete} onClick={onNext}>{index === 4 ? 'COMPLETE STORY' : 'NEXT CHAPTER'}</button>
  </div>
  const renderTrack = (track: typeof tracks[number], i: number) => <article id={`apollo15-step-${index}-${i}`} key={track.audio} ref={element => { cards.current[i] = element }} tabIndex={-1}
          aria-labelledby={`apollo15-segment-${i}`} className={`${styles.card} ${active === i ? styles.active : ''}`}>
          <small>0{i + 1} / {chapterMeta[index].title}</small><h2 id={`apollo15-segment-${i}`}>{track.title}</h2><small>Original narration script · timing unverified</small><p>{track.text}</p>
          {index === 1 && <p className={styles.scienceNote}>{story.journey[i].copy}</p>}
          {index === 2 && i < story.challenges.length && <div className={styles.scienceNote}><b>Engineering challenge</b><p>{story.challenges[i].problem}</p><b>Engineering solution</b><p>{story.challenges[i].solution}</p></div>}
          {index === 3 && <p className={styles.scienceNote}>{story.legacy[i].copy}</p>}
          {inlineEvidence && i > 0 && evidence(apollo15EvidenceForStep(index, i, active, cue))}
        </article>
  const readingControls = index < 4 ? <div className={styles.readingControls}>
          <p role="status" aria-atomic="true">Segment {active + 1} of {tracks.length}: {tracks[active].title}</p>
          <StoryRecording key={tracks[active].audio} src={tracks[active].audio} label={tracks[active].title} sound={sound} onSound={setSound} onCue={value => setCue({ audio: tracks[active].audio, cue: value })} timing={apollo15CaptionTiming[tracks[active].audio]} />
          <div className={styles.controls}>
            <button type="button" disabled={active === 0} onClick={() => select(active - 1)}>Previous segment</button>
            <button type="button" disabled={active === tracks.length - 1} onClick={() => select(active + 1)}>Next segment</button>
          </div>
          <nav className={styles.segmentLinks} aria-label="Story segments">{tracks.map((track, i) => <button type="button" key={track.audio} aria-current={active === i ? 'step' : undefined} onClick={() => select(i)} aria-label={`${i + 1}. ${track.title}`} title={track.title}>{i + 1}</button>)}</nav>
        </div> : undefined
  const introduction = <div className={styles.missionIntro}>
      <p>MOON ROVER · LRV-1 · 1971</p><h1 id={`apollo15-chapter-${index + 1}`} ref={heading} tabIndex={-1}>Apollo 15 <span className={styles.chapterHeading}>{chapterMeta[index].title}</span></h1>
      <p className={styles.missionSubtitle}>{moonStoryPresentation['apollo-15-rover'].subtitle}</p>
      <p>{story.heroLine}</p>
    <nav className={styles.chapters} aria-label="Story chapters">{chapterMeta.map((item, i) => i > unlockedIndex
      ? <span key={item.id} aria-label={`${item.title}, locked`}>{i + 1}. {shortChapterLabels[i]}</span>
      : <Link key={item.id} aria-current={i === index ? 'step' : undefined} to={`/story/${story.id}/${i + 1}`} aria-label={`${i + 1}. ${item.title}`}>{isDone(item.id) ? '✓ ' : ''}{i + 1}. {shortChapterLabels[i]}</Link>)}</nav>
  </div>
  return <div ref={entrance} className={styles.page} data-story-pilot="apollo-15">
    <header className={styles.header}>
      <Link to="/explore/moon"><span className={styles.backIcon} aria-hidden="true">←</span>Back to Moon missions</Link><Link to="/hardware">Hardware Lab</Link>
      <a href="#apollo15-sources" aria-label="Open Apollo 15 mission sources">Mission sources <span aria-hidden="true">↘</span></a>
    </header>
    <StoryEnvironment world="moon" idPrefix="apollo15-terrain" />
    <ApolloProgressSaveStatus story={story} />
    <RoverStoryLayout sceneCredits opening={index < 4 ? renderTrack(tracks[0], 0) : undefined} controls={readingControls} intro={introduction} rover={<StoryHardware name={story.name} presentation={moonStoryPresentation['apollo-15-rover']} tagline={story.heroLine} />}
      evidence={<><p className={styles.eyebrow}>NASA EVIDENCE · {index < 4 ? `SEGMENT ${active + 1}` : 'MISSION RECORD'}</p><StoryMedia media={media} motionEnabled={!reduced} /></>}>
      {index < 4 ? <>
        {tracks.slice(1).map((track, i) => renderTrack(track, i + 1))}

        <section className={styles.activities} aria-label="Optional mission activities">
          <h2>Explore the mission</h2><p>Optional activities. You can also continue to the next chapter.</p>
          {index === 0 && <div className="profile-grid">{story.profile.map((item, i) => <button type="button" key={item.label} aria-pressed={profile === i} className={profile === i ? 'active' : ''} onClick={() => { setProfile(i); onEngage() }}><small>{item.label}</small><b>{item.value}</b></button>)}</div>}
          {index === 1 && <details onToggle={event => { if (event.currentTarget.open) onEngage() }}><summary>Predict: does lower gravity change the rover's mass?</summary><p>Its weight decreases; its mass stays the same. Compare this with the One-sixth Gravity segment above.</p></details>}
          {index === 2 && <div className="discovery-bank"><span>OPEN MY DISCOVERY LOG</span>{story.discoveries.map((item, i) => <button type="button" key={item.title} aria-expanded={found.includes(i)} onClick={() => { setFound(values => values.includes(i) ? values : [...values, i]); onEngage() }}><span><b>{item.title}</b><small>{found.includes(i) ? item.detail : 'Tap to reveal this discovery'}</small></span></button>)}</div>}
          {index === 3 && <div className={styles.controls}>{story.legacy.map((item, i) => <button type="button" key={i} aria-pressed={active === i} onClick={() => select(i)}>{item.year}: {item.title}</button>)}</div>}
          {index === 3 && <EvidencePredictionActivity activity={apollo15HammerFeatherPrediction} />}
        </section>
      </> : renderQuiz(question => <StoryRecording key={question} src={apollo15QuizRecordings[question]} label={`Question ${question + 1} recording. Question text is below; a verified transcript is pending.`} sound={sound} onSound={setSound} timing={apollo15CaptionTiming[apollo15QuizRecordings[question]]} />, reduced)}
      {inlineEvidence && index === 4 && evidence('rover')}
    </RoverStoryLayout>
    <section className={styles.footer} aria-label="Chapter navigation">
      {index < 4 && <><label><input type="checkbox" checked={autoAdvance} onChange={event => setAutoAdvance(event.target.checked)} /> Continue to the next chapter when I scroll past the end</label><div id="apollo15-chapter-boundary" ref={boundary} className={styles.boundary}><p>End of {chapterMeta[index].title}. Continue scrolling or choose Next Chapter.</p></div></>}
      {actions}
    </section>
    <div id="apollo15-sources" tabIndex={-1} role="region" className={styles.sources} aria-label="Apollo 15 scientific sources">{story.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}<a href={media.usagePolicyUrl} target="_blank" rel="noreferrer">NASA media usage guidelines ↗</a></div>
  </div>
}
