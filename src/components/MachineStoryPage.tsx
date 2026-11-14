import { StarCelebration } from './MissionAnimations'
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Award, BookOpen, Check, ChevronRight, ExternalLink, Lock, Pause, Play, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { chapterMeta, machineStories, type MachineStory } from '../machineStories'
import { useProgress, type QuizResult } from '../store'
import type { Group } from 'three'
import PerseverancePilot from './storytelling/PerseverancePilot'
import PerseveranceChallenges from './storytelling/PerseveranceChallenges'
import PerseveranceLegacy from './storytelling/PerseveranceLegacy'
import PerseveranceQuiz from './storytelling/PerseveranceQuiz'
import PerseveranceCompletion from './storytelling/PerseveranceCompletion'
import ApolloProgressSaveStatus from './storytelling/ApolloProgressSaveStatus'
import { Apollo15ChapterNarration, Apollo15QuizNarration } from './storytelling/Apollo15Narration'
import { stopRecordedNarration } from '../features/storytelling/recordedNarration'
import { isPilotChapter, resolveStoryRoute } from '../features/storytelling/pilot'
import apolloQuizStyles from './storytelling/ApolloQuiz.module.css'
import Apollo15ScrollStory from './storytelling/Apollo15ScrollStory'
import MoonPackageStory from './storytelling/MoonPackageStory'
import Apollo16ScrollStory from './storytelling/Apollo16ScrollStory'
import MarsScrollStory from './storytelling/MarsScrollStory'
import { isMarsStory } from '../features/storytelling/marsStories'
import type { ReactNode } from 'react'

const RoverScene = lazy(()=>import('./RoverScene'))
const LunarRoverScene = lazy(()=>import('./LunarRoverScene'))
const LandingSequence = lazy(()=>import('./LandingSequence'))

function StoryLoader(){return <div className="scene-loader"><Sparkles className="spin"/><span>Preparing mission memory…</span></div>}

function NarrationButton({text}:{text:string}){
  const [speaking,setSpeaking]=useState(false)
  useEffect(()=>()=>window.speechSynthesis?.cancel(),[])
  const toggle=()=>{if(!('speechSynthesis'in window))return;if(speaking){window.speechSynthesis.cancel();setSpeaking(false);return}const utterance=new SpeechSynthesisUtterance(text);utterance.rate=.92;utterance.pitch=1.03;utterance.onend=()=>setSpeaking(false);window.speechSynthesis.speak(utterance);setSpeaking(true)}
  return <button className="narration-control" onClick={toggle} aria-label={speaking?'Stop narration':'Play optional narration'}>{speaking?<VolumeX/>:<Volume2/>}<span>{speaking?'STOP VOICE':'HEAR MY STORY'}</span></button>
}

function RecordedNarration({src,label}:{src:string;label:string}){
  const [failed,setFailed]=useState(false),[playing,setPlaying]=useState(false)
  const audioRef=useRef<HTMLAudioElement>(null)
  const markPlaying=(value:boolean)=>{setPlaying(value);audioRef.current?.closest('article')?.classList.toggle('narration-playing',value)}
  return <div className={`recorded-narration ${playing?'is-playing':''}`}><button className="listen-button" aria-label={playing?`Pause: ${label}`:label} aria-pressed={playing} onClick={()=>{const audio=audioRef.current;if(!audio)return;if(audio.paused){void audio.play().catch(()=>setFailed(true))}else audio.pause()}}>{playing?<Pause/>:<Play/>}<span>{playing?'Pause story':'Listen to this part'}</span><span className="sound-bars" aria-hidden="true">{[0,1,2,3,4].map(n=><i key={n} style={{animationDelay:`${n*.12}s`}}/>)}</span></button><audio ref={audioRef} key={src} controls preload="metadata" aria-label={label} onPlay={event=>{document.querySelectorAll('audio').forEach(audio=>{if(audio!==event.currentTarget)audio.pause()});window.speechSynthesis?.cancel();markPlaying(true);setFailed(false)}} onPause={()=>markPlaying(false)} onEnded={()=>markPlaying(false)} onError={()=>{setFailed(true);markPlaying(false)}}><source src={src} type="audio/mpeg"/></audio>{failed&&<p role="alert">Audio could not load. <a href={src}>Open narration</a></p>}</div>
}

