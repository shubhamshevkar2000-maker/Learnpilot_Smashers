import type { LearnerProfile, CurrentLevel, ActivityType, AssessmentResult } from "@/types/database.types"
import { generateRecommendations } from "./recommendation-engine"
import type { ActivityTemplate } from "./curriculum-registry"

export interface GeneratedActivity {
  title: string
  activity_type: ActivityType
  sequence_order: number
  estimated_minutes: number
  day_number: number
  content_id?: string
}

export interface GeneratedModule {
  id: string
  title: string
  description: string
  rationale: string
  sequence_order: number
  estimated_minutes: number
  activities: GeneratedActivity[]
}

export interface GeneratedPlan {
  title: string
  goal_summary: string
  modules: GeneratedModule[]
}

/**
 * Calculates module estimated minutes as the exact sum of its activity estimated minutes.
 */
export function sumActivityMinutes(activities: GeneratedActivity[]): number {
  return activities.reduce((acc, act) => acc + (act.estimated_minutes || 20), 0)
}

/**
 * Target-Date Aware, Production-Grade Curriculum & Schedule Generator.
 * Generates realistic, educationally coherent learning paths using the personalized Recommendation Engine.
 */
export function generateLearningPlan(
  profile: LearnerProfile, 
  assessmentResults: AssessmentResult[] = [], 
  completedModuleIds: string[] = []
): GeneratedPlan {
  const goal = (profile.learning_goal || "General Skill Mastery").trim()
  const outcome = (profile.desired_outcome || "Achieve practical mastery").trim()
  const level: CurrentLevel = profile.current_level || "beginner"

  const dailyBudget = profile.available_daily_minutes ? Math.max(profile.available_daily_minutes, 15) : 30

  // Calculate target date horizon in days
  let targetDays = 180 // default 6-month horizon
  if (profile.target_date) {
    const targetMs = new Date(profile.target_date).getTime()
    const nowMs = Date.now()
    if (!isNaN(targetMs) && targetMs > nowMs) {
      targetDays = Math.max(Math.ceil((targetMs - nowMs) / (1000 * 60 * 60 * 24)), 14)
    }
  }

  const planTitle = `${goal} — Comprehensive Career Roadmap`
  const goalSummary = `A realistic, structured curriculum taking you from ${
    level === "beginner" ? "foundations" : level === "intermediate" ? "intermediate knowledge" : "advanced concepts"
  } to achieving "${outcome}" over a target horizon of ~${Math.round(targetDays / 30)} months.`

  // 1. Get Recommendations from the Engine
  const recommendations = generateRecommendations(profile, assessmentResults, completedModuleIds)
  
  // 2. Select top recommended modules (e.g., top 10) that are not locked
  const selectedModules = recommendations.filter(r => !r.isLocked).slice(0, 10).map(r => r.module)

  const finalModules: GeneratedModule[] = []

  let globalDayCounter = 1
  let currentDayMinutesUsed = 0

  selectedModules.forEach((modTemplate, modIndex) => {
    const modActivities: GeneratedActivity[] = []
    
    modTemplate.activities.forEach((actTemplate, actIndex) => {
      const actTime = actTemplate.estimated_minutes || 20
      
      if (currentDayMinutesUsed + actTime > dailyBudget && currentDayMinutesUsed > 0) {
        globalDayCounter++
        currentDayMinutesUsed = 0
      }
      
      currentDayMinutesUsed += actTime

      modActivities.push({
        title: actTemplate.title,
        activity_type: actTemplate.activity_type,
        sequence_order: actIndex + 1,
        estimated_minutes: actTime,
        day_number: globalDayCounter,
        content_id: actTemplate.contentId
      })
    })

    const modTime = sumActivityMinutes(modActivities)
    
    finalModules.push({
      id: modTemplate.id,
      title: modTemplate.title,
      description: modTemplate.description,
      rationale: modTemplate.rationale,
      sequence_order: modIndex + 1,
      estimated_minutes: modTime,
      activities: modActivities
    })
  })

  return {
    title: planTitle,
    goal_summary: goalSummary,
    modules: finalModules,
  }
}
