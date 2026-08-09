import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, LearningPlan, LearningModule, LearnerProfile, ModuleActivity } from "@/types/database.types"
import { generateLearningPlan } from "@/lib/generator/plan-generator"

export interface ModuleWithActivities extends LearningModule {
  activities?: ModuleActivity[]
}

export interface ActiveCurriculum {
  plan: LearningPlan
  modules: ModuleWithActivities[]
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

  // 4. Fetch learner profile daily budget for backward-compatible fallback calculation
  const { data: prof } = await supabase
    .from("learner_profiles")
    .select("available_daily_minutes")
    .eq("user_id", userId)
    .maybeSingle()

  const dailyBudget = prof?.available_daily_minutes ? Math.max(prof.available_daily_minutes, 15) : 30
  let currentDay = 1
  let currentAccumulated = 0

  const activityMap = new Map<string, ModuleActivity[]>()
  if (activities) {
    for (const rawAct of activities as ModuleActivity[]) {
      const estMins =
        typeof rawAct.estimated_minutes === "number" && rawAct.estimated_minutes > 0
          ? rawAct.estimated_minutes
          : 20

      let assignedDay = rawAct.day_number
      if (typeof assignedDay !== "number" || assignedDay <= 0) {
        if (currentAccumulated > 0 && currentAccumulated + estMins > dailyBudget) {
          currentDay += 1
          currentAccumulated = 0
        }
        assignedDay = currentDay
        currentAccumulated += estMins
      }

      const processedAct: ModuleActivity = {
        ...rawAct,
        estimated_minutes: estMins,
        day_number: assignedDay,
      }

      const list = activityMap.get(processedAct.module_id) || []
      list.push(processedAct)
      activityMap.set(processedAct.module_id, list)
    }
  }

  const modulesWithActivities: ModuleWithActivities[] = moduleList.map((mod) => {
    const acts = activityMap.get(mod.id) || []
    const sumMins = acts.reduce((acc, a) => acc + (a.estimated_minutes || 20), 0)
    return {
      ...mod,
      estimated_minutes: sumMins > 0 ? sumMins : mod.estimated_minutes,
      activities: acts,
    }
  })

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
