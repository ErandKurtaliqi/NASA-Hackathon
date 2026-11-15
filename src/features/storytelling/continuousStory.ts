import { chapterMeta, type MachineStory } from '../../machineStories'
import { apollo15ChapterRecordings, apollo15QuizRecordings } from './apollo15Recordings'
import { apollo16ChapterRecordings, apollo16QuizRecordings } from './apollo16Recordings'
import { moonRecordings } from './moonRecordings'
import { isMarsStory, marsStoryContent, marsReviewNote } from './marsStories'
import { apollo15SegmentMedia, apollo15StoryMedia } from './apollo15StoryMedia'
import { apollo16SegmentMedia, apollo16StoryMedia } from './apollo16StoryMedia'
import { eagleAudioPath, eagleChapters } from './apollo11Eagle'
import apollo11Evidence from './apollo11Evidence.json'
import apollo15Evidence from './apollo15Evidence.json'
import apollo16Evidence from './apollo16Evidence.json'
import apollo17Evidence from './apollo17Evidence.json'
import { marsEvidenceFor } from './marsStoryMedia'
import { moonStoryPresentation, marsStoryPresentation, type StoryPresentation } from './storyPresentation'
import type { DocumentaryGalleryItem, StoryEvidenceMedia } from '../../components/storytelling/StoryMedia'

export type DocumentarySegment = {
  id: string; chapter: number; segment: number; title: string; text: string
  audio?: string; evidence?: StoryEvidenceMedia; gallery?: readonly DocumentaryGalleryItem[]; video?: string; youtubeVideoId?: string; optionalVideo?: { url: string; label: string }; evidenceLabel?: string; evidenceSummary?: string
  note?: string; audioHold?: string
  completion: 'intentional-chapter-action' | 'quiz'; source: string
}
export function documentaryPresentation(story: MachineStory): StoryPresentation {
  return ({ ...moonStoryPresentation, ...marsStoryPresentation } as Record<string, StoryPresentation>)[story.id]
}
export function terrainId(id: string) { return id.startsWith('apollo-') ? `apollo${id.split('-')[1]}-terrain` : `${id}-terrain` }

// Adapters over the reviewed scripts/media. No duplicate mission content, invented
// captions, coordinates or replacement photographs. Empty evidence is deliberate.
function evidenceGalleries(rows: readonly (typeof apollo11Evidence[number] | null)[]) {
  return rows.map(entries => entries?.map((image): StoryEvidenceMedia => ({
    ...image,
    kind: image.kind === 'Video frame · actual mission footage' ? image.kind : (image.kind === 'Illustration · not a photograph' || image.src.includes('lrv_deployment_art') || image.id === 'apollo17-battery' || image.src.startsWith('/images/apollo11-evidence/')) ? 'Illustration · not a photograph' : 'Photograph',
    originalUrl: image.src.startsWith('/images/') ? image.sourceUrl : image.src,
    srcSet: '',
    verifiedOn: '2026-11-13',
    usagePolicyUrl: 'https://www.nasa.gov/nasa-brand-center/images-and-media/',
    usageNotes: 'Evidence selected from the supplied Apollo storytelling package.',
  })))
}
const apollo11Galleries = evidenceGalleries(apollo11Evidence)
const apollo15Galleries = evidenceGalleries(apollo15Evidence)
const apollo16Galleries = apollo16Evidence.map(evidenceGalleries)
const apollo17Galleries = apollo17Evidence.map(evidenceGalleries)
const apollo17JourneyVideos: Record<number, Extract<DocumentaryGalleryItem, { type: 'video' | 'youtube' }>> = {
  1: { type: 'video', url: 'https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004717/apollo17_flyover_1080p30.mp4', label: 'Taurus-Littrow flyover · NASA Scientific Visualization Studio' },
  2: { type: 'youtube', videoId: 'NBNhUNROV5U', url: 'https://youtu.be/NBNhUNROV5U?si=HTq_GbUvXqgmPb-7', label: 'Apollo Lunar Rover Deployment' },
}
const apollo17LiftoffVideo = { url: 'https://youtu.be/9HQfauGJaTs?si=ZtNvhBfl0bieWShj', label: 'Apollo 17 lunar liftoff · Smithsonian National Air and Space Museum on YouTube' }
const apollo11GalleryOffsets = [0, 4, 8, 11]

