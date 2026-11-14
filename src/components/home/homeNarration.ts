import { captionAtTime, captionStartFraction, homeCaptions } from './homeCaptions'

export type HomeRecording = 'intro' | 'moon' | 'mars'

export const homeRecordings: Record<HomeRecording, string> = {
  intro: '/audio/home/intro.mp3',
  moon: '/audio/home/moon.mp3',
  mars: '/audio/home/mars.mp3',
}

export type NarrationState = {
  enabled: boolean; message: string; error: boolean
  recording: HomeRecording | null; phase: 'off' | 'loading' | 'playing' | 'paused' | 'ended' | 'error'
  caption: number; duration: number | null
}
export const silentNarration: NarrationState = {
  enabled: false, message: 'Sound off. Enable sound to hear your astronaut guide.', error: false,
  recording: null, phase: 'off', caption: 0, duration: null,
}

const titles: Record<HomeRecording, string> = { intro: 'Welcome', moon: 'Moon', mars: 'Mars' }

/** Homepage-only audio session. No media is created or fetched before explicit consent. */
export function createHomeNarration(
  notify: (state: NarrationState) => void,
  createAudio: () => HTMLAudioElement = () => new Audio(),
) {
  let state = silentNarration
  let current: HTMLAudioElement | null = null
  let selected: HomeRecording | null = null
  let generation = 0
  let disposed = false

  function update(next: NarrationState) { state = next; notify(next) }

  function release() {
    generation++
    const audio = current
    current = null
    if (!audio) return
    audio.onerror = null
    audio.onended = null
    audio.onloadedmetadata = null
    audio.ondurationchange = null
    audio.ontimeupdate = null
    audio.onseeking = null
    audio.onplaying = null
    audio.onpause = null
    audio.onwaiting = null
    audio.pause()
    try { audio.currentTime = 0 } catch { /* Metadata may not have loaded yet. */ }
    audio.removeAttribute('src')
    audio.load() // Abort pending requests and release the decoder/buffer.
  }

  function play(recording: HomeRecording) {
    release()
    selected = recording
    const request = generation
    const active = () => !disposed && state.enabled && request === generation
    const fail = () => {
      if (!active()) return
      release()
      update({ ...state, enabled: false, phase: 'error', error: true, message: 'Astronaut audio could not play. Turn sound on to retry.' })
    }
    update({ enabled: true, error: false, recording, phase: 'loading', caption: 0, duration: null, message: `${titles[recording]} narration loading.` })
    try {
      const audio = createAudio()
      current = audio
      audio.preload = 'none'
      audio.src = homeRecordings[recording]
      audio.onerror = fail
      const sync = (phase = state.phase) => {
        if (!active()) return
        const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : null
        const caption = captionAtTime(recording, audio.currentTime, duration)
        // Media events may arrive several times a second. Publish only real
        // segment/playback changes; the live-region message stays unchanged.
        if (caption !== state.caption || duration !== state.duration || phase !== state.phase) {
          update({ ...state, caption, duration, phase })
        }
      }
      audio.onloadedmetadata = () => sync()
      audio.ondurationchange = () => sync()
      audio.ontimeupdate = () => sync()
      audio.onseeking = () => sync()
      audio.onplaying = () => sync('playing')
      audio.onpause = () => sync('paused')
      audio.onwaiting = () => sync('paused')
      audio.onended = () => {
        if (!active()) return
        release()
        update({ ...state, enabled: true, phase: 'ended', caption: homeCaptions[recording].length - 1, error: false, message: `${titles[recording]} narration finished. Focus or interact with another world to listen.` })
      }
      // Called synchronously within the enabling click or intentional planet interaction.
      Promise.resolve(audio.play()).then(() => {
        if (active()) {
          sync(audio.paused ? 'paused' : 'playing')
          update({ ...state, message: `${titles[recording]} narration playing.` })
        }
      }).catch(fail)
    } catch { fail() }
  }

  return {
    toggle() {
      if (disposed) return
      if (state.enabled) {
        release()
        update(silentNarration)
      } else {
        // First enable always welcomes the visitor; re-enabling retries the last selection.
        play(selected ?? 'intro')
      }
    },
    select(recording: 'moon' | 'mars') {
      if (disposed || !state.enabled || selected === recording) return
      play(recording)
    },
    seekCaption(index: number) {
      if (disposed || !state.enabled || !current || !state.recording || !state.duration) return false
      try {
        current.currentTime = captionStartFraction(state.recording, index) * state.duration
        // Read back the browser's accepted time rather than assuming a seek succeeded.
        const caption = captionAtTime(state.recording, current.currentTime, state.duration)
        update({ ...state, caption })
        return true
      } catch { return false }
    },
    dispose() {
      disposed = true
      release()
    },
  }
}
