"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Compass,
  Calendar,
  Layers,
  BookOpen,
  Bot,
  CheckCircle,
  BarChart3,
  FileText,
  Settings,
  Sparkles,
  LogOut,
  Clock,
  Menu,
  X,
  PlayCircle,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Search,
  GraduationCap,
  Award,
  BookMarked,
  Code2,
  BrainCircuit,
  Lightbulb,
  Target,
  ArrowLeft,
  Check,
  ChevronLeft,
  Copy,
  HelpCircle,
  Trophy,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { createClient } from "@/lib/supabase/client"
import {
  getActiveCurriculumFoundation,
} from "@/lib/services/curriculum-service"
import {
  getStandaloneCourses,
  getUserCompletedCourseLessons,
  completeCourseLesson,
  type Course,
  type CourseLesson,
  type CourseLessonType,
} from "@/lib/services/courses-service"
import type { LearnerProfile } from "@/types/database.types"

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
  { id: "courses", label: "Courses", icon: BookOpen, href: "/courses", active: true },
  { id: "ai-coach", label: "AI Coach", icon: Bot, href: "/ai-coach" },
  { id: "assessments", label: "Assessments", icon: CheckCircle, href: "/assessments" },
  { id: "progress", label: "Progress", icon: BarChart3, href: "/progress" },
  { id: "notes", label: "Notes", icon: FileText, href: "#" },
  { id: "settings", label: "Settings", icon: Settings, href: "#" },
]