function ChapterReading({story,index}:{story:MachineStory;index:number}){
  const tracks=story.narration?.[index]
  if(!tracks)return null
  return <section className="chapter-reading" aria-label="Read and listen"><h2>Read &amp; listen</h2>{tracks.map((track,i)=><article key={track.audio}><h3>{i+1}. {track.title}</h3><p>{track.text}</p><RecordedNarration src={track.audio} label={`Listen: ${track.title}`}/><div className="reading-sources">{track.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} <ExternalLink size={12}/></a>)}</div></article>)}</section>
}

function MachineVisual({story,interactive=true}:{story:MachineStory;interactive?:boolean}){
  return <Suspense fallback={<StoryLoader/>}>{story.machineId==='perseverance'?<RoverScene interactive={interactive}/>:<LunarRoverScene interactive={interactive}/>}</Suspense>
}

function MeetChapter({story,onInteract}:{story:MachineStory;onInteract:()=>void}){
  const [selected,setSelected]=useState(0)
  return <div className="machine-meet"><div className="machine-scene"><MachineVisual story={story}/></div><div className="profile-grid">{story.profile.map((item,index)=><button key={item.label} className={selected===index?'active':''} onClick={()=>{setSelected(index);onInteract()}}><small>{item.label}</small><b>{item.value}</b><ChevronRight/></button>)}</div></div>
}

function FlightScene({story,step}:{story:MachineStory;step:number}){
  const craft=useRef<Group>(null)
  useFrame(({clock})=>{if(!craft.current)return;const t=clock.elapsedTime;craft.current.position.y=Math.sin(t*.75)*.16+(step===0?-1:step===1?.7:step===2?1.15:.25);craft.current.rotation.z=Math.sin(t*.35)*.08})
  const moon=story.planet==='moon'
  return <><color attach="background" args={['#02040a']}/><ambientLight intensity={.5}/><directionalLight position={[4,5,4]} intensity={3.2} color={moon?'#f1edda':'#ffc09a'}/><Stars count={700} factor={2}/><mesh position={[2.8,-2.65,-2]}><sphereGeometry args={[3.4,64,64]}/><meshStandardMaterial color={moon?'#898b8e':'#a8482d'} roughness={1}/></mesh><group ref={craft} position={[-.6,0,0]}>
    {step<2?<group><mesh><cylinderGeometry args={[.18,.27,2.1,24]}/><meshStandardMaterial color="#e8e3d7" metalness={.7}/></mesh><mesh position={[0,1.18,0]}><coneGeometry args={[.18,.55,24]}/><meshStandardMaterial color="#d9d4ca" metalness={.7}/></mesh><mesh position={[0,-1.35,0]}><coneGeometry args={[.24,1,24]}/><meshBasicMaterial color="#ff8150" transparent opacity={.76}/></mesh></group>:<group><mesh><cylinderGeometry args={[.7,.95,.6,36]}/><meshStandardMaterial color="#cbc3aa" metalness={.55}/></mesh><mesh position={[0,-.5,0]}><coneGeometry args={[.8,.45,36]}/><meshStandardMaterial color="#3f302b" roughness={.8}/></mesh></group>}
  </group></>
}

function JourneyChapter({story,onInteract}:{story:MachineStory;onInteract:()=>void}){
  const [step,setStep]=useState(0),[playing,setPlaying]=useState(true)
  useEffect(()=>{if(!playing)return;const id=window.setInterval(()=>setStep(value=>(value+1)%story.journey.length),3600);return()=>clearInterval(id)},[playing,story.journey.length])
  const showLanding=story.machineId==='perseverance'&&step===3
  return <div className="journey-experience">{showLanding?<div className="journey-landing"><Suspense fallback={<StoryLoader/>}><LandingSequence onProgressComplete={()=>onInteract()}/></Suspense></div>:<div className="journey-visual"><Canvas camera={{position:[4,2.5,7],fov:42}} dpr={[1,1.5]}><FlightScene story={story} step={step}/></Canvas><div className="journey-readout"><small>{story.journey[step].date}</small><b>{story.journey[step].title}</b><p>{story.journey[step].copy}</p></div><div className="journey-controls"><button onClick={()=>setPlaying(!playing)}>{playing?<Pause/>:<Play/>}</button><button onClick={()=>setStep(0)}><RotateCcw/></button></div></div>}<div className="journey-timeline">{story.journey.map((event,index)=><button key={event.label} className={step===index?'active':''} onClick={()=>{setStep(index);setPlaying(false);onInteract()}}><span>{String(index+1).padStart(2,'0')}</span><i/><small>{event.date}</small><b>{event.label}</b></button>)}</div></div>
}

