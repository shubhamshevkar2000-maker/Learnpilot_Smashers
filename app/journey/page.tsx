// @ts-nocheck
"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { createClient } from "@/lib/supabase/client"
import { createNote } from "@/lib/services/notes-service"
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

export default function DailyJourneyPage() {
  return (
    <ProtectedRoute>
      <DailyJourneyContent />
    </ProtectedRoute>
  )
}

function DailyJourneyContent() {
  const router = useRouter()
  const { user, isConfigured } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<LearnerProfile | null>(null)
  const [curriculum, setCurriculum] = useState<ActiveCurriculum | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeToast, setActiveToast] = useState<string | null>(null)

  // Selected Activity modal state
  const [selectedActivity, setSelectedActivity] = useState<FlattenedActivity | null>(null)
  const [inProgressIds, setInProgressIds] = useState<Set<string>>(new Set())
  const [completingId, setCompletingId] = useState<string | null>(null)

  // Mark Complete & Add Note modal state
  const [noteModalActivity, setNoteModalActivity] = useState<FlattenedActivity | null>(null)
  const [noteModalTitle, setNoteModalTitle] = useState("")
  const [noteModalContent, setNoteModalContent] = useState("")
  const [noteModalTagInput, setNoteModalTagInput] = useState("")
  const [noteModalTags, setNoteModalTags] = useState<string[]>(["journey"])
  const [isSavingNoteAndComplete, setIsSavingNoteAndComplete] = useState(false)

  const handleOpenCompleteWithNote = (act: FlattenedActivity) => {
    setNoteModalActivity(act)
    setNoteModalTitle(`Key takeaways: ${act.title}`)
    setNoteModalContent("")
    setNoteModalTags(["journey"])
    setNoteModalTagInput("")
  }

  const handleSaveNoteAndComplete = async () => {
    if (!user || !noteModalActivity || isSavingNoteAndComplete) return
    setIsSavingNoteAndComplete(true)

    try {
      await createNote(supabase, user.id, {
        title: noteModalTitle.trim() || `Note: ${noteModalActivity.title}`,
        content: noteModalContent,
        tags: noteModalTags,
        source_type: "journey",
        source_id: noteModalActivity.id,
        source_title: noteModalActivity.title,
      })

      const success = await completeActivity(supabase, user.id, noteModalActivity.id, noteModalActivity.module_id)

      if (success) {
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

        setInProgressIds((prev) => {
          const next = new Set(prev)
          next.delete(noteModalActivity.id)
          return next
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
      setErrorMessage("Could not complete activity and save note.")
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
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to load your Daily Journey from database. Please refresh.")
    } finally {
      setLoading(false)
    }
  }, [user, isConfigured, supabase, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleMarkComplete = async (act: FlattenedActivity) => {
    if (!user || completingId) return
    setCompletingId(act.id)

    try {
      const success = await completeActivity(supabase, user.id, act.id, act.module_id)
      if (success) {
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

        if (selectedActivity?.id === act.id) setSelectedActivity(null)
        setActiveToast(`Completed "${act.title}"!`)
        setTimeout(() => setActiveToast(null), 3000)
      } else {
        setErrorMessage("Failed to update activity completion. Please try again.")
      }
    } catch (err) {
      setErrorMessage("Could not save progress.")
    } finally {
      setCompletingId(null)
    }
  }

  const handleStartActivity = (act: FlattenedActivity) => {
    setInProgressIds((prev) => new Set(prev).add(act.id))
    setSelectedActivity(act)
  }

  if (loading) return null

  const displayName = profile?.display_name || user?.user_metadata?.full_name || "Learner"
  const dailyBudget = profile?.available_daily_minutes || 45

  let todaysBatch: FlattenedActivity[] = []
  let activeDay = 1
  let allActivities: FlattenedActivity[] = []
  let incompleteActivities: FlattenedActivity[] = []

  if (curriculum && curriculum.modules && profile) {
    const schedule = generateSchedule(profile, curriculum.modules)
    allActivities = schedule.days.flatMap(d => d.activities) as FlattenedActivity[]
    incompleteActivities = allActivities.filter(a => !a.is_completed)
    
    let currentActiveDay = schedule.days[0]
    for (const day of schedule.days) {
      if (day.activities.some(a => !a.is_completed)) {
        currentActiveDay = day
        break
      }
    }

    if (currentActiveDay) {
      activeDay = currentActiveDay.dayNumber
      todaysBatch = currentActiveDay.activities.map(act => ({
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
          <Link href="/path" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm">
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
          <Link href="/path" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm">
            <span>View Learning Path</span>
          </Link>
        </div>
      )}

      {curriculum && curriculum.plan && todaysBatch.length > 0 && (
        <div className="rounded-2xl border border-border/50 bg-card/60 p-6 md:p-8 backdrop-blur-md space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">TODAY'S JOURNEY • DAY {activeDay}</span>
              <h2 className="font-serif text-2xl font-normal text-foreground mt-0.5">{todaysBatch[0]?.module_title || "Curriculum Focus"}</h2>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
              <Clock size={13} className="text-primary" />
              <span>{dailyBudget} min daily budget</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{todaysCompletedCount} / {todaysBatch.length} complete</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(todaysCompletedCount / todaysBatch.length) * 100}%` }} />
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
                const isInProgress = inProgressIds.has(act.id)
                const isCompleting = completingId === act.id

                return (
                  <div key={act.id} className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${act.is_completed ? "border-emerald-500/30 bg-emerald-500/[0.03]" : "border-border/50"}`}>
                    <div className="space-y-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium uppercase ${typeInfo.bg} ${typeInfo.text}`}>{typeInfo.label}</span>
                      <h3 className="text-sm font-medium">{act.title}</h3>
                    </div>
                    <div className="flex gap-2">
                      {!act.is_completed && (
                        <>
                          <button onClick={() => handleStartActivity(act)} className="text-xs font-medium px-3 py-1.5 bg-muted rounded-lg flex items-center gap-1.5"><PlayCircle size={13} />Start</button>
                          <button onClick={() => handleMarkComplete(act)} disabled={isCompleting} className="text-xs font-medium px-3 py-1.5 bg-muted rounded-lg">Complete</button>
                          <button onClick={() => handleOpenCompleteWithNote(act)} className="text-xs font-medium px-3 py-1.5 bg-primary text-primary-foreground rounded-lg"><FilePlus size={13} /></button>
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

      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <button onClick={() => setSelectedActivity(null)} className="absolute top-4 right-4"><X size={18} /></button>
            <h3 className="font-serif text-xl">{selectedActivity.title}</h3>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSelectedActivity(null)} className="text-xs px-4 py-2">Close</button>
              <button onClick={() => handleMarkComplete(selectedActivity)} className="text-xs bg-primary text-primary-foreground px-4 py-2 rounded-xl">Complete</button>
            </div>
          </div>
        </div>
      )}

      {noteModalActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-5">
            <button onClick={() => setNoteModalActivity(null)} className="absolute top-4 right-4"><X size={18} /></button>
            <h3 className="font-serif text-xl">Capture Insights</h3>
            <input value={noteModalTitle} onChange={(e) => setNoteModalTitle(e.target.value)} className="w-full rounded-xl border p-2 text-xs" />
            <textarea value={noteModalContent} onChange={(e) => setNoteModalContent(e.target.value)} className="w-full rounded-xl border p-2 text-xs" rows={5} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setNoteModalActivity(null)} className="text-xs px-4 py-2">Cancel</button>
              <button onClick={handleSaveNoteAndComplete} disabled={isSavingNoteAndComplete} className="text-xs bg-primary text-primary-foreground px-4 py-2 rounded-xl">Save & Complete</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
