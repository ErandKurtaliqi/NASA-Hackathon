import { useEffect, useRef, useState } from 'react'
import type { DocumentaryGalleryItem, StoryEvidenceMedia } from './StoryMedia'

/** Keep the frame fixed while preloading and smoothly replacing current evidence. */
export default function DocumentaryEvidence({ media: primary, gallery, video, youtubeVideoId, source, sourceLabel, sourceSummary }: {
  gallery?: readonly DocumentaryGalleryItem[]
  video?: string
  youtubeVideoId?: string
  media?: StoryEvidenceMedia
  source: string
  sourceLabel?: string
  sourceSummary?: string
}) {
  const [index, setIndex] = useState(0)
  const selected = gallery?.[index]
  const selectedVideo = selected && 'type' in selected ? selected : undefined
  const media = selected && 'src' in selected ? selected : selectedVideo ? undefined : primary
  const videoSrc = selectedVideo?.type === 'video' ? selectedVideo.url : video
  const embedId = selectedVideo?.type === 'youtube' ? selectedVideo.videoId : youtubeVideoId
  const label = selectedVideo?.label ?? sourceLabel
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
        {videoSrc && <video key={videoSrc} src={videoSrc} controls playsInline preload="metadata" aria-label={label} style={{ width: '100%', height: '100%' }} />}
        {embedId && <iframe
          src={'https://www.youtube.com/embed/' + encodeURIComponent(embedId)}
          title={label ?? 'Mission evidence video'}
          allow="encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ display: 'block', width: '100%', height: '100%', border: 0 }}
        />}
        {selectedVideo?.type === 'link' && <div data-source-evidence><a href={selectedVideo.url} target="_blank" rel="noreferrer">{selectedVideo.label} ↗</a></div>}
        {!media && !videoSrc && !embedId && !selectedVideo && <div data-source-evidence><small>SCIENTIFIC SOURCE</small><strong>{sourceLabel ?? 'Mission evidence record'}</strong><p>{sourceSummary ?? 'Read the scientific source for this part of the story.'}</p><a href={source} target="_blank" rel="noreferrer">Open source ↗</a></div>}
        {media && !shown && <p role="status">{failed ? 'Selected image could not load. See Mission sources.' : 'Loading the selected evidence.'}</p>}
      </div>
      {(gallery || media) && <figcaption>
        <nav aria-label="Evidence gallery">
          {gallery && gallery.length > 1 && <button type="button" aria-label="Previous evidence image" disabled={index === 0} onClick={() => setIndex(value => value - 1)}>‹</button>}
          <span aria-live="polite">{index + 1}/{gallery?.length ?? 1}</span>
          {gallery && gallery.length > 1 && <button type="button" aria-label="Next evidence image" disabled={index === gallery.length - 1} onClick={() => setIndex(value => value + 1)}>›</button>}
        </nav>
      </figcaption>}
    </figure>
  </div>
}
