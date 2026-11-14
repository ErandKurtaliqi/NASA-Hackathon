import { ingenuityStoryMedia } from './ingenuityStoryMedia'

/** Mission-specific stage photography, separate from documentary evidence and GIS.
 * Original remote NASA resources only. No private media or generated terrain.
 * Panoramas may be assembled/processed by NASA; the stage is a labelled composition.
 */
export type MissionStageSurface = { world: 'moon' | 'mars'; src: string; sourceUrl: string; credit: string; label: string }
const nasa = (id: string, label: string, version = 'orig'): MissionStageSurface => ({ world: 'moon',
  src: `https://images-assets.nasa.gov/image/${id}/${id}~${version}.jpg`,
  sourceUrl: `https://images.nasa.gov/details/${id}`, credit: 'NASA', label })
export const missionStageSurfaces: Record<string, MissionStageSurface> = {
  'apollo11-terrain': nasa('jsc2008e040725', 'Apollo 11 · Tranquility Base panorama', 'large'),
  'apollo16-terrain': nasa('jsc2011e118362', 'Apollo 16 · Station 10 panorama'),
  'apollo17-terrain': nasa('jsc2004e20304', 'Apollo 17 · Station 5 panorama'),
  'sojourner-terrain': { world: 'mars', label: 'Mars Pathfinder · PIA01005 panorama', credit: 'NASA/JPL',
    src: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia01/pia01005/PIA01005.jpg?w=1920',
    sourceUrl: 'https://science.nasa.gov/photojournal/360-degree-color-panorama/' },
  'opportunity-terrain': { world: 'mars', label: 'Opportunity · PIA18393 Pillinger Point panorama', credit: 'NASA/JPL-Caltech/Cornell/Arizona State Univ.',
    src: 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia18/pia18393/PIA18393.jpg?w=1920',
    sourceUrl: 'https://science.nasa.gov/photojournal/pillinger-point-overlooking-endeavour-crater-on-mars/' },
  'viking-1-terrain': { world: 'mars', label: 'Viking 1 · PIA00563 first color surface image', credit: 'NASA/JPL',
    src: 'https://images-assets.nasa.gov/image/PIA00563/PIA00563~orig.jpg',
    sourceUrl: 'https://science.nasa.gov/resource/first-color-image-from-viking-lander-1/' },
  'ingenuity-terrain': { world: 'mars', label: 'Ingenuity · PIA24727 aerial photograph, flight 9', credit: ingenuityStoryMedia['ingenuity-ridges'].credit,
    src: ingenuityStoryMedia['ingenuity-ridges'].src, sourceUrl: ingenuityStoryMedia['ingenuity-ridges'].sourceUrl },
}
