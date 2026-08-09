import type { CurrentLevel } from "./database.types"

export type QuestionType = "mcq" | "true_false" | "multiple_select" | "scenario" | "code_question"
export type QuestionDifficulty = "beginner" | "intermediate" | "advanced"

export interface AssessmentOption {
  id: string
  text: string
}

export interface AssessmentQuestion {
  id: string
  question: string
  options: AssessmentOption[]
  correct_answer_id: string
  explanation?: string
  topic: string // e.g., "CSS Layout", "React State"
  difficulty: QuestionDifficulty
  questionType: QuestionType
}

export interface StaticAssessment {
  id: string
  title: string
  description: string
  roleTarget: string[] // e.g., ["Frontend Developer", "Full Stack Developer"]
  level: CurrentLevel
  courseId?: string
  topic: string
  estimated_minutes: number
  passingScore: number
  questions: AssessmentQuestion[]
}
