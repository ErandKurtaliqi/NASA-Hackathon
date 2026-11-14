import type { StoryPresentation } from '../../features/storytelling/storyPresentation'
import styles from './StoryPresentation.module.css'

function HardwareDiagram({ presentation }: { presentation: StoryPresentation }) {
  const label = `Simple 2D model of ${presentation.hardwareLabel}`
  const common = { className: styles.diagram, role: 'img' as const, 'aria-label': label, 'data-hardware-diagram': presentation.hardware }

  if (presentation.hardware === 'stationary-experiment') return <svg {...common} viewBox="0 0 440 420">
    <path d="m80 354 67-92 185 15 46 92-28 7-44-60-158-12-39 61z" fill="#9b9b92" />
    <path d="m67 65 276-19 27 242-276 35z" fill="#ded9c7" stroke="#858b91" strokeWidth="6" />
    {Array.from({ length: 100 }, (_, i) => <g key={i} transform={`translate(${87 + i % 10 * 25} ${82 + Math.floor(i / 10) * 22})`}>
      <circle r="8" fill="#263e4b" stroke="#bdc8c9" strokeWidth="1.8" /><path d="M-5-3 0 5 5-3Z" fill="#9cb3bb" opacity=".7" />
    </g>)}
    <path d="m100 329 265-35-16 21-244 32Z" fill="#aaa797" />
  </svg>

  if (presentation.hardware === 'helicopter') return <svg {...common} viewBox="0 0 520 320">
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M70 82h380M120 70h280M260 70v112" strokeWidth="7" />
      <path d="M238 123h44l28 72-50 38-50-38z" fill="#b8c2c9" strokeWidth="5" />
      <path d="M224 190h72v36h-72zM235 226l-70 58m120-58 70 58M165 284h52m86 0h52" strokeWidth="6" />
      <path d="M260 123V91M249 91h22" strokeWidth="5" />
    </g>
  </svg>

  if (presentation.hardware === 'lander') return <svg {...common} viewBox="0 0 520 320">
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M202 116h116l38 86-96 48-96-48z" fill="#aeb8bf" strokeWidth="6" />
      <path d="M222 116l20-46h36l20 46M182 198l-92 74m248-74 92 74M260 246v42M72 278h54m268 0h54m-214 10h52" strokeWidth="7" />
      <path d="M300 95c36-32 74-29 102-1-35 29-71 30-102 1ZM351 96l-47 35" strokeWidth="5" />
      <circle cx="260" cy="174" r="18" fill="#263e4b" strokeWidth="5" />
    </g>
  </svg>

  if (presentation.hardware === 'lunar-rover') return <svg {...common} viewBox="0 0 560 320">
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M126 201h288l-32 48H160z" fill="#aeb8bf" strokeWidth="6" />
      <path d="M185 201v-63h58l20 63m34 0 24-82h48v82M222 137v-34m112 15V79" strokeWidth="7" />
      <path d="M334 81c40-35 78-30 105 2-37 30-73 30-105-2ZM386 84l-44 42" strokeWidth="5" />
      <path d="M151 248l-28 27m286-27 28 27" strokeWidth="6" />
      {[142, 229, 331, 418].map(x => <g key={x}><circle cx={x} cy="272" r="31" fill="#111820" strokeWidth="7" /><circle cx={x} cy="272" r="13" strokeWidth="4" /></g>)}
    </g>
  </svg>

  return <svg {...common} viewBox="0 0 560 320">
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M148 181h270l-22 72H164z" fill="#aeb8bf" strokeWidth="6" />
      <path d="M244 181v-76h44v76m-21-76V72m-22 0h44M302 181l36-48h58l22 48" strokeWidth="7" />
      <path d="M173 252l-25 25m244-25 25 25" strokeWidth="5" />
      {[137, 202, 365, 430].map(x => <g key={x}><circle cx={x} cy="275" r="27" fill="#111820" strokeWidth="7" /><circle cx={x} cy="275" r="10" strokeWidth="4" /></g>)}
      <circle cx="267" cy="92" r="13" fill="#263e4b" strokeWidth="5" />
    </g>
  </svg>
}

/** A compact, mission-specific 2D hardware model stays visible while the story scrolls.
 * Historical photographs remain in the evidence panel with their original attribution. */
export default function StoryHardware({ presentation, tagline, name }: { presentation: StoryPresentation; tagline: string; name?: string }) {
  const { portrait, portraitStyle, hardwareLabel } = presentation
  const reflector = portraitStyle === 'reflector'
  return <figure className={styles.hardware} aria-label={name ?? hardwareLabel} data-hardware-kind={presentation.hardware} data-portrait={portraitStyle}>
    <div className={styles.hardwareImage}><HardwareDiagram presentation={presentation} /></div>
    <figcaption>
      <strong>{hardwareLabel}</strong><p>{tagline}</p>
      <small>{reflector ? 'Educational 2D diagram · 100 corner cubes' : 'Simple educational 2D model · not to scale'}</small>
      <small>Reference credit: {portrait.credit}</small>
      <a href={portrait.sourceUrl} aria-label="Official source: NASA hardware reference" target="_blank" rel="noreferrer">Official source <span aria-hidden="true">↗</span></a>
    </figcaption>
  </figure>
}
