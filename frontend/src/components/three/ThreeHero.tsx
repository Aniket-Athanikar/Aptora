"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = function (...args) {
    if (
      args[0] &&
      typeof args[0] === "string" &&
      (args[0].includes("THREE.Clock") || args[0].includes("Skipping auto-scroll") || args[0].includes("WebGLRenderer"))
    ) {
      return;
    }
    originalWarn.apply(console, args);
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

// GPU Shader configuration for fast rendering
const WaveShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uTexture: { value: null as THREE.Texture | null },
  },
  vertexShader: `
    uniform float uTime;
    uniform vec2 uMouse;
    varying float vY;
    void main() {
      vec3 pos = position;
      
      // Compute sine/cosine waves on GPU in parallel
      float wave1 = sin(pos.x * 0.4 + uTime * 1.2) * 0.45;
      float wave2 = cos(pos.z * 0.35 + uTime * 1.0) * 0.45;
      float wave3 = sin((pos.x + pos.z) * 0.2 + uTime * 0.8) * 0.3;
      
      float dx = pos.x - uMouse.x * 6.0;
      float dz = pos.z - uMouse.y * 6.0;
      float distSq = dx * dx + dz * dz;
      float mouseEffect = 0.0;
      if (distSq < 9.0) {
        mouseEffect = (3.0 - sqrt(distSq)) * 0.35;
      }
      
      pos.y = wave1 + wave2 + wave3 + mouseEffect;
      vY = pos.y;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = 12.0 / -mvPosition.z;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    varying float vY;
    void main() {
      vec4 texColor = texture2D(uTexture, gl_PointCoord);
      if (texColor.a < 0.1) discard;
      vec3 color = mix(vec3(0.54, 0.36, 1.0), vec3(0.38, 0.4, 0.94), (vY + 1.0) * 0.5);
      gl_FragColor = vec4(color, texColor.a * 0.9);
    }
  `
};

function GlowingWavingGrid() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { mouse } = useThree();
  const glowTexture = useGlowTexture();

  // Dispose texture on unmount to prevent GPU memory leaks
  useEffect(() => {
    return () => {
      if (glowTexture) {
        glowTexture.dispose();
      }
    };
  }, [glowTexture]);

  // Grid dimensions
  const widthCount = 25;
  const depthCount = 25;
  const count = widthCount * depthCount;

  // Generate initial grid position coordinates (static on CPU)
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spacing = 0.45;

    for (let i = 0; i < widthCount; i++) {
      for (let j = 0; j < depthCount; j++) {
        const index = (i * depthCount + j) * 3;
        const x = (i - widthCount / 2) * spacing;
        const z = (j - depthCount / 2) * spacing;
        pos[index] = x;
        pos[index + 1] = 0;
        pos[index + 2] = z;
      }
    }
    return pos;
  }, [count]);

  // Bind the dynamically loaded texture to the shader uniforms
  useEffect(() => {
    if (materialRef.current && glowTexture) {
      materialRef.current.uniforms.uTexture.value = glowTexture;
    }
  }, [glowTexture]);

  // Update uniforms and rotation (zero positions calculation on CPU)
  useFrame((state) => {
    const time = performance.now() * 0.001;
    
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uMouse.value.set(mouse.x, mouse.y);
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.05 + mouse.x * 0.15;
      pointsRef.current.rotation.x = 0.3 + mouse.y * 0.1;
    }
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
        <shaderMaterial
          ref={materialRef}
          args={[WaveShader]}
          transparent={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
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
          <meshStandardMaterial
            roughness={0.2}
            metalness={0.1}
            color="#A855F7"
            emissive="#6D4AFF"
            emissiveIntensity={0.5}
          />
        </mesh>
      </Float>

      {/* Modern Octahedron */}
      <Float speed={2.5} rotationIntensity={2.5} floatIntensity={2.0}>
        <mesh position={[-3.2, -0.8, 1]}>
          <octahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial
            roughness={0.1}
            metalness={0.2}
            color="#06B6D4"
            emissive="#3B82F6"
            emissiveIntensity={0.6}
          />
        </mesh>
      </Float>

      {/* Floating sphere */}
      <Float speed={1.8} rotationIntensity={1.2} floatIntensity={1.2}>
        <mesh position={[-1.2, 2.0, -2]}>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshStandardMaterial
            roughness={0.25}
            metalness={0.1}
            color="#EC4899"
            emissive="#A855F7"
            emissiveIntensity={0.4}
          />
        </mesh>
      </Float>
    </>
  );
}

function WebGLCleaner() {
  const { gl } = useThree();
  useEffect(() => {
    return () => {
      // Force immediate WebGL context loss to free browser GPU resources on unmount/HMR
      gl.dispose();
      const extension = gl.getContext().getExtension("WEBGL_lose_context");
      if (extension) {
        extension.loseContext();
      }
    };
  }, [gl]);
  return null;
}

export default function ThreeHero() {
  return (
    <div className="w-full h-full relative min-h-[500px] lg:min-h-[650px] overflow-hidden">
      <Canvas
        flat
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          alpha: true,
          stencil: false,
          depth: false,
        }}
        camera={{ position: [0, 2.5, 7.5], fov: 45 }}
      >
        <WebGLCleaner />
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
