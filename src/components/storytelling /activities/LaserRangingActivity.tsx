import { useState } from 'react'
import { apollo11Sources } from '../../../features/storytelling/apollo11Story'

export function laserRangeKm(roundTripSeconds: number) { return 299792.458 * roundTripSeconds / 2 }

/** Optional numerical model; no laser, coordinates, store or animation. */
export default function LaserRangingActivity() {
  const [seconds, setSeconds] = useState(2.56), [stage, setStage] = useState(0)
  const phases = ['An Earth observatory sends a pulse.', 'The passive corner cubes return part of the incoming light toward Earth.', 'The observatory detects returning light and measures the round-trip time.']
  return <section aria-labelledby="laser-lab-title">
    <h2 id="laser-lab-title">A distance written in light</h2>
    <p>Optional educational model, not a real observation or a scale drawing. The experiment stays on the Moon. The laser and clock are on Earth.</p>
    <ol>{phases.map((phase, i) => <li key={phase} aria-current={stage === i ? 'step' : undefined}>{phase}</li>)}</ol>
    <button type="button" onClick={() => setStage(value => (value + 1) % phases.length)}>Follow the light: next stage</button>
    <p role="status" aria-atomic="true">Stage {stage + 1}: {phases[stage]}</p>
    <label htmlFor="round-trip-time">Example round-trip time: {seconds.toFixed(2)} seconds</label>
    <input id="round-trip-time" type="range" min="2.4" max="2.7" step="0.01" value={seconds} onChange={event => setSeconds(Number(event.target.value))} />
    <p><output htmlFor="round-trip-time">Approximate range: {Math.round(laserRangeKm(seconds)).toLocaleString('en-US')} km</output></p>
    <p>Distance ≈ speed of light × round-trip time ÷ 2. We divide by two because light travels out and back. Real measurements also correct for atmosphere, station position and lunar motion. Changing this slider does not move the Moon.</p>
    <a href={apollo11Sources[1].url} target="_blank" rel="noreferrer">NASA ILRS: how laser ranging works ↗</a>
  </section>
}
