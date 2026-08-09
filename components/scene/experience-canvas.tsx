"use client"

import { Suspense, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, Lightformer } from "@react-three/drei"
import * as THREE from "three"
import { CrystalSphere } from "./crystal-sphere"
import { OrbitalSystem } from "./orbital-system"
import { scrollStore, pointer } from "@/lib/experience-store"
import { useTheme } from "@/components/theme-provider"
import { useEnvironment } from "@/hooks/use-environment"

function CameraRig({ reducedMotion, isMobile }: { reducedMotion: boolean; isMobile: boolean }) {
  const { camera, size } = useThree()
  const tmp = useRef(new THREE.Vector3())
  const look = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const p = scrollStore.get()
    
    // Viewport aspect ratio and height compensation:
    // Keeps all orbital rings and labels safely inside the right-side visual zone (right ~58%).
    const aspect = size.width / Math.max(1, size.height)
    const baseZ = isMobile ? 7.8 : size.height < 800 ? 7.1 : 6.75
    const z = THREE.MathUtils.lerp(baseZ, baseZ * 0.88, easeInOut(p))

    // Slight vertical position
    const y = isMobile ? -0.8 : Math.sin(p * Math.PI * 2) * 0.06
    // Parallax from pointer
    const px = reducedMotion ? 0 : pointer.x * 0.18
    const py = reducedMotion ? 0 : -pointer.y * 0.12

    // The 3D orbital visualization remains in the RIGHT-SIDE visual safe zone (right ~58%)
    // throughout ALL scroll scenes on desktop. On mobile, it centers below the text.
    const lookX = isMobile ? 0 : aspect > 1.7 ? -1.80 : -1.60

    tmp.current.set(px + lookX, y + py, z)
    camera.position.lerp(tmp.current, Math.min(1, delta * 2.5))
    look.current.lerp(tmp.current.clone().setZ(0), 1)
    camera.lookAt(lookX, isMobile ? y : 0, 0)
  })

  return null
}


function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}


function SceneContents({
  isDark,
  reducedMotion,
  quality,
  isMobile,
}: {
  isDark: boolean
  reducedMotion: boolean
  quality: "low" | "high"
  isMobile: boolean
}) {
  const world = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!world.current) return
    // Subtle whole-world parallax follow for depth.
    const tx = reducedMotion ? 0 : pointer.x * 0.22
    const ty = reducedMotion ? 0 : -pointer.y * 0.18
    world.current.position.x += (tx - world.current.position.x) * Math.min(1, delta * 1.6)
    world.current.position.y += (ty - world.current.position.y) * Math.min(1, delta * 1.6)
  })

  return (
    <>
      <CameraRig reducedMotion={reducedMotion} isMobile={isMobile} />

      <ambientLight intensity={isDark ? 0.55 : 0.95} />
      <directionalLight position={[5, 6, 4]} intensity={isDark ? 1.8 : 2.2} color={isDark ? "#d4c8fc" : "#ffffff"} />
      <pointLight position={[-4, -2, 3]} intensity={isDark ? 25 : 15} color={isDark ? "#8b6fe8" : "#c8bdf8"} />
      <pointLight position={[0, 0, 0]} intensity={isDark ? 8 : 4} color={isDark ? "#c5b7ff" : "#a895f5"} distance={4} />

      <group ref={world}>
        <CrystalSphere isDark={isDark} reducedMotion={reducedMotion} quality={quality} />
        <OrbitalSystem isDark={isDark} reducedMotion={reducedMotion} quality={quality} />
      </group>

      <Environment resolution={quality === "high" ? 256 : 128}>
        <Lightformer intensity={isDark ? 2.5 : 3.2} position={[0, 3, 3]} scale={[6, 6, 1]} color="#ffffff" />
        <Lightformer intensity={isDark ? 1.8 : 1.5} position={[-4, 0, 2]} scale={[4, 6, 1]} color="#c8bdf8" />
        <Lightformer intensity={isDark ? 1.4 : 1.2} position={[4, -1, 2]} scale={[4, 4, 1]} color="#a895f5" />
      </Environment>
    </>
  )
}


// Suppress known R3F + Three.js r170+ deprecation warning for THREE.Clock
if (typeof console !== 'undefined') {
  const originalWarn = console.warn
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) return
    originalWarn(...args)
  }
}

export function ExperienceCanvas() {
  const { theme } = useTheme()
  const { isMobile, reducedMotion, ready } = useEnvironment()
  const isDark = theme === "dark"
  const quality: "low" | "high" = isMobile ? "low" : "high"

  return (
    <div className="fixed inset-0 h-[100dvh] w-full" aria-hidden="true">
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={isMobile ? [1, 1.5] : [1, 1.9]}
        camera={{ position: [0, 0, 6.4], fov: 42 }}
        frameloop={ready ? "always" : "demand"}
      >
        <Suspense fallback={null}>
          <SceneContents isDark={isDark} reducedMotion={reducedMotion} quality={quality} isMobile={isMobile} />
        </Suspense>
      </Canvas>
    </div>
  )
}
