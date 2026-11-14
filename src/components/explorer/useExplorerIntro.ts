import { useEffect, useState } from 'react'
import type { PlanetId } from '../../types'

const intros = {
  mars: [[0, 'Welcome to Mars!'], [2.44, 'Meet the machines that explored this planet.'], [5.39, 'Choose one to begin!']],
  moon: [[0, 'Welcome to the Moon!'], [2.33, 'Discover the machines that explored our nearest celestial neighbour.'], [6.89, 'Choose one to begin!']],
} as const

let pending: { planet: PlanetId; audio: HTMLAudioElement } | undefined
const muted = () => localStorage.getItem('auroralys-explorer-muted') === 'true'
const recording = (planet: PlanetId) => new Audio('/audio/explorer-' + planet + '.mp3')

// Start in the link's click gesture so browser autoplay policies allow the intro.
export function startExplorerIntro(planet: PlanetId) {
  pending?.audio.pause()
  pending = undefined
  if (muted()) return
  const audio = recording(planet)
  pending = { planet, audio }
  void audio.play().catch(() => {})
  window.setTimeout(() => {
    if (pending?.audio !== audio) return
    audio.pause()
    pending = undefined
  }, 1800)
}

export default function useExplorerIntro(planet: PlanetId) {
  const [sound, setSound] = useState(() => !muted())
  const [audio, setAudio] = useState<HTMLAudioElement>()
  const [time, setTime] = useState(0)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    const player = pending?.planet === planet ? pending.audio : recording(planet)
    if (pending?.audio !== player) pending?.audio.pause()
    pending = undefined
    setAudio(player)
    setTime(player.currentTime)
    const sync = () => setTime(player.currentTime)
    player.addEventListener('timeupdate', sync)
    return () => {
      player.removeEventListener('timeupdate', sync)
      player.pause()
    }
  }, [planet])

  useEffect(() => {
    if (!audio || !sound) return
    let current = true
    void audio.play().then(() => { if (current) setBlocked(false) }, () => { if (current) setBlocked(true) })
    return () => { current = false; audio.pause() }
  }, [audio, sound])

  function toggle() {
    const enabled = !sound || blocked
    localStorage.setItem('auroralys-explorer-muted', String(!enabled))
    setSound(enabled)
    if (enabled && audio) {
      if (audio.ended) audio.currentTime = 0
      void audio.play().then(() => setBlocked(false), () => setBlocked(true))
    }
  }

  const caption = intros[planet].filter(([start]) => start <= time).map(([, line]) => line).join(' ')
  return { sound: sound && !blocked, toggle, caption: sound && !blocked ? caption : 'Choose a machine to begin exploring.' }
}
