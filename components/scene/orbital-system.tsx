// @ts-nocheck
"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Billboard, Text } from "@react-three/drei"
import * as THREE from "three"
import { scrollStore, rangeProgress } from "@/lib/experience-store"

type Props = {
  isDark: boolean
  reducedMotion: boolean
  quality: "low" | "high"
}

// 5 Realistic 3D Elliptical Orbit Paths with distinct radii, eccentricity, 3D tilt, and harmonic speeds.
export interface EllipticalRingDef {
  semiMajor: number // a (horizontal axis)
  semiMinor: number // b (vertical axis)
  euler: [number, number, number] // 3D spatial inclination tilt
  speedRatio: number // Keplerian differential orbital velocity
  strokeOpacity: number
}

const RINGS: EllipticalRingDef[] = [
  { semiMajor: 1.32, semiMinor: 1.10, euler: [0.38, 0.22, -0.15], speedRatio: 1.35, strokeOpacity: 0.72 },
  { semiMajor: 1.72, semiMinor: 1.45, euler: [-0.30, 0.40, 0.20], speedRatio: 1.05, strokeOpacity: 0.65 },
  { semiMajor: 2.12, semiMinor: 1.78, euler: [0.26, -0.34, 0.36], speedRatio: 0.82, strokeOpacity: 0.58 },
  { semiMajor: 2.52, semiMinor: 2.14, euler: [-0.20, -0.24, -0.28], speedRatio: 0.64, strokeOpacity: 0.50 },
  { semiMajor: 2.92, semiMinor: 2.48, euler: [0.18, 0.44, -0.22], speedRatio: 0.48, strokeOpacity: 0.38 },
]

export interface NodeDef {
  label: string
  ring: number
  phase: number // Angular offset along the ellipse (0 to 2*PI)
  highlight?: boolean
  emerge?: boolean
}

// Learning-topic nodes revolving around the AI central intelligence
const NODES: NodeDef[] = [
  { label: "HTML", ring: 0, phase: 0.35 },
  { label: "AI", ring: 0, phase: 3.45 },
  { label: "CSS", ring: 1, phase: 1.25 },
  { label: "Next.js", ring: 1, phase: 4.60 },
  { label: "JavaScript", ring: 2, phase: 2.20, highlight: true },
  { label: "APIs", ring: 2, phase: 5.30 },
  { label: "React", ring: 3, phase: 3.85 },
  { label: "Async JS", ring: 3, phase: 0.95, emerge: true },
]

// Ambient data particles count per ring for living universe effect
const PARTICLES_PER_RING = [5, 6, 7, 7, 8]

// Base orbital rotation speed
const BASE_ORBITAL_SPEED = 0.024

// Pre-create soft radial glow canvas texture for node coronas
function createGlowTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null
  const canvas = document.createElement("canvas")
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, "rgba(220, 205, 255, 1.0)")
  gradient.addColorStop(0.25, "rgba(165, 130, 255, 0.75)")
  gradient.addColorStop(0.55, "rgba(130, 95, 240, 0.30)")
  gradient.addColorStop(1, "rgba(130, 95, 240, 0.0)")

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}

function EllipticalTrack({
  ring,
  isDark,
}: {
  ring: EllipticalRingDef
  isDark: boolean
}) {
  const lineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = []
    const segments = 192
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2
      const x = ring.semiMajor * Math.cos(theta)
      const y = ring.semiMinor * Math.sin(theta)
      points.push(new THREE.Vector3(x, y, 0))
    }
    const geom = new THREE.BufferGeometry().setFromPoints(points)
    return geom
  }, [ring.semiMajor, ring.semiMinor])

  // Elegant lavender/purple stroke with theme-tailored contrast
  const strokeColor = isDark ? "#A790F8" : "#7252D8"
  const opacity = isDark ? ring.strokeOpacity * 0.72 : ring.strokeOpacity * 0.90

  return (
    <lineLoop geometry={lineGeometry}>
      <lineBasicMaterial
        color={strokeColor}
        transparent
        opacity={opacity}
        linewidth={1}
      />
    </lineLoop>
  )
}

