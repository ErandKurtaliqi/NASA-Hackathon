import { bindRecordedNarration, stopRecordedNarration } from './recordedNarration'

export type DocumentaryVoiceState = 'idle' | 'playing' | 'paused' | 'ended' | 'blocked' | 'error' | 'held'

/** One persistent HTMLAudioElement. Changing context restarts a recording;
 * Sound Off survives scrolling. Sound On always starts the selected recording
 * at its beginning. Playback requires an initial request. */
export function createDocumentaryNarration(audio: HTMLAudioElement, notify: (state: DocumentaryVoiceState) => void) {
  let permitted = false, disposed = false, serial = 0, source: string | undefined
  let binding: ReturnType<typeof bindRecordedNarration> | undefined
  const start = () => {
    if (!source || disposed) return
    const ticket = ++serial
    try {
      stopRecordedNarration()
      audio.currentTime = 0
      Promise.resolve(audio.play()).then(() => {
        // Never pause a newer source on this persistent element, but do stop a
        // late fulfillment after Sound Off or disposal.
        if (disposed || !permitted) audio.pause()
      }).catch(error => {
        if (disposed || ticket !== serial) return
        permitted = false
        audio.pause()
        notify(error?.name === 'NotAllowedError' ? 'blocked' : 'error')
      })
    } catch { if (!disposed) { permitted = false; audio.pause(); notify('error') } }
  }
  return {
    select(src?: string, held = false) {
      if (disposed) return
      ++serial
      binding?.dispose(); binding = undefined; source = held ? undefined : src
      if (!source) { notify(held ? 'held' : 'idle'); return }
      binding = bindRecordedNarration(audio, source, status => {
        if (status === 'error') permitted = false
        notify(status)
      }, () => window.speechSynthesis?.cancel())
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
