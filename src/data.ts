import type { HardwareProfile, MissionMarker, Story } from './types'

export const sources = {
  marsVisual: {label:'NASA/JPL — Mars 3D model and visual texture',url:'https://science.nasa.gov/resource/planet-mars-3d-model/'},
  marsTrekExplorer: { label: 'NASA/JPL — Mars Trek', url: 'https://trek.nasa.gov/mars/' },
  perseveranceLocation: { label: 'NASA Science — Where is Perseverance?', url: 'https://science.nasa.gov/resource/where-is-perseverance-location-map/' },
  perseverance: { label: 'NASA Science — Perseverance', url: 'https://science.nasa.gov/mission/mars-2020-perseverance/' },
  objectives: { label: 'NASA Science — Science Objectives', url: 'https://science.nasa.gov/mission/mars-2020-perseverance/science-objectives/' },
  instruments: { label: 'NASA Science — Perseverance Instruments', url: 'https://science.nasa.gov/mission/mars-2020-perseverance/science-instruments/' },
  roverModel: { label: 'NASA/JPL — Perseverance 3D Model', url: 'https://science.nasa.gov/3d-resources/mars-2020-perseverance-rover/' },
  landingPressKit: { label: 'NASA/JPL — Mars 2020 Landing Press Kit', url: 'https://mars.nasa.gov/system/downloadable_items/45585_mars_2020_landing_press_kit.pdf' },
  mediaGuidelines: { label: 'NASA — Images and Media Usage Guidelines', url: 'https://www.nasa.gov/nasa-brand-center/images-and-media/' },
  ingenuity: { label: 'NASA Science — Ingenuity', url: 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/' },
  curiosity: { label: 'NASA Science — Curiosity', url: 'https://science.nasa.gov/mission/msl-curiosity/' },
  apollo11: { label: 'NASA — Apollo 11 Mission', url: 'https://www.nasa.gov/mission/apollo-11/' },
  apollo15: { label: 'NASA — Apollo 15 Mission', url: 'https://www.nasa.gov/mission/apollo-15/' },
  moon: { label: 'NASA Science — Earth’s Moon', url: 'https://science.nasa.gov/moon/' },
  marsTrek: { label: 'NASA/JPL — Mars Trek WMTS', url: 'https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars' },
  moonTrek: { label: 'NASA/JPL — Moon Trek WMTS', url: 'https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=moon' },
  usgsNames: { label: 'USGS — Gazetteer of Planetary Nomenclature', url: 'https://planetarynames.wr.usgs.gov/' },
  apollo17: { label: 'NASA Science — Apollo 17', url: 'https://science.nasa.gov/mission/apollo-17/' },
}

export const story: Story = {
  id: 'follow-perseverance',
  title: 'Follow Perseverance: The Search for Ancient Life',
  targetAge: '8–16',
  planet: 'mars',
  chapters: [
    { id: 'welcome', number: 1, title: 'Welcome to Mars', kicker: 'A cold world with a warm past', interaction: 'orbit', instruction: 'Drag the planet to begin your orbital survey.', narrative: 'Mars looks dry and dusty today. But its valleys, minerals, and layered rocks hold clues that liquid water once moved across the surface.', narration: 'We have arrived at Mars. Look closely: this quiet world keeps an ancient story in stone.', fact: 'Mars preserves evidence of ancient rivers, lakes, and water-altered minerals.', source: sources.perseverance },
    { id: 'landing', number: 2, title: 'Landing at Jezero Crater', kicker: 'Seven minutes of daring engineering', interaction: 'landing', instruction: 'Stabilize the descent: tap the three landing stages in order.', narrative: 'Perseverance landed in Jezero Crater on February 18, 2021. Long ago, a river flowed into this crater and built a fan-shaped delta.', narration: 'Heat shield, parachute, sky crane. Every stage must work before the rover can touch Mars.', fact: 'Jezero was chosen because orbital images show an ancient river delta and minerals formed in water.', source: sources.perseverance },
    { id: 'meet', number: 3, title: 'Meet Perseverance', kicker: 'A mobile science laboratory', interaction: 'hotspots', instruction: 'Inspect all three glowing instrument hotspots.', narrative: 'Percy is not hunting for living creatures. It studies rocks for signs that ancient environments could have supported microbial life.', narration: 'Meet Perseverance, a geologist, photographer, chemist, and sample collector on six wheels.', fact: 'SuperCam studies rock chemistry from a distance; PIXL and SHERLOC investigate fine-scale chemistry and minerals.', source: sources.instruments },
    { id: 'lake', number: 4, title: 'Explore the Ancient Lake', kicker: 'Read the landscape', interaction: 'clues', instruction: 'Choose the two strongest clues for ancient water.', narrative: 'On Earth, deltas form where rivers slow down and drop layers of sediment. Jezero’s delta gives scientists a place to examine a long record of change.', narration: 'Become a planetary detective. Which shapes and minerals would an ancient lake leave behind?', fact: 'Scientists infer Jezero held a lake more than 3.5 billion years ago; this does not prove life existed there.', source: sources.objectives, choices: [
      { label: 'Fan-shaped sediment layers', correct: true, feedback: 'Exactly — layered delta deposits can form as flowing water slows.' },
      { label: 'Water-altered clay minerals', correct: true, feedback: 'Good evidence — some clays form through long contact with water.' },
      { label: 'A fresh meteorite crater', feedback: 'Impact craters show collisions, but not necessarily ancient water.' },
      { label: 'Windblown dunes alone', feedback: 'Wind shapes Mars today, but dunes alone are not proof of a lake.' },
    ] },
    { id: 'evidence', number: 5, title: 'Collect Evidence', kicker: 'A careful sample strategy', interaction: 'sample', instruction: 'Select the rock most likely to preserve a past environment.', narrative: 'The rover drills selected rocks and seals cores in sterile tubes. Detailed observations record where every sample came from.', narration: 'A sample is more useful when its geologic context is carefully recorded.', fact: 'Perseverance is caching rock and regolith samples for possible future study; collected samples have not yet been returned to Earth.', source: sources.objectives, choices: [
      { label: 'Fine-grained layered rock', correct: true, feedback: 'Strong choice. Fine sediments can preserve chemical and textural clues.' },
      { label: 'Loose windblown dust', feedback: 'Dust is useful, but it may mix material from many locations.' },
      { label: 'Unmapped random pebble', feedback: 'Without context, it is much harder to reconstruct a rock’s story.' },
    ] },
    { id: 'learned', number: 6, title: 'What Have We Learned?', kicker: 'Evidence, not assumptions', interaction: 'reflection', instruction: 'Complete the mission debrief.', narrative: 'Jezero once had environments that may have been habitable. Perseverance is searching for possible signs of ancient microbial life — it has not proved that life existed on Mars.', narration: 'Great science separates what evidence shows from what we still hope to learn.', fact: 'Habitability means an environment had conditions that could support life; it is not evidence that life was present.', source: sources.objectives },
  ],
}

export const markers: MissionMarker[] = [
  { id: 'perseverance-landing', planet: 'mars', name: 'Perseverance Landing Site', subtitle: 'Octavia E. Butler Landing', latitude: 18.4447, longitude: 77.4508, precision: 'exact', category: 'landing-site', description: 'Perseverance touched down at this point in Jezero Crater on February 18, 2021.', source: sources.perseverance, storyChapter: 2 },
  { id: 'jezero', planet: 'mars', name: 'Jezero Crater', subtitle: 'Ancient delta and lake basin', latitude: 18.38, longitude: 77.58, precision: 'feature-center', category: 'mission-region', description: 'A roughly 45-kilometer impact crater containing a preserved ancient river delta and lake deposits.', source: sources.perseverance, storyChapter: 4 },
  { id: 'curiosity-landing', planet: 'mars', name: 'Curiosity Landing Site', subtitle: 'Bradbury Landing', latitude: -4.5895, longitude: 137.4417, precision: 'exact', category: 'landing-site', description: 'Curiosity landed at Bradbury Landing on August 6, 2012, inside Gale Crater.', source: sources.curiosity },
  { id: 'gale', planet: 'mars', name: 'Gale Crater', subtitle: 'Curiosity exploration region', latitude: -5.4, longitude: 137.8, precision: 'feature-center', category: 'mission-region', description: 'A 154-kilometer-wide crater whose central layered mountain records changing ancient environments.', source: sources.curiosity },
  { id: 'olympus', planet: 'mars', name: 'Olympus Mons', subtitle: 'Giant shield volcano', latitude: 18.65, longitude: -133.8, precision: 'feature-center', category: 'geology', description: 'The largest known volcano in the solar system, rising high above the surrounding plains.', source: { label: 'NASA Space Place — Olympus Mons', url: 'https://spaceplace.nasa.gov/olympus-mons/en/' } },
  { id: 'valles', planet: 'mars', name: 'Valles Marineris', subtitle: 'Immense canyon system', latitude: -13.9, longitude: -59.2, precision: 'region', category: 'geology', description: 'A vast system of canyons stretching thousands of kilometers across the Martian equatorial region.', source: { label: 'NASA Science — Valles Marineris', url: 'https://science.nasa.gov/resource/valles-marineris-the-grand-canyon-of-mars/' } },
  { id: 'apollo-11', planet: 'moon', name: 'Apollo 11 Landing Site', subtitle: 'Tranquility Base', latitude: 0.67408, longitude: 23.47297, precision: 'exact', category: 'landing-site', description: 'The first crewed lunar landing site, reached by Neil Armstrong and Buzz Aldrin on July 20, 1969.', source: sources.apollo11 },
  { id: 'apollo-17', planet: 'moon', name: 'Apollo 17 Landing Site', subtitle: 'Taurus–Littrow Valley', latitude: 20.1908, longitude: 30.7717, precision: 'exact', category: 'landing-site', description: 'The landing site of the final Apollo lunar mission, visited in December 1972.', source: sources.apollo17 },
  { id: 'tycho', planet: 'moon', name: 'Tycho Crater', subtitle: 'Young ray crater', latitude: -43.31, longitude: -11.36, precision: 'feature-center', category: 'geology', description: 'A prominent young impact crater surrounded by bright rays visible across the lunar near side.', source: sources.usgsNames },
  { id: 'copernicus', planet: 'moon', name: 'Copernicus Crater', subtitle: 'Terraced impact crater', latitude: 9.62, longitude: -20.08, precision: 'feature-center', category: 'geology', description: 'A prominent complex crater with terraced walls, central peaks, and an extensive ray system.', source: sources.usgsNames },
  { id: 'tranquility', planet: 'moon', name: 'Mare Tranquillitatis', subtitle: 'Sea of Tranquility', latitude: 8.5, longitude: 31.4, precision: 'region', category: 'mission-region', description: 'A broad basaltic plain on the lunar near side that contains the Apollo 11 landing site.', source: sources.moon },
]

export const hardware: HardwareProfile[] = [
  { id: 'perseverance', name: 'Perseverance', type: 'Mars rover', planet: 'mars', missionDate: 'Launched Jul 30, 2020 · Landed Feb 18, 2021', overview: 'A car-sized robotic geologist exploring Jezero Crater.', purpose: 'Study geology and past habitability, seek possible signs of ancient microbial life, cache samples, and test future exploration technology.', instruments: ['Mastcam-Z', 'SuperCam', 'PIXL', 'SHERLOC', 'MEDA', 'RIMFAX', 'MOXIE'], source: sources.perseverance },
  { id: 'curiosity', name: 'Curiosity', type: 'Mars rover', planet: 'mars', missionDate: 'Launched Nov 26, 2011 · Landed Aug 6, 2012', overview: 'The Mars Science Laboratory rover exploring Gale Crater.', purpose: 'Determine whether Mars ever offered environmental conditions favorable for microbial life.', instruments: ['Mastcam', 'ChemCam', 'SAM', 'CheMin', 'RAD', 'DAN'], source: sources.curiosity },
  { id: 'ingenuity', name: 'Ingenuity', type: 'Mars helicopter', planet: 'mars', missionDate: 'First flight Apr 19, 2021 · Final flight Jan 18, 2024', overview: 'The first aircraft to achieve powered, controlled flight on another planet.', purpose: 'A technology demonstration that completed 72 flights, far beyond its planned five.', instruments: ['Navigation camera', 'Terrain camera', 'Inertial sensors', 'Solar power system'], source: sources.ingenuity },
  { id: 'lunar-module', name: 'Apollo Lunar Module', type: 'Crewed lunar lander', planet: 'moon', missionDate: 'Apollo era · 1969–1972 landings', overview: 'A two-stage spacecraft designed to carry astronauts between lunar orbit and the Moon’s surface.', purpose: 'Land two astronauts on the Moon and return them to the orbiting Command Module.', instruments: ['Descent stage', 'Ascent stage', 'Landing radar', 'Reaction controls'], source: sources.apollo11 },
  { id: 'lrv', name: 'Lunar Roving Vehicle', type: 'Crewed lunar rover', planet: 'moon', missionDate: 'Used on Apollo 15, 16, and 17', overview: 'A lightweight electric vehicle folded into the Lunar Module descent stage.', purpose: 'Extend astronaut range and carry tools, samples, and scientific equipment.', instruments: ['Four wheel drives', 'Navigation system', 'TV camera', 'High-gain antenna'], source: sources.apollo15 },
  { id: 'lrv-1', name: 'Apollo 15 Lunar Roving Vehicle', type: 'Crewed lunar rover', planet: 'moon', missionDate: 'Launched Jul 26, 1971 · Landed Jul 30, 1971', overview: 'LRV-1, the first vehicle astronauts drove on the Moon.', purpose: 'Explore Hadley-Apennine with Dave Scott and Jim Irwin. Command Module: Endeavour. Lunar Module: Falcon.', instruments: ['Four wheel motors', 'Navigation system', 'TV camera', 'Two 36-volt batteries'], source: sources.apollo15 },
]

// Final rover parking locations supplied for the Apollo mission collection.
markers.push(
  {id:'apollo-15-rover',planet:'moon',name:'Apollo 15 · LRV-1 Final Parking',subtitle:'Hadley-Apennine',latitude:26.13174,longitude:3.63803,precision:'exact',category:'mission-region',description:'LRV-1 remains at Hadley-Apennine. Command Module: Endeavour. Lunar Module: Falcon.',source:sources.apollo15},
  {id:'apollo-16-rover',planet:'moon',name:'Apollo 16 · LRV-2 Final Parking',subtitle:'Descartes Highlands',latitude:-8.9729,longitude:15.5037,precision:'exact',category:'mission-region',description:'LRV-2 remains in the Descartes Highlands. Command Module: Casper. Lunar Module: Orion.',source:{label:'NASA — Apollo 16',url:'https://www.nasa.gov/mission/apollo-16/'}},
  {id:'apollo-17-rover',planet:'moon',name:'Apollo 17 · LRV-3 Final Parking',subtitle:'Taurus-Littrow Valley',latitude:20.1896,longitude:30.7769,precision:'exact',category:'mission-region',description:'LRV-3 remains in Taurus-Littrow Valley. Command Module: America. Lunar Module: Challenger.',source:sources.apollo17},
)
// Merge the shared LRV-1 identity rather than appending a duplicate catalog row.
const apollo15Hardware = hardware.find(item => item.id === 'lrv-1')!
apollo15Hardware.purpose += ' Final parking: 26.13174° N, 3.63803° E.'
