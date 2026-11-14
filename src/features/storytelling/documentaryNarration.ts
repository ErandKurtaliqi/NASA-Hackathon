import { bindRecordedNarration, stopRecordedNarration } from './recordedNarration'

export type DocumentaryVoiceState = 'idle' | 'playing' | 'paused' | 'ended' | 'blocked' | 'error' | 'held'

/** One persistent HTMLAudioElement. Changing context restarts a recording;
 * explicit Pause survives all subsequent scrolling. No play before activation. */
export function createDocumentaryNarration(audio: HTMLAudioElement, notify: (state: DocumentaryVoiceState) => void) {
  let permitted = false, disposed = false, serial = 0, source: string | undefined
  let binding: ReturnType<typeof bindRecordedNarration> | undefined
  const start = () => {
    if (!source || disposed) return
    const ticket = ++serial
    try {
      Promise.resolve(audio.play()).catch(error => {
        if (disposed || ticket !== serial) return
        audio.pause()
        notify(error?.name === 'NotAllowedError' ? 'blocked' : 'error')
      })
    } catch { if (!disposed) notify('error') }
  }
  return {
    select(src?: string, held = false) {
      ++serial
      binding?.dispose(); binding = undefined; source = held ? undefined : src
      if (!source) { notify(held ? 'held' : 'idle'); return }
      binding = bindRecordedNarration(audio, source, notify, () => window.speechSynthesis?.cancel())
      notify(permitted ? 'paused' : 'idle')
      if (permitted) start()
    },
    play() { if (disposed) return; permitted = true; if (source) { stopRecordedNarration(); start() } },
    pause(keepAutoplay = false) { permitted = keepAutoplay && permitted; ++serial; audio.pause(); notify('paused') },
    replay() {
      if (disposed || !source) return
      audio.currentTime = 0
      permitted = true
      stopRecordedNarration()
      start()
    },
    dispose() { disposed = true; permitted = false; ++serial; binding?.dispose(); binding = undefined },
  }
}
