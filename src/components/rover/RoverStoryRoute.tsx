import { lazy, Suspense } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import CinematicRoverExperience from './CinematicRoverExperience'

const ChapterReader = lazy(() => import('../MachineStoryPage'))

export default function RoverStoryRoute() {
  const { storyId = 'follow-perseverance', chapter = '1' } = useParams()
  const [params] = useSearchParams()
  if (params.get('view') === 'reader' || chapter === '5') return <><div className="return-to-documentary"><Link to={`/story/${storyId}/1`}>← Enter the cinematic story</Link></div><Suspense fallback={<p>Opening the chapter reader…</p>}><ChapterReader allowPerseverance /></Suspense></>
  // Keep the meaning of existing deep links: chapter 4 was the legacy chapter.
  const legacyIndex: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 4 }
  return <CinematicRoverExperience storyId={storyId} initialChapter={legacyIndex[chapter] ?? 0} />
}
