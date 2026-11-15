import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { chapterMeta, type MachineStory } from '../../machineStories'
import { resolveStoryRoute } from '../../features/storytelling/pilot'
import { activeDocumentSegment, documentaryPresentation, documentarySegments, quizRecording, terrainId } from '../../features/storytelling/continuousStory'
import { useProgress, type QuizResult } from '../../store'
import { useStoryReducedMotion } from '../../features/storytelling/motionPreference'
import { DocumentaryQuiz as QuizChapter } from '../MachineStoryPage'
import StoryEnvironment from './StoryEnvironment'
import DocumentaryAudio from './DocumentaryAudio'
import DocumentaryEvidence from './DocumentaryEvidence'
import DocumentaryActivities from './DocumentaryActivities'
import Apollo16Quiz from './Apollo16Quiz'
import ApolloProgressSaveStatus from './ApolloProgressSaveStatus'
import MissionSceneCredits from './MissionSceneCredits'
import DocumentarySaveWarning from './DocumentarySaveWarning'
import { apollo15StageAssets } from '../../features/storytelling/storyStageAssets'
import { shortChapterLabels } from '../../features/storytelling/storyPresentation'
import { noteDocumentaryPlanet } from '../../features/explorer/documentaryPlanetReturn'
import styles from './ContinuousStoryPage.module.css'

function SelectQuizRecording({ src, onSelect }: { src: string; onSelect: (src: string) => void }) {
  useEffect(() => { onSelect(src) }, [src, onSelect])
  return <p>Use Sound on below Mission sources to hear this question. Verified transcript timing is pending.</p>
}

export default function ContinuousStoryPage() {
  const { storyId = '', chapter = '1' } = useParams()
  const route = resolveStoryRoute(storyId, chapter)
  if (!route) return <section className="not-found"><h1>Story not found</h1><p>Choose an available machine story from the Hardware Lab.</p><Link to="/hardware">Choose a machine</Link></section>
  return <ContinuousDocument key={route.story.id} story={route.story} initialChapter={route.index} />
}

