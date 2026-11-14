// Historical source guards still check every byte outside these exact, explicit
// integration seams. Real continuous routes are tested separately, unnormalized.
import { beforeMasterIntegration } from './master-integration-contract.mjs'
export function beforeContinuousStory(source) {
  return beforeMasterIntegration(source)
    .replace("const ContinuousStoryPage = lazy(() => import('./components/storytelling/ContinuousStoryPage'))\n", '')
    .replace('<Route path="/story/:storyId" element={<Suspense fallback={<SceneLoader/>}><ContinuousStoryPage/></Suspense>}/>', '')
    .replace('<Route path="/story/:storyId/:chapter" element={<Suspense fallback={<SceneLoader/>}><ContinuousStoryPage/></Suspense>}/>', '<Route path="/story/:storyId/:chapter" element={<Suspense fallback={<SceneLoader/>}><MachineStoryPage/></Suspense>}/>')
    .replace('\n\nexport { QuizChapter as DocumentaryQuiz }\n', '\n')
}
