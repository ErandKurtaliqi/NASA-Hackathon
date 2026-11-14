import { useState } from 'react'
import { missionStageSurfaces } from '../../features/storytelling/missionStageAssets'
import type { StoryWorld } from '../../features/storytelling/storyPresentation'
import styles from './StoryPresentation.module.css'
import { apollo15StageAssets } from '../../features/storytelling/storyStageAssets'

/** Decorative terrain, never a geographic reconstruction or documentary image. */
export default function StoryEnvironment({ world, idPrefix }: { world: StoryWorld; idPrefix: string }) {
  const [failed, setFailed] = useState(false)
  const stageSurface = missionStageSurfaces[idPrefix]
  if (world === 'moon' && idPrefix.startsWith('apollo15-')) return <div className={styles.photographicEnvironment} aria-hidden="true" data-world="moon" data-stage-source="jsc2011e118360">
    <img src={apollo15StageAssets.surface.src} alt="" decoding="async" />
    <div className={styles.surfaceShade} />
  </div>
  if (stageSurface && stageSurface.world === world && !failed) return <div className={styles.missionEnvironment} aria-hidden="true" data-world={world} data-stage-mission={idPrefix}>
    <img src={stageSurface.src} alt="" decoding="async" onError={() => setFailed(true)} />
    <div className={styles.missionSurfaceShade} />
  </div>
  const ground = `${idPrefix}-ground`, grain = `${idPrefix}-grain`, shade = `${idPrefix}-shade`, surface = `${idPrefix}-surface`
  return <div className={styles.environment} data-world={world} aria-hidden="true">
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" focusable="false">
      <defs>
        <linearGradient id={ground} x2=".8" y2="1"><stop stopColor="var(--terrain-light)" /><stop offset=".6" stopColor="var(--terrain-mid)" /><stop offset="1" stopColor="#030811" /></linearGradient>
        <radialGradient id={shade}><stop stopColor="#020610" stopOpacity="0" /><stop offset="1" stopColor="#020610" stopOpacity=".9" /></radialGradient>
        <filter id={grain}><feTurbulence type="fractalNoise" baseFrequency=".8 .25" numOctaves="3" seed="17" /><feColorMatrix type="saturate" values="0" /></filter>
        <clipPath id={surface}><path d="M0 335 90 339 170 329 280 337 420 328 560 335 720 340 900 330 1100 335 1250 322 1440 313V900H0Z" /></clipPath>
      </defs>
      <g clipPath={`url(#${surface})`}>
        <rect y="300" width="1440" height="600" fill={`url(#${ground})`} />
        <path d="M0 372Q180 347 350 375T650 364T970 385T1440 340V900H0Z" fill="var(--terrain-mid)" opacity=".22" />
        <rect y="300" width="1440" height="600" filter={`url(#${grain})`} opacity=".18" />
        {/* Decorative regolith texture only; these shapes are not mapped features. */}
        {Array.from({ length: 60 }, (_, i) => {
          const y = 380 + (i * 137 % 500), x = i * 313 % 1440, radius = 2 + (y - 380) / 45
          return <g key={i} opacity=".15"><ellipse cx={x} cy={y} rx={radius * 2.8} ry={radius * .6} fill="#05070d" /><path d={`M${x - radius * 1.7} ${y}q${radius} ${-radius * .8} ${radius * 3.3} 0`} fill="none" stroke="#c2c7cf" strokeWidth="1.5" /></g>
        })}
      </g>
      <g fill="#080c15" opacity=".32"><ellipse cx="122" cy="493" rx="72" ry="12" /><ellipse cx="1180" cy="588" rx="105" ry="17" /><ellipse cx="320" cy="710" rx="130" ry="18" /><ellipse cx="1030" cy="815" rx="170" ry="24" /></g>
      <rect width="1440" height="900" fill={`url(#${shade})`} />
    </svg>
  </div>
}
