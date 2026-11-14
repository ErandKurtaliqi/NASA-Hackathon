import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Center, ContactShadows, Html, OrbitControls, useGLTF, useProgress as useAssetProgress } from '@react-three/drei'
import { Box3, Group, Mesh, MeshStandardMaterial, Material, Object3D, Vector3 } from 'three'
import { Maximize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { useProgress } from '../store'

const MODEL_URL = '/models/perseverance.glb'

const hotspots = [
  { id: 'mastcam-z', label: 'Mastcam-Z', detail: 'Twin zoom cameras create color panoramas and stereoscopic 3D views of the terrain.', position: [0.05, 1.32, -0.08] as [number, number, number] },
  { id: 'supercam', label: 'SuperCam', detail: 'A laser and remote-sensing instruments study the chemistry and mineralogy of rocks.', position: [0.34, 1.25, -0.05] as [number, number, number] },
  { id: 'robotic-arm', label: 'Robotic arm', detail: 'The 2.1-meter arm places the coring drill, PIXL, and SHERLOC against selected rocks.', position: [1.22, 0.18, 0.28] as [number, number, number] },
]

export class ModelBoundary extends Component<{ children: React.ReactNode; fallback: React.ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function AssetLoader() {
  const { progress } = useAssetProgress()
  return <Html center><div className="model-loader"><span>{Math.round(progress)}%</span><small>DOWNLINKING NASA MODEL</small></div></Html>
}

const BODY_PANEL_MATERIALS = new Set(['mars_2020_01', 'mars_2020_02', 'mars_2020_03', 'mars_2020_04', 'paint_white_base', 'mars_2020_04_aluminum_r'])

type FocusPoint = { position: [number, number, number]; stamp: number }

export function OfficialRover({ interactive, onFound, groundY }: { interactive: boolean; groundY?:number; onFound: (label: string, detail: string, position: [number, number, number]) => void }) {
  const { scene } = useGLTF(MODEL_URL)
  const inspected = useProgress(s => s.inspectedInstruments)
  const inspect = useProgress(s => s.inspectInstrument)
  const { rover, panelMaterials } = useMemo(() => {
    const copy = scene.clone(true)
    const panelMaterials = new Map<MeshStandardMaterial, MeshStandardMaterial>()
    copy.traverse((child: Object3D) => {
      const mesh = child as Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true
      const isBody = mesh.name === 'Body' || mesh.parent?.name === 'Body'
      if (!isBody) return

      const finishPanel = (material: Material) => {
        if (!(material instanceof MeshStandardMaterial) || !BODY_PANEL_MATERIALS.has(material.name)) return material
        const existing = panelMaterials.get(material)
        if (existing) return existing

        const panel = material.clone()
        panel.roughness = Math.min(panel.roughness, .32)
        panel.color.multiplyScalar(1.08)
        panelMaterials.set(material, panel)
        return panel
      }
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(finishPanel) : finishPanel(mesh.material)
    })
    const box = new Box3().setFromObject(copy)
    const size = box.getSize(new Vector3())
    const scale = 3.3 / Math.max(size.x, size.y, size.z)
    copy.scale.setScalar(scale)
    return { rover: copy, panelMaterials }
  }, [scene])
  useEffect(() => () => { panelMaterials.forEach(material => material.dispose()) }, [panelMaterials])

  const height=useMemo(()=>new Box3().setFromObject(rover).getSize(new Vector3()).y,[rover])
  return <group rotation={[0, -.62, 0]} position={[0, groundY===undefined?-.72:groundY+height/2, 0]}>
    <Center><primitive object={rover}/></Center>
    {interactive && hotspots.map(h => <group key={h.id} position={h.position}>
      <HotspotBeacon onClick={() => { inspect(h.id); onFound(h.label, h.detail, h.position) }} selected={inspected.includes(h.id)} />
      <Html distanceFactor={8} center position={[0, .18, 0]} className="hotspot-html">
        <button onClick={() => { inspect(h.id); onFound(h.label, h.detail, h.position) }} aria-label={`Inspect ${h.label}`}>{h.label}</button>
      </Html>
    </group>)}
  </group>
}

function HotspotBeacon({ onClick, selected }: { onClick: () => void; selected: boolean }) {
  return <mesh onClick={(event) => { event.stopPropagation(); onClick() }} scale={selected ? .78 : 1}>
    <sphereGeometry args={[.075, 24, 24]}/>
    <meshBasicMaterial color={selected ? '#79efbc' : '#67e2ff'} transparent opacity={.92}/>
    <pointLight color={selected ? '#79efbc' : '#67e2ff'} intensity={1.8} distance={.8}/>
  </mesh>
}

function RoverFallback() {
  return <Html center><div className="webgl-fallback"><b>3D MODEL UNAVAILABLE</b><span>The official NASA asset could not be loaded. Check your connection and reload.</span></div></Html>
}

function FocusRig({ focus, controls }: { focus: FocusPoint | null; controls: React.MutableRefObject<any> }) {
  const { camera } = useThree()
  const frames = useRef(0)
  const desired = useMemo(() => new Vector3(), [])
  const target = useMemo(() => new Vector3(), [])
  useEffect(()=>{frames.current=focus?90:0},[focus?.stamp])
  useFrame(() => {
    if (!focus || frames.current <= 0 || !controls.current) return
    target.set(focus.position[0], focus.position[1] - .22, focus.position[2])
    desired.copy(target).add(new Vector3(2.35, 1.35, 2.55))
    camera.position.lerp(desired, .055)
    controls.current.target.lerp(target, .075)
    controls.current.update()
    frames.current -= 1
  })
  return null
}

export default function RoverScene({ interactive = false }: { interactive?: boolean }) {
  const [info, setInfo] = useState('Select a labeled hotspot to inspect an instrument.')
  const [focus, setFocus] = useState<FocusPoint | null>(null)
  const controls = useRef<any>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const reset = () => { setFocus(null); controls.current?.reset() }
  const zoom = (factor: number) => {
    const camera = controls.current?.object
    if (!camera) return
    camera.position.multiplyScalar(factor)
    controls.current.update()
  }

  return <div className="rover-wrap" ref={wrap}>
    <Canvas shadows camera={{ position: [4.6, 2.7, 5.2], fov: 34 }} dpr={[1, 1.7]} gl={{ antialias: true, powerPreference: 'high-performance' }} fallback={<div className="webgl-fallback">WebGL is required for the interactive rover.</div>}>
      <color attach="background" args={['#03050a']}/>
      <fog attach="fog" args={['#09070a', 8, 16]}/>
      <hemisphereLight args={['#9fc8ff', '#6f281d', 1.35]}/>
      <directionalLight castShadow position={[4, 7, 5]} intensity={4.1} color="#fff0d0" shadow-mapSize={[1536, 1536]} shadow-bias={-.0002}/>
      <directionalLight position={[-2, 3, 5]} intensity={.85} color="#f4f7ff"/>
      <spotLight position={[-4, 4, -2]} intensity={2.6} angle={.55} penumbra={.8} color="#67cfff"/>
      <ModelBoundary fallback={<RoverFallback/>}>
        <Suspense fallback={<AssetLoader/>}><OfficialRover interactive={interactive} onFound={(label, detail, position) => {setInfo(`${label} — ${detail}`);setFocus({position,stamp:Date.now()})}}/></Suspense>
      </ModelBoundary>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.03, 0]}><circleGeometry args={[8, 96]}/><meshStandardMaterial color="#351812" roughness={1}/></mesh>
      <ContactShadows position={[0, -1, 0]} opacity={.62} scale={7} blur={2.4} far={4}/>
      <OrbitControls ref={controls} makeDefault enablePan={false} minDistance={2.6} maxDistance={9} minPolarAngle={.55} maxPolarAngle={1.55} target={[0, .15, 0]}/>
      <FocusRig focus={focus} controls={controls}/>
    </Canvas>
    <div className="rover-controls" aria-label="Rover camera controls">
      <button onClick={() => zoom(.82)} aria-label="Zoom in"><ZoomIn/></button>
      <button onClick={() => zoom(1.2)} aria-label="Zoom out"><ZoomOut/></button>
      <button onClick={reset} aria-label="Reset camera"><RotateCcw/></button>
      <button onClick={()=>wrap.current?.requestFullscreen()} aria-label="Enter fullscreen"><Maximize2/></button>
    </div>
    <div className="asset-credit"><span>OFFICIAL 3D ASSET</span><b>NASA / JPL-CALTECH</b></div>
    {interactive && <div className="scene-caption" aria-live="polite"><span className="live-dot"/>{info}</div>}
  </div>
}
