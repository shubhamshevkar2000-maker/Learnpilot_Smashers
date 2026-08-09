"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Billboard, Text, Line } from "@react-three/drei"
import * as THREE from "three"
import { scrollStore, rangeProgress } from "@/lib/experience-store"

type Props = {
  isDark: boolean
  reducedMotion: boolean
  quality: "low" | "high"
}

// 4 balanced orbital rings centered around the solid lavender circle (radius 0.80).
// Scaled proportionally to maintain safe 10%+ margins on all desktop viewports.
const RINGS = [
  { radius: 1.28, euler: [0.30, 0.16, -0.12] as const },
  { radius: 1.62, euler: [-0.24, 0.32, 0.18] as const },
  { radius: 1.96, euler: [0.20, -0.28, 0.34] as const },
  { radius: 2.30, euler: [-0.16, -0.20, -0.22] as const },
]

type NodeDef = {
  label: string
  ring: number
  phase: number // Fixed angular offset around the orbit
  highlight?: boolean
  emerge?: boolean
}

// 7 primary learning nodes on hero. Async JS emerges only during scroll adaptation scene.
const NODES: NodeDef[] = [
  { label: "HTML", ring: 0, phase: 0.05 },
  { label: "CSS", ring: 1, phase: 0.95 },
  { label: "AI", ring: 0, phase: 2.05 },
  { label: "APIs", ring: 2, phase: 2.85 },
  { label: "React", ring: 3, phase: 3.65 },
  { label: "Next.js", ring: 1, phase: 4.55 },
  { label: "JavaScript", ring: 2, phase: 5.35, highlight: true },
  { label: "Async JS", ring: 3, phase: 2.1, emerge: true },
]

// Very slow, gentle orbital rotation
const ORBITAL_SPEED = 0.016

function OrbNode({
  def,
  isDark,
  orbitAngle,
}: {
  def: NodeDef
  isDark: boolean
  orbitAngle: number
}) {
  const ring = RINGS[def.ring]
  const groupRef = useRef<THREE.Group>(null)
  const holder = useRef<THREE.Group>(null)
  const labelGroup = useRef<THREE.Group>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const lineRef = useRef<any>(null)

  // Solid lavender node dot (#9B7CF0)
  const nodeColor = "#9B7CF0"
  const hotColor = isDark ? "#ffffff" : "#6c52ee"
  const textColor = isDark ? "#F7F5FC" : "#17151F"
  const outlineColor = isDark ? "#08070D" : "#F8F7FC"

  const linePoints = useMemo(
    () =>
      [
        [0, 0, 0],
        [ring.radius, 0, 0],
      ] as [number, number, number][],
    [ring.radius],
  )

  useFrame((_, delta) => {
    const p = scrollStore.get()

    // Emergence state for "Async JS" (Scene 3.5 adaptation: 0.70 to 0.84)
    const emerged = def.emerge ? rangeProgress(p, 0.7, 0.82) : 1

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

    // Harmonic synchronized angle
    const currentAngle = orbitAngle + def.phase
    const cosA = Math.cos(currentAngle)
    const sinA = Math.sin(currentAngle)
    const x = cosA * ring.radius
    const y = sinA * ring.radius

    if (holder.current) {
      holder.current.position.set(x, y, 0)
    }

    // Clean floating outward offset for typography — always stays upright
    if (labelGroup.current) {
      const outwardDist = 0.18
      const lx = cosA * outwardDist
      const ly = sinA * outwardDist + 0.02
      labelGroup.current.position.set(lx, ly, 0)
    }

    // Connecting line to center during goal mapping
    if (lineRef.current) {
      const connect = Math.max(rangeProgress(p, 0.2, 0.32), rangeProgress(p, 0.88, 0.96))
      lineRef.current.material.opacity = connect * (isDark ? 0.35 : 0.25)
      const pts = lineRef.current.geometry?.attributes?.position
      if (pts) {
        pts.setXYZ(1, x, y, 0)
        pts.needsUpdate = true
      }
    }

    // Highlight state during Scene 3 (knowledge-gap)
    const gap = def.highlight ? rangeProgress(p, 0.46, 0.6) * (1 - rangeProgress(p, 0.66, 0.78)) : 0

    if (mesh.current) {
      const targetScale = 1 + gap * 0.6
      mesh.current.scale.setScalar(
        mesh.current.scale.x + (targetScale - mesh.current.scale.x) * Math.min(1, delta * 5),
      )
    }

    if (mat.current) {
      mat.current.color.set(gap > 0.3 ? hotColor : nodeColor)
      mat.current.opacity = (def.emerge ? emerged : 1) * 0.95
    }
  })

  return (
    <group ref={groupRef} visible={!def.emerge}>
      <Line
        ref={lineRef}
        points={linePoints}
        color={nodeColor}
        transparent
        opacity={0}
        lineWidth={1}
      />
      <group ref={holder}>
        {/* Small solid lavender node dot (radius 0.038) */}
        <mesh ref={mesh}>
          <sphereGeometry args={[0.038, 24, 24]} />
          <meshBasicMaterial
            ref={mat}
            color={nodeColor}
            transparent
            opacity={0.95}
          />
        </mesh>

        {/* Clean floating label — upright billboard typography */}
        <group ref={labelGroup}>
          <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
            <Text
              position={[0, 0, 0]}
              fontSize={0.080}
              color={textColor}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.006}
              outlineColor={outlineColor}
              letterSpacing={0.02}
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

function Ring({
  index,
  isDark,
  orbitAngle,
}: {
  index: number
  isDark: boolean
  orbitAngle: number
}) {
  const ring = RINGS[index]
  const nodesForRing = NODES.filter((n) => n.ring === index)

  // Darker, crisper orbital lines in Light Theme
  // LIGHT MODE: #6B4EB6 with opacity 0.82
  // DARK MODE:  #9B88D5 with opacity 0.54
  const lineColor = isDark ? "#9B88D5" : "#6B4EB6"
  const lineOpacity = isDark ? 0.54 : 0.82

  return (
    <group rotation={ring.euler}>
      {/* Smooth, elegant, thin orbital ring track (~1.2-1.3px stroke width) */}
      <mesh>
        <torusGeometry args={[ring.radius, 0.0035, 12, 256]} />
        <meshBasicMaterial
          color={lineColor}
          transparent
          opacity={lineOpacity}
        />
      </mesh>

      {nodesForRing.map((n) => (
        <OrbNode key={n.label} def={n} isDark={isDark} orbitAngle={orbitAngle} />
      ))}
    </group>
  )
}

export function OrbitalSystem({ isDark, reducedMotion }: Props) {
  const orbitAngleRef = useRef(0)

  useFrame((_, delta) => {
    if (!reducedMotion) {
      orbitAngleRef.current += delta * ORBITAL_SPEED
    }
  })

  return (
    <group>
      {RINGS.map((_, i) => (
        <Ring
          key={i}
          index={i}
          isDark={isDark}
          orbitAngle={orbitAngleRef.current}
        />
      ))}
    </group>
  )
}


