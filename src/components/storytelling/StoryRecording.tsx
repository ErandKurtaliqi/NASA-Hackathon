import { useEffect, useRef, useState } from 'react'
import { bindRecordedNarration, type RecordingStatus } from '../../features/storytelling/recordedNarration'
import { cueAt, pendingCues, type RecordingCues, type StoryCue } from '../../features/storytelling/storyCues'
import styles from './Apollo15ScrollStory.module.css'

export default function StoryRecording({ src, label, sound, onSound, timing = pendingCues, onCue }: {
  src: string; label: string; sound: boolean; onSound: (enabled: boolean) => void
  timing?: RecordingCues; onCue?: (cue: StoryCue | undefined) => void
}) {
  const element = useRef<HTMLAudioElement>(null)
  const player = useRef<ReturnType<typeof bindRecordedNarration> | null>(null)
  const generation = useRef(0)
  const cueListener = useRef(onCue)
  cueListener.current = onCue
  const [status, setStatus] = useState<RecordingStatus>('idle')
  const [requestError, setRequestError] = useState(false)
  const [caption, setCaption] = useState<{ src: string; timing: RecordingCues; cue: StoryCue | undefined }>()
  const published = useRef<{ src: string; timing: RecordingCues; cue: StoryCue | undefined }>()
  const publishTime = (seconds?: number) => {
    const next = seconds === undefined ? undefined : cueAt(timing, seconds)
    const previous = published.current
    if (previous?.src === src && previous.timing === timing && previous.cue === next) return
    const value = { src, timing, cue: next }
    published.current = value; setCaption(value); cueListener.current?.(next)
  }
  const updateFromMedia = () => publishTime(element.current?.ended ? undefined : element.current?.currentTime)
  useEffect(() => {
    const audio = element.current
    if (!audio) return
    const currentGeneration = ++generation.current
    setStatus('idle'); setRequestError(false); publishTime()
    const session = bindRecordedNarration(audio, src, next => {
      setStatus(next)
      if (next === 'ended' || next === 'error') publishTime()
    }, () => window.speechSynthesis?.cancel())
    player.current = session
    const stop = () => session.stop()
    const hide = () => { if (document.hidden) stop() }
    const link = (event: MouseEvent) => { if (event.button === 0 && event.target instanceof Element && event.target.closest('a[href]')) stop() }
    document.addEventListener('click', link, true)
    document.addEventListener('visibilitychange', hide)
    window.addEventListener('popstate', stop)
    window.addEventListener('pagehide', stop)
    return () => {
      if (generation.current === currentGeneration) generation.current++
      document.removeEventListener('click', link, true)
      document.removeEventListener('visibilitychange', hide)
      window.removeEventListener('popstate', stop)
      window.removeEventListener('pagehide', stop)
      session.dispose(); player.current = null
      cueListener.current?.(undefined)
    }
  }, [src])
  useEffect(() => { if (element.current) element.current.muted = !sound; if (!sound) player.current?.stop() }, [sound])
  const play = (replay = false) => {
    const audio = element.current
    if (!audio || !sound) return
    setRequestError(false)
    if (status === 'error') player.current?.reload()
    if (replay) { try { audio.currentTime = 0; publishTime(0) } catch { /* Wait for metadata. */ } }
    // Only these explicit user actions call play; scrolling and cue changes never do.
    const attempt = generation.current
    const rejected = () => { if (generation.current === attempt && element.current === audio) setRequestError(true) }
    try { void audio.play().catch(rejected) } catch { rejected() }
  }
  const visibleCue = caption?.src === src && caption.timing === timing ? caption.cue : undefined
  return <section className={styles.recording} aria-label={label}>
    <audio ref={element} preload="none" onTimeUpdate={updateFromMedia} onSeeking={updateFromMedia} onSeeked={updateFromMedia} />
    <div className={styles.controls}>
      <button type="button" aria-pressed={sound} onClick={() => onSound(!sound)}>{sound ? 'Sound on' : 'Sound off'}</button>
      <button type="button" disabled={!sound} onClick={() => status === 'playing' ? player.current?.stop() : play()}>{status === 'playing' ? 'Pause' : status === 'paused' ? 'Resume' : 'Play'}</button>
      <button type="button" disabled={!sound} onClick={() => play(true)}>Replay</button>
    </div>
    <p>{label}</p>
    <small>{timing.status === 'pending' ? 'Segment text available below. Caption timing awaits listening review.' : 'Reviewed timed captions'}</small>
    {/* Readable captions, deliberately not an aria-live stream on every timeupdate. */}
    {visibleCue && <p aria-label="Timed caption">{visibleCue.text}</p>}
    {(requestError || status === 'error') && <p role="alert">Audio unavailable or playback blocked. Keep reading, or press Play to retry.</p>}
  </section>
}
