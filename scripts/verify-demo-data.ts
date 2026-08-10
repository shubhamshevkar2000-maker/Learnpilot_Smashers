import { config } from "dotenv"
config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"
import type { Database } from "../types/database.types"

async function verify() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const baseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)

  const { data: signInData } = await baseClient.auth.signInWithPassword({
    email: "demo@learnpilot.app",
    password: "LearnPilot@Demo2026!",
  })

  if (!signInData?.user || !signInData?.session) {
    console.error("❌ Failed to sign in as demo user")
    process.exit(1)
  }

  const userId = signInData.user.id
  const authClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${signInData.session.access_token}` } },
  })

  const { data: profile } = await authClient.from("learner_profiles").select("*").eq("user_id", userId).single()
  const { data: plans } = await authClient.from("learning_plans").select("*").eq("user_id", userId)
  const { data: modules } = await authClient.from("learning_modules").select("*").eq("user_id", userId).order("sequence_order", { ascending: true })
  const { data: activities } = await authClient.from("module_activities").select("*").eq("user_id", userId).order("sequence_order", { ascending: true })
  const { data: assessments } = await authClient.from("assessment_results").select("*").eq("user_id", userId)
  const { data: notes } = await authClient.from("learner_notes" as any).select("*").eq("user_id", userId).order("created_at", { ascending: false })

  console.log("=== DEMO DATA VERIFICATION ===")
  console.log(`User ID: ${userId}`)
  console.log(`Profile: ${profile?.display_name} (${profile?.learning_goal}, ${profile?.current_level}, ${profile?.available_daily_minutes} min/day)`)
  console.log(`Plans Count: ${plans?.length} (Title: "${plans?.[0]?.title}")`)
  console.log(`Modules Count: ${modules?.length}`)
  modules?.forEach((m) => {
    console.log(`  - Module ${m.sequence_order}: "${m.title}" [${m.status}] (${m.estimated_minutes} min)`)
  })
  console.log(`Total Activities Count: ${activities?.length}`)
  const completedActs = activities?.filter((a) => a.is_completed) || []
  console.log(`  - Completed Activities: ${completedActs.length}`)
  console.log(`Assessments Count: ${assessments?.length}`)
  assessments?.forEach((a) => {
    console.log(`  - ${a.assessment_title}: ${a.score}% (Passed: ${a.passed})`)
  })
  console.log(`Notes Count: ${notes?.length}`)
  notes?.forEach((n: any) => {
    let meta: any = {}
    try {
      if (n.difficulty_reflection) meta = JSON.parse(n.difficulty_reflection)
    } catch {}
    const isPinned = n.is_pinned ?? meta.is_pinned ?? false
    const tags = n.tags || meta.tags || []
    const source = n.source_type || meta.source_type || "general"
    const title = n.title || n.topic || "Untitled"
    const content = n.content || n.note_content || ""
    console.log(`  - [${isPinned ? "PINNED" : "NORMAL"}] "${title}" | Tags: [${tags.join(", ")}] | Source: ${source} | Content: ${content.length} chars`)
  })
}

verify().catch(console.error)
