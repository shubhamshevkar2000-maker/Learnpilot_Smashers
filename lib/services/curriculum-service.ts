import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, LearningPlan, LearningModule, LearnerProfile, ModuleActivity } from "@/types/database.types"
import { generateLearningPlan } from "@/lib/generator/plan-generator"

export interface ModuleWithActivities extends LearningModule {
  activities?: ModuleActivity[]
}

export interface ScheduledActivity extends ModuleActivity {
  module_title: string
  estimated_minutes?: number | null | null
}

export interface ScheduledDay {
  dayNumber: number
  totalMinutes: number
  activities: ScheduledActivity[]
}

export interface ScheduledPath {
  days: ScheduledDay[]
  totalMinutes: number
  targetDays: number
  dailyCommitment: number
  isOverloaded: boolean
}

export interface ActiveCurriculum {
  plan: LearningPlan
  modules: ModuleWithActivities[]
}

export function generateSchedule(
  profile: LearnerProfile,
  modules: ModuleWithActivities[]
): ScheduledPath {
  const dailyCommitment = profile.available_daily_minutes ? Math.max(profile.available_daily_minutes, 15) : 30
  
  let targetDays = 0
  if (profile.target_date) {
    const target = new Date(profile.target_date)
    const now = new Date()
    targetDays = Math.max(1, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  }

  const allActivities: ScheduledActivity[] = []
  modules.forEach(m => {
    (m.activities || []).forEach(a => {
      allActivities.push({
        ...a,
        module_title: m.title
      })
    })
  })

  const days: ScheduledDay[] = []
  let currentDay: ScheduledDay = { dayNumber: 1, totalMinutes: 0, activities: [] }
  let totalMinutes = 0

  allActivities.forEach(act => {
    const est = act.estimated_minutes || 20
    totalMinutes += est

    if (currentDay.totalMinutes + est > dailyCommitment && currentDay.activities.length > 0) {
      days.push(currentDay)
      currentDay = { dayNumber: days.length + 1, totalMinutes: 0, activities: [] }
    }

    currentDay.activities.push(act)
    currentDay.totalMinutes += est
  })

  if (currentDay.activities.length > 0) {
    days.push(currentDay)
  }

  const isOverloaded = targetDays > 0 && days.length > targetDays

  return {
    days,
    totalMinutes,
    targetDays: targetDays > 0 ? targetDays : days.length,
    dailyCommitment,
    isOverloaded
  }
}

/**
 * Read-only query for the authenticated user's active learning plan, modules, and activities.
 * Performs NO auto-generation or database mutation.
 */
export async function getActiveCurriculumFoundation(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<ActiveCurriculum | null> {
  if (!userId) return null

  // 1. Fetch active plan for authenticated user
  const { data: existingPlan, error: planFetchError } = await supabase
    .from("learning_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle()

  if (planFetchError) {
    console.error("Error fetching learning plan:", planFetchError)
    throw new Error("Unable to load learning plan at this time.")
  }

  if (!existingPlan) {
    return {
      plan: null as any,
      modules: [],
    }
  }

  // 2. Fetch learning modules for this plan
  const { data: modules, error: modulesFetchError } = await supabase
    .from("learning_modules")
    .select("*")
    .eq("plan_id", existingPlan.id)
    .eq("user_id", userId)
    .order("sequence_order", { ascending: true })

  if (modulesFetchError) {
    console.error("Error fetching learning modules:", modulesFetchError)
    throw new Error("Unable to load learning modules.")
  }

  const moduleList = (modules as LearningModule[]) || []
  if (moduleList.length === 0) {
    return {
      plan: existingPlan as LearningPlan,
      modules: [],
    }
  }

  // 3. Fetch module activities for these modules
  const moduleIds = moduleList.map((m) => m.id)
  const { data: activities, error: activitiesFetchError } = await supabase
    .from("module_activities")
    .select("*")
    .in("module_id", moduleIds)
    .eq("user_id", userId)
    .order("sequence_order", { ascending: true })

  if (activitiesFetchError) {
    console.error("Error fetching module activities:", activitiesFetchError)
  }

  const activityMap = new Map<string, ModuleActivity[]>()
  if (activities) {
    for (const act of activities as ModuleActivity[]) {
      const list = activityMap.get(act.module_id) || []
      list.push(act)
      activityMap.set(act.module_id, list)
    }
  }

  const modulesWithActivities: ModuleWithActivities[] = moduleList.map((mod) => ({
    ...mod,
    activities: activityMap.get(mod.id) || [],
  }))

  return {
    plan: existingPlan as LearningPlan,
    modules: modulesWithActivities,
  }
}

/**
 * Persists an activity's completion status to Supabase and updates parent module status accordingly.
 */
export async function completeActivity(
  supabase: SupabaseClient<Database>,
  userId: string,
  activityId: string,
  moduleId: string
): Promise<boolean> {
  if (!userId || !activityId || !moduleId) return false

  // 1. Mark ONLY the specific activity as completed
  const { error: actError } = await supabase
    .from("module_activities")
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", activityId)
    .eq("user_id", userId)

  if (actError) {
    console.error("Error completing activity:", actError)
    return false
  }

  // 2. Fetch all sibling activities for parent module
  const { data: siblingActivities, error: sibError } = await supabase
    .from("module_activities")
    .select("id, is_completed")
    .eq("module_id", moduleId)
    .eq("user_id", userId)

  if (!sibError && siblingActivities && siblingActivities.length > 0) {
    const completedCount = siblingActivities.filter((a) => a.is_completed || a.id === activityId).length
    const totalCount = siblingActivities.length

    if (completedCount === totalCount) {
      await supabase
        .from("learning_modules")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", moduleId)
        .eq("user_id", userId)
    } else {
      await supabase
        .from("learning_modules")
        .update({
          status: "in_progress",
          started_at: new Date().toISOString(),
        })
        .eq("id", moduleId)
        .eq("user_id", userId)
        .eq("status", "not_started")
    }
  }

  return true
}

/**
 * Fetches an active learning plan and its modules for the authenticated user.
 * If no active plan exists AND the user has completed onboarding, generates and persists
 * a new personalized learning plan idempotently.
 */
export async function getOrCreateActiveCurriculum(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<ActiveCurriculum | null> {
  if (!userId) return null

  // 1. Idempotency Check: Fetch existing active plan
  const { data: existingPlan, error: planFetchError } = await supabase
    .from("learning_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle()

  if (planFetchError) {
    console.error("Error fetching learning plan:", planFetchError)
    throw new Error("Unable to load learning plan at this time.")
  }

  // If active plan already exists, fetch its modules
  if (existingPlan) {
    const { data: modules, error: modulesFetchError } = await supabase
      .from("learning_modules")
      .select("*")
      .eq("plan_id", existingPlan.id)
      .eq("user_id", userId)
      .order("sequence_order", { ascending: true })

    if (modulesFetchError) {
      console.error("Error fetching learning modules:", modulesFetchError)
      throw new Error("Unable to load learning modules.")
    }

    return {
      plan: existingPlan as LearningPlan,
      modules: (modules as LearningModule[]) || [],
    }
  }

  // 2. Read Learner Profile
  const { data: profile, error: profileError } = await supabase
    .from("learner_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (profileError || !profile) {
    console.error("Error loading profile for plan generation:", profileError)
    return null
  }

  // Gate: Only generate if onboarding is completed
  if (!profile.onboarding_completed) {
    return null
  }

  // 3. Generate structured plan deterministically from profile
  const generatedData = generateLearningPlan(profile as LearnerProfile)

  // 4. Insert learning_plan
  const metadata = {
    generator: "deterministic_v1",
    generated_at: new Date().toISOString(),
    source: "learner_profile",
  }

  const { data: newPlan, error: insertPlanError } = await supabase
    .from("learning_plans")
    .insert({
      user_id: userId,
      title: generatedData.title,
      goal_summary: generatedData.goal_summary,
      status: "active",
      generation_metadata: metadata,
    })
    .select()
    .single()

  if (insertPlanError || !newPlan) {
    console.error("Failed to insert learning plan:", insertPlanError)
    throw new Error("Failed to create learning plan record.")
  }

  // 5. Insert learning_modules with plan_id & user_id
  const moduleInserts = generatedData.modules.map((m) => ({
    plan_id: newPlan.id,
    user_id: userId,
    title: m.title,
    description: m.description,
    rationale: m.rationale,
    sequence_order: m.sequence_order,
    estimated_minutes: m.estimated_minutes,
    status: "not_started" as const,
  }))

  const { data: newModules, error: insertModulesError } = await supabase
    .from("learning_modules")
    .insert(moduleInserts)
    .select()
    .order("sequence_order", { ascending: true })

  if (insertModulesError || !newModules) {
    console.error("Failed to insert learning modules:", insertModulesError)
    throw new Error("Failed to create learning modules.")
  }

  return {
    plan: newPlan as LearningPlan,
    modules: newModules as LearningModule[],
  }
}
