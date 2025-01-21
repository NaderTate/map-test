import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  useFBX,
  Environment,
  useTexture,
  useGLTF,
} from '@react-three/drei';

// src/RealisticBuilding.tsx
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const Scene = () => {
  const fbx = useFBX('house.fbx');
  // const obj = useLoader(OBJLoader, 'test.obj');
  // const glb = useGLTF('house.glb');

  // const colorMap = useLoader(TextureLoader, 'PavingStones092_1K-JPG_Color.jpg');
  // const colorMap = useTexture('PavingStones092_1K-JPG_Color.jpg');

  return (
    <>
      {/* <primitive object={glb.scene} /> */}
      <primitive object={fbx} scale={0.005} />
      <ambientLight intensity={1} />
      <directionalLight />
      {/* <mesh> */}
      {/* <sphereGeometry args={[1, 32, 32]} /> */}
      {/* <meshStandardMaterial map={colorMap} /> */}
      {/* </mesh> */}
    </>
  );
};

export default function App() {
  return (
    <div className="App">
      <Canvas
        style={{ width: '100vw', height: '100vh' }}
        camera={{ position: [10, 6, 10], fov: 50 }}
      >
        <Suspense fallback={null}>
          <Scene />
          <OrbitControls />
          {/* <Environment preset="sunset" background /> */}
        </Suspense>
      </Canvas>
    </div>
  );
}
