import { useEffect, useRef, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { apollo15ChapterRecordings, apollo15QuizRecordings } from '../../features/storytelling/apollo15Recordings'
import { bindRecordedNarration, stopRecordedNarration, type RecordingStatus } from '../../features/storytelling/recordedNarration'
import styles from './Apollo15Narration.module.css'

function RecordedAudio({ src, label }: { src: string; label: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const session = useRef<ReturnType<typeof bindRecordedNarration> | null>(null)
  const [status, setStatus] = useState<RecordingStatus>('idle')
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const player = bindRecordedNarration(audio, src, setStatus, () => window.speechSynthesis?.cancel())
    session.current = player
    // Route exits can be animated. Stop on the navigation intent, rather than
    // waiting for the outgoing page's eventual unmount.
    const onLink = (event: MouseEvent) => {
      if (event.button !== 0) return
      if (event.target instanceof Element && event.target.closest('a[href]')) player.stop()
    }
    const onHide = () => { if (document.hidden) player.stop() }
    document.addEventListener('click', onLink, true)
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('popstate', player.stop)
    window.addEventListener('pagehide', player.stop)
    return () => {
      document.removeEventListener('click', onLink, true)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('popstate', player.stop)
      window.removeEventListener('pagehide', player.stop)
      player.dispose()
      session.current = null
    }
  }, [src])
  return <div className={styles.player}>
    <audio ref={audioRef} controls preload="none" aria-label={label} />
    {status === 'error' && <p role="alert">Narration could not load. You can keep reading, or <button type="button" onClick={() => session.current?.reload()}>Reload audio</button> and press Play to retry.</p>}
  </div>
}

export function Apollo15ChapterNarration({ chapter }: { chapter: number }) {
  const [selected, setSelected] = useState(0)
  const tracks = apollo15ChapterRecordings[chapter]
  if (!tracks) return null
  const track = tracks[selected]
  return <section className={styles.reading} aria-label="Apollo 15 recorded narration">
    <div className={styles.heading}><h2>Read &amp; listen</h2><label>Story segment
      <select value={selected} onChange={event => { stopRecordedNarration(); setSelected(Number(event.target.value)) }}>
        {tracks.map((item, index) => <option key={item.audio} value={index}>{index + 1}. {item.title}</option>)}
      </select></label></div>
    <article><h3>{track.title}</h3><p>{track.text}</p>
      <RecordedAudio key={track.audio} src={track.audio} label={`Apollo 15, chapter ${chapter + 1}: ${track.title}`} />
      {!!track.sources.length && <div className={styles.sources}>{track.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}<ExternalLink size={12} aria-hidden="true" /></a>)}</div>}
    </article>
  </section>
}

export function Apollo15QuizNarration({ question }: { question: number }) {
  const src = apollo15QuizRecordings[question]
  return src ? <RecordedAudio key={src} src={src} label={`Apollo 15: listen to question ${question + 1}`} /> : null
}
