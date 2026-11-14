import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react'

type ChallengeProps = { completed: boolean; onComplete: () => void }

export function DustChallenge({ completed, onComplete }: ChallengeProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const [progress, setProgress] = useState(completed ? 100 : 0)
  const done = completed || progress >= 65

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, 360, 150)
    if (completed) return
    ctx.fillStyle = '#9b9280'; ctx.fillRect(0, 0, 360, 150)
    // A deterministic mask, so the illustration does not jump on rerenders.
    let seed=313;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
    for (let i = 0; i < 2000; i++) {
      ctx.fillStyle = i % 2 ? '#655d5055' : '#c6bca655'
      ctx.beginPath(); ctx.arc(random()*360, random()*150, i % 3 + 1, 0, Math.PI * 2); ctx.fill()
    }
  }, [completed])

  const measure = () => {
    const data = canvas.current?.getContext('2d')?.getImageData(0, 0, 360, 150).data
    if (!data) return
    let clear = 0
    for (let i = 3; i < data.length; i += 4) if (data[i] < 90) clear++
    const percent = Math.round(clear / (360 * 150) * 100)
    setProgress(percent)
    if (percent >= 65 && !completed) onComplete()
  }
  const brush = (x: number, y: number, previous?: { x: number; y: number } | null) => {
    const ctx = canvas.current?.getContext('2d'); if (!ctx || done) return
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineWidth = 48; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(previous?.x ?? x, previous?.y ?? y); ctx.lineTo(x + .1, y); ctx.stroke()
  }
  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: (event.clientX - rect.left) / rect.width * 360, y: (event.clientY - rect.top) / rect.height * 150 }
  }
  const cleanStrip = (strip: number) => {
    const ctx = canvas.current?.getContext('2d'); if (!ctx || done) return
    ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle='#000'; ctx.fillRect(strip * 120, 0, 120, 150); measure()
  }
  return <div className={`field-challenge ${done ? 'solved' : ''}`}>
    <span className="simulation-label">EDUCATIONAL SIMULATION · LUNAR DUST & THERMAL CONTROL</span>
    <h3>{done ? 'A clearer view. A cooler camera.' : 'Brush the dust away.'}</h3>
    <p>The LRV used batteries, not solar panels. Here, help clear a simulated television-camera radiator. This is an illustration, not a repair of the real vehicle.</p>
    <div className="radiator" aria-label="Illustrated cooling radiator">
      <div className="radiator-fins">{Array.from({ length: 14 }, (_, i) => <i key={i} />)}</div>
      <canvas ref={canvas} width={360} height={150} aria-label="Swipe to brush dust off the radiator, or use the three brush buttons below" onPointerDown={e => { if (done) return; drawing.current = true; e.currentTarget.setPointerCapture(e.pointerId); const p = point(e); brush(p.x, p.y); lastPoint.current = p }} onPointerMove={e => { if (!drawing.current) return; const p = point(e); brush(p.x, p.y, lastPoint.current); lastPoint.current = p }} onPointerUp={() => { drawing.current = false; lastPoint.current = null; measure() }} onPointerCancel={() => { drawing.current = false; lastPoint.current = null; measure() }} />
      {done && <div className="challenge-success"><Check /> Radiator cleared</div>}
    </div>
    <div className="brush-alternatives" role="group" aria-label="Keyboard-friendly dust brushes">{['left', 'middle', 'right'].map((label, i) => <button key={label} disabled={done} onClick={() => cleanStrip(i)}>Brush {label}</button>)}</div>
    <div className="challenge-meter" role="progressbar" aria-label="Radiator dust cleared" aria-valuemin={0} aria-valuemax={100} aria-valuenow={done ? 100 : progress}><i style={{ width: `${done ? 100 : progress}%` }} /></div>
    <small role="status">{done ? 'Field task complete. Continue to the final chapter.' : `${progress}% cleared · swipe across the dust or use the brush buttons.`}</small>
  </div>
}

export function NavigationChallenge({ completed, onComplete }: ChallengeProps) {
  const [lane, setLane] = useState(1)
  const [step, setStep] = useState(0)
  const [message, setMessage] = useState('Choose a clear lane, then move forward.')
  const blockedLanes = [1, 2, 0]
  const done = completed || step === 3
  const drive = () => {
    if (done) return
    if (blockedLanes[step] === lane) { setMessage('A rock is in this lane. Steer into a clear lane first.'); return }
    if (step === 2) { onComplete(); setMessage('Safe route found. Field task complete!') }
    else setMessage('Clear of that rock. Look ahead for the next obstacle.')
    setStep(s => s + 1)
  }
  return <div className={`field-challenge ${done ? 'solved' : ''}`}>
    <span className="simulation-label">EDUCATIONAL SIMULATION · TERRAIN NAVIGATION</span>
    <h3>{done ? 'A safe path forward.' : 'Find a path through the rocks.'}</h3>
    <p>Real rover teams plan around hazards. Try three short simulated moves. This is not a reconstruction of a particular drive.</p>
    <div className="navigation-field" role="group" aria-label="Three-lane rover navigation" tabIndex={0} onKeyDown={e => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(e.key)) e.preventDefault(); if (!done && e.key === 'ArrowLeft') setLane(n => Math.max(0, n - 1)); if (!done && e.key === 'ArrowRight') setLane(n => Math.min(2, n + 1)); if (e.key === 'ArrowUp') drive() }}>
      {[0, 1, 2].map(i => <button key={i} className={lane === i ? 'chosen' : ''} aria-label={`Choose ${['left', 'middle', 'right'][i]} lane${!done && blockedLanes[step] === i ? ', rock ahead' : ', clear'}`} aria-pressed={lane === i} disabled={done} onClick={() => setLane(i)}>{!done && blockedLanes[step] === i && <span className="terrain-rock" aria-hidden="true" />}{lane === i && <span className="tiny-rover" aria-hidden="true"><i /><i /><b /><i /><i /></span>}</button>)}
      <span className="navigation-distance">{done ? 'SAFE ARRIVAL' : `MOVE ${step + 1} / 3`}</span>
    </div>
    <div className="navigation-buttons"><button disabled={done || lane === 0} onClick={() => setLane(n => n - 1)} aria-label="Steer left"><ArrowLeft /></button><button disabled={done} onClick={drive}>{done ? <><Check /> Route complete</> : <>Drive forward <ArrowRight /></>}</button><button disabled={done || lane === 2} onClick={() => setLane(n => n + 1)} aria-label="Steer right"><ArrowRight /></button></div>
    <small role="status">{message} Keyboard: left/right to steer, up to drive.</small>
    {!done && <button className="quiet-reset" onClick={() => { setLane(1); setStep(0); setMessage('Choose a clear lane, then move forward.') }}><RotateCcw size={13} /> Start over</button>}
  </div>
}
