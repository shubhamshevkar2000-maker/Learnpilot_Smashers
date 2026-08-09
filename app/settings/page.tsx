"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Compass,
  BookOpen,
  BarChart3,
  CheckCircle,
  FileText,
  Settings,
  Layers,
  LogOut,
  Sparkles,
  Calendar,
  Bot,
  User,
  Target,
  Clock,
  Menu,
  X,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import type { LearnerProfile, CurrentLevel } from "@/types/database.types"

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
  { id: "assessments", label: "Assessments", icon: CheckCircle, href: "/assessments" },
  { id: "progress", label: "Progress", icon: BarChart3, href: "/progress" },
  { id: "notes", label: "Notes", icon: FileText, href: "/notes" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings", active: true },
]

const LEVEL_OPTIONS: { value: CurrentLevel; label: string; description: string }[] = [
  { value: "beginner", label: "Complete Beginner", description: "New to this domain, starting from absolute basics." },
  { value: "basics", label: "Foundational Basics", description: "Know basic concepts, ready for structured lessons." },
  { value: "intermediate", label: "Intermediate", description: "Have practical experience, seeking deeper proficiency." },
  { value: "advanced", label: "Advanced", description: "Experienced practitioner aiming for domain mastery." },
  { value: "unknown", label: "Exploratory / Unsure", description: "Testing the waters to discover where to begin." },
]

const TIME_PRESETS = [15, 30, 45, 60, 90, 120, 180, 360]

