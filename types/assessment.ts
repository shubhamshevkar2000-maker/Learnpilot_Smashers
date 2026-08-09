import type { CurrentLevel } from "./database.types"

export type QuestionType = "mcq" | "multiple_select" | "true_false" | "code_output" | "debugging" | "short_answer" | "scenario" | "code_write"
export type QuestionDifficulty = "beginner" | "intermediate" | "advanced"

export interface AssessmentOption {
  id: string
  text: string
}

export interface CodeTestCase {
  input: string
  expected: string
}

export interface AssessmentQuestion {
  id: string
  question: string
  options?: AssessmentOption[] // Optional for short_answer and code_write
  correct_answer_id?: string // For single choice
  multiple_correct_ids?: string[] // For multiple_select
  codeSnippet?: string // For code_output and debugging
  selfReviewCriteria?: string[] // For short_answer self-review rubric
  
  // Fields for code_write
  language?: string
  starterCode?: string
  testCases?: CodeTestCase[]
  expectedBehavior?: string
  hints?: string[]

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
