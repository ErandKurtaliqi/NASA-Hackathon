import { useEffect, useRef, useState } from 'react'
import { createNarrationSession, type VoiceState } from './narration'

export function useChapterNarration(text: string) {
  const [available, setAvailable] = useState(false)
  const [state, setState] = useState<VoiceState>({ enabled: false, status: 'off' })
  const session = useRef<ReturnType<typeof createNarrationSession> | null>(null)
  const currentText = useRef(text)
  currentText.current = text

  useEffect(() => {
    if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance !== 'function') return
    const voice = createNarrationSession(window.speechSynthesis, value => new SpeechSynthesisUtterance(value), setState)
    session.current = voice
    voice.setText(currentText.current)
    setAvailable(true)
    const stopWhenHidden = () => { if (document.hidden) voice.stop() }
    document.addEventListener('visibilitychange', stopWhenHidden)
    return () => {
      document.removeEventListener('visibilitychange', stopWhenHidden)
      voice.dispose()
      session.current = null
    }
  }, [])
  useEffect(() => { session.current?.setText(text) }, [text])

  return { ...state, available, toggle: () => session.current?.toggle(), replay: () => session.current?.replay(), stop: () => session.current?.stop() }
}
