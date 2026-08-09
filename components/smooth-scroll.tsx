"use client"

import { useEffect } from "react"
import Lenis from "lenis"
import { scrollStore } from "@/lib/experience-store"

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      scrollStore.set(max > 0 ? window.scrollY / max : 0)
    }

    if (reduced) {
      // No smooth scrolling — just track native scroll.
      update()
      window.addEventListener("scroll", update, { passive: true })
      window.addEventListener("resize", update)
      return () => {
        window.removeEventListener("scroll", update)
        window.removeEventListener("resize", update)
      }
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    })

    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      update()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    window.addEventListener("resize", update)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", update)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
