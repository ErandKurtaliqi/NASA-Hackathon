import './animations.css'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { ArrowRight, BookOpen, ChevronRight, ExternalLink, Gauge, Menu, Orbit, Satellite, X } from 'lucide-react'
import { markers, sources } from './data'
import { explorerHardware as hardware, getExplorerStoryEntry as getStoryEntry } from './features/explorer/integratedStoryEntry'
import { useProgress } from './store'
import HomePage from './pages/HomePage'
import ExplorerPage from './pages/ExplorerPage'
import FooterBrand from './components/branding/FooterBrand'
import StoryMedia from './components/storytelling/StoryMedia'
import { apollo11StoryMedia } from './features/storytelling/apollo11StoryMedia'

const LunarRoverScene = lazy(() => import('./components/LunarRoverScene'))
const IngenuityScene = lazy(() => import('./components/IngenuityScene'))
const RoverInspection = lazy(() => import('./components/rover/RoverStoryRoute'))
const ContinuousStoryPage = lazy(() => import('./components/storytelling/IntegratedStoryRoute'))
const MissionGuidePage = lazy(() => import('./pages/MissionGuidePage'))
const MissionDashboard = lazy(() => import('./components/MissionDashboard'))

const page = { initial:{opacity:0,y:10}, animate:{opacity:1,y:0}, exit:{opacity:0,y:-8}, transition:{duration:.34} }
function SceneLoader(){return <div className="scene-loader"><Orbit className="spin"/><span>Initializing visual systems…</span></div>}

function Shell({children}:{children:React.ReactNode}){
  const location=useLocation()
  const pathname=location.pathname
  const isHome=pathname==='/'
  const immersive=pathname.startsWith('/inspection/')||(pathname.startsWith('/story/follow-perseverance')&&!pathname.endsWith('/5')&&new URLSearchParams(location.search).get('view')!=='reader')
  const [calm,setCalm]=useState(()=>typeof localStorage!=='undefined'&&localStorage.getItem('auroralys-calm')==='true')
  const toggleMotion=()=>{setCalm(value=>{localStorage.setItem('auroralys-calm',String(!value));return !value})}
  const isExplorer=/^\/explore\/[^/]+\/?$/.test(pathname)
  const [open,setOpen]=useState(false)
  const menuToggle=useRef<HTMLButtonElement>(null)
  const navigation=useRef<HTMLElement>(null)
  const closeMenu=()=>{if(open){setOpen(false);menuToggle.current?.focus()}}
  // Close on all navigations, including history and links outside this menu.
  // Restore only focus that would remain in a collapsed mobile nav. A page
  // that already focused its destination (e.g. a story heading) keeps it.
  useEffect(()=>{
    setOpen(false)
    if(navigation.current?.contains(document.activeElement)&&menuToggle.current?.getClientRects().length)menuToggle.current.focus()
  },[location])
  // The mobile toggle follows the nav in DOM order, so Tab alone would skip it.
  useEffect(()=>{if(open)navigation.current?.querySelector<HTMLAnchorElement>('a')?.focus()},[open])
  return <MotionConfig reducedMotion={calm?'always':'user'}><div className={`app-shell ${calm?'calm-motion':''}`}>
    {!isHome&&!isExplorer&&!immersive&&<header className="topbar" onKeyDown={event=>{
      if(event.key==='Escape'&&open){event.preventDefault();closeMenu()}
    }} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setOpen(false)}}>
      <Link className="brand" to="/" aria-label="Auroralys home"><img src="/images/home/auroralys-mark.svg" width="34" height="34" alt="" style={{ flexShrink: 0 }} /><span><b>AURORALYS</b><small>MOON & MARS EXPLORER</small></span></Link>
      <nav id="internal-navigation" ref={navigation} className={open?'open':''} aria-label="Main navigation">
        <NavLink to="/hardware" onClick={closeMenu}>Hardware</NavLink><NavLink to="/dashboard" onClick={closeMenu}>Mission control</NavLink><NavLink to="/sources" onClick={closeMenu}>Sources</NavLink>
      </nav>
      <div className="top-actions"><button className="motion-toggle" aria-pressed={calm} onClick={toggleMotion}>{calm?'Animations off':'Animations on'}</button><Link className="status-pill" to="/dashboard"><span/>MISSION ONLINE</Link><button type="button" ref={menuToggle} className="menu-button" onClick={()=>{if(open)closeMenu();else setOpen(true)}} aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} aria-controls="internal-navigation">{open?<X aria-hidden="true"/>:<Menu aria-hidden="true"/>}</button></div>
    </header>}
    <main>{children}</main>
    {!isHome&&!isExplorer&&!immersive&&<footer><FooterBrand/><p>Educational MVP · Not an official NASA product</p><Link to="/sources">Data & attribution <ArrowRight size={14}/></Link></footer>}
  </div></MotionConfig>
}

