// @ts-nocheck
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import {
  Compass,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trophy,
  FilePlus,
  ArrowRight,
  X,
  Tag,
  PlayCircle,
  PauseCircle,
  Square,
  Timer,
  Lock,
  Sparkles,
  Image as ImageIcon,
  Check,
  Maximize2,
  Trash2,
  ExternalLink,
  RotateCcw,
  StopCircle,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { createClient } from "@/lib/supabase/client"
import { createNote, compressImageFile } from "@/lib/services/notes-service"
import {
  getActiveCurriculumFoundation,
  completeActivity,
  generateSchedule,
  type ActiveCurriculum,
} from "@/lib/services/curriculum-service"
import type { LearnerProfile, ModuleActivity, ActivityType } from "@/types/database.types"

// Readable activity type labels & styles
const ACTIVITY_TYPES: Record<ActivityType, { label: string; bg: string; text: string }> = {
  concept: { label: "Concept", bg: "bg-purple-500/10 dark:bg-purple-400/10", text: "text-purple-600 dark:text-purple-300" },
  exercise: { label: "Exercise", bg: "bg-blue-500/10 dark:bg-blue-400/10", text: "text-blue-600 dark:text-blue-300" },
  project: { label: "Project", bg: "bg-amber-500/10 dark:bg-amber-400/10", text: "text-amber-600 dark:text-amber-300" },
  reflection: { label: "Reflection", bg: "bg-emerald-500/10 dark:bg-emerald-400/10", text: "text-emerald-600 dark:text-emerald-300" },
}

export interface FlattenedActivity extends ModuleActivity {
  module_title: string
  module_description: string | null
  module_sequence: number
}

export type TimerStatus = "running" | "paused" | "stopped"

export interface ActivityTimerState {
  activityId: string
  moduleId: string
  durationSeconds: number
  accumulatedSeconds: number
  status: TimerStatus
  lastStartedAt: number | null
  // Legacy support
  startTime?: number
}

function getTimerStorageKey(userId: string, activityId: string): string {
  return `learnpilot_journey_timer_${userId}_${activityId}`
}

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
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
  const searchParams = useSearchParams()
  const { user, isConfigured } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<LearnerProfile | null>(null)
  const [curriculum, setCurriculum] = useState<ActiveCurriculum | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeToast, setActiveToast] = useState<string | null>(null)

  // Timer States
  const [now, setNow] = useState<number>(Date.now())
  const [activeTimers, setActiveTimers] = useState<Record<string, ActivityTimerState>>({})

  // Selected Activity modal state
  const [selectedActivity, setSelectedActivity] = useState<FlattenedActivity | null>(null)
  const [stopConfirmActivity, setStopConfirmActivity] = useState<FlattenedActivity | null>(null)

  // Mark Complete & Add Note modal state
  const [noteModalActivity, setNoteModalActivity] = useState<FlattenedActivity | null>(null)
  const [noteModalTitle, setNoteModalTitle] = useState("")
  const [noteModalContent, setNoteModalContent] = useState("")
  const [noteModalTagInput, setNoteModalTagInput] = useState("")
  const [noteModalTags, setNoteModalTags] = useState<string[]>([])
  const [noteModalImages, setNoteModalImages] = useState<string[]>([])
  const [isSavingNoteAndComplete, setIsSavingNoteAndComplete] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const noteFileInputRef = useRef<HTMLInputElement | null>(null)

  // Continuous Clock tick for real-time timers
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Restore active timers from localStorage
  const loadSavedTimers = useCallback(() => {
    if (!user || typeof window === "undefined") return
    try {
      const restored: Record<string, ActivityTimerState> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(`learnpilot_journey_timer_${user.id}_`)) {
          const raw = localStorage.getItem(key)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed && parsed.activityId) {
              if (parsed.status) {
                restored[parsed.activityId] = {
                  activityId: parsed.activityId,
                  moduleId: parsed.moduleId || "",
                  durationSeconds: parsed.durationSeconds || 1200,
                  accumulatedSeconds: typeof parsed.accumulatedSeconds === "number" ? parsed.accumulatedSeconds : 0,
                  status: parsed.status,
                  lastStartedAt: parsed.lastStartedAt || null,
                }
              } else if (parsed.startTime) {
                // Migrate legacy running timers
                const elapsed = Math.max(0, Math.floor((Date.now() - parsed.startTime) / 1000))
                restored[parsed.activityId] = {
                  activityId: parsed.activityId,
                  moduleId: parsed.moduleId || "",
                  durationSeconds: parsed.durationSeconds || 1200,
                  accumulatedSeconds: elapsed,
                  status: "running",
                  lastStartedAt: parsed.startTime,
                }
              }
            }
          }
        }
      }
      setActiveTimers(restored)
    } catch (err) {
      console.error("Failed to load saved activity timers:", err)
    }
  }, [user])

  const saveTimerToStorage = (timer: ActivityTimerState) => {
    if (!user || typeof window === "undefined") return
    try {
      localStorage.setItem(getTimerStorageKey(user.id, timer.activityId), JSON.stringify(timer))
      setActiveTimers((prev) => ({ ...prev, [timer.activityId]: timer }))
    } catch (err) {
      console.error("Failed to save timer:", err)
    }
  }

  const removeTimerFromStorage = (activityId: string) => {
    if (!user || typeof window === "undefined") return
    try {
      localStorage.removeItem(getTimerStorageKey(user.id, activityId))
      setActiveTimers((prev) => {
        const next = { ...prev }
        delete next[activityId]
        return next
      })
    } catch (err) {
      console.error("Failed to remove timer:", err)
    }
  }

  const getTimerInfo = (act: FlattenedActivity) => {
    const durationMinutes = act.estimated_minutes || 20
    const durationSeconds = durationMinutes * 60
    const timer = activeTimers[act.id]

    if (!timer) {
      return {
        isStarted: false,
        status: "idle" as const,
        durationMinutes,
        durationSeconds,
        elapsedSeconds: 0,
        remainingSeconds: durationSeconds,
        isEligible: false,
        progressPercent: 0,
      }
    }

    let elapsedSeconds = timer.accumulatedSeconds || 0
    if (timer.status === "running" && timer.lastStartedAt) {
      const currentSegment = Math.max(0, Math.floor((now - timer.lastStartedAt) / 1000))
      elapsedSeconds += currentSegment
    }

    const remainingSeconds = Math.max(0, timer.durationSeconds - elapsedSeconds)
    const isEligible = elapsedSeconds >= timer.durationSeconds
    const progressPercent = Math.min(100, Math.round((elapsedSeconds / timer.durationSeconds) * 100))

    return {
      isStarted: true,
      status: timer.status,
      durationMinutes: Math.round(timer.durationSeconds / 60),
      durationSeconds: timer.durationSeconds,
      elapsedSeconds,
      remainingSeconds,
      isEligible,
      progressPercent,
    }
  }

  // 1. Start or Open Activity
  const handleStartActivity = (act: FlattenedActivity) => {
    if (!user) return
    const timer = activeTimers[act.id]

    if (!timer) {
      const durationMinutes = act.estimated_minutes || 20
      const durationSeconds = durationMinutes * 60
      const newTimer: ActivityTimerState = {
        activityId: act.id,
        moduleId: act.module_id,
        durationSeconds,
        accumulatedSeconds: 0,
        status: "running",
        lastStartedAt: Date.now(),
      }
      saveTimerToStorage(newTimer)
      setActiveToast(`Timer started: ${durationMinutes} min allotted for "${act.title}"`)
      setTimeout(() => setActiveToast(null), 3000)
    } else if (timer.status === "paused" || timer.status === "stopped") {
      // Resume
      const resumedTimer: ActivityTimerState = {
        ...timer,
        status: "running",
        lastStartedAt: Date.now(),
      }
      saveTimerToStorage(resumedTimer)
      setActiveToast(`Timer resumed for "${act.title}".`)
      setTimeout(() => setActiveToast(null), 2500)
    }

    setSelectedActivity(act)
  }

  // 2. Pause Timer
  const handlePauseTimer = (act: FlattenedActivity, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const timer = activeTimers[act.id]
    if (!timer || timer.status !== "running") return

    const currentSegment = timer.lastStartedAt ? Math.max(0, Math.floor((Date.now() - timer.lastStartedAt) / 1000)) : 0
    const newAccumulated = (timer.accumulatedSeconds || 0) + currentSegment

    const updatedTimer: ActivityTimerState = {
      ...timer,
      accumulatedSeconds: newAccumulated,
      status: "paused",
      lastStartedAt: null,
    }

    saveTimerToStorage(updatedTimer)
    setActiveToast(`Timer paused. Elapsed: ${formatDuration(newAccumulated)}`)
    setTimeout(() => setActiveToast(null), 2500)
  }

  // 3. Resume Timer
  const handleResumeTimer = (act: FlattenedActivity, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const timer = activeTimers[act.id]
    if (!timer) {
      handleStartActivity(act)
      return
    }

    const updatedTimer: ActivityTimerState = {
      ...timer,
      status: "running",
      lastStartedAt: Date.now(),
    }

    saveTimerToStorage(updatedTimer)
    setActiveToast(`Timer resumed for "${act.title}".`)
    setTimeout(() => setActiveToast(null), 2500)
  }

  // 4. Prompt Stop Session
  const handlePromptStopSession = (act: FlattenedActivity, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setStopConfirmActivity(act)
  }

  // 5. Confirm Stop Session
  const handleConfirmStopSession = () => {
    if (!stopConfirmActivity) return
    const act = stopConfirmActivity
    const timer = activeTimers[act.id]

    let finalAccumulated = 0
    if (timer) {
      const currentSegment =
        timer.status === "running" && timer.lastStartedAt
          ? Math.max(0, Math.floor((Date.now() - timer.lastStartedAt) / 1000))
          : 0
      finalAccumulated = (timer.accumulatedSeconds || 0) + currentSegment

      const updatedTimer: ActivityTimerState = {
        ...timer,
        accumulatedSeconds: finalAccumulated,
        status: "stopped",
        lastStartedAt: null,
      }
      saveTimerToStorage(updatedTimer)
    }

    setStopConfirmActivity(null)
    if (selectedActivity?.id === act.id) {
      setSelectedActivity(null)
    }

    setActiveToast(`Session stopped. Saved ${formatDuration(finalAccumulated)} accumulated time.`)
    setTimeout(() => setActiveToast(null), 3500)
  }

  // 6. Close & Continue Later
  const handleCloseAndContinueLater = () => {
    setSelectedActivity(null)
    setActiveToast("Session state preserved. You can continue anytime.")
    setTimeout(() => setActiveToast(null), 2500)
  }

  const handleOpenCompleteWithNote = (act: FlattenedActivity) => {
    const timerInfo = getTimerInfo(act)
    if (!timerInfo.isEligible) {
      setActiveToast(
        `Please complete the required ${timerInfo.durationMinutes} min activity duration before taking final completion notes.`
      )
      setTimeout(() => setActiveToast(null), 3500)
      return
    }

    setNoteModalActivity(act)
    setNoteModalTitle(`Key takeaways: ${act.title}`)
    setNoteModalContent("")
    setNoteModalTags([
      "daily_journey",
      `day-${activeDay}`,
      act.module_title ? act.module_title.toLowerCase().replace(/[^a-z0-9]/g, "-") : "journey",
    ])
    setNoteModalImages([])
    setNoteModalTagInput("")
  }

  const handleAddNoteTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const tagClean = noteModalTagInput.trim().replace(/^#/, "").toLowerCase()
      if (tagClean && !noteModalTags.includes(tagClean)) {
        setNoteModalTags((prev) => [...prev, tagClean])
        setNoteModalTagInput("")
      }
    }
  }

  const handleRemoveNoteTag = (tToRemove: string) => {
    setNoteModalTags((prev) => prev.filter((t) => t !== tToRemove))
  }

  const handleNoteImageSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setIsUploadingImage(true)
    try {
      const newUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.type.startsWith("image/")) {
          const compressed = await compressImageFile(file, 1200, 0.82)
          if (compressed) newUrls.push(compressed)
        }
      }
      if (newUrls.length > 0) {
        setNoteModalImages((prev) => [...prev, ...newUrls])
      }
    } catch (err) {
      console.error("Failed to compress note image:", err)
    } finally {
      setIsUploadingImage(false)
      if (noteFileInputRef.current) noteFileInputRef.current.value = ""
    }
  }

  const handleSaveNoteAndComplete = async () => {
    if (!user || !noteModalActivity || isSavingNoteAndComplete) return
    setIsSavingNoteAndComplete(true)
    setErrorMessage(null)

    try {
      // 1. Create and persist structured note
      await createNote(supabase, user.id, {
        title: noteModalTitle.trim() || `Key takeaways: ${noteModalActivity.title}`,
        content: noteModalContent.trim() || `Completed ${noteModalActivity.title} during Day ${activeDay} Daily Journey.`,
        tags: noteModalTags,
        images: noteModalImages,
        source_type: "daily_journey",
        source_id: noteModalActivity.id,
        source_title: noteModalActivity.title,
        source_day: activeDay,
        source_module_id: noteModalActivity.module_id,
        source_module_title: noteModalActivity.module_title,
        source_sequence: noteModalActivity.sequence_order,
      })

      // 2. Mark activity complete in curriculum service
      const success = await completeActivity(supabase, user.id, noteModalActivity.id, noteModalActivity.module_id)

      if (success) {
        // 3. Clear timer from local storage
        removeTimerFromStorage(noteModalActivity.id)

        // 4. Update curriculum state
        setCurriculum((prev) => {
          if (!prev) return null
          const updatedModules = prev.modules.map((m) => {
            if (m.id !== noteModalActivity.module_id) return m
            const updatedActs = (m.activities || []).map((a) =>
              a.id === noteModalActivity.id ? { ...a, is_completed: true, completed_at: new Date().toISOString() } : a
            )
            return { ...m, activities: updatedActs }
          })
          return { ...prev, modules: updatedModules }
        })

        if (selectedActivity?.id === noteModalActivity.id) {
          setSelectedActivity(null)
        }

        setNoteModalActivity(null)
        setActiveToast(`Completed "${noteModalActivity.title}" & saved note to your Notebook!`)
        setTimeout(() => setActiveToast(null), 3500)
      } else {
        setErrorMessage("Saved note, but failed to update activity completion. Please try again.")
      }
    } catch (err) {
      console.error("Error saving note and completing activity:", err)
      setErrorMessage("Could not complete activity and save note. Please check your connection.")
    } finally {
      setIsSavingNoteAndComplete(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

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
      loadSavedTimers()

      // Handle deep link from /notes Open Source
      const paramActivityId = searchParams.get("activity_id")
      if (paramActivityId && curriculumData?.modules) {
        for (const mod of curriculumData.modules) {
          const found = (mod.activities || []).find((a) => a.id === paramActivityId)
          if (found) {
            setSelectedActivity({
              ...found,
              module_title: mod.title,
              module_description: mod.description,
              module_sequence: mod.sequence_order,
            } as FlattenedActivity)
            break
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to load your Daily Journey from database. Please refresh.")
    } finally {
      setLoading(false)
    }
  }, [user, isConfigured, supabase, router, loadSavedTimers, searchParams])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) return null

  const displayName = profile?.display_name || user?.user_metadata?.full_name || "Learner"
  const dailyBudget = profile?.available_daily_minutes || 45

  let todaysBatch: FlattenedActivity[] = []
  let activeDay = 1
  let allActivities: FlattenedActivity[] = []
  let incompleteActivities: FlattenedActivity[] = []

  if (curriculum && curriculum.modules && profile) {
    const schedule = generateSchedule(profile, curriculum.modules)
    allActivities = schedule.days.flatMap((d) => d.activities) as FlattenedActivity[]
    incompleteActivities = allActivities.filter((a) => !a.is_completed)

    let currentActiveDay = schedule.days[0]
    for (const day of schedule.days) {
      if (day.activities.some((a) => !a.is_completed)) {
        currentActiveDay = day
        break
      }
    }

    if (currentActiveDay) {
      activeDay = currentActiveDay.dayNumber
      todaysBatch = currentActiveDay.activities.map((act) => ({
        ...act,
        module_description: "",
        module_sequence: 1,
      })) as FlattenedActivity[]
    }
  }

  const todaysCompletedCount = todaysBatch.filter((a) => a.is_completed).length
  const todaysTotalMins = todaysBatch.reduce((sum, a) => sum + (a.estimated_minutes || 20), 0)
  const isTodayComplete = todaysBatch.length > 0 && todaysCompletedCount === todaysBatch.length

  return (
    <AppShell maxWidth="1100px">
      {/* Toast Notification */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-full border border-border/80 bg-card/95 px-4 py-2 text-xs text-foreground shadow-md backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <span>{activeToast}</span>
        </div>
      )}

      <PageHeader
        eyebrow="DAILY JOURNEY"
        title={`${getGreeting()}, ${displayName}.`}
        description="Here's what your learning session looks like today."
      />

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {(!curriculum || !curriculum.plan) && (
        <div className="rounded-2xl border border-border/50 bg-card p-8 text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Compass size={24} />
          </div>
          <h3 className="font-serif text-lg font-normal text-foreground">Your learning journey hasn't been created yet.</h3>
          <Link
            href="/path"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm"
          >
            <span>Go to Learning Path</span>
          </Link>
        </div>
      )}

      {curriculum && curriculum.plan && allActivities.length > 0 && incompleteActivities.length === 0 && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <Trophy size={24} />
          </div>
          <h3 className="font-serif text-xl font-normal text-foreground">LEARNING PATH COMPLETE</h3>
          <Link
            href="/path"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm"
          >
            <span>View Learning Path</span>
          </Link>
        </div>
      )}

      {curriculum && curriculum.plan && todaysBatch.length > 0 && (
        <div className="rounded-2xl border border-border/50 bg-card/60 p-6 md:p-8 backdrop-blur-md space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                TODAY'S JOURNEY • DAY {activeDay}
              </span>
              <h2 className="font-serif text-2xl font-normal text-foreground mt-0.5">
                {todaysBatch[0]?.module_title || "Curriculum Focus"}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
              <Clock size={13} className="text-primary" />
              <span>{dailyBudget} min daily budget</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">
                {todaysCompletedCount} / {todaysBatch.length} complete
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(todaysCompletedCount / todaysBatch.length) * 100}%` }}
              />
            </div>
          </div>

          {isTodayComplete ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
              <CheckCircle2 size={20} className="mx-auto text-emerald-500" />
              <h3 className="font-serif text-lg font-normal text-foreground">TODAY'S JOURNEY COMPLETE</h3>
              <p className="text-xs text-muted-foreground">{todaysTotalMins} minutes well spent.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysBatch.map((act) => {
                const typeInfo = ACTIVITY_TYPES[act.activity_type] || ACTIVITY_TYPES.concept
                const timerInfo = getTimerInfo(act)

                return (
                  <div
                    key={act.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition-all ${
                      act.is_completed
                        ? "border-emerald-500/30 bg-emerald-500/[0.03]"
                        : timerInfo.status === "running"
                        ? "border-primary/50 bg-primary/[0.03] shadow-xs"
                        : timerInfo.status === "paused"
                        ? "border-amber-500/40 bg-amber-500/[0.02]"
                        : timerInfo.status === "stopped"
                        ? "border-border/80 bg-muted/20"
                        : "border-border/50 hover:border-border"
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium uppercase ${typeInfo.bg} ${typeInfo.text}`}
                        >
                          {typeInfo.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                          <Clock size={11} />
                          {act.estimated_minutes || 20} min
                        </span>

                        {/* Status Badges */}
                        {timerInfo.isStarted && !act.is_completed && (
                          <>
                            {timerInfo.status === "running" && (
                              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-primary/10 text-primary border border-primary/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                <span>Running:</span>
                                <span>
                                  {formatDuration(timerInfo.elapsedSeconds)} / {formatDuration(timerInfo.durationSeconds)}
                                </span>
                              </span>
                            )}
                            {timerInfo.status === "paused" && (
                              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <PauseCircle size={10} />
                                <span>Paused:</span>
                                <span>
                                  {formatDuration(timerInfo.elapsedSeconds)} / {formatDuration(timerInfo.durationSeconds)}
                                </span>
                              </span>
                            )}
                            {timerInfo.status === "stopped" && (
                              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-muted text-muted-foreground border border-border/60">
                                <Square size={9} />
                                <span>Stopped:</span>
                                <span>
                                  {formatDuration(timerInfo.elapsedSeconds)} / {formatDuration(timerInfo.durationSeconds)}
                                </span>
                              </span>
                            )}
                            {timerInfo.isEligible && (
                              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <Check size={10} />
                                <span>Required Duration Met</span>
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-foreground truncate">{act.title}</h3>

                      {/* Mini progress bar if timer is active */}
                      {timerInfo.isStarted && !act.is_completed && (
                        <div className="h-1.5 w-48 max-w-full overflow-hidden rounded-full bg-muted/60 mt-1">
                          <div
                            className={`h-full transition-all duration-300 ${
                              timerInfo.isEligible
                                ? "bg-emerald-500"
                                : timerInfo.status === "paused"
                                ? "bg-amber-500"
                                : timerInfo.status === "stopped"
                                ? "bg-muted-foreground/60"
                                : "bg-primary"
                            }`}
                            style={{ width: `${timerInfo.progressPercent}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {act.is_completed ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-500 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 size={13} />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <>
                          {/* Quick Pause / Resume Action Buttons on Card */}
                          {timerInfo.isStarted && timerInfo.status === "running" && (
                            <button
                              onClick={(e) => handlePauseTimer(act, e)}
                              className="text-xs font-medium px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
                              title="Pause Timer"
                            >
                              <PauseCircle size={13} />
                              <span className="hidden sm:inline">Pause</span>
                            </button>
                          )}

                          {timerInfo.isStarted && (timerInfo.status === "paused" || timerInfo.status === "stopped") && (
                            <button
                              onClick={(e) => handleResumeTimer(act, e)}
                              className="text-xs font-medium px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all"
                              title="Resume Timer"
                            >
                              <PlayCircle size={13} />
                              <span className="hidden sm:inline">Resume</span>
                            </button>
                          )}

                          {/* Start / View Activity Main Button */}
                          <button
                            onClick={() => handleStartActivity(act)}
                            className={`text-xs font-medium px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                              timerInfo.isStarted
                                ? "bg-card border border-border/80 hover:bg-muted text-foreground"
                                : "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:opacity-90 active:scale-95"
                            }`}
                          >
                            <PlayCircle size={13} />
                            <span>
                              {!timerInfo.isStarted
                                ? `Start (${act.estimated_minutes || 20}m)`
                                : "Open Session"}
                            </span>
                          </button>

                          {/* Complete Action Button (Gated by dynamic required duration) */}
                          {timerInfo.isEligible ? (
                            <button
                              onClick={() => handleOpenCompleteWithNote(act)}
                              className="text-xs font-medium px-3.5 py-1.5 bg-emerald-500 text-white rounded-xl flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 hover:opacity-90 active:scale-95 transition-all"
                            >
                              <CheckCircle2 size={13} />
                              <span>Complete & Take Notes</span>
                            </button>
                          ) : (
                            <button
                              disabled={true}
                              className="text-xs font-medium px-3 py-1.5 bg-muted text-muted-foreground/60 rounded-xl flex items-center gap-1.5 cursor-not-allowed border border-border/30"
                              title={`Complete after ${timerInfo.durationMinutes} min. ${formatDuration(
                                timerInfo.remainingSeconds
                              )} remaining.`}
                            >
                              <Lock size={11} />
                              <span>
                                {timerInfo.isStarted
                                  ? `Complete in ${formatDuration(timerInfo.remainingSeconds)}`
                                  : `Complete after ${timerInfo.durationMinutes}m`}
                              </span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Stop Session Confirmation Modal */}
      {stopConfirmActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-2 rounded-full bg-amber-500/10">
                <StopCircle size={20} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Stop Current Session?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Stopping the session will freeze your active timer and preserve all accumulated progress (
              <span className="font-mono font-medium text-foreground">
                {formatDuration(getTimerInfo(stopConfirmActivity).elapsedSeconds)}
              </span>{" "}
              elapsed). You can resume this session anytime.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setStopConfirmActivity(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStopSession}
                className="px-3.5 py-2 rounded-xl text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm"
              >
                Stop Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Activity Detail & Live Timer Controls Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={handleCloseAndContinueLater}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Close & Continue Later"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-primary">
                DAY {activeDay} ACTIVITY • {selectedActivity.module_title || "Module Topic"}
              </span>
              <h3 className="font-serif text-xl font-normal text-foreground">{selectedActivity.title}</h3>
            </div>

            {/* Prominent Live Activity Timer Widget with Controls */}
            {(() => {
              const timerInfo = getTimerInfo(selectedActivity)
              return (
                <div className="rounded-xl border border-border/60 bg-muted/25 p-4 space-y-4">
                  {/* Status header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          timerInfo.isEligible
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : timerInfo.status === "running"
                            ? "bg-primary/10 text-primary border border-primary/30"
                            : timerInfo.status === "paused"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                            : "bg-muted text-muted-foreground border border-border/60"
                        }`}
                      >
                        {timerInfo.status === "running" && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                        )}
                        <span>
                          {timerInfo.isEligible
                            ? "Eligible for Completion"
                            : timerInfo.status === "running"
                            ? "Timer Running"
                            : timerInfo.status === "paused"
                            ? "Timer Paused"
                            : "Session Stopped"}
                        </span>
                      </span>
                    </div>

                    <span className="text-base font-mono font-bold text-foreground">
                      {formatDuration(timerInfo.elapsedSeconds)}{" "}
                      <span className="text-muted-foreground font-normal text-xs">
                        / {formatDuration(timerInfo.durationSeconds)}
                      </span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full transition-all duration-300 ${
                          timerInfo.isEligible
                            ? "bg-emerald-500"
                            : timerInfo.status === "paused"
                            ? "bg-amber-500"
                            : timerInfo.status === "stopped"
                            ? "bg-muted-foreground/60"
                            : "bg-primary"
                        }`}
                        style={{ width: `${timerInfo.progressPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>{timerInfo.progressPercent}% Completed</span>
                      <span>
                        {timerInfo.isEligible
                          ? "Required duration met"
                          : `${formatDuration(timerInfo.remainingSeconds)} remaining`}
                      </span>
                    </div>
                  </div>

                  {/* Pause / Resume / Stop Controls Toolbar */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                    {timerInfo.status === "running" ? (
                      <button
                        onClick={() => handlePauseTimer(selectedActivity)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-medium border border-amber-500/20 transition-colors"
                      >
                        <PauseCircle size={14} />
                        <span>Pause Timer</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleResumeTimer(selectedActivity)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-xs font-medium shadow-sm transition-all"
                      >
                        <PlayCircle size={14} />
                        <span>Resume Timer</span>
                      </button>
                    )}

                    <button
                      onClick={() => handlePromptStopSession(selectedActivity)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-medium border border-border/40 transition-colors"
                      title="Stop Session (Preserves accumulated time)"
                    >
                      <Square size={13} />
                      <span>Stop Session</span>
                    </button>
                  </div>
                </div>
              )
            })()}

            <div className="text-xs text-muted-foreground leading-relaxed">
              <p>
                Focus on engaging with this activity. You can pause or stop your session at any time without losing
                accumulated progress.
              </p>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/40">
              <button
                onClick={handleCloseAndContinueLater}
                className="text-xs px-3.5 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/40"
              >
                Close & Continue Later
              </button>

              {(() => {
                const timerInfo = getTimerInfo(selectedActivity)
                if (timerInfo.isEligible) {
                  return (
                    <button
                      onClick={() => handleOpenCompleteWithNote(selectedActivity)}
                      className="text-xs bg-emerald-500 text-white font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 hover:opacity-90 active:scale-95 transition-all"
                    >
                      <CheckCircle2 size={13} />
                      <span>Complete & Take Notes</span>
                    </button>
                  )
                } else {
                  return (
                    <button
                      disabled={true}
                      className="text-xs bg-muted text-muted-foreground/60 font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-not-allowed border border-border/40"
                    >
                      <Lock size={12} />
                      <span>Complete in {formatDuration(timerInfo.remainingSeconds)}</span>
                    </button>
                  )
                }
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Capture Insights & Note Completion Modal */}
      {noteModalActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setNoteModalActivity(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-primary flex items-center gap-1">
                <Sparkles size={12} />
                CAPTURE INSIGHTS • DAY {activeDay}
              </span>
              <h3 className="font-serif text-xl font-normal text-foreground">
                Document Takeaways for "{noteModalActivity.title}"
              </h3>
              <p className="text-xs text-muted-foreground">
                This note will be automatically structured under your Daily Journey Notebook.
              </p>
            </div>

            {/* Note Title */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Key Takeaway / Title
              </label>
              <input
                type="text"
                value={noteModalTitle}
                onChange={(e) => setNoteModalTitle(e.target.value)}
                placeholder="Key takeaways from this activity..."
                className="w-full rounded-xl border border-border/50 bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 font-medium"
              />
            </div>

            {/* Detailed Notes (Markdown Supported) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Detailed Notes & Code Snippets (Markdown Supported)
              </label>
              <textarea
                value={noteModalContent}
                onChange={(e) => setNoteModalContent(e.target.value)}
                placeholder="Summarize key concepts, code patterns, or reflections..."
                rows={5}
                className="w-full rounded-xl border border-border/50 bg-background px-3.5 py-2.5 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none font-sans"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tags</label>
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-border/40 bg-background/50">
                {noteModalTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-muted text-[10px] font-medium text-foreground"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveNoteTag(tag)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add tag (Press Enter)..."
                  value={noteModalTagInput}
                  onChange={(e) => setNoteModalTagInput(e.target.value)}
                  onKeyDown={handleAddNoteTag}
                  className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none py-0.5 px-1 min-w-[120px]"
                />
              </div>
            </div>

            {/* Image Attachments */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <ImageIcon size={12} />
                  Attached Screenshots / Media ({noteModalImages.length})
                </label>
                <button
                  type="button"
                  onClick={() => noteFileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
                >
                  <ImageIcon size={11} />
                  <span>Attach Image</span>
                </button>
              </div>

              <input
                ref={noteFileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleNoteImageSelect(e.target.files)}
              />

              {noteModalImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {noteModalImages.map((img, idx) => (
                    <div key={idx} className="relative rounded-lg border border-border/60 overflow-hidden group h-20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setNoteModalImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 rounded-md bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
              <button
                onClick={() => setNoteModalActivity(null)}
                disabled={isSavingNoteAndComplete}
                className="text-xs px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNoteAndComplete}
                disabled={isSavingNoteAndComplete}
                className="text-xs bg-primary text-primary-foreground font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
              >
                {isSavingNoteAndComplete ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border border-primary-foreground/30 border-t-primary-foreground" />
                    <span>Saving & Completing...</span>
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    <span>Save & Complete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
