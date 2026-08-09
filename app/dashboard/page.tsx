"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Layers, href: "/dashboard", active: true },
  { id: "journey", label: "Daily Journey", icon: Calendar, href: "/journey" },
  { id: "path", label: "Learning Path", icon: Compass, href: "/path" },
  { id: "courses", label: "Courses", icon: BookOpen, href: "/courses" },
  { id: "ai-coach", label: "AI Coach", icon: Bot, href: "#" },
  { id: "assessments", label: "Assessments", icon: CheckCircle, href: "/assessments" },
  { id: "progress", label: "Progress", icon: BarChart3, href: "/progress" },
  { id: "notes", label: "Notes", icon: FileText, href: "#" },
  { id: "settings", label: "Settings", icon: Settings, href: "#" },
]

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  const handleNavClick = (item: NavItem) => {
    if (item.href !== "#") {
      router.push(item.href)
      return
    }
    setActiveToast(`${item.label} will be available in the upcoming phase.`)
    setTimeout(() => {
      setActiveToast(null)
    }, 2800)
  }

  const handleSignOut = async () => {
    await signOut()
    router.replace("/login")
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
  const avatarInitial = displayName.charAt(0).toUpperCase() || "L"

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
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary transition-colors duration-300">
      {/* Toast Notification */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-full border border-border/80 bg-card/95 px-4 py-2 text-xs text-foreground shadow-sm backdrop-blur-md">
          <span>{activeToast}</span>
        </div>
      )}

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* LEFT COLUMN: Persistent Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-52 flex-col justify-between border-r border-border/40 bg-background/95 px-4 py-5 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-5">
            <Link
              href="/"
              className="text-[11px] font-semibold tracking-[0.25em] text-foreground transition-opacity hover:opacity-80"
            >
              LEARNPILOT
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-1 text-muted-foreground hover:text-foreground lg:hidden"
              aria-label="Close navigation"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                    item.active
                      ? "font-medium text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Icon size={14} className={item.active ? "text-primary" : "text-muted-foreground"} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* User Identity & Controls */}
        <div className="space-y-2.5 pt-3 border-t border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-medium text-primary">
                {avatarInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">{displayName}</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-destructive"
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* CONTINUOUS WORKSPACE SURFACE */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-y-auto">
        {/* CENTER COLUMN: Main Learning Workspace */}
        <main className="flex-1 px-4 py-4 sm:px-6 md:px-8 xl:px-9">
          <div className="max-w-3xl space-y-4">
            {/* Mobile Top Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-border/40 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-muted"
                aria-label="Open navigation"
              >
                <Menu size={18} />
              </button>
              <span className="text-[11px] font-semibold tracking-[0.25em] text-foreground">
                LEARNPILOT
              </span>
              <div className="w-10" />
            </div>

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
        </main>

        {/* RIGHT COLUMN: Compact Contextual Learning Intelligence */}
        <aside className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-border/40 px-5 py-5 space-y-5 bg-background/40">
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
        </aside>
      </div>
    </div>
  )
}
