"use client"

import dynamic from "next/dynamic"
import { SmoothScroll } from "@/components/smooth-scroll"
import { Navbar } from "@/components/navbar"
import { SceneOverlays } from "@/components/scene-overlays"

// The 3D canvas is client-only and loaded on the client to avoid SSR of WebGL.
const ExperienceCanvas = dynamic(
  () => import("@/components/scene/experience-canvas").then((m) => m.ExperienceCanvas),
  { ssr: false },
)

export default function Home() {
  return (
    <SmoothScroll>
      <main className="relative w-full bg-background">
        {/* Background 3D world (fixed) */}
        <ExperienceCanvas />

        {/* Atmospheric depth gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-10"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 40%, transparent 45%, var(--background) 100%)",
          }}
        />

        {/* UI */}
        <Navbar />
        <SceneOverlays />

        {/* Scroll driver — provides the scroll length for the whole experience */}
        <div className="relative z-0 h-[560vh] w-full" />
      </main>
    </SmoothScroll>
  )
}
