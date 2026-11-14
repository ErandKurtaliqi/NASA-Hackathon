import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PlanetId } from '../../types'
import type useHomeNarration from './useHomeNarration'
import type { HomeRecording } from './homeNarration'
import { homeCaptions } from './homeCaptions'
import styles from '../../pages/HomePage.module.css'

export default function AstronautGuide({ highlighted, selected, narration, astronaut }: {
  highlighted: PlanetId | null; selected: PlanetId | null
  narration: ReturnType<typeof useHomeNarration>; astronaut: string
}) {
  // Hover previews text only. An active voice takes precedence so its captions
  // cannot be replaced by a different world's silent hover preview.
  const playing = narration.enabled && narration.phase !== 'ended' ? narration.recording : null
  const topic = playing ?? highlighted ?? selected ?? narration.recording ?? 'intro'
  const segments = homeCaptions[topic]
  const [manual, setManual] = useState<{ topic: HomeRecording; index: number; announcement: string } | null>(null)
  useEffect(() => { setManual(null) }, [topic, playing])
  const index = playing ? narration.caption : manual?.topic === topic ? manual.index : topic === narration.recording ? narration.caption : 0
  const blocked = !!playing && !narration.duration
  const move = (offset: number) => {
    const next = Math.max(0, Math.min(segments.length - 1, index + offset))
    if (playing && !narration.seekCaption(next)) return
    setManual({ topic, index: next, announcement: segments[next] })
  }

  return <aside className={styles.guide} aria-label="Your astronaut guide">
    <p className={styles.speech}>
      <span className={styles.captionText} aria-hidden="true" data-home-caption={topic}>{segments[index]}</span>
      {/* Full wording remains readable by assistive technology without announcing
          each automatic segment over the astronaut's voice. */}
      <span className={styles.srOnly} id="astronaut-dialogue">{segments.join(' ')}</span>
      <span className={styles.captionControls}>
        <button type="button" aria-label="Previous astronaut caption" aria-describedby="astronaut-caption-help"
          disabled={blocked || index === 0} onClick={() => move(-1)}><ChevronLeft aria-hidden="true" /></button>
        <span aria-hidden="true">{index + 1} / {segments.length}</span>
        <button type="button" aria-label="Next astronaut caption" aria-describedby="astronaut-caption-help"
          disabled={blocked || index === segments.length - 1} onClick={() => move(1)}><ChevronRight aria-hidden="true" /></button>
      </span>
      <span className={styles.srOnly} id="astronaut-caption-help">Captions follow the audio approximately. With sound off, use these buttons to read at your own pace.</span>
      <span className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{manual?.topic === topic ? manual.announcement : ''}</span>
    </p>
    <img className={styles.astronaut} src={astronaut} alt="A smiling astronaut guide pointing toward the worlds to explore" width="320" height="440" decoding="async" />
  </aside>
}
