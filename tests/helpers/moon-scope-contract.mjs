import { beforeContinuousStory } from './continuous-story-contract.mjs'
import { beforeMissionIntegration } from './mission-integration-contract.mjs'
import { beforeStoryVisual } from './story-visual-contract.mjs'
// Exact authorized local-QA deltas only; historical snapshots still guard all other source.
// Public behavior is tested separately against the actual, unnormalized implementation.
const changes = [
  [
    "import { markers, sources } from './data'\nimport { missionHardware as hardware } from './features/storytelling/storyCatalog'",
    "import { hardware, markers, sources } from './data'"
  ],
  [
    "import StoryMedia from './components/storytelling/StoryMedia'\nimport { apollo11StoryMedia } from './features/storytelling/apollo11StoryMedia'",
    ""
  ],
  [
    "        <NavLink to=\"/explore/mars\" onClick={closeMenu}>Explore</NavLink><NavLink to=\"/story/apollo-15-rover/1\" onClick={closeMenu}>Story</NavLink><NavLink to=\"/hardware\" onClick={closeMenu}>Hardware</NavLink><NavLink to=\"/dashboard\" onClick={closeMenu}>Mission control</NavLink><NavLink to=\"/sources\" onClick={closeMenu}>Sources</NavLink>",
    "        <NavLink to=\"/explore/mars\" onClick={closeMenu}>Explore</NavLink><NavLink to=\"/story/follow-perseverance/1\" onClick={closeMenu}>Story</NavLink><NavLink to=\"/hardware\" onClick={closeMenu}>Hardware</NavLink><NavLink to=\"/dashboard\" onClick={closeMenu}>Mission control</NavLink><NavLink to=\"/sources\" onClick={closeMenu}>Sources</NavLink>"
  ],
  [
    "function Hardware(){const [selected,setSelected]=useState(hardware[0]);const progress=useProgress(s=>s.storyProgress);const storyId=getStoryEntry(selected)?.story.id;const storyLink=storyId?getStoryEntry(selected,progress?.[storyId])?.href:null; return <motion.div {...page} className=\"hardware-page\"><section className=\"page-heading\"><span className=\"eyebrow\"><span/> HARDWARE LAB</span><h1>Machines built<br/>for other worlds.</h1><p>Explore the purpose and instruments of these trailblazing spacecraft. Lunar rovers and a stationary reflector experiment share accessible, optional stories.</p></section><div className=\"hardware-layout\"><div className=\"hardware-list\">{hardware.map((h,i)=><button key={h.id} onClick={()=>setSelected(h)} className={selected.id===h.id?'active':''}><span>{String(i+1).padStart(2,'0')}</span><div><b>{h.name}</b><small>{h.type}</small></div><ChevronRight/></button>)}</div><div className=\"hardware-view\"><div className=\"hardware-scene\">{selected.id==='apollo-11-lrrr'?<StoryMedia media={apollo11StoryMedia.array} motionEnabled={false}/>:selected.id==='lrv'?<Suspense fallback={<SceneLoader/>}><LunarRoverScene interactive/></Suspense>:<MachineIllustration id={selected.id}/>}</div><div className=\"hardware-info\"><span className=\"tag\">{selected.planet.toUpperCase()} \u00b7 {selected.type.toUpperCase()}</span><h2>{selected.name}</h2><small>{selected.missionDate}</small><p className=\"lead\">{selected.overview}</p><p>{selected.purpose}</p><h3>KEY SYSTEMS & INSTRUMENTS</h3><div className=\"instrument-tags\">{selected.instruments.map(i=><span key={i}>{i}</span>)}</div><div className=\"hardware-actions\">{storyLink&&<Link className=\"button primary\" to={storyLink}>{progress?.[storyId!]?.completed.length?'Continue my story':'Hear my story'} <BookOpen/></Link>}<a className=\"button secondary\" href={selected.source.url} target=\"_blank\" rel=\"noreferrer\">Official source <ExternalLink/></a></div></div></div></div></motion.div>}",
    "function Hardware(){const [selected,setSelected]=useState(hardware[0]);const progress=useProgress(s=>s.storyProgress);const storyId=getStoryEntry(selected)?.story.id;const storyLink=storyId?getStoryEntry(selected,progress?.[storyId])?.href:null; return <motion.div {...page} className=\"hardware-page\"><section className=\"page-heading\"><span className=\"eyebrow\"><span/> HARDWARE LAB</span><h1>Machines built<br/>for other worlds.</h1><p>Explore the purpose and instruments of these trailblazing spacecraft. Perseverance uses NASA/JPL\u2019s official 3D asset; the Apollo 17 rover has a dedicated interactive lunar reconstruction.</p></section><div className=\"hardware-layout\"><div className=\"hardware-list\">{hardware.map((h,i)=><button key={h.id} onClick={()=>setSelected(h)} className={selected.id===h.id?'active':''}><span>{String(i+1).padStart(2,'0')}</span><div><b>{h.name}</b><small>{h.type}</small></div><ChevronRight/></button>)}</div><div className=\"hardware-view\"><div className=\"hardware-scene\">{selected.id==='perseverance'?<Suspense fallback={<SceneLoader/>}><RoverScene interactive/></Suspense>:selected.id==='lrv'?<Suspense fallback={<SceneLoader/>}><LunarRoverScene interactive/></Suspense>:<MachineIllustration id={selected.id}/>}</div><div className=\"hardware-info\"><span className=\"tag\">{selected.planet.toUpperCase()} \u00b7 {selected.type.toUpperCase()}</span><h2>{selected.name}</h2><small>{selected.missionDate}</small><p className=\"lead\">{selected.overview}</p><p>{selected.purpose}</p><h3>KEY SYSTEMS & INSTRUMENTS</h3><div className=\"instrument-tags\">{selected.instruments.map(i=><span key={i}>{i}</span>)}</div><div className=\"hardware-actions\">{storyLink&&<Link className=\"button primary\" to={storyLink}>{progress?.[storyId!]?.completed.length?'Continue my story':'Hear my story'} <BookOpen/></Link>}<a className=\"button secondary\" href={selected.source.url} target=\"_blank\" rel=\"noreferrer\">Official source <ExternalLink/></a></div></div></div></div></motion.div>}"
  ],
  [
    "function Sources(){const unique=useMemo(()=>Array.from(new Map([...Object.values(sources),...markers.map(m=>m.source)].map(s=>[s.url,s])).values()),[]);return <motion.div {...page} className=\"sources-page\"><section className=\"page-heading\"><span className=\"eyebrow\"><span/> SCIENTIFIC INTEGRITY</span><h1>Sources & attribution</h1><p>This experience uses live NASA/JPL planetary imagery, historical mission photographs, and a curated scientific dataset. Every learning claim links to an authoritative source.</p></section><div className=\"integrity-note\"><Gauge/><div><b>Real assets, stated limits</b><p>Mars uses the MGS MOLA global color hillshade and the Moon uses the LRO WAC global mosaic from NASA Trek. Mission photographs are distinguished from educational diagrams. Project narration is not original astronaut audio.</p></div></div><div className=\"source-list\">{unique.map((s,i)=><a href={s.url} target=\"_blank\" rel=\"noreferrer\" key={s.url}><span>{String(i+1).padStart(2,'0')}</span><div><b>{s.label}</b><small>{s.url}</small></div><ExternalLink/></a>)}</div><div className=\"method\"><h2>Imagery, model & coordinate method</h2><p>WMTS parameters were read from each live GetCapabilities document. The custom Leaflet CRS maps \u2212180\u00b0\u2026180\u00b0 longitude and \u221290\u00b0\u202690\u00b0 latitude onto NASA\u2019s 2:1 tile matrices. Historical assets remain in the repository for provenance; their presence does not mean every mission is published in the current catalog.</p><p>Dates, mission objectives, EDL order, and science facts come from the official resources listed below. AURORALYS is an independent educational project and does not imply NASA endorsement.</p></div></motion.div>}",
    "function Sources(){const unique=useMemo(()=>Array.from(new Map([...Object.values(sources),...markers.map(m=>m.source)].map(s=>[s.url,s])).values()),[]);return <motion.div {...page} className=\"sources-page\"><section className=\"page-heading\"><span className=\"eyebrow\"><span/> SCIENTIFIC INTEGRITY</span><h1>Sources & attribution</h1><p>This experience uses live NASA/JPL planetary imagery, NASA/JPL\u2019s official Perseverance model, and a curated scientific dataset. Every learning claim links to an authoritative source.</p></section><div className=\"integrity-note\"><Gauge/><div><b>Real assets, stated limits</b><p>Mars uses the MGS MOLA global color hillshade and the Moon uses the LRO WAC global mosaic from NASA Trek. Perseverance uses the official NASA/JPL GLB model. The landing sequence is an interactive educational reconstruction based on NASA\u2019s documented event order \u2014 it is not official footage or an engineering simulation.</p></div></div><div className=\"source-list\">{unique.map((s,i)=><a href={s.url} target=\"_blank\" rel=\"noreferrer\" key={s.url}><span>{String(i+1).padStart(2,'0')}</span><div><b>{s.label}</b><small>{s.url}</small></div><ExternalLink/></a>)}</div><div className=\"method\"><h2>Imagery, model & coordinate method</h2><p>WMTS parameters were read from each live GetCapabilities document. The custom Leaflet CRS maps \u2212180\u00b0\u2026180\u00b0 longitude and \u221290\u00b0\u202690\u00b0 latitude onto NASA\u2019s 2:1 tile matrices. The official Perseverance GLB is presented with custom lighting and educational hotspots; its geometry is not modified into an engineering analysis model.</p><p>Dates, mission objectives, EDL order, and science facts come from the official resources listed below. AURORALYS is an independent educational project and does not imply NASA endorsement.</p></div></motion.div>}"
  ],
  [
    "import MoonPackageStory from './storytelling/MoonPackageStory'",
    "import Apollo17ScrollStory from './storytelling/Apollo17ScrollStory'"
  ],
  [
    "    stopRecordedNarration()\n    if(index===4&&(story.id==='apollo-15-rover'||story.id==='apollo-17-rover'||story.category==='stationary-experiment')){",
    "    if(story.id==='apollo-15-rover')stopRecordedNarration()\n    if(index===4&&(story.id==='apollo-15-rover'||story.id==='apollo-17-rover')){"
  ],
  [
    "  if(story.id==='apollo-17-rover'||story.category==='stationary-experiment'){",
    "  if(story.id==='apollo-17-rover'){"
  ],
  [
    "    return <MoonPackageStory story={story} index={index} unlockedIndex={unlockedIndex} isDone={isDone}",
    "    return <Apollo17ScrollStory story={story} index={index} unlockedIndex={unlockedIndex} isDone={isDone}"
  ],
  [
    "    {story.id==='follow-perseverance'&&index===4?<PerseveranceCompletion story={story} canComplete={interacted||alreadyDone} onPrevious={()=>navigate(`/story/${story.id}/4`)}/>:<div className=\"machine-story-bottom\"><button disabled={index===0} onClick={()=>{stopRecordedNarration();navigate(`/story/${story.id}/${index}`)}}><ArrowLeft/> PREVIOUS CHAPTER</button><span><b>{interacted||alreadyDone?'INTERACTION COMPLETE':optionalMeet?'EXPLORE OR CONTINUE':'EXPLORE TO CONTINUE'}</b><small>{meta.short}</small></span><button className=\"primary\" disabled={!optionalMeet&&!interacted&&!alreadyDone} onClick={finish}>{index===4?'COMPLETE STORY':'NEXT CHAPTER'} <ArrowRight/></button></div>}",
    "    {story.id==='follow-perseverance'&&index===4?<PerseveranceCompletion story={story} canComplete={interacted||alreadyDone} onPrevious={()=>navigate(`/story/${story.id}/4`)}/>:<div className=\"machine-story-bottom\"><button disabled={index===0} onClick={()=>{if(story.id==='apollo-15-rover')stopRecordedNarration();navigate(`/story/${story.id}/${index}`)}}><ArrowLeft/> PREVIOUS CHAPTER</button><span><b>{interacted||alreadyDone?'INTERACTION COMPLETE':optionalMeet?'EXPLORE OR CONTINUE':'EXPLORE TO CONTINUE'}</b><small>{meta.short}</small></span><button className=\"primary\" disabled={!optionalMeet&&!interacted&&!alreadyDone} onClick={finish}>{index===4?'COMPLETE STORY':'NEXT CHAPTER'} <ArrowRight/></button></div>}"
  ],
  [
    "  { to: '/story/apollo-15-rover/1', label: 'Story' },",
    "  { to: '/story/follow-perseverance/1', label: 'Story' },"
  ],
  [
    "import { markers } from '../data'\nimport { missionHardware as hardware } from '../features/storytelling/storyCatalog'",
    "import { hardware, markers } from '../data'"
  ],
  [
    "        <Link to=\"/story/apollo-15-rover/1\" onClick={() => setOpen(false)}>Story <ArrowUpRight aria-hidden=\"true\" /></Link>",
    "        <Link to=\"/story/follow-perseverance/1\" onClick={() => setOpen(false)}>Story <ArrowUpRight aria-hidden=\"true\" /></Link>"
  ],
  [
    "  category?: 'rover' | 'stationary-experiment'",
    ""
  ],
  [
    "export default function RoverStoryLayout({ rover, children, evidence, storytellerLabel = 'Your rover storyteller' }: { rover: ReactNode; children: ReactNode; evidence: ReactNode; storytellerLabel?: string }) {",
    "export default function RoverStoryLayout({ rover, children, evidence }: { rover: ReactNode; children: ReactNode; evidence: ReactNode }) {"
  ],
  [
    "    <aside className={styles.rover} aria-label={storytellerLabel}>{rover}</aside>",
    "    <aside className={styles.rover} aria-label=\"Your rover storyteller\">{rover}</aside>"
  ],
  [
    "import { chapterMeta, type MachineStory } from '../../machineStories'\nimport { storyCatalog } from './storyCatalog'",
    "import { chapterMeta, machineStories, type MachineStory } from '../../machineStories'"
  ],
  [
    "  if (!Object.prototype.hasOwnProperty.call(storyCatalog, storyId) || !/^[1-9]\\d*$/.test(chapter)) return null",
    "  if (!Object.prototype.hasOwnProperty.call(machineStories, storyId) || !/^[1-9]\\d*$/.test(chapter)) return null"
  ],
  [
    "  return { story: storyCatalog[storyId], index: number - 1 }",
    "  return { story: machineStories[storyId], index: number - 1 }"
  ],
  [
    "import { chapterMeta } from '../../machineStories'\nimport { storyCatalog } from '../storytelling/storyCatalog'",
    "import { chapterMeta, machineStories } from '../../machineStories'"
  ],
  [
    "  const story = Object.values(storyCatalog).find(item => item.machineId === machine.id && item.planet === machine.planet)",
    "  const story = Object.values(machineStories).find(item => item.machineId === machine.id && item.planet === machine.planet)"
  ],
  [
    "import { chapterMeta } from '../machineStories'\nimport { storyCatalog as machineStories } from '../features/storytelling/storyCatalog'",
    "import { chapterMeta, machineStories } from '../machineStories'"
  ],
  [
    "  const missionBadges=progress.badges.filter(id=>missions.some(mission=>id===`${mission.id}-storyteller`))",
    ""
  ],
  [
    "    {icon:<Award/>,value:missionBadges.length,label:'Mission badges earned'},",
    "    {icon:<Award/>,value:progress.badges.length,label:'Mission badges earned'},"
  ],
  [
    "    <section className=\"mission-insights\"><div className=\"achievement-board\"><div className=\"console-label\"><span>FIELD ACHIEVEMENTS</span><small>LIVE LOCAL TELEMETRY</small></div><div>{achievements.map(item=><article key={item.label}>{item.icon}<b>{String(item.value).padStart(2,'0')}</b><span>{item.label}</span></article>)}</div></div><article className=\"reward-vault\"><Sparkles/><span>MISSION REWARD VAULT</span><h2>{missionBadges.length?`${missionBadges.length} reward${missionBadges.length===1?'':'s'} unlocked`:'Your first badge is waiting'}</h2><p>Complete all five chapters in a machine\u2019s story to earn its scientific field badge.</p><div>{missions.map(mission=><span key={mission.id} className={progress.badges.includes(`${mission.id}-storyteller`)?'earned':''}><Award/><b>{mission.reward}</b><small>{progress.badges.includes(`${mission.id}-storyteller`)?'EARNED':'LOCKED'}</small></span>)}</div></article></section>",
    "    <section className=\"mission-insights\"><div className=\"achievement-board\"><div className=\"console-label\"><span>FIELD ACHIEVEMENTS</span><small>LIVE LOCAL TELEMETRY</small></div><div>{achievements.map(item=><article key={item.label}>{item.icon}<b>{String(item.value).padStart(2,'0')}</b><span>{item.label}</span></article>)}</div></div><article className=\"reward-vault\"><Sparkles/><span>MISSION REWARD VAULT</span><h2>{progress.badges.length?`${progress.badges.length} reward${progress.badges.length===1?'':'s'} unlocked`:'Your first badge is waiting'}</h2><p>Complete all five chapters in a machine\u2019s story to earn its scientific field badge.</p><div>{missions.map(mission=><span key={mission.id} className={progress.badges.includes(`${mission.id}-storyteller`)?'earned':''}><Award/><b>{mission.reward}</b><small>{progress.badges.includes(`${mission.id}-storyteller`)?'EARNED':'LOCKED'}</small></span>)}</div></article></section>"
  ]
]
export function beforeMoonScope(source) {
  source=beforeStoryVisual(beforeMissionIntegration(beforeContinuousStory(source)))
  // Exact reviewed quiz-retry fix only, for historical source comparisons.
  // Functional quiz tests compile the actual implementation without this helper.
  source=source.replace('function QuizChapter({story,onComplete,onRetry,renderRecording,reducedMotion=false}:{story:MachineStory;onComplete:()=>void;onRetry?:()=>void;renderRecording?', 'function QuizChapter({story,onComplete,renderRecording,reducedMotion=false}:{story:MachineStory;onComplete:()=>void;renderRecording?')
    .replace('onClick={()=>{onRetry?.();setQuestion(0);setAnswers([]);setScore(0);setFinished(false)}}', 'onClick={()=>{setQuestion(0);setAnswers([]);setScore(0);setFinished(false)}}')
    .replaceAll('onComplete={()=>setInteracted(true)} onRetry={()=>setInteracted(false)} renderRecording=', 'onComplete={()=>setInteracted(true)} renderRecording=')
  for (const [current, prior] of changes) source = source.replace(prior ? current : current + '\n', prior)
  if (source.includes("function Hardware()") && !source.includes("const RoverScene =")) source=source.replace("const LunarRoverScene =", "const RoverScene = lazy(() => import('./components/RoverScene'))\nconst LunarRoverScene =")
  return source
}
