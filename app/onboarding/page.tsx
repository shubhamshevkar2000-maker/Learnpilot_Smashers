"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Calendar,
  Clock,
  Target,
  Compass,
  User,
  ShieldCheck,
  LogOut,
  AlertCircle,
  Edit3,
  Flame,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ThemeToggle } from "@/components/theme-toggle"
import { MagneticButton } from "@/components/magnetic-button"
import { createClient } from "@/lib/supabase/client"
import type { CurrentLevel } from "@/types/database.types"

// Option constants for steps
const POPULAR_GOALS = [
  "Frontend Developer",
  "Full-Stack Engineer",
  "React & Next.js Mastery",
  "AI & LLM Integration",
  "JavaScript Core & Async",
]

const POPULAR_OUTCOMES = [
  "Build production-grade web applications",
  "Land a software engineering role",
  "Strengthen fundamentals & pass technical interviews",
  "Upskill for an upcoming complex project",
]

interface LevelOption {
  value: CurrentLevel
  title: string
  subtitle: string
}

const LEVEL_OPTIONS: LevelOption[] = [
  {
    value: "beginner",
    title: "Complete Beginner",
    subtitle: "New to programming and web technologies.",
  },
  {
    value: "basics",
    title: "Foundational Basics",
    subtitle: "Know basic syntax and HTML/CSS, but haven't built full apps.",
  },
  {
    value: "intermediate",
    title: "Intermediate",
    subtitle: "Comfortable building components, state, and fetching APIs.",
  },
  {
    value: "advanced",
    title: "Advanced",
    subtitle: "Experienced engineer looking to master architectural patterns.",
  },
  {
    value: "unknown",
    title: "Not Sure / Exploratory",
    subtitle: "Prefer diagnostic checkpoints to assess my baseline.",
  },
]

const TIME_OPTIONS = [
  { minutes: 15, label: "15 min / day", tag: "Casual" },
  { minutes: 30, label: "30 min / day", tag: "Recommended" },
  { minutes: 45, label: "45 min / day", tag: "Accelerated" },
  { minutes: 60, label: "60 min / day", tag: "Intensive" },
  { minutes: 90, label: "90 min / day", tag: "Immersive" },
]

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingFlow />
    </ProtectedRoute>
  )
}

