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
    grad.addColorStop(0.0, "rgba(61, 4, 4, 1)");
    grad.addColorStop(0.25, "rgba(16, 185, 129, 0.85)"); // emerald-500
    grad.addColorStop(0.55, "rgba(245, 158, 11, 0.3)");   // amber-500
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
      vec3 color = mix(vec3(0.06, 0.73, 0.51), vec3(0.96, 0.62, 0.04), (vY + 1.0) * 0.5);
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
      {/* 3D Stack of Books */}
      <Float speed={3.8} rotationIntensity={2.5} floatIntensity={2.0}>
        <group position={[2.8, 1.2, -0.5]} rotation={[0.4, -0.6, 0.2]}>
          {/* Bottom Book Cover */}
          <mesh position={[0, -0.15, 0]}>
            <boxGeometry args={[1.2, 1.5, 0.24]} />
            <meshStandardMaterial
              roughness={0.15}
              metalness={0.7}
              color="#1cdda6" // Deep emerald green cover
              emissive="#0ed39e"
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* Bottom Book Pages */}
          <mesh position={[0.02, -0.15, 0]}>
            <boxGeometry args={[1.12, 1.42, 0.2]} />
            <meshStandardMaterial
              roughness={0.3}
              metalness={0.1}
              color="#f8fafc" // White pages
            />
          </mesh>

          {/* Top Book Cover */}
          <mesh position={[0.05, 0.1, 0.05]} rotation={[0, 0, 0.15]}>
            <boxGeometry args={[1.05, 1.35, 0.2]} />
            <meshStandardMaterial
              roughness={0.1}
              metalness={0.5}
              color="#10b981" // Bright emerald green cover
              emissive="#0fc98e"
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* Paragraph Lines on Cover */}
          {[-0.3, -0.1, 0.1, 0.3].map((y, idx) => (
            <mesh key={idx} position={[0.05, 0.1 + y, 0.16]} rotation={[0, 0, 0.15]}>
              <boxGeometry args={[0.6, 0.03, 0.01]} />
              <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.5} />
            </mesh>
          ))}
          {/* Top Book Pages */}
          <mesh position={[0.07, 0.1, 0.05]} rotation={[0, 0, 0.15]}>
            <boxGeometry args={[0.97, 1.27, 0.16]} />
            <meshStandardMaterial
              roughness={0.3}
              metalness={0.1}
              color="#f8fafc" // White pages
            />
          </mesh>
        </group>
      </Float>

      {/* 3D Pen (Study Material) */}
      <Float speed={4.0} rotationIntensity={2.8} floatIntensity={2.2}>
        <group position={[0.6, 1.9, -0.8]} rotation={[-0.5, 0.3, 0.5]}>
          {/* Pen Body */}
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, 0.9, 8]} />
            <meshStandardMaterial
              roughness={0.1}
              metalness={0.8}
              color="#17e4aa" // Emerald Green Metal
              emissive="#0fdda6"
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* Pen Cap / Clip */}
          <mesh position={[0, 0.25, 0.05]}>
            <boxGeometry args={[0.02, 0.3, 0.06]} />
            <meshStandardMaterial roughness={0.1} metalness={0.9} color="#fbbf24" />
          </mesh>
          {/* Pen Metallic Tip */}
          <mesh position={[0, -0.48, 0]}>
            <coneGeometry args={[0.04, 0.12, 8]} />
            <meshStandardMaterial roughness={0.1} metalness={0.9} color="#fbbf24" />
          </mesh>
        </group>
      </Float>

      {/* 3D Eraser (Study Material) */}
      <Float speed={3.5} rotationIntensity={2.2} floatIntensity={1.8}>
        <group position={[-1.2, -1.6, 1.2]} rotation={[0.2, 0.8, -0.4]}>
          {/* Eraser Green Part */}
          <mesh position={[0, 0, -0.12]}>
            <boxGeometry args={[0.3, 0.16, 0.3]} />
            <meshStandardMaterial roughness={0.4} color="#10b981" />
          </mesh>
          {/* Eraser White Part */}
          <mesh position={[0, 0, 0.12]}>
            <boxGeometry args={[0.3, 0.16, 0.3]} />
            <meshStandardMaterial roughness={0.4} color="#f8fafc" />
          </mesh>
        </group>
      </Float>

      {/* 3D Sharpener (Study Material) */}
      <Float speed={3.7} rotationIntensity={2.4} floatIntensity={2.0}>
        <group position={[2.0, -0.2, 1.0]} rotation={[-0.3, -0.4, 0.6]}>
          {/* Sharpener Body */}
          <mesh>
            <boxGeometry args={[0.4, 0.25, 0.4]} />
            <meshStandardMaterial
              roughness={0.15}
              metalness={0.8}
              color="#d39a0b" // Gold / Brass sharpener body
            />
          </mesh>
          {/* Sharpener Blade */}
          <mesh position={[0, 0.13, 0]} rotation={[0, 0.2, 0]}>
            <boxGeometry args={[0.15, 0.02, 0.3]} />
            <meshStandardMaterial roughness={0.1} metalness={0.95} color="#e2e8f0" />
          </mesh>
        </group>
      </Float>

      {/* 3D Ruler / Scale (Left Side) */}
      <Float speed={3.5} rotationIntensity={2.2} floatIntensity={1.8}>
        <group position={[-3.2, 1.4, -0.5]} rotation={[0.2, 0.5, 0.3]}>
          {/* Ruler Board */}
          <mesh>
            <boxGeometry args={[0.18, 1.0, 0.02]} />
            <meshStandardMaterial
              roughness={0.1}
              metalness={0.8}
              color="#34d399" // Mint Emerald
              emissive="#059669"
              emissiveIntensity={0.3}
              transparent={true}
              opacity={0.9}
            />
          </mesh>
          {/* Ticks */}
          {[-0.4, -0.2, 0, 0.2, 0.4].map((y, idx) => (
            <mesh key={idx} position={[0.06, y, 0.015]}>
              <boxGeometry args={[0.06, 0.015, 0.005]} />
              <meshStandardMaterial roughness={0.1} metalness={0.9} color="#fbbf24" />
            </mesh>
          ))}
        </group>
      </Float>

      {/* 3D Degree Scroll */}
      <Float speed={3.6} rotationIntensity={2.5} floatIntensity={1.8}>
        <group position={[-2.2, 0.6, -0.2]} rotation={[0.5, -0.4, 0.6]}>
          {/* Rolled Paper Cylinder */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
            <meshStandardMaterial roughness={0.4} color="#f8fafc" />
          </mesh>
          {/* Ribbon around middle */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.11, 0.11, 0.12, 16]} />
            <meshStandardMaterial
              roughness={0.1}
              metalness={0.7}
              color="#ef4444" // Crimson red ribbon
              emissive="#b91c1c"
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>
      </Float>

      {/* 3D Goal Achiever (Medal) */}
      <Float speed={4.2} rotationIntensity={2.8} floatIntensity={2.0}>
        <group position={[0.8, 0.8, 1.2]} rotation={[-0.1, 0.3, 0.2]}>
          {/* Gold Medal Rim */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.06, 32]} />
            <meshStandardMaterial roughness={0.15} metalness={0.9} color="#fbbf24" />
          </mesh>
          {/* Ribbon Backing */}
          <mesh position={[-0.1, -0.3, -0.04]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.12, 0.4, 0.02]} />
            <meshStandardMaterial roughness={0.3} color="#10b981" />
          </mesh>
          <mesh position={[0.1, -0.3, -0.04]} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[0.12, 0.4, 0.02]} />
            <meshStandardMaterial roughness={0.3} color="#047857" />
          </mesh>
        </group>
      </Float>

      {/* 3D Graduation Gown/Uniform */}
      <Float speed={3.2} rotationIntensity={2.2} floatIntensity={1.6}>
        <group position={[0.0, -1.4, -0.5]} rotation={[0.1, -0.3, 0.0]}>
          {/* Body/Gown Coat */}
          <mesh>
            <coneGeometry args={[0.35, 0.7, 4]} />
            <meshStandardMaterial
              roughness={0.2}
              metalness={0.4}
              color="#047857" // Emerald Gown Body
              emissive="#064e3b"
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* V-Neck Collar */}
          <mesh position={[0, 0.25, 0.12]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.18, 0.25, 0.05]} />
            <meshStandardMaterial roughness={0.1} metalness={0.8} color="#fbbf24" />
          </mesh>
        </group>
      </Float>

      {/* 3D Graduation Cap */}
      <Float speed={3.4} rotationIntensity={3.0} floatIntensity={2.2}>
        <group position={[-2.8, -0.4, 0.5]} rotation={[0.3, 0.4, -0.2]}>
          {/* Cap Top (Flat Board) */}
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[1.2, 0.04, 1.2]} />
            <meshStandardMaterial
              roughness={0.1}
              metalness={0.6}
              color="#10b981" // Premium Emerald
              emissive="#065f46"
              emissiveIntensity={0.4}
            />
          </mesh>
          {/* Cap Base (Cylinder) */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.38, 0.42, 0.32, 32]} />
            <meshStandardMaterial
              roughness={0.1}
              metalness={0.7}
              color="#047857" // Deep emerald green
              emissive="#064e3b"
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* Gold Tassel Button */}
          <mesh position={[0, 0.23, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial
              roughness={0.1}
              metalness={0.8}
              color="#fbbf24" // Gold button
            />
          </mesh>
        </group>
      </Float>

      {/* Left Side: 3D UPSC Book 1 (Individual, Fast Floating) */}
      <Float speed={4.5} rotationIntensity={3.5} floatIntensity={2.5}>
        <group position={[-3.2, -1.3, 0.4]} rotation={[0.4, 0.6, -0.3]}>
          <mesh>
            <boxGeometry args={[1.2, 1.5, 0.24]} />
            <meshStandardMaterial
              roughness={0.15}
              metalness={0.7}
              color="#1cdda6" // Bright teal/emerald green
              emissive="#0ed39e"
              emissiveIntensity={0.3}
            />
          </mesh>
          <mesh position={[0.02, 0, 0]}>
            <boxGeometry args={[1.12, 1.42, 0.2]} />
            <meshStandardMaterial
              roughness={0.3}
              metalness={0.1}
              color="#f8fafc" // White pages
            />
          </mesh>
          {/* Paragraph Lines on Cover */}
          {[-0.3, -0.1, 0.1, 0.3].map((y, idx) => (
            <mesh key={idx} position={[0, y, 0.13]}>
              <boxGeometry args={[0.6, 0.03, 0.01]} />
              <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.5} />
            </mesh>
          ))}
        </group>
      </Float>

      {/* Left Side: 3D UPSC Book 2 (Individual, Fast Floating) */}
      <Float speed={4.8} rotationIntensity={3.8} floatIntensity={2.8}>
        <group position={[-2.2, -0.7, -0.6]} rotation={[-0.2, 0.4, 0.2]}>
          <mesh>
            <boxGeometry args={[1.1, 1.4, 0.22]} />
            <meshStandardMaterial
              roughness={0.1}
              metalness={0.6}
              color="#17e4aa" // Glowing emerald green
              emissive="#0fdda6"
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* Paragraph Lines on Cover */}
          {[-0.25, -0.05, 0.15].map((y, idx) => (
            <mesh key={idx} position={[0, y, 0.12]}>
              <boxGeometry args={[0.55, 0.03, 0.01]} />
              <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.5} />
            </mesh>
          ))}
          <mesh position={[0.02, 0, 0]}>
            <boxGeometry args={[1.02, 1.32, 0.18]} />
            <meshStandardMaterial
              roughness={0.3}
              metalness={0.1}
              color="#f8fafc" // White pages
            />
          </mesh>
        </group>
      </Float>

      {/* Left Side: 3D UPSC Book 3 (Individual, Fast Floating) */}
      <Float speed={5.2} rotationIntensity={4.2} floatIntensity={3.0}>
        <group position={[-2.9, 0.2, 0.8]} rotation={[0.3, -0.3, 0.5]}>
          <mesh>
            <boxGeometry args={[1.0, 1.3, 0.2]} />
            <meshStandardMaterial
              roughness={0.1}
              metalness={0.8}
              color="#0fc98e" // Minty glow book
              emissive="#069669"
              emissiveIntensity={0.25}
            />
          </mesh>
          {/* Paragraph Lines on Cover */}
          {[-0.2, 0.0, 0.2].map((y, idx) => (
            <mesh key={idx} position={[0, y, 0.11]}>
              <boxGeometry args={[0.5, 0.03, 0.01]} />
              <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.5} />
            </mesh>
          ))}
          <mesh position={[0.02, 0, 0]}>
            <boxGeometry args={[0.92, 1.22, 0.16]} />
            <meshStandardMaterial
              roughness={0.3}
              metalness={0.1}
              color="#f8fafc" // White pages
            />
          </mesh>
        </group>
      </Float>

      {/* 3D Pencil (Study Material) */}
      <Float speed={3.6} rotationIntensity={2.5} floatIntensity={1.8}>
        <group position={[-1.5, 1.5, 0.5]} rotation={[0.4, 0.5, -0.8]}>
          {/* Pencil Body */}
          <mesh>
            <cylinderGeometry args={[0.07, 0.07, 0.8, 6]} />
            <meshStandardMaterial
              roughness={0.1}
              metalness={0.6}
              color="#10b981" // Emerald body
              emissive="#047857"
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* Pencil Tip (Wood Cone) */}
          <mesh position={[0, 0.5, 0]}>
            <coneGeometry args={[0.07, 0.2, 6]} />
            <meshStandardMaterial roughness={0.5} color="#fed7aa" />
          </mesh>
          {/* Pencil Eraser/Band */}
          <mesh position={[0, -0.45, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.1, 6]} />
            <meshStandardMaterial metalness={0.8} roughness={0.2} color="#fbbf24" />
          </mesh>
        </group>
      </Float>

      {/* 3D Success "A+" Shield / Badge */}
      <Float speed={4.0} rotationIntensity={2.4} floatIntensity={2.4}>
        <group position={[1.8, -1.2, 1.2]} rotation={[-0.2, -0.5, 0.1]}>
          {/* Shield Base */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.12, 6, 1]} />
            <meshStandardMaterial
              roughness={0.1}
              metalness={0.7}
              color="#0284c7" // Sky blue border shield
              emissive="#0369a1"
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* Inner Badge Core */}
          <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.1, 6, 1]} />
            <meshStandardMaterial
              roughness={0.2}
              metalness={0.2}
              color="#ffffff" // White face
            />
          </mesh>
        </group>
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
        <ambientLight intensity={0.65} />
        <directionalLight position={[10, 15, 10]} intensity={2.4} color="#ffffff" />
        <pointLight position={[-8, 10, -5]} intensity={2.2} color="#10B981" />
        <pointLight position={[8, -5, 5]} intensity={2.2} color="#06B6D4" />

        <GlowingWavingGrid />
        <FloatingGlassmorphicShapes />
      </Canvas>
    </div>
  );
}