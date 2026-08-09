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
  estimated_minutes: number
}

export interface AIModuleOutput {
  title: string
  description: string
  rationale: string
  sequence_order: number
  estimated_minutes?: number
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

    // 4. Verify AI Provider Configuration (Groq / OpenAI / Gemini)
    const groqKey = process.env.GROQ_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY
    const geminiKey = process.env.GEMINI_API_KEY

    const systemPrompt = `You are LearnPilot, an expert adaptive learning designer. Produce a strictly structured JSON object matching this schema:
{
  "title": "Short Plan Title",
  "goal_summary": "1-2 sentence tailored goal summary",
  "modules": [
    {
      "title": "Module Title",
      "description": "Clear overview of what will be learned",
      "rationale": "Why this module is placed here in the trajectory",
      "sequence_order": 1,
      "activities": [
        {
          "title": "Granular Activity Title",
          "activity_type": "concept" | "exercise" | "project" | "reflection",
          "sequence_order": 1,
          "estimated_minutes": 20
        }
      ]
    }
  ]
}

PEDAGOGICAL & ARCHITECTURAL GUIDELINES:

1. SEPARATION OF CURRICULUM AND PACING:
   - The Learning Path represents the COMPLETE long-term educational curriculum required to reach the target goal and outcome from the starting baseline level.
   - Available Daily Minutes (e.g. 45 min/day) is STRICTLY a pacing constraint for daily study sessions. It MUST NOT dictate, multiply, inflate, or shrink module or curriculum duration. NEVER use daily_minutes * fixed_days formulas.

2. CURRICULUM DEPTH FIRST:
   - Determine educational scope BEFORE estimating time. Reason about learner level, goal, desired outcome, prerequisite knowledge, core concepts, hands-on practice, mini-projects, and checkpoints.
   - For beginner learners (e.g. Full-Stack Engineer), do NOT compress broad domains (HTML, CSS, JavaScript) into shallow 1-2 activity summaries. Decompose broad domains into granular, comprehensive learning units.
   - Do NOT target any arbitrary module duration (e.g. 45, 90, 180, 240, 270 minutes). The duration must be an authentic OUTPUT of the curriculum depth.

3. GRANULAR ACTIVITIES & REALISTIC ESTIMATES:
   - Each activity must represent genuine learning work:
     - "concept": 15 to 25 minutes
     - "exercise": 20 to 30 minutes
     - "project": 30 to 60+ minutes depending on scope
     - "reflection" / "checkpoint": 10 to 20 minutes
   - Do NOT create artificial activities to pad time. Do NOT compress substantial concepts into shallow activities to reduce count.

4. MANDATORY DURATION DERIVATION:
   - Every module's estimated duration will be calculated strictly as the exact sum of its constituent activity durations.

5. EXACT CONCEPT COVERAGE & ALIGNMENT (STRICT RULE):
   - Every major concept, tool, pattern, or framework mentioned in a module's title or description MUST be explicitly represented by at least one dedicated activity.
   - DO NOT claim a topic or technology is covered in a module title/description if no activity actually teaches or practices it.
   - DO NOT limit or cap the activity count per module to a fixed number. Generate as many granular activities as are legitimately required to cover every topic introduced in the module.`

    const userPrompt = `Generate a personalized learning path for:
Learner Goal: ${profile.learning_goal}
Desired Outcome: ${profile.desired_outcome || "Mastery"}
Current Level: ${profile.current_level}
Available Daily Minutes (PACING CONSTRAINT ONLY): ${profile.available_daily_minutes || 45} min/day
Target Completion Horizon: ${profile.target_date || "Flexible pace"}`

    let aiResponseText = ""

    if (groqKey) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          aiResponseText = data.choices?.[0]?.message?.content || ""
        } else {
          console.error("[generate-plan] Groq API returned non-200:", await response.text())
        }
      } catch (err) {
        console.error("[generate-plan] Groq API fetch failed:", err)
      }
    } else if (openaiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          aiResponseText = data.choices?.[0]?.message?.content || ""
        } else {
          console.error("[generate-plan] OpenAI API returned non-200:", await response.text())
        }
      } catch (err) {
        console.error("[generate-plan] OpenAI API fetch failed:", err)
      }
    } else if (geminiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
                },
              ],
              generationConfig: { responseMimeType: "application/json" },
            }),
          }
        )

        if (response.ok) {
          const data = await response.json()
          aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
        } else {
          console.error("[generate-plan] Gemini API returned non-200:", await response.text())
        }
      } catch (err) {
        console.error("[generate-plan] Gemini API fetch failed:", err)
      }
    }

    // 5. Fallback Generator Integration if AI provider is unconfigured or failed
    let parsed: AICurriculumOutput
    if (aiResponseText) {
      try {
        parsed = JSON.parse(aiResponseText)
      } catch (jsonErr) {
        console.warn("[generate-plan] AI JSON parsing failed, falling back to deterministic generator:", jsonErr)
        const fallbackPlan = generateLearningPlan(profile)
        parsed = {
          title: fallbackPlan.title,
          goal_summary: fallbackPlan.goal_summary,
          modules: fallbackPlan.modules,
        }
      }
    } else {
      console.log("[generate-plan] Using deterministic curriculum generator fallback")
      const fallbackPlan = generateLearningPlan(profile)
      parsed = {
        title: fallbackPlan.title,
        goal_summary: fallbackPlan.goal_summary,
        modules: fallbackPlan.modules,
      }
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
          generator: aiResponseText ? "ai_server_v1" : "deterministic_v1",
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
      estimated_minutes: m.estimated_minutes,
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
