export const journeyStepIds = ['launch', 'cruise', 'entry', 'landing', 'explore'] as const
export type JourneyStepId = typeof journeyStepIds[number]

/** A still image with its provenance, suitable for other mission stories too. */
export type StoryImageMedia = {
  id: string
  title: string
  kind: 'Photograph' | 'Illustration · not a photograph' | 'Video frame · actual landing' | 'Photographic mosaic'
  caption: string
  alt: string
  credit: string
  sourceUrl: string
  originalUrl: string
  usagePolicyUrl: string
  usageNotes: string
  verifiedOn: string
  src: string
  srcSet: string
  width: number
  height: number
}

const nasaPolicy = 'https://www.nasa.gov/nasa-brand-center/images-and-media/'
const jplPolicy = 'https://www.jpl.nasa.gov/jpl-image-use-policy/'
const usageNotes = 'Educational, factual use with the stated credit; no NASA/JPL/Caltech endorsement implied. Logos and third-party rights remain subject to the source policy.'
const localImage = (id: JourneyStepId, height: number) => ({
  src: `/media/perseverance-journey/${id}-1440.jpg`,
  srcSet: `/media/perseverance-journey/${id}-720.jpg 720w, /media/perseverance-journey/${id}-1440.jpg 1440w`,
  width: 1440, height, verifiedOn: '2026-11-04', usageNotes,
})

/** Verified stills only. Never infer a media asset from a mission name or index. */
export const perseveranceJourneyMedia = {
  launch: {
    ...localImage('launch', 960), id: 'launch', title: 'Leaving Earth', kind: 'Photograph',
    caption: 'Atlas V carrying Perseverance lifts off from Cape Canaveral on July 30, 2020.',
    alt: 'An Atlas V rocket rises above its launch pad, with a bright exhaust plume and clouds of smoke beside the Florida coast.',
    credit: 'NASA/Joel Kowsky',
    sourceUrl: 'https://science.nasa.gov/resource/mars-2020-perseverance-launches-off-florida-coast/',
    originalUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/downloadable_items/4/5/45114_liftOff-from-distance-original.jpg?crop=faces%2Cfocalpoint&fit=clip&h=3086&w=4629',
    usagePolicyUrl: nasaPolicy,
  },
  cruise: {
    ...localImage('cruise', 729), id: 'cruise', title: 'Between two worlds', kind: 'Illustration · not a photograph',
    caption: 'NASA’s Eyes on the Solar System visualization shows Mars 2020 midway to Mars, with its solar-powered cruise stage and backshell.',
    alt: 'Illustration of the circular, solar-panel-covered Mars 2020 cruise stage in interplanetary space, with orbit lines behind it.',
    credit: 'NASA/JPL-Caltech',
    sourceUrl: 'https://science.nasa.gov/resource/mars-2020-spacecraft-mid-cruise-illustration/',
    originalUrl: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/downloadable_items/4/5/45366_PIA24231.png?crop=faces%2Cfocalpoint&fit=clip&h=1700&w=3360',
    usagePolicyUrl: nasaPolicy,
  },
  entry: {
    ...localImage('entry', 810), id: 'entry', title: 'Into the atmosphere', kind: 'Illustration · not a photograph',
    caption: 'An illustration of the aeroshell protecting Perseverance during guided atmospheric entry. This is not a camera view of the event.',
    alt: 'Illustration of Perseverance’s rounded aeroshell descending above the cratered, rust-colored surface of Mars.',
    credit: 'NASA/JPL-Caltech',
    sourceUrl: 'https://www.jpl.nasa.gov/images/pia24315-perseverance-guides-itself-towards-the-surface-illustration/',
    originalUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA24315.jpg',
    usagePolicyUrl: jplPolicy,
  },
  landing: {
    ...localImage('landing', 1080), id: 'landing', title: 'The real descent', kind: 'Video frame · actual landing',
    caption: 'A descent-stage camera looks down at Perseverance during the February 18, 2021 landing. The optional reconstruction is a separate learning activity.',
    alt: 'A real descent-camera frame looking down at Perseverance suspended on sky-crane cables above the dusty Martian surface.',
    credit: 'NASA/JPL-Caltech',
    sourceUrl: 'https://www.jpl.nasa.gov/images/pia24428-high-resolution-still-image-of-perseverances-landing/',
    originalUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA24428.jpg',
    usagePolicyUrl: jplPolicy,
  },
  explore: {
    ...localImage('explore', 810), id: 'explore', title: 'Reading the rocks', kind: 'Photographic mosaic',
    caption: 'Perseverance at Rochette on September 10, 2021, after drilling rock cores. This WATSON selfie combines photographs; it is not a single exposure.',
    alt: 'A stitched rover selfie shows Perseverance beside the flat Rochette rock and its drill holes on the rocky floor of Jezero Crater.',
    credit: 'NASA/JPL-Caltech/MSSS',
    sourceUrl: 'https://www.jpl.nasa.gov/images/pia24836-perseverances-selfie-at-rochette/',
    originalUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA24836.jpg',
    usagePolicyUrl: jplPolicy,
  },
} as const satisfies Record<JourneyStepId, StoryImageMedia>

export function getPerseveranceJourneyMedia(stepId: string): StoryImageMedia | undefined {
  return Object.prototype.hasOwnProperty.call(perseveranceJourneyMedia, stepId)
    ? perseveranceJourneyMedia[stepId as JourneyStepId] : undefined
}
