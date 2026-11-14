export type RecordingStatus = 'idle' | 'playing' | 'paused' | 'ended' | 'error'

let activeStop: (() => void) | null = null

/** One recorded voice across story players, including overlapping exit mounts. */
export function stopRecordedNarration() { activeStop?.() }

/** Native controls own play(): mounting, selecting and retrying never autoplay. */
export function bindRecordedNarration(audio: HTMLAudioElement, src: string,
  notify: (status: RecordingStatus) => void, cancelSpeech: () => void) {
  let disposed = false
  let status: RecordingStatus = 'idle'
  const report = (next: RecordingStatus) => {
    if (!disposed && status !== next) { status = next; notify(next) }
  }
  const stop = () => {
    if (activeStop === stop) activeStop = null
    audio.pause()
    if (status === 'playing') report('paused')
  }
  const fail = () => { if (!disposed) { stop(); report('error') } }
  audio.preload = 'none'
  audio.src = src
  audio.onplay = () => {
    // A queued event from a paused/disposed player must not claim the new voice.
    if (disposed) { audio.pause(); return }
    if (audio.paused) return
    if (activeStop !== stop) { stopRecordedNarration(); activeStop = stop }
    cancelSpeech()
    report('playing')
  }
  audio.onpause = () => {
    if (disposed) return
    if (activeStop === stop) activeStop = null
    if (status === 'playing') report('paused')
  }
  audio.onended = () => {
    if (disposed) return
    if (activeStop === stop) activeStop = null
    report('ended')
  }
  audio.onerror = fail
  return {
    stop,
    reload() {
      if (disposed) return
      stop()
      try { audio.load(); report('idle') } catch { fail() }
    },
    dispose() {
      if (disposed) return
      disposed = true
      if (activeStop === stop) activeStop = null
      audio.onplay = audio.onpause = audio.onended = audio.onerror = null
      audio.pause()
      try { audio.currentTime = 0 } catch { /* Metadata may not exist yet. */ }
      audio.removeAttribute('src')
      audio.load() // Cancel outstanding requests/playback and release resources.
    },
  }
}
