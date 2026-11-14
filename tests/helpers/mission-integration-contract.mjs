// Exact authorized registration/completion seams only; never strips mission logic broadly.
const changes = [
  [
    "import MoonPackageStory from './storytelling/MoonPackageStory'\nimport Apollo16ScrollStory from './storytelling/Apollo16ScrollStory'\nimport MarsScrollStory from './storytelling/MarsScrollStory'\nimport { isMarsStory } from '../features/storytelling/marsStories'\nimport type { ReactNode } from 'react'\n",
    "import MoonPackageStory from './storytelling/MoonPackageStory'\nimport type { ReactNode } from 'react'\n"
  ],
  [
    "    stopRecordedNarration()\n    if(index===4&&(story.id==='apollo-15-rover'||story.id==='apollo-17-rover'||story.category==='stationary-experiment'||story.id==='apollo-16-rover'||isMarsStory(story.id))){\n      const prerequisites=chapterMeta.slice(0,-1)\n",
    "    stopRecordedNarration()\n    if(index===4&&(story.id==='apollo-15-rover'||story.id==='apollo-17-rover'||story.category==='stationary-experiment')){\n      const prerequisites=chapterMeta.slice(0,-1)\n"
  ],
  [
    "  }\n  if(story.id==='apollo-16-rover'){\n    if(index>unlockedIndex)return <Navigate to={`/story/${story.id}/${unlockedIndex+1}`} replace/>\n    return <Apollo16ScrollStory story={story} index={index} unlockedIndex={unlockedIndex} isDone={isDone}\n      canComplete={index<4||interacted||alreadyDone} engaged={interacted||alreadyDone} onEngage={engagePilot}\n      onQuizRetry={()=>setInteracted(false)} onNext={finish}/>\n  }\n  if(isMarsStory(story.id)){\n    if(index>unlockedIndex)return <Navigate to={`/story/${story.id}/${unlockedIndex+1}`} replace/>\n    return <MarsScrollStory story={story} index={index} unlockedIndex={unlockedIndex} isDone={isDone}\n      canComplete={index<4||interacted||alreadyDone} engaged={interacted||alreadyDone} onEngage={engagePilot} onNext={finish}\n      renderQuiz={(renderRecording,reducedMotion)=><QuizChapter story={story} onComplete={()=>setInteracted(true)} onRetry={()=>setInteracted(false)} renderRecording={renderRecording} reducedMotion={reducedMotion}/>}/>\n  }\n  // The shell owns main; keep the non-pilot stage's former global main min-height below.\n",
    "  }\n  // The shell owns main; keep the non-pilot stage's former global main min-height below.\n"
  ]
]
export function beforeMissionIntegration(source) {
  for (const [current, prior] of changes) source=source.replace(current,prior)
  return source
}