function SettingsContent() {
  const { user, isConfigured, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [initialProfile, setInitialProfile] = useState<LearnerProfile | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [goalChanged, setGoalChanged] = useState(false)

  // Form State
  const [displayName, setDisplayName] = useState("")
  const [learningGoal, setLearningGoal] = useState("")
  const [desiredOutcome, setDesiredOutcome] = useState("")
  const [currentLevel, setCurrentLevel] = useState<CurrentLevel>("beginner")
  const [availableDailyMinutes, setAvailableDailyMinutes] = useState(45)
  const [targetDate, setTargetDate] = useState("")

  // Fetch real learner profile from Supabase
  const loadProfile = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setErrorMessage(null)

    try {
      const { data, error } = await supabase
        .from("learner_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) {
        console.error("[Settings] Error loading learner profile:", error)
        setErrorMessage(`Failed to load profile: ${error.message}`)
        return
      }

      if (data) {
        const prof = data as LearnerProfile
        setInitialProfile(prof)
        setDisplayName(prof.display_name || "")
        setLearningGoal(prof.learning_goal || "")
        setDesiredOutcome(prof.desired_outcome || "")
        setCurrentLevel(prof.current_level || "beginner")
        setAvailableDailyMinutes(prof.available_daily_minutes || 45)

        // Format ISO target_date to YYYY-MM-DD for date input
        if (prof.target_date) {
          const d = new Date(prof.target_date)
          if (!isNaN(d.getTime())) {
            setTargetDate(d.toISOString().split("T")[0])
          } else {
            setTargetDate("")
          }
        } else {
          setTargetDate("")
        }
      }
    } catch (err: any) {
      console.error("[Settings] Exception loading profile:", err)
      setErrorMessage("Unexpected error loading preferences. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // Track if curriculum-impacting fields changed
  useEffect(() => {
    if (!initialProfile) return
    const goalDiffers = (learningGoal || "").trim() !== (initialProfile.learning_goal || "").trim()
    const levelDiffers = currentLevel !== initialProfile.current_level
    const dateDiffers = targetDate !== (initialProfile.target_date ? new Date(initialProfile.target_date).toISOString().split("T")[0] : "")
    setGoalChanged(goalDiffers || levelDiffers || dateDiffers)
  }, [learningGoal, currentLevel, targetDate, initialProfile])

  // Reset form to initial state
  const handleReset = () => {
    if (!initialProfile) return
    setDisplayName(initialProfile.display_name || "")
    setLearningGoal(initialProfile.learning_goal || "")
    setDesiredOutcome(initialProfile.desired_outcome || "")
    setCurrentLevel(initialProfile.current_level || "beginner")
    setAvailableDailyMinutes(initialProfile.available_daily_minutes || 45)
    if (initialProfile.target_date) {
      const d = new Date(initialProfile.target_date)
      setTargetDate(!isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "")
    } else {
      setTargetDate("")
    }
    setSuccessMessage(null)
    setErrorMessage(null)
  }

  // Save changes to Supabase learner_profiles table
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const updates = {
        user_id: user.id,
        display_name: displayName.trim() || "Learner",
        learning_goal: learningGoal.trim(),
        desired_outcome: desiredOutcome.trim(),
        current_level: currentLevel,
        available_daily_minutes: Number(availableDailyMinutes) || 45,
        target_date: targetDate ? new Date(targetDate).toISOString() : null,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from("learner_profiles")
        .upsert(updates, { onConflict: "user_id" })
        .select()
        .single()

      if (error) {
        console.error("[Settings] Save error:", error)
        setErrorMessage(`Save failed: ${error.message}`)
        return
      }

      if (data) {
        // If critical learning parameters changed, archive the old curriculum plan to force a new one
        const goalChanged = initialProfile?.learning_goal !== updates.learning_goal
        const levelChanged = initialProfile?.current_level !== updates.current_level
        
        if (goalChanged || levelChanged) {
          await supabase
            .from("curriculum_plans")
            .update({ is_active: false })
            .eq("user_id", user.id)
            .eq("is_active", true)
        }

        setInitialProfile(data as LearnerProfile)
        setSuccessMessage("Your learning preferences have been saved successfully! Your roadmap will adapt to these changes.")
        setTimeout(() => setSuccessMessage(null), 5000)
        router.refresh()
      }
    } catch (err: any) {
      console.error("[Settings] Exception during save:", err)
      setErrorMessage("An unexpected error occurred while saving. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleNavClick = (item: NavItem) => {
    if (item.href && item.href !== "#") {
      router.push(item.href)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Loading Learner Preferences...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary transition-colors duration-300">
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
              onClick={() => signOut()}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut size={13} />
              <span>Sign out</span>
            </button>
          )}
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-lg border border-border/60 p-2 text-muted-foreground hover:text-foreground lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu size={18} />
              </button>
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  LEARNER PREFERENCES
                </span>
                <h1 className="font-serif text-2xl font-normal tracking-tight text-foreground md:text-3xl">
                  Account & Learning Settings
                </h1>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Alert / Feedback Notices */}
          {successMessage && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3.5 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3.5 text-xs text-destructive animate-in fade-in">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {goalChanged && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-xs text-foreground">
              <div className="flex items-start gap-2.5">
                <Sparkles size={16} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Curriculum Parameters Modified</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    You've updated parameters that shape your Learning Path. After saving, you can optionally regenerate your Learning Path.
                  </p>
                </div>
              </div>
              <Link
                href="/path"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shrink-0 shadow-sm hover:opacity-90 transition-opacity"
              >
                <span>View Learning Path</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* SETTINGS FORM */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* SECTION 1: PERSONAL IDENTITY */}
            <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-md space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <User size={16} className="text-primary" />
                <h3 className="font-serif text-lg font-normal text-foreground">Learner Profile Identity</h3>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="displayName" className="text-xs font-medium text-foreground">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none transition-colors"
                />
                <p className="text-[11px] text-muted-foreground">
                  Used for personalized greetings on your Dashboard, Daily Journey, and AI Coach context.
                </p>
              </div>
            </div>

            {/* SECTION 2: LEARNING GOAL & OUTCOME */}
            <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-md space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <Target size={16} className="text-primary" />
                <h3 className="font-serif text-lg font-normal text-foreground">Learning Goal & Target Outcome</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="learningGoal" className="text-xs font-medium text-foreground">
                    Primary Learning Goal
                  </label>
                  <input
                    id="learningGoal"
                    type="text"
                    value={learningGoal}
                    onChange={(e) => setLearningGoal(e.target.value)}
                    placeholder="e.g. Full-Stack Web Development, Data Science, Python"
                    className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    The core domain or subject area you are mastering.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="desiredOutcome" className="text-xs font-medium text-foreground">
                    Desired Outcome / Objective
                  </label>
                  <input
                    id="desiredOutcome"
                    type="text"
                    value={desiredOutcome}
                    onChange={(e) => setDesiredOutcome(e.target.value)}
                    placeholder="e.g. Build production web apps, Land a Data Scientist role"
                    className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    What practical achievement or project capability you want to unlock.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Current Knowledge Level</label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {LEVEL_OPTIONS.map((opt) => {
                      const isSelected = currentLevel === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setCurrentLevel(opt.value)}
                          className={`rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? "border-primary/60 bg-primary/10 shadow-xs"
                              : "border-border/40 bg-background/50 hover:border-border/80"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">{opt.label}</span>
                            {isSelected && <CheckCircle2 size={14} className="text-primary shrink-0" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{opt.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: PACING & TARGET DATE */}
            <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-md space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                <Clock size={16} className="text-primary" />
                <h3 className="font-serif text-lg font-normal text-foreground">Study Time & Schedule Horizon</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="dailyMinutes" className="text-xs font-medium text-foreground">
                      Available Daily Study Time
                    </label>
                    <span className="font-mono text-xs font-semibold text-primary">{availableDailyMinutes} min / day</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {TIME_PRESETS.map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setAvailableDailyMinutes(mins)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-colors ${
                          availableDailyMinutes === mins
                            ? "bg-primary text-primary-foreground font-medium"
                            : "border border-border/50 bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Determines how many tasks are scheduled for your Daily Journey each day.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="targetDate" className="text-xs font-medium text-foreground">
                    Target Completion Date
                  </label>
                  <input
                    id="targetDate"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full max-w-xs rounded-xl border border-border/60 bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Influences the total target horizon and curriculum depth calculations.
                  </p>
                </div>
              </div>
            </div>

            {/* FORM ACTIONS */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                <RotateCcw size={14} />
                <span>Reset Changes</span>
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  )
}
