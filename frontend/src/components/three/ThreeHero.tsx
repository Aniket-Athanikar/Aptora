"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function NeuralParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const { mouse, viewport } = useThree();

  const count = 1200;

  // Create random particles
  const [positions, originalPositions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const orig = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Create cluster positions around a central neural field
      const r = 2.5 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      orig[i * 3] = x;
      orig[i * 3 + 1] = y;
      orig[i * 3 + 2] = z;
    }

    return [pos, orig];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    const time = state.clock.getElapsedTime();

    // Map normalized mouse to three.js coordinates
    const targetX = (mouse.x * viewport.width) / 2;
    const targetY = (mouse.y * viewport.height) / 2;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      let px = posAttr.getX(i);
      let py = posAttr.getY(i);
      let pz = posAttr.getZ(i);

      // Original base coordinates
      const ox = originalPositions[idx];
      const oy = originalPositions[idx + 1];
      const oz = originalPositions[idx + 2];

      // Subtle float animation
      const floatX = Math.sin(time * 0.5 + ox) * 0.04;
      const floatY = Math.cos(time * 0.4 + oy) * 0.04;
      const floatZ = Math.sin(time * 0.6 + oz) * 0.04;

      const baseTargetX = ox + floatX;
      const baseTargetY = oy + floatY;
      const baseTargetZ = oz + floatZ;

      // Mouse repulsion calculations
      const dx = px - targetX;
      const dy = py - targetY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 2.0) {
        // Apply repulsion force inversely proportional to distance
        const force = (2.0 - dist) * 0.08;
        px += (dx / dist) * force;
        py += (dy / dist) * force;
      }

      // Smooth return to base positions
      px += (baseTargetX - px) * 0.06;
      py += (baseTargetY - py) * 0.06;
      pz += (baseTargetZ - pz) * 0.06;

      posAttr.setXYZ(i, px, py, pz);
    }
    posAttr.needsUpdate = true;

    // Rotate points group slowly
    pointsRef.current.rotation.y = time * 0.03;
    pointsRef.current.rotation.x = time * 0.015;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#8B5CF6"
        size={0.06}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function FloatingSpheres() {
  return (
    <>
      {[
        { pos: [-2, 1.5, 0], scale: 0.6 },
        { pos: [2.5, -1, 1], scale: 0.4 },
        { pos: [-1, -2, -1], scale: 0.3 },
      ].map((item, idx) => (
        <Float key={idx} speed={1.5} rotationIntensity={1.5} floatIntensity={1.5}>
          <mesh position={item.pos as [number, number, number]}>
            <sphereGeometry args={[item.scale, 32, 32]} />
            <meshPhysicalMaterial
              roughness={0.05}
              transmission={0.9}
              thickness={0.8}
              ior={1.5}
              clearcoat={1.0}
              clearcoatRoughness={0.1}
              color="#A855F7"
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

export default function ThreeHero() {
  return (
    <div className="w-full h-full relative min-h-[400px] lg:min-h-[550px]">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-8, -8, -8]} intensity={1} color="#6D4AFF" />
        <pointLight position={[8, 8, 8]} intensity={1.2} color="#4F46E5" />

        <NeuralParticles />
        <FloatingSpheres />
      </Canvas>
    </div>
  );
}
