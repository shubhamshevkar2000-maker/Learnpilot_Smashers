import { generateRecommendations } from "./lib/generator/recommendation-engine"
import type { LearnerProfile, AssessmentResult } from "./types/database.types"

console.log("==================================================")
console.log("TEST A: Beginner Frontend with JS Weakness")
console.log("==================================================")
const profileA: LearnerProfile = {
  id: "test-a",
  user_id: "test-a",
  display_name: "Test A",
  learning_goal: "Frontend Developer",
  desired_outcome: "Get a job",
  current_level: "beginner",
  available_daily_minutes: 60,
  target_date: null,
  onboarding_completed: true,
  created_at: "",
  updated_at: ""
}

const assessmentsA: AssessmentResult[] = [
  { topic: "HTML", score: 95 } as any,
  { topic: "CSS", score: 90 } as any,
  { topic: "JavaScript", score: 40 } as any,
]

const completedA = ["mod-html-css-basics"]
const recsA = generateRecommendations(profileA, assessmentsA, completedA)
recsA.slice(0, 4).forEach((r, i) => {
  console.log(`${i+1}. [${r.module.id}] ${r.module.title} (Score: ${r.score}) - Locked: ${r.isLocked}`)
  console.log(`   Reason: ${r.reason.primary}`)
})


console.log("\n==================================================")
console.log("TEST B: Advanced React with Performance Weakness")
console.log("==================================================")
const profileB: LearnerProfile = {
  id: "test-b",
  user_id: "test-b",
  display_name: "Test B",
  learning_goal: "React Developer",
  desired_outcome: "Mastery",
  current_level: "advanced",
  available_daily_minutes: 60,
  target_date: null,
  onboarding_completed: true,
  created_at: "",
  updated_at: ""
}

const assessmentsB: AssessmentResult[] = [
  { topic: "JavaScript", score: 95 } as any,
  { topic: "React Basics", score: 95 } as any,
  { topic: "Performance", score: 45 } as any,
]

const completedB = ["mod-html-css-basics", "mod-js-basics", "mod-js-async", "mod-js-advanced", "mod-react-basics"]
const recsB = generateRecommendations(profileB, assessmentsB, completedB)
recsB.slice(0, 4).forEach((r, i) => {
  console.log(`${i+1}. [${r.module.id}] ${r.module.title} (Score: ${r.score}) - Locked: ${r.isLocked}`)
  console.log(`   Reason: ${r.reason.primary}`)
})

console.log("\n==================================================")
console.log("TEST C: Advanced AI with RAG Weakness")
console.log("==================================================")
const profileC: LearnerProfile = {
  id: "test-c",
  user_id: "test-c",
  display_name: "Test C",
  learning_goal: "AI Engineer",
  desired_outcome: "Build agents",
  current_level: "advanced",
  available_daily_minutes: 60,
  target_date: null,
  onboarding_completed: true,
  created_at: "",
  updated_at: ""
}

const assessmentsC: AssessmentResult[] = [
  { topic: "Python", score: 95 } as any,
  { topic: "AI Basics", score: 90 } as any,
  { topic: "RAG", score: 30 } as any,
]

const completedC = ["mod-backend-basics", "mod-ai-integration"]
const recsC = generateRecommendations(profileC, assessmentsC, completedC)
recsC.slice(0, 4).forEach((r, i) => {
  console.log(`${i+1}. [${r.module.id}] ${r.module.title} (Score: ${r.score}) - Locked: ${r.isLocked}`)
  console.log(`   Reason: ${r.reason.primary}`)
})
