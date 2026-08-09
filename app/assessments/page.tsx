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
  { id: "path", label: "Learning Path", icon: Compass, href: "/path" },
  { id: "courses", label: "Courses", icon: BookOpen, href: "/courses" },
  { id: "ai-coach", label: "AI Coach", icon: Bot, href: "/ai-coach" },
  { id: "assessments", label: "Assessments", icon: CheckCircle, href: "/assessments", active: true },
  { id: "progress", label: "Progress", icon: BarChart3, href: "/progress" },
  { id: "notes", label: "Notes", icon: FileText, href: "#" },
  { id: "settings", label: "Settings", icon: Settings, href: "#" },
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
  const [generatedAssessments, setGeneratedAssessments] = useState<StaticAssessment[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeToast, setActiveToast] = useState<string | null>(null)
  
  const [attempts, setAttempts] = useState<any[]>([])

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

      if (profError || !profData || !profData.onboarding_completed) {
        router.replace("/onboarding")
        return
      }

      setProfile(profData as LearnerProfile)

      // Fetch dynamic active curriculum
      const curriculum = await getOrCreateActiveCurriculum(supabase, user.id)
      
      if (curriculum && curriculum.modules) {
        // Generate an assessment for each learning module
        const assessments = curriculum.modules.map(mod => 
          generateAssessmentForModule(mod, profData as LearnerProfile)
        )
        setGeneratedAssessments(assessments)
      }

      // Fetch historical attempts
      const { data: results, error: resultsError } = await supabase
        .from("assessment_results")
        .select("*")
        .eq("user_id", user.id)
        .order("attempted_at", { ascending: false })

      if (resultsError) throw resultsError
      
      setAttempts(results || [])

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

  const getAssessmentStatus = (assessmentId: string) => {
    const isCompleted = attempts.some(a => a.assessment_title === assessmentId)
    return isCompleted ? "Completed" : "Not Started"
  }

  const renderAssessmentCard = (assessment: StaticAssessment, isRecommended: boolean = false) => {
    const status = getAssessmentStatus(assessment.id)
    return (
      <div key={assessment.id} className={`group relative overflow-hidden rounded-xl border ${isRecommended ? 'border-primary/40 bg-primary/[0.02]' : 'border-border/40 bg-card'} p-5 shadow-sm transition-colors hover:border-primary/50 hover:shadow-md`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground text-base">
                {assessment.title}
              </h3>
              {isRecommended && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary">
                  <Sparkles size={10} /> Active
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {assessment.description}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle size={12}/> {assessment.questions.length} Questions</span>
              <span className="flex items-center gap-1"><Clock size={12}/> {assessment.estimated_minutes} min</span>
              <span className="capitalize text-foreground bg-muted px-2 py-0.5 rounded-full">{assessment.level}</span>
              <span className={`px-2 py-0.5 rounded-full font-medium ${status === 'Completed' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {status}
              </span>
            </div>
          </div>
          
          <Link 
            href={`/assessments/${assessment.id}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <span>{status === 'Completed' ? 'Retake' : 'Start Validation'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

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

      <main className="flex-1 px-4 py-4 sm:px-6 md:px-10 xl:px-12 overflow-y-auto">
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
              Assessments generated dynamically from your active Learning Path modules.
            </p>
          </header>

          <hr className="border-t border-border/40" />

          {errorMessage && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              
              {generatedAssessments.length === 0 ? (
                <div className="text-sm text-muted-foreground">No active modules found in your Learning Path.</div>
              ) : (
                <div className="grid gap-6">
                  <div className="space-y-3">
                    <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-primary">
                      Module Validations
                    </span>
                    <div className="grid gap-4">
                      {generatedAssessments.map(a => renderAssessmentCard(a, true))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-1 space-y-6 border-t md:border-t-0 md:border-l border-border/40 md:pl-8 pt-6 md:pt-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                  Recent Attempts
                </span>
                <History size={14} className="text-muted-foreground" />
              </div>
              
              {attempts.length === 0 ? (
                <p className="text-xs text-muted-foreground">No assessments completed yet.</p>
              ) : (
                <div className="space-y-4">
                  {attempts.map((attempt) => {
                    // Try to map ID back to title from current active modules, fallback to raw string
                    const mappedAssessment = generatedAssessments.find(a => a.id === attempt.assessment_title)
                    const title = mappedAssessment?.title || attempt.metadata?.module_title || attempt.assessment_title
                    const date = new Date(attempt.attempted_at).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric'
                    })
                    const isToday = new Date(attempt.attempted_at).toDateString() === new Date().toDateString()
                    
                    return (
                      <div key={attempt.id} className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-medium text-foreground line-clamp-1">{title}</h4>
                          <span className={`text-[11px] font-semibold ${attempt.passed ? 'text-primary' : 'text-destructive'}`}>
                            {Math.round(attempt.score)}%
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {isToday ? "Today" : date}
                        </p>
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
