import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { BufferGeometry, Color, Float32BufferAttribute, Group, MathUtils, PerspectiveCamera, Vector3 } from 'three'
import { Check, Expand, Pause, Play, RotateCcw } from 'lucide-react'

const stages = [
  { title: 'HEAT SHIELD', kicker: 'Atmospheric entry', narration: 'The aeroshell enters at nearly 20,000 kilometers per hour. Its heat shield absorbs and deflects intense heating while guided flight steers toward Jezero Crater.', metric: 'ENTRY · ~20,000 KM/H' },
  { title: 'PARACHUTE', kicker: 'Supersonic descent', narration: 'A 21.5-meter parachute deploys at supersonic speed. After slowing, the heat shield drops away so cameras and radar can see the surface.', metric: 'CHUTE · ~420 M/S' },
  { title: 'SKY CRANE', kicker: 'Powered descent', narration: 'The backshell separates before eight engines brake the descent. Nylon cables lower Perseverance onto its wheels; then the descent stage cuts free and flies away.', metric: 'TOUCHDOWN · ~0.75 M/S' },
]

function CinematicCamera({ stage, progress }: { stage: number; progress: number }) {
  const { camera } = useThree()
  const target = useMemo(() => new Vector3(), [])
  useFrame((_, delta) => {
    const positions = [new Vector3(5.4, 2.7, 7.4), new Vector3(5.8, 3.2, 7.8), new Vector3(5.2, 2.8, 7.2)]
    const position = positions[stage].clone()
    position.x += Math.sin(progress * Math.PI * 2) * .35
    position.y += stage === 0 ? progress * .5 : 0
    camera.position.lerp(position, 1 - Math.exp(-delta * 2.6))
    target.set(0, stage === 2 ? .8 : 1.1, 0)
    camera.lookAt(target)
    ;(camera as PerspectiveCamera).fov = MathUtils.lerp((camera as PerspectiveCamera).fov, stage === 2 ? 38 : 42, .05)
    camera.updateProjectionMatrix()
  })
  return null
}

function Terrain({ stage, progress }: { stage: number; progress: number }) {
  const dust = useMemo(() => {
    const positions: number[] = []
    for (let i = 0; i < 260; i++) positions.push((Math.random() - .5) * 10, Math.random() * .7 - .25, (Math.random() - .5) * 8)
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
    return geometry
  }, [])
  return <group position={[0, -1.65, 0]}>
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[28, 28, 64, 64]}/><meshStandardMaterial color="#873c26" roughness={1}/></mesh>
    {[[-4,.25,-2],[-1,.1,-3],[3,.2,-1],[4,.15,3],[-3,.1,3]].map((p,i)=><mesh key={i} castShadow receiveShadow position={p as [number,number,number]} rotation={[0,i*.7,0]}><dodecahedronGeometry args={[.5+i*.06,0]}/><meshStandardMaterial color={i%2?'#5b241a':'#71301f'} roughness={1}/></mesh>)}
    {stage === 2 && progress > .35 && <points geometry={dust} rotation={[0, progress * .35, 0]}><pointsMaterial color="#d98a57" size={.055 + progress * .045} transparent opacity={.52} depthWrite={false}/></points>}
  </group>
}

function HeatShield({ progress }: { progress: number }) {
  const ref = useRef<Group>(null)
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.z += delta * .45 })
  return <group ref={ref} position={[MathUtils.lerp(-1.3,.6,progress), MathUtils.lerp(3.7,.4,progress), 0]} rotation={[.2,0,-.35]}>
    <mesh castShadow rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[1.05,.78,.52,64]}/><meshPhysicalMaterial color="#241b19" roughness={.72} metalness={.18} clearcoat={.15}/></mesh>
    <mesh position={[0,-.3,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.78,.15,18,64]}/><meshStandardMaterial color="#ff5a22" emissive="#ff2600" emissiveIntensity={5}/></mesh>
    <pointLight position={[0,-.45,0]} color="#ff4b18" intensity={12} distance={6}/>
    <mesh position={[0,-.62,0]} rotation={[Math.PI/2,0,0]}><coneGeometry args={[1.45,3.1,64,1,true]}/><meshBasicMaterial color="#ff6a28" transparent opacity={.13} depthWrite={false}/></mesh>
  </group>
}

