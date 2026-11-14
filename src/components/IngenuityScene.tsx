import { Canvas } from '@react-three/fiber'
import { Bounds, Html, OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import { ModelBoundary } from './RoverScene'

function HelicopterModel() {
  const { scene } = useGLTF('/models/ingenuity.glb')
  const model = useMemo(() => scene.clone(true), [scene])
  return <Bounds fit clip observe margin={1.3}>
    <primitive object={model} />
  </Bounds>
}

export default function IngenuityScene() {
  return <div className="rover-wrap" aria-label="Interactive 3D model of Ingenuity">
    <ModelBoundary fallback={<div className="webgl-fallback" role="status">The Ingenuity model could not load.</div>}>
      <Canvas camera={{ position: [3, 2.3, 4], fov: 36 }} dpr={[1, 1.5]} frameloop="demand" fallback={<div className="webgl-fallback">WebGL is required to explore Ingenuity in 3D.</div>}>
        <color attach="background" args={['#080b13']} />
        <hemisphereLight args={['#e1ecff', '#9d7865', 1.65]} />
        <directionalLight position={[3, 5, 4]} intensity={3.1} color="#fff2db" />
        <directionalLight position={[-3, 2, -2]} intensity={1.4} color="#a3cfff" />
        <OrbitControls makeDefault enablePan={false} />
        <Suspense fallback={<Html center><div className="model-loader" role="status">Loading Ingenuity…</div></Html>}>
          <HelicopterModel />
        </Suspense>
      </Canvas>
    </ModelBoundary>
    <div className="asset-credit"><span>OFFICIAL 3D MODEL</span><b>NASA / JPL-CALTECH</b></div>
    <div className="scene-caption">Drag to rotate · Scroll or pinch to zoom</div>
  </div>
}
