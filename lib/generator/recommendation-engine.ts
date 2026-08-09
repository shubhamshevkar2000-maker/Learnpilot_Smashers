import type { LearnerProfile, AssessmentResult } from "@/types/database.types"
import { MODULE_REGISTRY, DOMAIN_REGISTRY, type ModuleTemplate } from "./curriculum-registry"

export interface RecommendationReason {
  primary: string
  skillGap?: string
  goalAlignment: string
  prerequisiteStatus: string
  nextStep?: string
}

export interface RecommendedModule {
  module: ModuleTemplate
  score: number
  reason: RecommendationReason
  isLocked: boolean
}

function calculateSkillGaps(assessmentResults: AssessmentResult[]): Record<string, number> {
  const gaps: Record<string, number> = {}
  
  const topicScores: Record<string, number[]> = {}
  
  for (const result of (assessmentResults || [])) {
    // Assuming we extract skills from result somehow, but result structure might be generic
    // Let's assume result has 'topic' or 'skill_name' based on generic 'AssessmentResult' type mapping.
    // For now we map based on arbitrary structure.
    const topic = (result as any).topic || (result as any).skill || (result as any).title || "unknown"
    if (topic && result.score !== undefined) {
      if (!topicScores[topic]) topicScores[topic] = []
      topicScores[topic].push(result.score)
    }
  }

  for (const [topic, scores] of Object.entries(topicScores)) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    gaps[topic.toLowerCase()] = avg
  }

  return gaps
}

export function generateRecommendations(
  profile: LearnerProfile,
  assessmentResults: AssessmentResult[],
  completedModuleIds: string[]
): RecommendedModule[] {
  const recommendations: RecommendedModule[] = []
  const skillScores = calculateSkillGaps(assessmentResults)
  
  const lowerGoal = (profile.learning_goal || "").toLowerCase()
  const level = profile.current_level || "beginner"

  // Normalize user goal to matched domain IDs based on aliases
  const matchedDomainIds = new Set<string>()
  for (const config of DOMAIN_REGISTRY) {
    for (const alias of config.aliases) {
      if (lowerGoal.includes(alias) || alias.includes(lowerGoal)) {
        matchedDomainIds.add(config.id)
      }
    }
  }

  for (const mod of Object.values(MODULE_REGISTRY)) {
    // 1. Skip if completed
    if (completedModuleIds.includes(mod.id)) {
      continue
    }

    let score = 50 // Base score
    const reason: RecommendationReason = {
      primary: "Relevant to your learning journey.",
      goalAlignment: "Supports general skill development.",
      prerequisiteStatus: "Prerequisites cleared."
    }

    // 2. Goal Alignment
    if (lowerGoal.includes(mod.domain) || matchedDomainIds.has(mod.domain)) {
      score += 20
      reason.goalAlignment = `Aligns with your ${mod.domain} goals.`
    }

    // 3. Level Match
    if (mod.targetLevels.includes(level)) {
      score += 15
    } else {
      score -= 10
    }

    // 4. Assessment Results (Skill Gaps)
    let hasCriticalWeakness = false
    let hasMastery = false
    let lowestScore = 100
    let weakSkill = ""

    if (mod.skillsTaught) {
      for (const skill of mod.skillsTaught) {
        const lowerSkill = skill.toLowerCase()
        // Check exact or partial match in assessment results
        for (const [assessedSkill, avgScore] of Object.entries(skillScores)) {
          if (assessedSkill.includes(lowerSkill) || lowerSkill.includes(assessedSkill)) {
            if (avgScore < 50) {
              score += 30
              hasCriticalWeakness = true
              if (avgScore < lowestScore) {
                lowestScore = avgScore
                weakSkill = skill
              }
            } else if (avgScore >= 50 && avgScore < 70) {
              score += 15
              if (avgScore < lowestScore) {
                lowestScore = avgScore
                weakSkill = skill
              }
            } else if (avgScore >= 85) {
              score -= 20
              hasMastery = true
            }
          }
        }
      }
    }

    if (hasCriticalWeakness) {
      reason.primary = `Recommended because your assessment shows a weakness in ${weakSkill}.`
      reason.skillGap = `${weakSkill}: ${Math.round(lowestScore)}%`
    } else if (hasMastery) {
      reason.primary = "You have demonstrated strong proficiency in related skills."
    }

    // 5. Prerequisite Logic
    let isLocked = false
    let missingPrereqs: string[] = []
    
    if (mod.prerequisites && mod.prerequisites.length > 0) {
      missingPrereqs = mod.prerequisites.filter(pId => !completedModuleIds.includes(pId))
      if (missingPrereqs.length > 0) {
        // Has missing prereqs
        isLocked = true
        score -= 100 // Massive penalty to push it down
        reason.prerequisiteStatus = "Requires prior completion of foundational modules."
        reason.primary = "Locked until prerequisites are met."
      }
    }

    recommendations.push({
      module: mod,
      score,
      reason,
      isLocked
    })
  }

  // Sort descending by score
  recommendations.sort((a, b) => b.score - a.score)

  // Give a contextual boost to the #1 available module
  const topAvailable = recommendations.find(r => !r.isLocked)
  if (topAvailable && !topAvailable.reason.primary.includes("weakness")) {
    topAvailable.reason.primary = "This is the next logical step in your personalized progression."
    topAvailable.reason.nextStep = "Builds foundational knowledge."
  }

  return recommendations
}
