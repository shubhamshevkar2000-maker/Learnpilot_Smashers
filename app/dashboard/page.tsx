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
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  User,
  Target,
  Trophy,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import { getActiveCurriculumFoundation, getOrCreateActiveCurriculum, type ActiveCurriculum } from "@/lib/services/curriculum-service"
import type { LearnerProfile, CurrentLevel, ModuleActivity } from "@/types/database.types"

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
  { id: "ai-coach", label: "AI Coach", icon: Bot, href: "/ai-coach" },
  { id: "assessments", label: "Assessments", icon: CheckCircle, href: "/assessments" },
  { id: "progress", label: "Progress", icon: BarChart3, href: "/progress" },
  { id: "notes", label: "Notes", icon: FileText, href: "#" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
]

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

interface FlattenedActivity extends ModuleActivity {
  module_title: string
  module_sequence: number
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

  // Fetch real profile & complete curriculum foundation with activities
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

      // Fetch complete active learning plan, modules, and activities
      const curriculumData = await getActiveCurriculumFoundation(supabase, user.id)
      setCurriculum(curriculumData)
    } catch (err) {
      console.error("[Dashboard] Load error:", err)
      setErrorMessage("Failed to load dashboard workspace data.")
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

  // Derive time-based greeting
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
    setActiveToast(`${item.label} will be available in an upcoming phase.`)
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

  // Derived Real Learner Data
  const displayName = profile?.display_name || user?.user_metadata?.full_name || "Learner"
  const learningGoal = profile?.learning_goal || "Not set"
  const availableDailyMinutes = profile?.available_daily_minutes || 45

  // Flatten all activities in module sequence order
  const allActivities: FlattenedActivity[] = []
  if (curriculum && curriculum.modules) {
    curriculum.modules.forEach((mod) => {
      if (mod.activities) {
        mod.activities.forEach((act) => {
          allActivities.push({
            ...act,
            module_title: mod.title,
            module_sequence: mod.sequence_order,
          })
        })
      }
    })
  }

  // Progress metrics derived from real database completion state
  const totalActivitiesCount = allActivities.length
  const completedActivitiesCount = allActivities.filter((a) => a.is_completed).length
  const completionPercentage = totalActivitiesCount > 0 ? Math.round((completedActivitiesCount / totalActivitiesCount) * 100) : 0

  const totalModulesCount = curriculum?.modules.length || 0
  const completedModulesCount = curriculum?.modules.filter((m) => m.status === "completed").length || 0

  const totalEstimatedMins = allActivities.reduce((sum, a) => sum + (a.estimated_minutes || 20), 0)
  const completedEstimatedMins = allActivities.filter((a) => a.is_completed).reduce((sum, a) => sum + (a.estimated_minutes || 20), 0)

  // Current Active Task & Day
  const firstIncomplete = allActivities.find((a) => !a.is_completed)
  const activeDay = firstIncomplete ? (firstIncomplete.day_number || 1) : 1
  const todaysBatch = allActivities.filter((a) => (a.day_number || 1) === activeDay)
  const todaysRemaining = todaysBatch.filter((a) => !a.is_completed)

  // Current Active Module
  const currentModule = curriculum?.modules.find((m) => m.status === "in_progress") ||
    curriculum?.modules.find((m) => m.status === "not_started") ||
    curriculum?.modules[0]

  const currentModActivities = currentModule?.activities || []
  const currentModCompletedCount = currentModActivities.filter((a) => a.is_completed).length

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary transition-colors duration-300">
      {/* Toast Notification */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-full border border-border/80 bg-card/95 px-4 py-2 text-xs text-foreground shadow-md backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
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

      {/* LEFT COLUMN: Sidebar Navigation */}
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
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Appearance</span>
            <ThemeToggle />
          </div>
          {isConfigured && user && (
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut size={13} />
              <span>Sign out</span>
            </button>
          )}
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto px-4 py-8 md:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* 1. HEADER BAR */}
          <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="rounded-lg border border-border/60 p-2 text-muted-foreground hover:text-foreground lg:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu size={18} />
                </button>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  LEARNER WORKSPACE
                </span>
              </div>
              <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground md:text-4xl mt-1">
                {getGreeting()}, <span className="italic text-primary">{displayName}.</span>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Current Goal: <span className="font-medium text-foreground">{learningGoal}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-xs transition-colors hover:text-foreground"
              >
                <Settings size={14} />
                <span>Preferences</span>
              </Link>
              <Link
                href="/journey"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                <PlayCircle size={14} />
                <span>Continue Today's Journey</span>
              </Link>
            </div>
          </header>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* UNINITIALIZED PLAN BANNER */}
          {(!curriculum || !curriculum.plan) && (
            <div className="rounded-2xl border border-border/50 bg-card/60 p-8 text-center backdrop-blur-md space-y-4 max-w-xl mx-auto my-6 shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Compass size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-normal text-foreground">
                  Your personalized Learning Path awaits.
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Generate your tailored curriculum based on your goal ("{learningGoal}") and study budget ({availableDailyMinutes} min/day).
                </p>
              </div>
              <button
                onClick={handleGeneratePlan}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    <span>Generating Learning Path...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate Learning Path Now</span>
                  </>
                )}
              </button>
            </div>
          )}

          {curriculum && curriculum.plan && (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* LEFT & MIDDLE COLUMNS (2 Spans) */}
              <div className="lg:col-span-2 space-y-6">
                {/* 2. TODAY'S FOCUS CARD */}
                <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-md space-y-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
                    <div>
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                        TODAY'S FOCUS • DAY {activeDay}
                      </span>
                      <h2 className="font-serif text-xl font-normal text-foreground mt-0.5">
                        {firstIncomplete ? firstIncomplete.title : "All activities for today completed!"}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-mono text-muted-foreground">
                        <Clock size={12} className="inline mr-1 text-primary" />
                        {availableDailyMinutes}m daily budget
                      </span>
                    </div>
                  </div>

                  {firstIncomplete ? (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-[10px] text-primary uppercase font-semibold">Active Task</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{firstIncomplete.estimated_minutes || 20} mins</span>
                        </div>
                        <p className="text-sm font-medium text-foreground">{firstIncomplete.title}</p>
                        <p className="text-xs text-muted-foreground">Module: {firstIncomplete.module_title}</p>
                      </div>

                      {todaysRemaining.length > 1 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                            Remaining Today ({todaysRemaining.length - 1} more tasks)
                          </span>
                          <div className="space-y-1.5">
                            {todaysRemaining.slice(1, 4).map((act) => (
                              <div
                                key={act.id}
                                className="flex items-center justify-between rounded-lg border border-border/30 bg-background/50 px-3 py-2 text-xs"
                              >
                                <span className="truncate text-foreground">{act.title}</span>
                                <span className="font-mono text-[10px] text-muted-foreground shrink-0">{act.estimated_minutes || 20}m</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center space-y-2">
                      <Trophy size={28} className="mx-auto text-emerald-500" />
                      <p className="text-sm font-medium text-foreground">You've completed all tasks for Day {activeDay}!</p>
                      <p className="text-xs text-muted-foreground">Great work today. You can review your path or explore courses.</p>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Link
                      href="/journey"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                    >
                      <span>Open Daily Journey Workspace</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* 3. OVERALL PROGRESS CARD */}
                <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-md space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={16} className="text-primary" />
                      <h3 className="font-serif text-lg font-normal text-foreground">Curriculum Progress</h3>
                    </div>
                    <span className="font-mono text-sm font-semibold text-primary">{completionPercentage}%</span>
                  </div>

                  <div className="space-y-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/40">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="rounded-xl border border-border/40 bg-background/50 p-3 text-center space-y-0.5">
                      <span className="font-mono text-lg font-semibold text-foreground">{completedActivitiesCount}/{totalActivitiesCount}</span>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Activities</p>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-background/50 p-3 text-center space-y-0.5">
                      <span className="font-mono text-lg font-semibold text-foreground">{completedModulesCount}/{totalModulesCount}</span>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Modules</p>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-background/50 p-3 text-center space-y-0.5">
                      <span className="font-mono text-lg font-semibold text-foreground">{completedEstimatedMins}m</span>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Study Time</p>
                    </div>
                  </div>
                </div>

                {/* 4. CURRENT LEARNING MODULE CARD */}
                {currentModule && (
                  <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-md space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                          CURRENT MODULE • {currentModule.sequence_order} OF {totalModulesCount}
                        </span>
                        <h3 className="font-serif text-lg font-normal text-foreground mt-0.5">
                          {currentModule.title}
                        </h3>
                      </div>
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-mono text-primary uppercase">
                        {currentModule.status.replace("_", " ")}
                      </span>
                    </div>

                    {currentModule.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {currentModule.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 text-xs">
                      <span className="text-muted-foreground">
                        Module Progress: <strong className="text-foreground">{currentModCompletedCount}/{currentModActivities.length} activities</strong>
                      </span>
                      <Link
                        href="/path"
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline text-xs"
                      >
                        <span>View Module in Path</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN (1 Span) */}
              <div className="space-y-6">
                {/* 5. QUICK ACTIONS GRID */}
                <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-md space-y-4 shadow-sm">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                    QUICK ACTIONS
                  </span>

                  <div className="grid gap-2.5">
                    <Link
                      href="/journey"
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3 text-xs transition-colors hover:border-primary/50 hover:bg-primary/5"
                    >
                      <div className="flex items-center gap-2.5">
                        <Calendar size={15} className="text-primary" />
                        <span className="font-medium text-foreground">Daily Journey</span>
                      </div>
                      <ArrowRight size={13} className="text-muted-foreground" />
                    </Link>

                    <Link
                      href="/path"
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3 text-xs transition-colors hover:border-primary/50 hover:bg-primary/5"
                    >
                      <div className="flex items-center gap-2.5">
                        <Compass size={15} className="text-primary" />
                        <span className="font-medium text-foreground">Learning Path</span>
                      </div>
                      <ArrowRight size={13} className="text-muted-foreground" />
                    </Link>

                    <Link
                      href="/ai-coach"
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3 text-xs transition-colors hover:border-primary/50 hover:bg-primary/5"
                    >
                      <div className="flex items-center gap-2.5">
                        <Bot size={15} className="text-primary" />
                        <span className="font-medium text-foreground">AI Coach</span>
                      </div>
                      <ArrowRight size={13} className="text-muted-foreground" />
                    </Link>

                    <Link
                      href="/courses"
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3 text-xs transition-colors hover:border-primary/50 hover:bg-primary/5"
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen size={15} className="text-primary" />
                        <span className="font-medium text-foreground">Course Catalog</span>
                      </div>
                      <ArrowRight size={13} className="text-muted-foreground" />
                    </Link>
                  </div>
                </div>

                {/* 6. AI COACH CARD */}
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 backdrop-blur-md space-y-4 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Bot size={18} />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-medium text-foreground">Personal AI Coach</h4>
                      <p className="text-[11px] text-muted-foreground">Personalized learning guidance</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Have questions about your current task or concepts in "{currentModule?.title || 'your path'}"? Your AI Coach is grounded in your active curriculum.
                  </p>

                  <Link
                    href="/ai-coach"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-xs transition-opacity hover:opacity-90"
                  >
                    <Sparkles size={14} />
                    <span>Ask Your AI Coach</span>
                  </Link>
                </div>

                {/* 7. PROFILE & PREFERENCES CARD */}
                <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-md space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <div className="flex items-center gap-2">
                      <User size={15} className="text-primary" />
                      <h4 className="font-serif text-sm font-medium text-foreground">Learner Profile</h4>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{LEVEL_LABELS[profile?.current_level || "beginner"]}</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Goal:</span>
                      <span className="font-medium text-foreground text-right">{profile?.learning_goal || "Not set"}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Daily Budget:</span>
                      <span className="font-mono font-medium text-foreground">{availableDailyMinutes} min / day</span>
                    </div>
                    {profile?.target_date && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Target Horizon:</span>
                        <span className="font-mono text-foreground">{new Date(profile.target_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <Link
                    href="/settings"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border/60 bg-background px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/40"
                  >
                    <Settings size={13} />
                    <span>Edit Learning Preferences</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
