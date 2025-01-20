import { useEffect, useRef, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';

interface Unit {
  id: number;
  name: string;
  area: string;
  bedrooms: number;
}

const DigitalTwinViewer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Babylon Scene
    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = new BABYLON.Scene(engine);

    // Setup camera
    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      0,
      Math.PI / 3,
      20,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.attachControl(canvasRef.current, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 50;

    // Add lighting
    new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

    // Create building units
    const units = [];
    for (let i = 0; i < 5; i++) {
      const unit = BABYLON.MeshBuilder.CreateBox(
        `unit${i}`,
        { width: 4, height: 6, depth: 8 },
        scene
      );
      unit.position.x = i * 5;

      // Material with hover effect
      const material = new BABYLON.StandardMaterial(`unitMaterial${i}`, scene);
      material.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
      unit.material = material;

      // Interaction events
      unit.actionManager = new BABYLON.ActionManager(scene);
      unit.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPointerOverTrigger,
          () => {
            material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
          }
        )
      );
      unit.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPointerOutTrigger,
          () => {
            material.emissiveColor = new BABYLON.Color3(0, 0, 0);
          }
        )
      );
      unit.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            setSelectedUnit({
              id: i,
              name: `Villa ${i + 1}`,
              area: `${270 + i * 10} sqm`,
              bedrooms: 6 + i,
            });
          }
        )
      );

      units.push(unit);
    }

    // Ground;
    // const ground = BABYLON.MeshBuilder.CreateGround(
    //   'ground',
    //   { width: 50, height: 30 },
    //   scene
    // );
    // const groundMaterial = new BABYLON.StandardMaterial('groundMat', scene);
    // groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    // ground.material = groundMaterial;

    // Render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle resize
    window.addEventListener('resize', () => {
      engine.resize();
    });

    return () => {
      engine.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      <canvas ref={canvasRef} className="w-full h-full" />

      {selectedUnit && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2">{selectedUnit.name}</h2>
          <div className="space-y-2">
            <p>Area: {selectedUnit.area}</p>
            <p>Bedrooms: {selectedUnit.bedrooms}</p>
            <div className="flex gap-2 mt-4">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Floorplan
              </button>
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                360° Tour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalTwinViewer;
