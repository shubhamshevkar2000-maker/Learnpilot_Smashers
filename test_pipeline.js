import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testPipeline() {
  const email = "pipeline" + Date.now() + "@example.com"
  const password = "password123"

  console.log("Signing up user:", email)
  const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password })
  if (authErr) { console.error("Signup error:", authErr); return; }
  const user = authData.user

  // insert profile
  await supabase.from('learner_profiles').upsert({
    user_id: user.id,
    display_name: "Pipeline Test",
    learning_goal: "JavaScript Core & Async",
    desired_outcome: "Build web apps",
    current_level: "beginner",
    available_daily_minutes: 30,
    target_date: "2026-12-31",
    onboarding_completed: true
  })

  // create plan via the actual database tables directly to simulate the API since we can't easily call the Next.js API route from node without running the server
  // Wait, I will just call the Next.js API if it's running. But it's not running.
  // Let's insert plan, module, activity directly.
  console.log("Inserting plan...")
  const { data: plan } = await supabase.from("learning_plans").insert({
    user_id: user.id, title: "JS Plan", goal_summary: "Test", status: "active"
  }).select().single()

  console.log("Inserting module...")
  const { data: module } = await supabase.from("learning_modules").insert({
    plan_id: plan.id, user_id: user.id, title: "JS Module", sequence_order: 1, estimated_minutes: 30, status: "not_started"
  }).select().single()

  console.log("Inserting activity...")
  const { data: actInsert, error: actErr } = await supabase.from("module_activities").insert({
    module_id: module.id, user_id: user.id, activity_type: "concept", title: "JS Concept", sequence_order: 1, is_completed: false, content_id: "js-fund-l1"
  }).select()
  
  if (actErr) {
    console.error("Activity insert error:", actErr)
  } else {
    console.log("Activity inserted successfully!", actInsert)
  }

  console.log("Fetching curriculum foundation...")
  // simulate getActiveCurriculumFoundation
  const { data: fetchActivities, error: fetchErr } = await supabase
    .from("module_activities")
    .select("*")
    .in("module_id", [module.id])
    .eq("user_id", user.id)
    .order("sequence_order", { ascending: true })
    
  if (fetchErr) {
    console.error("Fetch activities error:", fetchErr)
  } else {
    console.log("Fetched activities:", fetchActivities.length)
    console.log(fetchActivities)
  }
}

testPipeline().catch(console.error)
