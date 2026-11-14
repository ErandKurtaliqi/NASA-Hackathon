import { PlanetLighting, PlanetMotion, MarsLimb } from './PlanetEffects'
import { useReducedMotion } from 'framer-motion'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import * as THREE from 'three'
import { planetaryLayers, textureTileUrl } from '../planetaryConfig'
import type { PlanetId } from '../types'

const INITIAL_CAMERA_POSITION: [number, number, number] = [0, .15, 5.6]
const MIN_CAMERA_DISTANCE = 3.2
const MAX_CAMERA_DISTANCE = Math.hypot(...INITIAL_CAMERA_POSITION)

type CameraCommand = { type: 'in' | 'out' | 'reset' | 'left' | 'right' | 'up' | 'down'; nonce: number }
const textureCache = new Map<PlanetId, THREE.CanvasTexture>()

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = url
  })
}

function usePlanetTexture(planet: PlanetId, onStatus: (state: 'loading' | 'live' | 'fallback') => void) {
  const texture = useMemo(() => {
    const cached = textureCache.get(planet)
    if (cached) return cached
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 1024
    const next = new THREE.CanvasTexture(canvas)
    next.colorSpace = THREE.SRGBColorSpace
    next.wrapS = THREE.RepeatWrapping
    next.anisotropy = 8
    textureCache.set(planet, next)
    return next
  }, [planet])

  useEffect(() => {
    const canvas = texture.image as HTMLCanvasElement
    const context = canvas.getContext('2d')
    if (!context) return
    let cancelled = false
    const config = planetaryLayers[planet]
    if(texture.userData.surfaceState==='live'){onStatus('live');return}
    let tilesApplied=false
    onStatus('loading')


    Promise.allSettled([loadImage(config.fallbackWest), loadImage(config.fallbackEast)]).then(results => {
      if (cancelled||tilesApplied) return
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') context.drawImage(result.value, index * 1024, 0, 1024, 1024)
      })
      texture.needsUpdate = true
      onStatus('fallback')
    })

    const zoom = 2
    const requests = Array.from({ length: 4 }, (_, y) => Array.from({ length: 8 }, (_, x) => ({ x, y }))).flat()
    Promise.allSettled(requests.map(async ({ x, y }) => ({ x, y, image: await loadImage(textureTileUrl(planet, zoom, y, x)) }))).then(results => {
      if (cancelled) return
      let loaded = 0
      results.forEach(result => {
        if (result.status !== 'fulfilled') return
        const { x, y, image } = result.value
        context.drawImage(image, x * 256, y * 256, 256, 256)
        loaded += 1
      })
      if(loaded===0)return
      tilesApplied=true
      texture.userData.surfaceState=loaded===requests.length?'live':'fallback'
      texture.needsUpdate = true
      onStatus(loaded === requests.length ? 'live' : 'fallback')
    })
    return () => { cancelled = true }
  }, [planet, texture, onStatus])

  return texture
}

function Planet({ planet, onInteract, onTextureState }: { planet: PlanetId; onInteract?: () => void; onTextureState: (state: 'loading' | 'live' | 'fallback') => void }) {
  const texture = usePlanetTexture(planet, onTextureState)

  return <mesh>
    <sphereGeometry args={[2, 128, 128]}/>
    <meshStandardMaterial map={texture} roughness={planet === 'mars' ? .93 : 1} metalness={0} bumpScale={0}/>
  </mesh>
}

function NasaMars({onTextureState}:{onTextureState:(state:'loading'|'live'|'fallback')=>void}){
  const {scene}=useGLTF('/models/mars-nasa.glb')
  const model=useMemo(()=>{const copy=scene.clone(true);const box=new THREE.Box3().setFromObject(copy);const size=box.getSize(new THREE.Vector3());const center=box.getCenter(new THREE.Vector3());const scale=4/Math.max(size.x,size.y,size.z);copy.scale.multiplyScalar(scale);copy.position.sub(center.multiplyScalar(scale));return copy},[scene])
  useEffect(()=>onTextureState('live'),[onTextureState])
  return <group><primitive object={model}/><MarsLimb/></group>
}

