import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"
import { CONTENT_REGISTRY } from "../generator/content-registry"
import type { ActiveCurriculum } from "./curriculum-service"

export type CourseDifficulty = "Beginner" | "Intermediate" | "Advanced"
export type CourseLessonType = "concept" | "exercise" | "project" | "reflection"

export interface CourseLesson {
  id: string // This maps to module_activity.id
  course_id: string // This maps to learning_module.id
  title: string
  activity_type: CourseLessonType
  sequence_order: number
  estimated_minutes: number
  is_completed?: boolean
  objective: string
  concept_guide: string
  code_example?: string
  code_explanation?: string
  practical_exercise: string
  checkpoint_question: string
  checkpoint_options?: string[]
  checkpoint_correct_index?: number
  checkpoint_explanation?: string
  is_content_missing?: boolean
}

export interface Course {
  id: string
  title: string
  description: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  estimated_minutes: number
  lessons: CourseLesson[]
}

export interface UserCourseProgress {
  course_id: string
  completed_lesson_ids: string[]
  total_lessons: number
  completed_lessons: number
  progress_percentage: number
}

/**
 * Maps the personalized Learning Modules into the Course interface
 * so the UI can consume them without structural redesign.
 */
export function getPersonalizedCourses(curriculum: ActiveCurriculum | null): Course[] {
  if (!curriculum || !curriculum.modules) return []

  return curriculum.modules.map(mod => {
    const activities = mod.activities || []
    
    // Map activities to CourseLessons
    const lessons: CourseLesson[] = activities.map(act => {
      // Lookup content if content_id exists
      const content = act.content_id ? CONTENT_REGISTRY[act.content_id] : null

      return {
        id: act.id,
        course_id: act.module_id,
        title: act.title,
        activity_type: (act.activity_type as CourseLessonType) || "concept",
        sequence_order: act.sequence_order,
        estimated_minutes: 20, // Default or derived if stored
        is_completed: act.is_completed || false,
        objective: content?.objective || `Complete the ${act.title} activity.`,
        concept_guide: content?.concept_guide || `This activity requires active learning on the topic: ${act.title}.`,
        code_example: content?.code_example,
        code_explanation: content ? "" : undefined, // Registry doesn't have explanation separate but we map it if needed
        practical_exercise: content?.practical_exercise || "Apply what you have learned.",
        checkpoint_question: content?.checkpoint_question || "Did you understand this topic?",
        checkpoint_options: content?.checkpoint_options || ["Yes", "No"],
        checkpoint_correct_index: content?.checkpoint_correct_index || 0,
        checkpoint_explanation: content?.checkpoint_explanation || "Great job!",
        is_content_missing: !content
      }
    })

    return {
      id: mod.id,
      title: mod.title,
      description: mod.description || "",
      difficulty: "Beginner", // Derivable from profile level if needed
      estimated_minutes: mod.estimated_minutes || 0,
      lessons
    }
  })
}

/**
 * Marks a lesson (module_activity) as completed directly in the DB.
 */
export async function completeCourseLesson(
  supabase: SupabaseClient<Database>,
  userId: string,
  courseId: string,
  lessonId: string
): Promise<boolean> {
  if (!userId || !lessonId) return false
  
  const { error } = await supabase
    .from("module_activities")
    .update({
      is_completed: true,
      completed_at: new Date().toISOString()
    })
    .eq("id", lessonId)
    .eq("user_id", userId)

  if (error) {
    console.error("Error updating module_activity completion:", error)
    return false
  }
  
  // Try to update module status if all activities completed
  // This logic is duplicated from curriculum-service.ts completeActivity
  try {
    const { data: siblingActivities } = await supabase
      .from("module_activities")
      .select("id, is_completed")
      .eq("module_id", courseId)
      .eq("user_id", userId)

    if (siblingActivities && siblingActivities.length > 0) {
      const completedCount = siblingActivities.filter((a) => a.is_completed || a.id === lessonId).length
      if (completedCount === siblingActivities.length) {
        await supabase
          .from("learning_modules")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", courseId)
          .eq("user_id", userId)
      } else {
        await supabase
          .from("learning_modules")
          .update({
            status: "in_progress",
            started_at: new Date().toISOString(),
          })
          .eq("id", courseId)
          .eq("user_id", userId)
          .eq("status", "not_started")
      }
    }
  } catch (err) {
    console.error("Error updating module status:", err)
  }

  return true
}
