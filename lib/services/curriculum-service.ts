import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database, LearningPlan, LearningModule, LearnerProfile } from "@/types/database.types"
import { generateLearningPlan } from "@/lib/generator/plan-generator"

export interface ActiveCurriculum {
  plan: LearningPlan
  modules: LearningModule[]
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
