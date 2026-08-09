import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"
import { CONST_COURSES, type CourseLesson } from "@/lib/services/courses-service"

export interface RAGRetrievalInput {
  supabase: SupabaseClient<Database>
  userId: string
  userQuery: string
  learningGoal?: string
}

export interface RAGContextResult {
  activeModulesText: string
  relevantLessonsText: string
  currentFocusText: string
  fullRAGContext: string
}

/**
 * Production-safe RAG Retriever for LearnPilot AI Coach.
 * Retrieves real persistent data for the authenticated learner:
 * 1. Active Learning Path modules & activities from Supabase (strictly filtered by user_id).
 * 2. Current active module, current active task, today's schedule, and overall derived progress.
 * 3. Relevant course lessons from the real educational course catalog based on query relevance.
 */
export async function retrieveRAGContext({
  supabase,
  userId,
  userQuery,
  learningGoal = "",
}: RAGRetrievalInput): Promise<RAGContextResult> {
  let activeModulesText = "No active learning path modules currently registered."
  let relevantLessonsText = "No specific course catalog matches found."
  let currentFocusText = "No active activity currently selected."

  try {
    // 1. Fetch user's real persistent active learning plan & modules from Supabase
    const { data: activePlan } = await supabase
      .from("learning_plans")
      .select("id, title, goal_summary")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle()

    if (activePlan) {
      const { data: modules } = await supabase
        .from("learning_modules")
        .select("id, title, description, sequence_order, status, estimated_minutes")
        .eq("plan_id", activePlan.id)
        .eq("user_id", userId)
        .order("sequence_order", { ascending: true })

      if (modules && modules.length > 0) {
        const moduleIds = modules.map((m) => m.id)
        const { data: activities } = await supabase
          .from("module_activities")
          .select("id, module_id, title, activity_type, sequence_order, is_completed, estimated_minutes, day_number")
          .in("module_id", moduleIds)
          .eq("user_id", userId)
          .order("sequence_order", { ascending: true })

        const allActivities = activities || []
        const completedActivities = allActivities.filter((a) => a.is_completed)
        const totalActs = allActivities.length
        const totalMods = modules.length
        const completedMods = modules.filter((m) => m.status === "completed").length
        const derivedPct = totalActs > 0 ? Math.round((completedActivities.length / totalActs) * 100) : 0

        // Find Current Active Module & Activity
        const currentMod = modules.find((m) => m.status === "in_progress") || modules.find((m) => m.status === "not_started") || modules[0]
        const currentAct = allActivities.find((a) => !a.is_completed)

        // Find Today's Activities
        const activeDayNum = currentAct?.day_number || 1
        const todaysActs = allActivities.filter((a) => (a.day_number || 1) === activeDayNum)

        currentFocusText = `
CURRENT POSITION & PROGRESS:
- Derived Overall Progress: ${derivedPct}% (${completedActivities.length}/${totalActs} activities, ${completedMods}/${totalMods} modules completed)
- Current Active Module: "${currentMod ? currentMod.title : 'None'}" [Status: ${currentMod ? currentMod.status : 'N/A'}]
- Current Active Task: "${currentAct ? currentAct.title : 'All activities completed!'}" [Type: ${currentAct ? currentAct.activity_type : 'N/A'}]
- Today's Focus Schedule (Day ${activeDayNum}):
${todaysActs.map((a) => `  * [${a.is_completed ? "Completed" : "In Progress"}] ${a.title} (${a.estimated_minutes || 20} mins, ${a.activity_type})`).join("\n") || "  None"}
`.trim()

        const activityMap = new Map<string, typeof allActivities>()
        for (const act of allActivities) {
          const list = activityMap.get(act.module_id) || []
          list.push(act)
          activityMap.set(act.module_id, list)
        }

        const moduleSummaries = modules.map((m) => {
          const acts = activityMap.get(m.id) || []
          const completedCount = acts.filter((a) => a.is_completed).length
          const actSummary = acts.length > 0 ? `(${completedCount}/${acts.length} activities done)` : ""
          return `• Module ${m.sequence_order}: "${m.title}" [Status: ${m.status}] ${actSummary} - ${m.description || ""}`
        })

        activeModulesText = `Active Plan: "${activePlan.title}" (${activePlan.goal_summary || ""})\n` + moduleSummaries.join("\n")
      }
    }
  } catch (err) {
    console.error("Error retrieving learner active curriculum for RAG:", err)
  }

  // 2. Query real course catalog lessons based on keyword/semantic relevance to user query + learning goal
  try {
    const queryTokens = (userQuery + " " + learningGoal)
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((t) => t.length > 2)

    const scoredLessons: { lesson: CourseLesson; score: number; courseTitle: string }[] = []

    for (const course of CONST_COURSES) {
      for (const lesson of course.lessons) {
        let score = 0
        const searchableText = (lesson.title + " " + lesson.objective + " " + lesson.concept_guide + " " + course.title + " " + course.category)
          .toLowerCase()

        for (const token of queryTokens) {
          if (searchableText.includes(token)) {
            score += 1
          }
        }

        if (score > 0) {
          scoredLessons.push({ lesson, score, courseTitle: course.title })
        }
      }
    }

    scoredLessons.sort((a, b) => b.score - a.score)
    const topLessons = scoredLessons.slice(0, 2)

    if (topLessons.length > 0) {
      relevantLessonsText = topLessons
        .map(({ lesson, courseTitle }) => {
          const guideSnippet = lesson.concept_guide.slice(0, 300).replace(/\n+/g, " ")
          return `• Course: "${courseTitle}" -> Lesson: "${lesson.title}" (${lesson.lesson_type}, ${lesson.estimated_minutes} min)\n  Objective: ${lesson.objective}\n  Core Concept: ${guideSnippet}...`
        })
        .join("\n\n")
    }
  } catch (err) {
    console.error("Error matching course catalog for RAG:", err)
  }

  // 3. Assemble full RAG Grounding Context
  const fullRAGContext = `
${currentFocusText}

REAL LEARNER ACTIVE CURRICULUM (Supabase Ground Truth):
${activeModulesText}

RELEVANT REAL COURSE CONTENT (Catalog Ground Truth):
${relevantLessonsText}
`.trim()

  return {
    activeModulesText,
    relevantLessonsText,
    currentFocusText,
    fullRAGContext,
  }
}
