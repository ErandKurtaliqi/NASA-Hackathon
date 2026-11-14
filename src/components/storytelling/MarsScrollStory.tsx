import MissionSceneCredits from './MissionSceneCredits'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { chapterMeta, type MachineStory } from '../../machineStories'
import { marsStoryContent, marsReviewNote, type MarsStoryId } from '../../features/storytelling/marsStories'
import { marsHeroMedia, marsMediaId, marsStoryMedia } from '../../features/storytelling/marsStoryMedia'
import { useScrollStory } from '../../features/storytelling/useScrollStory'
import { useStoryReducedMotion } from '../../features/storytelling/motionPreference'
import { stopRecordedNarration } from '../../features/storytelling/recordedNarration'
import ApolloProgressSaveStatus from './ApolloProgressSaveStatus'
import RoverStoryLayout from './CinematicStoryLayout'
import StoryMedia from './StoryMedia'
import StoryRecording from './ReviewStoryRecording'
import StoryEnvironment from './StoryEnvironment'
import StoryHardware from './StoryHardware'
import { marsStoryPresentation, shortChapterLabels } from '../../features/storytelling/storyPresentation'
import styles from './Apollo15ScrollStory.module.css'
import marsStyles from './MarsScrollStory.module.css'

/** Separate mission presentation; Apollo 15/17 and Perseverance keep their paths. */
export default function MarsScrollStory({ story, index, unlockedIndex, isDone, canComplete, engaged, onEngage, onNext, renderQuiz }: {
  story: MachineStory; index: number; unlockedIndex: number; isDone: (id: string) => boolean | undefined
  canComplete: boolean; engaged: boolean; onEngage: () => void; onNext: () => void
  renderQuiz: (recording: (question: number) => ReactNode, reducedMotion: boolean) => ReactNode
}) {
  const id = story.id as MarsStoryId
  const tracks = marsStoryContent[id].chapters[index] ?? []
  const { active, cards, select } = useScrollStory(tracks.length, onEngage)
  const reduced = useStoryReducedMotion(), navigate = useNavigate()
  const [sound, setSound] = useState(true), [inlineEvidence, setInlineEvidence] = useState(false)
  const [found, setFound] = useState<number[]>([]), [profile, setProfile] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const entrance = useRef<HTMLDivElement>(null)
  const media = marsStoryMedia[marsMediaId(id, index, active)]
  const isLander = id === 'viking-1'
  const isHelicopter = id === 'ingenuity'

  useEffect(() => {
    if (!document.activeElement?.closest('[role="alert"]')) {
      heading.current?.focus({ preventScroll: true })
      entrance.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
    const query = window.matchMedia?.('(max-width: 700px)')
    if (!query) return
    const update = () => setInlineEvidence(query.matches)
    update(); query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  const leave = (chapter: number) => { stopRecordedNarration(); navigate(`/story/${id}/${chapter}`) }
  const evidence = (mediaId: string) => <StoryMedia media={marsStoryMedia[mediaId]} motionEnabled={!reduced} />
  const renderTrack = (track: typeof tracks[number], i: number) => <article id={`${id}-step-${index}-${i}`} key={track.audio} ref={element => { cards.current[i] = element }} tabIndex={-1}
          aria-labelledby={`${id}-segment-${i}`} className={`${styles.card} ${active === i ? styles.active : ''}`}>
          <small>{i + 1} / {chapterMeta[index].title}</small><h2 id={`${id}-segment-${i}`}>{track.title}</h2>
          <small>Original supplied narration script · audio timing unverified</small><p>{track.text}</p>
          {marsReviewNote(id, index, i) && <p className={styles.scienceNote} role="note">{marsReviewNote(id, index, i)}</p>}
          <a href={story.sources[0].url} target="_blank" rel="noreferrer">Read NASA’s mission record ↗</a>
          {inlineEvidence && i > 0 && evidence(marsMediaId(id, index, i))}
        </article>
  const readingControls = index < 4 ? <div className={`${styles.readingControls} ${marsStyles.readingControls}`}>
          <p role="status" aria-atomic="true">Segment {active + 1} of {tracks.length}: {tracks[active].title}</p>
          <div className={styles.controls}>
            <button type="button" disabled={active === 0} onClick={() => select(active - 1)}>Previous segment</button>
            <button type="button" disabled={active === tracks.length - 1} onClick={() => select(active + 1)}>Next segment</button>
          </div>
          <nav className={styles.segmentLinks} aria-label="Story segments">{tracks.map((track, i) => <button key={track.audio} type="button" aria-current={i === active ? 'step' : undefined} aria-label={`${i + 1}. ${track.title}`} title={track.title} onClick={() => select(i)}>{i + 1}</button>)}</nav>
          <StoryRecording key={tracks[active].audio} src={tracks[active].audio} label={tracks[active].title} sound={sound} onSound={setSound} />
        </div> : undefined
  const introduction = <div className={styles.missionIntro}>
    <p>MARS {isLander ? 'LANDER · STATIONARY SCIENCE' : isHelicopter ? 'HELICOPTER · PIONEERING FLIGHT' : 'ROVER · ROBOTIC EXPLORATION'}</p>
    <h1 id={`${id}-chapter-${index + 1}`} ref={heading} tabIndex={-1}>{story.name}<span className={styles.chapterHeading}>{chapterMeta[index].title}</span></h1>
    <p className={styles.missionSubtitle}>{marsStoryPresentation[id].subtitle}</p><p>{story.heroLine}</p>
    <nav className={styles.chapters} aria-label="Story chapters">{chapterMeta.map((chapter, i) => i > unlockedIndex
      ? <span key={chapter.id} aria-label={`${chapter.title}, locked`}>{i + 1}. {shortChapterLabels[i]}</span>
      : <Link key={chapter.id} aria-current={i === index ? 'step' : undefined} aria-label={`${i + 1}. ${chapter.title}`} to={`/story/${id}/${i + 1}`}>{isDone(chapter.id) ? '✓ ' : ''}{i + 1}. {shortChapterLabels[i]}</Link>)}</nav>
  </div>
  return <div ref={entrance} className={`${styles.page} ${marsStyles.page}`} data-mars-story={id}>
    <header className={styles.header}>
      <Link to="/explore/mars"><span className={styles.backIcon} aria-hidden="true">←</span>Back to Mars missions</Link><Link to="/hardware">Hardware Lab</Link>
      <a href={`#${id}-sources`}>Mission sources <span aria-hidden="true">↘</span></a>
    </header>
    <StoryEnvironment world="mars" idPrefix={`${id}-terrain`} />
    <ApolloProgressSaveStatus story={story} />
    <RoverStoryLayout sceneNote={<MissionSceneCredits idPrefix={`${id}-terrain`} />} opening={index < 4 ? renderTrack(tracks[0], 0) : undefined} controls={readingControls} intro={introduction} storytellerLabel={isLander ? 'Your lander storyteller' : isHelicopter ? 'Your helicopter storyteller' : 'Your rover storyteller'}
      rover={<StoryHardware name={story.name} presentation={marsStoryPresentation[id]} tagline={story.heroLine} />}
      evidence={<><p className={styles.eyebrow}>NASA MISSION CONTEXT</p><StoryMedia media={media} motionEnabled={!reduced} /><p>Context imagery does not prove every spoken action. Read the source and science notes.</p></>}>
      {index < 4 ? <>
        {tracks.slice(1).map((track, i) => renderTrack(track, i + 1))}
        <section className={styles.activities} aria-label="Optional mission activities">
          <h2>Explore the mission</h2><p>These activities are optional. Continue when you are ready.</p>
          {index === 0 && <div className="profile-grid">{story.profile.map((item, i) => <button type="button" key={item.label} aria-pressed={profile === i} className={profile === i ? 'active' : ''} onClick={() => { setProfile(i); onEngage() }}><small>{item.label}</small><b>{item.value}</b></button>)}</div>}
          {index === 1 && <details onToggle={event => { if (event.currentTarget.open) onEngage() }}><summary>Explain: why does a robotic mission need partners?</summary><p>Compare the roles described in the original mission account. Select a segment above to revisit its evidence.</p></details>}
          {index === 2 && <div className="discovery-bank"><span>OPEN MY DISCOVERY LOG</span>{story.discoveries.map((item, i) => <button type="button" key={item.title} aria-expanded={found.includes(i)} onClick={() => { setFound(items => items.includes(i) ? items : [...items, i]); onEngage() }}><span><b>{item.title}</b><small>{found.includes(i) ? item.detail : 'Tap to reveal this discovery account'}</small>{found.includes(i) && marsReviewNote(id, 2, i) && <small>{marsReviewNote(id, 2, i)}</small>}</span></button>)}</div>}
          {index === 3 && <details onToggle={event => { if (event.currentTarget.open) onEngage() }}><summary>Reflect: what can a future explorer learn from this mission?</summary><p>Choose one observation or engineering challenge from this story. Explain which evidence supports your idea.</p></details>}
        </section>
      </> : renderQuiz(question => <StoryRecording key={`${id}-${question}`} src={`/audio/${id}/chapter-5/${question + 1}.mp3`} label={`Question ${question + 1} recording. Question text is below; transcript verification is pending.`} sound={sound} onSound={setSound} />, reduced)}
    </RoverStoryLayout>
    <section className={styles.footer} aria-label="Chapter navigation">
      <div className={styles.chapterActions}>
        <button type="button" disabled={index === 0} onClick={() => leave(index)}>PREVIOUS CHAPTER</button>
        <span>{engaged ? 'INTERACTION COMPLETE' : 'EXPLORE OR CONTINUE'}</span>
        <button type="button" disabled={!canComplete} onClick={onNext}>{index === 4 ? 'COMPLETE STORY' : 'NEXT CHAPTER'}</button>
      </div>
      {index === 4 && <div className={styles.controls}><Link to="/dashboard">View mission dashboard →</Link><Link to="/explore/mars">Explore more Mars missions →</Link></div>}
    </section>
    <div id={`${id}-sources`} tabIndex={-1} role="region" aria-label={`${story.name} scientific sources`} className={styles.sources}>{story.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}<a href={media.usagePolicyUrl} target="_blank" rel="noreferrer">NASA media usage guidelines ↗</a></div>
  </div>
}