function ChallengeChapter({story,onInteract}:{story:MachineStory;onInteract:()=>void}){
  const [selected,setSelected]=useState(0),[found,setFound]=useState<number[]>([])
  const image=story.id==='apollo-17-rover'?'/images/apollo17-rover.jpg':undefined
  return <div className="challenge-experience"><div className="challenge-visual" style={image?{backgroundImage:`linear-gradient(90deg,rgba(3,5,10,.06),rgba(3,5,10,.72)),url(${image})`}:undefined}>{!image&&<MachineVisual story={story} interactive={false}/>}<div><small>MISSION PROBLEM</small><h3>{story.challenges[selected].title}</h3><p>{story.challenges[selected].problem}</p><b>MY SOLUTION</b><p>{story.challenges[selected].solution}</p></div></div><div className="challenge-tabs">{story.challenges.map((item,index)=><button key={item.title} className={selected===index?'active':''} onClick={()=>{setSelected(index);onInteract()}}><span>0{index+1}</span>{item.title}</button>)}</div><div className="discovery-bank"><span>OPEN MY DISCOVERY LOG</span>{story.discoveries.map((item,index)=><button key={item.title} className={found.includes(index)?'open':''} onClick={()=>{setFound(values=>values.includes(index)?values:[...values,index]);onInteract()}}><Sparkles/><span><b>{item.title}</b><small>{found.includes(index)?item.detail:'Tap to reveal this discovery'}</small></span></button>)}</div></div>
}

function LegacyChapter({story,onInteract}:{story:MachineStory;onInteract:()=>void}){
  const [index,setIndex]=useState(0)
  return <div className="legacy-experience"><div className="legacy-visual"><MachineVisual story={story} interactive={false}/><div className="legacy-status"><span>MY CURRENT STATUS</span><b>{story.status}</b></div></div><div className="legacy-timeline"><div className="legacy-line">{story.legacy.map((item,i)=><button key={`${item.year}-${i}`} className={index===i?'active':''} onClick={()=>{setIndex(i);onInteract()}}><i/><span>{item.year}</span></button>)}</div><AnimatePresence mode="wait"><motion.article key={index} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}><span>LEGACY RECORD {String(index+1).padStart(2,'0')}</span><h3>{story.legacy[index].title}</h3><p>{story.legacy[index].copy}</p></motion.article></AnimatePresence></div></div>
}

