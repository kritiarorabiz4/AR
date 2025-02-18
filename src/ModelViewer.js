import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
}

function ModelViewer() {
  return (
    <Canvas style={{ width: "100vw", height: "100vh" }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <Suspense fallback={null}>
        <Model url="/models/model.glb" />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}

export default ModelViewer;