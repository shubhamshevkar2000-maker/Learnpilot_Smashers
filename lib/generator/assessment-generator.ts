import type { StaticAssessment, AssessmentQuestion } from "@/types/assessment"
import type { Database } from "@/types/database.types"

type LearningModule = Database["public"]["Tables"]["learning_modules"]["Row"]
type LearnerProfile = Database["public"]["Tables"]["learner_profiles"]["Row"]
import { QUESTION_BANK } from "@/lib/data/question-bank"

/**
 * Deterministic Assessment Generator
 * Uses the learner's actual module (learning context) and profile level
 * to map and select appropriate questions from the question bank.
 */
export function generateAssessmentForModule(
  module: LearningModule,
  profile: LearnerProfile
): StaticAssessment {
  const level = profile.current_level || "beginner"
  const titleLower = module.title.toLowerCase()
  const descLower = (module.description || "").toLowerCase()

  // Determine key domains from the module text
  let selectedDomain = "general"
  
  if (titleLower.includes("html") || titleLower.includes("css") || titleLower.includes("web fundamental") || descLower.includes("css")) {
    selectedDomain = "css"
  } else if (titleLower.includes("react") || titleLower.includes("state management") || descLower.includes("react")) {
    selectedDomain = "react"
  } else if (titleLower.includes("javascript") || titleLower.includes("async") || descLower.includes("javascript")) {
    selectedDomain = "javascript"
  } else if (titleLower.includes("html")) {
    selectedDomain = "html"
  }

  // Pull questions for the domain
  let availableQuestions = QUESTION_BANK[selectedDomain] || QUESTION_BANK["general"]

  // Filter by difficulty based on learner level if possible
  // For safety and MVP, we might just take all questions for the domain, or strictly filter.
  // We'll prefer matching level, but if empty, fallback to whatever is in the domain.
  let filteredQuestions = availableQuestions.filter(q => {
    if (level === "beginner" || level === "basics" || level === "unknown") {
      return q.difficulty === "beginner" || q.difficulty === "intermediate"
    } else if (level === "intermediate") {
      return q.difficulty === "intermediate" || q.difficulty === "advanced"
    } else {
      return q.difficulty === "advanced" || q.difficulty === "intermediate"
    }
  })

  // Fallback if strict filtering results in 0 questions
  if (filteredQuestions.length === 0) {
    filteredQuestions = availableQuestions
  }

  // Map to AssessmentQuestion by generating unique IDs for this attempt
  const questions: AssessmentQuestion[] = filteredQuestions.map((q, idx) => ({
    ...q,
    id: `q-${module.id}-${idx}`,
  }))

  return {
    id: module.id,
    title: `Assessment: ${module.title}`,
    description: `Validation check for concepts covered in: ${module.title}. Based on your level (${level}).`,
    roleTarget: [], // The assessment is now tied strictly to the module, not a generic role string.
    level: level,
    courseId: module.plan_id,
    topic: selectedDomain,
    estimated_minutes: 10,
    passingScore: 70,
    questions,
  }
}