function QuizChapter({story,onComplete,onRetry,onResult,renderRecording,reducedMotion=false}:{story:MachineStory;onComplete:()=>void;onRetry?:()=>void;onResult?:(result:QuizResult)=>void;renderRecording?:(question:number)=>ReactNode;reducedMotion?:boolean}){
  const [question,setQuestion]=useState(0),[answers,setAnswers]=useState<number[]>([]),[score,setScore]=useState(0),[finished,setFinished]=useState(false)
  const questionHeading=useRef<HTMLHeadingElement>(null),feedback=useRef<HTMLParagraphElement>(null),resultsHeading=useRef<HTMLHeadingElement>(null)
  const focusPhase=useRef('0:question'),complete=useRef(onComplete)
  const answered=answers[question]!==undefined,item=story.quiz[question]
  const phase=finished?'results':answered?'feedback':'question'
  const prefix=`${story.id}-quiz`
  const choose=(index:number)=>{if(answered||finished)return;setAnswers(values=>{const next=[...values];next[question]=index;return next});if(index===item.answer)setScore(value=>value+1)}
  useEffect(()=>{complete.current=onComplete},[onComplete])
  useEffect(()=>{if(finished){complete.current();onResult?.({answers:[...answers],score,total:story.quiz.length})}},[finished])
  useEffect(()=>{
    const position=`${question}:${phase}`
    if(focusPhase.current===position)return
    focusPhase.current=position
    const target=phase==='results'?resultsHeading.current:phase==='feedback'?feedback.current:questionHeading.current
    target?.focus({preventScroll:true})
    target?.scrollIntoView({behavior:'instant',block:'nearest'})
  },[question,phase])
  if(finished)return <div className="quiz-reward"><StarCelebration/><Award/><span>MISSION REWARD UNLOCKED</span><h2 id={`${prefix}-results`} ref={resultsHeading} tabIndex={-1} className={apolloQuizStyles.focusTarget} aria-describedby={`${prefix}-score`}>{story.reward}</h2><p id={`${prefix}-score`}>You scored {score} / {story.quiz.length}. You followed my story from engineering challenge to scientific legacy.</p><button type="button" onClick={()=>{onRetry?.();setQuestion(0);setAnswers([]);setScore(0);setFinished(false)}}><RotateCcw/> TRY AGAIN</button></div>
  return <div className="quiz-experience"><div className="quiz-head"><span id={`${prefix}-position`}>QUESTION {question+1} / {story.quiz.length}</span><div>{story.quiz.map((_,i)=><i key={i} className={i<answers.length?'done':i===question?'active':''}/>)}</div><b>{score} CORRECT</b></div><h2 id={`${prefix}-question`} ref={questionHeading} tabIndex={-1} className={apolloQuizStyles.focusTarget} aria-describedby={`${prefix}-position`}>{item.question}</h2>{renderRecording?renderRecording(question):story.id==='apollo-15-rover'&&<Apollo15QuizNarration key={question} question={question}/>}<div className="quiz-options">{item.options.map((option,index)=><button key={option} type="button" disabled={answered} aria-pressed={answered?answers[question]===index:undefined} className={answered?(index===item.answer?'correct':answers[question]===index?'wrong':''):''} onClick={()=>choose(index)}><span>{String.fromCharCode(65+index)}</span>{option}{answered&&index===item.answer&&<Check/>}</button>)}</div>{answered&&<motion.div initial={reducedMotion?false:{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={reducedMotion?{duration:0}:undefined} className="quiz-explanation" role="region" aria-label="Answer feedback"><BookOpen aria-hidden="true"/><p id={`${prefix}-feedback`} ref={feedback} tabIndex={-1} className={apolloQuizStyles.focusTarget}><span className={apolloQuizStyles.srOnly}>{answers[question]===item.answer?'Correct. ':`Incorrect. Correct answer: ${item.options[item.answer]}. `}</span>{item.explanation}</p><button type="button" onClick={()=>{if(question===story.quiz.length-1)setFinished(true);else setQuestion(value=>value+1)}}>{question===story.quiz.length-1?'View Results':'NEXT QUESTION'} <ArrowRight/></button></motion.div>}</div>
}

export default function MachineStoryPage({allowPerseverance=false}:{allowPerseverance?:boolean}={}){
  const {storyId='follow-perseverance',chapter='1'}=useParams()
  const route=resolveStoryRoute(storyId,chapter)||(allowPerseverance&&storyId==='follow-perseverance'&&/^[1-5]$/.test(chapter)?{story:machineStories[storyId],index:Number(chapter)-1}:null)
  if(!route)return <section className="not-found" aria-labelledby="missing-story-title"><h1 id="missing-story-title">Story not found</h1><p>Choose an available machine story from the Hardware Lab.</p><Link className="button primary" to="/hardware">Choose a machine</Link></section>
  return <ValidMachineStoryPage key={`${route.story.id}-${route.index}`} story={route.story} index={route.index}/>
}

function ValidMachineStoryPage({story,index}:{story:MachineStory;index:number}){
  const navigate=useNavigate();const meta=chapterMeta[index]
  const pilot=isPilotChapter(story.id,index)
  const optionalMeet=index===0&&(story.id==='apollo-15-rover'||story.id==='apollo-17-rover')
  const heading=useRef<HTMLHeadingElement>(null)
  const {completedChapters,storyProgress,completeStoryChapter,awardBadge}=useProgress();const machineProgress=storyProgress?.[story.id];const isDone=(chapterId:string)=>machineProgress?.completed.includes(chapterId)||completedChapters.includes(`${story.id}:${chapterId}`);const alreadyDone=!!isDone(meta.id);const [interacted,setInteracted]=useState(alreadyDone)
  const engagePilot=useCallback(()=>setInteracted(true),[])
  const unlockedIndex=useMemo(()=>{let unlocked=0;for(let i=0;i<chapterMeta.length-1;i++){if(isDone(chapterMeta[i].id))unlocked=i+1;else break}return unlocked},[machineProgress,completedChapters,story.id])
  useEffect(()=>{if(index>unlockedIndex)navigate(`/story/${story.id}/${unlockedIndex+1}`,{replace:true})},[index,unlockedIndex,navigate,story.id])
  useEffect(()=>setInteracted(!!isDone(chapterMeta[index].id)),[story.id,index,completedChapters,machineProgress])
  useEffect(()=>{if(pilot){heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView({behavior:'instant',block:'start'})}},[pilot,index])
  const finish=()=>{
    stopRecordedNarration()
    if(index===4&&(story.id==='apollo-15-rover'||story.id==='apollo-17-rover'||story.category==='stationary-experiment'||story.id==='apollo-16-rover'||isMarsStory(story.id))){
      const prerequisites=chapterMeta.slice(0,-1)
      if((!interacted&&!alreadyDone)||!prerequisites.every(chapter=>isDone(chapter.id)))return
      // The route and dashboard accept both progress formats. Copy only known,
      // completed prerequisites missing from this mission's modern record.
      prerequisites.forEach((chapter,number)=>{
        if(!machineProgress?.completed.includes(chapter.id))completeStoryChapter(story.id,chapter.id,number+1)
      })
    }
    completeStoryChapter(story.id,meta.id,index+1)
    if(index===4)awardBadge(`${story.id}-storyteller`)
    if(index<4)navigate(`/story/${story.id}/${index+2}`)
  }
  const narration=useMemo(()=>`${story.intro} ${meta.title}. ${index===0?story.heroLine:index===1?story.journey[0].copy:index===2?story.discoveries[0].detail:index===3?story.legacy[story.legacy.length-1].copy:'Let us test what you learned.'}`,[story,meta,index])
  if(pilot&&index>unlockedIndex)return <Navigate to={`/story/${story.id}/${unlockedIndex+1}`} replace/>
  if(story.id==='apollo-15-rover'){
    if(index>unlockedIndex)return <Navigate to={`/story/${story.id}/${unlockedIndex+1}`} replace/>
    return <Apollo15ScrollStory story={story} index={index} unlockedIndex={unlockedIndex} isDone={isDone}
      canComplete={index<4||interacted||alreadyDone} engaged={interacted||alreadyDone} onEngage={engagePilot} onNext={finish}
      renderQuiz={(renderRecording,reducedMotion)=><QuizChapter story={story} onComplete={()=>setInteracted(true)} onRetry={()=>setInteracted(false)} renderRecording={renderRecording} reducedMotion={reducedMotion}/>}/>
  }
  if(story.id==='apollo-17-rover'||story.category==='stationary-experiment'){
    if(index>unlockedIndex)return <Navigate to={`/story/${story.id}/${unlockedIndex+1}`} replace/>
    return <MoonPackageStory story={story} index={index} unlockedIndex={unlockedIndex} isDone={isDone}
      canComplete={index<4||interacted||alreadyDone} engaged={interacted||alreadyDone} onEngage={engagePilot} onNext={finish}
      renderQuiz={(renderRecording,reducedMotion)=><QuizChapter story={story} onComplete={()=>setInteracted(true)} onRetry={()=>setInteracted(false)} renderRecording={renderRecording} reducedMotion={reducedMotion}/>}/>
  }
  if(story.id==='apollo-16-rover'){
    if(index>unlockedIndex)return <Navigate to={`/story/${story.id}/${unlockedIndex+1}`} replace/>
    return <Apollo16ScrollStory story={story} index={index} unlockedIndex={unlockedIndex} isDone={isDone}
      canComplete={index<4||interacted||alreadyDone} engaged={interacted||alreadyDone} onEngage={engagePilot}
      onQuizRetry={()=>setInteracted(false)} onNext={finish}/>
  }
  if(isMarsStory(story.id)){
    if(index>unlockedIndex)return <Navigate to={`/story/${story.id}/${unlockedIndex+1}`} replace/>
    return <MarsScrollStory story={story} index={index} unlockedIndex={unlockedIndex} isDone={isDone}
      canComplete={index<4||interacted||alreadyDone} engaged={interacted||alreadyDone} onEngage={engagePilot} onNext={finish}
      renderQuiz={(renderRecording,reducedMotion)=><QuizChapter story={story} onComplete={()=>setInteracted(true)} onRetry={()=>setInteracted(false)} renderRecording={renderRecording} reducedMotion={reducedMotion}/>}/>
  }
  // The shell owns main; keep the non-pilot stage's former global main min-height below.
  const Stage=pilot?'section':'div'
  return <motion.div initial={pilot?false:{opacity:0}} animate={{opacity:1}} className={`machine-story-page ${story.planet}`}>
    <div className="machine-story-progress"><Link to="/hardware"><ArrowLeft/> HARDWARE LAB</Link><div>{chapterMeta.map((item,i)=>{const done=!!isDone(item.id),locked=i>unlockedIndex;return locked?<span key={item.id} className="locked" title="Complete the previous chapter to unlock"><span><Lock/></span><i/><small>{item.title}</small></span>:<Link key={item.id} to={`/story/${story.id}/${i+1}`} className={`${i===index?'active':''} ${done?'done':''}`}><span>{done?<Check/>:i+1}</span><i/><small>{item.title}</small></Link>})}</div><b>{index+1} / 5</b></div>
    <header className="machine-story-hero"><div><span className="eyebrow"><span/> {story.missionLabel} · {story.status}</span><h1 ref={heading} tabIndex={pilot?-1:undefined}>{meta.title}</h1><p>{index===0?(pilot?story.heroLine:story.intro):`I’m ${story.shortName}. ${index===1?'Follow the path that carried me from Earth to exploration.':index===2?'Open my field log to see how engineering challenges became scientific discoveries.':index===3?'Trace the achievements I left behind — and the missions they continue to inspire.':'Ready, explorer? Show me what you remember from my mission.'}`}</p>{!pilot&&story.id!=='apollo-15-rover'&&<NarrationButton text={narration}/>}</div><div className="story-machine-id"><small>STORYTELLER</small><b>{story.name}</b><span>{story.heroLine}</span></div></header>
    {(story.id==='apollo-15-rover'||story.id==='apollo-17-rover')&&<ApolloProgressSaveStatus story={story}/>}
    <Stage className="machine-story-stage" style={pilot?undefined:{minHeight:'calc(100vh - 160px)'}}>{story.id==='apollo-15-rover'&&index<4&&<Apollo15ChapterNarration key={index} chapter={index}/>}
      {pilot?<PerseverancePilot story={story} chapter={index===0?'meet':'journey'} onEngage={engagePilot}/>:<AnimatePresence mode="wait"><motion.div key={`${story.id}-${index}`} initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-16}} transition={{duration:.35}}>{index===0?<MeetChapter story={story} onInteract={()=>setInteracted(true)}/>:index===1?<JourneyChapter story={story} onInteract={()=>setInteracted(true)}/>:index===2?(story.id==='follow-perseverance'?<PerseveranceChallenges story={story} onInteract={()=>setInteracted(true)} rover={<MachineVisual story={story} interactive={false}/>}/>:<ChallengeChapter story={story} onInteract={()=>setInteracted(true)}/>):index===3?(story.id==='follow-perseverance'?<PerseveranceLegacy story={story} onInteract={()=>setInteracted(true)} rover={<MachineVisual story={story} interactive={false}/>}/>:<LegacyChapter story={story} onInteract={()=>setInteracted(true)}/>):story.id==='follow-perseverance'?<PerseveranceQuiz story={story} alreadyCompleted={alreadyDone} onComplete={()=>setInteracted(true)} onRetry={()=>setInteracted(false)}/>:<QuizChapter story={story} onComplete={()=>setInteracted(true)}/>}</motion.div></AnimatePresence>}</Stage>
    <div className="machine-story-sources">{story.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} <ExternalLink/></a>)}</div>
    {story.id==='follow-perseverance'&&index===4?<PerseveranceCompletion story={story} canComplete={interacted||alreadyDone} onPrevious={()=>navigate(`/story/${story.id}/4`)}/>:<div className="machine-story-bottom"><button disabled={index===0} onClick={()=>{stopRecordedNarration();navigate(`/story/${story.id}/${index}`)}}><ArrowLeft/> PREVIOUS CHAPTER</button><span><b>{interacted||alreadyDone?'INTERACTION COMPLETE':optionalMeet?'EXPLORE OR CONTINUE':'EXPLORE TO CONTINUE'}</b><small>{meta.short}</small></span><button className="primary" disabled={!optionalMeet&&!interacted&&!alreadyDone} onClick={finish}>{index===4?'COMPLETE STORY':'NEXT CHAPTER'} <ArrowRight/></button></div>}
  </motion.div>
}

export { QuizChapter as DocumentaryQuiz }
