import type { StoryEvidenceMedia } from '../../components/storytelling/StoryMedia'

const policy = 'https://www.nasa.gov/nasa-brand-center/images-and-media/'
const gallery = 'https://www.nasa.gov/specials/apollo50th/photos.html'
const common = { kind: 'Photograph' as const, credit: 'NASA', usagePolicyUrl: policy, verifiedOn: '2026-11-08',
  usageNotes: 'Factual educational use under NASA media guidelines; credit NASA, no endorsement implied. Third-party rights and identifiable-person restrictions still apply.' }
function image(id: string, title: string, caption: string, alt: string, originalUrl: string, sourceUrl: string, width: number, height: number): StoryEvidenceMedia {
  const src = `/images/apollo17-story/${id}.jpg`
  return { ...common, id, title, caption, alt, originalUrl, sourceUrl, width, height, src, srcSet: `${src} ${width}w` }
}

export const apollo17StoryMedia = {
  vehicle: { ...image('vehicle', 'Schmitt aboard LRV-3', 'AS17-134-20454: Harrison Schmitt seated in the rover at Station 9, Van Serg Crater, during the third Apollo 17 EVA. This is fieldwork, not a deployment photograph.',
    'Harrison Schmitt sits in the open lunar rover at Van Serg Crater, with its mesh wheels and antenna visible.',
    'https://www.nasa.gov/wp-content/uploads/static/apollo50th/img/apollo17-07.jpg', gallery, 534, 534), credit: 'NASA / Eugene A. Cernan' },
  launch: image('launch', 'Apollo 17 leaves Earth', 'S72-55070: the Saturn V launches from Kennedy Space Center at 12:33 a.m. EST on December 7, 1972. This is an actual nighttime launch photograph.',
    'Flame from Saturn V illuminates the nighttime launch pad and surrounding clouds during Apollo 17 liftoff.',
    'https://images-assets.nasa.gov/image/S72-55070/S72-55070~small.jpg', 'https://images.nasa.gov/details/S72-55070', 640, 396),
  field: image('rover', 'A rover in a rocky valley', 'NASA catalogue 7036668: the Apollo 17 rover parked near a large lunar boulder at Taurus-Littrow. Surface fieldwork context, not a photograph of the landing or a specific engineering failure.',
    'The lunar rover is parked among large rocks on the uneven floor of the Taurus-Littrow valley.',
    'https://images-assets.nasa.gov/image/7036668/7036668~small.jpg', 'https://images.nasa.gov/details/7036668', 538, 640),
  orange: image('orange', 'Orange soil at Shorty Crater', 'AS17-137-20990: orange soil at Station 4, Shorty Crater, during EVA 2. The gnomon and photometric chart provide scale and a color reference; this is an original surface photograph.',
    'A patch of orange lunar soil contrasts with gray regolith beside a gnomon and photographic reference chart.',
    'https://www.nasa.gov/wp-content/uploads/static/apollo50th/img/apollo17-08.jpg', gallery, 494, 534),
} satisfies Record<string, StoryEvidenceMedia>
export type Apollo17MediaId = keyof typeof apollo17StoryMedia
