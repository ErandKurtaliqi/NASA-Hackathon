import { apollo15Narration } from './apollo15Narration'
import type { PlanetId, SourceRef } from './types'

export type StoryChapterId = 'meet' | 'journey' | 'challenges' | 'legacy' | 'quiz'
export type JourneyEvent = { label: string; date: string; title: string; copy: string }
export type QuizQuestion = { question: string; options: string[]; answer: number; explanation: string }

export interface MachineStory {
  category?: 'rover' | 'stationary-experiment'
  id: string
  machineId: string
  name: string
  shortName: string
  planet: PlanetId
  missionLabel: string
  status: string
  heroLine: string
  intro: string
  profile: { label: string; value: string }[]
  sources: SourceRef[]
  journey: JourneyEvent[]
  challenges: { title: string; problem: string; solution: string }[]
  discoveries: { title: string; detail: string }[]
  legacy: { year: string; title: string; copy: string }[]
  quiz: QuizQuestion[]
  narration?: { title: string; text: string; audio: string; sources: SourceRef[] }[][]
  reward: string
}

export const chapterMeta: { id: StoryChapterId; title: string; short: string }[] = [
  { id: 'meet', title: 'Meet Me', short: 'Identity' },
  { id: 'journey', title: 'My Journey', short: 'Flight path' },
  { id: 'challenges', title: 'Challenges & Discoveries', short: 'Field science' },
  { id: 'legacy', title: 'My Legacy', short: 'Lasting impact' },
  { id: 'quiz', title: 'Test Your Knowledge', short: 'Mission quiz' },
]

const perseveranceSource = { label: 'NASA Science — Perseverance', url: 'https://science.nasa.gov/mission/mars-2020-perseverance/' }
const marsPressKit = { label: 'NASA/JPL — Mars 2020 Landing Press Kit', url: 'https://mars.nasa.gov/system/downloadable_items/45585_mars_2020_landing_press_kit.pdf' }
const apolloSource = { label: 'NASA — Apollo 17 Mission Details', url: 'https://www.nasa.gov/missions/apollo/apollo-17-mission-details/' }
const lrvSource = { label: 'NASA NSSDC — Lunar Roving Vehicle', url: 'https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_lrv.html' }

