import { useEffect, useState } from "react"
import { useMotionValue, type MotionValue } from "framer-motion"

// Lightweight shared state so the R3F <Canvas> and DOM overlays stay in sync
// with a single source of truth, updated once per frame by Lenis / rAF.

type Listener = (progress: number) => void

let progress = 0 // 0..1 across the whole scroll experience
const listeners = new Set<Listener>()

export const scrollStore = {
  get: () => progress,
  set: (p: number) => {
    const clamped = p < 0 ? 0 : p > 1 ? 1 : p
    if (clamped === progress) return
    progress = clamped
    listeners.forEach((l) => l(clamped))
  },
  subscribe: (l: Listener) => {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}

/** Hook that returns a Framer Motion MotionValue always synced with scrollStore */
export function useScrollProgress(): MotionValue<number> {
  const mv = useMotionValue(scrollStore.get())

  useEffect(() => {
    mv.set(scrollStore.get())
    const unsubscribe = scrollStore.subscribe((p) => {
      mv.set(p)
    })
    return unsubscribe
  }, [mv])

  return mv
}

/** Hook that returns plain number progress for non-motion React components */
export function useScrollValue(): number {
  const [val, setVal] = useState(scrollStore.get())

  useEffect(() => {
    setVal(scrollStore.get())
    return scrollStore.subscribe((p) => setVal(p))
  }, [])

  return val
}

// Normalized pointer position (-1..1) for parallax / sphere tilt.
export const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1
    },
    { passive: true },
  )
}

// Scene boundaries expressed as progress ranges.
export const SCENES = {
  hero: [0, 0.16],
  goal: [0.20, 0.42],
  gap: [0.46, 0.66],
  adapt: [0.70, 0.84],
  intelligence: [0.88, 1],
} as const

// Smooth 0->1->0 pulse for a range, with soft edges.
export function rangeAlpha(p: number, start: number, end: number, fade = 0.05) {
  if (p <= start - fade || p >= end + fade) return 0
  if (p < start) return (p - (start - fade)) / fade
  if (p > end) return 1 - (p - end) / fade
  return 1
}

// Linear 0->1 progress within a range.
export function rangeProgress(p: number, start: number, end: number) {
  if (p <= start) return 0
  if (p >= end) return 1
  return (p - start) / (end - start)
}

