"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  CheckCircle2,
  Circle,
  PlayCircle,
  Calendar,
  AlertCircle,
  Trophy,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import {
  getActiveCurriculumFoundation,
  completeActivity,
  type ActiveCurriculum,
  type ModuleWithActivities,
} from "@/lib/services/curriculum-service"
import type { LearnerProfile, ModuleActivity, ActivityType } from "@/types/database.types"

// Readable activity type labels & styles
const ACTIVITY_TYPES: Record<ActivityType, { label: string; bg: string; text: string }> = {
  concept: { label: "Concept", bg: "bg-purple-500/10 dark:bg-purple-400/10", text: "text-purple-600 dark:text-purple-300" },
  exercise: { label: "Exercise", bg: "bg-blue-500/10 dark:bg-blue-400/10", text: "text-blue-600 dark:text-blue-300" },
  project: { label: "Project", bg: "bg-amber-500/10 dark:bg-amber-400/10", text: "text-amber-600 dark:text-amber-300" },
  reflection: { label: "Reflection", bg: "bg-emerald-500/10 dark:bg-emerald-400/10", text: "text-emerald-600 dark:text-emerald-300" },
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
  { id: "journey", label: "Daily Journey", icon: Calendar, href: "/journey", active: true },
  { id: "path", label: "Learning Path", icon: Compass, href: "/path" },
  { id: "courses", label: "Courses", icon: BookOpen, href: "/courses" },
  { id: "ai-coach", label: "AI Coach", icon: Bot, href: "/ai-coach" },
  { id: "assessments", label: "Assessments", icon: CheckCircle, href: "/assessments" },
  { id: "progress", label: "Progress", icon: BarChart3, href: "/progress" },
  { id: "notes", label: "Notes", icon: FileText, href: "#" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
]

export interface FlattenedActivity extends ModuleActivity {
  module_title: string
  module_description: string | null
  module_sequence: number
}

export default function DailyJourneyPage() {
  return (
    <ProtectedRoute>
      <DailyJourneyContent />
    </ProtectedRoute>
  )
}

function DailyJourneyContent() {
  const router = useRouter()
  const { user, isConfigured, signOut } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<LearnerProfile | null>(null)
  const [curriculum, setCurriculum] = useState<ActiveCurriculum | null>(null)
  const [sessionActivityIds, setSessionActivityIds] = useState<string[] | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeToast, setActiveToast] = useState<string | null>(null)

  // Selected Activity modal state
  const [selectedActivity, setSelectedActivity] = useState<FlattenedActivity | null>(null)
  const [inProgressIds, setInProgressIds] = useState<Set<string>>(new Set())
  const [completingId, setCompletingId] = useState<string | null>(null)

  // Derive Time of Day Greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  // Helper to select today's assigned activities based on the current active day
  const selectSessionBatch = (curr: ActiveCurriculum, _dailyBudget: number): string[] => {
    const allActs: FlattenedActivity[] = []
    if (curr && curr.modules) {
      curr.modules.forEach((mod) => {
        if (mod.activities) {
          mod.activities.forEach((act) => {
            allActs.push({
              ...act,
              module_title: mod.title,
              module_description: mod.description,
              module_sequence: mod.sequence_order,
            })
          })
        }
      })
    }

    if (allActs.length === 0) return []

    // 1. Identify current active day from the first incomplete activity in sequence order
    const firstIncomplete = allActs.find((a) => !a.is_completed)
    const activeDay = firstIncomplete ? (firstIncomplete.day_number || 1) : 1

    // 2. Select ALL activities assigned to activeDay (stable for the entire day)
    const todaysTasks = allActs.filter((a) => (a.day_number || 1) === activeDay)
    return todaysTasks.map((a) => a.id)
  }

  // Load real profile and active curriculum foundation
  const loadData = useCallback(async () => {
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

      if (profError) {
        console.error("Profile fetch error:", profError)
        setErrorMessage(`Database Error (${profError.code || "DB"}): ${profError.message}`)
        return
      }

      if (!profData || !profData.onboarding_completed) {
        router.replace("/onboarding")
        return
      }

      setProfile(profData as LearnerProfile)

      const curriculumData = await getActiveCurriculumFoundation(supabase, user.id)
      setCurriculum(curriculumData)

      if (curriculumData && curriculumData.plan) {
        const budget = profData.available_daily_minutes || 45
        const batchIds = selectSessionBatch(curriculumData, budget)
        setSessionActivityIds(batchIds)
      }
    } catch (err: any) {
      console.error("[DailyJourney] Data load error:", err)
      setErrorMessage(err?.message || "Failed to load your Daily Journey from database. Please refresh.")
    } finally {
      setLoading(false)
    }
  }, [user, isConfigured, supabase, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleNavClick = (item: NavItem) => {
    if (item.href !== "#") {
      router.push(item.href)
      return
    }
    setActiveToast(`${item.label} section coming soon in next release.`)
    setTimeout(() => setActiveToast(null), 3000)
  }

  const handleSignOut = async () => {
    await signOut()
    router.replace("/")
  }

  // Explicit completion handler with double-click protection
  const handleMarkComplete = async (act: FlattenedActivity) => {
    if (!user || completingId) return
    setCompletingId(act.id)

    try {
      const success = await completeActivity(supabase, user.id, act.id, act.module_id)
      if (success) {
        // Update local state cleanly for activity act.id ONLY
        setCurriculum((prev) => {
          if (!prev) return null
          const updatedModules = prev.modules.map((m) => {
            if (m.id !== act.module_id) return m
            const updatedActs = (m.activities || []).map((a) =>
              a.id === act.id ? { ...a, is_completed: true, completed_at: new Date().toISOString() } : a
            )
            return { ...m, activities: updatedActs }
          })
          return { ...prev, modules: updatedModules }
        })

        setInProgressIds((prev) => {
          const next = new Set(prev)
          next.delete(act.id)
          return next
        })

        if (selectedActivity?.id === act.id) {
          setSelectedActivity(null)
        }

        setActiveToast(`Completed "${act.title}"!`)
        setTimeout(() => setActiveToast(null), 3000)
      } else {
        setErrorMessage("Failed to update activity completion. Please try again.")
      }
    } catch (err) {
      console.error("Error marking activity complete:", err)
      setErrorMessage("Could not save progress.")
    } finally {
      setCompletingId(null)
    }
  }

  const handleStartActivity = (act: FlattenedActivity) => {
    setInProgressIds((prev) => new Set(prev).add(act.id))
    setSelectedActivity(act)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Loading Daily Journey...
          </p>
        </div>
      </div>
    )
  }

  const displayName = profile?.display_name || user?.user_metadata?.full_name || "Learner"
  const avatarInitial = displayName.charAt(0).toUpperCase() || "L"
  const dailyBudget = profile?.available_daily_minutes || 45

  // 1. Flatten all activities in order from canonical active curriculum
  const allActivities: FlattenedActivity[] = []
  if (curriculum && curriculum.modules) {
    curriculum.modules.forEach((mod) => {
      if (mod.activities) {
        mod.activities.forEach((act) => {
          allActivities.push({
            ...act,
            module_title: mod.title,
            module_description: mod.description,
            module_sequence: mod.sequence_order,
          })
        })
      }
    })
  }

  // 2. Identify incomplete activities across full curriculum
  const incompleteActivities = allActivities.filter((a) => !a.is_completed)

  // 3. Determine current active day from the first incomplete activity
  const firstIncomplete = allActivities.find((a) => !a.is_completed)
  const activeDay = firstIncomplete ? (firstIncomplete.day_number || 1) : 1

  // 4. Build today's active session batch (all activities for activeDay)
  const todaysBatch: FlattenedActivity[] = allActivities.filter((a) => (a.day_number || 1) === activeDay)

  const todaysCompletedCount = todaysBatch.filter((a) => a.is_completed).length
  const todaysTotalMins = todaysBatch.reduce((sum, a) => sum + (a.estimated_minutes || 20), 0)
  const isTodayComplete = todaysBatch.length > 0 && todaysCompletedCount === todaysBatch.length

  // Determine current learning topic & day sequence
  const currentTopic = todaysBatch[0]?.module_title || "Curriculum Focus"
  const daySequence = activeDay

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

      {/* LEFT COLUMN: Navigation Sidebar */}
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

      {/* MAIN WORKSPACE */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-12 max-w-4xl mx-auto space-y-8">
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between lg:hidden border-b border-border/40 pb-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg border border-border/40 p-2 text-muted-foreground hover:text-foreground"
          >
            <Menu size={18} />
          </button>
          <span className="text-[11px] font-semibold tracking-[0.25em] text-foreground">LEARNPILOT</span>
          <div className="w-10" />
        </div>

        {/* Page Header */}
        <header className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
            DAILY JOURNEY
          </span>

          <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground md:text-4xl">
            {getGreeting()}, <span className="italic text-primary">{displayName}.</span>
          </h1>

          <p className="text-sm text-muted-foreground">
            Here's what your learning session looks like today.
          </p>
        </header>

        {/* Error Notice */}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* CASE A: NO ACTIVE PLAN */}
        {(!curriculum || !curriculum.plan) && (
          <div className="rounded-2xl border border-border/50 bg-card p-8 text-center space-y-4 max-w-lg mx-auto my-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Compass size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-normal text-foreground">
                Your learning journey hasn't been created yet.
              </h3>
              <p className="text-xs text-muted-foreground">
                Create a personalized Learning Path to get started.
              </p>
            </div>
            <Link
              href="/path"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              <span>Go to Learning Path</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* CASE B: ENTIRE PLAN COMPLETED */}
        {curriculum && curriculum.plan && allActivities.length > 0 && incompleteActivities.length === 0 && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-4 max-w-lg mx-auto my-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <Trophy size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-xl font-normal text-foreground">
                LEARNING PATH COMPLETE
              </h3>
              <p className="text-xs text-muted-foreground">
                You've completed your current learning path. You can review your progress or create a new learning path.
              </p>
            </div>
            <Link
              href="/path"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              <span>View Learning Path</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* CASE C: ACTIVE PLAN & TODAY'S SESSION */}
        {curriculum && curriculum.plan && todaysBatch.length > 0 && (
          <div className="space-y-6">
            {/* TODAY'S JOURNEY CARD */}
            <div className="rounded-2xl border border-border/50 bg-card/60 p-6 md:p-8 backdrop-blur-md space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                      TODAY'S JOURNEY • DAY {daySequence}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl font-normal text-foreground mt-0.5">
                    {currentTopic}
                  </h2>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                    <Clock size={13} className="text-primary" />
                    <span>{dailyBudget} min daily budget</span>
                  </div>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress through today's session</span>
                  <span className="font-medium text-foreground">
                    {todaysCompletedCount} / {todaysBatch.length} activities complete
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{
                      width: `${(todaysCompletedCount / todaysBatch.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* TODAY'S SESSION COMPLETE STATE */}
              {isTodayComplete ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3 my-4 animate-in fade-in">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-normal text-foreground">
                      TODAY'S JOURNEY COMPLETE
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {todaysTotalMins} minutes well spent. You've completed today's learning session.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/path"
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                    >
                      <span>View Learning Path</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ) : (
                /* TODAY'S ACTIVITIES LIST */
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Actionable Work Items
                  </span>

                  <div className="space-y-3">
                    {todaysBatch.map((act) => {
                      const typeInfo = ACTIVITY_TYPES[act.activity_type] || ACTIVITY_TYPES.concept
                      const isInProgress = inProgressIds.has(act.id)
                      const isCompleting = completingId === act.id

                      return (
                        <div
                          key={act.id}
                          className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition-all duration-200 ${
                            act.is_completed
                              ? "border-emerald-500/30 bg-emerald-500/[0.03]"
                              : isInProgress
                              ? "border-primary/50 bg-primary/[0.03] shadow-sm"
                              : "border-border/50 bg-card hover:border-border"
                          }`}
                        >
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${typeInfo.bg} ${typeInfo.text}`}
                              >
                                {typeInfo.label}
                              </span>
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Clock size={11} />
                                {act.estimated_minutes || 20} min
                              </span>
                            </div>

                            <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                              {act.title}
                            </h3>

                            <p className="text-xs text-muted-foreground line-clamp-1">
                              From <span className="font-medium text-foreground/80">{act.module_title}</span>
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="shrink-0 flex items-center gap-2">
                            {act.is_completed ? (
                              <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 size={15} />
                                <span>Completed</span>
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleStartActivity(act)}
                                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                    isInProgress
                                      ? "border border-primary/40 bg-primary/10 text-primary"
                                      : "border border-border/60 bg-muted/30 text-foreground hover:bg-muted"
                                  }`}
                                >
                                  {isInProgress ? (
                                    <>
                                      <PlayCircle size={13} className="text-primary" />
                                      <span>In Progress</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>Start</span>
                                      <ArrowRight size={13} />
                                    </>
                                  )}
                                </button>

                                <button
                                  onClick={() => handleMarkComplete(act)}
                                  disabled={isCompleting}
                                  className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
                                >
                                  {isCompleting ? (
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  ) : (
                                    <>
                                      <CheckCircle2 size={13} />
                                      <span>Complete</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ACTIVITY WORKSPACE MODAL */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setSelectedActivity(null)}
              className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="space-y-2 pr-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-primary">
                  {selectedActivity.module_title}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock size={12} />
                  {selectedActivity.estimated_minutes || 20} min
                </span>
              </div>

              <h3 className="font-serif text-xl font-normal text-foreground">
                {selectedActivity.title}
              </h3>
            </div>

            <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground">Learning Guidance:</p>
              {selectedActivity.activity_type === "concept" && (
                <p>
                  Focus on understanding core principles, syntax structure, and fundamental design patterns. Review key terms and mentally connect them to practical use-cases.
                </p>
              )}
              {selectedActivity.activity_type === "exercise" && (
                <p>
                  Hands-on practical exercise. Implement the concepts in your local editor, run tests, and experiment with edge cases to solidify your mastery.
                </p>
              )}
              {selectedActivity.activity_type === "project" && (
                <p>
                  Applied mini-project. Build a complete functional component or artifact synthesizing what you've learned across previous concepts.
                </p>
              )}
              {selectedActivity.activity_type === "reflection" && (
                <p>
                  Checkpoint review. Reflect on key takeaways, evaluate your confidence, and identify any remaining questions before moving forward.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Close
              </button>

              {!selectedActivity.is_completed && (
                <button
                  onClick={() => handleMarkComplete(selectedActivity)}
                  disabled={completingId === selectedActivity.id}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {completingId === selectedActivity.id ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}
                  <span>Mark as Complete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