export const machineStories: Record<string, MachineStory> = {
  'follow-perseverance': {
    id: 'follow-perseverance', machineId: 'perseverance', name: 'Perseverance', shortName: 'Percy', planet: 'mars', missionLabel: 'Mars 2020', status: 'ACTIVE ON MARS',
    heroLine: 'I am searching ancient rocks for clues to a once-habitable Mars.',
    intro: 'Hello, explorer — I’m Perseverance, a car-sized robotic scientist. NASA’s Jet Propulsion Laboratory built and operates me for the Mars 2020 mission. I launched in 2020 to study Jezero Crater, seek signs of ancient microbial life, collect carefully documented rock cores, and test technology for future explorers.',
    profile: [
      { label: 'MY NAME', value: 'Perseverance · “Percy”' }, { label: 'MY DEVELOPER', value: 'NASA Jet Propulsion Laboratory' },
      { label: 'DEVELOPED', value: '2013–2020 · Mars 2020 program' }, { label: 'MY HOME', value: 'Jezero Crater, Mars' },
      { label: 'MY PURPOSE', value: 'Astrobiology, geology, sample caching & technology demonstrations' }, { label: 'MY POWER', value: 'Radioisotope power system' },
    ],
    sources: [perseveranceSource, marsPressKit],
    journey: [
      { label: 'LAUNCH', date: '30 JUL 2020', title: 'I left Earth', copy: 'An Atlas V 541 launched me from Cape Canaveral, beginning my 471-million-kilometer cruise to Mars.' },
      { label: 'CRUISE', date: '203 DAYS', title: 'I crossed interplanetary space', copy: 'My cruise stage kept me powered, on course, and in contact with Earth during the seven-month journey.' },
      { label: 'ENTRY', date: '18 FEB 2021', title: 'I met the Martian atmosphere', copy: 'My aeroshell entered at about 20,000 kilometers per hour and the heat shield protected me from intense heating.' },
      { label: 'LANDING', date: '7 MINUTES', title: 'I landed myself', copy: 'Parachute, terrain-relative navigation, powered descent, and a sky crane worked autonomously to place me in Jezero.' },
      { label: 'EXPLORE', date: '2021–NOW', title: 'I became a field geologist', copy: 'I image, abrade, analyze, drill, and cache samples while climbing from Jezero’s floor toward ancient terrain.' },
    ],
    challenges: [
      { title: 'Landing among hazards', problem: 'Jezero contains cliffs, dunes, and boulders.', solution: 'I compared camera images with an onboard map so Terrain-Relative Navigation could steer toward a safer target.' },
      { title: 'Working alone', problem: 'Radio signals take minutes to cross space.', solution: 'I use autonomous navigation and onboard fault protection while my Earth team sends carefully checked plans.' },
      { title: 'Protecting samples', problem: 'Future scientists need clean, documented material.', solution: 'I drill selected rocks, seal cores in titanium tubes, and record each sample’s geologic context.' },
    ],
    discoveries: [
      { title: 'AN ANCIENT LAKE', detail: 'Jezero’s delta and sedimentary rocks preserve evidence of a long-vanished lake and river system.' },
      { title: 'WATER-ALTERED ROCKS', detail: 'Minerals and textures show that water changed rocks in environments that may once have been habitable.' },
      { title: 'A SAMPLE LIBRARY', detail: 'My sealed cores preserve diverse Martian materials for possible detailed study by future laboratories.' },
    ],
    legacy: [
      { year: '2020', title: 'A precise new explorer', copy: 'I carried the most advanced rover science payload yet sent to Mars and technology for precision landing.' },
      { year: '2021', title: 'Touchdown at Jezero', copy: 'My landing demonstrated Terrain-Relative Navigation and recorded the first detailed video of a Mars landing.' },
      { year: '2021–24', title: 'A helicopter partnership', copy: 'I carried Ingenuity to Mars and supported the first powered flights on another world.' },
      { year: 'TODAY', title: 'My story is still being written', copy: 'I remain active, studying ancient terrain and building a scientifically documented sample collection.' },
      { year: 'FUTURE', title: 'Pathfinder for explorers', copy: 'My navigation, oxygen-production test, science, and sample strategy inform future robotic and human missions.' },
    ],
    quiz: [
      { question: 'Why did I land in Jezero Crater?', options: ['It has an ancient river delta', 'It is the warmest place on Mars', 'It has active forests'], answer: 0, explanation: 'Jezero preserves a delta and lake deposits — promising places to study ancient environments.' },
      { question: 'Which system lowered me on cables?', options: ['A lunar module', 'The sky crane', 'A balloon'], answer: 1, explanation: 'The descent stage used the sky-crane maneuver to lower me onto my wheels.' },
      { question: 'What do my sample tubes contain?', options: ['Documented Martian rock and regolith', 'Living Martian animals', 'Fuel for my engines'], answer: 0, explanation: 'I seal carefully selected rock and regolith cores; finding life is still an open scientific question.' },
    ], reward: 'Jezero Field Scientist',
  },
  'apollo-17-rover': {
    id: 'apollo-17-rover', machineId: 'lrv', name: 'Apollo 17 Lunar Roving Vehicle', shortName: 'LRV-3', planet: 'moon', missionLabel: 'Apollo 17', status: 'PRESERVED ON THE MOON',
    heroLine: 'I carried the last Apollo moonwalkers farther into Taurus–Littrow.',
    intro: 'Hello, explorer — I’m the Lunar Roving Vehicle driven by Gene Cernan and Harrison Schmitt during Apollo 17. Boeing built me under NASA Marshall’s direction, with General Motors’ Delco division developing my wheels, motors, and suspension. I was created in a rapid 17-month program so astronauts could travel farther, carry tools, and return more lunar science.',
    profile: [
      { label: 'MY NAME', value: 'Lunar Roving Vehicle 3 · Apollo 17' }, { label: 'MY DEVELOPERS', value: 'Boeing · GM/Delco · NASA Marshall' },
      { label: 'DEVELOPED', value: '1969–1971 · 17 months' }, { label: 'MY HOME', value: 'Taurus–Littrow valley, Moon' },
      { label: 'MY PURPOSE', value: 'Carry astronauts, tools, experiments & lunar samples' }, { label: 'MY POWER', value: 'Two 36-volt silver-zinc batteries' },
    ],
    sources: [apolloSource, lrvSource],
    journey: [
      { label: 'LAUNCH', date: '7 DEC 1972', title: 'I rode a Saturn V', copy: 'Folded inside Lunar Module Challenger, I left Kennedy Space Center on Apollo 17’s spectacular nighttime launch.' },
      { label: 'COAST', date: '4 DAYS', title: 'I crossed to the Moon', copy: 'The crew traveled in command module America while I remained folded inside the lunar module.' },
      { label: 'LANDING', date: '11 DEC 1972', title: 'I reached Taurus–Littrow', copy: 'Challenger touched down in a valley chosen to sample both ancient highland material and younger volcanic deposits.' },
      { label: 'DEPLOY', date: 'EVA 1', title: 'I unfolded on the surface', copy: 'The astronauts lowered and unfolded my hinged aluminum chassis, raised my seats, antenna, and control console.' },
      { label: 'EXPLORE', date: '3 TRAVERSES', title: 'I widened the field of science', copy: 'Across three drives I carried two astronauts, tools, cameras, experiments, and a record collection of samples.' },
    ],
    challenges: [
      { title: 'Fold into a lunar module', problem: 'I was 3.1 meters long but had to fit a compact equipment bay.', solution: 'My three-part hinged chassis, seats, wheels, and appendages folded tightly for flight and deployed with ropes and pulleys.' },
      { title: 'Drive without air', problem: 'Rubber tires and air-filled tubes would not suit vacuum and sharp regolith.', solution: 'My wheels used zinc-coated steel wire mesh, inner bump stops, and titanium chevrons for traction.' },
      { title: 'Navigate a trackless valley', problem: 'There were no roads, GPS satellites, or rescue vehicles.', solution: 'My directional gyro, wheel odometers, and Sun-shadow device continuously calculated bearing and distance back to Challenger.' },
    ],
    discoveries: [
      { title: 'ORANGE SOIL', detail: 'At Shorty Crater, the crew found orange volcanic glass — evidence of ancient fire-fountain eruptions.' },
      { title: 'A RECORD SAMPLE HAUL', detail: 'Apollo 17 returned about 110.4 kilograms of lunar material, more than any other Apollo mission.' },
      { title: 'A BROADER GEOLOGIC STORY', detail: 'My range let the crew sample varied valley-floor and mountain materials across Taurus–Littrow.' },
    ],
    legacy: [
      { year: '1969', title: 'Seventeen months to build', copy: 'The LRV program turned an ambitious folding electric vehicle into flight hardware on a remarkable schedule.' },
      { year: '1972', title: 'Thirty-six kilometers explored', copy: 'My Apollo 17 odometer recorded about 36 kilometers across three traverses, greatly expanding the crew’s reach.' },
      { year: '1972', title: 'I stayed behind', copy: 'After the astronauts parked me for the final television view of liftoff, I remained at Taurus–Littrow.' },
      { year: 'TODAY', title: 'Still on the Moon', copy: 'I am inactive but preserved at the Apollo 17 site, one of three LRVs left on the lunar surface.' },
      { year: 'FUTURE', title: 'Wheels for Artemis', copy: 'My lessons in mobility, navigation, dust, thermal design, and crew fieldwork continue to inform new lunar vehicles.' },
    ],
    quiz: [
      { question: 'Why were my wheels made from wire mesh?', options: ['To work in vacuum and lunar soil', 'To float on water', 'To collect sunlight'], answer: 0, explanation: 'Wire mesh avoided pneumatic tires and provided flexible traction in sharp, dusty regolith.' },
      { question: 'Which rocket carried me toward the Moon?', options: ['Atlas V', 'Space Shuttle', 'Saturn V'], answer: 2, explanation: 'Apollo 17 launched aboard Saturn V SA-512 on December 7, 1972.' },
      { question: 'Where am I now?', options: ['In a museum on Earth', 'At Taurus–Littrow on the Moon', 'Orbiting Mars'], answer: 1, explanation: 'I remain parked near the Apollo 17 landing site in the Taurus–Littrow valley.' },
    ], reward: 'Taurus–Littrow Navigator',
  },
  // Apollo 15 content adapted from origin/main@4d31563, without recorded audio
  // or GIS parking coordinates. Keep this record independent of Apollo 17.
  'apollo-15-rover': {
    id: 'apollo-15-rover', machineId: 'lrv-1', name: 'Apollo 15 Lunar Roving Vehicle', shortName: 'LRV-1', planet: 'moon', missionLabel: 'Apollo 15', status: 'PRESERVED ON THE MOON',
    heroLine: 'I was the first vehicle astronauts drove on another world.',
    intro: "Imagine a car that folds like a suitcase, rides a rocket, and drives where there are no roads... and no air! I'm LRV-1, the Apollo 15 Moon Buggy, the first vehicle astronauts ever drove on another world! NASA Marshall managed my development, Boeing built me, and General Motors developed my wheels and drive system. I carried Dave Scott and Jim Irwin through Hadley-Apennine while Al Worden worked in lunar orbit.",
    profile: [
      { label: 'MY NAME', value: 'LRV-1 · Apollo 15' }, { label: 'MY BUILDERS', value: 'NASA Marshall · Boeing · General Motors' },
      { label: 'MY HOME', value: 'Hadley-Apennine, Moon' }, { label: 'COMMAND MODULE', value: 'Endeavour' },
      { label: 'LUNAR MODULE', value: 'Falcon' }, { label: 'MY PURPOSE', value: 'Carry astronauts, tools and lunar samples' },
    ],
    sources: [
      { label: 'NASA — Apollo 15', url: 'https://www.nasa.gov/mission/apollo-15/' },
      { label: 'NASA — Apollo 15 Mission Details', url: 'https://www.nasa.gov/missions/apollo/apollo-15-mission-details/' },
      lrvSource,
      { label: 'NASA Science — Apollo 15 Hammer-Feather Drop', url: 'https://science.nasa.gov/resource/the-apollo-15-hammer-feather-drop/' },
    ],
    journey: [
      { label: 'Launch & Landing', date: '26–31 JUL 1971', title: 'Launch & Landing', copy: "On July 26, 1971, I left Earth aboard a Saturn V, folded inside the lunar module Falcon. Dave and Jim landed at Hadley-Apennine on July 30, and deployed me on July 31 by pulling tapes that unfolded my chassis and wheels." },
      { label: 'Lunar Environment & Controls', date: 'LUNAR SURFACE', title: 'Lunar Environment & Controls', copy: 'With no air, bright sunlight and clingy dust, the Moon demanded a special vehicle. A T-shaped hand controller let astronauts in bulky gloves steer, accelerate and brake. Two 36-volt batteries powered my four wheel motors.' },
      { label: 'One-sixth Gravity', date: '1/6 GRAVITY', title: 'One-sixth Gravity', copy: 'In lunar gravity, my weight was only about 77 pounds, although my mass stayed the same. Dave and Jim wore seatbelts as we bounced past craters. My navigation system used a gyroscope and wheel odometers to estimate the direction and distance back to Falcon.' },
      { label: 'Milestones', date: '3 MOONWALKS', title: 'Milestones', copy: 'Across three moonwalks, I traveled about 27.8 kilometers, helping the crew explore Hadley Rille and the slopes of Mount Hadley Delta. Carrying tools and samples let them do more field science than walking alone.' },
    ],
    challenges: [
      { title: 'Steering Scare', problem: 'On July 31, my front steering did not work, even after the astronauts reset circuit breakers.', solution: 'Independent rear-wheel steering kept the first traverse going. The front steering worked again on the second day.' },
      { title: 'Steep Slopes, Heat & Lunar Dust', problem: 'Steep slopes challenged traction, and lunar dust covered cooling surfaces, including the television camera radiator.', solution: 'The astronauts chose their path carefully and brushed dust from cooling surfaces. My flexible wire-mesh wheels helped me travel over uneven ground.' },
    ],
    discoveries: [
      { title: 'Genesis Rock', detail: 'At Spur Crater, Dave and Jim collected the white Genesis Rock, an anorthosite that offered clues to the ancient lunar crust. Apollo 15 also returned green volcanic glass, evidence of explosive volcanic activity.' },
      { title: 'Observations', detail: 'My color television camera sent views of Hadley Rille to Earth. The Apollo 15 crew returned about 77 kilograms of lunar samples, helping scientists investigate the geological history of the Moon.' },
    ],
    legacy: [
      { year: '1971', title: 'Final Science Moment', copy: 'On August 2, Dave Scott dropped a hammer and a falcon feather together. Without appreciable air resistance, they fell together, demonstrating that objects of different masses undergo the same gravitational acceleration.' },
      { year: '1971', title: 'Filming Liftoff', copy: 'I stayed behind while Falcon lifted the astronauts and their samples toward orbit. My Earth-controlled television camera transmitted views of the ascent from the lunar surface.' },
      { year: 'TODAY', title: 'Current Status', copy: 'I remain inactive at Hadley-Apennine. Decades after Apollo 15, NASA’s Lunar Reconnaissance Orbiter photographed the landing site and the tracks left by the crew and rover.' },
      { year: 'LEGACY', title: 'Reflection', copy: 'My wheels are still, but my tracks remain in lunar dust. Lessons from Apollo mobility, navigation and dust management help engineers design future lunar exploration vehicles.' },
    ],
    quiz: [
      { question: 'How did the Moon Buggy fit inside the small Falcon lander?', options: ['It was built in pieces and put together with a toolbox', 'It folded up like origami, then popped open on the Moon', 'It rode on the outside of the rocket'], answer: 1, explanation: 'The rover folded for flight and unfolded on the lunar surface.' },
      { question: 'What is the famous name of the white rock discovered at Spur Crater?', options: ['The Genesis Rock', 'The Mars Pebble', 'The Comet Crystal'], answer: 0, explanation: 'The Genesis Rock offered clues about the ancient lunar crust.' },
      { question: 'Dave Scott dropped a heavy hammer alongside what light object?', options: ['A paper airplane', 'A golf ball', 'A falcon feather'], answer: 2, explanation: 'The hammer and falcon feather fell together in the lunar vacuum.' },
    ], reward: 'Hadley-Apennine Explorer',
  },
}

