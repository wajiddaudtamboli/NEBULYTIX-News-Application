import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei'
import * as THREE from 'three'

function GlobeCore() {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
    if (glowRef.current) {
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
    
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)'
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

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
      <group>
        <Sphere ref={meshRef} args={[2, 64, 64]}>
          <meshStandardMaterial
            map={gridTexture}
            transparent
            opacity={0.9}
            color="#0e7490"
            emissive="#22d3ee"
            emissiveIntensity={0.15}
            roughness={0.3}
            metalness={0.7}
          />
        </Sphere>

        <Sphere ref={glowRef} args={[2.1, 32, 32]}>
          <MeshDistortMaterial
            color="#22d3ee"
            transparent
            opacity={0.15}
            distort={0.3}
            speed={2}
            roughness={0}
          />
        </Sphere>

        <Sphere args={[2.3, 16, 16]}>
          <meshBasicMaterial
            color="#a855f7"
            transparent
            opacity={0.05}
            side={THREE.BackSide}
          />
        </Sphere>
      </group>
    </Float>
  )
}

function Particles() {
  const count = 100
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
  }, [])

  const particlesRef = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0005
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
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
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

export function NewsGlobe() {
  return (
    <div className="absolute inset-0 -z-10 opacity-70">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} color="#a855f7" intensity={0.5} />
        
        <GlobeCore />
        <Particles />
        <Stars radius={50} depth={50} count={1000} factor={4} fade speed={1} />
      </Canvas>
    </div>
  )
}