const LESSON_TYPE_BADGES: Record<CourseLessonType, { label: string; className: string }> = {
  concept: { label: "Concept", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  exercise: { label: "Exercise", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  project: { label: "Project", className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  reflection: { label: "Reflection", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
}

export default function CoursesPage() {
  return (
    <ProtectedRoute>
      <CoursesContent />
    </ProtectedRoute>
  )
}

function CoursesContent() {
  const router = useRouter()
  const { user, isConfigured, signOut } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<LearnerProfile | null>(null)
  const [activePathModules, setActivePathModules] = useState<string[]>([])
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([])
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeToast, setActiveToast] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Filtering & Selection state
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | "recommended" | "in_progress" | "completed">("all")
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0)
  const [completingId, setCompletingId] = useState<string | null>(null)

  // 1. Load Profile, Active Roadmap Context & User Course Completions
  const loadCoursesData = useCallback(async () => {
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
        console.error("Profile load error:", profError)
        setErrorMessage(`Database Error (${profError.code || "DB"}): ${profError.message}`)
        return
      }

      if (!profData || !profData.onboarding_completed) {
        router.replace("/onboarding")
        return
      }

      setProfile(profData as LearnerProfile)

      // Fetch active learning path modules for recommendation signal (read-only)
      const pathData = await getActiveCurriculumFoundation(supabase, user.id)
      if (pathData && pathData.modules) {
        setActivePathModules(pathData.modules.map((m) => m.title))
      }

      // Fetch user's completed course lessons independently
      const completions = await getUserCompletedCourseLessons(supabase, user.id)
      setCompletedLessonIds(completions)
    } catch (err: any) {
      console.error("Error loading courses data:", err)
      setErrorMessage(err?.message || "Failed to load course library.")
    } finally {
      setLoading(false)
    }
  }, [user, isConfigured, supabase, router])

  useEffect(() => {
    loadCoursesData()
  }, [loadCoursesData])

  // Derive Standalone Courses Catalog
  const coursesCatalog: Course[] = useMemo(() => {
    const rawCatalog = getStandaloneCourses(profile?.learning_goal || "Web Development", activePathModules)
    
    return rawCatalog.map((course) => ({
      ...course,
      lessons: course.lessons.map((lesson) => ({
        ...lesson,
        is_completed: completedLessonIds.includes(lesson.id),
      })),
    }))
  }, [profile, activePathModules, completedLessonIds])

  // Filtered Courses for Catalog Overview
  const filteredCourses = useMemo(() => {
    return coursesCatalog.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      const totalLessons = c.lessons.length
      const completedLessons = c.lessons.filter((l) => l.is_completed).length

      if (activeFilter === "recommended") return c.isRecommended
      if (activeFilter === "in_progress") return completedLessons > 0 && completedLessons < totalLessons
      if (activeFilter === "completed") return totalLessons > 0 && completedLessons === totalLessons

      return true
    })
  }, [coursesCatalog, searchQuery, activeFilter])

  // Selected Active Course
  const selectedCourse = useMemo(() => {
    if (!selectedCourseId) return null
    return coursesCatalog.find((c) => c.id === selectedCourseId) || null
  }, [coursesCatalog, selectedCourseId])

  // Handle selecting a course card (Auto-selects first incomplete lesson or lesson 0)
  const handleSelectCourse = (courseId: string) => {
    const course = coursesCatalog.find((c) => c.id === courseId)
    if (course) {
      setSelectedCourseId(courseId)
      const firstIncompleteIdx = course.lessons.findIndex((l) => !l.is_completed)
      setActiveLessonIndex(firstIncompleteIdx !== -1 ? firstIncompleteIdx : 0)
    }
  }

  // Complete Course Lesson handler (Independent from Learning Path)
  const handleCompleteLesson = async (courseId: string, lessonId: string) => {
    if (!user || completingId) return
    setCompletingId(lessonId)

    try {
      const success = await completeCourseLesson(supabase, user.id, courseId, lessonId)
      if (success) {
        setCompletedLessonIds((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]))

        setActiveToast("Lesson completed! Progress updated.")
        setTimeout(() => setActiveToast(null), 3000)

        // Automatically advance to next lesson if available
        if (selectedCourse && activeLessonIndex < selectedCourse.lessons.length - 1) {
          setTimeout(() => {
            setActiveLessonIndex((prev) => prev + 1)
          }, 600)
        }
      } else {
        setErrorMessage("Failed to save course lesson completion.")
      }
    } catch (err: any) {
      console.error("Error completing course lesson:", err)
      setErrorMessage(err?.message || "An error occurred completing course lesson.")
    } finally {
      setCompletingId(null)
    }
  }

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

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Loading Course Workspace...
          </p>
        </div>
      </div>
    )
  }

  // If a course is selected, render the dedicated Course Learning Workspace Experience!
  if (selectedCourse) {
    return (
      <CourseLearningWorkspace
        course={selectedCourse}
        activeLessonIndex={activeLessonIndex}
        setActiveLessonIndex={setActiveLessonIndex}
        onExit={() => setSelectedCourseId(null)}
        onCompleteLesson={(lessonId) => handleCompleteLesson(selectedCourse.id, lessonId)}
        completingId={completingId}
        activeToast={activeToast}
      />
    )
  }

  // Otherwise, render the Standalone Course Catalog Overview!
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Toast Notification */}
      {activeToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 shadow-xl backdrop-blur-md">
          <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>{activeToast}</span>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-card/30 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-2 py-3 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-tight text-foreground">LearnPilot</h1>
            <p className="text-[10px] text-muted-foreground font-mono">v1.2 ACTIVE</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  item.active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="pt-6 border-t border-border/40 space-y-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/20 border border-border/40">
            <span className="text-[11px] font-medium text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border/40 bg-card/30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm">LearnPilot</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-xl p-6 flex flex-col">
          <div className="flex items-center justify-between pb-6 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">LearnPilot Navigation</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)}>
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <nav className="flex-1 py-6 space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleNavClick(item)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    item.active
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {errorMessage && (
          <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-xs underline hover:no-underline ml-4">
              Dismiss
            </button>
          </div>
        )}

        <CoursesOverview
          courses={coursesCatalog}
          filteredCourses={filteredCourses}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onSelectCourse={handleSelectCourse}
          learnerGoal={profile?.learning_goal || "Web Development"}
        />
      </main>
    </div>
  )
}

