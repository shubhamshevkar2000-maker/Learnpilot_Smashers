"use client"

import { useRouter } from "next/navigation"
import { motion, useTransform, type MotionValue } from "framer-motion"
import { ArrowRight, ArrowDown, Sparkles } from "lucide-react"
import type { ReactNode } from "react"
import { MagneticButton } from "@/components/magnetic-button"
import { useScrollProgress } from "@/lib/experience-store"
import { useAuth } from "@/components/auth/auth-provider"

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

/* ---------------------------- HERO ---------------------------- */
function Hero({ progress }: { progress: MotionValue<number> }) {
  const router = useRouter()
  const { user } = useAuth()

  // Hero is 100% visible at start, fades out between 0.10 and 0.16
  const opacity = useTransform(progress, [0, 0.10, 0.16], [1, 1, 0])
  const y = useTransform(progress, [0, 0.16], [0, -80])
  const scrollOpacity = useTransform(progress, [0, 0.05], [1, 0])
  const pointerEvents = useTransform(progress, (p) => (p > 0.15 ? "none" : "auto"))
  const display = useTransform(progress, (p) => (p > 0.18 ? "none" : "flex"))

  const handleStartJourney = () => {
    router.push(user ? "/onboarding" : "/login")
  }

  return (
    <motion.div
      style={{ opacity, y, pointerEvents, display }}
      className="pointer-events-none absolute inset-0 items-center"
    >
      <div className="mx-auto flex w-full max-w-[1400px] px-6 md:px-10">
        <div className="max-w-xl text-left">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-primary"
          >
            Learning Intelligence
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-5xl font-medium leading-[1.02] tracking-tight text-foreground md:text-7xl lg:text-8xl"
          >
            Learning
            <br />
            <span className="italic text-primary">isn&apos;t</span> linear.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-6 font-serif text-xl font-normal text-foreground/90 md:text-2xl"
          >
            Your learning path evolves with you.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base"
          >
            LearnPilot is an AI-powered learning companion that builds and adapts your learning
            journey around your goals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="pointer-events-auto mt-9"
          >
            <MagneticButton onClick={handleStartJourney}>
              Start Your Journey
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </MagneticButton>
          </motion.div>

        </div>
      </div>

      <motion.div
        style={{ opacity: scrollOpacity }}
        className="absolute bottom-8 left-6 flex items-center gap-3 text-muted-foreground md:left-10"
      >
        <div className="relative flex h-8 w-5 items-start justify-center rounded-full border border-muted-foreground/40 p-1">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.6, ease: "easeInOut" }}
            className="h-1.5 w-1 rounded-full bg-primary"
          />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground/80">
            Scroll to explore
          </span>
          <motion.span
            animate={{ y: [0, 3, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.6, ease: "easeInOut" }}
            className="text-muted-foreground/60"
          >
            <ArrowDown size={12} />
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  )
}


/* ------------------------ GENERIC SCENE SHELL ------------------------ */
function SceneShell({
  progress,
  start,
  end,
  children,
}: {
  progress: MotionValue<number>
  start: number
  end: number
  children: ReactNode
}) {
  const isFinal = end >= 0.98

  // Clean fade in and fade out with non-overlapping ranges
  const opacity = useTransform(
    progress,
    isFinal
      ? [clamp01(start - 0.03), clamp01(start + 0.02), 1]
      : [
          clamp01(start - 0.03),
          clamp01(start + 0.02),
          clamp01(end - 0.02),
          clamp01(end + 0.03),
        ],
    isFinal ? [0, 1, 1] : [0, 1, 1, 0],
  )

  const y = useTransform(progress, [start, end], [30, -30])
  const pointerEvents = useTransform(progress, (p) => (p >= start && p <= end ? "auto" : "none"))
  const display = useTransform(progress, (p) =>
    p < start - 0.05 || (!isFinal && p > end + 0.05) ? "none" : "flex",
  )

  return (
    <motion.div
      style={{ opacity, y, pointerEvents, display }}
      className="absolute inset-0 items-center justify-start text-left"
    >
      <div className="mx-auto flex w-full max-w-[1400px] px-6 md:px-10">
        {/* Strict TEXT SAFE ZONE: left 42% of hero container */}
        <div className="w-full max-w-xl">
          {children}
        </div>
      </div>
    </motion.div>
  )
}

const skills = ["HTML", "CSS", "JavaScript", "React", "APIs", "Next.js"]

export function SceneOverlays() {
  const router = useRouter()
  const { user } = useAuth()
  const scrollProgress = useScrollProgress()

  const handleContinue = () => {
    router.push(user ? "/onboarding" : "/login")
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <Hero progress={scrollProgress} />

      {/* SCENE 2 — GOAL (Strict Left Safe Zone) */}
      <SceneShell progress={scrollProgress} start={0.18} end={0.40}>
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-primary">
            Your Goal
          </p>
          <h2 className="font-serif text-5xl font-medium leading-[1.02] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Frontend
            <br />
            Developer
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s}
                className="rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs text-foreground/80 backdrop-blur-sm"
              >
                {s}
              </span>
            ))}
          </div>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            LearnPilot maps every skill your goal requires and arranges them into a living orbit.
          </p>
        </div>
      </SceneShell>

      {/* SCENE 3 — KNOWLEDGE GAP (Strict Left Safe Zone) */}
      <SceneShell progress={scrollProgress} start={0.44} end={0.64}>
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-primary">
            Knowledge Gap Detected
          </p>
          <div className="flex items-baseline gap-4">
            <h2 className="font-serif text-5xl font-medium text-foreground md:text-7xl">
              JavaScript
            </h2>
            <span className="font-serif text-3xl font-medium text-primary md:text-4xl">42%</span>
          </div>
          <div className="mt-6 h-px w-48 bg-gradient-to-r from-primary to-transparent" />
          <p className="mt-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-foreground">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
            Active learning priority
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            Continuous assessment identifies knowledge gaps in real time to focus your learning where it matters most.
          </p>
        </div>
      </SceneShell>

      {/* SCENE 3.5 — ADAPTATION (Strict Left Safe Zone) */}
      <SceneShell progress={scrollProgress} start={0.68} end={0.84}>
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-primary">
            New node emerged — Async JavaScript
          </p>
          <h2 className="font-serif text-5xl font-medium leading-[1.02] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Your path just
            <br />
            <span className="italic text-primary">adapted.</span>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            As your skills evolve, LearnPilot dynamically introduces prerequisite nodes into your orbital journey.
          </p>
        </div>
      </SceneShell>

      {/* SCENE 4 — INTELLIGENCE (Strict Left Safe Zone) */}
      <SceneShell progress={scrollProgress} start={0.88} end={1.0}>
        <div className="pointer-events-auto max-w-lg rounded-3xl border border-border bg-card/75 p-8 backdrop-blur-xl md:p-10">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-primary">
            <Sparkles size={14} />
            LearnPilot Intelligence
          </p>
          <h2 className="mt-5 font-serif text-3xl font-medium leading-snug text-foreground md:text-4xl">
            &ldquo;I found a better path for you.&rdquo;
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Strengthen <span className="font-medium text-foreground">Async JavaScript</span> before continuing to{" "}
            <span className="font-medium text-foreground">React</span>.
          </p>
          <div className="mt-7">
            <MagneticButton onClick={handleContinue}>
              Continue
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </MagneticButton>
          </div>
        </div>
      </SceneShell>
    </div>
  )
}


