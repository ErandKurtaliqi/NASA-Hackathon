import PlanetLocationPins from './PlanetLocationPins'
import type { ExactMissionLocation } from '../features/explorer/storyMapLocations'
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

type SurfaceState = 'loading' | 'live' | 'fallback' | 'failed'

type CameraCommand = { type: 'in' | 'out' | 'reset' | 'left' | 'right' | 'up' | 'down'; nonce: number }
const textureCache = new Map<PlanetId, THREE.CanvasTexture>()

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    const finish = () => {
      window.clearTimeout(timeout)
      image.onload = null
      image.onerror = null
    }
    const fail = () => {
      finish()
      image.removeAttribute('src')
      reject(new Error('Unable to load planetary imagery'))
    }
    const timeout = window.setTimeout(fail, 8000)
    image.crossOrigin = 'anonymous'
    image.onload = () => { finish(); resolve(image) }
    image.onerror = fail
    image.src = url
  })
}

function usePlanetTexture(planet: PlanetId, onStatus: (state: SurfaceState) => void) {
  const invalidate = useThree(state => state.invalidate)
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
    const cachedState = texture.userData.surfaceState
    if (cachedState === 'live') {
      onStatus('live')
      return
    }
    const canvas = texture.image as HTMLCanvasElement
    const context = canvas.getContext('2d')
    if (!context) {
      onStatus('failed')
      return
    }

    // Remove the elevation palette before applying a consistent rust tint.
    if (planet === 'mars') context.filter = 'grayscale(1)'

    let cancelled = false
    const config = planetaryLayers[planet]
    const base = cachedState === 'fallback' ? Promise.resolve(true) :
      Promise.allSettled([loadImage(config.fallbackWest), loadImage(config.fallbackEast)]).then(results => {
        const [west, east] = results
        if (cancelled || west.status !== 'fulfilled' || east.status !== 'fulfilled') return false
        context.drawImage(west.value, 0, 0, 1024, 1024)
        context.drawImage(east.value, 1024, 0, 1024, 1024)
        texture.userData.surfaceState = 'fallback'
        texture.needsUpdate = true
        onStatus('fallback')
        invalidate()
        return true
      })
    if (cachedState === 'fallback') onStatus('fallback')

    const tiles = Array.from({ length: 32 }, (_, index) => {
      const x = index % 8
      const y = Math.floor(index / 8)
      return loadImage(textureTileUrl(planet, 2, y, x)).then(image => ({ x, y, image }))
    })
    Promise.all([base, Promise.allSettled(tiles)]).then(([hasBase, results]) => {
      if (cancelled) return
      const complete = results.every(result => result.status === 'fulfilled')
      if (!hasBase && !complete) {
        onStatus('failed')
        return
      }
      for (const result of results) {
        if (result.status !== 'fulfilled') continue
        const { x, y, image } = result.value
        context.drawImage(image, x * 256, y * 256, 256, 256)
      }
      const state = complete ? 'live' : 'fallback'
      texture.userData.surfaceState = state
      texture.needsUpdate = true
      onStatus(state)
      invalidate()
    })
    return () => { cancelled = true }
  }, [planet, texture, onStatus, invalidate])

  return texture
}

function Planet({ planet, onInteract, onTextureState }: { planet: PlanetId; onInteract?: () => void; onTextureState: (state: SurfaceState) => void }) {
  const texture = usePlanetTexture(planet, onTextureState)

  return <mesh>
    <sphereGeometry args={[2, 128, 128]}/>
    <meshStandardMaterial map={texture} color={planet === 'mars' ? '#df805c' : '#ffffff'} roughness={planet === 'mars' ? .93 : 1} metalness={0} bumpScale={0}/>
  </mesh>
}

function NasaMars({onTextureState}:{onTextureState:(state:'loading'|'live'|'fallback')=>void}){
  const {scene}=useGLTF('/models/mars-nasa.glb')
  const model=useMemo(()=>{const copy=scene.clone(true);const box=new THREE.Box3().setFromObject(copy);const size=box.getSize(new THREE.Vector3());const center=box.getCenter(new THREE.Vector3());const scale=4/Math.max(size.x,size.y,size.z);copy.scale.multiplyScalar(scale);copy.position.sub(center.multiplyScalar(scale));return copy},[scene])
  useEffect(()=>onTextureState('live'),[onTextureState])
  return <group><primitive object={model}/><MarsLimb/></group>
}

