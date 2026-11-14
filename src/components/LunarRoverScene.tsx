import { useProgress } from '../store'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Html, OrbitControls, RoundedBox } from '@react-three/drei'
import { useRef, useState } from 'react'
import type { Group } from 'three'
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'

const lunarHotspots = [
  { id:'mesh-wheels', label:'Wire-mesh wheels', detail:'Flexible steel-wire tires with titanium chevrons gripped loose regolith without air.', position:[-1.15,-.32,.82] as [number,number,number] },
  { id:'high-gain', label:'High-gain antenna', detail:'The umbrella-shaped dish sent television and communications toward Earth.', position:[.92,1.18,.08] as [number,number,number] },
  { id:'navigation', label:'Navigation console', detail:'A gyro, odometers, and Sun-shadow device calculated the way back to the lunar module.', position:[0,.65,.15] as [number,number,number] },
]

export function LunarRover({ interactive, onInfo, stationary=false }:{interactive:boolean;onInfo:(value:string)=>void;stationary?:boolean}){
  const inspected=useProgress(s=>s.inspectedInstruments),inspectComponent=useProgress(s=>s.inspectInstrument)
  const rover=useRef<Group>(null)
  useFrame((_,delta)=>{if(rover.current&&!interactive&&!stationary)rover.current.rotation.y+=delta*.08})
  return <group ref={rover} rotation={[0,-.55,0]} position={[0,stationary?-.345:-.52,0]}>
    <RoundedBox args={[2.7,.16,1.45]} radius={.035} smoothness={3} castShadow>
      <meshPhysicalMaterial color="#c5bba5" metalness={.42} roughness={.32} clearcoat={.22} clearcoatRoughness={.28}/>
    </RoundedBox>
    {[[-.72,.2], [.72,.2]].map((p,i)=><group key={i} position={[p[0],.46,p[1]]}>
      <mesh rotation={[-.18,0,0]}><boxGeometry args={[.62,.78,.08]}/><meshStandardMaterial color="#777368" metalness={.45} wireframe/></mesh>
      <mesh position={[0,-.38,.3]}><boxGeometry args={[.62,.08,.65]}/><meshStandardMaterial color="#a29b89" metalness={.55}/></mesh>
    </group>)}
    {[-1.05,1.05].flatMap(x=>[-.82,.82].map(z=><group key={`${x}-${z}`} position={[x,-.26,z]}>
      <mesh rotation={[Math.PI/2,0,0]} castShadow><torusGeometry args={[.39,.075,8,30]}/><meshStandardMaterial color="#b8b8aa" metalness={.82} roughness={.52} wireframe/></mesh>
      {[...Array(12)].map((_,i)=><mesh key={i} rotation={[Math.PI/2,i*Math.PI/6,0]}><boxGeometry args={[.035,.54,.025]}/><meshStandardMaterial color="#d0c9b4" metalness={.75}/></mesh>)}
      <mesh position={[-x*.2,.18,-z*.18]} rotation={[0,0,x*.22]}><cylinderGeometry args={[.035,.035,.72,8]}/><meshStandardMaterial color="#9c927b" metalness={.7}/></mesh>
    </group>))}
    <mesh position={[0,.35,.05]}><boxGeometry args={[.55,.55,.35]}/><meshStandardMaterial color="#a39a86" metalness={.40} roughness={.35}/></mesh>
    <group position={[.92,.85,.05]} rotation={[0,0,-.18]}>
      <mesh><cylinderGeometry args={[.035,.035,1.05,8]}/><meshStandardMaterial color="#b8ad92" metalness={.7}/></mesh>
      <mesh position={[0,.56,0]} rotation={[0,0,.18]}><sphereGeometry args={[.48,24,12,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#d8d3c3" metalness={.65} roughness={.38} side={2} wireframe/></mesh>
    </group>
    <mesh position={[-.92,.52,-.25]}><boxGeometry args={[.35,.45,.4]}/><meshStandardMaterial color="#e2ddd0" metalness={.5}/></mesh>
    {interactive&&lunarHotspots.map(h=><group key={h.id} position={h.position}><mesh onClick={(e)=>{e.stopPropagation();inspectComponent(h.id);onInfo(`${h.label} — ${h.detail}`)}}><sphereGeometry args={[.08,18,18]}/><meshBasicMaterial color={inspected.includes(h.id)?'#8be6b9':'#b8e9ff'}/></mesh><Html center distanceFactor={8} position={[0,.18,0]} className="hotspot-html"><button onClick={()=>{inspectComponent(h.id);onInfo(`${h.label} — ${h.detail}`)}}>{h.label}</button></Html></group>)}
  </group>
}

export default function LunarRoverScene({interactive=false}:{interactive?:boolean}){
  const [info,setInfo]=useState('Select a labeled system to inspect my lunar engineering.')
  const controls=useRef<any>(null)
  return <div className="rover-wrap lunar-rover-wrap"><Canvas shadows camera={{position:[4.7,2.8,5.5],fov:38}} dpr={[1,1.6]}>
    <color attach="background" args={['#02040a']}/><fog attach="fog" args={['#060810',8,17]}/><ambientLight intensity={.38}/><directionalLight castShadow position={[5,7,3]} intensity={4.8} color="#f5f1dc" shadow-mapSize={[1024,1024]}/><pointLight position={[-3,2,-2]} intensity={1.6} color="#6bcfff"/>
    <directionalLight position={[-2,3,5]} intensity={.85} color="#f4f7ff"/>
    <LunarRover interactive={interactive} onInfo={setInfo}/><mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,-.82,0]}><circleGeometry args={[8,64]}/><meshStandardMaterial color="#4c4b4b" roughness={1}/></mesh><ContactShadows position={[0,-.8,0]} scale={7} opacity={.72} blur={1.8}/><OrbitControls ref={controls} enablePan={false} minDistance={3} maxDistance={9} target={[0,.15,0]}/>
  </Canvas><div className="rover-controls"><button onClick={()=>{controls.current.object.position.multiplyScalar(.82);controls.current.update()}}><ZoomIn/></button><button onClick={()=>{controls.current.object.position.multiplyScalar(1.2);controls.current.update()}}><ZoomOut/></button><button onClick={()=>controls.current.reset()}><RotateCcw/></button></div><div className="asset-credit"><span>3D RECONSTRUCTION</span><b>NASA-DOCUMENTED SYSTEMS</b></div>{interactive&&<div className="scene-caption"><span className="live-dot"/>{info}</div>}</div>
}
