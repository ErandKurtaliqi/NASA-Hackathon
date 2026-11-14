import type { StoryEvidenceMedia } from '../../components/storytelling/StoryMedia'

// Remote NASA evidence only. No supplied private package assets are copied.
const evidence = (id: string, title: string, kind: StoryEvidenceMedia['kind'], src: string, width: number, height: number, sourceUrl: string, caption: string, alt: string, credit = 'NASA/JPL-Caltech'): StoryEvidenceMedia => ({
  id, title, kind, src, originalUrl: src, srcSet: `${src} ${width}w`, width, height, sourceUrl, caption, alt, credit,
  verifiedOn: '2026-11-11', usagePolicyUrl: 'https://www.nasa.gov/nasa-brand-center/images-and-media/',
  usageNotes: 'Educational mission context with original NASA attribution. No NASA endorsement or third-party rights are implied.',
})
export const ingenuityStoryMedia = {
  'ingenuity-surface': evidence('ingenuity-surface', 'Ingenuity on the Martian surface', 'Photograph',
    'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/downloadable_items/4/5/45954_PIA24581.jpg?w=1200', 1200, 893,
    'https://science.nasa.gov/photojournal/ingenuitys-blades-are-released/',
    'PIA24581: Ingenuity photographed by Perseverance on April 8, 2021, after its blades were unlocked. Surface portrait, not a photograph of the first flight or final accident.',
    'Ingenuity stands on four slender landing legs with its two counter-rotating rotors and solar panel above a small box-shaped body on reddish Martian soil.'),
  'ingenuity-ridges': evidence('ingenuity-ridges', 'An aerial look at Raised Ridges', 'Photograph',
    'https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA24727.jpg', 4208, 3120,
    'https://www.jpl.nasa.gov/images/pia24727-ingenuity-spots-raised-ridges-during-ninth-flight/',
    'PIA24727: an aerial image from flight 9 on July 5, 2021. Geological context for possible ancient fluid processes; not a detection of underground water.',
    'Aerial color photograph from Ingenuity showing ridges, scattered rocks and sandy patches on the Martian surface.'),
  'ingenuity-skyfall': evidence('ingenuity-skyfall', 'SkyFall: a future generation', 'Illustration · not a photograph',
    'https://d2pn8kiwq2w21t.cloudfront.net/original_images/PIA26760.jpg', 2880, 1620,
    'https://www.jpl.nasa.gov/images/pia26760-nasas-skyfall-helicopters-at-work-artists-concept/',
    'PIA26760: artist’s concept of three planned SkyFall helicopters. These are future aircraft, not photographs of Ingenuity or evidence that SkyFall has flown on Mars.',
    'An artist’s concept shows three proposed SkyFall helicopters working above a broad Martian landscape.'),
}

// Selected contextual stills; full videos remain opt-in links with NASA context.
export const ingenuityVideoSources = [
  { title: 'Watch NASA’s first-flight footage', url: 'https://www.jpl.nasa.gov/images/pia24521-perseverances-mastcam-z-video-of-ingenuitys-first-full-flight/' },
  { title: 'Watch NASA’s 72-flight visualization', url: 'https://www.jpl.nasa.gov/videos/see-ingenuitys-flight-map-72-helicopter-flights-on-mars/' },
]
