import { useRef, useMemo, useState, useEffect, Suspense, lazy } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei'
import * as THREE from 'three'

// Detect if device is low-end (for performance optimization)
const isLowEndDevice = () => {
  if (typeof window === 'undefined') return false
  
  // Check for low memory
  const nav = navigator as Navigator & { deviceMemory?: number }
  if (nav.deviceMemory && nav.deviceMemory < 4) return true
  
  // Check for mobile or low-end hardware
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  return isMobile || prefersReducedMotion
}

function GlobeCore({ isLowEnd }: { isLowEnd: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const rotationSpeed = isLowEnd ? 0.001 : 0.002

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed
      if (!isLowEnd) {
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
      }
    }
    if (glowRef.current && !isLowEnd) {
      glowRef.current.rotation.y -= 0.001
    }
  })

  const gridTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    
    ctx.fillStyle = 'transparent'
    ctx.fillRect(0, 0, 512, 256)
    
    // Slightly reduced opacity for grid behind text
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)'
    ctx.lineWidth = 1

    for (let i = 0; i <= 512; i += 32) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, 256)
      ctx.stroke()
    }

    for (let i = 0; i <= 256; i += 32) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(512, i)
      ctx.stroke()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    return texture
  }, [])

  const floatSettings = isLowEnd 
    ? { speed: 1, rotationIntensity: 0.2, floatIntensity: 0.3 }
    : { speed: 2, rotationIntensity: 0.4, floatIntensity: 0.6 }

  return (
    <Float {...floatSettings}>
      <group>
        <Sphere ref={meshRef} args={[2, isLowEnd ? 32 : 64, isLowEnd ? 32 : 64]}>
          <meshStandardMaterial
            map={gridTexture}
            transparent
            opacity={0.85}
            color="#0e7490"
            emissive="#22d3ee"
            emissiveIntensity={0.12}
            roughness={0.3}
            metalness={0.7}
          />
        </Sphere>

        {!isLowEnd && (
          <Sphere ref={glowRef} args={[2.1, 32, 32]}>
            <MeshDistortMaterial
              color="#22d3ee"
              transparent
              opacity={0.12}
              distort={0.3}
              speed={2}
              roughness={0}
            />
          </Sphere>
        )}

        <Sphere args={[2.3, 16, 16]}>
          <meshBasicMaterial
            color="#a855f7"
            transparent
            opacity={0.04}
            side={THREE.BackSide}
          />
        </Sphere>
      </group>
    </Float>
  )
}

function Particles({ isLowEnd }: { isLowEnd: boolean }) {
  const count = isLowEnd ? 50 : 100
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 3 + Math.random() * 2
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return pos
  }, [count])

  const particlesRef = useRef<THREE.Points>(null)
  const rotationSpeed = isLowEnd ? 0.0002 : 0.0005

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += rotationSpeed
      if (!isLowEnd) {
        particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
      }
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#22d3ee"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  )
}

// Loading fallback for Suspense
function GlobeLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-16 h-16 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )
}

export function NewsGlobe() {
  const [isLowEnd, setIsLowEnd] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check device performance
    setIsLowEnd(isLowEndDevice())
    
    // Lazy load the canvas after initial render
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) {
    return <GlobeLoader />
  }

  return (
    <div className="absolute inset-0 opacity-75 pointer-events-none globe-container">
      <Suspense fallback={<GlobeLoader />}>
        <Canvas
          camera={{ position: [0, 0, 7], fov: 45 }}
          dpr={isLowEnd ? [1, 1.5] : [1, 2]}
          gl={{ 
            antialias: !isLowEnd, 
            alpha: true,
            powerPreference: isLowEnd ? 'low-power' : 'high-performance'
          }}
          frameloop={isLowEnd ? 'demand' : 'always'}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} color="#a855f7" intensity={0.5} />
          
          <GlobeCore isLowEnd={isLowEnd} />
          <Particles isLowEnd={isLowEnd} />
          <Stars radius={50} depth={50} count={isLowEnd ? 500 : 1000} factor={4} fade speed={isLowEnd ? 0.5 : 1} />
        </Canvas>
      </Suspense>
    </div>
  )
}