function OnboardingFlow() {
  const router = useRouter()
  const { user, isConfigured, signOut } = useAuth()
  const supabase = createClient()

  // Flow & Loading State
  const [step, setStep] = useState(1)
  const totalSteps = 6
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isCompletedState, setIsCompletedState] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Form Fields matching public.learner_profiles
  const [displayName, setDisplayName] = useState("")
  const [learningGoal, setLearningGoal] = useState("")
  const [desiredOutcome, setDesiredOutcome] = useState("")
  const [currentLevel, setCurrentLevel] = useState<CurrentLevel>("unknown")
  const [availableDailyMinutes, setAvailableDailyMinutes] = useState<number>(30)
  const [isCustomMinutes, setIsCustomMinutes] = useState(false)
  const [customMinutesInput, setCustomMinutesInput] = useState("30")
  const [hasTargetDate, setHasTargetDate] = useState(false)
  const [targetDate, setTargetDate] = useState("")

  // Load existing profile if one exists
  const fetchProfile = useCallback(async () => {
    if (!user || !isConfigured) {
      setLoadingProfile(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("learner_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading learner profile:", error)
      }

      if (data) {
        if (data.display_name) setDisplayName(data.display_name)
        if (data.learning_goal) setLearningGoal(data.learning_goal)
        if (data.desired_outcome) setDesiredOutcome(data.desired_outcome)
        if (data.current_level) setCurrentLevel(data.current_level as CurrentLevel)
        if (data.available_daily_minutes) {
          setAvailableDailyMinutes(data.available_daily_minutes)
          setCustomMinutesInput(String(data.available_daily_minutes))
          const standardMinutes = [15, 30, 45, 60, 90]
          setIsCustomMinutes(!standardMinutes.includes(data.available_daily_minutes))
        }
        if (data.target_date) {
          setHasTargetDate(true)
          setTargetDate(data.target_date)
        } else {
          setHasTargetDate(false)
          setTargetDate("")
        }

        if (data.onboarding_completed) {
          setIsCompletedState(true)
        }
      } else {
        // Fallback default name from user metadata
        const defaultName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          ""
        if (defaultName) setDisplayName(defaultName)
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err)
    } finally {
      setLoadingProfile(false)
    }
  }, [user, isConfigured, supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Sign out handler
  const handleSignOut = async () => {
    await signOut()
    router.replace("/login")
  }

  // Step Validation
  const validateCurrentStep = (): boolean => {
    setErrorMessage(null)

    if (step === 1) {
      if (!displayName.trim()) {
        setErrorMessage("Please enter your preferred name.")
        return false
      }
    } else if (step === 2) {
      if (!learningGoal.trim()) {
        setErrorMessage("Please select or describe what you want to learn.")
        return false
      }
    } else if (step === 3) {
      if (!desiredOutcome.trim()) {
        setErrorMessage("Please specify what you are aiming to achieve.")
        return false
      }
    } else if (step === 4) {
      if (!currentLevel) {
        setErrorMessage("Please select your current proficiency level.")
        return false
      }
    } else if (step === 5) {
      const minutes = isCustomMinutes
        ? parseInt(customMinutesInput, 10)
        : availableDailyMinutes
      if (!minutes || isNaN(minutes) || minutes <= 0) {
        setErrorMessage("Please specify a valid daily commitment in minutes (greater than 0).")
        return false
      }
    } else if (step === 6) {
      if (hasTargetDate && !targetDate) {
        setErrorMessage("Please select a target date, or choose a flexible timeline.")
        return false
      }
    }

    return true
  }

  // Next Step / Step Submission
  const handleNext = () => {
    if (!validateCurrentStep()) return

    if (step < totalSteps + 1) {
      setStep((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Back Step
  const handleBack = () => {
    setErrorMessage(null)
    if (step > 1) {
      setStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Save / Finish Onboarding
  const handleCompleteOnboarding = async () => {
    if (!user) return
    setErrorMessage(null)
    setSuccessMessage(null)

    const finalMinutes = isCustomMinutes
      ? parseInt(customMinutesInput, 10)
      : availableDailyMinutes

    if (!displayName.trim() || !learningGoal.trim() || !desiredOutcome.trim()) {
      setErrorMessage("Please complete all required fields before finishing.")
      return
    }

    if (!isConfigured) {
      setErrorMessage(
        "Supabase credentials are not configured. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to persist your profile.",
      )
      return
    }

    setSaving(true)

    try {
      const profilePayload = {
        user_id: user.id,
        display_name: displayName.trim(),
        learning_goal: learningGoal.trim(),
        desired_outcome: desiredOutcome.trim(),
        current_level: currentLevel,
        available_daily_minutes: finalMinutes,
        target_date: hasTargetDate && targetDate ? targetDate : null,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("learner_profiles")
        .upsert(profilePayload, { onConflict: "user_id" })

      if (error) {
        console.error("Supabase upsert error:", error)
        setErrorMessage(error.message || "Failed to save profile. Please try again.")
      } else {
        setIsCompletedState(true)
        setSuccessMessage("Your learner profile has been saved successfully.")
      }
    } catch (err: any) {
      console.error("Profile save exception:", err)
      setErrorMessage(err.message || "An unexpected error occurred while saving your profile.")
    } finally {
      setSaving(false)
    }
  }

  // Loading spinner during initial profile load
  if (loadingProfile) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Loading Learner Profile...
          </p>
        </div>
      </div>
    )
  }

  // Completed Profile State View
  if (isCompletedState) {
    const levelLabel =
      LEVEL_OPTIONS.find((l) => l.value === currentLevel)?.title || currentLevel

    return (
      <div className="relative flex min-h-screen flex-col justify-between bg-background px-6 py-8 text-foreground transition-colors duration-300 md:px-12">
        <header className="mx-auto flex w-full max-w-[1000px] items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold tracking-[0.25em] text-foreground">
              LEARNPILOT
            </span>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-emerald-600 dark:text-emerald-400">
              Profile Ready
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        <main className="mx-auto my-auto w-full max-w-xl py-10">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-primary backdrop-blur-sm">
              <CheckCircle2 size={14} className="text-primary" />
              <span>Onboarding Completed</span>
            </div>

            <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground md:text-5xl">
              Welcome aboard,{" "}
              <span className="italic text-primary">{displayName || "Learner"}</span>.
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              Your personalized learning parameters are set. Your profile is ready to anchor your future adaptive orbital path.
            </p>
          </div>

          {/* Profile Summary Card */}
          <div className="mt-8 rounded-3xl border border-border bg-card/75 p-6 backdrop-blur-xl md:p-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
                <ShieldCheck size={16} className="text-primary" />
                <span>Learner Profile Summary</span>
              </div>
              <button
                onClick={() => {
                  setIsCompletedState(false)
                  setStep(1)
                }}
                className="flex items-center gap-1 text-xs text-primary transition-opacity hover:opacity-80"
              >
                <Edit3 size={13} />
                <span>Edit Profile</span>
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="flex flex-col justify-between gap-1 border-b border-border/40 pb-3 sm:flex-row sm:items-center">
                <span className="text-muted-foreground">Preferred Name:</span>
                <span className="font-medium text-foreground">{displayName}</span>
              </div>

              <div className="flex flex-col justify-between gap-1 border-b border-border/40 pb-3 sm:flex-row sm:items-center">
                <span className="text-muted-foreground">Learning Goal:</span>
                <span className="font-medium text-foreground">{learningGoal}</span>
              </div>

              <div className="flex flex-col justify-between gap-1 border-b border-border/40 pb-3 sm:flex-row sm:items-center">
                <span className="text-muted-foreground">Desired Milestone:</span>
                <span className="font-medium text-foreground">{desiredOutcome}</span>
              </div>

              <div className="flex flex-col justify-between gap-1 border-b border-border/40 pb-3 sm:flex-row sm:items-center">
                <span className="text-muted-foreground">Proficiency Level:</span>
                <span className="font-medium text-foreground">{levelLabel}</span>
              </div>

              <div className="flex flex-col justify-between gap-1 border-b border-border/40 pb-3 sm:flex-row sm:items-center">
                <span className="text-muted-foreground">Daily Focus:</span>
                <span className="font-medium text-foreground">
                  {isCustomMinutes ? customMinutesInput : availableDailyMinutes} minutes / day
                </span>
              </div>

              <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                <span className="text-muted-foreground">Target Completion:</span>
                <span className="font-medium text-foreground">
                  {hasTargetDate && targetDate ? targetDate : "Flexible pace (No strict deadline)"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <MagneticButton
              onClick={() => {
                setIsCompletedState(false)
                setStep(1)
              }}
              className="px-6 py-3 text-xs"
            >
              <Edit3 size={14} />
              <span>Modify Onboarding Responses</span>
            </MagneticButton>
          </div>
        </main>

        <footer className="mx-auto flex w-full max-w-[1000px] items-center justify-between text-[11px] text-muted-foreground">
          <span>© {new Date().getFullYear()} LearnPilot</span>
          <span>Learner Profile Active</span>
        </footer>
      </div>
    )
  }

  // Active Multi-Step Onboarding View
  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-background px-6 py-8 text-foreground transition-colors duration-300 md:px-12">
      {/* Top Bar */}
      <header className="mx-auto flex w-full max-w-[1000px] items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tracking-[0.25em] text-foreground">
            LEARNPILOT
          </span>
          <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-primary">
            Onboarding
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Progress Line */}
      <div className="mx-auto mt-6 w-full max-w-xl">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {step <= totalSteps ? `Step ${step} of ${totalSteps}` : "Review & Confirmation"}
          </span>
          <span>{Math.round((Math.min(step, totalSteps) / totalSteps) * 100)}% complete</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border/60">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: `${(Math.min(step, totalSteps) / totalSteps) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Main Step Container */}
      <main className="mx-auto my-auto w-full max-w-xl py-8">
        {/* Error Notice */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs text-destructive">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* STEP 1: PREFERRED NAME */}
        {step === 1 && (
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-primary">
              <User size={12} />
              <span>Identity</span>
            </div>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl">
              What should we
              <br />
              <span className="italic text-primary">call you?</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Your name will personalize your learning companion and reports.
            </p>

            <div className="mt-8">
              <label
                htmlFor="displayName"
                className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-foreground/80"
              >
                Preferred Name
              </label>
              <input
                id="displayName"
                type="text"
                autoFocus
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNext()
                }}
                placeholder="e.g. Alex"
                className="w-full rounded-xl border border-border bg-card/80 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* STEP 2: LEARNING GOAL */}
        {step === 2 && (
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-primary">
              <Compass size={12} />
              <span>Target Track</span>
            </div>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl">
              What do you want to
              <br />
              <span className="italic text-primary">learn & master?</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Choose a track or type your custom learning goal.
            </p>

            {/* Quick Chips */}
            <div className="mt-6 flex flex-wrap gap-2">
              {POPULAR_GOALS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setLearningGoal(goal)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs transition-all ${
                    learningGoal === goal
                      ? "border-primary bg-primary text-primary-foreground font-medium shadow-sm"
                      : "border-border bg-card/60 text-foreground/80 hover:border-primary/40 hover:bg-card"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <label
                htmlFor="learningGoal"
                className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-foreground/80"
              >
                Learning Goal
              </label>
              <input
                id="learningGoal"
                type="text"
                autoFocus
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNext()
                }}
                placeholder="e.g. Frontend Developer"
                className="w-full rounded-xl border border-border bg-card/80 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* STEP 3: DESIRED OUTCOME */}
        {step === 3 && (
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-primary">
              <Target size={12} />
              <span>Milestone</span>
            </div>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl">
              What are you trying
              <br />
              <span className="italic text-primary">to achieve?</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Define what success looks like when you complete this orbit.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {POPULAR_OUTCOMES.map((outcome) => (
                <button
                  key={outcome}
                  type="button"
                  onClick={() => setDesiredOutcome(outcome)}
                  className={`rounded-2xl border p-3 text-left text-xs transition-all ${
                    desiredOutcome === outcome
                      ? "border-primary bg-primary/10 text-foreground font-medium"
                      : "border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {outcome}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <label
                htmlFor="desiredOutcome"
                className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-foreground/80"
              >
                Custom Outcome
              </label>
              <textarea
                id="desiredOutcome"
                rows={2}
                value={desiredOutcome}
                onChange={(e) => setDesiredOutcome(e.target.value)}
                placeholder="e.g. Build production Next.js applications and transition to full-time engineering"
                className="w-full rounded-xl border border-border bg-card/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* STEP 4: CURRENT LEVEL */}
        {step === 4 && (
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-primary">
              <Flame size={12} />
              <span>Starting Point</span>
            </div>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl">
              How would you describe your
              <br />
              <span className="italic text-primary">current level?</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              This anchors your initial starting node and curriculum pace.
            </p>

            <div className="mt-6 space-y-2.5">
              {LEVEL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCurrentLevel(opt.value)}
                  className={`flex w-full items-start justify-between rounded-2xl border p-4 text-left transition-all ${
                    currentLevel === opt.value
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card/60 hover:border-primary/30 hover:bg-card"
                  }`}
                >
                  <div>
                    <div className="font-medium text-sm text-foreground">{opt.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{opt.subtitle}</div>
                  </div>
                  {currentLevel === opt.value && (
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check size={12} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: DAILY COMMITMENT */}
        {step === 5 && (
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-primary">
              <Clock size={12} />
              <span>Daily Focus</span>
            </div>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl">
              How much time can you
              <br />
              <span className="italic text-primary">realistically commit?</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Consistent daily practice drives compounding knowledge gains.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.minutes}
                  type="button"
                  onClick={() => {
                    setIsCustomMinutes(false)
                    setAvailableDailyMinutes(opt.minutes)
                  }}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                    !isCustomMinutes && availableDailyMinutes === opt.minutes
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card/60 hover:border-primary/30 hover:bg-card"
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-foreground">{opt.label}</div>
                    <div className="text-[11px] text-muted-foreground">{opt.tag}</div>
                  </div>
                  {!isCustomMinutes && availableDailyMinutes === opt.minutes && (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check size={12} />
                    </div>
                  )}
                </button>
              ))}

              {/* Custom Minutes Option */}
              <button
                type="button"
                onClick={() => setIsCustomMinutes(true)}
                className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                  isCustomMinutes
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border bg-card/60 hover:border-primary/30 hover:bg-card"
                }`}
              >
                <div>
                  <div className="text-sm font-medium text-foreground">Custom Duration</div>
                  <div className="text-[11px] text-muted-foreground">Enter specific minutes</div>
                </div>
                {isCustomMinutes && (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check size={12} />
                  </div>
                )}
              </button>
            </div>

            {isCustomMinutes && (
              <div className="mt-4 rounded-2xl border border-primary/20 bg-card/70 p-4">
                <label
                  htmlFor="customMinutes"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-foreground/80"
                >
                  Minutes Per Day
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="customMinutes"
                    type="number"
                    min="5"
                    max="480"
                    value={customMinutesInput}
                    onChange={(e) => setCustomMinutesInput(e.target.value)}
                    className="w-32 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-xs text-muted-foreground">minutes each day</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 6: TARGET DATE */}
        {step === 6 && (
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-primary">
              <Calendar size={12} />
              <span>Timeline</span>
            </div>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl">
              Do you have a
              <br />
              <span className="italic text-primary">target completion date?</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Setting a milestone helps calibrate your orbital trajectory.
            </p>

            <div className="mt-6 space-y-3">
              {/* Option: Flexible Pace */}
              <button
                type="button"
                onClick={() => {
                  setHasTargetDate(false)
                  setTargetDate("")
                }}
                className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                  !hasTargetDate
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border bg-card/60 hover:border-primary/30 hover:bg-card"
                }`}
              >
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Flexible Pace (No strict deadline)
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Learn at your own rhythm without a hard end date.
                  </div>
                </div>
                {!hasTargetDate && (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check size={12} />
                  </div>
                )}
              </button>

              {/* Option: Specific Date */}
              <button
                type="button"
                onClick={() => setHasTargetDate(true)}
                className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                  hasTargetDate
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border bg-card/60 hover:border-primary/30 hover:bg-card"
                }`}
              >
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Set a Specific Target Date
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Define an upcoming deadline, interview, or launch date.
                  </div>
                </div>
                {hasTargetDate && (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check size={12} />
                  </div>
                )}
              </button>
            </div>

            {hasTargetDate && (
              <div className="mt-4 rounded-2xl border border-primary/20 bg-card/70 p-4">
                <label
                  htmlFor="targetDate"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-foreground/80"
                >
                  Target Date
                </label>
                <input
                  id="targetDate"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 7: REVIEW & CONFIRM */}
        {step === 7 && (
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-primary">
              <Sparkles size={12} />
              <span>Final Review</span>
            </div>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl">
              Confirm your
              <br />
              <span className="italic text-primary">learning profile.</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Review your parameters before saving your profile.
            </p>

            <div className="mt-6 rounded-3xl border border-border bg-card/80 p-6 backdrop-blur-xl">
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div>
                    <span className="text-muted-foreground">Preferred Name</span>
                    <p className="mt-0.5 font-medium text-foreground">{displayName || "—"}</p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-primary transition-opacity hover:opacity-80"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div>
                    <span className="text-muted-foreground">Target Goal</span>
                    <p className="mt-0.5 font-medium text-foreground">{learningGoal || "—"}</p>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs text-primary transition-opacity hover:opacity-80"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div>
                    <span className="text-muted-foreground">Desired Milestone</span>
                    <p className="mt-0.5 font-medium text-foreground">{desiredOutcome || "—"}</p>
                  </div>
                  <button
                    onClick={() => setStep(3)}
                    className="text-xs text-primary transition-opacity hover:opacity-80"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div>
                    <span className="text-muted-foreground">Proficiency Level</span>
                    <p className="mt-0.5 font-medium text-foreground">
                      {LEVEL_OPTIONS.find((l) => l.value === currentLevel)?.title || currentLevel}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(4)}
                    className="text-xs text-primary transition-opacity hover:opacity-80"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div>
                    <span className="text-muted-foreground">Daily Focus</span>
                    <p className="mt-0.5 font-medium text-foreground">
                      {isCustomMinutes ? customMinutesInput : availableDailyMinutes} minutes / day
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(5)}
                    className="text-xs text-primary transition-opacity hover:opacity-80"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground">Target Date</span>
                    <p className="mt-0.5 font-medium text-foreground">
                      {hasTargetDate && targetDate ? targetDate : "Flexible pace"}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(6)}
                    className="text-xs text-primary transition-opacity hover:opacity-80"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-card hover:text-foreground disabled:opacity-50"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step <= totalSteps ? (
            <MagneticButton onClick={handleNext} className="px-6 py-3 text-xs">
              <span>Continue</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </MagneticButton>
          ) : (
            <MagneticButton
              onClick={handleCompleteOnboarding}
              disabled={saving}
              className="px-6 py-3 text-xs"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  <span>Saving Profile...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Save & Complete Profile</span>
                  <CheckCircle2 size={14} />
                </div>
              )}
            </MagneticButton>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto flex w-full max-w-[1000px] items-center justify-between text-[11px] text-muted-foreground">
        <span>© {new Date().getFullYear()} LearnPilot</span>
        <span>Learner Onboarding</span>
      </footer>
    </div>
  )
}
