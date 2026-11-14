import type { StoryEvidenceMedia } from '../../components/storytelling/StoryMedia'

const history = 'https://www.nasa.gov/history/50-years-ago-apollo-15-on-the-moon-at-hadley-apennine/'
const policy = 'https://www.nasa.gov/nasa-brand-center/images-and-media/'
const common = {
  credit: 'NASA', usagePolicyUrl: policy, verifiedOn: '2026-11-08',
  usageNotes: 'Educational/informational use under NASA media guidelines. Credit NASA; no endorsement implied. Third-party and identifiable-person restrictions still apply.',
}
function photo(id: string, title: string, caption: string, alt: string, originalUrl: string, width: number, height: number, sourceUrl = history): StoryEvidenceMedia {
  const src = `/images/apollo15-story/${id}.jpg`
  return { ...common, id, title, caption, alt, originalUrl, sourceUrl, width, height, src, srcSet: `${src} ${width}w`, kind: 'Photograph' }
}
const articleImage = (file: string) => `https://www.nasa.gov/wp-content/uploads/2021/07/${file}.jpg?w=800`

export const apollo15StoryMedia = {
  rover: photo('rover', 'LRV-1 at Hadley-Apennine', 'AS15-88-11901: the Apollo 15 rover during the third lunar surface EVA. Historical photograph, not a reconstruction.',
    'The unoccupied Apollo 15 lunar rover with wire-mesh wheels, two seats and a dish antenna on the lunar surface.',
    'https://images-assets.nasa.gov/image/as15-88-11901/as15-88-11901~small.jpg', 612, 640, 'https://images.nasa.gov/details/as15-88-11901'),
  rollout: photo('rollout', 'Before launch: the rollout', 'S71-33786: Saturn V and its mobile launch tower leaving the Vehicle Assembly Building on May 11, 1971. This is a rollout, not liftoff.',
    'Apollo 15 Saturn V and its red launch tower ride a crawler-transporter away from the Vehicle Assembly Building.',
    'https://images-assets.nasa.gov/image/S71-33786/S71-33786~small.jpg', 519, 640, 'https://images.nasa.gov/details/S71-33786'),
  field: { ...photo('field', 'Fieldwork beside Hadley Rille', 'AS15-85-11451: David Scott works at the rover on July 31, 1971, photographed by James Irwin. This shows fieldwork, not the steering failure itself.',
    'David Scott stands at the parked rover beside the uneven terrain of Hadley Rille.',
    'https://images-assets.nasa.gov/image/as15-85-11451/as15-85-11451~small.jpg', 640, 640, 'https://images.nasa.gov/details/as15-85-11451'), credit: 'NASA / James B. Irwin' },
  genesis: photo('genesis', 'The Genesis Rock before collection', 'AS15-86-11671: the Genesis Rock at Station 7, Spur Crater, during the second EVA. A photograph of the sample in its field setting, not green volcanic glass.',
    'A light-colored lunar rock rests on a larger rock among gray regolith at Spur Crater before collection.',
    articleImage('apollo_15_moon_landing_26_eva2_station_7_genesis_rock_as15-86-11671hr'), 800, 798),
  hammer: { ...photo('hammer', 'The hammer and feather demonstration', 'S71-43788: a frame from the August 2, 1971 television demonstration. Actual mission imagery, not a simulation.',
    'David Scott stands on the lunar surface during the televised hammer and feather demonstration.',
    articleImage('apollo_15_moon_landing_31_feather_and_hammer_aug_2_1971_from_video_s71-43788'), 800, 691), kind: 'Video frame · actual mission footage' as const,
  },
  final: photo('final', 'Leaving a record on the Moon', 'AS15-88-11930: a final surface photograph with Falcon and the rover in the distance. This is a surface view, not an LRO orbital photograph or an ascent frame.',
    'Lunar surface with footprints in the foreground and the lunar module and rover small in the distance.',
    articleImage('apollo_15_moon_landing_34_eva3_final_surface_photo_lm_and_rover_in_distance_as15-88-11930hr'), 800, 806),
} satisfies Record<string, StoryEvidenceMedia>

export type Apollo15MediaId = keyof typeof apollo15StoryMedia
export const apollo15SegmentMedia: readonly (readonly Apollo15MediaId[])[] = [
  ['rover', 'field', 'rollout', 'rover'],
  ['rollout', 'rover', 'field', 'field'],
  ['field', 'field', 'genesis', 'field'],
  ['hammer', 'final', 'final', 'rover'],
]