function ContinuousDocument({ story, initialChapter }: { story: MachineStory; initialChapter: number }) {
  useEffect(() => { noteDocumentaryPlanet(story.planet) }, [story.planet])
  const segments = useMemo(() => documentarySegments(story), [story])
  const evidenceSources = useMemo(() => {
    const links = new Map<string, string>()
    for (const segment of segments) {
      for (const item of segment.gallery ?? (segment.evidence ? [segment.evidence] : [])) {
        if ('src' in item) links.set(item.sourceUrl, item.title + ' · ' + item.credit)
        else links.set(item.url, item.label)
      }
      if (segment.video) links.set(segment.video, segment.evidenceLabel ?? segment.title)
      if (segment.youtubeVideoId) links.set(segment.source, segment.evidenceLabel ?? segment.title)
      if (segment.optionalVideo) links.set(segment.optionalVideo.url, segment.optionalVideo.label)
    }
    for (const source of story.sources) links.delete(source.url)
    return [...links]
  }, [segments, story.sources])
  const presentation = documentaryPresentation(story)
  const missionTitle = story.planet === 'moon' || story.id === 'sojourner'
    ? story.missionLabel.split(' · ')[0] : story.name
  const hardwareType = story.planet === 'moon'
    ? story.shortName.replace(missionTitle + ' ', '')
    : presentation.hardware === 'helicopter' ? 'Mars helicopter' : presentation.hardware === 'lander' ? 'Mars lander' : 'Mars rover'
  const initial = initialChapter === 4 ? segments.length : segments.findIndex(s => s.chapter === initialChapter)
  const [active, setActive] = useState(initial), activeRef = useRef(initial)
  const reader = useRef<HTMLDivElement>(null), cards = useRef<(HTMLElement | null)[]>([])
  const progress = useProgress(), reduced = useStoryReducedMotion()
  const done = (i: number) => !!progress.storyProgress[story.id]?.completed.includes(chapterMeta[i].id) || progress.completedChapters.includes(`${story.id}:${chapterMeta[i].id}`)
  const quizResult = useRef<QuizResult>()
  const captureQuizResult = useCallback((result: QuizResult) => { quizResult.current = result }, [])
  const [quizReady, setQuizReady] = useState(() => done(4))
  const [questionAudio, setQuestionAudio] = useState<string | undefined>(() => quizRecording(story.id, 0))
  const selectQuestion = useCallback((src: string) => setQuestionAudio(src), [])
  const segment = segments[active], chapter = segment?.chapter ?? 4
  const selectedAudio = segment ? segment.audio : questionAudio
  const upcoming = segments[active + 1]
  const upcomingImage = upcoming?.evidence?.src
  useEffect(() => {
    if (upcomingImage) new Image().src = upcomingImage
  }, [upcomingImage])
  const select = (index: number, focus = true) => {
    const card = cards.current[index], root = reader.current
    if (!card || !root) return
    root.scrollTo({ top: root.scrollTop + card.getBoundingClientRect().top - root.getBoundingClientRect().top - 20, behavior: 'instant' })
    activeRef.current = index; setActive(index)
    if (focus) card.focus({ preventScroll: true })
  }
  useEffect(() => {
    const root = reader.current
    if (!root) return
    let frame = 0
    const update = () => {
      frame = 0
      const box = root.getBoundingClientRect()
      const next = activeDocumentSegment(cards.current.map(card => card?.getBoundingClientRect().top ?? Infinity), box.top + Math.min(96, box.height * .22), activeRef.current)
      if (next !== activeRef.current) { activeRef.current = next; setActive(next) }
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    root.addEventListener('scroll', schedule, { passive: true })
    const resize = new ResizeObserver(schedule); resize.observe(root)
    const start = requestAnimationFrame(() => select(initial, false))
    return () => { root.removeEventListener('scroll', schedule); resize.disconnect(); cancelAnimationFrame(frame); cancelAnimationFrame(start) }
    // Initial legacy chapter is an entry position, never a scrolling route update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story.id])
  const markChapter = (index: number) => {
    if (!chapterMeta.slice(0, index).every((_, i) => done(i))) return
    progress.completeStoryChapter(story.id, chapterMeta[index].id, index + 1)
  }
  const finish = () => {
    if (!quizReady || !chapterMeta.slice(0, 4).every((_, i) => done(i))) return
    // Reconcile the older flat progress format without erasing any other mission.
    for (let i = 0; i < 5; i++) if (!progress.storyProgress[story.id]?.completed.includes(chapterMeta[i].id)) progress.completeStoryChapter(story.id, chapterMeta[i].id, i + 1)
    if (quizResult.current) progress.saveStoryQuiz(story.id, quizResult.current)
    progress.awardBadge(`${story.id}-storyteller`)
  }
  const renderRecording = (question: number) => <SelectQuizRecording src={quizRecording(story.id, question)} onSelect={selectQuestion} />
  const finishQuiz = () => { setQuizReady(true); setQuestionAudio(undefined) }
  const syncVisibleNarration = () => {
    const root = reader.current
    if (!root) return true
    const box = root.getBoundingClientRect()
    const next = activeDocumentSegment(cards.current.map(card => card?.getBoundingClientRect().top ?? Infinity), box.top + Math.min(96, box.height * .22), activeRef.current)
    activeRef.current = next; setActive(next)
    return next === active
  }
  return <div className={styles.document} data-continuous-story={story.id} data-active-segment={segment?.id ?? `${story.id}:quiz`} data-active-chapter={chapter + 1} data-world={presentation.world}>
    <DocumentarySaveWarning />
    <div className={styles.environment} data-documentary-background><StoryEnvironment world={presentation.world} idPrefix={terrainId(story.id)} /></div>
    <header className={styles.header}>
      <Link to={`/explore/${story.planet}`}>← Back to {story.planet === 'moon' ? 'Moon' : 'Mars'} missions</Link>
      <div className={styles.headerActions}>
        <Link to="/dashboard">Mission Control</Link>
        <div className={styles.sourceControls}>
        <button type="button" onClick={() => {
          const sources = reader.current?.querySelector<HTMLElement>('[data-mission-sources]')
          sources?.scrollIntoView({ block: 'start', behavior: 'instant' })
          sources?.focus({ preventScroll: true })
        }}>Mission sources ↗</button>
        <DocumentaryAudio autoPlay src={selectedAudio} nextSrc={upcoming?.audioHold ? undefined : upcoming?.audio}
          contextId={segment?.id ?? `${story.id}:quiz:${questionAudio ?? 'complete'}`} onBeforeEnable={syncVisibleNarration}
          label={`Chapter ${chapter + 1} / 5 · ${segment?.title ?? 'Quiz and completion'}`} hold={segment?.audioHold} />
        </div>
      </div>
    </header>
    <div className={styles.title}>
      <h1>{missionTitle}</h1>
      <div className={styles.machineLabel} aria-label={hardwareType}><span aria-hidden="true" /><p>{hardwareType}</p><span aria-hidden="true" /></div>
    </div>
    <section className={styles.stage} data-documentary-stage aria-label="Continuous story and activities">
      <div className={styles.center}>
        <p className={styles.hint} id="documentary-reading-help">Scroll to explore. Use the chapter shortcuts to jump ahead or revisit a chapter.</p>
        <div ref={reader} className={styles.reader} tabIndex={0} role="region" aria-label="Scrollable mission narrative" aria-describedby="documentary-reading-help" data-documentary-reader>
          {segments.map((item, i) => <article key={item.id} ref={el => { cards.current[i] = el }} tabIndex={-1} data-segment={item.id} data-recording={item.audioHold ? undefined : item.audio} data-evidence={item.evidence?.id ?? 'source-only'} aria-labelledby={`segment-${i}`}>
            <small>CHAPTER {item.chapter + 1} · {chapterMeta[item.chapter].title} · SEGMENT {item.segment + 1}</small><h2 id={`segment-${i}`}>{item.title}</h2><p>{item.text}</p>
            {story.id === 'apollo-11-eagle' && item.chapter === 2 && item.segment === 2 && <p><Link to="/story/apollo-11-reflector/1">Explore the Apollo 11 reflector story →</Link></p>}
            {story.id === 'apollo-15-rover' && item.chapter === 1 && <p>{story.journey[item.segment].copy}</p>}
            {story.id === 'apollo-15-rover' && item.chapter === 2 && story.challenges[item.segment] && <aside><b>Engineering challenge</b><p>{story.challenges[item.segment].problem}</p><b>Engineering solution</b><p>{story.challenges[item.segment].solution}</p></aside>}
            {story.id === 'apollo-15-rover' && item.chapter === 3 && <p>{story.legacy[item.segment].copy}</p>}
            {story.id === 'apollo-16-rover' && item.chapter === 1 && <p>{story.journey[item.segment].copy}</p>}
            {item.note && <aside role="note"><b>Scientific clarification</b><p>{item.note}</p><a href={item.source} target="_blank" rel="noreferrer">Scientific source ↗</a></aside>}
            {story.id === 'apollo-17-rover' && item.chapter === 3 && item.segment === 4 && <p>An invitation to students, not a claim that a particular classroom activity occurred on the mission.</p>}
            {(i === segments.length - 1 || segments[i + 1].chapter !== item.chapter) && <div className={styles.chapterEnd}>
              <DocumentaryActivities story={story} chapter={item.chapter} />
              <p>{done(item.chapter) ? 'Chapter completion recorded. You can revisit everything here.' : 'When you finish reading or exploring, mark this chapter complete.'}</p>
              <button type="button" disabled={done(item.chapter) || !chapterMeta.slice(0, item.chapter).every((_, n) => done(n))} onClick={() => markChapter(item.chapter)}>Mark {chapterMeta[item.chapter].title} complete</button>
              <button type="button" onClick={() => select(i + 1)}>NEXT CHAPTER</button>
            </div>}
          </article>)}
          <article ref={el => { cards.current[segments.length] = el }} tabIndex={-1} data-segment={`${story.id}:quiz`} aria-labelledby="documentary-quiz-title">
            <small>CHAPTER 5</small><h2 id="documentary-quiz-title">{chapterMeta[4].title}</h2>
            {story.category === 'stationary-experiment' && <p>Identify the experiment followed in this story. The astronauts also left other equipment on the Moon.</p>}
            {story.id === 'apollo-16-rover' ? <Apollo16Quiz story={story} sound={false} onSound={() => {}} onComplete={finishQuiz} onResult={captureQuizResult} onRetry={() => setQuizReady(false)} renderRecording={renderRecording} /> : <QuizChapter story={story} onComplete={finishQuiz} onResult={captureQuizResult} onRetry={() => setQuizReady(false)} renderRecording={renderRecording} reducedMotion={reduced} />}
            <button type="button" disabled={!quizReady || !chapterMeta.slice(0, 4).every((_, i) => done(i))} onClick={finish}>COMPLETE STORY</button>
            {!chapterMeta.slice(0, 4).every((_, i) => done(i)) && <p>Mark the four reading chapters complete before saving your mission. Use the chapter timeline below to return.</p>}
            {progress.storyProgress[story.id]?.quizResult && <p>Saved quiz result: {progress.storyProgress[story.id].quizResult!.score} / {progress.storyProgress[story.id].quizResult!.total}</p>}
            <ApolloProgressSaveStatus story={story} />
            {done(4) && <p><strong>Mission badge earned</strong> · {story.reward}</p>}
            <p><Link to="/dashboard">View mission dashboard →</Link></p><p><Link to={`/explore/${story.planet}`}>Return to the {story.planet === 'moon' ? 'Moon' : 'Mars'} globe →</Link></p>
          </article>
          <section data-mission-sources tabIndex={-1} aria-label="Scientific mission sources"><h2>Mission sources</h2>{evidenceSources.length > 0 && <details><summary>Evidence media and credits</summary><ul>{evidenceSources.map(([url, label]) => <li key={url}><a href={url} target="_blank" rel="noreferrer">{label} ↗</a></li>)}</ul></details>}{story.sources.map(source => <p key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a></p>)}{story.id === 'apollo-15-rover' ? <p>Photographic composition for storytelling · NASA <a href={apollo15StageAssets.surface.sourceUrl} target="_blank" rel="noreferrer">Apollo 15 surface panorama ↗</a> and a masked historical rover photograph. Decorative stars and lighting; not a single mission photograph or a geographic reconstruction.</p> : <MissionSceneCredits idPrefix={terrainId(story.id)} diagram={story.category === 'stationary-experiment'} />}<p>Photographic composition for storytelling; not a geographic reconstruction. Project narration is not original astronaut audio. Educational project; not an official NASA product.</p><a href="https://www.nasa.gov/nasa-brand-center/images-and-media/" target="_blank" rel="noreferrer">NASA media usage guidelines ↗</a></section>
        </div>
      </div>
      <aside className={styles.evidence} aria-label="NASA evidence"><DocumentaryEvidence key={segment?.gallery ? segment.id : undefined} gallery={segment?.gallery} video={segment?.video} youtubeVideoId={segment?.youtubeVideoId} media={segment?.evidence ?? (chapter === 4 ? presentation.portrait : undefined)} source={segment?.source ?? story.sources[0].url} sourceLabel={segment?.evidenceLabel} sourceSummary={segment?.evidenceSummary} /></aside>
    </section>
    <nav aria-label="Story chapters" className={styles.chapters}>{chapterMeta.map((item, i) => <button type="button" key={item.id} data-completed={done(i)} aria-current={chapter === i ? 'step' : undefined} aria-label={`${i + 1}. ${item.title}${done(i) ? ', completed' : ''}`} onClick={() => select(i === 4 ? segments.length : segments.findIndex(s => s.chapter === i))}><b aria-hidden="true">{done(i) ? '✓' : ''}</b><span>{shortChapterLabels[i]}</span></button>)}</nav>
  </div>
}
