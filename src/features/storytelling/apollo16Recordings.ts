import type { RecordingCues } from './storyCues'
import { apollo16Sources as sources } from './apollo16Story'
import manifest from './apollo16AudioManifest.json'

// Original PDF narration: preserve the supplied wording, including metaphors.
// This is an editorial script, not a listening-verified audio transcript.
const scripts = [
  [
    ['Meet Me', "Everyone remembers the first Moon buggy. But now it's my turn! I'm LRV-2, the Apollo 16 Moon Buggy, the second rover astronauts ever drove on the Moon—ready to leave tracks where no road has ever been!"],
    ['Why I Was Developed & Destination', 'Back on Earth, NASA scientists had a mystery to solve: Were the Moon’s ancient mountains built by giant volcanoes? They chose the rugged Descartes Highlands—a cratered wilderness waiting to be explored!'],
    ['Who Built Me', "NASA's Marshall center managed my design, Boeing built me, and General Motors made my wheels. Same blueprint as Apollo 15's rover—but my adventure is all mine!"],
    ['What I Was Designed to Accomplish', 'I was built for heavy-duty moon work! My mission? Climb steep mountain ridges, cross boulder-packed craters, haul back 95 kg of glowing space rocks... and guard these wild highlands forever.'],
  ],
  [
    ['Launch & Arrival', 'Count with me! Three, two, one... LIFTOFF! A giant Saturn V blasted me skyward on April 16, 1972. Five days later, on April 21 (UTC), Orion touched down in the Descartes Highlands—and I was ready to roll!'],
    ['The Lunar Environment & Interactive Controls', "The Moon is wild! Sun blazes, dust sticks to everything, and gravity is one-sixth of Earth's. Your turn: push my T-handle to go, pull back to brake, left or right to steer!"],
    ['Three Surface Excursions', 'Three moonwalks, three adventures! John and Charlie drove me 26.7 kilometers—more than 16 miles! Together, we climbed Stone Mountain and raced to giant North Ray Crater—reaching distant worlds no astronaut could ever reach on foot!'],
    ['The Lunar Rover Grand Prix', "Then came my moment of glory! Young raced me across the Moon, kicking up clouds of dust. Duke filmed the thrilling ride, and my crew gave it a name: the 'Lunar Rover Grand Prix’!"],
  ],
  [
    ['Fender Accident', "The Moon tested me, too! During our second moonwalk, John Young's spacesuit caught on my right-rear fender and tore off its extension. From then on, my exposed wheel showered my crew and equipment with lunar dust!"],
    ['The Climb That Tested Me', 'Up we climbed! Stone Mountain\'s rocky slopes pushed me to my limits. Slowly, I carried John and Charlie toward their sampling stops. But the real challenge was still ahead: gathering precious Moon rocks!'],
    ['Big Discoveries', "Plot twist! Scientists expected volcanoes at Descartes, but most samples were impact-made breccias. On our first moonwalk, John and Charlie collected Big Muley at Plum Crater: nearly 26 pounds—Apollo's largest single returned rock!"],
  ],
  [
    ['Proving the Rovers', 'Apollo 15 showed wheels could work on the Moon. I carried that promise further! Across three moonwalks, my battery-powered wheels carried John and Charlie more than 16 miles through the rugged highlands. I was no one-mission wonder!'],
    ['A Window to the Universe', 'My crew turned the Moon into an observatory! Their far-ultraviolet camera captured Earth in an invisible light and explored more than 550 stars, galaxies and nebulae'],
    ['The Final Parking Position', 'At my final parking place, John left me 300 feet east of Orion. My camera had one last duty: to watch my crew rise from the Moon.'],
    ['Liftoff', 'On April 23, 1972, Orion carried John and Charlie away. My camera watched them rise… then the silence returned. Their journey home had begun. Mine would continue here, alone beneath the stars.'],
  ],
] as const

const notes = [
  [
    { text: 'LRV-2 was a crew-driven electric vehicle; the first-person voice is storytelling.', source: sources.rover },
    { text: 'Volcanic origins were a preflight hypothesis. Sampling tested it rather than assuming it was true.', source: sources.mission },
    { text: 'The LRV program was managed by NASA Marshall, with Boeing as prime contractor and GM/Delco developing mobility systems.', source: sources.rover },
    { text: '“Glowing space rocks” and “guard” are metaphors: the samples do not visibly glow, and the inactive rover performs no guarding. The crew returned about 95 kg of rock and soil, not a single rover load.', source: sources.mission },
  ],
  [
    { text: 'The UTC landing date is April 21; NASA also gives April 20 in US Eastern time. These refer to the same event.', source: sources.dates },
    { text: 'This page offers a conceptual control exercise, not a driving simulator or a reconstruction of actual rover motion.', source: sources.rover },
    { text: 'The quoted 26.7 km is the supplied script\'s rounded traverse total. “No astronaut could ever reach on foot” is dramatic language: traverse planning retained a safe walking return option.', source: sources.rover },
    { text: 'The Grand Prix was an engineering handling demonstration, not a competition between rovers.', source: sources.mission },
  ],
  [
    { text: 'This was Apollo 16\'s fender loss on EVA 2. Do not confuse it with Apollo 17\'s later improvised fender repair.', source: sources.surface },
    { text: 'The crew drove on Stone Mountain\'s slopes for sampling; the rover did not climb the mountain summit.', source: sources.surface },
    { text: 'Big Muley was collected at Plum Crater during EVA 1. The scientific interpretation changed when sample evidence favored impact processes.', source: sources.surface },
  ],
  [
    { text: 'Apollo 16 was the second Apollo mission to use an LRV. Its operation was limited to the crew\'s surface stay.', source: sources.mission },
    { text: 'The far-ultraviolet camera was a separate instrument developed by George Carruthers, not my TV camera. The script\'s “more than 550” count awaits specialist verification.', source: sources.ultraviolet },
    { text: 'The parking location positioned the TV camera for liftoff coverage. It is not a new map coordinate in this application.', source: sources.return },
    { text: 'The rover stayed behind. This is historical coverage, not a present-day live camera feed.', source: sources.return },
  ],
]

export const apollo16ChapterRecordings = scripts.map((chapter, c) => chapter.map(([title, text], s) => ({
  title, text, audio: `/audio/apollo-16/chapter-${c + 1}/${s + 1}.mp3`, note: notes[c][s],
})))
export const apollo16QuizRecordings = manifest.filter(item => item.chapter === 5).map(item => item.path)
export const apollo16CaptionTiming: Record<string, RecordingCues> = Object.fromEntries(manifest.map(item => [item.path, { status: 'pending', cues: [] }]))
