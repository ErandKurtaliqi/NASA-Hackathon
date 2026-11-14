import { useState } from 'react'
import type { MachineStory } from '../../machineStories'
import LaserRangingActivity from './activities/LaserRangingActivity'
import EvidencePredictionActivity from './activities/EvidencePredictionActivity'
import { apollo15HammerFeatherPrediction } from '../../features/storytelling/activities/apollo15Prediction'
import { isMarsStory, marsReviewNote } from '../../features/storytelling/marsStories'

const engineeringChoices: Record<string, { question: string; choices: [string, string]; answer: number; explanation: string }> = {
  'apollo-15-rover': {
    question: 'Your front wheels will no longer steer. How can you keep driving?',
    choices: ['Use the rear steering', 'Turn up the radio'],
    answer: 0,
    explanation: 'The crew used the rear steering when the front steering failed on the first drive.',
  },
  opportunity: {
    question: 'A dust storm darkens the sky. Which reading would you check first to find out whether the rover can keep working?',
    choices: ['The number of photos taken', 'The power from the solar panels'],
    answer: 1,
    explanation: 'Opportunity relied on sunlight for power. Thick atmospheric dust can cut the sunlight reaching its panels.',
  },
  ingenuity: {
    question: 'Choose a patch of ground that makes it easier for my downward camera to track movement.',
    choices: ['A patch with visible pebbles', 'A patch of smooth sand'],
    answer: 0,
    explanation: 'The navigation camera tracks recognizable features as they move through its view. Smooth ground offers fewer features to track.',
  },
}

function EngineeringChoice({ activity }: { activity: typeof engineeringChoices[string] }) {
  const [choice, setChoice] = useState<number>()
  return <section aria-label="Engineering challenge">
    <h3>Make the call</h3>
    <p>{activity.question}</p>
    {activity.choices.map((option, index) => <button type="button" key={option} aria-pressed={choice === index} onClick={() => setChoice(index)}>{option}</button>)}
    <p role="status">{choice !== undefined && (choice === activity.answer ? activity.explanation : 'Try the other option. Think about what the hardware needs to do.')}</p>
  </section>
}

/** Existing educational tasks in the continuous document. Their state survives
 * scrolling away, and opening an activity never marks a chapter complete. */
export default function DocumentaryActivities({ story, chapter }: { story: MachineStory; chapter: number }) {
  const [profile, setProfile] = useState(0), [found, setFound] = useState<number[]>([]), [control, setControl] = useState('')
  const apollo15 = story.id === 'apollo-15-rover', apollo16 = story.id === 'apollo-16-rover'
  const engineeringChoice = engineeringChoices[story.id]
  return <section aria-label={`Chapter ${chapter + 1} optional mission activities`}>
    <h3>Explore the mission</h3><p>Optional activities. Reading and completion are always your choice.</p>
    {story.category === 'stationary-experiment' ? chapter === 0 && <LaserRangingActivity /> : <>
      {chapter === 0 && <div className="profile-grid">{story.profile.map((item, i) => <button type="button" key={item.label} aria-pressed={profile === i} onClick={() => setProfile(i)}><small>{item.label}</small><b>{item.value}</b></button>)}</div>}
      {chapter === 1 && (apollo16 ? <><h3>Explore the hand controller</h3><p>Conceptual learning activity; no vehicle is being simulated.</p>{[
        ['Push forward', 'Concept: command forward motion. An electric motor at each wheel provided traction.'],
        ['Pull back', 'Concept: reduce speed and brake. Real handling depended on terrain and loading.'],
        ['Steer left or right', 'Concept: turn the hand controller. Front and rear steering systems could operate independently.'],
      ].map(([label, result]) => <button type="button" key={label} aria-pressed={control === result} onClick={() => setControl(result)}>{label}</button>)}<p role="status">{control || 'Choose a control to learn what it commanded.'}</p></> : apollo15 ? <details><summary>Predict: does lower gravity change the rover's mass?</summary><p>Its weight decreases; its mass stays the same. Compare this with the One-sixth Gravity segment above.</p></details> : isMarsStory(story.id) ? <details><summary>Explain: why does a robotic mission need partners?</summary><p>Compare the roles described in the original mission account. Revisit its evidence above.</p></details> : story.journey.map(item => <details key={item.label}><summary>{item.label}</summary><p><b>{item.date} · {item.title}</b><br />{item.copy}</p></details>))}
      {chapter === 2 && <><details><summary>Engineering solutions</summary>{story.challenges.map(item => <details key={item.title}><summary>{item.title}</summary><p>{item.problem}</p><p>{item.solution}</p></details>)}</details><div className="discovery-bank">{story.discoveries.map((item, i) => <button type="button" key={item.title} aria-expanded={found.includes(i)} onClick={() => setFound(items => items.includes(i) ? items : [...items, i])}><span><b>{item.title}</b><small>{found.includes(i) ? item.detail : 'Tap to reveal this discovery'}</small>{found.includes(i) && isMarsStory(story.id) && <small>{marsReviewNote(story.id, 2, i)}</small>}</span></button>)}</div></>}
      {chapter === 3 && <>{story.legacy.map(item => <details key={item.title}><summary>{item.year}: {item.title}</summary><p>{item.copy}</p></details>)}{isMarsStory(story.id) && <details><summary>Reflect: what can a future explorer learn from this mission?</summary><p>Choose one observation or engineering challenge from this story. Explain which evidence supports your idea.</p></details>}</>}
    </>}
    {chapter === 2 && engineeringChoice && <EngineeringChoice activity={engineeringChoice} />}
    {apollo15 && chapter === 3 && <EvidencePredictionActivity activity={apollo15HammerFeatherPrediction} />}
  </section>
}
