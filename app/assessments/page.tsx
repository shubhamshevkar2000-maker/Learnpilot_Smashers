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
  History,
  Clock,
  Sparkles,
  Calendar,
  RotateCcw,
  Lock,
  Trophy,
  CheckCircle2,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database.types"
import type { StaticAssessment } from "@/types/assessment"
import { getOrCreateActiveCurriculum } from "@/lib/services/curriculum-service"
import { generateAssessmentForModule } from "@/lib/generator/assessment-generator"

type LearnerProfile = Database["public"]["Tables"]["learner_profiles"]["Row"]

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
  { id: "path", label: "Learning Path", icon: Compass, href: "/path" },
  { id: "courses", label: "Courses", icon: BookOpen, href: "/courses" },
  { id: "ai-coach", label: "AI Coach", icon: Bot, href: "/ai-coach" },
  { id: "assessments", label: "Assessments", icon: CheckCircle, href: "/assessments", active: true },
  { id: "progress", label: "Progress", icon: BarChart3, href: "/progress" },
  { id: "notes", label: "Notes", icon: FileText, href: "/notes" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
]

export default function AssessmentsPage() {
  return (
    <ProtectedRoute>
      <AssessmentsContent />
    </ProtectedRoute>
  )
}

function AssessmentsContent() {
  const router = useRouter()
  const { user, isConfigured, signOut } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<LearnerProfile | null>(null)
  const [activeAssessment, setActiveAssessment] = useState<StaticAssessment | null>(null)
  const [upcomingAssessments, setUpcomingAssessments] = useState<StaticAssessment[]>([])
  const [completedAssessments, setCompletedAssessments] = useState<StaticAssessment[]>([])
  const [attempts, setAttempts] = useState<any[]>([])
  const [activeToast, setActiveToast] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!isConfigured || !user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setErrorMessage(null)

      // Fetch profile
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

      // Fetch dynamic active curriculum
      const curriculum = await getOrCreateActiveCurriculum(supabase, user.id)

      // Fetch historical attempts
      const { data: results, error: resultsError } = await supabase
        .from("assessment_results")
        .select("*")
        .eq("user_id", user.id)
        .order("attempted_at", { ascending: false })

      if (resultsError) throw resultsError
      const attemptList = results || []
      setAttempts(attemptList)

      // Identify passed/completed module IDs
      const completedModuleIds = new Set(
        attemptList
          .filter(a => a.passed)
          .map(a => a.module_id || a.metadata?.assessmentId || a.assessment_title)
          .filter(Boolean)
      )

      const modules = curriculum?.modules || []
      const incompleteMods = modules.filter(m => !completedModuleIds.has(m.id))
      const completedMods = modules.filter(m => completedModuleIds.has(m.id))

      if (incompleteMods.length > 0) {
        const activeMod = incompleteMods[0]
        setActiveAssessment(generateAssessmentForModule(activeMod, profData as LearnerProfile))
        setUpcomingAssessments(
          incompleteMods.slice(1).map(m => generateAssessmentForModule(m, profData as LearnerProfile))
        )
      } else {
        setActiveAssessment(null)
        setUpcomingAssessments([])
      }

      setCompletedAssessments(
        completedMods.map(m => generateAssessmentForModule(m, profData as LearnerProfile))
      )

    } catch (err) {
      console.error("Error loading assessments data:", err)
      setErrorMessage("Failed to load assessments.")
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
    setActiveToast(`${item.label} will be available in the upcoming phase.`)
    setTimeout(() => {
      setActiveToast(null)
    }, 2800)
  }

  const handleSignOut = async () => {
    await signOut()
    router.replace("/login")
  }

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Loading Validations...
          </p>
        </div>
      </div>
    )
  }

  const displayName = profile.display_name || user?.user_metadata?.full_name || "Learner"
  const avatarInitial = displayName.charAt(0).toUpperCase() || "L"

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary transition-colors duration-300">
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-full border border-border/80 bg-card/95 px-4 py-2 text-xs text-foreground shadow-sm backdrop-blur-md">
          <span>{activeToast}</span>
        </div>
      )}

      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        />
      )}

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

        <div className="space-y-3 pt-4 border-t border-border/40">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-card/60 p-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
              {avatarInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">
                {displayName}
              </p>
              <p className="truncate text-[10px] capitalize text-muted-foreground">
                {profile.current_level || "Learner"}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-border/40 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-muted"
            >
              <Menu size={18} />
            </button>
            <span className="text-[11px] font-semibold tracking-[0.25em] text-foreground">
              LEARNPILOT
            </span>
            <div className="w-10" />
          </div>

          <header className="space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Knowledge Validation
            </span>
            <h1 className="font-serif text-2xl font-normal tracking-tight text-foreground md:text-3xl">
              Curriculum Assessments
            </h1>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Progressive 10-question evaluations generated dynamically from your active Learning Path modules.
            </p>
          </header>

          <hr className="border-t border-border/40" />

          {errorMessage && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {/* 1. ACTIVE MODULE VALIDATION */}
              {activeAssessment ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary flex items-center gap-1.5">
                      <Sparkles size={12} /> Active Module Validation
                    </span>
                    <span className="text-[11px] text-muted-foreground">Current Step</span>
                  </div>

                  <div className="group relative overflow-hidden rounded-xl border border-primary/50 bg-primary/[0.03] p-6 shadow-sm transition-all hover:border-primary hover:shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground text-lg">
                            {activeAssessment.title}
                          </h3>
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary">
                            <Sparkles size={10} /> Active
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {activeAssessment.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1 text-foreground font-medium">
                            <CheckCircle size={13} className="text-primary"/> {activeAssessment.questions.length} Diverse Questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={13}/> {activeAssessment.estimated_minutes} min
                          </span>
                          <span className="capitalize text-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                            {activeAssessment.level}
                          </span>
                          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                            Passing: {activeAssessment.passingScore}%
                          </span>
                        </div>
                      </div>

                      <Link 
                        href={`/assessments/${activeAssessment.id}`}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                      >
                        <span>Start Validation</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : completedAssessments.length > 0 ? (
                /* ALL MODULES COMPLETED CELEBRATION */
                <div className="rounded-xl border border-primary/40 bg-gradient-to-br from-primary/10 via-background to-card p-8 text-center space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-1">
                    <Trophy size={24} />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground">
                    All Module Validations Completed!
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Outstanding achievement! You have completed and validated all curriculum modules in your active Learning Path. You can review your attempts or retake any assessment below to maintain proficiency.
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No active modules found in your Learning Path.
                </div>
              )}

              {/* 2. UPCOMING MODULE VALIDATIONS */}
              {upcomingAssessments.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-1.5">
                    <Lock size={12} /> Upcoming Path Validations
                  </span>
                  <div className="space-y-3">
                    {upcomingAssessments.map((a, idx) => (
                      <div
                        key={a.id}
                        className="rounded-xl border border-border/40 bg-muted/20 p-4 opacity-75 hover:opacity-100 transition-opacity"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium text-foreground">
                                {a.title}
                              </h4>
                              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                Queued #{idx + 2}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {a.description}
                            </p>
                          </div>
                          <div className="text-[11px] text-muted-foreground shrink-0 flex items-center gap-1">
                            <Lock size={12} />
                            <span>Unlocks after current module</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. COMPLETED VALIDATIONS (RETAKE SECTION) */}
              {completedAssessments.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-primary" /> Completed Validations
                  </span>
                  <div className="space-y-3">
                    {completedAssessments.map((a) => {
                      const latestAttempt = attempts.find(
                        att => att.module_id === a.id || att.assessment_title === a.id
                      )
                      return (
                        <div
                          key={a.id}
                          className="rounded-xl border border-border/40 bg-card p-4 hover:border-border transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-medium text-foreground">
                                  {a.title}
                                </h4>
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                  <CheckCircle size={10} /> Passed {latestAttempt ? `(${Math.round(latestAttempt.score)}%)` : ''}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {a.description}
                              </p>
                            </div>
                            <Link
                              href={`/assessments/${a.id}`}
                              className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-lg border border-border/80 bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                            >
                              <RotateCcw size={12} />
                              <span>Retake</span>
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR: RECENT ATTEMPTS & HISTORY */}
            <div className="md:col-span-1 space-y-6 border-t md:border-t-0 md:border-l border-border/40 md:pl-8 pt-6 md:pt-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-1.5">
                  <History size={13} /> Recent Attempts
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {attempts.length} total
                </span>
              </div>

              {attempts.length === 0 ? (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No assessments attempted yet. Start your first active validation to track your score history.
                </p>
              ) : (
                <div className="space-y-3">
                  {attempts.map((attempt) => {
                    const allAssessments = [
                      ...(activeAssessment ? [activeAssessment] : []),
                      ...upcomingAssessments,
                      ...completedAssessments
                    ]
                    const mapped = allAssessments.find(
                      a => a.id === attempt.module_id || a.id === attempt.assessment_title
                    )
                    const title = mapped?.title || attempt.metadata?.module_title || attempt.assessment_title
                    const date = new Date(attempt.attempted_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                    const isToday =
                      new Date(attempt.attempted_at).toDateString() === new Date().toDateString()

                    return (
                      <div
                        key={attempt.id}
                        className="rounded-lg border border-border/30 bg-card/60 p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-medium text-foreground line-clamp-1">
                            {title}
                          </h4>
                          <span
                            className={`text-xs font-semibold ${
                              attempt.passed ? "text-primary" : "text-destructive"
                            }`}
                          >
                            {Math.round(attempt.score)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{isToday ? "Today" : date}</span>
                          <Link
                            href={`/assessments/${attempt.module_id || attempt.assessment_title}`}
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            <RotateCcw size={10} />
                            <span>Retake</span>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
