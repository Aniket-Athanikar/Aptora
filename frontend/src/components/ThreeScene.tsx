"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, MeshDistortMaterial, Float } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

function InteractiveShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Animate shape rotation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
    }
  });

  return (
    <mesh
      ref={meshRef}
      scale={clicked ? 1.5 : 1.2}
      onClick={() => setClicked(!clicked)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <icosahedronGeometry args={[1.5, 3]} />
      <MeshDistortMaterial
        color={hovered ? "#00f0ff" : "#8000ff"}
        attach="material"
        distort={0.4}
        speed={3}
        roughness={0.1}
        metalness={0.9}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

export default function ThreeScene() {
  return (
    <div className="w-full h-[400px] md:h-[600px] relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <pointLight position={[-10, -10, -5]} intensity={1} />
        <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={2} />
        
        <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
          <InteractiveShape />
        </Float>
        
        <OrbitControls enableZoom={false} autoRotate={false} />
      </Canvas>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-xs text-neutral-300 pointer-events-none select-none text-center">
        Hover to distort • Click to scale • Drag to orbit
      </div>
    </div>
  );
}
