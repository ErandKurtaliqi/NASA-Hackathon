import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Html, OrbitControls, Stars, useProgress as useAssetProgress } from '@react-three/drei'
import { CanvasTexture, Color, DynamicDrawUsage, InstancedMesh, Object3D, PlaneGeometry, RepeatWrapping, SRGBColorSpace, Vector3 } from 'three'
import type { MotionValue } from 'framer-motion'
import { OfficialRover } from '../RoverScene'
import { LunarRover } from '../LunarRoverScene'
import type { RoverExperience } from './roverExperience'

type Props = { experience: RoverExperience; progress: MotionValue<number>; inspect: boolean; reduced: boolean; lowDetail: boolean; reset: number; onInfo: (value: string) => void; onUnavailable: () => void }

class SceneBoundary extends Component<{ children: ReactNode; onUnavailable: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onUnavailable() }
  render() { return this.state.failed ? <div className="cinema-scene-fallback" role="status">The 3D view is unavailable. Your mission story, narration and activities still work.</div> : this.props.children }
}

function ModelLoading() {
  const { progress } = useAssetProgress()
  return <Html center><div className="cinema-model-loading" role="status"><span /> Preparing your surface view · {Math.round(progress)}%</div></Html>
}

function terrainHeight(x:number,y:number){
  const distance=Math.sqrt(x*x+y*y), fade=Math.min(1,Math.max(0,(distance-4)/15))
  return (Math.sin(x*.18)*Math.cos(y*.12)*2.4+Math.sin(x*.37+y*.21)*.65+Math.sin(y*.08)*1.8)*fade
}

function Terrain({ lunar, lowDetail }: { lunar: boolean; lowDetail: boolean }) {
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(150, 150, lowDetail ? 48 : 96, lowDetail ? 48 : 96)
    const positions = g.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i)
      positions.setZ(i,terrainHeight(x,y))
    }
    g.computeVertexNormals(); return g
  }, [lowDetail])
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = lunar ? '#686766' : '#986c50'; ctx.fillRect(0, 0, 256, 256)
    let seed=173;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
    for (let i = 0; i < 9000; i++) { ctx.fillStyle = i % 2 ? '#00000012' : '#ffffff14'; ctx.fillRect(random()*256, random()*256, 1.2, 1.2) }
    const t = new CanvasTexture(canvas); t.colorSpace = SRGBColorSpace; t.wrapS = t.wrapT = RepeatWrapping; t.repeat.set(32, 32); return t
  }, [lunar])
  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => texture.dispose(), [texture])
  return <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.07, 0]} receiveShadow><meshStandardMaterial map={texture} roughness={1} /></mesh>
}

function Rocks({ lunar, lowDetail }: { lunar: boolean; lowDetail: boolean }) {
  const ref = useRef<InstancedMesh>(null)
  const count = lowDetail ? 28 : 64
  useLayoutEffect(() => {
    const mesh = ref.current; if (!mesh) return
    const object = new Object3D()
    for (let i = 0; i < count; i++) {
      const angle = i * 2.39996, radius = 3.5 + (i * 1.79) % 22, size = .08 + (i * .173) % .46
      const x=Math.cos(angle)*radius,z=Math.sin(angle)*radius
      object.position.set(x,-1.07+terrainHeight(x,-z)-size*.08,z)
      object.scale.set(size * 1.4, size * .7, size); object.rotation.set(i, i * .7, .2); object.updateMatrix(); mesh.setMatrixAt(i, object.matrix)
      mesh.setColorAt(i, new Color(lunar ? '#595958' : '#74503e').multiplyScalar(.8 + (i % 5) * .09))
    }
    mesh.instanceMatrix.setUsage(DynamicDrawUsage); mesh.instanceMatrix.needsUpdate = true
  }, [count, lunar])
  return <instancedMesh castShadow={!lowDetail} ref={ref} args={[undefined, undefined, count]} receiveShadow><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial roughness={1} /></instancedMesh>
}

