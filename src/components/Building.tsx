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
// import {TextureLoader} from 'three/examples/jsm/loaders/TextureLoader.js'

const RealisticBuilding: React.FC = () => {
  //
  // 1. Load Textures
  //
  const brickTexture = useLoader(TextureLoader, 'brick.jpg');
  const roofTexture = useLoader(TextureLoader, 'roof.jpg');

  // Optionally repeat/scale textures if needed
  brickTexture.wrapS = THREE.RepeatWrapping;
  brickTexture.wrapT = THREE.RepeatWrapping;
  brickTexture.repeat.set(2, 1); // Adjust repeats to your taste

  roofTexture.wrapS = THREE.RepeatWrapping;
  roofTexture.wrapT = THREE.RepeatWrapping;
  roofTexture.repeat.set(1, 1);

  return (
    <group position={[0, 0, 0]}>
      {/*
        The building below is 8m wide (x), 6m deep (z), and 6m tall (y).
        We'll create:
          - 4 Walls (planeGeometry)
          - Pitched Roof (two planeGeometry, angled)
          - A Door (box or plane geometry)
          - Windows (small planes)
      */}

      {/* ------------------------------------------------
          2. Walls
         ------------------------------------------------ */}

      {/* Front Wall */}
      <mesh
        position={[0, 3, 3]} // center at y=3, z=+3
        rotation={[0, Math.PI, 0]} // face outward (towards +Z)
      >
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial map={brickTexture} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 3, -3]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial map={brickTexture} />
      </mesh>

      {/* Left Wall */}
      <mesh
        position={[-4, 3, 0]}
        rotation={[0, Math.PI / 2, 0]} // rotate 90 deg around Y
      >
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial map={brickTexture} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[4, 3, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial map={brickTexture} />
      </mesh>

      {/* ------------------------------------------------
          3. Roof (pitched)
         ------------------------------------------------ 
         Let's create two angled planes. Each plane is 
         8m wide (same as building width) and 6m deep.
         We'll tilt them ~45 degrees.
      */}
      <mesh
        position={[0, 6.5, 0]} // near top of walls
        rotation={[0, 0, Math.PI / 4]}
      >
        <planeGeometry args={[8.5, 6]} />
        <meshStandardMaterial map={roofTexture} />
      </mesh>
      <mesh position={[0, 6.5, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <planeGeometry args={[8.5, 6]} />
        <meshStandardMaterial map={roofTexture} />
      </mesh>

      {/* ------------------------------------------------
          4. Door
         ------------------------------------------------ 
         A simple rectangle on the front wall, lower portion.
         We'll make it 1.2m wide and 2m tall.
      */}
      <mesh
        position={[0, 1, 2.99]} // Slightly in front of the wall to avoid z-fighting
      >
        <boxGeometry args={[1.2, 2, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* ------------------------------------------------
          5. Windows (Front Wall)
         ------------------------------------------------ 
         We'll place two small windows on each floor.
         Each window is 1m wide x 1m tall, spaced out horizontally.
      */}
      {/* Lower Floor Windows */}
      <mesh position={[-2, 2, 2.98]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#cceeff" />
      </mesh>
      <mesh position={[2, 2, 2.98]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#cceeff" />
      </mesh>

      {/* Upper Floor Windows */}
      <mesh position={[-2, 4, 2.98]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#cceeff" />
      </mesh>
      <mesh position={[2, 4, 2.98]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#cceeff" />
      </mesh>
    </group>
  );
};

const Ground: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#777" />
    </mesh>
  );
};

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
