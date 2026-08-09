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
  
  if (titleLower.includes("html") || titleLower.includes("web fundamental")) {
    selectedDomain = "html"
  } else if (titleLower.includes("css") || descLower.includes("css")) {
    selectedDomain = "css"
  } else if (titleLower.includes("react") || titleLower.includes("state management") || descLower.includes("react")) {
    selectedDomain = "react"
  } else if (titleLower.includes("javascript") || titleLower.includes("async") || descLower.includes("javascript")) {
    selectedDomain = "javascript"
  } else if (titleLower.includes("ai") || titleLower.includes("llm") || titleLower.includes("rag")) {
    selectedDomain = "ai"
  } else if (titleLower.includes("python") || descLower.includes("python")) {
    selectedDomain = "python"
  }

  // Pull questions for the domain
  let availableQuestions = QUESTION_BANK[selectedDomain] || []
  
  // If we don't have enough domain questions, pad with general
  if (availableQuestions.length < 3) {
    availableQuestions = [...availableQuestions, ...(QUESTION_BANK["general"] || [])]
  }

  // 1. Strict filter by difficulty based on learner level
  let filteredQuestions = availableQuestions.filter(q => {
    if (level === "beginner" || level === "basics" || level === "unknown") {
      return q.difficulty === "beginner"
    } else if (level === "intermediate") {
      return q.difficulty === "intermediate"
    } else {
      return q.difficulty === "advanced" || q.difficulty === "intermediate" // Give advanced some intermediate too
    }
  })

  // 2. Fallback: if strictly filtering leaves us with too few questions, expand the difficulty window
  if (filteredQuestions.length < 3) {
    filteredQuestions = availableQuestions.filter(q => {
      if (level === "beginner" || level === "basics" || level === "unknown") {
        return q.difficulty === "beginner" || q.difficulty === "intermediate"
      } else if (level === "intermediate") {
        return q.difficulty === "beginner" || q.difficulty === "intermediate" || q.difficulty === "advanced"
      } else {
        return true // take anything for advanced fallback
      }
    })
  }

  if (filteredQuestions.length === 0) {
    filteredQuestions = availableQuestions
  }

  // 3. Shuffle questions deterministically (using simple random for now, since it's client side generated anyway for MVP)
  // To keep it truly deterministic we could use a seeded PRNG based on module ID, but Math.random is fine for the demo
  const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random())

  // 4. Select up to 6 questions, prioritizing a mix of types
  const selectedQs: Omit<AssessmentQuestion, "id">[] = []
  const typeSet = new Set<string>()
  
  // First pass: try to get unique types
  for (const q of shuffled) {
    if (!typeSet.has(q.questionType) && selectedQs.length < 6) {
      selectedQs.push(q)
      typeSet.add(q.questionType)
    }
  }

  // Second pass: fill up to 6 with remaining questions
  for (const q of shuffled) {
    if (selectedQs.length >= 6) break;
    if (!selectedQs.includes(q)) {
      selectedQs.push(q)
    }
  }

  // Map to AssessmentQuestion by generating unique IDs for this attempt
  const questions: AssessmentQuestion[] = selectedQs.map((q, idx) => ({
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