// ============================================================================
// 1. STANDALONE COURSES OVERVIEW COMPONENT
// ============================================================================
function CoursesOverview({
  courses,
  filteredCourses,
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  onSelectCourse,
  learnerGoal,
}: {
  courses: Course[]
  filteredCourses: Course[]
  searchQuery: string
  setSearchQuery: (q: string) => void
  activeFilter: "all" | "recommended" | "in_progress" | "completed"
  setActiveFilter: (f: "all" | "recommended" | "in_progress" | "completed") => void
  onSelectCourse: (id: string) => void
  learnerGoal: string
}) {
  const recommendedCourses = courses.filter((c) => c.isRecommended)

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-background p-6 md:p-8 backdrop-blur-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Standalone Course Library</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Build the skills that move you forward.
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Explore deep-dive courses tailored to your goal of{" "}
            <span className="font-semibold text-foreground">{learnerGoal}</span>. Each course features an interactive learning workspace, syntactic code blocks, hands-on exercises, and self-check checkpoints.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(
            [
              { id: "all", label: "All Courses" },
              { id: "recommended", label: "★ Recommended" },
              { id: "in_progress", label: "In Progress" },
              { id: "completed", label: "Completed" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
                activeFilter === f.id
                  ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20"
                  : "bg-card/40 text-muted-foreground hover:text-foreground border border-border/40 hover:bg-muted/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border/40 bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
        </div>
      </div>

      {/* Recommended For You Section */}
      {activeFilter === "all" && !searchQuery && recommendedCourses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold tracking-tight text-foreground uppercase tracking-wider text-[11px]">
                Recommended for your Roadmap
              </h2>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{recommendedCourses.length} Courses</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedCourses.map((course) => (
              <CourseCard key={course.id} course={course} onSelect={() => onSelectCourse(course.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Explore All Courses Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-foreground uppercase tracking-wider text-[11px]">
            {activeFilter === "all" && !searchQuery ? "All Courses" : `Matching Courses (${filteredCourses.length})`}
          </h2>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-2xl border border-border/40 bg-card/20 p-8 text-center space-y-3">
            <BookMarked className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">No courses are available yet.</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="rounded-2xl border border-border/40 bg-card/20 p-8 text-center space-y-3">
            <BookMarked className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">No courses match your active filter or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} onSelect={() => onSelectCourse(course.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// 2. COURSE CARD COMPONENT
// ============================================================================
function CourseCard({ course, onSelect }: { course: Course; onSelect: () => void }) {
  const totalLessons = course.lessons.length
  const completedLessons = course.lessons.filter((l) => l.is_completed).length
  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  const isCompleted = percent === 100
  const isInProgress = percent > 0 && percent < 100

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border/40 bg-card/40 p-5 hover:border-primary/40 hover:bg-card/70 transition-all duration-300 shadow-sm hover:shadow-xl backdrop-blur-xl">
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 rounded-full bg-muted/40 border border-border/40 text-[10px] font-medium text-muted-foreground">
            {course.difficulty}
          </span>
          {course.isRecommended && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center gap-1 border border-primary/20">
              <Sparkles className="h-3 w-3" />
              <span>{course.recommendation_reason || "Recommended"}</span>
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {course.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
            {course.description}
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-5 mt-4 border-t border-border/40">
        {/* Course Meta Info */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-primary/70" />
            <span>{totalLessons} Lessons</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span>{course.estimated_minutes} min</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-muted-foreground">{completedLessons} / {totalLessons} completed</span>
            <span className={isCompleted ? "text-emerald-500 font-bold" : "text-primary font-semibold"}>
              {percent}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isCompleted ? "bg-emerald-500" : "bg-primary"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onSelect}
          className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            isCompleted
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
              : isInProgress
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:opacity-95"
              : "bg-muted/40 hover:bg-muted text-foreground border border-border/40"
          }`}
        >
          <span>{isCompleted ? "Review Course" : isInProgress ? "Continue Course" : "Start Course"}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// 3. DEDICATED COURSE LEARNING WORKSPACE EXPERIENCE (FULL INTERACTIVE VIEW)
// ============================================================================
function CourseLearningWorkspace({
  course,
  activeLessonIndex,
  setActiveLessonIndex,
  onExit,
  onCompleteLesson,
  completingId,
  activeToast,
}: {
  course: Course
  activeLessonIndex: number
  setActiveLessonIndex: React.Dispatch<React.SetStateAction<number>>
  onExit: () => void
  onCompleteLesson: (lessonId: string) => void
  completingId: string | null
  activeToast: string | null
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)

  const activeLesson = course.lessons[activeLessonIndex] || course.lessons[0]
  const totalLessons = course.lessons.length
  const completedLessons = course.lessons.filter((l) => l.is_completed).length
  const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  const isCourseComplete = completedLessons === totalLessons

  // Reset quiz selection on lesson change
  useEffect(() => {
    setSelectedQuizOption(null)
    setCopiedCode(false)
  }, [activeLessonIndex])

  const badge = LESSON_TYPE_BADGES[activeLesson.lesson_type] || LESSON_TYPE_BADGES.concept

  const handleCopyCode = () => {
    if (activeLesson.code_example) {
      navigator.clipboard.writeText(activeLesson.code_example)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Toast Notification */}
      {activeToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 shadow-xl backdrop-blur-md">
          <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>{activeToast}</span>
        </div>
      )}

      {/* Top Workspace Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/40 bg-card/60 px-4 md:px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg border border-border/40 hover:bg-muted/40"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Exit Course</span>
          </button>

          <div className="h-4 w-px bg-border/40 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground line-clamp-1">{course.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold hidden md:inline">
                {course.difficulty}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">
              Lesson {activeLessonIndex + 1} of {totalLessons}: {activeLesson.title}
            </p>
          </div>
        </div>

        {/* Progress & Sidebar Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
            <span className="text-muted-foreground">{completedLessons}/{totalLessons} completed</span>
            <div className="h-2 w-28 rounded-full bg-muted/40 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${isCourseComplete ? "bg-emerald-500" : "bg-primary"}`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className={isCourseComplete ? "text-emerald-500 font-bold" : "text-primary font-semibold"}>
              {percent}%
            </span>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
            title="Toggle Syllabus Sidebar"
          >
            <BookOpen className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace 2-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Interactive Lesson Stepper / Syllabus Sidebar */}
        {sidebarOpen && (
          <aside className="w-full md:w-80 border-r border-border/40 bg-card/30 flex flex-col shrink-0 overflow-y-auto backdrop-blur-xl">
            <div className="p-4 border-b border-border/40 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Course Syllabus</h3>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">{course.title}</span>
                <span className="font-mono text-[10px] text-primary">{percent}% Done</span>
              </div>
            </div>

            <div className="flex-1 p-3 space-y-1.5">
              {course.lessons.map((lesson, idx) => {
                const isActive = idx === activeLessonIndex
                const isCompleted = lesson.is_completed
                const lBadge = LESSON_TYPE_BADGES[lesson.lesson_type] || LESSON_TYPE_BADGES.concept

                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLessonIndex(idx)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                      isActive
                        ? "bg-primary/10 border border-primary/30 text-foreground font-semibold shadow-sm"
                        : isCompleted
                        ? "bg-emerald-500/5 border border-emerald-500/20 text-muted-foreground hover:text-foreground"
                        : "hover:bg-muted/40 text-muted-foreground hover:text-foreground border border-transparent"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-mono font-bold mt-0.5 ${
                        isCompleted
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs truncate ${isActive ? "text-foreground font-bold" : ""}`}>
                          {lesson.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] border ${lBadge.className}`}>
                          {lBadge.label}
                        </span>
                        <span>{lesson.estimated_minutes} min</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </aside>
        )}

        {/* Right Column: Deep Learning Lesson Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8">
          {/* Lesson Header Banner */}
          <div className="space-y-3 pb-6 border-b border-border/40">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold font-mono uppercase tracking-wider border border-primary/20">
                Lesson {activeLessonIndex + 1} of {totalLessons}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badge.className}`}>
                {badge.label}
              </span>
              <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{activeLesson.estimated_minutes} minutes</span>
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {activeLesson.title}
            </h1>
          </div>

          {/* Section 1: Objective */}
          <div className="p-4 md:p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-primary text-xs uppercase tracking-wider">
              <Target className="h-4 w-4" />
              <span>Learning Objective</span>
            </div>
            <p className="text-xs md:text-sm text-foreground/90 font-medium leading-relaxed">
              {activeLesson.objective}
            </p>
          </div>

          {/* Section 2: Deep Concept & Educational Explanation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h2>Core Concept & Architectural Deep Dive</h2>
            </div>
            
            <div className="rounded-2xl border border-border/40 bg-card/40 p-5 md:p-6 text-xs md:text-sm leading-relaxed text-foreground/90 whitespace-pre-line space-y-4">
              {activeLesson.concept_guide}
            </div>
          </div>

          {/* Section 3: Syntactic Implementation Code Block */}
          {activeLesson.code_example && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Code2 className="h-4 w-4 text-primary" />
                  <span>Syntactic Implementation Example</span>
                </span>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/40 bg-card/40 text-[10px] hover:text-foreground hover:bg-muted/40 transition-all"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-slate-950 p-4 md:p-5">
                <pre className="font-mono text-[11px] md:text-xs overflow-x-auto text-emerald-400 leading-relaxed">
                  {activeLesson.code_example}
                </pre>
              </div>

              {activeLesson.code_explanation && (
                <p className="text-xs text-muted-foreground italic font-mono bg-muted/20 p-3 rounded-xl border border-border/30">
                  💡 Code Insight: {activeLesson.code_explanation}
                </p>
              )}
            </div>
          )}

          {/* Section 4: Practical Exercise / Hands-On Task */}
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 md:p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              <BrainCircuit className="h-4 w-4 text-purple-500" />
              <span>Hands-On Action Item</span>
            </div>
            <p className="text-xs md:text-sm text-foreground/90 leading-relaxed">
              {activeLesson.practical_exercise}
            </p>
          </div>

          {/* Section 5: Knowledge Checkpoint Quiz */}
          {activeLesson.checkpoint_question && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Knowledge Checkpoint</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">Self Verification</span>
              </div>

              <p className="text-xs md:text-sm font-semibold text-foreground">
                {activeLesson.checkpoint_question}
              </p>

              {activeLesson.checkpoint_options && (
                <div className="space-y-2 pt-2">
                  {activeLesson.checkpoint_options.map((opt, idx) => {
                    const isSelected = selectedQuizOption === idx
                    const isCorrect = idx === activeLesson.checkpoint_correct_index

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedQuizOption(idx)}
                        className={`w-full text-left p-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-between ${
                          isSelected
                            ? isCorrect
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-300 font-bold"
                              : "bg-destructive/20 border-destructive text-destructive font-semibold"
                            : "bg-card/40 border-border/40 hover:bg-muted/30 text-foreground/90"
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && (
                          <span className="text-[10px] font-mono shrink-0 ml-2">
                            {isCorrect ? "✓ Correct" : "✗ Try again"}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {selectedQuizOption !== null && activeLesson.checkpoint_explanation && (
                <div className="p-3 rounded-xl bg-card border border-emerald-500/30 text-xs text-muted-foreground font-mono">
                  💡 Explanation: {activeLesson.checkpoint_explanation}
                </div>
              )}
            </div>
          )}

          {/* Celebration Banner when course completed */}
          {isCourseComplete && (
            <div className="p-6 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 to-primary/10 backdrop-blur-xl text-center space-y-3">
              <Trophy className="h-10 w-10 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-foreground">Course Completed!</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Congratulations! You have completed all {totalLessons} lessons in {course.title}.
              </p>
              <button
                onClick={onExit}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                Return to Course Library
              </button>
            </div>
          )}

          {/* Footer Lesson Stepper Bar */}
          <div className="pt-6 border-t border-border/40 flex items-center justify-between gap-4">
            <button
              onClick={() => setActiveLessonIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeLessonIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-border/40 bg-card/30 text-foreground hover:bg-muted/40 transition-all disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Lesson</span>
            </button>

            <button
              onClick={() => onCompleteLesson(activeLesson.id)}
              disabled={completingId === activeLesson.id || activeLesson.is_completed}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeLesson.is_completed
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-default"
                  : "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50"
              }`}
            >
              {activeLesson.is_completed ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Lesson Completed</span>
                </>
              ) : completingId === activeLesson.id ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Mark as Complete</span>
                </>
              )}
            </button>

            <button
              onClick={() => setActiveLessonIndex((prev) => Math.min(totalLessons - 1, prev + 1))}
              disabled={activeLessonIndex === totalLessons - 1}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-border/40 bg-card/30 text-foreground hover:bg-muted/40 transition-all disabled:opacity-40"
            >
              <span>Next Lesson</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
