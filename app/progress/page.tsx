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
  TrendingUp,
  TrendingDown,
  Target,
  ArrowRight,
  Clock,
  Activity,
  Award
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import { getProgressViewModel, type ProgressViewModel } from "@/lib/services/progress-service"

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
  { id: "courses", label: "Courses", icon: BookOpen, href: "#" },
  { id: "ai-coach", label: "AI Coach", icon: Bot, href: "/ai-coach" },
  { id: "assessments", label: "Assessments", icon: CheckCircle, href: "/assessments" },
  { id: "progress", label: "Progress", icon: BarChart3, href: "/progress", active: true },
  { id: "notes", label: "Notes", icon: FileText, href: "#" },
  { id: "settings", label: "Settings", icon: Settings, href: "#" },
]

export default function ProgressPage() {
  return (
    <ProtectedRoute>
      <ProgressContent />
    </ProtectedRoute>
  )
}

function ProgressContent() {
  const router = useRouter()
  const { user, isConfigured, signOut } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [viewModel, setViewModel] = useState<ProgressViewModel | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeToast, setActiveToast] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!user) return
    if (!isConfigured) {
      router.replace("/login")
      return
    }

    try {
      const vm = await getProgressViewModel(supabase, user.id)
      if (!vm || !vm.profile.onboarding_completed) {
        router.replace("/onboarding")
        return
      }
      setViewModel(vm)
    } catch (err) {
      console.error("Error loading progress data:", err)
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

  if (loading || !viewModel) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Analyzing Metrics...
          </p>
        </div>
      </div>
    )
  }

  const displayName = viewModel.profile.display_name || user?.user_metadata?.full_name || "Learner"
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
        <div className="max-w-[1000px] space-y-8 pb-12">
          
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
              Learning Analytics
            </span>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground md:text-4xl">
              Progress & Performance
            </h1>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* OVERALL PROGRESS */}
            <div className="md:col-span-2 rounded-2xl border border-border/40 bg-card p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-4">Overall Progress</h3>
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-5xl font-serif text-primary tracking-tight">
                    {viewModel.overallProgress.percentage}<span className="text-3xl text-muted-foreground">%</span>
                  </span>
                  <span className="text-sm text-muted-foreground pb-1">
                    {viewModel.overallProgress.completedModules} of {viewModel.overallProgress.totalModules} modules completed
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full mt-4">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-out" 
                    style={{ width: `${viewModel.overallProgress.percentage}%` }}
                  />
                </div>
              </div>

              {viewModel.currentFocus.module ? (
                <div className="mt-8 pt-6 border-t border-border/40">
                  <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    Current Focus
                  </h4>
                  <p className="text-base font-medium text-foreground">
                    {viewModel.currentFocus.module.title}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target size={12} />
                      {viewModel.currentFocus.assessmentAttempts === 0 
                        ? "Assessment not attempted" 
                        : `Latest validation: ${viewModel.currentFocus.latestScore}%`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-8 pt-6 border-t border-border/40">
                  <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    Current Focus
                  </h4>
                  <p className="text-sm font-medium text-muted-foreground">
                    {viewModel.plan ? "All modules completed in current plan." : "Complete your learner profile to build your learning trajectory."}
                  </p>
                </div>
              )}
            </div>

            {/* TARGET TRAJECTORY */}
            <div className="md:col-span-1 rounded-2xl border border-border/40 bg-card p-6 shadow-sm flex flex-col">
              <h3 className="text-sm font-medium text-foreground mb-4">Target Trajectory</h3>
              
              {viewModel.targetTrajectory.targetDate ? (
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                    <Compass size={28} />
                  </div>
                  <div className="text-3xl font-serif text-foreground mb-1">
                    {viewModel.targetTrajectory.daysRemaining}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
                    Days Remaining
                  </div>
                  <p className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                    Target: {new Date(viewModel.targetTrajectory.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-center text-muted-foreground">
                  <Target size={24} className="mb-3 opacity-20" />
                  <p className="text-xs">Set a target date to track your learning trajectory.</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              {/* ASSESSMENT PERFORMANCE */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Assessment Performance</h3>
                </div>
                
                {viewModel.assessmentPerformance.totalAttempts === 0 ? (
                  <div className="rounded-xl border border-border/40 bg-card p-6 text-center shadow-sm">
                    <Award size={24} className="mx-auto mb-3 text-muted-foreground opacity-30" />
                    <p className="text-xs text-muted-foreground">Your assessment performance will appear here after your first attempt.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl border border-border/40 bg-card p-4 shadow-sm text-center">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Average</div>
                      <div className="text-2xl font-serif">{viewModel.assessmentPerformance.averageScore}%</div>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-card p-4 shadow-sm text-center">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Best</div>
                      <div className="text-2xl font-serif text-primary">{viewModel.assessmentPerformance.bestScore}%</div>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-card p-4 shadow-sm text-center">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Latest</div>
                      <div className="text-2xl font-serif">{viewModel.assessmentPerformance.latestScore}%</div>
                    </div>
                  </div>
                )}
              </section>

              {/* SKILL MASTERY */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Skill Mastery</h3>
                </div>
                
                {viewModel.skillMastery.length === 0 ? (
                  <div className="rounded-xl border border-border/40 bg-card p-6 text-center shadow-sm">
                    <BarChart3 size={24} className="mx-auto mb-3 text-muted-foreground opacity-30" />
                    <p className="text-xs text-muted-foreground">Complete an assessment to begin measuring skill mastery.</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm space-y-5">
                    {viewModel.skillMastery.map((skill, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-medium text-foreground">{skill.topic}</span>
                          <div className="flex items-center gap-2">
                            {skill.trend !== null && skill.trend !== 0 && (
                              <span className={`flex items-center text-[10px] font-medium ${skill.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {skill.trend > 0 ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                                {Math.abs(skill.trend)}%
                              </span>
                            )}
                            <span className="text-sm font-serif">{skill.latestScore}%</span>
                          </div>
                        </div>
                        <div className="h-1 w-full bg-muted overflow-hidden rounded-full">
                          <div 
                            className={`h-full transition-all duration-500 ease-out ${skill.latestScore >= 75 ? 'bg-primary' : 'bg-muted-foreground'}`} 
                            style={{ width: `${skill.latestScore}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* LEARNING TRAJECTORY */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Learning Trajectory</h3>
                </div>
                
                {viewModel.modules.length === 0 ? (
                  <div className="rounded-xl border border-border/40 bg-card p-6 text-center shadow-sm">
                    <Compass size={24} className="mx-auto mb-3 text-muted-foreground opacity-30" />
                    <p className="text-xs text-muted-foreground">Complete your learner profile to build your learning trajectory.</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm space-y-4">
                    {viewModel.modules.map((mod, idx) => {
                      const isCompleted = mod.status === 'completed'
                      const isCurrent = mod.id === viewModel.currentFocus.module?.id
                      
                      return (
                        <div key={mod.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium transition-colors ${
                              isCompleted ? 'border-primary bg-primary text-primary-foreground' : 
                              isCurrent ? 'border-primary text-primary bg-primary/5' : 
                              'border-border/60 text-muted-foreground bg-muted/30'
                            }`}>
                              {isCompleted ? <CheckCircle size={10} /> : idx + 1}
                            </div>
                            {idx < viewModel.modules.length - 1 && (
                              <div className={`w-px flex-1 my-1 ${isCompleted ? 'bg-primary/30' : 'bg-border/40'}`} />
                            )}
                          </div>
                          <div className="pb-4 pt-0.5">
                            <h4 className={`text-sm font-medium ${isCurrent || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {mod.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed max-w-md">
                              {mod.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>

            <div className="lg:col-span-1 space-y-8">
              
              {/* AREAS TO IMPROVE */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Areas to Improve</h3>
                
                {viewModel.areasToImprove.length === 0 ? (
                  <div className="rounded-xl border border-border/40 bg-card p-5 text-center shadow-sm">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {viewModel.assessmentPerformance.totalAttempts === 0 
                        ? "Complete more assessments to identify areas that need attention."
                        : "You're demonstrating solid proficiency across all tested skills. Keep it up!"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {viewModel.areasToImprove.map((skill, idx) => (
                      <div key={idx} className="rounded-xl border border-border/40 bg-card p-4 shadow-sm border-l-2 border-l-destructive/50">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-semibold text-foreground">{skill.topic}</h4>
                          <span className="text-[11px] font-medium text-destructive">{skill.latestScore}%</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          Demonstrated lower proficiency in recent validations. Practice more practical applications in this area.
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* RECENT ACTIVITY */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Recent Activity</h3>
                </div>
                
                {viewModel.recentActivity.length === 0 ? (
                  <div className="rounded-xl border border-border/40 bg-card p-5 text-center shadow-sm">
                    <Activity size={20} className="mx-auto mb-2 text-muted-foreground opacity-30" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      No recent activity recorded.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {viewModel.recentActivity.map((event) => {
                      const isAssessment = event.type === 'assessment_attempted'
                      const Icon = isAssessment ? CheckCircle : BookOpen
                      const date = new Date(event.timestamp)
                      const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                      
                      return (
                        <div key={event.id} className="rounded-xl border border-border/40 bg-card p-4 shadow-sm flex gap-3 items-start">
                          <div className={`mt-0.5 p-1.5 rounded-md ${isAssessment ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            <Icon size={12} />
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-foreground line-clamp-1">{event.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-muted-foreground">{dateStr}</span>
                              {event.detail && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-border" />
                                  <span className="text-[10px] font-medium text-foreground">{event.detail}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
              
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
