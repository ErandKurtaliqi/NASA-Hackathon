import { useEffect, useState } from 'react'
import { useChapterNarration } from '../../features/storytelling/useChapterNarration'
import { stopRecordedNarration } from '../../features/storytelling/recordedNarration'
import styles from './Apollo15ScrollStory.module.css'

/** Browser speech is optional. No Apollo 17 recording or timed transcript is implied. */
export default function Apollo17BrowserVoice({ text }: { text: string }) {
  const [paused, setPaused] = useState(false)
  // Run before the shared hook's text update: release a former recording and
  // native paused state before speaking the newly selected reading step.
  useEffect(() => { stopRecordedNarration(); window.speechSynthesis?.resume(); setPaused(false) }, [text])
  const voice = useChapterNarration(text)
  useEffect(() => { if (!voice.enabled) setPaused(false) }, [voice.enabled])
  useEffect(() => {
    const stop = () => { window.speechSynthesis?.resume(); voice.stop(); setPaused(false) }
    const hide = () => { if (document.hidden) stop() }
    const link = (event: MouseEvent) => { if (event.button === 0 && event.target instanceof Element && event.target.closest('a[href]')) stop() }
    document.addEventListener('click', link, true)
    document.addEventListener('visibilitychange', hide)
    window.addEventListener('popstate', stop)
    window.addEventListener('pagehide', stop)
    return () => {
      document.removeEventListener('click', link, true)
      document.removeEventListener('visibilitychange', hide)
      window.removeEventListener('popstate', stop)
      window.removeEventListener('pagehide', stop)
      window.speechSynthesis?.resume()
    }
  }, [])
  const play = () => {
    stopRecordedNarration()
    if (paused) { window.speechSynthesis?.resume(); setPaused(false) }
    else if (voice.enabled) voice.replay()
    else voice.toggle()
  }
  return <section className={styles.recording} aria-label="Optional Apollo 17 browser voice">
    <div className={styles.controls}>
      <button type="button" disabled={!voice.available} aria-pressed={voice.enabled} onClick={() => {
        stopRecordedNarration(); window.speechSynthesis?.resume(); setPaused(false); voice.toggle()
      }}>{voice.enabled ? 'Sound on' : 'Sound off'}</button>
      <button type="button" disabled={!voice.available} onClick={() => {
        if (voice.status === 'speaking' && !paused) { window.speechSynthesis.pause(); setPaused(true) }
        else play()
      }}>{paused ? 'Resume' : voice.status === 'speaking' ? 'Pause' : 'Play voice'}</button>
      <button type="button" disabled={!voice.available || !voice.enabled} onClick={() => { window.speechSynthesis?.resume(); setPaused(false); stopRecordedNarration(); voice.replay() }}>Replay voice</button>
    </div>
    <small>Optional browser-generated voice. Readable story text remains available; no approved Apollo 17 MP3 or timed captions are supplied.</small>
    {!voice.available && <p>Browser voice is unavailable. Continue reading the complete story below.</p>}
    {voice.status === 'error' && <p role="alert">Browser voice could not play. You can keep reading or choose Play voice to retry.</p>}
  </section>
}