function Hardware() {
  const selectedHardware = hardware.filter(item => getStoryEntry(item))
  const [selected, setSelected] = useState(() => selectedHardware.find(item => item.id === 'ingenuity') ?? selectedHardware[0])
  const progress = useProgress(state => state.storyProgress)
  const storyId = getStoryEntry(selected)?.story.id
  const storyLink = storyId ? getStoryEntry(selected, progress[storyId]) : null
  const isLunarRover = ['lrv', 'lrv-1', 'lrv-2'].includes(selected.id)

  return <motion.div {...page} className="hardware-page">
    <section className="page-heading">
      <span className="eyebrow"><span/> HARDWARE LAB</span>
      <h1>Machines built<br/>for other worlds.</h1>
      <p>Explore eight pieces of mission hardware left on Mars and the Moon.</p>
    </section>
    <div className="hardware-layout">
      <div className="hardware-list" aria-label="Mission hardware">
        {(['mars', 'moon'] as const).map(planet => <section className="hardware-planet-group" key={planet} aria-label={planet === 'mars' ? 'Mars' : 'Moon'}>
          <h2>{planet === 'mars' ? 'Mars' : 'Moon'}</h2>
          <div className="hardware-planet-items">
            {selectedHardware.filter(item => item.planet === planet).map(item => <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item)}
              aria-pressed={selected.id === item.id}
              className={selected.id === item.id ? 'active' : ''}
            >
              <div><b>{item.name}</b><small>{item.type}</small></div><ChevronRight aria-hidden="true"/>
            </button>)}
          </div>
        </section>)}
      </div>
      <div className="hardware-view">
        <div className="hardware-scene">
          <Suspense fallback={<SceneLoader/>}>
            {selected.id === 'ingenuity' ? <IngenuityScene/> : isLunarRover ? <LunarRoverScene interactive/> : selected.id === 'apollo-11-lrrr' ? <StoryMedia media={apollo11StoryMedia.array} motionEnabled={false}/> : <MachineIllustration id={selected.id}/>}
          </Suspense>
        </div>
        <div className="hardware-info">
          <span className="tag">{selected.planet.toUpperCase()} · {selected.type.toUpperCase()}</span>
          <h2>{selected.name}</h2><small>{selected.missionDate}</small>
          <p className="lead">{selected.overview}</p><p>{selected.purpose}</p>
          <h3>KEY SYSTEMS &amp; INSTRUMENTS</h3>
          <div className="instrument-tags">{selected.instruments.map(item => <span key={item}>{item}</span>)}</div>
          <div className="hardware-actions">
            {(storyId === 'apollo-15-rover' || storyId === 'apollo-17-rover') && <Link className="button secondary" to={`/inspection/${storyId}/1`}>Optional 3D expedition</Link>}
            {storyLink && <Link className="button primary" to={storyLink.href}>{storyId && progress[storyId]?.completed.length ? 'Continue my story' : 'Hear my story'} <BookOpen/></Link>}
            <a className="button secondary" href={selected.source.url} target="_blank" rel="noreferrer">Official source <ExternalLink/></a>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
}

function MachineIllustration({id}:{id:string}){return <div className={`machine-illustration ${id}`}><div className="machine-orbit"/><Satellite/><span>STYLIZED PROCEDURAL VIEW</span></div>}

function Sources(){const unique=useMemo(()=>Array.from(new Map([...Object.values(sources),...markers.map(m=>m.source)].map(s=>[s.url,s])).values()),[]);return <motion.div {...page} className="sources-page"><section className="page-heading"><span className="eyebrow"><span/> SCIENTIFIC INTEGRITY</span><h1>Sources & attribution</h1><p>This experience uses live NASA/JPL planetary imagery, historical mission photographs, and a curated scientific dataset. Every learning claim links to an authoritative source.</p></section><div className="integrity-note"><Gauge/><div><b>Real assets, stated limits</b><p>Mars uses the MGS MOLA global color hillshade and the Moon uses the LRO WAC global mosaic from NASA Trek. Mission photographs are distinguished from educational diagrams. Project narration is not original astronaut audio.</p></div></div><div className="source-list">{unique.map((s,i)=><a href={s.url} target="_blank" rel="noreferrer" key={s.url}><span>{String(i+1).padStart(2,'0')}</span><div><b>{s.label}</b><small>{s.url}</small></div><ExternalLink/></a>)}</div><div className="method"><h2>Imagery, model & coordinate method</h2><p>WMTS parameters were read from each live GetCapabilities document. The custom Leaflet CRS maps −180°…180° longitude and −90°…90° latitude onto NASA’s 2:1 tile matrices. Historical assets remain in the repository for provenance; their presence does not mean every mission is published in the current catalog.</p><p>Dates, mission objectives, EDL order, and science facts come from the official resources listed below. AURORALYS is an independent educational project and does not imply NASA endorsement.</p></div></motion.div>}

function NotFound(){return <div className="not-found"><Orbit/><h1>Signal lost</h1><p>That route drifted beyond our flight path.</p><Link className="button primary" to="/">Return home</Link></div>}

export default function App(){const location=useLocation();return <Shell><AnimatePresence mode="wait"><Routes location={location} key={location.pathname}><Route path="/" element={<HomePage/>}/><Route path="/explore/:planet" element={<ExplorerPage/>}/><Route path="/story/:storyId" element={<Suspense fallback={<SceneLoader/>}><ContinuousStoryPage/></Suspense>}/><Route path="/story/:storyId/:chapter" element={<Suspense fallback={<SceneLoader/>}><ContinuousStoryPage/></Suspense>}/><Route path="/inspection/:storyId/:chapter?" element={<Suspense fallback={<SceneLoader/>}><RoverInspection/></Suspense>}/><Route path="/discover" element={<Suspense fallback={<SceneLoader/>}><MissionGuidePage/></Suspense>}/><Route path="/hardware" element={<Hardware/>}/><Route path="/dashboard" element={<Suspense fallback={<SceneLoader/>}><MissionDashboard/></Suspense>}/><Route path="/sources" element={<Sources/>}/><Route path="*" element={<NotFound/>}/></Routes></AnimatePresence></Shell>}
