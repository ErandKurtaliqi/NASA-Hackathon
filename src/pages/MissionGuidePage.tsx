import { useReducedMotion } from 'framer-motion'
import HomeEducation from '../components/home/HomeEducation'

export default function MissionGuidePage() {
  const reduced = useReducedMotion()
  const calm = typeof localStorage !== 'undefined' && localStorage.getItem('auroralys-calm') === 'true'
  return <div className="landing"><header className="page-heading"><h1>Discover missions</h1><p>Science, machines and the questions that drive exploration.</p></header><HomeEducation animated={!reduced && !calm} /></div>
}
