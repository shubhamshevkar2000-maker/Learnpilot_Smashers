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
  Target,
  Flame,
  Calendar,
  CheckCircle2,
  Circle,
  AlertCircle,
  Info,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import {
  getActiveCurriculumFoundation,
  type ActiveCurriculum,
  type ModuleWithActivities,
} from "@/lib/services/curriculum-service"
import type { LearnerProfile, CurrentLevel, ModuleStatus, ActivityType } from "@/types/database.types"

// Level readable labels
const LEVEL_LABELS: Record<CurrentLevel, string> = {
  beginner: "Complete Beginner",
  basics: "Foundational Basics",
  intermediate: "Intermediate",
  advanced: "Advanced",
  unknown: "Not Sure / Exploratory",
}

// Module status badges
const STATUS_BADGES: Record<ModuleStatus, { label: string; className: string }> = {
  not_started: {
    label: "Not Started",
    className: "border-border/60 bg-muted/30 text-muted-foreground",
  },
  in_progress: {
    label: "In Progress",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  completed: {
    label: "Completed",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  skipped: {
    label: "Skipped",
    className: "border-border/40 bg-muted/10 text-muted-foreground/60",
  },
}

// Activity type badges
const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  concept: "Concept",
  exercise: "Exercise",
  project: "Project",
  reflection: "Reflection",
}

interface NavItem {
  id: string
  label: string
  icon: typeof Compass
  href: string
  active?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Layers, href: "/dashboard" },
  { id: "journey", label: "Daily Journey", icon: Calendar, href: "/journey" },
  { id: "path", label: "Learning Path", icon: Compass, href: "/path", active: true },
  { id: "courses", label: "Courses", icon: BookOpen, href: "/courses" },
  { id: "ai-coach", label: "AI Coach", icon: Bot, href: "/ai-coach" },
  { id: "assessments", label: "Assessments", icon: CheckCircle, href: "/assessments" },
  { id: "progress", label: "Progress", icon: BarChart3, href: "/progress" },
  { id: "notes", label: "Notes", icon: FileText, href: "/notes" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
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
  const [generationInfoNotice, setGenerationInfoNotice] = useState(false)

  // 1. Fetch real user profile and active curriculum foundation (read-only)
  const loadPathData = useCallback(async () => {
    if (!user) return
    if (!isConfigured) {
      router.replace("/login")
      return
    }

    try {
      // Load learner profile
      const { data: profData, error: profError } = await supabase
        .from("learner_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (profError) {
        console.error("Profile load error:", profError)
        setErrorMessage(`Database Error (${profError.code || "DB"}): ${profError.message}`)
        return
      }

      if (!profData || !profData.onboarding_completed) {
        router.replace("/onboarding")
        return
      }

      setProfile(profData as LearnerProfile)

      // Query active learning plan, modules, and activities (no auto-creation)
      const curriculumData = await getActiveCurriculumFoundation(supabase, user.id)
      setCurriculum(curriculumData)
    } catch (err: any) {
      console.error("Error loading learning path:", err)
      setErrorMessage(err?.message || "Failed to load learning path foundation from database.")
    } finally {
      setLoading(false)
    }
  }, [user, isConfigured, supabase, router])

  useEffect(() => {
    loadPathData()
  }, [loadPathData])

  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false)

  // Handle initial "Generate my learning path" CTA click
  const handleGenerateClick = async () => {
    if (generating) return
    setGenerating(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      let data: any = null
      const contentType = res.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        try {
          data = await res.json()
        } catch {
          // Fallback if JSON parse fails
        }
      }

      if (!res.ok) {
        if (res.status === 401) {
          setErrorMessage("Authentication session expired (HTTP 401). Please log in again to generate your path.")
        } else if (res.status === 403) {
          setErrorMessage("Access denied (HTTP 403). You do not have permission to generate this path.")
        } else if (res.status === 409) {
          setErrorMessage("Conflict (HTTP 409): An active learning path already exists. Click 'Regenerate' to replace it.")
        } else if (res.status >= 500) {
          setErrorMessage(data?.error || `Server Error (HTTP ${res.status}): LearnPilot backend encountered an issue. Please try again later.`)
        } else {
          setErrorMessage(data?.error || `Request failed with HTTP status ${res.status}.`)
        }
        return
      }

      if (!data || !data.success) {
        setErrorMessage("Invalid response payload returned from generation service.")
        return
      }

      // Reload path data from Supabase after successful generation
      await loadPathData()
    } catch (err: any) {
      console.error("[path/page] Generation request failed:", err)
      if (err.name === "TypeError" && err.message === "Failed to fetch") {
        setErrorMessage("Unable to connect to LearnPilot server (Network Error). Please verify your network connection and server status.")
      } else {
        setErrorMessage(err.message || "An unexpected network error occurred while contacting generation service.")
      }
    } finally {
      setGenerating(false)
    }
  }

  // Handle intentional "Regenerate learning path" confirmation
  const handleRegenerateConfirm = async () => {
    if (generating) return
    setGenerating(true)
    setShowRegenerateConfirm(false)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archive_existing: true }),
      })

      let data: any = null
      const contentType = res.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        try {
          data = await res.json()
        } catch {
          // Fallback if JSON parse fails
        }
      }

      if (!res.ok) {
        if (res.status === 401) {
          setErrorMessage("Authentication session expired (HTTP 401). Please log in again to regenerate your path.")
        } else if (res.status === 403) {
          setErrorMessage("Access denied (HTTP 403). You do not have permission to regenerate this path.")
        } else if (res.status >= 500) {
          setErrorMessage(data?.error || `Server Error (HTTP ${res.status}): LearnPilot backend service encountered an issue.`)
        } else {
          setErrorMessage(data?.error || `Failed to regenerate learning path (HTTP status ${res.status}).`)
        }
        return
      }

      if (!data || !data.success) {
        setErrorMessage("Invalid response payload returned from generation service.")
        return
      }

      // Reload fresh path data from Supabase
      await loadPathData()
    } catch (err: any) {
      console.error("[path/page] Regeneration request failed:", err)
      if (err.name === "TypeError" && err.message === "Failed to fetch") {
        setErrorMessage("Unable to connect to LearnPilot server (Network Error). Please verify your network connection and server status.")
      } else {
        setErrorMessage(err.message || "An unexpected network error occurred while contacting generation service.")
      }
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
            Loading Learning Path...
          </p>
        </div>
      </div>
    )
  }

  const displayName = profile?.display_name || user?.user_metadata?.full_name || "Learner"
  const avatarInitial = displayName.charAt(0).toUpperCase() || "L"

  // Derive real completion stats from fetched data
  const hasPlan = Boolean(curriculum && curriculum.plan)
  const modulesList = curriculum?.modules || []
  const completedModulesCount = modulesList.filter((m) => m.status === "completed").length

  let totalActivitiesCount = 0
  let completedActivitiesCount = 0
  modulesList.forEach((m) => {
    if (m.activities) {
      totalActivitiesCount += m.activities.length
      completedActivitiesCount += m.activities.filter((a) => a.is_completed).length
    }
  })

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
              className="rounded-lg p-1 text-muted-foreground hover:text-foreground lg:hidden min-h-[40px] min-w-[40px] flex items-center justify-center"
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
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors min-h-[40px] ${
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
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-destructive min-h-[36px]"
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE SURFACE */}
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

            <h1 className="font-serif text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
              {hasPlan ? curriculum!.plan.title : "Personalized Learning Path"}
            </h1>

            <p className="text-xs leading-relaxed text-muted-foreground">
              {hasPlan
                ? curriculum!.plan.goal_summary
                : `Your tailored learning progression for ${profile?.learning_goal || "your goal"}.`}
            </p>
          </header>

          {/* Learner Context Baseline Header Bar */}
          {profile && (
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border/40 bg-card/40 px-4 py-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Target size={13} className="text-primary shrink-0" />
                <span className="font-medium text-foreground">{profile.learning_goal}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame size={13} className="text-primary shrink-0" />
                <span>{LEVEL_LABELS[profile.current_level]}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-primary shrink-0" />
                <span>{profile.available_daily_minutes} min/day</span>
              </div>
              {profile.target_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-primary shrink-0" />
                  <span>Target: {profile.target_date}</span>
                </div>
              )}
            </div>
          )}

          <hr className="border-t border-border/40" />

          {/* Error Notice */}
          {errorMessage && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Regeneration Confirmation Modal */}
          {showRegenerateConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-xl">
                <div className="space-y-1.5">
                  <h3 className="font-serif text-lg font-normal text-foreground">
                    Regenerate learning path?
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your current learning path will be safely archived as a historical record, and a fresh personalized curriculum based on your <strong>{profile?.available_daily_minutes || 45} min/day</strong> daily study budget will be generated.
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowRegenerateConfirm(false)}
                    className="rounded-lg border border-border/60 px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/40 transition-colors min-h-[38px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRegenerateConfirm}
                    disabled={generating}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[38px]"
                  >
                    {generating ? (
                      <>
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground/20 border-t-primary-foreground" />
                        <span>Building fresh path...</span>
                      </>
                    ) : (
                      <span>Confirm & Regenerate</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE A: NO PLAN IN SUPABASE DATABASE */}
          {!hasPlan ? (
            <div className="py-12 text-center space-y-5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles size={20} />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="font-serif text-lg font-normal text-foreground">
                  Your personalized path is waiting
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  LearnPilot will map your sequential modules and activities based on your goal ({profile?.learning_goal}) and level ({LEVEL_LABELS[profile?.current_level || "unknown"]}).
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleGenerateClick}
                  disabled={generating}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 min-h-[44px]"
                >
                  {generating ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/20 border-t-primary-foreground" />
                      <span>Building your personalized learning path...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate my learning path</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* STATE B: REAL SUPABASE LEARNING PLAN & MODULES LIST */
            <div className="space-y-6">
              {/* Header summary of derived progress & Regenerate action */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    Sequence Modules ({modulesList.length})
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    • {completedModulesCount} of {modulesList.length} completed
                  </span>
                </div>

                <button
                  onClick={() => setShowRegenerateConfirm(true)}
                  disabled={generating}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1 px-2.5 rounded-lg border border-border/40 hover:bg-muted/30 disabled:opacity-50 min-h-[36px]"
                >
                  <Sparkles size={12} className="text-primary" />
                  <span>Regenerate learning path</span>
                </button>
              </div>

              {/* Modules List */}
              <div className="space-y-6">
                {modulesList.map((mod: ModuleWithActivities) => {
                  const acts = mod.activities || []
                  const completedActsCount = acts.filter((a) => a.is_completed).length
                  const totalActsCount = acts.length

                  let derivedStatus: ModuleStatus = "not_started"
                  if (totalActsCount > 0) {
                    if (completedActsCount === totalActsCount) {
                      derivedStatus = "completed"
                    } else if (completedActsCount > 0) {
                      derivedStatus = "in_progress"
                    }
                  } else {
                    derivedStatus = mod.status || "not_started"
                  }

                  const statusInfo = STATUS_BADGES[derivedStatus] || STATUS_BADGES.not_started

                  return (
                    <div
                      key={mod.id}
                      className="group border-b border-border/40 pb-6 space-y-3 transition-colors"
                    >
                      {/* Module Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-semibold text-primary">
                            {String(mod.sequence_order).padStart(2, "0")}
                          </span>
                          <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {mod.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                          {mod.estimated_minutes && (
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Clock size={12} />
                              <span>{mod.estimated_minutes} min</span>
                            </div>
                          )}

                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${statusInfo.className}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* Module Description & Rationale */}
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

                      {/* Real Module Activities from public.module_activities */}
                      {acts.length > 0 && (
                        <div className="pl-7 pt-2 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/80">
                            <span>Activities ({acts.length})</span>
                            <span className="font-mono font-normal lowercase tracking-normal text-muted-foreground">
                              {completedActsCount} of {totalActsCount} completed
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {mod.activities?.map((act) => (
                              <div
                                key={act.id}
                                className="flex items-center justify-between rounded-lg border border-border/30 bg-card/30 px-3 py-2 text-xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {act.is_completed ? (
                                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                  ) : (
                                    <Circle size={13} className="text-muted-foreground/50 shrink-0" />
                                  )}

                                  <span className="font-mono text-[10px] text-muted-foreground">
                                    {String(act.sequence_order).padStart(2, "0")}
                                  </span>

                                  <span className="truncate text-foreground font-medium">
                                    {act.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {!act.is_completed && (
                                    <Link
                                      href="/journey"
                                      className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                                    >
                                      <span>Continue in Daily Journey</span>
                                      <ArrowRight size={10} />
                                    </Link>
                                  )}

                                  {act.day_number && (
                                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-mono text-primary">
                                      Day {act.day_number} • {act.estimated_minutes || 20}m
                                    </span>
                                  )}
                                  <span className="rounded-full border border-border/40 bg-muted/20 px-2 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                                    {ACTIVITY_TYPE_LABELS[act.activity_type] || act.activity_type}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
