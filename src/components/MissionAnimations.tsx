import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Rocket, X, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function MissionLaunch(){
 const [count,setCount]=useState<number|null>(null);const navigate=useNavigate();const reduced=useReducedMotion()
 useEffect(()=>{if(count===null)return;if(count===0){navigate('/story/apollo-15-rover/1');setCount(null);return}const id=setTimeout(()=>setCount(n=>n===null?null:n-1),800);return()=>clearTimeout(id)},[count,navigate])
 useEffect(()=>{if(count===null)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setCount(null)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[count])
 return <><button className="button secondary launch-adventure" onClick={()=>reduced?navigate('/story/apollo-15-rover/1'):setCount(3)}><Rocket/> Launch Apollo 15</button><AnimatePresence>{count!==null&&<motion.div className="launch-overlay" role="dialog" aria-modal="true" aria-label="Your Moon adventure is starting" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><div className="launch-window"><Rocket className="launch-rocket"/><p>Next stop: the Moon!</p><motion.strong key={count} initial={{scale:.6,opacity:0}} animate={{scale:1,opacity:1}} aria-live="polite">{count||'GO!'}</motion.strong><span>Your Apollo 15 adventure is about to begin.</span><button autoFocus onClick={()=>setCount(null)}><X size={18}/> Stay here</button></div></motion.div>}</AnimatePresence></>
}

export function StarCelebration(){return <div className="star-celebration" aria-hidden="true">{Array.from({length:18},(_,i)=><i key={i} style={{'--angle':`${i*20}deg`,'--delay':`${i%3*.08}s`,'--distance':`${100+i%4*30}px`} as React.CSSProperties}><Sparkles/></i>)}</div>}
