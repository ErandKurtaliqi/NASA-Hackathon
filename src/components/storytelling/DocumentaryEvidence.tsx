import { useEffect, useRef, useState } from 'react'
import type { StoryEvidenceMedia } from './StoryMedia'

/** Keep the frame fixed while preloading and smoothly replacing current evidence. */
export default function DocumentaryEvidence({ media: primary, gallery, video, optionalVideo, source, sourceLabel, sourceSummary }: {
  gallery?: readonly StoryEvidenceMedia[]
  video?: string
  optionalVideo?: { url: string; label: string }
  media?: StoryEvidenceMedia
  source: string
  sourceLabel?: string
  sourceSummary?: string
}) {
  const [index, setIndex] = useState(0)
  const media = gallery?.[index] ?? primary
  const [loaded, setLoaded] = useState(media)
  const [failedId, setFailedId] = useState<string>()
  const serial = useRef(0)
  const shown = media ? loaded : undefined
  const failed = !!media && failedId === media.id
  const pending = !!media && loaded?.id !== media.id && !failed

  useEffect(() => {
    const ticket = ++serial.current
    setFailedId(undefined)
    if (!media) {
      setLoaded(undefined)
      return
    }
    const next = new Image()
    next.onload = () => { if (ticket === serial.current) setLoaded(media) }
    next.onerror = () => {
      if (ticket === serial.current) {
        setLoaded(undefined)
        setFailedId(media.id)
      }
    }
    next.src = media.src
    return () => {
      ++serial.current
      next.onload = next.onerror = null
    }
  }, [media])

  if (gallery?.length === 0) return <div data-documentary-evidence data-evidence-id="none" />

  return <div data-documentary-evidence data-evidence-id={media?.id ?? 'source-only'} data-displayed-evidence-id={shown?.id ?? 'source-only'}>
    <p>{gallery ? 'MISSION EVIDENCE' : 'NASA DOCUMENTARY EVIDENCE'}</p>
    <figure aria-busy={pending}>
      <div>
        {shown && <img key={shown.id} src={shown.src} width={shown.width} height={shown.height} alt={shown.alt} decoding="async" />}
        {video && <video key={video} src={video} controls playsInline preload="metadata" aria-label={sourceLabel} style={{ width: '100%', height: '100%' }} />}
        {!media && !video && <div data-source-evidence><small>SCIENTIFIC SOURCE</small><strong>{sourceLabel ?? 'Mission evidence record'}</strong><p>{sourceSummary ?? 'Read the scientific source for this part of the story.'}</p></div>}
        {media && !shown && <p>{failed ? 'Selected image could not load. The exact source remains available.' : 'Loading the selected evidence.'}</p>}
      </div>
      <figcaption>
        {gallery && gallery.length > 1 && <nav aria-label="Evidence images" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" aria-label="Previous evidence image" disabled={index === 0} onClick={() => setIndex(value => value - 1)}>‹</button>
          <span aria-live="polite">{index + 1} / {gallery.length}</span>
          <button type="button" aria-label="Next evidence image" disabled={index === gallery.length - 1} onClick={() => setIndex(value => value + 1)}>›</button>
        </nav>}
        {pending && <p role="status">Loading the next section's evidence.</p>}
        {failed && <p role="status">Selected image could not load. The exact source remains available.</p>}
        {shown && <><small>{shown.kind}</small><h3>{shown.title}</h3><p>{shown.caption}</p><p>Credit: {shown.credit}</p><a href={shown.sourceUrl} target="_blank" rel="noreferrer">Image source ↗</a></>}
        {!media && <><h3>{sourceLabel ?? 'Mission evidence record'}</h3><p>{sourceSummary ?? 'Use the exact source supplied for this narration section.'}</p></>}
        {video && <a href={video} target="_blank" rel="noreferrer">Open NASA video ↗</a>}
        {optionalVideo && <p><a href={optionalVideo.url} target="_blank" rel="noreferrer">Optional video · {optionalVideo.label} ↗</a></p>}
        <a href={source} target="_blank" rel="noreferrer">Open this section's evidence ↗</a>
      </figcaption>
    </figure>
  </div>
}
