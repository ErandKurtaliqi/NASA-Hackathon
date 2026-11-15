import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { createDocumentaryNarration, type DocumentaryVoiceState } from '../../features/storytelling/documentaryNarration'
import { apollo15CaptionTiming } from '../../features/storytelling/apollo15CaptionTiming'
import { cueAt, pendingCues } from '../../features/storytelling/storyCues'

export default function DocumentaryAudio({ src, nextSrc, label, hold, contextId = src, statusId = 'documentary-audio-status', autoPlay = false, onBeforeEnable }: {
  src?: string; nextSrc?: string; label: string; hold?: string; contextId?: string; statusId?: string; autoPlay?: boolean; onBeforeEnable?: () => boolean
}) {
  const audio = useRef<HTMLAudioElement>(null), controller = useRef<ReturnType<typeof createDocumentaryNarration>>()
  const [status, setStatus] = useState<DocumentaryVoiceState>('idle'), [time, setTime] = useState(0)
  const [sound, setSound] = useState(autoPlay)
  const [checked, setChecked] = useState<{ context?: string; available: boolean }>()
  const [timingSrc, setTimingSrc] = useState<string>()
  const timing = timingSrc ? apollo15CaptionTiming[timingSrc] ?? pendingCues : pendingCues
  useEffect(() => {
    if (!audio.current) return
    const voice = createDocumentaryNarration(audio.current, value => {
      setStatus(value)
      if (value === 'blocked' || value === 'error') setSound(false)
    })
    controller.current = voice
    if (autoPlay) voice.play()
    return () => { voice.dispose(); controller.current = undefined }
  }, [autoPlay])
  useEffect(() => {
    // Stop before HEAD completes, even if a rapid scroll revisits the same URL.
    const voice = controller.current
    voice?.select(undefined, !!hold)
    setTime(0); setTimingSrc(undefined); setChecked(undefined)
    if (!src || hold) return
    const request = new AbortController()
    fetch(src, { method: 'HEAD', signal: request.signal }).then(response => {
      if (request.signal.aborted) return
      const available = response.ok && !!response.headers.get('Content-Type')?.startsWith('audio/')
      setChecked({ context: contextId, available })
      if (available) { setTimingSrc(src); voice?.select(src) }
    }).catch(() => { if (!request.signal.aborted) setChecked({ context: contextId, available: false }) })
    return () => request.abort()
  }, [src, contextId, hold])
  useEffect(() => {
    if (!sound || !nextSrc || nextSrc === src || (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return
    const upcoming = new Audio(), request = new AbortController()
    fetch(nextSrc, { method: 'HEAD', signal: request.signal }).then(response => {
      if (request.signal.aborted || !response.ok || !response.headers.get('Content-Type')?.startsWith('audio/')) return
      upcoming.preload = 'metadata'; upcoming.src = nextSrc
    }).catch(() => {})
    return () => { request.abort(); upcoming.removeAttribute('src'); upcoming.load() }
  }, [sound, src, nextSrc])
  const toggleSound = () => {
    setSound(!sound)
    if (sound) controller.current?.pause()
    else {
      if (onBeforeEnable && !onBeforeEnable()) controller.current?.select(undefined)
      controller.current?.play()
    }
  }
  const caption = cueAt(timing, time)?.text
  const unavailable = !src || (!!checked && checked.context === contextId && !checked.available) || status === 'error'
  const message = hold ? 'This recording is under review. Read the scientific review notes in Mission sources.'
    : status === 'blocked' ? 'Your browser blocked narration. Select Sound on to try again.'
    : unavailable ? 'Recording unavailable. You can keep reading.'
    : checked?.context !== contextId ? 'Checking narration availability…'
    : !sound ? 'Sound off. Scroll and read at your own pace.'
    : status === 'playing' ? `Playing · ${label}` : status === 'ended' ? 'Recording ended. Scroll to continue.' : `Sound on · ${label}`
  return <section aria-label="Recorded narration" data-documentary-audio>
    <audio ref={audio} preload="none" onTimeUpdate={event => setTime(event.currentTarget.currentTime)} />
    <button type="button" aria-label={sound ? 'Sound off' : 'Sound on'} aria-pressed={sound} aria-describedby={statusId} onClick={toggleSound}>
      {sound ? <Volume2 aria-hidden="true" size={20}/> : <VolumeX aria-hidden="true" size={20}/>}
    </button>
    <p id={statusId} role="status" aria-live="polite" aria-atomic="true" data-important={!!hold || unavailable || status === 'blocked'}>{message}</p>
    {caption && <p data-story-caption>{caption}</p>}
  </section>
}