function CameraDirector({ experience, progress, inspect, reduced, reset, controls }: Props & { controls: React.MutableRefObject<any> }) {
  const { camera, size, invalidate } = useThree()
  const position = useMemo(() => new Vector3(), []), target = useMemo(() => new Vector3(), []), nextTarget = useMemo(() => new Vector3(), [])
  useEffect(() => {
    if (!inspect || !controls.current) return
    camera.position.set(5.3, 2.5, 6.2); controls.current.target.set(1.1, 0, 0); controls.current.update()
  }, [inspect, reset, camera, controls])
  useEffect(()=>progress.on('change',()=>invalidate()),[progress,invalidate])
  useFrame((_, dt) => {
    if (inspect || !controls.current) return
    const amount = Math.min(.9999, Math.max(0, progress.get())) * 4
    const index = Math.floor(amount), local = amount - index
    const eased = local * local * (3 - 2 * local)
    const a = experience.shots[index], b = experience.shots[Math.min(4, index + 1)]
    position.fromArray(a.position).lerp(target.fromArray(b.position), eased)
    target.fromArray(a.target).lerp(nextTarget.fromArray(b.target), eased)
    if (size.width < 700) { position.multiplyScalar(1.16); target.x = 1.1; target.y-=1.05 }
    const alpha = reduced ? 1 : 1 - Math.exp(-Math.min(dt, .05) * 5)
    camera.position.lerp(position, alpha); controls.current.target.lerp(target, alpha); controls.current.update()
  })
  return null
}

export default function CinematicScene(props: Props) {
  const { experience, inspect, lowDetail, onInfo } = props
  const controls = useRef<any>(null)
  const lunar = experience.story.planet === 'moon'
  return <SceneBoundary onUnavailable={props.onUnavailable}><Canvas frameloop={props.reduced&&!inspect?'demand':'always'} camera={{ position: [6.2, 2.5, 7.4], fov: 38 }} dpr={lowDetail ? 1 : [1, 1.5]} shadows={!lowDetail} gl={{ antialias: !lowDetail, powerPreference: lowDetail ? 'low-power' : 'high-performance' }} fallback={<div className="cinema-scene-fallback">3D needs WebGL. Your story, narration and activities remain available.</div>}>
    <color attach="background" args={[lunar ? '#03060d' : '#201a1b']} />
    {!lunar && <fog attach="fog" args={['#554239', 13, 55]} />}
    <hemisphereLight args={[lunar ? '#c3cbd8' : '#e2c7b5', lunar ? '#272a31' : '#684330', lunar ? .7 : 1.2]} />
    <directionalLight castShadow={!lowDetail} position={[-4, 8, 3]} intensity={lunar ? 3.2 : 3.4} color={lunar ? '#f5f3ed' : '#fff0dc'} shadow-mapSize={[1024, 1024]} shadow-bias={-.0004} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} />
    <directionalLight position={[-2,3,5]} intensity={.85} color="#f4f7ff"/>
    {lunar && <Stars radius={65} depth={20} count={lowDetail ? 180 : 420} factor={1.3} fade speed={0} />}
    <Terrain lunar={lunar} lowDetail={lowDetail} /><Rocks lunar={lunar} lowDetail={lowDetail} />
    <group position={[1.1, 0, 0]}>
      <Suspense fallback={<ModelLoading />}>
        {lunar ? <LunarRover stationary interactive={inspect} onInfo={onInfo} /> : <OfficialRover groundY={-1.07} interactive={inspect} onFound={(label, detail) => onInfo(`${label} — ${detail}`)} />}
      </Suspense>
    </group>
    {!lowDetail && <ContactShadows frames={1} position={[1.1, -1.03, 0]} opacity={.55} scale={8} blur={2} far={4} resolution={128} />}
    <OrbitControls ref={controls} makeDefault enabled={inspect} enablePan={false} enableDamping dampingFactor={.07} minDistance={3} maxDistance={12} minPolarAngle={.25} maxPolarAngle={1.48} target={[.1, -.15, 0]} />
    <CameraDirector {...props} controls={controls} />
  </Canvas></SceneBoundary>
}