function Parachute({ progress }: { progress: number }) {
  const open = MathUtils.smoothstep(progress, .05, .32)
  const drop = progress > .52 ? MathUtils.smoothstep(progress,.52,.9) : 0
  return <group position={[0, MathUtils.lerp(2.1,.2,progress), 0]}>
    <group position={[0,2.2,0]} scale={[open,open,open]}>
      <mesh castShadow><sphereGeometry args={[1.75,48,20,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#eee4d2" roughness={.78} side={2}/></mesh>
      {[...Array(12)].map((_,i)=><mesh key={i} position={[0,-1.1,0]} rotation={[0,i*Math.PI/6,(i%2?1:-1)*.62]}><boxGeometry args={[.035,2.9,.018]}/><meshBasicMaterial color={i%3===0?'#d15d43':'#f3e4cf'}/></mesh>)}
    </group>
    {[...Array(10)].map((_,i)=><mesh key={i} position={[(i-4.5)*.085,1.05,(i%2-.5)*.12]} rotation={[0,0,(i-4.5)*.035]}><cylinderGeometry args={[.009,.009,2.4,6]}/><meshStandardMaterial color="#d6c8ae"/></mesh>)}
    <mesh castShadow><cylinderGeometry args={[.82,1.0,.75,48]}/><meshStandardMaterial color="#c9c5b2" metalness={.65} roughness={.35}/></mesh>
    <mesh castShadow position={[1.15*drop,-1.2*drop,0]} rotation={[Math.PI/2,0,drop*1.5]}><cylinderGeometry args={[.92,.7,.22,48]}/><meshStandardMaterial color="#34251f" roughness={.8}/></mesh>
  </group>
}

function SkyRover() {
  return <group scale={1.05}>
    <mesh castShadow><boxGeometry args={[1.75,.4,1.0]}/><meshStandardMaterial color="#e1d9bd" metalness={.58} roughness={.34}/></mesh>
    <mesh castShadow position={[0,.32,0]}><boxGeometry args={[1.25,.22,.78]}/><meshStandardMaterial color="#b89d54" metalness={.7} roughness={.28}/></mesh>
    {[-.64,0,.64].flatMap((x)=>[-.62,.62].map(z=><group key={`${x}-${z}`} position={[x,-.32,z]}>
      <mesh rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.24,.24,.16,20]}/><meshStandardMaterial color="#222427" metalness={.62} roughness={.75}/></mesh>
      <mesh position={[0,.18,-z*.22]} rotation={[0,0,x*.28]}><cylinderGeometry args={[.035,.035,.52,8]}/><meshStandardMaterial color="#8e8469" metalness={.75}/></mesh>
    </group>))}
    <mesh position={[0,.72,0]}><cylinderGeometry args={[.045,.055,.72,12]}/><meshStandardMaterial color="#b7a77a" metalness={.64}/></mesh>
    <mesh castShadow position={[0,1.05,0]}><boxGeometry args={[.58,.24,.28]}/><meshStandardMaterial color="#d8c78e" metalness={.55}/></mesh>
    <mesh position={[1.0,.02,.12]} rotation={[0,0,-.72]}><cylinderGeometry args={[.045,.045,1.1,10]}/><meshStandardMaterial color="#c8b879" metalness={.55}/></mesh>
  </group>
}

function SkyCrane({ progress }: { progress: number }) {
  const landed = MathUtils.smoothstep(progress,.2,.78)
  const fly = MathUtils.smoothstep(progress,.84,1)
  const roverY = MathUtils.lerp(1.35,-.72,landed)
  return <group>
    <group position={[fly*3.2, MathUtils.lerp(3.2,2.25,landed)+fly*2.1, -fly*1.2]} rotation={[0,0,-fly*.28]}>
      <mesh castShadow><boxGeometry args={[2.4,.55,1.55]}/><meshStandardMaterial color="#a49b78" metalness={.72} roughness={.32}/></mesh>
      <mesh position={[0,.38,0]}><boxGeometry args={[1.1,.25,.85]}/><meshStandardMaterial color="#d6c58a" metalness={.45}/></mesh>
      {[-.82,-.28,.28,.82].map((x,i)=><group key={x} position={[x,-.38,i%2?.52:-.52]}>
        <mesh rotation={[Math.PI,0,0]}><coneGeometry args={[.16,.7,18]}/><meshStandardMaterial color="#5e6464" metalness={.9}/></mesh>
        <mesh position={[0,-.56,0]} rotation={[Math.PI,0,0]}><coneGeometry args={[.13,.8+progress*.45,18]}/><meshBasicMaterial color="#7edfff" transparent opacity={.62}/></mesh>
      </group>)}
    </group>
    {fly < .05 && <>{[-.52,0,.52].map(x=><mesh key={x} position={[x,MathUtils.lerp(2.2,.72,landed),0]}><cylinderGeometry args={[.012,.012,MathUtils.lerp(1.7,.78,landed),8]}/><meshStandardMaterial color="#cbd3d2" metalness={.6}/></mesh>)}</>}
    <group position={[0,roverY,0]} rotation={[0,-.15,0]}><SkyRover/></group>
    {progress > .78 && <ContactShadows position={[0,-1.55,0]} scale={5} opacity={.72} blur={1.7}/>} 
  </group>
}