function SceneReady({ onReady }: { onReady: () => void }) {
  const frame = useRef<number | null>(null)
  const invalidate = useThree(state => state.invalidate)
  useEffect(() => {
    invalidate()
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      frame.current = null
    }
  }, [invalidate])

  useFrame(() => {
    // React Three Fiber draws after useFrame. Reveal on the next browser frame.
    if (frame.current === null) frame.current = requestAnimationFrame(onReady)
  })
  return null
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

export default function PlanetScene({ planet, compact = false, openingPaused = false, onInteract, onReady, locations, selectedLocationId, onSelectLocation }: { planet: PlanetId; compact?: boolean; openingPaused?: boolean; onInteract?: () => void; onReady?: () => void; locations?: readonly ExactMissionLocation[]; selectedLocationId?: string; onSelectLocation?: (id: string) => void }) {
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
  const [textureState, setTextureState] = useState<SurfaceState>('loading')
  const issue = (type: CameraCommand['type']) => {suspendUntil.current=performance.now()+1200;setCommand({ type, nonce: performance.now() })}
  const config = planetaryLayers[planet]
  const useMarsModel = planet === 'mars' && !locations
  if (textureState === 'failed') throw new Error('Planetary imagery is unavailable')
  const surfaceReady = textureState === 'live' || textureState === 'fallback'

  return <div ref={root} tabIndex={0} role="group" aria-description="Drag to orbit. Scroll or pinch to zoom. Arrow keys rotate, plus and minus zoom, and R resets the camera." onPointerDown={e=>{if(e.target instanceof HTMLCanvasElement)root.current?.focus({preventScroll:true})}} onKeyDown={e=>{const keys:Record<string,CameraCommand['type']>={'+':'in','=':'in','-':'out',ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',r:'reset',R:'reset'};if(keys[e.key]){e.preventDefault();issue(keys[e.key])}}} className={`${compact?'planet-canvas compact':'planet-canvas'}`} aria-label={`Interactive 3D ${planet} globe using ${useMarsModel?'NASA/JPL Mars visual texture':config.title}`}>
    <Canvas frameloop={reduced||!visible||!pageVisible?'demand':'always'} camera={{ position: INITIAL_CAMERA_POSITION, fov: 44 }} dpr={[1, 1.7]} gl={{ alpha: true, antialias: true, outputColorSpace: THREE.SRGBColorSpace }}>
      <PlanetLighting planet={planet} reduced={reduced} paused={openingPaused}/>
      <Suspense fallback={null}>
        <PlanetMotion planet={planet} reduced={reduced || openingPaused} suspendUntil={suspendUntil} onInteract={onInteract} initialLongitude={locations ? -Math.PI / 2 : undefined}>
          {useMarsModel ? <NasaMars onTextureState={setTextureState}/> : <Planet planet={planet} onTextureState={setTextureState}/>}
          {planet === 'mars' && !useMarsModel && <MarsLimb/>}
          {surfaceReady && locations && onSelectLocation && <PlanetLocationPins locations={locations} selectedId={selectedLocationId} onSelect={onSelectLocation}/>}
        </PlanetMotion>
        {!compact&&<Stars radius={70} depth={35} count={1500} factor={2.4} fade speed={.18}/>}
        {surfaceReady && onReady && <SceneReady onReady={onReady}/>}
        <CameraRig command={command} reduced={reduced} suspendUntil={suspendUntil}/>
      </Suspense>
    </Canvas>
    {!compact && <div className="globe-controls">
      <button aria-label="Zoom 3D globe in" onClick={() => issue('in')}><Plus/></button>
      <button aria-label="Zoom 3D globe out" onClick={() => issue('out')}><Minus/></button>
      <button aria-label="Reset 3D globe camera" onClick={() => issue('reset')}><RotateCcw/></button>
    </div>}
    <div className={`globe-data-state ${textureState}`}><span/><div><b>{textureState === 'live' ? (useMarsModel?'NASA MARS VISUAL TEXTURE':'NASA SURFACE DATA') : textureState === 'loading' ? 'ASSEMBLING NASA MOSAIC' : ('NASA OFFLINE MOSAIC')}</b><small>{useMarsModel?'NASA/JPL · VISUAL COLOUR, NOT ELEVATION':`${config.shortTitle} · ${planet === 'mars' ? 'COLORIZED HILLSHADE' : 'EQUIRECTANGULAR'}`}</small></div></div>
  </div>
}