// Apollo 15 reuses the existing five chapter experiences with its own mission data.
export const cinematicMachineStories: Record<string, MachineStory> = {
  ...machineStories,
  'apollo-15-rover': {
  ...machineStories['apollo-17-rover'],
  id: 'apollo-15-rover', machineId: 'lrv-1', name: 'Apollo 15 Lunar Roving Vehicle', shortName: 'LRV-1',
  missionLabel: 'Apollo 15', heroLine: 'I was the first vehicle astronauts drove on another world.',
  intro: apollo15Narration[0][0].text, narration: apollo15Narration,
  profile: [
    {label:'MY NAME',value:'LRV-1 · Apollo 15'},
    {label:'MY BUILDERS',value:'NASA Marshall · Boeing · General Motors'},
    {label:'MY HOME',value:'Hadley-Apennine · 26.13174° N, 3.63803° E'},
    {label:'COMMAND MODULE',value:'Endeavour'}, {label:'LUNAR MODULE',value:'Falcon'},
    {label:'MY PURPOSE',value:'Carry astronauts, tools and lunar samples'},
  ],
  sources: [{label:'NASA — Apollo 15',url:'https://www.nasa.gov/mission/apollo-15/'}],
  journey: apollo15Narration[1].map((track,i)=>({label:track.title,date:['26–31 JUL 1971','LUNAR SURFACE','1/6 GRAVITY','3 MOONWALKS'][i],title:track.title,copy:track.text})),
  challenges: apollo15Narration[2].slice(0,2).map(track=>({title:track.title,problem:track.text,solution:track.title==='Steering Scare'?'Rear-wheel steering kept the first traverse going.':'The astronauts managed traction and brushed dust from cooling surfaces.'})),
  discoveries: apollo15Narration[2].slice(2).map(track=>({title:track.title,detail:track.text})),
  legacy: apollo15Narration[3].map((track,i)=>({year:i<2?'1971':'LEGACY',title:track.title,copy:track.text})),
  quiz: [
    {question:'How did the Moon Buggy fit inside the small Falcon lander?',options:['It was built in pieces and put together with a toolbox','It folded up like origami, then popped open on the Moon','It rode on the outside of the rocket'],answer:1,explanation:'The rover folded for flight and unfolded on the lunar surface.'},
    {question:'What is the famous name of the white rock discovered at Spur Crater?',options:['The Genesis Rock','The Mars Pebble','The Comet Crystal'],answer:0,explanation:'The Genesis Rock offered clues about the ancient lunar crust.'},
    {question:'Dave Scott dropped a heavy hammer alongside what light object?',options:['A paper airplane','A golf ball','A falcon feather'],answer:2,explanation:'The hammer and falcon feather fell together in the lunar vacuum.'},
  ], reward:'Hadley-Apennine Explorer',
  },
  'apollo-17-rover': { ...machineStories['apollo-17-rover'], profile: [
    ...machineStories['apollo-17-rover'].profile,
    {label:'FINAL PARKING SPOT',value:'20.1896° N, 30.7769° E'},
    {label:'COMMAND MODULE',value:'America'}, {label:'LUNAR MODULE',value:'Challenger'},
  ] },
}
