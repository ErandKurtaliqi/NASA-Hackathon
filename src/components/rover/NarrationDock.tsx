import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Headphones, X, ExternalLink } from 'lucide-react'
import type { MachineStory } from '../../machineStories'
import { chapterTracks, type NarrativeChapter } from './roverExperience'

export default function NarrationDock({ story, chapter }: { story: MachineStory; chapter: NarrativeChapter }) {
  const [open, setOpen] = useState(false), [index, setIndex] = useState(0)
  const [failed,setFailed]=useState(false)
  const audio = useRef<HTMLAudioElement>(null)
  const tracks = chapterTracks(story, chapter)
  const track = tracks[index]
  useEffect(() => () => { audio.current?.pause() }, [])
  return <div className={`cinema-narration ${open ? 'open' : ''}`}>
    <button className="cinema-listen" aria-expanded={open} aria-controls="narration-drawer" onClick={() => { if (open) audio.current?.pause(); setOpen(!open) }}><Headphones size={17} />{tracks.length ? 'Read & listen' : 'Mission notes'}</button>
    {open && <div className="narration-drawer" id="narration-drawer" role="region" aria-label="Read and listen to this chapter">
      <button className="narration-close" aria-label="Close narration" onClick={() => { audio.current?.pause(); setOpen(false) }}><X size={18} /></button>
      {track ? <><span>CHAPTER AUDIO · {index + 1} / {tracks.length}</span><h3>{track.title}</h3><p>{track.text}</p><audio onError={()=>setFailed(true)} onLoadStart={()=>setFailed(false)} key={track.audio} ref={audio} src={track.audio} controls preload="metadata" aria-label={`Narration: ${track.title}`} onPlay={e => document.querySelectorAll('audio').forEach(a => { if (a !== e.currentTarget) a.pause() })} />{failed&&<p role="alert">Audio could not load. <a href={track.audio}>Open the MP3</a></p>}<div className="narration-navigation"><button disabled={index === 0} onClick={() => setIndex(n => n - 1)} aria-label="Previous narration"><ChevronLeft /></button><small>{index + 1} of {tracks.length}</small><button disabled={index === tracks.length - 1} onClick={() => setIndex(n => n + 1)} aria-label="Next narration"><ChevronRight /></button></div>{track.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}<ExternalLink size={12} /></a>)}</> : <><span>MISSION RECORD</span><h3>{story.name}</h3><p>{chapter === 'meet' ? story.intro : chapter === 'journey' ? story.journey.map(event => event.copy).join(' ') : chapter === 'discoveries' ? story.discoveries.map(d => d.detail).join(' ') : chapter === 'challenge' ? story.challenges.map(c => `${c.problem} ${c.solution}`).join(' ') : story.legacy[story.legacy.length-1]?.copy}</p>{story.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}<ExternalLink size={12} /></a>)}</>}
    </div>}
  </div>
}