function CameraRig({command,reduced,suspendUntil}:{command:CameraCommand;reduced:boolean;suspendUntil:React.MutableRefObject<number>}){
  const {camera,invalidate}=useThree()
  const controls=useRef<React.ElementRef<typeof OrbitControls>>(null)
  const destination=useMemo(()=>new THREE.Vector3(...INITIAL_CAMERA_POSITION),[])
  const direction=useMemo(()=>new THREE.Vector3(),[]),targetDirection=useMemo(()=>new THREE.Vector3(),[])
  const turn=useMemo(()=>new THREE.Quaternion(),[]),rotation=useMemo(()=>new THREE.Quaternion(),[])
  const transitioning=useRef(false)
  const handled=useRef<CameraCommand|null>(null)
  useEffect(()=>{
    if(handled.current===command){
      if(reduced&&transitioning.current){camera.position.copy(destination);controls.current?.update();transitioning.current=false;invalidate()}
      return
    }
    handled.current=command
    if(command.type==='reset')destination.set(...INITIAL_CAMERA_POSITION)
    else if(command.type==='in'||command.type==='out'){
      if(!transitioning.current)destination.copy(camera.position)
      destination.setLength(THREE.MathUtils.clamp(destination.length()*(command.type==='in'?.82:1.2),MIN_CAMERA_DISTANCE,MAX_CAMERA_DISTANCE))
    }else{
      destination.copy(camera.position)
      const spherical=new THREE.Spherical().setFromVector3(destination)
      if(command.type==='left')spherical.theta-=.2
      if(command.type==='right')spherical.theta+=.2
      if(command.type==='up')spherical.phi=Math.max(.22,spherical.phi-.14)
      if(command.type==='down')spherical.phi=Math.min(Math.PI-.22,spherical.phi+.14)
      destination.setFromSpherical(spherical)
    }
    if(reduced){camera.position.copy(destination);controls.current?.target.set(0,0,0);controls.current?.update();transitioning.current=false}
    else transitioning.current=true
    invalidate()
  },[camera,command,destination,invalidate,reduced])
  useFrame((_,delta)=>{
    if(!transitioning.current)return
    // Interpolate direction and radius separately: linear XYZ interpolation can
    // cut inside the globe during a large reset and create a camera jump.
    const step=1-Math.exp(-Math.min(delta,.05)*9)
    const radius=THREE.MathUtils.lerp(camera.position.length(),destination.length(),step)
    direction.copy(camera.position).normalize();targetDirection.copy(destination).normalize()
    turn.setFromUnitVectors(direction,targetDirection);rotation.identity().slerp(turn,step)
    camera.position.copy(direction.applyQuaternion(rotation)).multiplyScalar(THREE.MathUtils.clamp(radius,MIN_CAMERA_DISTANCE,MAX_CAMERA_DISTANCE))
    if(camera.position.distanceTo(destination)<.001){camera.position.copy(destination);transitioning.current=false}
    controls.current?.update();invalidate()
  })
  return <OrbitControls ref={controls} enablePan={false} minDistance={MIN_CAMERA_DISTANCE} maxDistance={MAX_CAMERA_DISTANCE} minPolarAngle={.22} maxPolarAngle={Math.PI-.22} enableDamping dampingFactor={.09} rotateSpeed={.65} zoomSpeed={.65} onStart={()=>{transitioning.current=false;suspendUntil.current=Infinity}} onEnd={()=>{suspendUntil.current=performance.now()+1200}}/>
}

