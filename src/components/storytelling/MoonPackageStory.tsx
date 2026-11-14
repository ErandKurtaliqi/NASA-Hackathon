import MissionSceneCredits from './MissionSceneCredits'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { chapterMeta, type MachineStory } from '../../machineStories'
import { moonRecordings, type MoonMission, type MoonRecording } from '../../features/storytelling/moonRecordings'
import { apollo11StoryMedia } from '../../features/storytelling/apollo11StoryMedia'
import { apollo17StoryMedia } from '../../features/storytelling/apollo17StoryMedia'
import { useScrollStory } from '../../features/storytelling/useScrollStory'
import { useStoryReducedMotion } from '../../features/storytelling/motionPreference'
import { createChapterScrollBoundary } from '../../features/storytelling/chapterScrollBoundary'
import { stopRecordedNarration } from '../../features/storytelling/recordedNarration'
import { isOmittedReviewRecording } from '../../features/storytelling/reviewMediaPolicy'
import RoverStoryLayout from './CinematicStoryLayout'
import StoryEnvironment from './StoryEnvironment'
import StoryHardware from './StoryHardware'
import { moonStoryPresentation, shortChapterLabels } from '../../features/storytelling/storyPresentation'
import StoryMedia, { type StoryEvidenceMedia } from './StoryMedia'
import StoryRecording from './StoryRecording'
import ApolloProgressSaveStatus from './ApolloProgressSaveStatus'
import LaserRangingActivity from './activities/LaserRangingActivity'
import styles from './Apollo15ScrollStory.module.css'
import local from './MoonPackageStory.module.css'

