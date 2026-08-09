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
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import { getOrCreateActiveCurriculum, type ActiveCurriculum } from "@/lib/services/curriculum-service"
import type { LearnerProfile } from "@/types/database.types"

interface NavItem {
  id: string
  label: string
  icon: typeof Compass
  href: string
  active?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Layers, href: "/dashboard" },
  { id: "path", label: "Learning Path", icon: Compass, href: "/path", active: true },
  { id: "courses", label: "Courses", icon: BookOpen, href: "#" },
  { id: "ai-coach", label: "AI Coach", icon: Bot, href: "#" },
  { id: "assessments", label: "Assessments", icon: CheckCircle, href: "#" },
  { id: "progress", label: "Progress", icon: BarChart3, href: "#" },
  { id: "notes", label: "Notes", icon: FileText, href: "#" },
  { id: "settings", label: "Settings", icon: Settings, href: "#" },
]

export default function LearningPathPage() {
  return (
    <ProtectedRoute>
      <LearningPathContent />
    </ProtectedRoute>
  )
}

function LearningPathContent() {
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

  const loadPathData = useCallback(async () => {
    if (!user) return
    if (!isConfigured) {
      router.replace("/login")
      return
    }

    try {
      // 1. Load learner profile
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

      // 2. Fetch existing active plan & modules
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
      console.error("Error loading learning path:", err)
      setErrorMessage("Failed to load learning path.")
    } finally {
      setLoading(false)
    }
  }, [user, isConfigured, supabase, router])

  useEffect(() => {
    loadPathData()
  }, [loadPathData])

  // Handle plan generation trigger
  const handleGeneratePlan = async () => {
    if (!user) return
    setGenerating(true)
    setErrorMessage(null)

    try {
      const activeData = await getOrCreateActiveCurriculum(supabase, user.id)
      if (activeData) {
        setCurriculum(activeData)
      } else {
        setErrorMessage("Unable to generate path. Please complete onboarding first.")
      }
    } catch (err) {
      console.error("Plan generation error:", err)
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred during path generation.")
    } finally {
      setGenerating(false)
    }
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
            Synchronizing Learning Path...
          </p>
        </div>
      </div>
    )
  }

  const displayName = profile?.display_name || user?.user_metadata?.full_name || "Learner"
  const avatarInitial = displayName.charAt(0).toUpperCase() || "L"

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

      {/* MAIN WORKSPACE: LEARNING PATH CONTENT */}
      <main className="flex-1 px-4 py-4 sm:px-6 md:px-10 xl:px-12 overflow-y-auto">
        <div className="max-w-3xl space-y-6">
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

          {/* Page Header */}
          <header className="space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Curriculum Trajectory
            </span>

            <h1 className="font-serif text-2xl font-normal tracking-tight text-foreground md:text-3xl">
              {curriculum ? curriculum.plan.title : "Personalized Learning Path"}
            </h1>

            <p className="text-xs leading-relaxed text-muted-foreground">
              {curriculum
                ? curriculum.plan.goal_summary
                : `Your tailored learning progression for ${profile?.learning_goal || "your goal"}.`}
            </p>
          </header>

          <hr className="border-t border-border/40" />

          {/* Error Notice if any */}
          {errorMessage && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          {/* STATE A: NO PLAN GENERATED YET */}
          {!curriculum ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles size={20} />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-serif text-lg font-normal text-foreground">
                  Ready to generate your path
                </h3>
                <p className="text-xs text-muted-foreground">
                  LearnPilot will structure your curriculum modules based on your goal ({profile?.learning_goal}) and current experience level ({profile?.current_level}).
                </p>
              </div>

              <button
                onClick={handleGeneratePlan}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/20 border-t-primary-foreground" />
                    <span>Generating Path...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Learning Path</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* STATE B: ACTIVE CURRICULUM MODULES LIST */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                  Sequence Modules ({curriculum.modules.length})
                </span>
                <span className="text-[10px] font-medium text-primary uppercase tracking-[0.15em]">
                  Active Trajectory
                </span>
              </div>

              <div className="space-y-4">
                {curriculum.modules.map((mod) => (
                  <div
                    key={mod.id}
                    className="group border-b border-border/40 pb-5 space-y-1.5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-semibold text-primary">
                          {String(mod.sequence_order).padStart(2, "0")}
                        </span>
                        <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {mod.title}
                        </h3>
                      </div>

                      {mod.estimated_minutes && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                          <Clock size={12} />
                          <span>{mod.estimated_minutes} min</span>
                        </div>
                      )}
                    </div>

                    {mod.description && (
                      <p className="pl-7 text-xs text-muted-foreground leading-relaxed">
                        {mod.description}
                      </p>
                    )}

                    {mod.rationale && (
                      <p className="pl-7 text-[11px] italic text-muted-foreground/80">
                        Rationale: {mod.rationale}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
