import type { StoryEvidenceMedia } from '../../components/storytelling/StoryMedia'
import images from './apollo16ImageManifest.json'
import { apollo16Sources } from './apollo16Story'

const captions = {
  rover: ['LRV-2 beside Orion', 'AS16-116-18578: Young and the Apollo 16 rover beside Orion at the beginning of EVA 3. Actual mission photograph; not the final parking position.', 'The Apollo 16 rover and an astronaut stand beside the gold-covered lunar module Orion, with wheel tracks and footprints in the foreground.'],
  field: ['A view from the rover', 'AS16-109-17849: Spook Crater and distant Stone Mountain during EVA 1. This contextual surface view does not show the later fender accident.', 'Lunar terrain viewed from the Apollo 16 rover, with a crater in the foreground and low rounded hills along the horizon.'],
  'grand-prix': ['The Lunar Rover Grand Prix', 'S72-37002: a frame from Duke\'s 16 mm film of Young driving during EVA 1, April 21, 1972. Actual mission footage, not a model or animation.', 'John Young drives the Apollo 16 rover over the gray lunar surface, with dust thrown behind its wheels.'],
  'big-muley': ['Collecting Big Muley', 'Television frame of Duke collecting Big Muley near Plum Crater during EVA 1. Original low-resolution mission footage; this is not a studio sample photograph.', 'A low-resolution television view shows Charles Duke on the lunar surface using a tool while collecting the large Big Muley rock.'],
  'north-ray': ['Fieldwork at North Ray', 'AS16-116-18607: Duke beside the rover at North Ray Crater during EVA 3. This is North Ray, not Stone Mountain or Plum Crater.', 'Charles Duke stands beside the Apollo 16 rover on rocky terrain near the rim of North Ray Crater.'],
  liftoff: ['Orion leaves the Moon', 'S72-35613: televised liftoff of Orion\'s ascent stage, April 23, 1972, from the rover camera. Historical video frame, not a live feed.', 'The Apollo 16 lunar module ascent stage lifts from its descent stage in a grainy color television image from the parked rover.'],
} as const

export type Apollo16MediaId = keyof typeof captions
export const apollo16StoryMedia = Object.fromEntries(images.map(item => {
  const id = item.id as Apollo16MediaId
  // Asset-safe integration: original NASA URLs, no copied image binaries.
  const [title, caption, alt] = captions[id], src = item.originalUrl
  return [id, { id, title, caption, alt, src, srcSet: `${src} ${item.width}w`, width: item.width, height: item.height,
    originalUrl: item.originalUrl, sourceUrl: id === 'liftoff' ? apollo16Sources.return.url : apollo16Sources.surface.url,
    credit: 'NASA', verifiedOn: '2026-11-09', usagePolicyUrl: 'https://www.nasa.gov/nasa-brand-center/images-and-media/',
    usageNotes: 'Educational/informational use under NASA media guidelines. Credit NASA; no endorsement implied. Third-party rights and identifiable-person restrictions still apply.',
    kind: ['grand-prix', 'big-muley', 'liftoff'].includes(id) ? 'Video frame · actual mission footage' : 'Photograph',
  }]
})) as Record<Apollo16MediaId, StoryEvidenceMedia>

export const apollo16SegmentMedia: readonly (readonly Apollo16MediaId[])[] = [
  ['rover', 'field', 'rover', 'north-ray'],
  ['rover', 'field', 'north-ray', 'grand-prix'],
  ['field', 'north-ray', 'big-muley'],
  ['grand-prix', 'rover', 'rover', 'liftoff'],
]