/** A passive experiment and a rover share presentation, never hardware assumptions. */
export default function MoonPackageStory({ story, index, unlockedIndex, isDone, canComplete, engaged, onEngage, onNext, renderQuiz }: {
  story: MachineStory; index: number; unlockedIndex: number; isDone: (id: string) => boolean | undefined
  canComplete: boolean; engaged: boolean; onEngage: () => void; onNext: () => void
  renderQuiz: (recording: (question: number) => ReactNode, reducedMotion: boolean) => ReactNode
}) {
  const mission: MoonMission = story.id === 'apollo-11-reflector' ? '11' : '17'
  const experiment = story.category === 'stationary-experiment'
  const segments = moonRecordings[mission][index]
  const { active, cards, select } = useScrollStory(index < 4 ? segments.length : 0, onEngage)
  const reduced = useStoryReducedMotion(), navigate = useNavigate()
  const [sound, setSound] = useState(true), [autoAdvance, setAutoAdvance] = useState(true), [inline, setInline] = useState(false)
  const [profile, setProfile] = useState(0), [found, setFound] = useState<number[]>([])
  const entrance = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null), boundary = useRef<HTMLDivElement>(null)
  const current = useRef({ active, canComplete, autoAdvance, onNext })
  current.current = { active, canComplete, autoAdvance, onNext }
  useEffect(() => {
    // Preserve focus already claimed by a storage failure/recovery warning.
    if (typeof document === 'undefined' || !document.activeElement?.closest('[role="alert"]')) { heading.current?.focus({ preventScroll: true }); entrance.current?.scrollIntoView({ behavior: 'instant', block: 'start' }) }
    const query = window.matchMedia?.('(max-width: 700px)')
    if (!query) return
    const update = () => setInline(query.matches)
    update(); query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (index === 4) return
    return createChapterScrollBoundary(window, () => boundary.current,
      () => current.current.autoAdvance && current.current.canComplete && current.current.active === segments.length - 1,
      () => { stopRecordedNarration(); current.current.onNext() })
  }, [index, segments.length])
  // Recorded playback only. No TTS mount/fallback can become a second narrator.
  const recording = (segment: MoonRecording) => segment.playback === 'enabled'
    ? isOmittedReviewRecording(segment.audio)
      ? <p className={local.pending} data-review-omitted-recording={segment.audio}>Recorded narration omitted from this code review: {segment.title}. The original is available only in the private local QA build. You can read and continue.</p>
      : <StoryRecording key={segment.audio} src={segment.audio} label={`${story.missionLabel}: ${segment.title}`} sound={sound} onSound={setSound} />
    : <p className={local.pending}>Recording held for scientific review. {segment.review} You can read and continue without audio.</p>
  const mediaFor = (segment: number): StoryEvidenceMedia | undefined => {
    if (experiment) {
      if (index === 0) return apollo11StoryMedia.array
      if (index === 1 && segment === 0) return apollo11StoryMedia.launch
      if (index === 1 && segment === 2) return apollo11StoryMedia.carried
      if (index === 3) return apollo11StoryMedia.array
    } else {
      if (index === 0) return apollo17StoryMedia.vehicle
      if (index === 1 && segment === 0) return apollo17StoryMedia.launch
      if (index === 1 && segment === 3) return apollo17StoryMedia.field
      if (index === 2 && segment === 2) return apollo17StoryMedia.orange
      if (index === 2 && segment === 3) return apollo17StoryMedia.field
    }
  }
  const evidence = (media?: StoryEvidenceMedia) => <StoryMedia media={media} motionEnabled={!reduced} fallback={<div className={local.sources}><p>No direct photograph is selected for this segment. Read the scientific source; no substitute image is presented as evidence.</p><a href={story.sources[0].url} target="_blank" rel="noreferrer">Official mission evidence ↗</a></div>} />
  const leave = (chapter: number) => { stopRecordedNarration(); navigate(`/story/${story.id}/${chapter}`) }
  const renderSegment = (segment: typeof segments[number], i: number) => <article key={segment.audio} id={`apollo${mission}-step-${index}-${i}`} ref={element => { cards.current[i] = element }} tabIndex={-1} aria-labelledby={`moon-${mission}-${index}-${i}`} className={`${styles.card} ${active === i ? styles.active : ''}`}>
          <small>{i + 1} / {segments.length}</small><h2 id={`moon-${mission}-${index}-${i}`}>{segment.title}</h2><p>{segment.readingText}</p>
          {segment.review && <p className={local.pending}>Scientific clarification: {segment.review}</p>}
          {mission === '17' && index === 3 && i === 4 && <p className={styles.scienceNote}>An invitation to students, not a claim that a particular classroom activity occurred on the mission.</p>}
          {inline && i > 0 && evidence(mediaFor(i))}
        </article>
  const readingControls = index < 4 ? <div className={`${styles.readingControls} ${local.reading}`}><p role="status" aria-atomic="true">Segment {active + 1} of {segments.length}: {segments[active].title}</p>
          <div className={styles.controls}><button type="button" disabled={active === 0} onClick={() => select(active - 1)}>Previous segment</button><button type="button" disabled={active === segments.length - 1} onClick={() => select(active + 1)}>Next segment</button></div>{recording(segments[active])}</div> : undefined
  const introduction = <div className={styles.missionIntro}>
      <p>{experiment ? 'STATIONARY LUNAR EXPERIMENT · 1969' : 'MOON ROVER · LRV-3 · 1972'}</p>
      <h1 id={`apollo${mission}-chapter-${index + 1}`} ref={heading} tabIndex={-1}>Apollo {mission} <span className={styles.chapterHeading}>{chapterMeta[index].title}</span></h1>
      <p className={styles.missionSubtitle}>{moonStoryPresentation[experiment ? 'apollo-11-reflector' : 'apollo-17-rover'].subtitle}</p><p>{story.heroLine}</p>
    <nav className={styles.chapters} aria-label="Story chapters">{chapterMeta.map((chapter, i) => i > unlockedIndex
      ? <span key={chapter.id} aria-label={`${chapter.title}, locked`}>{i + 1}. {shortChapterLabels[i]}</span>
      : <Link key={chapter.id} aria-current={i === index ? 'step' : undefined} aria-label={`${i + 1}. ${chapter.title}`} to={`/story/${story.id}/${i + 1}`}>{isDone(chapter.id) ? '✓ ' : ''}{i + 1}. {shortChapterLabels[i]}</Link>)}</nav>
  </div>
  return <div ref={entrance} className={`${styles.page} ${local.page}`} data-story-pilot={`apollo-${mission}`}>
    <header className={styles.header}><Link to="/explore/moon"><span className={styles.backIcon} aria-hidden="true">←</span>Back to Moon missions</Link><Link to="/hardware">Hardware Lab</Link>
      <a href={`#apollo${mission}-sources`} aria-label={`Open Apollo ${mission} mission sources`}>Mission sources <span aria-hidden="true">↘</span></a></header>
    <details className={local.reviewNotice}><summary>Code review build: narration availability</summary><p className={local.pending} role="note">Code review build: Apollo 11 and Apollo 17 recordings are intentionally excluded. This is not the final narrated release. Scientific holds remain separate; reading, activities, quiz and progress are available.</p></details>
    <StoryEnvironment world="moon" idPrefix={`apollo${mission}-terrain`} />
    <ApolloProgressSaveStatus story={story} />
    <RoverStoryLayout sceneNote={<MissionSceneCredits idPrefix={`apollo${mission}-terrain`} diagram={experiment} />} opening={index < 4 ? renderSegment(segments[0], 0) : undefined} controls={readingControls} intro={introduction} storytellerLabel={experiment ? 'Your lunar experiment storyteller' : undefined}
      rover={<StoryHardware key={story.id} name={story.name} presentation={moonStoryPresentation[experiment ? 'apollo-11-reflector' : 'apollo-17-rover']} tagline={story.heroLine} />}
      evidence={<><p className={styles.eyebrow}>NASA EVIDENCE</p>{evidence(mediaFor(active))}</>}>
      {index < 4 ? <>
        {segments.slice(1).map((segment, i) => renderSegment(segment, i + 1))}

        <section className={styles.activities} aria-label="Optional mission activities"><h2>Explore or continue</h2><p>These activities are optional and do not unlock chapters.</p>
          {experiment ? index === 0 && <LaserRangingActivity /> : <>
            {index === 0 && <div className="profile-grid">{story.profile.map((item, i) => <button type="button" key={item.label} className={profile === i ? 'active' : ''} aria-pressed={profile === i} onClick={() => { setProfile(i); onEngage() }}><small>{item.label}</small><b>{item.value}</b></button>)}</div>}
            {index === 1 && <div>{story.journey.map(item => <details key={item.label}><summary onClick={onEngage}>{item.label}</summary><p><b>{item.date} · {item.title}</b><br />{item.copy}</p></details>)}</div>}
            {index === 2 && <><details><summary>Engineering solutions</summary>{story.challenges.map(item => <details key={item.title}><summary onClick={onEngage}>{item.title}</summary><p>{item.problem}</p><p>{item.solution}</p></details>)}</details><div className="discovery-bank">{story.discoveries.map((item, i) => <button type="button" key={item.title} aria-expanded={found.includes(i)} onClick={() => { setFound(values => values.includes(i) ? values : [...values, i]); onEngage() }}><span><b>{item.title}</b><small>{found.includes(i) ? item.detail : 'Tap to reveal this discovery'}</small></span></button>)}</div></>}
            {index === 3 && <div>{story.legacy.map(item => <details key={item.title}><summary onClick={onEngage}>{item.year}: {item.title}</summary><p>{item.copy}</p></details>)}</div>}
          </>}
        </section>
      </> : <>{experiment && <p>For this quiz, identify the experiment followed in this story. The astronauts also left other equipment on the Moon.</p>}{renderQuiz(question => recording(segments[question]), reduced)}</>}
    </RoverStoryLayout>
    <section className={styles.footer} aria-label="Chapter navigation">{index < 4 && <><label><input type="checkbox" checked={autoAdvance} onChange={event => setAutoAdvance(event.target.checked)} /> Continue to the next chapter when I scroll past the end</label><div id={`apollo${mission}-chapter-boundary`} ref={boundary} className={styles.boundary}>End of {chapterMeta[index].title}. Keep scrolling or select Next Chapter.</div></>}
      <div className={styles.chapterActions}><button type="button" disabled={index === 0} onClick={() => leave(index)}>PREVIOUS CHAPTER</button><span>{engaged ? 'INTERACTION COMPLETE' : 'EXPLORE OR CONTINUE'}</span><button type="button" disabled={!canComplete} onClick={() => { stopRecordedNarration(); onNext() }}>{index === 4 ? 'COMPLETE STORY' : 'NEXT CHAPTER'}</button></div></section>
    <div id={`apollo${mission}-sources`} tabIndex={-1} role="region" className={styles.sources} aria-label={`${story.missionLabel} scientific sources`}>{story.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}<a href={apollo11StoryMedia.array.usagePolicyUrl} target="_blank" rel="noreferrer">NASA media usage guidelines ↗</a></div>
  </div>
}