export function documentarySegments(story: MachineStory): DocumentarySegment[] {
  return chapterMeta.slice(0, 4).flatMap((chapter, c) => {
    const tracks = story.id === 'apollo-15-rover' ? apollo15ChapterRecordings[c]
      : story.id === 'apollo-16-rover' ? apollo16ChapterRecordings[c]
      : story.id === 'apollo-11-eagle' ? eagleChapters[c]
      : story.id === 'apollo-11-reflector' ? moonRecordings['11'][c]
      : story.id === 'apollo-17-rover' ? moonRecordings['17'][c]
      : isMarsStory(story.id) ? marsStoryContent[story.id].chapters[c] : []
    return tracks.map((track, s) => {
      let evidence: StoryEvidenceMedia | undefined, note: string | undefined, audioHold: string | undefined
      let optionalVideo = story.id === 'apollo-17-rover' && c === 3 && s === 2 ? apollo17LiftoffVideo : undefined
      let video: string | undefined
      let youtubeVideoId: string | undefined
      let gallery: readonly DocumentaryGalleryItem[] | undefined
      let evidenceLabel: string | undefined, evidenceSummary: string | undefined
      let source = story.id === 'apollo-16-rover' ? apollo16ChapterRecordings[c][s].note.source.url : story.sources[0].url
      if (story.id === 'apollo-15-rover') {
        const images = apollo15Galleries[c * 4 + s]
        gallery = images
        evidence = images ? images[0] : apollo15StoryMedia[apollo15SegmentMedia[c][s]]
        if (c === 3 && s === 3) {
          evidence = undefined
          evidenceLabel = 'Apollo 15: Never Been on a Ride like this Before'
          evidenceSummary = 'NASA’s Apollo 15 mission footage.'
          youtubeVideoId = '1Mqsd0ru_pc'
          source = 'https://youtu.be/1Mqsd0ru_pc?si=W3z5PPmRZB5XqIXZ'
        }
      }
      else if (story.id === 'apollo-16-rover') {
        const images = apollo16Galleries[c][s]
        gallery = images
        evidence = images ? images[0] : apollo16StoryMedia[apollo16SegmentMedia[c][s]]
        note = apollo16ChapterRecordings[c][s].note.text
      }
      else if (story.id === 'apollo-11-eagle') {
        gallery = eagleChapters[c][s].gallery
        evidence = gallery.find((item): item is StoryEvidenceMedia => 'src' in item)
        if (c === 2 && s === 2) note = 'NASA credits Buzz Aldrin with deploying the retroreflector. The original recording says Neil Armstrong.'
        if (c === 1 && s === 0) note = 'Crews had previously orbited the Moon. Apollo 11 was the first crewed landing.'
      }
      else if (story.id === 'apollo-11-reflector' || story.id === 'apollo-17-rover') {
        const moon = moonRecordings[story.id === 'apollo-11-reflector' ? '11' : '17'][c][s]
        note = moon.review; audioHold = story.id === 'apollo-11-reflector' && moon.playback === 'review-required' ? moon.review : undefined
        if (story.id === 'apollo-11-reflector') {
          const images = apollo11Galleries[apollo11GalleryOffsets[c] + s]
          gallery = images
          evidence = images?.[0]
        }
        else {
          const images = apollo17Galleries[c][s]
          const journeyVideo = c === 1 ? apollo17JourneyVideos[s] : undefined
          gallery = journeyVideo ? [...(images ?? []), journeyVideo] : images
          evidence = images?.[0]
        }
      } else if (isMarsStory(story.id)) {
        const record = marsEvidenceFor(story.id, c, s)
        evidence = record.media; evidenceLabel = record.label; evidenceSummary = record.summary; source = record.sourceUrl
        video = record.video; gallery = record.gallery; optionalVideo = record.optionalVideo
        note = marsReviewNote(story.id, c, s) || undefined
      }
      const text = 'readingText' in track ? String(track.readingText) : track.text
      return { id: `${story.id}:${chapter.id}:${s + 1}`, chapter: c, segment: s, title: track.title, text,
        audio: track.audio, evidence, gallery, video, youtubeVideoId, optionalVideo, evidenceLabel, evidenceSummary, note, audioHold,
        completion: 'intentional-chapter-action' as const, source }
    })
  })
}
export function quizRecording(storyId: string, question: number) {
  if (storyId === 'apollo-11-eagle') return eagleAudioPath(5, question + 1)
  return storyId === 'apollo-15-rover' ? apollo15QuizRecordings[question] : storyId === 'apollo-16-rover' ? apollo16QuizRecordings[question] : `/audio/${storyId.startsWith('apollo-') ? storyId.split('-').slice(0, 2).join('-') : storyId}/chapter-5/${question + 1}.mp3`
}

// The activation line is 22% into the reader. A 12px dead band prevents
// boundary jitter; large jumps and reverse scrolling use the same rule.
export function activeDocumentSegment(tops: readonly number[], line: number, previous: number, hysteresis = 12) {
  let next = 0
  for (let i = 0; i < tops.length; i++) if (tops[i] <= line) next = i
  if (next > previous && tops[next] > line - hysteresis) return previous
  if (next < previous && tops[previous] <= line + hysteresis) return previous
  return next
}
