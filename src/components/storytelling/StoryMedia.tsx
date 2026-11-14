import { useState, type ReactNode } from 'react'
import type { StoryImageMedia } from '../../features/storytelling/journeyMedia'
import styles from './StoryMedia.module.css'

export type StoryEvidenceMedia = Omit<StoryImageMedia, 'kind'> & { kind: StoryImageMedia['kind'] | 'Video frame · actual mission footage' }

export type DocumentaryGalleryItem = StoryEvidenceMedia
  | { type: 'video'; url: string; label: string }
  | { type: 'youtube'; url: string; label: string; videoId: string }

function ImageFrame({ media, motionEnabled }: { media: StoryEvidenceMedia; motionEnabled: boolean }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  return <>
    <div className={styles.frame} aria-busy={state === 'loading'}>
      {state !== 'error' && <img src={media.src} srcSet={media.srcSet}
        sizes="(max-width: 980px) 100vw, 50vw" width={media.width} height={media.height}
        alt={media.alt} decoding="async" onLoad={() => setState('ready')} onError={() => setState('error')}
        className={`${styles.image} ${state === 'ready' ? styles.ready : ''} ${motionEnabled ? styles.motion : ''}`} />}
      {state === 'loading' && <p className={styles.message} role="status">Loading mission image…</p>}
      {state === 'error' && <div className={styles.message} role="status">
        <p>The mission image could not load. Keep reading, or open the official source below.</p>
        <button type="button" onClick={() => setState('loading')}>Retry image</button>
      </div>}
    </div>
  </>
}

/** Only the image frame resets on a source change; story and scene state stay outside. */
export default function StoryMedia({ media, motionEnabled = true, fallback = null }: {
  media?: StoryEvidenceMedia
  motionEnabled?: boolean
  fallback?: ReactNode
}) {
  if (!media) return <>{fallback}</>
  return <figure className={styles.media} data-step-media={media.id} aria-label={`Mission image: ${media.title}`}>
    <ImageFrame key={media.src} media={media} motionEnabled={motionEnabled} />
    <figcaption className={styles.caption}>
      <span className={styles.kind}>{media.kind}</span>
      <h3>{media.title}</h3>
      <p>{media.caption}</p>
      <div className={styles.attribution}><span>Credit: {media.credit}</span><a href={media.sourceUrl} target="_blank" rel="noreferrer">Official source ↗</a></div>
    </figcaption>
  </figure>
}
