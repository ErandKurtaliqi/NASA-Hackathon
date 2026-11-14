import { useEffect, useRef, useState } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { createDocumentaryNarration, type DocumentaryVoiceState } from '../../features/storytelling/documentaryNarration'
import { apollo15CaptionTiming } from '../../features/storytelling/apollo15CaptionTiming'
import { cueAt, pendingCues } from '../../features/storytelling/storyCues'

export default function DocumentaryAudio({ src, nextSrc, label, hold }: { src?: string; nextSrc?: string; label: string; hold?: string }) {
  const audio = useRef<HTMLAudioElement>(null), controller = useRef<ReturnType<typeof createDocumentaryNarration>>()
  const [status, setStatus] = useState<DocumentaryVoiceState>('idle'), [duration, setDuration] = useState(0), [time, setTime] = useState(0)
  const [sound, setSound] = useState(false)
  const [checked, setChecked] = useState<{ src: string; available: boolean }>()
  const playable = !hold && checked?.src === src && checked?.available ? src : undefined
  const timing = playable ? apollo15CaptionTiming[playable] ?? pendingCues : pendingCues
  useEffect(() => {
    if (!audio.current) return
    controller.current = createDocumentaryNarration(audio.current, setStatus)
    return () => { controller.current?.dispose(); controller.current = undefined }
  }, [])
  useEffect(() => { setTime(0); setDuration(0); controller.current?.select(playable, !!hold) }, [src, playable, hold])
  useEffect(() => {
    if (!src || hold) return
    const request = new AbortController()
    fetch(src, { method: 'HEAD', signal: request.signal })
      .then(response => {
        if (!request.signal.aborted) setChecked({ src, available: response.ok && !!response.headers.get('Content-Type')?.startsWith('audio/') })
      })
      .catch(() => { if (!request.signal.aborted) setChecked({ src, available: false }) })
    return () => request.abort()
  }, [src, hold])
  useEffect(() => {
    if (!sound || !nextSrc || nextSrc === src || (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return
    const upcoming = new Audio()
    const request = new AbortController()
    fetch(nextSrc, { method: 'HEAD', signal: request.signal }).then(response => {
      if (request.signal.aborted || !response.ok || !response.headers.get('Content-Type')?.startsWith('audio/')) return
      upcoming.preload = 'metadata'
      upcoming.src = nextSrc
    }).catch(() => {})
    return () => { request.abort(); upcoming.removeAttribute('src'); upcoming.load() }
  }, [sound, src, nextSrc])
  const toggleSound = () => {
    setSound(!sound)
    if (audio.current) audio.current.muted = sound
    if (sound && timing.status !== 'verified') controller.current?.pause()
    else controller.current?.play()
  }
  const captionText = cueAt(timing, time)?.text
  return <section aria-label="Recorded narration" data-documentary-audio>
    <audio ref={audio} preload="none" onLoadedMetadata={e => setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)} onTimeUpdate={e => setTime(e.currentTarget.currentTime)} />
    <div>
      <button type="button" aria-label="Narration sound" aria-pressed={sound} onClick={toggleSound}>{sound ? <Volume2 aria-hidden="true" size={16}/> : <VolumeX aria-hidden="true" size={16}/>}<span>Sound {sound ? 'on' : 'off'}</span></button>
      <button type="button" disabled={!sound || !playable} onClick={() => status === 'playing' ? controller.current?.pause(true) : controller.current?.play()} aria-label={status === 'playing' ? 'Pause narration' : 'Resume narration'}>{status === 'playing' ? <Pause aria-hidden="true" size={16}/> : <Play aria-hidden="true" size={16}/>}</button>
      <label><span data-control-label>Position</span><input type="range" min="0" max={duration || 1} step="0.1" value={Math.min(time, duration || 1)} disabled={!duration} onChange={e => { if (audio.current) { audio.current.currentTime = Number(e.target.value); setTime(Number(e.target.value)) } }} aria-valuetext={`${Math.floor(time)} of ${Math.floor(duration)} seconds`} /></label>
    </div>
    <p role="status" aria-live="polite" aria-atomic="true" tabIndex={0} data-story-caption={captionText ? true : undefined}>{captionText || (hold ? 'Read the scientific clarification while this recording is under review.' : !src || (checked?.src === src && !playable) || status === 'error' ? 'Recording unavailable. You can keep reading.' : !playable ? 'Checking narration availability…' : status === 'blocked' ? 'Select Resume to let your browser play narration.' : `${!sound ? 'Turn sound on to hear the story.' : status === 'playing' ? 'Playing' : status === 'ended' ? 'Recording ended' : 'Paused'} · ${label}`)}</p>
  </section>
}
