import { useParams } from 'react-router-dom'
import ContinuousStoryPage from './ContinuousStoryPage'
import RoverStoryRoute from '../rover/RoverStoryRoute'

export default function IntegratedStoryRoute() {
  const { storyId, chapter } = useParams()
  return storyId === 'follow-perseverance' && (chapter === undefined || /^[1-5]$/.test(chapter))
    ? <RoverStoryRoute /> : <ContinuousStoryPage />
}
