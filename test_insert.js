import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function test() {
  const email = "test" + Date.now() + "@example.com"
  const password = "password123"

  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email,
    password
  })

  if (authErr) {
    console.error("Signup error:", authErr)
    return
  }
  const user = authData.user

  // insert profile
  const { error: profErr } = await supabase.from('learner_profiles').upsert({
    user_id: user.id,
    display_name: "Test",
    learning_goal: "Test",
    desired_outcome: "Test",
    current_level: "unknown",
    available_daily_minutes: 30,
    target_date: "2026-12-31"
  })

  if (profErr) { console.error("Profile Error:", profErr); return; }

  const { data: plan, error: planErr } = await supabase
    .from("learning_plans")
    .insert({
      user_id: user.id,
      title: "Test Plan",
      goal_summary: "Test",
      status: "active"
    })
    .select()
    .single()

  if (planErr) { console.error("Plan Error:", planErr); return; }

  const { data: module, error: modErr } = await supabase
    .from("learning_modules")
    .insert({
      plan_id: plan.id,
      user_id: user.id,
      title: "Test Module",
      sequence_order: 1,
      estimated_minutes: 30,
      status: "not_started"
    })
    .select()
    .single()

  if (modErr) { console.error("Module Error:", modErr); return; }

  const { error: actErr } = await supabase
    .from("module_activities")
    .insert({
      module_id: module.id,
      user_id: user.id,
      activity_type: "concept",
      title: "Test Activity",
      sequence_order: 1,
      is_completed: false,
      content_id: null
    })

  if (actErr) {
    console.error("Activity Error:", JSON.stringify(actErr, null, 2))
  } else {
    console.log("Success!")
  }
}

test()