export default function PlanetScene({ planet, compact = false, onInteract, onReady }: { planet: PlanetId; compact?: boolean; onInteract?: () => void; onReady?: () => void }) {
  const root=useRef<HTMLDivElement>(null)
  const suspendUntil=useRef(0)
  const systemReduced=useReducedMotion()
  const reduced=!!systemReduced||localStorage.getItem('auroralys-calm')==='true'
  const [visible,setVisible]=useState(true)
  const [pageVisible,setPageVisible]=useState(!document.hidden)
  useEffect(()=>{
    const update=()=>setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange',update)
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{rootMargin:'60px'})
    if(root.current)observer.observe(root.current)
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update)}
  },[])
  const [command, setCommand] = useState<CameraCommand>({ type: 'reset', nonce: 0 })
  const [textureState, setTextureState] = useState<'loading' | 'live' | 'fallback'>('loading')
  useEffect(()=>{if(textureState!=='loading')onReady?.()},[textureState,onReady])
  const issue = (type: CameraCommand['type']) => {suspendUntil.current=performance.now()+1200;setCommand({ type, nonce: performance.now() })}
  const stableStatus = useMemo(() => (state: 'loading' | 'live' | 'fallback') => setTextureState(state), [])
  const config = planetaryLayers[planet]

  return <div ref={root} tabIndex={0} role="group" aria-description="Drag to orbit. Scroll or pinch to zoom. Arrow keys rotate, plus and minus zoom, and R resets the camera." onPointerDown={e=>{if(e.target instanceof HTMLCanvasElement)root.current?.focus({preventScroll:true})}} onKeyDown={e=>{const keys:Record<string,CameraCommand['type']>={'+':'in','=':'in','-':'out',ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',r:'reset',R:'reset'};if(keys[e.key]){e.preventDefault();issue(keys[e.key])}}} className={`${compact?'planet-canvas compact':'planet-canvas'} ${textureState!=='loading'?'planet-surface-ready':''} ${reduced?'planet-reduced-motion':''}`} aria-label={`Interactive 3D ${planet} globe using ${planet==='mars'?'NASA/JPL Mars visual texture':config.title}`}>
    <Canvas frameloop={reduced||!visible||!pageVisible?'demand':'always'} camera={{ position: INITIAL_CAMERA_POSITION, fov: 44 }} dpr={[1, 1.7]} gl={{ alpha: true, antialias: true, outputColorSpace: THREE.SRGBColorSpace }}>
      <PlanetLighting planet={planet} reduced={reduced}/>
      <Suspense fallback={null}>
        <PlanetMotion planet={planet} reduced={reduced} suspendUntil={suspendUntil} onInteract={onInteract}>{planet==='mars'?<NasaMars onTextureState={stableStatus}/>:<Planet planet={planet} onTextureState={stableStatus}/>}</PlanetMotion>
        {!compact&&<Stars radius={70} depth={35} count={1500} factor={2.4} fade speed={.18}/>}
        <CameraRig command={command} reduced={reduced} suspendUntil={suspendUntil}/>
      </Suspense>
    </Canvas>
    {!compact && <div className="globe-controls">
      <button aria-label="Zoom 3D globe in" onClick={() => issue('in')}><Plus/></button>
      <button aria-label="Zoom 3D globe out" onClick={() => issue('out')}><Minus/></button>
      <button aria-label="Reset 3D globe camera" onClick={() => issue('reset')}><RotateCcw/></button>
    </div>}
    <div className={`globe-data-state ${textureState}`}><span/><div><b>{textureState === 'live' ? (planet==='mars'?'NASA MARS VISUAL TEXTURE':'NASA SURFACE DATA') : textureState === 'loading' ? 'ASSEMBLING NASA MOSAIC' : (planet==='mars'?'MARS TEXTURE UNAVAILABLE':'NASA OFFLINE MOSAIC')}</b><small>{planet==='mars'?'NASA/JPL · VISUAL COLOUR, NOT ELEVATION':`${config.shortTitle} · EQUIRECTANGULAR`}</small></div></div>
  </div>
}
