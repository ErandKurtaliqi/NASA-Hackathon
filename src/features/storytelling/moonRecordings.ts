import apollo11Scripts from './apollo11PackageScripts.json'
import apollo17Scripts from './apollo17PackageScripts.json'
import type { QuizQuestion } from '../../machineStories'

export type MoonMission = '11' | '17'
export type MoonRecording = {
  chapter: number; segment: number; title: string; text: string; audio: string
  mapping: 'filename-and-pdf'; listening: 'pending'; timing: 'pending'
  playback: 'enabled' | 'review-required'; review?: string; readingText: string
}
// Never silently edit the supplied script or recording. Questionable assertions
// remain in the private source, while the public reading uses supported wording.
const reviews: Record<string, { review: string; readingText: string }> = {
  '11:2:3': { review: 'The package names an individual deployer inconsistently. Historical review is required before playing this recording.', readingText: 'Buzz Aldrin carried the experiment packages away from Eagle. The crew placed the passive reflector on the lunar surface during the Apollo 11 moonwalk.' },
  '11:2:4': { review: 'The deployer and exact placement distance need reconciliation with the source research sheet.', readingText: 'The reflector was set on the lunar surface, leveled and pointed toward Earth. It needed no electrical power.' },
  '11:4:4': { review: 'The package specifies an exact distance that its own source notes say remains unconfirmed.', readingText: 'The array remains at Tranquility Base. Earth observatories use returned pulses for lunar science; the reflector itself has no powered transmitter.' },
  '17:2:4': { review: 'The PDF gives 35.9 km here and 35.7 km in its summary. Keep the recording pending scientific approval.', readingText: 'Across three surface traverses, LRV-3 extended the astronauts’ reach. The mission covered about 36 kilometers and returned samples from diverse terrain.' },
  '17:3:2': { review: 'The supplied battery-gauge account needs a direct mission-report reference before playback approval.', readingText: 'Battery power and thermal monitoring were essential to operating an electric vehicle in lunar vacuum. Read the existing engineering account below.' },
  '17:3:3': { review: 'The package gives conflicting ages for the volcanic glass. NASA describes roughly 3.6-billion-year-old volcanic material.', readingText: 'Schmitt discovered orange soil at Shorty Crater. Its volcanic glass beads preserve evidence of ancient explosive eruptions, about 3.6 billion years ago.' },
  '17:4:1': { review: 'The exact parking distance conflicts with the PDF’s own instruction to omit unconfirmed distances.', readingText: 'Cernan parked the rover away from Challenger so its Earth-controlled television camera could observe liftoff. The rover was deliberately left on the Moon.' },
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
      mapping: 'filename-and-pdf', listening: 'pending', timing: 'pending',
      playback: audit ? 'review-required' : 'enabled', readingText: audit?.readingText ?? segment.text,
      review: audit?.review }
  }))
}
export const moonRecordings = { '11': manifest('11', apollo11Scripts), '17': manifest('17', apollo17Scripts) }
