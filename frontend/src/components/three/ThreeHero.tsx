"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

// Suppress THREE.Clock deprecation warnings from third-party libraries (e.g. R3F)
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      args[0] &&
      typeof args[0] === "string" &&
      (args[0].includes("THREE.Clock") || args[0].includes("ThreeHero.tsx"))
    ) {
      return;
    }
    originalWarn(...args);
  };
}

// Helper to create a high-quality radial glow texture dynamically
function useGlowTexture() {
  return useMemo(() => {
    if (typeof window === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.25, "rgba(139, 92, 246, 0.85)"); // violet-500
    grad.addColorStop(0.55, "rgba(99, 102, 241, 0.3)");   // indigo-500
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

function GlowingWavingGrid() {
  const pointsRef = useRef<THREE.Points>(null);
  const { mouse } = useThree();
  const glowTexture = useGlowTexture();

  // Grid dimensions
  const widthCount = 45;
  const depthCount = 45;
  const count = widthCount * depthCount;

  // Generate initial grid position coordinates
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spacing = 0.25;

    for (let i = 0; i < widthCount; i++) {
      for (let j = 0; j < depthCount; j++) {
        const index = (i * depthCount + j) * 3;
        // Center the grid around origin
        const x = (i - widthCount / 2) * spacing;
        const z = (j - depthCount / 2) * spacing;
        pos[index] = x;
        pos[index + 1] = 0; // Will be animated
        pos[index + 2] = z;
      }
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < widthCount; i++) {
      for (let j = 0; j < depthCount; j++) {
        const index = i * depthCount + j;
        const x = posAttr.getX(index);
        const z = posAttr.getZ(index);

        // Multi-frequency wave pattern for organic, natural waving motion
        const wave1 = Math.sin(x * 0.4 + time * 1.2) * 0.45;
        const wave2 = Math.cos(z * 0.35 + time * 1.0) * 0.45;
        const wave3 = Math.sin((x + z) * 0.2 + time * 0.8) * 0.3;

        // Interactive mouse height distortion
        const dx = x - mouse.x * 6;
        const dz = z - mouse.y * 6;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const mouseEffect = dist < 3.0 ? (3.0 - dist) * 0.35 : 0;

        posAttr.setY(index, wave1 + wave2 + wave3 + mouseEffect);
      }
    }
    posAttr.needsUpdate = true;

    // Gentle global rotation based on mouse or time
    pointsRef.current.rotation.y = time * 0.05 + mouse.x * 0.15;
    pointsRef.current.rotation.x = 0.3 + mouse.y * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      {glowTexture && (
        <pointsMaterial
          size={0.24}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          map={glowTexture}
        />
      )}
    </points>
  );
}

function FloatingGlassmorphicShapes() {
  return (
    <>
      {/* Central Ring / Torus */}
      <Float speed={2.0} rotationIntensity={1.8} floatIntensity={1.5}>
        <mesh position={[2.8, 1.2, -1]}>
          <torusGeometry args={[0.7, 0.22, 16, 100]} />
          <meshPhysicalMaterial
            roughness={0.1}
            transmission={0.95}
            thickness={1.2}
            ior={1.6}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            color="#A855F7"
            emissive="#6D4AFF"
            emissiveIntensity={0.3}
          />
        </mesh>
      </Float>

      {/* Modern Octahedron */}
      <Float speed={2.5} rotationIntensity={2.5} floatIntensity={2.0}>
        <mesh position={[-3.2, -0.8, 1]}>
          <octahedronGeometry args={[0.7, 0]} />
          <meshPhysicalMaterial
            roughness={0.05}
            transmission={0.9}
            thickness={1.5}
            ior={1.7}
            clearcoat={1.0}
            color="#06B6D4"
            emissive="#3B82F6"
            emissiveIntensity={0.4}
          />
        </mesh>
      </Float>

      {/* Floating sphere */}
      <Float speed={1.8} rotationIntensity={1.2} floatIntensity={1.2}>
        <mesh position={[-1.2, 2.0, -2]}>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshPhysicalMaterial
            roughness={0.15}
            transmission={0.9}
            thickness={0.8}
            ior={1.45}
            color="#EC4899"
            emissive="#A855F7"
            emissiveIntensity={0.25}
          />
        </mesh>
      </Float>
    </>
  );
}

let lastTime = typeof window !== "undefined" ? performance.now() / 1000 : 0;
const customClock = {
  getElapsedTime: () => (typeof window !== "undefined" ? performance.now() / 1000 : 0),
  getDelta: () => {
    if (typeof window === "undefined") return 0;
    const now = performance.now() / 1000;
    const delta = now - lastTime;
    lastTime = now;
    return delta;
  },
  start: () => {},
  stop: () => {},
} as any;

export default function ThreeHero() {
  return (
    <div className="w-full h-full relative min-h-[500px] lg:min-h-[650px] overflow-hidden">
      <Canvas camera={{ position: [0, 2.5, 7.5], fov: 45 }} clock={customClock}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[8, 12, 10]} intensity={2.0} color="#ffffff" />
        <pointLight position={[-10, 8, -5]} intensity={1.5} color="#8B5CF6" />
        <pointLight position={[10, -5, 5]} intensity={1.5} color="#06B6D4" />

        <GlowingWavingGrid />
        <FloatingGlassmorphicShapes />
      </Canvas>
    </div>
  );
}
