import { Link } from 'react-router-dom'
import { useProgress } from '../store'
import { chapterMeta } from '../machineStories'

export default function PerseveranceMissionCard() {
  const progress = useProgress()
  const id = 'follow-perseverance', saved = progress.storyProgress?.[id]
  const count = chapterMeta.filter(chapter => saved?.completed.includes(chapter.id) || progress.completedChapters.includes(`${id}:${chapter.id}`)).length
  const last = Math.min(5, Math.max(1, saved?.lastChapter || count + 1))
  const badge = progress.badges.includes(`${id}-storyteller`) || progress.badges.includes(`${id}-documentary`)
  return <section className="documentary-log" aria-label="Perseverance expedition progress">
    <h2>Perseverance expedition</h2><p>{count} / 5 reading chapters complete{badge ? ' · Mission badge earned' : ''}</p>
    <Link to={`/story/${id}/${last}`}>{count ? 'Continue Perseverance' : 'Explore Perseverance on Mars'}</Link>
  </section>
}
