import type { StoryImageMedia } from './journeyMedia'

const localImage = (id: string, height: number) => ({
  src: `/media/perseverance-challenges/${id}-1440.jpg`,
  srcSet: `/media/perseverance-challenges/${id}-720.jpg 720w, /media/perseverance-challenges/${id}-1440.jpg 1440w`,
  width: 1440, height, verifiedOn: '2026-11-04',
  usagePolicyUrl: 'https://www.jpl.nasa.gov/jpl-image-use-policy/',
  usageNotes: 'Factual educational use under JPL image-use policy with the full caption credit. No endorsement implied; logo and third-party rights remain separate.',
})

/** Static published evidence, not geographic layers or new mission findings. */
export const challengeEvidence = {
  hazards: {
    ...localImage('hazards', 810), id: 'hazards', title: 'Choosing a safer landing site',
    kind: 'Illustration · not a photograph', credit: 'NASA/JPL-Caltech',
    caption: 'NASA/JPL’s landing hazard graphic: blue marks safer zones, red marks more dangerous terrain, and the green dot marks Perseverance’s landing spot.',
    alt: 'A NASA/JPL hazard graphic shows blue safer landing zones among red hazardous terrain, with a small green landing marker near the center.',
    sourceUrl: 'https://www.jpl.nasa.gov/images/pia23970-avoiding-hazards-at-jezero-crater/',
    originalUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA23970.jpg',
  },
  autonav: {
    ...localImage('autonav', 627), id: 'autonav', title: 'A route through the boulders',
    kind: 'Photographic mosaic', credit: 'NASA/JPL-Caltech',
    caption: 'Navigation-camera composite from June 29, 2023, annotated at JPL with visualization software. Blue lines and the rover visualization are overlays, not marks on Mars.',
    alt: 'An annotated navigation-camera composite shows a boulder field with blue rover and wheel paths winding around rocks and a rover visualization in the distance.',
    sourceUrl: 'https://www.jpl.nasa.gov/images/pia26071-perseverances-autonav-leads-the-way/',
    originalUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/PIA26071.jpg',
  },
  tubes: {
    ...localImage('tubes', 810), id: 'tubes', title: 'A collection kept in tubes',
    kind: 'Photographic mosaic', credit: 'NASA/JPL-Caltech/MSSS',
    caption: 'WATSON photomontage of ten tubes deposited at Three Forks from December 2022 to January 2023. Each panel is a separate photograph; this is not their arrangement on the ground.',
    alt: 'Ten separate photographic panels show individual sample tubes lying on Martian soil, with the rover’s shadow crossing several panels.',
    sourceUrl: 'https://www.jpl.nasa.gov/images/pia25738-watsons-photomontage-of-mars-sample-depot/',
    originalUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA25738.jpg',
  },
  delta: {
    ...localImage('delta', 536), id: 'delta', title: 'Layers from a watery past',
    kind: 'Photographic mosaic', credit: 'NASA/JPL-Caltech/LANL/CNES/CNRS/ASU/MSSS',
    caption: 'Five RMI images taken on March 17, 2021 form this Delta Scarp mosaic. Scientists interpret the sediment deposit as a remnant of an ancient river meeting a lake.',
    alt: 'A stitched remote-camera mosaic shows a layered, rocky delta escarpment with sloping sediment beds and a white border around the image footprint.',
    sourceUrl: 'https://www.jpl.nasa.gov/images/pia24683-mars-delta-scarp-from-more-than-a-mile-away/',
    originalUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA24683.jpg',
  },
  foux: {
    ...localImage('foux', 1076), id: 'foux', title: 'Looking closely at rock textures',
    kind: 'Photograph', credit: 'NASA/JPL-Caltech/MSSS',
    caption: 'WATSON photographed the Foux rock target on July 11, 2021. JPL uses this close-up in its report on water-altered crater-floor rocks; the photograph alone does not establish their chemistry or habitability.',
    alt: 'A close-up WATSON photograph of Foux shows a rough rock surface with grains, shallow pits and dusty material in the recesses.',
    sourceUrl: 'https://www.jpl.nasa.gov/images/pia24728-watson-views-foux/',
    originalUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA24728.jpg',
  },
} as const satisfies Record<string, StoryImageMedia>

export const challengeLessons = [
  { id: 'landing', media: challengeEvidence.hazards, discovery: 0,
    notice: 'Find the landing marker and compare it with the safer and more dangerous zones.',
    connection: 'A safe landing was the first step toward investigating Jezero’s ancient lake and river deposits.' },
  { id: 'autonomy', media: challengeEvidence.autonav, discovery: 1,
    notice: 'Trace the paths around the boulders. JPL added these lines to explain the drive.',
    connection: 'Reaching rocks lets me investigate their history, including the effects of water.' },
  { id: 'samples', media: challengeEvidence.tubes, discovery: 2,
    notice: 'Compare the separate image panels. The tubes were not photographed together in a row.',
    connection: 'Keeping material and its geologic context together helps future scientists interpret a sample.' },
] as const

export const discoveryLessons = [
  { id: 'lake', media: challengeEvidence.delta },
  { id: 'water', media: challengeEvidence.foux,
    contextUrl: 'https://www.jpl.nasa.gov/news/nasas-perseverance-makes-new-discoveries-in-mars-jezero-crater/' },
  { id: 'library', media: challengeEvidence.tubes },
] as const
