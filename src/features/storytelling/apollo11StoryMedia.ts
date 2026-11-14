import type { StoryEvidenceMedia } from '../../components/storytelling/StoryMedia'

const base = { kind: 'Photograph' as const, credit: 'NASA', verifiedOn: '2026-11-10',
  usagePolicyUrl: 'https://www.nasa.gov/nasa-brand-center/images-and-media/',
  usageNotes: 'Educational factual use under NASA media guidelines; no endorsement. Third-party and identifiable-person rights remain applicable.' }
function photo(id: string, title: string, caption: string, alt: string, width: number, height: number): StoryEvidenceMedia {
  // Official remote evidence only: no new image binary is included in this review.
  const src = `https://images-assets.nasa.gov/image/${id}/${id}~medium.jpg`
  return { ...base, id, title, caption, alt, src, srcSet: `${src} ${width}w`, width, height,
    sourceUrl: `https://images.nasa.gov/details/${id}`, originalUrl: `https://images-assets.nasa.gov/image/${id}/${id}~orig.jpg` }
}
export const apollo11StoryMedia = {
  array: photo('as11-37-5551', 'The deployed experiment packages', 'AS11-37-5551: photographed from inside Eagle. The laser reflector is nearer the camera on the right; the seismic package is farther away. This is a historical photograph, not a live measurement.', 'Two Apollo 11 experiment packages rest in gray lunar soil marked by footprints, viewed through Eagle’s window.', 1280, 1280),
  carried: { ...photo('as11-40-5942', 'Carrying the experiments', 'AS11-40-5942: Buzz Aldrin carries the seismic package and laser retroreflector. Neil Armstrong took the photograph. It shows transport, not the moment of alignment.', 'Buzz Aldrin carries two scientific experiment packages by hand across the lunar surface, one in each hand.', 1248, 1280), credit: 'NASA / Neil A. Armstrong' },
  launch: photo('S69-39529', 'Apollo 11 leaves Earth', 'S69-39529: Saturn V launches Apollo 11 from Pad 39A on July 16, 1969. The reflector traveled aboard the mission; it did not propel itself.', 'The Apollo 11 Saturn V rises beside the launch tower at Kennedy Space Center above bright exhaust and smoke.', 1280, 1253),
} satisfies Record<string, StoryEvidenceMedia>
