import type { StoryEvidenceMedia } from '../../components/storytelling/StoryMedia'

/** Presentation sources only: no scientific scene, model, map or coordinates.
 * Original NASA pixels are used remotely, never generated or relabelled as art.
 * The stage is explicitly a photographic composition, not a single mission photo.
 */
export const apollo15StageAssets = {
  surface: { src: 'https://images-assets.nasa.gov/image/jsc2011e118360/jsc2011e118360~large.jpg',
    sourceUrl: 'https://images.nasa.gov/details/jsc2011e118360', credit: 'NASA',
    description: 'Apollo 15 Station 8 panorama, assembled by NASA from AS15-82-11054 through AS15-82-11058.' },
  hardware: { src: 'https://images-assets.nasa.gov/image/as15-88-11901/as15-88-11901~large.jpg',
    sourceUrl: 'https://images.nasa.gov/details/as15-88-11901', credit: 'NASA',
    description: 'Apollo 15 LRV-1, AS15-88-11901. Hand-traced presentation mask; original vehicle pixels, no generated reconstruction.' },
  usagePolicyUrl: 'https://www.nasa.gov/nasa-brand-center/images-and-media/',
  verifiedOn: '2026-11-11',
}

export const apollo15OpeningEvidence: StoryEvidenceMedia = {
  id: 'apollo15-launch', title: 'Launch · July 26, 1971', kind: 'Photograph',
  src: 'https://images-assets.nasa.gov/image/S71-41356/S71-41356~large.jpg',
  originalUrl: 'https://images-assets.nasa.gov/image/S71-41356/S71-41356~large.jpg',
  srcSet: 'https://images-assets.nasa.gov/image/S71-41356/S71-41356~large.jpg 903w', width: 903, height: 1920,
  caption: 'S71-41356: Apollo 15 lifts off from Kennedy Space Center on July 26, 1971. Actual mission photograph; distinct from the May rollout shown later.',
  alt: 'The Apollo 15 Saturn V rises beside its red launch tower, with a bright exhaust flame and smoke below against a blue Florida sky.',
  sourceUrl: 'https://images.nasa.gov/details/S71-41356', credit: 'NASA', verifiedOn: '2026-11-11',
  usagePolicyUrl: apollo15StageAssets.usagePolicyUrl,
  usageNotes: 'NASA mission photograph for educational use. No endorsement implied; preserve attribution and third-party restrictions.',
}

// Deliberate integration contract. No substitute Moon photo is painted red and
// no rover is used as a Viking lander. Missing assets are a visible review limit.
export const marsStageAssetRequirements = {
  hardware: 'Verified Viking 1 lander cutout with transparency; no wheels',
  surface: 'Credited Viking 1 Chryse surface panorama, with documented image usage',
  status: 'awaiting-approved-stage-assets',
} as const
