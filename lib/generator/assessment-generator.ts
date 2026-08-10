import type { StaticAssessment, AssessmentQuestion } from "@/types/assessment"
import type { Database } from "@/types/database.types"
import { QUESTION_BANK } from "@/lib/data/question-bank"

type LearningModule = Database["public"]["Tables"]["learning_modules"]["Row"]
type LearnerProfile = Database["public"]["Tables"]["learner_profiles"]["Row"]

const TARGET_QUESTION_COUNT = 10

// Deterministic PRNG based on string seed
function createSeededRandom(seedStr: string) {
  let hash = 0
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i)
    hash |= 0
  }
  return function () {
    hash = (hash + 0x6d2b79f5) | 0
    let t = Math.imul(hash ^ (hash >>> 15), 1 | hash)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Maps module metadata and user profile to primary and supporting domain keys.
 */
function identifyDomains(module: LearningModule, profile: LearnerProfile): { primary: string; secondary: string[] } {
  const titleLower = (module.title || "").toLowerCase()
  const descLower = (module.description || "").toLowerCase()
  const goalLower = (profile.learning_goal || "").toLowerCase()

  if (titleLower.includes("async") || titleLower.includes("promise") || titleLower.includes("event loop") || descLower.includes("async")) {
    return { primary: "js_async", secondary: ["javascript", "react", "general"] }
  }
  if (titleLower.includes("html") || titleLower.includes("web fundamental") || titleLower.includes("structural syntax") || descLower.includes("html")) {
    return { primary: "html", secondary: ["css", "javascript", "general"] }
  }
  if (titleLower.includes("css") || titleLower.includes("layout") || titleLower.includes("responsive") || descLower.includes("css")) {
    return { primary: "css", secondary: ["html", "javascript", "general"] }
  }
  if (titleLower.includes("react") || titleLower.includes("component") || titleLower.includes("state management") || descLower.includes("react")) {
    return { primary: "react", secondary: ["javascript", "js_async", "general"] }
  }
  if (titleLower.includes("database") || titleLower.includes("sql") || titleLower.includes("backend") || titleLower.includes("api") || descLower.includes("sql") || descLower.includes("server")) {
    return { primary: "database", secondary: ["javascript", "general"] }
  }
  if (titleLower.includes("ai") || titleLower.includes("llm") || titleLower.includes("rag") || titleLower.includes("prompt") || descLower.includes("ai")) {
    return { primary: "ai", secondary: ["database", "general"] }
  }
  if (titleLower.includes("javascript") || titleLower.includes("es6") || titleLower.includes("dom") || descLower.includes("javascript")) {
    return { primary: "javascript", secondary: ["html", "js_async", "general"] }
  }

  // Fallbacks based on learner goal
  if (goalLower.includes("full") || goalLower.includes("web")) {
    return { primary: "javascript", secondary: ["html", "css", "react", "general"] }
  }
  if (goalLower.includes("ai") || goalLower.includes("machine")) {
    return { primary: "ai", secondary: ["database", "general"] }
  }

  return { primary: "general", secondary: ["javascript", "html", "css"] }
}

/**
 * Generates exactly 10 high-quality, diverse, progressively challenging questions
 * tailored to the module's topics and the learner's skill level.
 *
 * Enforces structured type diversity:
 * 1. Conceptual MCQ (Foundational)
 * 2. Conceptual MCQ (In-Depth Mechanics)
 * 3. Code Output / Execution Tracing
 * 4. Code Debugging / Error Isolation
 * 5. Multiple Select (Multi-criteria evaluation)
 * 6. Scenario / Real-World Problem
 * 7. True/False with Reasoning
 * 8. Architecture / System Design & Trade-Offs
 * 9. Practical Code Writing with Test Cases
 * 10. Deep Technical Analysis & Self-Review
 */
export function generateAssessmentForModule(
  module: LearningModule,
  profile: LearnerProfile
): StaticAssessment {
  const level = profile.current_level || "beginner"
  const { primary, secondary } = identifyDomains(module, profile)

  // Collect candidate pools
  const primaryPool = QUESTION_BANK[primary] || []
  const secondaryPool: Omit<AssessmentQuestion, "id">[] = []
  secondary.forEach(k => {
    (QUESTION_BANK[k] || []).forEach(q => {
      if (!secondaryPool.includes(q)) secondaryPool.push(q)
    })
  })
  const generalPool = QUESTION_BANK["general"] || []

  // Seeded random for deterministic per-module stability
  const random = createSeededRandom(`${module.id}-${profile.user_id || "default"}`)
  const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }

  // Combined candidate search with primary domain weighted highest
  const allCandidates = [
    ...shuffle(primaryPool),
    ...shuffle(secondaryPool),
    ...shuffle(generalPool),
  ]

  const selectedSet = new Set<string>()
  const selectedQuestions: Omit<AssessmentQuestion, "id">[] = []

  // Helper to find question matching type and difficulty priority
  const findQuestion = (
    types: string[],
    preferLevel?: "beginner" | "intermediate" | "advanced"
  ): Omit<AssessmentQuestion, "id"> | null => {
    // Pass 1: Primary pool matching type & difficulty
    for (const q of primaryPool) {
      if (types.includes(q.questionType) && !selectedSet.has(q.question)) {
        if (!preferLevel || q.difficulty === preferLevel) {
          selectedSet.add(q.question)
          return q
        }
      }
    }
    // Pass 2: Primary pool matching type (any difficulty)
    for (const q of primaryPool) {
      if (types.includes(q.questionType) && !selectedSet.has(q.question)) {
        selectedSet.add(q.question)
        return q
      }
    }
    // Pass 3: All candidates matching type & difficulty
    for (const q of allCandidates) {
      if (types.includes(q.questionType) && !selectedSet.has(q.question)) {
        if (!preferLevel || q.difficulty === preferLevel) {
          selectedSet.add(q.question)
          return q
        }
      }
    }
    // Pass 4: All candidates matching type
    for (const q of allCandidates) {
      if (types.includes(q.questionType) && !selectedSet.has(q.question)) {
        selectedSet.add(q.question)
        return q
      }
    }
    // Pass 5: Any unused candidate
    for (const q of allCandidates) {
      if (!selectedSet.has(q.question)) {
        selectedSet.add(q.question)
        return q
      }
    }
    return null
  }

  // Determine difficulty progression based on user current level
  const isAdv = level === "advanced" || level === "intermediate"
  const diffL1 = isAdv ? "intermediate" : "beginner"
  const diffL2 = isAdv ? "advanced" : "intermediate"
  const diffL3 = isAdv ? "advanced" : "intermediate"

  // Structured 10-slot blueprint:
  // 1. MCQ (Foundational / Core Principle)
  const q1 = findQuestion(["mcq"], diffL1)
  if (q1) selectedQuestions.push(q1)

  // 2. MCQ (In-Depth Mechanics / Advanced Concept)
  const q2 = findQuestion(["mcq"], diffL2)
  if (q2) selectedQuestions.push(q2)

  // 3. Code Output / Execution Tracing
  const q3 = findQuestion(["code_output", "debugging", "mcq"], diffL2)
  if (q3) selectedQuestions.push(q3)

  // 4. Code Debugging / Finding Subtle Bug
  const q4 = findQuestion(["debugging", "code_output", "mcq"], diffL2)
  if (q4) selectedQuestions.push(q4)

  // 5. Multiple Select (Multi-criteria analysis)
  const q5 = findQuestion(["multiple_select", "mcq"], diffL2)
  if (q5) selectedQuestions.push(q5)

  // 6. Practical Scenario / Real-World Problem
  const q6 = findQuestion(["scenario", "mcq"], diffL2)
  if (q6) selectedQuestions.push(q6)

  // 7. True/False with Detailed Rationale
  const q7 = findQuestion(["true_false", "mcq"], diffL1)
  if (q7) selectedQuestions.push(q7)

  // 8. Architecture / Trade-Off Analysis
  const q8 = findQuestion(["scenario", "mcq"], diffL3)
  if (q8) selectedQuestions.push(q8)

  // 9. Practical Live Code Writing / Algorithmic Challenge
  const q9 = findQuestion(["code_write", "debugging", "mcq"], diffL2)
  if (q9) selectedQuestions.push(q9)

  // 10. Deep Technical Analysis & Self-Review
  const q10 = findQuestion(["short_answer", "scenario", "mcq"], diffL3)
  if (q10) selectedQuestions.push(q10)

  // Fallback if any slots failed to reach TARGET_QUESTION_COUNT (10)
  while (selectedQuestions.length < TARGET_QUESTION_COUNT) {
    const fallback = findQuestion(["mcq", "multiple_select", "scenario", "true_false", "short_answer", "code_write"])
    if (fallback) {
      selectedQuestions.push(fallback)
    } else {
      break
    }
  }

  // Map to AssessmentQuestion with stable deterministic IDs
  const questions: AssessmentQuestion[] = selectedQuestions.slice(0, TARGET_QUESTION_COUNT).map((q, idx) => ({
    ...q,
    id: `q-${module.id}-${idx + 1}`,
  }))

  return {
    id: module.id,
    title: `Assessment: ${module.title}`,
    description: `Comprehensive 10-question evaluation on ${module.title} featuring code inspection, architecture scenarios, and practical challenges calibrated for ${level} level.`,
    roleTarget: [],
    level: level,
    courseId: module.plan_id,
    topic: primary,
    estimated_minutes: 20,
    passingScore: 70,
    questions,
  }
}