function Scene({ stage, playing, onProgress }: { stage: number; playing: boolean; onProgress: (value: number) => void }) {
  const progress = useRef(0)
  useEffect(() => { progress.current = 0; onProgress(0) }, [stage, onProgress])
  useFrame((_, delta) => {
    if (playing) progress.current = Math.min(1, progress.current + delta / 8)
    onProgress(progress.current)
  })
  return <>
    <CinematicCamera stage={stage} progress={progress.current}/>
    <Terrain stage={stage} progress={progress.current}/>
    {stage===0&&<HeatShield progress={progress.current}/>} {stage===1&&<Parachute progress={progress.current}/>} {stage===2&&<SkyCrane progress={progress.current}/>} 
  </>
}

export default function LandingSequence({ onProgressComplete }: { onProgressComplete: (stage: number) => void }) {
  const [stage,setStage]=useState(0), [playing,setPlaying]=useState(true), [progress,setProgress]=useState(0)
  const [run,setRun]=useState(0)
  const wrap=useRef<HTMLDivElement>(null)
  useEffect(()=>{if(progress>=1){setPlaying(false);onProgressComplete(stage+1)}},[progress,stage,onProgressComplete])
  const replay=()=>{setRun(value=>value+1);setProgress(0);setPlaying(true)}
  const selectStage=(next:number)=>{setStage(next);setRun(value=>value+1);setProgress(0);setPlaying(true);onProgressComplete(Math.max(1,next))}
  return <div className="landing-cinematic" ref={wrap}>
    <div className="landing-canvas">
      <Canvas shadows camera={{position:[5.4,2.7,7.4],fov:42}} dpr={[1,1.55]} gl={{antialias:true,powerPreference:'high-performance'}}>
        <color attach="background" args={[stage===0?'#13080a':'#170d0b']}/><fog attach="fog" args={[new Color('#6d2d20'),6,22]}/>
        <ambientLight intensity={.36}/><hemisphereLight args={['#e6b783','#3d1510',1.2]}/><directionalLight castShadow position={[4,8,5]} intensity={3.8} color="#ffdab2" shadow-mapSize={[1024,1024]}/>
        <spotLight position={[-4,5,-3]} intensity={4} angle={.5} penumbra={.8} color="#ff7145"/>
        <Scene key={`${stage}-${run}`} stage={stage} playing={playing} onProgress={setProgress}/><OrbitControls enablePan={false} enableZoom={false} enableRotate={false}/>
      </Canvas>
      <div className="reconstruction-label">EDUCATIONAL 3D RECONSTRUCTION · NOT NASA FOOTAGE</div>
      <div className="landing-hud"><span>{stages[stage].kicker}</span><b>{stages[stage].metric}</b></div>
      <div className="landing-actions">
        <button onClick={()=>setPlaying(!playing)} aria-label={playing?'Pause animation':'Play animation'}>{playing?<Pause/>:<Play/>}</button>
        <button onClick={replay} aria-label="Replay stage"><RotateCcw/></button>
        <button onClick={()=>wrap.current?.requestFullscreen?.()} aria-label="View full screen"><Expand/></button>
      </div>
      <div className="landing-progress"><i style={{width:`${progress*100}%`}}/></div>
    </div>
    <div className="landing-narration" aria-live="polite"><span>STAGE {stage+1} / 3</span><div><b>{stages[stage].title}</b><p>{stages[stage].narration}</p></div></div>
    <div className="stage-buttons">{stages.map((item,index)=><button key={item.title} onClick={()=>selectStage(index)} className={`${stage===index?'active':''} ${stage>index||progress>=1&&stage===index?'done':''}`}><span>{stage>index||progress>=1&&stage===index?<Check/>:index+1}</span><small>{item.kicker}</small><b>{item.title}</b></button>)}</div>
  </div>
}
