export type VoiceState = { enabled: boolean; status: 'off' | 'speaking' | 'ready' | 'error' }
type SpeechDriver = Pick<SpeechSynthesis, 'speak' | 'cancel' | 'getVoices'>

/** Small testable owner of the speech queue. Nothing starts before explicit opt-in. */
export function createNarrationSession(driver: SpeechDriver, createUtterance: (text: string) => SpeechSynthesisUtterance, notify: (state: VoiceState) => void) {
  let enabled = false
  let disposed = false
  let generation = 0
  let text = ''
  const report = (status: VoiceState['status']) => { if (!disposed) notify({ enabled, status }) }
  const cancel = () => { generation += 1; driver.cancel() }
  const play = () => {
    try {
      cancel()
      const current = generation
      const utterance = createUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = .92
      utterance.pitch = 1.03
      const english = driver.getVoices().filter(voice => /^en\b/i.test(voice.lang))
      utterance.voice = english.find(voice => voice.localService) || english[0] || null
      utterance.onend = () => { if (current === generation) report('ready') }
      utterance.onerror = () => {
        if (current !== generation) return
        enabled = false
        report('error')
      }
      driver.speak(utterance)
      report('speaking')
    } catch {
      enabled = false
      report('error')
    }
  }
  return {
    setText(next: string) {
      if (disposed || next === text) return
      text = next
      if (enabled) play()
    },
    toggle() {
      if (disposed) return
      enabled = !enabled
      if (enabled) play()
      else { cancel(); report('off') }
    },
    replay() { if (!disposed && enabled) play() },
    stop() { if (!disposed) { enabled = false; cancel(); report('off') } },
    dispose() { disposed = true; enabled = false; cancel() },
  }
}
