import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

type LearnerProfile = Database["public"]["Tables"]["learner_profiles"]["Row"]
type LearningPlan = Database["public"]["Tables"]["learning_plans"]["Row"]
type LearningModule = Database["public"]["Tables"]["learning_modules"]["Row"]
type AssessmentResult = Database["public"]["Tables"]["assessment_results"]["Row"]

export interface SkillMastery {
  topic: string
  latestScore: number
  trend: number | null // positive means improved, negative means declined
}

export interface ActivityEvent {
  id: string
  type: "module_completed" | "assessment_attempted"
  title: string
  timestamp: string
  detail?: string
}

export interface ProgressViewModel {
  profile: LearnerProfile
  plan: LearningPlan | null
  modules: LearningModule[]
  
  overallProgress: {
    completedModules: number
    totalModules: number
    percentage: number
  }
  
  currentFocus: {
    module: LearningModule | null
    assessmentAttempts: number
    latestScore: number | null
  }
  
  assessmentPerformance: {
    totalAttempts: number
    averageScore: number | null
    bestScore: number | null
    latestScore: number | null
  }
  
  skillMastery: SkillMastery[]
  areasToImprove: SkillMastery[]
  recentActivity: ActivityEvent[]
  
  targetTrajectory: {
    targetDate: string | null
    daysRemaining: number | null
  }
}

export async function getProgressViewModel(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<ProgressViewModel | null> {
  if (!userId) return null

  // 1. Fetch Learner Profile
  const { data: profileData, error: profileError } = await supabase
    .from("learner_profiles")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (profileError || !profileData) return null
  const profile = profileData as LearnerProfile

  // 2. Fetch Active Learning Plan & Modules
  let plan: LearningPlan | null = null
  let modules: LearningModule[] = []
  
  const { data: planData } = await supabase
    .from("learning_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle()

  if (planData) {
    plan = planData as LearningPlan
    const { data: modulesData } = await supabase
      .from("learning_modules")
      .select("*")
      .eq("plan_id", plan.id)
      .order("sequence_order", { ascending: true })
      
    if (modulesData) {
      modules = modulesData as LearningModule[]
    }
  }

  // 3. Fetch Assessment Results (order oldest to newest to calculate trends properly)
  const { data: assessmentData } = await supabase
    .from("assessment_results")
    .select("*")
    .eq("user_id", userId)
    .order("attempted_at", { ascending: true })

  const assessments = (assessmentData || []) as AssessmentResult[]

  // --- CALCULATIONS ---

  // Overall Progress
  const completedModules = modules.filter(m => m.status === "completed").length
  const totalModules = modules.length
  const percentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0

  // Current Focus (first module that is not completed)
  const currentModule = modules.find(m => m.status !== "completed") || null
  let currentFocusAssessmentAttempts = 0
  let currentFocusLatestScore: number | null = null
  
  if (currentModule) {
    const focusAssessments = assessments.filter(a => a.module_id === currentModule.id)
    currentFocusAssessmentAttempts = focusAssessments.length
    if (focusAssessments.length > 0) {
      currentFocusLatestScore = focusAssessments[focusAssessments.length - 1].score
    }
  }

  // Assessment Performance
  const totalAttempts = assessments.length
  let averageScore: number | null = null
  let bestScore: number | null = null
  let latestScore: number | null = null
  
  if (totalAttempts > 0) {
    const sum = assessments.reduce((acc, curr) => acc + curr.score, 0)
    averageScore = Math.round(sum / totalAttempts)
    bestScore = Math.round(Math.max(...assessments.map(a => a.score)))
    latestScore = Math.round(assessments[assessments.length - 1].score)
  }

  // Skill Mastery & Trend Calculation
  // We will process attempts chronologically to track the history of each skill
  const skillHistory: Record<string, number[]> = {}
  const typeHistory: Record<string, number[]> = {}
  
  assessments.forEach(attempt => {
    const meta = attempt.metadata as Record<string, any> | undefined
    const breakdown = meta?.skillBreakdown as Record<string, number> | undefined
    if (breakdown) {
      Object.entries(breakdown).forEach(([skill, score]) => {
        if (!skillHistory[skill]) {
          skillHistory[skill] = []
        }
        skillHistory[skill].push(score)
      })
    }

    const tBreakdown = meta?.typeBreakdown as Record<string, number> | undefined
    if (tBreakdown) {
      Object.entries(tBreakdown).forEach(([type, score]) => {
        if (!typeHistory[type]) {
          typeHistory[type] = []
        }
        typeHistory[type].push(score)
      })
    }
  })

  const skillMastery: SkillMastery[] = Object.entries(skillHistory).map(([topic, scores]) => {
    const latest = scores[scores.length - 1]
    let trend: number | null = null
    if (scores.length > 1) {
      const previous = scores[scores.length - 2]
      trend = latest - previous
    }
    return {
      topic,
      latestScore: latest,
      trend
    }
  }).sort((a, b) => b.latestScore - a.latestScore) // Highest to lowest

  const typeMastery: SkillMastery[] = Object.entries(typeHistory).map(([topic, scores]) => {
    const latest = scores[scores.length - 1]
    let trend: number | null = null
    if (scores.length > 1) {
      const previous = scores[scores.length - 2]
      trend = latest - previous
    }
    return {
      topic,
      latestScore: latest,
      trend
    }
  }).sort((a, b) => b.latestScore - a.latestScore) // Highest to lowest

  // Areas to Improve (Weakest skills, threshold < 75 or just bottom N)
  const areasToImprove = [...skillMastery, ...typeMastery]
    .filter(s => s.latestScore < 80) // A configurable threshold to consider it an "area to improve"
    .sort((a, b) => a.latestScore - b.latestScore) // Lowest to highest
    .slice(0, 3)

  // Target Trajectory
  let daysRemaining: number | null = null
  if (profile.target_date) {
    const target = new Date(profile.target_date)
    const now = new Date()
    const diffTime = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    daysRemaining = diffDays > 0 ? diffDays : 0
  }

  // Recent Activity (Interleaved modules and assessments)
  let activityEvents: ActivityEvent[] = []
  
  modules.forEach(m => {
    if (m.status === "completed" && m.completed_at) {
      activityEvents.push({
        id: `mod-${m.id}`,
        type: "module_completed",
        title: `Completed Module: ${m.title}`,
        timestamp: m.completed_at
      })
    }
  })
  
  assessments.forEach(a => {
    const meta = a.metadata as Record<string, any> | undefined
    const title = meta?.module_title || a.assessment_title || "Assessment"
    activityEvents.push({
      id: `assmt-${a.id}`,
      type: "assessment_attempted",
      title: `Assessment Attempt: ${title}`,
      timestamp: a.attempted_at,
      detail: `Scored ${Math.round(a.score)}%`
    })
  })

  // Sort by newest first
  activityEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  
  // Cap at 10 recent events
  activityEvents = activityEvents.slice(0, 10)

  return {
    profile,
    plan,
    modules,
    overallProgress: {
      completedModules,
      totalModules,
      percentage
    },
    currentFocus: {
      module: currentModule,
      assessmentAttempts: currentFocusAssessmentAttempts,
      latestScore: currentFocusLatestScore
    },
    assessmentPerformance: {
      totalAttempts,
      averageScore,
      bestScore,
      latestScore
    },
    skillMastery,
    areasToImprove,
    recentActivity: activityEvents,
    targetTrajectory: {
      targetDate: profile.target_date,
      daysRemaining
    }
  }
}
