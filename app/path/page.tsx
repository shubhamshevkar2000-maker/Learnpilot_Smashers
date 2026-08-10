"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import {
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle2,
  Circle,
  Clock,
  PlayCircle,
  AlertCircle,
  Target,
  Flame,
  Calendar,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { createClient } from "@/lib/supabase/client"
import {
  getActiveCurriculumFoundation,
  generateSchedule,
  type ActiveCurriculum,
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

export default function LearningPathPage() {
  return (
    <ProtectedRoute>
      <LearningPathContent />
    </ProtectedRoute>
  )
}

function LearningPathContent() {
  const router = useRouter()
  const { user, isConfigured } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [profile, setProfile] = useState<LearnerProfile | null>(null)
  const [curriculum, setCurriculum] = useState<ActiveCurriculum | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false)

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

      if (!res.ok) {
        setErrorMessage("Request failed with HTTP status " + res.status)
        return
      }

      // Reload path data from Supabase after successful generation
      await loadPathData()
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred.")
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

      if (!res.ok) {
        setErrorMessage("Failed to regenerate.")
        return
      }

      // Reload fresh path data from Supabase
      await loadPathData()
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred.")
    } finally {
      setGenerating(false)
    }
  }

  const hasPlan = Boolean(curriculum && curriculum.plan)
  const modulesList = useMemo(() => curriculum?.modules || [], [curriculum])
  const completedModulesCount = useMemo(
    () => modulesList.filter((m) => m.status === "completed").length,
    [modulesList]
  )

  const totalActivitiesCount = useMemo(
    () => modulesList.reduce((acc, m) => acc + (m.activities?.length || 0), 0),
    [modulesList]
  )

  const completedActivitiesCount = useMemo(
    () => modulesList.reduce((acc, m) => acc + (m.activities?.filter((a) => a.is_completed).length || 0), 0),
    [modulesList]
  )

  const overallProgressPercentage = useMemo(() => {
    if (totalActivitiesCount > 0) {
      return Math.round((completedActivitiesCount / totalActivitiesCount) * 100)
    }
    if (modulesList.length > 0) {
      return Math.round((completedModulesCount / modulesList.length) * 100)
    }
    return 0
  }, [totalActivitiesCount, completedActivitiesCount, completedModulesCount, modulesList.length])

  // Memoized schedule computation
  const schedule = useMemo(() => {
    if (!profile || modulesList.length === 0) return null
    return generateSchedule(profile, modulesList)
  }, [profile, modulesList])

  // "Today" is the first day that has an incomplete activity, or the last day if all are completed
  const todayDayNumber = useMemo(() => {
    if (!schedule || !schedule.days || schedule.days.length === 0) return 1
    const firstIncompleteDay = schedule.days.find((d) => d.activities.some((a) => !a.is_completed))
    return firstIncompleteDay?.dayNumber ?? schedule.days[schedule.days.length - 1]?.dayNumber ?? 1
  }, [schedule])

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

  const dailyMinutes = Number(profile?.available_daily_minutes) || 30
  const levelLabel = profile?.current_level ? LEVEL_LABELS[profile.current_level] || "Foundational Basics" : "Foundational Basics"

  return (
    <AppShell maxWidth="900px">
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="font-serif text-2xl font-normal tracking-tight text-foreground sm:text-3xl">
            {hasPlan ? "Personalized Roadmap" : "Personalized Learning Path"}
          </h1>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {hasPlan
              ? curriculum?.plan?.goal_summary || `Your tailored learning progression for ${profile?.learning_goal || "your goal"}.`
              : `Your tailored learning progression for ${profile?.learning_goal || "your goal"}.`}
          </p>
        </header>

        {/* Learner Context Baseline Header Bar */}
        {profile && (
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border/40 bg-card/40 px-4 py-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Target size={13} className="text-primary shrink-0" />
              <span className="font-medium text-foreground">{profile.learning_goal || "Personalized Goal"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame size={13} className="text-primary shrink-0" />
              <span>{levelLabel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-primary shrink-0" />
              <span>{dailyMinutes} min/day</span>
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
                  Your current learning path will be safely archived as a historical record, and a fresh personalized curriculum based on your <strong>{dailyMinutes} min/day</strong> daily study budget will be generated.
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
                LearnPilot will map your sequential modules and activities based on your goal ({profile?.learning_goal || "your goal"}) and level ({levelLabel}).
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
                  YOUR ROADMAP ({modulesList.length} {modulesList.length === 1 ? "Phase" : "Phases"})
                </span>
                <span className="text-[11px] text-muted-foreground font-medium">
                  • {completedModulesCount} of {modulesList.length} phases completed ({overallProgressPercentage}%)
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
            <div className="space-y-8">
              {schedule && schedule.days.map((day) => {
                const completedMins = day.activities.reduce(
                  (sum, act) => sum + (act.is_completed ? (Number(act.estimated_minutes) || 20) : 0),
                  0
                )
                const totalDayMins = Number(day.totalMinutes) || day.activities.reduce(
                  (sum, act) => sum + (Number(act.estimated_minutes) || 20),
                  0
                )
                const isDayComplete = day.activities.length > 0 && day.activities.every((a) => a.is_completed)
                const isToday = day.dayNumber === todayDayNumber
                const completedTasksCount = day.activities.filter((a) => a.is_completed).length
                const totalTasksCount = day.activities.length

                let dayStatusLabel = "UPCOMING"
                let dayStatusColor = "text-muted-foreground"

                if (isDayComplete) {
                  dayStatusLabel = "COMPLETED"
                  dayStatusColor = "text-emerald-500"
                } else if (isToday) {
                  dayStatusLabel = "TODAY"
                  dayStatusColor = "text-primary"
                }

                return (
                  <div key={`day-${day.dayNumber}`} className="group border-b border-border/40 pb-6 space-y-4 transition-colors">
                    {/* Day Header */}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-2">
                        <span className={dayStatusColor}>{dayStatusLabel}</span>
                        <span>•</span>
                        <span>PHASE {day.dayNumber}</span>
                      </span>
                      <h2 className="font-serif text-xl font-normal text-foreground mt-1 mb-1">
                        {day.activities[0]?.module_title || `Phase ${day.dayNumber}`}
                      </h2>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-primary/70" />
                          <span>{completedMins} / {totalDayMins} min</span>
                        </div>
                        <span>•</span>
                        <span className="font-medium">
                          {completedTasksCount} / {totalTasksCount} tasks
                        </span>
                      </div>
                    </div>

                    {/* Day Activities */}
                    <div className="space-y-2.5">
                      {day.activities.map((act) => (
                        <div
                          key={act.id}
                          className={`flex items-center justify-between rounded-xl border ${
                            act.is_completed
                              ? "border-emerald-500/30 bg-emerald-500/5"
                              : isToday
                              ? "border-primary/30 bg-primary/5"
                              : "border-border/30 bg-card/30"
                          } px-4 py-3 text-sm transition-all`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {act.is_completed ? (
                              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                            ) : (
                              <Circle size={16} className={`${isToday ? "text-primary/50" : "text-muted-foreground/50"} shrink-0`} />
                            )}
                            <div className="flex flex-col min-w-0 gap-0.5">
                              <span className={`truncate font-medium ${act.is_completed ? "text-foreground/70" : "text-foreground"}`}>
                                {act.title || "Activity"}
                              </span>
                              <span className="text-[10px] text-muted-foreground truncate">
                                {act.module_title || "Module"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {Number(act.estimated_minutes) || 20}m
                            </span>
                            {!act.is_completed && isToday && (
                              <Link
                                href="/journey"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-[10px] font-medium text-primary hover:bg-primary/20 transition-colors"
                              >
                                <span>Start</span>
                                <ArrowRight size={12} />
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
