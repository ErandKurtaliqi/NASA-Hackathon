import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlanetId } from '../types'

// Presentation motion, not a simulation of actual planetary rotation rates.
export function PlanetMotion({children,planet,reduced,onInteract,suspendUntil}:{children:ReactNode;planet:PlanetId;reduced:boolean;onInteract?:()=>void;suspendUntil:React.MutableRefObject<number>}){
  const group=useRef<THREE.Group>(null)
  const hovering=useRef(false),elapsed=useRef(0),velocity=useRef(0)
  useFrame((_,rawDelta)=>{
    if(!group.current||reduced)return
    const dt=Math.min(rawDelta,.05)
    elapsed.current+=dt
    // The opening turn settles gently into a slow orbit. Hover eases it to a stop.
    const opening=Math.exp(-elapsed.current*1.55)*.62
    const desired=hovering.current||performance.now()<suspendUntil.current?0:.045+opening
    velocity.current=THREE.MathUtils.damp(velocity.current,desired,4.4,dt)
    group.current.rotation.y+=velocity.current*dt
  })
  return <group ref={group} onPointerEnter={()=>{hovering.current=true}} onPointerLeave={()=>{hovering.current=false}} onPointerDown={onInteract} rotation={[0,planet==='moon'?Math.PI:0,0]}>{children}</group>
}

export function PlanetLighting({planet,reduced}:{planet:PlanetId;reduced:boolean}){
  const light=useRef<THREE.DirectionalLight>(null),time=useRef(0)
  useFrame((_,delta)=>{
    if(!light.current||reduced)return
    time.current+=Math.min(delta,.05)
    const ease=1-Math.exp(-time.current*1.8)
    light.current.position.set(-6+ease,2.4+1.1*ease,2.5+2.5*ease)
    light.current.intensity=(planet==='mars'?2.7:4.2)*(.75+.25*ease)
  })
  return <><ambientLight intensity={.08}/><directionalLight ref={light} position={[-5,3.5,5]} intensity={planet==='mars'?2.7:4.2} color={planet==='mars'?'#ffffff':'#f6f8ff'}/><directionalLight position={[4,-2,-3]} intensity={.08} color="#6ca9ff"/></>
}

// A restrained sunlit limb for Mars only. The Moon intentionally has no atmosphere.
export function MarsLimb(){
  const uniforms=useMemo(()=>({uColor:{value:new THREE.Color('#b98766')},uSun:{value:new THREE.Vector3(-5,3.5,5).normalize()}}),[])
  return <mesh renderOrder={2}><sphereGeometry args={[2.021,64,48]}/><shaderMaterial transparent depthWrite={false} uniforms={uniforms} vertexShader={`varying vec3 vWorldNormal;varying vec3 vWorldPosition;
void main(){vec4 world=modelMatrix*vec4(position,1.0);vWorldPosition=world.xyz;vWorldNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*world;}`} fragmentShader={`uniform vec3 uColor;uniform vec3 uSun;varying vec3 vWorldNormal;varying vec3 vWorldPosition;
void main(){vec3 n=normalize(vWorldNormal);vec3 viewDir=normalize(cameraPosition-vWorldPosition);float rim=pow(1.0-max(dot(n,viewDir),0.0),3.8);float day=sqrt(max(dot(n,uSun),0.0));gl_FragColor=vec4(uColor,rim*day*.15);}`} /></mesh>
}
