import apollo11Scripts from './apollo11PackageScripts.json'
import apollo17Scripts from './apollo17PackageScripts.json'
import type { QuizQuestion } from '../../machineStories'

export type MoonMission = '11' | '17'
export type MoonRecording = {
  chapter: number; segment: number; title: string; text: string; audio: string
  mapping: 'filename-and-pdf'; listening: 'pending' | 'approved-by-haroon' | 'machine-verified'; timing: 'pending'
  playback: 'enabled' | 'review-required'; editorialApproval?: 'approved-by-haroon'; review?: string; reviewSource?: string; readingText: string
}
// Never silently edit the supplied script or recording. Questionable assertions
// remain in the private source, while the public reading uses supported wording.
const reviews: Record<string, { review: string; source?: string; readingText?: string; playback?: 'enabled'; listening?: 'approved-by-haroon' | 'machine-verified'; editorialApproval?: 'approved-by-haroon' }> = {
  '11:2:3': { review: 'The package names an individual deployer inconsistently. Historical review is required before playing this recording.', readingText: 'Buzz Aldrin carried the experiment packages away from Eagle. The crew placed the passive reflector on the lunar surface during the Apollo 11 moonwalk.' },
  '11:2:4': { review: 'The approximate 14-meter placement is supported by NASA ALSJ. Individual deployer attribution remains disputed across NASA sources; the original recording is still held for an editorial decision.', readingText: 'The reflector was set on the lunar surface, leveled and pointed toward Earth. It needed no electrical power.' },
  // Haroon listened to and approved the complete, unchanged original; confirmed
  // by the user on 2026-11-15. See docs/review-safe/scientific-decisions.md.
  '11:4:4': { review: 'NASA ALSJ supports placement approximately 14 meters from Eagle. Haroon listened to and approved the complete original recording, confirmed on 2026-11-15. This is passive reflection, not a powered transmitter.', playback: 'enabled', listening: 'approved-by-haroon' },
  // Haroon explicitly approved matching these four original scripts to their
  // narration. Machine content verification is distinct from human listening.
  '17:2:4': { review: 'NASA NSSDCA reports 35.9 km and 4 hours 26 minutes of driving. The original narration says exploring: these figures describe rover driving across three traverses, not the total duration of the lunar EVAs. Haroon approved restoring the original script and narration; this scientific context is separate from the story.', source: 'https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_lrv.html', playback: 'enabled', listening: 'machine-verified', editorialApproval: 'approved-by-haroon' },
  '17:3:2': { review: 'Apollo 17 Mission Report, section 9.1, printed page 9-1 (PDF page 129), documents the battery 2 temperature indicator fault and monitoring using battery 1 and earlier trends. The battery did not lose its power supply. Haroon approved restoring the original script and narration.', source: 'https://ntrs.nasa.gov/api/citations/19730015117/downloads/19730015117.pdf', playback: 'enabled', listening: 'machine-verified', editorialApproval: 'approved-by-haroon' },
  '17:3:3': { review: 'The original narration uses approximately 3.7 billion years. NASA SP-350, chapter 14.6, reports historical cooling ages of 3.5 to 3.7 billion years; other NASA summaries use approximately 3.6 billion. These published estimates are scientific context, not alternative words presented as a verbatim transcript. Haroon approved restoring the original script and narration.', source: 'https://www.nasa.gov/wp-content/uploads/static/history/SP-350/ch-14-6.html', playback: 'enabled', listening: 'machine-verified', editorialApproval: 'approved-by-haroon' },
  '17:4:1': { review: 'NASA History identifies the final VIP parking site approximately 158 meters from the lunar module, positioned to televise liftoff. The original approximation has source support. Haroon approved restoring the original script and narration.', source: 'https://www.nasa.gov/history/50-years-ago-apollo-17-lands-at-taurus-littrow/', playback: 'enabled', listening: 'machine-verified', editorialApproval: 'approved-by-haroon' },
}
export const moonQuiz: Record<MoonMission, QuizQuestion[]> = {
  '11': [
    { question: 'When Eagle carried Armstrong and Aldrin away from the Moon, what did they leave behind?', options: ['A lunar camera', 'A laser ranging reflector', 'A weather station', 'A communication antenna'], answer: 1, explanation: 'Among the equipment left on the surface was the passive laser ranging retroreflector. This question refers to that experiment, not an exhaustive list of everything left behind.' },
    { question: 'What important measurement did the Apollo 11 reflector help scientists make?', options: ["The Moon’s temperature", 'The speed of lunar winds', 'To measure Earth-Moon distance', 'The age of lunar rocks'], answer: 2, explanation: 'Observatories time a laser pulse’s round trip. Half that travel distance gives the Earth-Moon range, after accounting for the measurement geometry and other corrections.' },
    { question: 'Why can the Apollo 11 reflector still work after more than five decades?', options: ['It uses sunlight for power', 'It receives power from Earth', 'It needs no electrical power', 'It has a built-in battery'], answer: 2, explanation: 'The corner cubes passively reflect incoming light. The laser and timing equipment are on Earth; the lunar array needs no battery.' },
  ],
  '17': [
    { question: 'Who drove Apollo 17’s LRV-3 across the Moon?', options: ['Neil and Buzz', 'Scott and Irwin', 'Cernan and Schmitt', 'Young and Duke'], answer: 2, explanation: 'Eugene Cernan and Harrison Schmitt explored the surface. Ronald Evans worked in lunar orbit.' },
    { question: 'What surprising color did Schmitt discover in Moon soil?', options: ['Bright orange', 'Golden yellow', 'Deep green', 'Bright blue'], answer: 0, explanation: 'The orange material at Shorty Crater contains volcanic glass beads. Laboratory studies connected them to ancient explosive eruptions.' },
    { question: 'What made Apollo 17’s Moon samples so special?', options: ['They contained pieces of another planet', 'They were made entirely of frozen water', 'They came from beneath the Moon’s core', 'They contained signs of ancient lunar volcanoes'], answer: 3, explanation: 'The samples include volcanic material that helps reconstruct lunar history. They were collected at the surface, not from the Moon’s core.' },
  ],
}
function manifest(mission: MoonMission, scripts: typeof apollo11Scripts): MoonRecording[][] {
  const chapters = [...scripts, moonQuiz[mission].map((q, i) => ({ chapter: 5, segment: i + 1, title: `Question ${i + 1}`, text: `${q.question} ${q.options.map((o, n) => `${String.fromCharCode(65 + n)}. ${o}`).join(' ')}` }))]
  return chapters.map(segments => segments.map(segment => {
    const audit = reviews[`${mission}:${segment.chapter}:${segment.segment}`]
    return { ...segment, audio: `/audio/apollo-${mission}/chapter-${segment.chapter}/${segment.segment}.mp3`,
      mapping: 'filename-and-pdf', listening: audit?.listening ?? 'pending', timing: 'pending',
      playback: audit?.playback ?? (audit ? 'review-required' : 'enabled'), readingText: audit?.readingText ?? segment.text,
      editorialApproval: audit?.editorialApproval, review: audit?.review, reviewSource: audit?.source }
  }))
}
export const moonRecordings = { '11': manifest('11', apollo11Scripts), '17': manifest('17', apollo17Scripts) }
