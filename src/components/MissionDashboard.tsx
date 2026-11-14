import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Award, Check, Map, Orbit, RotateCcw, ScanLine, Sparkles } from 'lucide-react'
import { chapterMeta, machineStories as legacyStories } from '../machineStories'
import { storyCatalog as machineStories } from '../features/storytelling/storyCatalog'
import { useProgress } from '../store'
import PerseveranceMissionCard from './PerseveranceMissionCard'

const missions = Object.values(machineStories)
const chapterTotal = missions.length * chapterMeta.length

export default function MissionDashboard(){
  const progress=useProgress()
  const missionBadges=progress.badges.filter(id=>missions.some(mission=>id===`${mission.id}-storyteller`))
  const completedFor=(id:string)=>chapterMeta.filter(chapter=>progress.storyProgress?.[id]?.completed.includes(chapter.id)||progress.completedChapters.includes(`${id}:${chapter.id}`))
  const total=missions.reduce((sum,mission)=>sum+completedFor(mission.id).length,0)
  const achievements=[
    {icon:<Map/>,value:progress.exploredLocations.length,label:'World locations surveyed'},
    {icon:<ScanLine/>,value:progress.inspectedInstruments.length,label:'Instruments inspected'},
    {icon:<Award/>,value:missionBadges.length,label:'Mission badges earned'},
  ]
  return <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mission-control-page">
    <header className="mission-control-head"><div><Link className="mission-back-link" to="/hardware"><ArrowLeft aria-hidden="true"/> Back to missions</Link><span className="eyebrow"><span/> PERSONAL MISSION NETWORK</span><h1>Mission Control</h1><p>Your fieldwork is stored on this device. Every machine keeps its own chapter position, discoveries, and completion record.</p></div><div className="mission-total"><Orbit/><span><small>EXPEDITION COMPLETION</small><b>{chapterTotal?Math.round(total/chapterTotal*100):0}%</b></span></div></header>
    {Object.entries(progress.roverJourneys||{}).length>0&&<section className="documentary-log"><h2>Your rover documentaries</h2><p>Five chapters, one field challenge, a story worth remembering.</p>{[...missions,legacyStories['follow-perseverance']].filter(m=>progress.roverJourneys?.[m.id]).map(m=>{const journey=progress.roverJourneys[m.id];return <div key={m.id}><Link to={m.id==='follow-perseverance'?`/story/${m.id}/1`:`/inspection/${m.id}/1`}>{journey.completedAt?<Award size={17}/>:<Orbit size={17}/>} {m.missionLabel} · {journey.completedAt?'Mission Explorer earned':`${journey.visited.length}/5 chapters explored`}</Link></div>})}</section>}
    <PerseveranceMissionCard />
    <section className="journey-console"><div className="console-label"><span>ACTIVE STORY MISSIONS</span><small>{total} / {chapterTotal} CHAPTERS COMPLETE</small></div><div className="mission-tracks">{missions.map(mission=>{
      const done=completedFor(mission.id),pct=done.length/chapterMeta.length*100,last=Math.min(chapterMeta.length,progress.storyProgress?.[mission.id]?.lastChapter||done.length+1)
      return <article key={mission.id} className={`mission-track ${mission.planet}`}>
        <div className="mission-orbit-graphic"><i/><span>{mission.planet.toUpperCase()}</span><b style={{'--mission-pct':`${pct}%`} as React.CSSProperties}/></div>
        <div className="mission-track-copy"><span>{mission.missionLabel} · {mission.status}</span><h2>{mission.name}</h2><p>{mission.heroLine}</p><div className="chapter-rail">{chapterMeta.map((chapter,i)=>{const complete=done.some(item=>item.id===chapter.id),active=i===last-1&&!complete;return <div key={chapter.id} className={`${complete?'complete':''} ${active?'active':''}`}><i>{complete?<Check/>:i+1}</i><span><b>{chapter.title}</b><small>{complete?'COMPLETE':active?'NEXT TRANSMISSION':'LOCKED'}</small></span></div>})}</div></div>
        <div className="mission-track-action"><strong>{pct}%</strong><small>{done.length} OF {chapterMeta.length} CHAPTERS</small><Link to={`/story/${mission.id}/${last}`}>{done.length?'CONTINUE MISSION':'BEGIN MISSION'} <ArrowRight/></Link></div>
      </article>})}</div></section>
    <section className="mission-insights"><div className="achievement-board"><div className="console-label"><span>FIELD ACHIEVEMENTS</span><small>LIVE LOCAL TELEMETRY</small></div><div>{achievements.map(item=><article key={item.label}>{item.icon}<b>{String(item.value).padStart(2,'0')}</b><span>{item.label}</span></article>)}</div></div><article className="reward-vault"><Sparkles/><span>MISSION REWARD VAULT</span><h2>{progress.badges.length?`${progress.badges.length} reward${progress.badges.length===1?'':'s'} unlocked`:'Your first badge is waiting'}</h2><p>Complete all five chapters in a machine’s story to earn its scientific field badge.</p><div>{missions.map(mission=><span key={mission.id} className={(progress.badges.includes(`${mission.id}-storyteller`)||progress.badges.includes(`${mission.id}-documentary`))?'earned':''}><Award/><b>{progress.badges.includes(`${mission.id}-documentary`)?`Mission Explorer — ${mission.shortName}`:mission.reward}</b><small>{(progress.badges.includes(`${mission.id}-storyteller`)||progress.badges.includes(`${mission.id}-documentary`))?'EARNED':'LOCKED'}</small></span>)}</div></article></section>
    <button className="reset-button" onClick={()=>{if(confirm('Reset all locally stored mission progress?'))progress.reset()}}><RotateCcw/> Reset local progress</button>
  </motion.div>
}
