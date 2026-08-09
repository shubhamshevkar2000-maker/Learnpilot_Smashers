"use client"

import { useEffect, useState } from "react"

/** Detects small screens + reduced-motion so the 3D scene can scale down. */
export function useEnvironment() {
  const [env, setEnv] = useState({ isMobile: false, reducedMotion: false, ready: false })

  useEffect(() => {
    const mobileMq = window.matchMedia("(max-width: 768px)")
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)")

    const update = () =>
      setEnv({ isMobile: mobileMq.matches, reducedMotion: motionMq.matches, ready: true })

    update()
    mobileMq.addEventListener("change", update)
    motionMq.addEventListener("change", update)
    return () => {
      mobileMq.removeEventListener("change", update)
      motionMq.removeEventListener("change", update)
    }
  }, [])

  return env
}