function NodeParticleTrail({
  ring,
  currentAngle,
  isDark,
  emerged,
}: {
  ring: EllipticalRingDef
  currentAngle: number
  isDark: boolean
  emerged: number
}) {
  const trailDots = [1, 2, 3]
  const trailColor = isDark ? "#D4C8FC" : "#8A6CE8"

  return (
    <group>
      {trailDots.map((dotIdx) => {
        const lagAngle = currentAngle - dotIdx * 0.065
        const tx = ring.semiMajor * Math.cos(lagAngle)
        const ty = ring.semiMinor * Math.sin(lagAngle)
        const alpha = ((4 - dotIdx) / 4) * 0.45 * emerged
        const size = (0.022 - dotIdx * 0.004) * emerged

        return (
          <mesh key={dotIdx} position={[tx, ty, 0]}>
            <sphereGeometry args={[size, 12, 12]} />
            <meshBasicMaterial
              color={trailColor}
              transparent
              opacity={alpha}
              depthWrite={false}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function OrbNode({
  def,
  isDark,
  time,
  glowTexture,
}: {
  def: NodeDef
  isDark: boolean
  time: number
  glowTexture: THREE.CanvasTexture | null
}) {
  const ring = RINGS[def.ring]
  const groupRef = useRef<THREE.Group>(null)
  const holder = useRef<THREE.Group>(null)
  const labelGroup = useRef<THREE.Group>(null)
  const coreMesh = useRef<THREE.Mesh>(null)
  const coreMat = useRef<THREE.MeshBasicMaterial>(null)
  const glowMesh = useRef<THREE.Mesh>(null)
  const glowMat = useRef<THREE.MeshBasicMaterial>(null)
  const connectionLineRef = useRef<THREE.LineSegments>(null)

  const nodeColor = "#A486F7"
  const highlightHotColor = isDark ? "#FFFFFF" : "#5B3BD4"
  const textColor = isDark ? "#F8F7FD" : "#13101C"
  const outlineColor = isDark ? "#0A0812" : "#F7F5FC"

  const connectionGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    const positions = new Float32Array(6) // [0,0,0, x,y,z]
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return geom
  }, [])

  useFrame((_, delta) => {
    const p = scrollStore.get()

    // 1. Emergence state for "Async JS" (Scene 3.5 adaptation: 0.68 to 0.82)
    const emerged = def.emerge ? rangeProgress(p, 0.68, 0.82) : 1

    if (groupRef.current) {
      if (def.emerge) {
        if (emerged <= 0.001) {
          groupRef.current.visible = false
          return
        }
        groupRef.current.visible = true
        groupRef.current.scale.setScalar(emerged)
      } else {
        groupRef.current.visible = true
      }
    }

    // 2. Continuous Elliptical Orbit Motion
    const currentAngle = time * ring.speedRatio * BASE_ORBITAL_SPEED + def.phase
    const cosA = Math.cos(currentAngle)
    const sinA = Math.sin(currentAngle)
    const localX = ring.semiMajor * cosA
    const localY = ring.semiMinor * sinA

    if (holder.current) {
      holder.current.position.set(localX, localY, 0)
    }

    // 3. 3D Depth Calculation: Rotate point by ring's Euler to determine world-Z depth
    const euler = new THREE.Euler(...ring.euler)
    const localVec = new THREE.Vector3(localX, localY, 0).applyEuler(euler)
    const zDepth = localVec.z // Z coordinate in space

    // Depth scaling: nodes closer to camera (z > 0) are larger & brighter; behind (z < 0) are smaller & dimmer
    const depthScale = THREE.MathUtils.clamp(1.0 + zDepth * 0.18, 0.80, 1.22)
    const depthOpacity = THREE.MathUtils.clamp(1.0 + zDepth * 0.22, 0.60, 1.0)

    // 4. Highlight state during Scene 3 (JavaScript knowledge gap detection)
    const gap = def.highlight ? rangeProgress(p, 0.44, 0.62) * (1 - rangeProgress(p, 0.66, 0.78)) : 0

    if (coreMesh.current) {
      const targetScale = depthScale * (1 + gap * 0.55) * emerged
      coreMesh.current.scale.setScalar(
        coreMesh.current.scale.x + (targetScale - coreMesh.current.scale.x) * Math.min(1, delta * 6)
      )
    }

    if (coreMat.current) {
      coreMat.current.color.set(gap > 0.3 ? highlightHotColor : nodeColor)
      coreMat.current.opacity = (def.emerge ? emerged : 1) * depthOpacity
    }

    if (glowMesh.current) {
      const glowScale = depthScale * (1.2 + gap * 0.8) * emerged
      glowMesh.current.scale.setScalar(glowScale)
    }

    if (glowMat.current) {
      glowMat.current.opacity = (isDark ? 0.68 : 0.48) * depthOpacity * emerged
    }

    // 5. Clean outward billboard offset for typography — always stays crisp and upright
    if (labelGroup.current) {
      // Outward normal vector on ellipse: (semiMinor * cosA, semiMajor * sinA) normalized
      const nx = ring.semiMinor * cosA
      const ny = ring.semiMajor * sinA
      const len = Math.sqrt(nx * nx + ny * ny) || 1
      const outwardDist = 0.20 * depthScale

      labelGroup.current.position.set((nx / len) * outwardDist, (ny / len) * outwardDist + 0.02, 0)
    }

    // 6. Dynamic neural connection line to central core during Scene 2 (goal mapping) and Scene 4
    if (connectionLineRef.current) {
      const connect = Math.max(rangeProgress(p, 0.18, 0.34), rangeProgress(p, 0.88, 0.98))
      const lineMat = connectionLineRef.current.material as THREE.LineBasicMaterial
      lineMat.opacity = connect * (isDark ? 0.38 : 0.26) * emerged
      
      const posAttr = connectionGeometry.attributes.position as THREE.BufferAttribute
      if (posAttr) {
        posAttr.setXYZ(0, 0, 0, 0)
        posAttr.setXYZ(1, localX, localY, 0)
        posAttr.needsUpdate = true
      }
    }
  })

  // Emergence factor for trail calculation
  const p = scrollStore.get()
  const emerged = def.emerge ? rangeProgress(p, 0.68, 0.82) : 1
  const currentAngle = time * ring.speedRatio * BASE_ORBITAL_SPEED + def.phase

  return (
    <group ref={groupRef} visible={!def.emerge}>
      {/* Dynamic connection ray to center */}
      <lineSegments ref={connectionLineRef} geometry={connectionGeometry}>
        <lineBasicMaterial
          color={nodeColor}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </lineSegments>

      {/* Subtle particle trail behind the moving node */}
      <NodeParticleTrail
        ring={ring}
        currentAngle={currentAngle}
        isDark={isDark}
        emerged={emerged}
      />

      {/* Main Node Orb + Halo + Billboard Label */}
      <group ref={holder}>
        {/* Soft luminous billboard aura */}
        {glowTexture && (
          <Billboard follow={true}>
            <mesh ref={glowMesh}>
              <planeGeometry args={[0.26, 0.26]} />
              <meshBasicMaterial
                ref={glowMat}
                map={glowTexture}
                transparent
                opacity={isDark ? 0.68 : 0.48}
                depthWrite={false}
              />
            </mesh>
          </Billboard>
        )}

        {/* 3D Core Sphere Dot */}
        <mesh ref={coreMesh}>
          <sphereGeometry args={[0.046, 24, 24]} />
          <meshBasicMaterial
            ref={coreMat}
            color={nodeColor}
            transparent
            opacity={0.98}
          />
        </mesh>

        {/* Clean floating label — upright typography */}
        <group ref={labelGroup}>
          <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
            <Text
              position={[0, 0, 0]}
              fontSize={0.082}
              color={textColor}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.007}
              outlineColor={outlineColor}
              letterSpacing={0.025}
              fontWeight={500}
            >
              {def.label}
            </Text>
          </Billboard>
        </group>
      </group>
    </group>
  )
}

function AmbientCosmicParticles({
  ring,
  ringIndex,
  isDark,
  time,
}: {
  ring: EllipticalRingDef
  ringIndex: number
  isDark: boolean
  time: number
}) {
  const particleCount = PARTICLES_PER_RING[ringIndex] || 6
  const particleColor = isDark ? "#D8CCFC" : "#8362E8"

  const particleOffsets = useMemo(() => {
    const offsets: { phase: number; speedOffset: number; size: number; baseAlpha: number }[] = []
    for (let i = 0; i < particleCount; i++) {
      offsets.push({
        phase: (i / particleCount) * Math.PI * 2 + (ringIndex * 0.7),
        speedOffset: 0.85 + (i % 3) * 0.15,
        size: 0.016 + (i % 2) * 0.006,
        baseAlpha: 0.30 + (i % 4) * 0.14,
      })
    }
    return offsets
  }, [particleCount, ringIndex])

  return (
    <group>
      {particleOffsets.map((p, idx) => {
        const angle = time * ring.speedRatio * BASE_ORBITAL_SPEED * p.speedOffset + p.phase
        const x = ring.semiMajor * Math.cos(angle)
        const y = ring.semiMinor * Math.sin(angle)
        // Subtle twinkling pulse
        const twinkle = Math.sin(time * 2.5 + idx) * 0.18
        const alpha = THREE.MathUtils.clamp(p.baseAlpha + twinkle, 0.12, 0.65) * (isDark ? 0.85 : 0.65)

        return (
          <mesh key={idx} position={[x, y, 0]}>
            <sphereGeometry args={[p.size, 12, 12]} />
            <meshBasicMaterial
              color={particleColor}
              transparent
              opacity={alpha}
              depthWrite={false}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function EllipticalOrbitSystemRing({
  ring,
  ringIndex,
  isDark,
  time,
  glowTexture,
}: {
  ring: EllipticalRingDef
  ringIndex: number
  isDark: boolean
  time: number
  glowTexture: THREE.CanvasTexture | null
}) {
  const nodesForRing = NODES.filter((n) => n.ring === ringIndex)

  return (
    <group rotation={ring.euler}>
      {/* 1. Thin elegant 3D elliptical track line */}
      <EllipticalTrack ring={ring} isDark={isDark} />

      {/* 2. Micro cosmic ambient energy particles */}
      <AmbientCosmicParticles
        ring={ring}
        ringIndex={ringIndex}
        isDark={isDark}
        time={time}
      />

      {/* 3. Learning-Topic Nodes traversing this orbit */}
      {nodesForRing.map((node) => (
        <OrbNode
          key={node.label}
          def={node}
          isDark={isDark}
          time={time}
          glowTexture={glowTexture}
        />
      ))}
    </group>
  )
}

export function OrbitalSystem({ isDark, reducedMotion }: Props) {
  const timeRef = useRef(0)
  const glowTexture = useMemo(() => createGlowTexture(), [])

  useFrame((_, delta) => {
    if (!reducedMotion) {
      timeRef.current += delta * 60 // normalized frames
    }
  })

  return (
    <group>
      {RINGS.map((ring, idx) => (
        <EllipticalOrbitSystemRing
          key={idx}
          ring={ring}
          ringIndex={idx}
          isDark={isDark}
          time={reducedMotion ? 0 : timeRef.current}
          glowTexture={glowTexture}
        />
      ))}
    </group>
  )
}
