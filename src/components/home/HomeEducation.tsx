import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowRight, Orbit, Rocket, ScanLine, Sparkles, Telescope } from 'lucide-react'
import { Link } from 'react-router-dom'
import { chapterMeta } from '../../machineStories'
import type { PlanetId } from '../../types'

const RoverScene = lazy(() => import('../RoverScene'))

function FeaturedRover({ animated }: { animated: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '160px' })
    if (host.current) observer.observe(host.current)
    return () => observer.disconnect()
  }, [])
  return <div className="featured-art" ref={host}>
    {visible && (animated || enabled) ? <Suspense fallback={<div className="scene-loader"><Orbit className="spin" /><span>Preparing the NASA rover…</span></div>}><RoverScene /></Suspense>
      : <div className="scene-loader"><Rocket size={40} /><span>Meet the machine behind the mission.</span><button className="button secondary" onClick={() => setEnabled(true)}>Load interactive rover <ArrowRight /></button></div>}
    <span className="art-label">OFFICIAL NASA/JPL 3D MODEL · EDUCATIONAL VIEW</span>
  </div>
}

function WorldCard({ planet, title, meta, copy }: { planet: PlanetId; title: string; meta: string; copy: string }) {
  return <Link to={`/explore/${planet}`} className={`world-card ${planet}`}><div className="world-sphere" /><span className="world-number">{planet === 'mars' ? '01' : '02'}</span><div className="world-content"><span>{meta}</span><h3>{title}</h3><p>{copy}</p><b>ENTER ORBIT <ArrowRight /></b></div></Link>
}

function Discovery({ icon, n, title, text }: { icon: ReactNode; n: string; title: string; text: string }) {
  return <article className="discovery-card"><div>{icon}<span>{n}</span></div><h3>{title}</h3><p>{text}</p></article>
}

/** Existing educational content, relocated from Landing without changing its destinations. */
export default function HomeEducation({ animated }: { animated: boolean }) {
  return <div>
    <section className="mission-intro" id="mission-stories" tabIndex={-1} aria-labelledby="mission-heading"><div><span className="section-index">01 / THE MISSION</span><h2 id="mission-heading">Science is a story.<br />You are the explorer.</h2></div><div><p className="lead">Every crater is a chapter. Every rock is a clue. Auroralys transforms real planetary science into missions you can see, touch, and solve.</p><Link className="text-link" to="/story/follow-perseverance/1">Begin the flagship story <ArrowRight /></Link></div></section>
    <section className="worlds" aria-label="Discover our worlds">
      <WorldCard planet="mars" title="The red planet" meta="ROVERS · ANCIENT WATER · ASTROBIOLOGY" copy="Follow robotic explorers through a world shaped by volcanoes, impacts, wind, and ancient water." />
      <WorldCard planet="moon" title="Our celestial neighbor" meta="APOLLO · CRATERS · LUNAR GEOLOGY" copy="Trace astronaut footsteps and discover the airless world that records billions of years of impacts." />
    </section>
    <section className="featured" aria-labelledby="featured-heading"><FeaturedRover animated={animated} /><div className="featured-copy"><span className="section-index">FEATURED ADVENTURE · 25 MIN</span><h2 id="featured-heading">Perseverance tells<br /><em>its own story.</em></h2><p>Meet the rover, follow its journey to Mars, open its discovery log, trace its legacy, and complete a mission quiz.</p><div className="chapter-pills">{chapterMeta.slice(0, 4).map((c, i) => <span key={c.id}>0{i + 1} {c.title}</span>)}</div><Link className="button primary" to="/story/follow-perseverance/1">Start the 5-chapter story <Rocket /></Link></div></section>
    <section className="discoveries" aria-labelledby="discoveries-heading"><div className="section-title"><div><span className="section-index">FIELD NOTES</span><h2 id="discoveries-heading">Three clues. One ancient world.</h2></div><p>Scientific conclusions are built from many observations — never a single dramatic clue.</p></div><div className="discovery-grid"><Discovery icon={<ScanLine />} n="01" title="A DELTA IN STONE" text="Fan-shaped deposits show where a river once entered Jezero’s lake." /><Discovery icon={<Sparkles />} n="02" title="MINERALS CHANGED BY WATER" text="Clay-bearing rocks record long-ago interaction between water and stone." /><Discovery icon={<Telescope />} n="03" title="SAMPLES FOR THE FUTURE" text="Sealed cores preserve material for possible detailed study in the future." /></div></section>
    <section className="final-cta"><span className="eyebrow"><span /> READY FOR LAUNCH</span><h2>Your next discovery<br />is one click away.</h2><Link className="button light" to="/explore/mars">Enter mission control <ArrowRight /></Link></section>
  </div>
}
