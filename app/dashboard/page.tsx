"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import {
  Compass,
  Layers,
  BookOpen,
  Bot,
  CheckCircle,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Calendar,
  TrendingUp,
  Brain,
  Rocket,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import { getOrCreateActiveCurriculum, type ActiveCurriculum } from "@/lib/services/curriculum-service"
import type { LearnerProfile, CurrentLevel } from "@/types/database.types"

// Readable levels mapping
const LEVEL_LABELS: Record<CurrentLevel, string> = {
  beginner: "Complete Beginner",
  basics: "Foundational Basics",
  intermediate: "Intermediate",
  advanced: "Advanced",
  unknown: "Not Sure / Exploratory",
}

interface NavItem {
  id: string
  label: string
  icon: typeof Compass
  href: string
  active?: boolean
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const router = useRouter()
  const { user, isConfigured, signOut } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [profile, setProfile] = useState<LearnerProfile | null>(null)
  const [curriculum, setCurriculum] = useState<ActiveCurriculum | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeToast, setActiveToast] = useState<string | null>(null)

  // Fetch real profile & existing plan
  const fetchDashboardData = useCallback(async () => {
    if (!user) return

    if (!isConfigured) {
      router.replace("/login")
      return
    }

    try {
      const { data: profData, error: profError } = await supabase
        .from("learner_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (profError || !profData || !profData.onboarding_completed) {
        router.replace("/onboarding")
        return
      }

      setProfile(profData as LearnerProfile)

      // Fetch active learning plan & modules if already created
      const { data: existingPlan } = await supabase
        .from("learning_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle()

      if (existingPlan) {
        const { data: modules } = await supabase
          .from("learning_modules")
          .select("*")
          .eq("plan_id", existingPlan.id)
          .eq("user_id", user.id)
          .order("sequence_order", { ascending: true })

        setCurriculum({
          plan: existingPlan,
          modules: modules || [],
        })
      }
    } catch (err) {
      console.error("Dashboard data load error:", err)
      setErrorMessage("Failed to load dashboard data.")
    } finally {
      setLoading(false)
    }
  }, [user, isConfigured, supabase, router])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Explicit Plan Generation Action
  const handleGeneratePlan = async () => {
    if (!user) return
    setGenerating(true)
    setErrorMessage(null)

    try {
      const activeData = await getOrCreateActiveCurriculum(supabase, user.id)
      if (activeData) {
        setCurriculum(activeData)
      } else {
        setErrorMessage("Please complete your onboarding profile first.")
      }
    } catch (err) {
      console.error("Generation error:", err)
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred during plan generation.")
    } finally {
      setGenerating(false)
    }
  }

  // Derive time-based greeting from current local time
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Synchronizing Workspace...
          </p>
        </div>
      </div>
    )
  }

  // Derived real values
  const displayName = profile?.display_name || user?.user_metadata?.full_name || "Learner"
  const learningGoal = profile?.learning_goal || "Not set"

  // Position nodes spatially along the orbital ellipses
  const orbitalNodes = curriculum?.modules.map((mod, idx) => {
    const total = curriculum.modules.length
    const angle = (idx / total) * Math.PI * 2 - Math.PI / 2
    const rx = 150 + (idx % 2 === 0 ? 30 : -20)
    const ry = 55 + (idx % 2 === 0 ? 15 : -10)
    const cx = 300 + rx * Math.cos(angle)
    const cy = 75 + ry * Math.sin(angle)
    return {
      ...mod,
      cx,
      cy,
    }
  }) || []

  return (
    <AppShell maxWidth="1400px">
      {/* Toast Notification */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-full border border-border/80 bg-card/95 px-4 py-2 text-xs text-foreground shadow-sm backdrop-blur-md">
          <span>{activeToast}</span>
        </div>
      )}

      {/* CONTINUOUS WORKSPACE SURFACE */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* CENTER COLUMN: Main Learning Workspace */}
        <div className="flex-1 space-y-8">
            {/* Top Compact Learner Greeting */}
            <header className="space-y-0.5">
              <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Learner Workspace
              </span>

              <h1 className="font-serif text-2xl font-normal tracking-tight text-foreground md:text-3xl">
                {getGreeting()}, <span className="italic text-primary">{displayName}.</span>
              </h1>

              <p className="text-xs text-muted-foreground">
                Your learning goal: <span className="font-medium text-foreground">{learningGoal}</span>
              </p>
            </header>

            <hr className="border-t border-border/40" />

            {/* Error banner if any */}
            {errorMessage && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {errorMessage}
              </div>
            )}

            {/* Compact Refined Orbital Trajectory Area */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                  Your Learning Trajectory
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {curriculum ? `${curriculum.modules.length} Modules Active` : "Trajectory Anchored"}
                </span>
              </div>

              <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border border-border/30 bg-primary/[0.015]">
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 150">
                  <defs>
                    <radialGradient id="compactOrbitalGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="compactOrbitStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
                      <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.25" />
                    </linearGradient>
                  </defs>

                  <circle cx="300" cy="75" r="65" fill="url(#compactOrbitalGlow)" />

                  <ellipse
                    cx="300"
                    cy="75"
                    rx="85"
                    ry="35"
                    fill="none"
                    stroke="url(#compactOrbitStroke)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    className="animate-[spin_40s_linear_infinite] origin-center"
                  />
                  <ellipse
                    cx="300"
                    cy="75"
                    rx="155"
                    ry="58"
                    fill="none"
                    stroke="url(#compactOrbitStroke)"
                    strokeWidth="1"
                    className="animate-[spin_60s_linear_infinite] origin-center"
                  />
                  <ellipse
                    cx="300"
                    cy="75"
                    rx="225"
                    ry="72"
                    fill="none"
                    stroke="url(#compactOrbitStroke)"
                    strokeWidth="1"
                    strokeDasharray="2 5"
                    className="animate-[spin_85s_linear_infinite] origin-center"
                  />

                  {/* Central Anchor Node */}
                  <circle cx="300" cy="75" r="4" fill="var(--primary)" />
                  <circle cx="300" cy="75" r="11" fill="none" stroke="var(--primary)" strokeWidth="1" strokeOpacity="0.4" />

                  {/* Real Database-backed Module Nodes */}
                  {orbitalNodes.map((node) => (
                    <g key={node.id} className="group cursor-pointer">
                      <circle cx={node.cx} cy={node.cy} r="6" fill="var(--background)" stroke="var(--primary)" strokeWidth="2" />
                      <circle cx={node.cx} cy={node.cy} r="2.5" fill="var(--primary)" />
                      <text
                        x={node.cx}
                        y={node.cy - 10}
                        textAnchor="middle"
                        className="fill-foreground text-[9px] font-mono font-semibold tracking-wider"
                      >
                        {String(node.sequence_order).padStart(2, "0")}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Spatial Anchor Label & Action Entry Point */}
                <div className="relative z-10 text-center px-4 space-y-1">
                  <span className="text-[9px] font-medium uppercase tracking-[0.25em] text-primary">
                    Trajectory Anchored To
                  </span>
                  <p className="font-serif text-sm italic text-foreground">
                    {learningGoal}
                  </p>

                  {!curriculum ? (
                    <div className="pt-1">
                      <button
                        onClick={handleGeneratePlan}
                        disabled={generating}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
                      >
                        {generating ? (
                          <>
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            <span>Generating Orbit...</span>
                          </>
                        ) : (
                          <>
                            <span>Generate my learning path</span>
                            <ArrowRight size={12} />
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="pt-1">
                      <Link
                        href="/path"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary transition-opacity hover:opacity-80"
                      >
                        <span>View full curriculum ({curriculum.modules.length} modules)</span>
                        <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </section>
        </div>

        {/* RIGHT COLUMN: Schedule & Upcoming */}
        <div className="w-full lg:w-72 lg:shrink-0 space-y-6 pt-2">
          {/* Section: Today's Journey */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/80">
              Today's Journey
            </span>
            <p className="text-xs font-medium text-foreground flex items-center justify-between">
              <span>{profile?.available_daily_minutes || 45} min daily budget</span>
            </p>
            <p className="text-[11px] leading-relaxed text-muted-foreground/80">
              {curriculum?.modules[0]
                ? `Next focus: ${curriculum.modules[0].title}`
                : "Your personalized daily learning session based on your path."}
            </p>
            <div className="pt-1">
              <Link
                href="/journey"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <span>Continue Journey</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          <hr className="border-t border-border/40" />

          {/* Section: Up Next */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/80">
              Up Next
            </span>
            <p className="text-xs font-medium text-foreground">
              {curriculum?.modules[1]
                ? `Module 02 — ${curriculum.modules[1].title}`
                : "Curriculum generation"}
            </p>
            <p className="text-[11px] leading-relaxed text-muted-foreground/80">
              {curriculum?.modules[1]
                ? curriculum.modules[1].description
                : "Preparing your learning modules and checkpoints."}
            </p>
          </div>

          <hr className="border-t border-border/40" />

          {/* Section: Profile */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/80">
              Profile
            </span>
            <div>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-1 text-xs text-primary transition-opacity hover:opacity-80"
              >
                <span>Edit learning preferences</span>
                <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
