import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database, ActivityType } from "@/types/database.types"
import { generateLearningPlan, sumActivityMinutes } from "@/lib/generator/plan-generator"

const ALLOWED_ACTIVITY_TYPES: ActivityType[] = ["concept", "exercise", "project", "reflection"]

export interface AIActivityOutput {
  title: string
  activity_type: ActivityType
  sequence_order: number
  estimated_minutes?: number
  day_number?: number
  content_id?: string
}

export interface AIModuleOutput {
  title: string
  description: string
  rationale: string
  sequence_order: number
  estimated_minutes?: number
  day_number?: number
  activities: AIActivityOutput[]
}

export interface AICurriculumOutput {
  title: string
  goal_summary: string
  modules: AIModuleOutput[]
}

/**
 * Calculates the exact sum of activity durations for a module.
 * Guarantees module estimated_minutes === sum of activity estimated_minutes.
 */
export function calculateModuleDurationFromActivities(activities: AIActivityOutput[]): number {
  if (!activities || activities.length === 0) return 30
  return activities.reduce((sum, act) => {
    const mins = typeof act.estimated_minutes === "number" && act.estimated_minutes > 0 ? act.estimated_minutes : 20
    return sum + mins
  }, 0)
}

export async function POST(req: NextRequest) {
  try {
    let body: { archive_existing?: boolean; regenerate?: boolean } = {}
    try {
      body = await req.json()
    } catch {
      // Body optional
    }

    const isRegenerate = Boolean(body.archive_existing || body.regenerate)

    // 1. Initialize Supabase Server Client & authenticate session
    let cookieStore: any = null
    try {
      cookieStore = await cookies()
    } catch (cookieErr) {
      console.warn("[generate-plan] cookies() execution context warning:", cookieErr)
    }

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore ? cookieStore.getAll() : []
          },
          setAll(cookiesToSet) {
            if (!cookieStore) return
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Server component / edge context fallback
            }
          },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[generate-plan] Auth error:", authError?.message || "User session missing")
      return NextResponse.json(
        { error: "Unauthorized. Please log in to generate your learning path." },
        { status: 401 }
      )
    }

    // 2. Read authenticated user's learner profile
    const { data: profile, error: profileError } = await supabase
      .from("learner_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (profileError || !profile || !profile.onboarding_completed) {
      console.error("[generate-plan] Learner profile incomplete or missing:", profileError?.message)
      return NextResponse.json(
        { error: "Please complete your onboarding profile first." },
        { status: 400 }
      )
    }

    // 3. Duplicate Plan Check & Regeneration Guard
    const { data: existingPlan } = await supabase
      .from("learning_plans")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle()

    if (existingPlan && !isRegenerate) {
      return NextResponse.json(
        { error: "An active learning path already exists for your profile. Click 'Regenerate' to replace it." },
        { status: 409 }
      )
    }

    // 4. Fetch Assessment Results and Completed Modules to feed the Recommendation Engine
    const { data: assessmentResults } = await supabase
      .from("assessment_results")
      .select("*")
      .eq("user_id", user.id)

    const { data: completedModulesData } = await supabase
      .from("module_activities")
      .select("module_id")
      .eq("user_id", user.id)
      .eq("is_completed", true)

    const completedModuleIds = Array.from(new Set(completedModulesData?.map(m => m.module_id) || []))

    // 5. Generate Curriculum using Deterministic Recommendation Engine
    console.log("[generate-plan] Using deterministic recommendation engine")
    const fallbackPlan = generateLearningPlan(profile, assessmentResults || [], completedModuleIds)
    const parsed: AICurriculumOutput = {
      title: fallbackPlan.title,
      goal_summary: fallbackPlan.goal_summary,
      modules: fallbackPlan.modules,
    }

    if (!parsed.title || !parsed.goal_summary || !Array.isArray(parsed.modules) || parsed.modules.length === 0) {
      console.error("[generate-plan] Parsed output missing title, goal summary, or modules list")
      return NextResponse.json(
        { error: "Curriculum generation output missing required structure." },
        { status: 422 }
      )
    }

    const dailyBudget = profile.available_daily_minutes ? Math.max(profile.available_daily_minutes, 15) : 30
    let currentDay = 1
    let currentDayAccumulated = 0

    for (const m of parsed.modules) {
      if (!m.title || !m.sequence_order) {
        return NextResponse.json(
          { error: "Invalid module metadata in curriculum generation output." },
          { status: 422 }
        )
      }
      if (!m.activities || !Array.isArray(m.activities) || m.activities.length === 0) {
        return NextResponse.json(
          { error: "Each module must contain at least one valid activity." },
          { status: 422 }
        )
      }

      for (const a of m.activities) {
        if (!a.title || !a.sequence_order || !ALLOWED_ACTIVITY_TYPES.includes(a.activity_type)) {
          return NextResponse.json(
            { error: "Invalid activity type or title in curriculum generation output." },
            { status: 422 }
          )
        }

        const estMins = a.estimated_minutes || 30
        if (currentDayAccumulated > 0 && currentDayAccumulated + estMins > dailyBudget) {
          currentDay += 1
          currentDayAccumulated = 0
        }
        ;(a as any).day_number = currentDay
        currentDayAccumulated += estMins
      }

      // Mandatory derivation: Module estimated duration ALWAYS equals sum of activity estimated durations
      m.estimated_minutes = calculateModuleDurationFromActivities(m.activities)
    }

    // 6. Atomic Database Persistence with Rollback Safety
    // Step A: Archive existing active plan if regenerating
    if (existingPlan && isRegenerate) {
      const { error: archiveError } = await supabase
        .from("learning_plans")
        .update({ status: "archived" })
        .eq("id", existingPlan.id)
        .eq("user_id", user.id)

      if (archiveError) {
        console.error("[generate-plan] Failed to archive existing plan:", archiveError)
        return NextResponse.json(
          { error: "Could not archive existing learning plan." },
          { status: 500 }
        )
      }
    }

    // Step B: Insert new active learning_plan
    const { data: newPlan, error: insertPlanError } = await supabase
      .from("learning_plans")
      .insert({
        user_id: user.id,
        title: parsed.title.trim(),
        goal_summary: parsed.goal_summary.trim(),
        status: "active",
        generation_metadata: {
          generator: "deterministic_v1",
          generated_at: new Date().toISOString(),
          profile_goal: profile.learning_goal,
        },
      })
      .select()
      .single()

    if (insertPlanError || !newPlan) {
      console.error("[generate-plan] Insert plan error:", insertPlanError)
      // Rollback: restore previous plan to active if archiving happened
      if (existingPlan && isRegenerate) {
        await supabase
          .from("learning_plans")
          .update({ status: "active" })
          .eq("id", existingPlan.id)
          .eq("user_id", user.id)
      }
      return NextResponse.json(
        { error: "Failed to create new learning plan record in database." },
        { status: 500 }
      )
    }

    // Step C: Insert modules with derived estimated_minutes (exact sum of activities)
    const moduleInserts = parsed.modules.map((m) => ({
      plan_id: newPlan.id,
      user_id: user.id,
      title: m.title.trim(),
      description: m.description ? m.description.trim() : null,
      rationale: m.rationale ? m.rationale.trim() : null,
      sequence_order: m.sequence_order,
      estimated_minutes: m.estimated_minutes || 0,
      status: "not_started" as const,
    }))

    const { data: insertedModules, error: insertModulesError } = await supabase
      .from("learning_modules")
      .insert(moduleInserts)
      .select()
      .order("sequence_order", { ascending: true })

    if (insertModulesError || !insertedModules) {
      console.error("[generate-plan] Insert modules error:", insertModulesError)
      // Cleanup broken new plan
      await supabase.from("learning_plans").delete().eq("id", newPlan.id)
      // Rollback previous plan status
      if (existingPlan && isRegenerate) {
        await supabase
          .from("learning_plans")
          .update({ status: "active" })
          .eq("id", existingPlan.id)
          .eq("user_id", user.id)
      }
      return NextResponse.json(
        { error: "Failed to persist learning modules in database." },
        { status: 500 }
      )
    }

    // Step D: Insert activities
    const activityInserts: any[] = []
    insertedModules.forEach((mod) => {
      const origMod = parsed.modules.find((m) => m.sequence_order === mod.sequence_order)
      if (origMod?.activities) {
        origMod.activities.forEach((act) => {
          activityInserts.push({
            module_id: mod.id,
            user_id: user.id,
            activity_type: act.activity_type,
            title: act.title.trim(),
            sequence_order: act.sequence_order,
            estimated_minutes: act.estimated_minutes,
            day_number: act.day_number,
            is_completed: false,
            content_id: act.content_id || null,
          })
        })
      }
    })

    if (activityInserts.length > 0) {
      let { error: insertActivitiesError } = await supabase
        .from("module_activities")
        .insert(activityInserts)

      // Fallback mode if remote Supabase schema missing optional estimated_minutes / day_number columns
      if (insertActivitiesError) {
        console.error(
          "[generate-plan] Primary insert activities error:",
          insertActivitiesError.message,
          "Code:",
          insertActivitiesError.code,
          "Details:",
          insertActivitiesError.details,
          "Hint:",
          insertActivitiesError.hint
        )

        const isColumnError =
          insertActivitiesError.code === "PGRST204" ||
          insertActivitiesError.code === "42703" ||
          (insertActivitiesError.message &&
            (insertActivitiesError.message.includes("column") ||
              insertActivitiesError.message.includes("estimated_minutes") ||
              insertActivitiesError.message.includes("day_number")))

        if (isColumnError) {
          console.warn(
            "[generate-plan] Schema column missing on remote Supabase instance. Retrying activity insert with core columns..."
          )
          const coreActivityInserts = activityInserts.map(({ estimated_minutes, day_number, ...rest }) => rest)
          const { error: fallbackError } = await supabase
            .from("module_activities")
            .insert(coreActivityInserts)

          insertActivitiesError = fallbackError
        }
      }

      if (insertActivitiesError) {
        console.error(
          "[generate-plan] Final activity insert failed:",
          insertActivitiesError.message,
          insertActivitiesError.details
        )
        // Cleanup broken new plan & modules
        await supabase.from("learning_plans").delete().eq("id", newPlan.id)
        // Rollback previous plan status
        if (existingPlan && isRegenerate) {
          await supabase
            .from("learning_plans")
            .update({ status: "active" })
            .eq("id", existingPlan.id)
            .eq("user_id", user.id)
        }
        return NextResponse.json(
          {
            error: `Failed to persist module activities in database: ${insertActivitiesError.message}`,
            details: insertActivitiesError.details || null,
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      plan_id: newPlan.id,
      archived_previous_plan: existingPlan?.id || null,
    })
  } catch (err: any) {
    console.error("[generate-plan] Unhandled generation exception:", err)
    return NextResponse.json(
      { error: "An unexpected server error occurred during curriculum generation." },
      { status: 500 }
    )
  }
}
