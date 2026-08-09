import { CONTENT_REGISTRY } from "../lib/generator/content-registry"
import { DOMAIN_REGISTRY, MODULE_REGISTRY } from "../lib/generator/curriculum-registry"
import { QUESTION_BANK } from "../lib/data/question-bank"

function runVerification() {
  console.log("==================================================")
  console.log("CONTENT QUALITY VALIDATION REPORT")
  console.log("==================================================")

  // 1. Gather all unique content_ids from curriculum-registry
  let totalCurriculumActivities = 0
  const expectedContentIds = new Set<string>()

  DOMAIN_REGISTRY.forEach(domain => {
    const allModIds = [
      ...domain.progression.beginner,
      ...domain.progression.intermediate,
      ...domain.progression.advanced
    ]
    allModIds.forEach(modId => {
      const mod = MODULE_REGISTRY[modId]
      if (mod && mod.activities) {
        mod.activities.forEach(act => {
          totalCurriculumActivities++
          if (act.contentId) {
            expectedContentIds.add(act.contentId)
          }
        })
      }
    })
  })

  console.log(`Total curriculum activities: ${totalCurriculumActivities}`)
  console.log(`Activities with content_id: ${expectedContentIds.size}`)

  // 2. Validate against CONTENT_REGISTRY
  let validEntries = 0
  let missingEntries = 0
  let placeholderEntries = 0
  const missingIds: string[] = []

  expectedContentIds.forEach(id => {
    const payload = CONTENT_REGISTRY[id]
    if (!payload) {
      missingEntries++
      missingIds.push(id)
    } else {
      validEntries++
      // Check for generic placeholders
      const strPayload = JSON.stringify(payload).toLowerCase()
      if (strPayload.includes("content is being prepared") || 
          strPayload.includes("placeholder") || 
          strPayload.includes("focus on understanding core principles") || 
          payload.concept_guide?.trim() === "" || 
          payload.objective?.trim() === "") {
        placeholderEntries++
      }
    }
  })

  console.log(`Valid content registry entries: ${validEntries}`)
  console.log(`Missing content: ${missingEntries}`)
  console.log(`Placeholder/generic content: ${placeholderEntries}`)
  if (missingIds.length > 0) {
    console.log("Missing IDs:", missingIds.join(", "))
  }

  // 3. Question Bank Validation
  console.log("\n==================================================")
  console.log("ASSESSMENT VALIDATION REPORT")
  console.log("==================================================")

  let totalQuestions = 0
  const typeCounts: Record<string, number> = {}

  Object.values(QUESTION_BANK).forEach(questions => {
    questions.forEach(q => {
      totalQuestions++
      typeCounts[q.questionType] = (typeCounts[q.questionType] || 0) + 1
    })
  })

  console.log(`Assessment questions: ${totalQuestions}`)
  console.log("Assessment types:")
  Object.entries(typeCounts).forEach(([type, count]) => {
    console.log(`- ${type}: ${count}`)
  })
}

runVerification()
