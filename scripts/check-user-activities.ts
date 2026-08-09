import { config } from "dotenv"
config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Try signing in with common test user credentials or prompt
  const email = process.env.TEST_USER_EMAIL || "test@example.com"
  const password = process.env.TEST_USER_PASSWORD || "password123"

  console.log(`Attempting sign-in with ${email}...`)
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authErr) {
    console.error("Sign-in failed:", authErr.message)
    console.log("Will attempt to fetch using anon client directly...")
  } else {
    console.log("Sign in successful for user:", authData.user.id)
  }

  // Query plans
  const { data: plans, error: planErr } = await supabase
    .from("learning_plans")
    .select("*")

  console.log("\n=== LEARNING PLANS ===", planErr || plans)

  if (plans && plans.length > 0) {
    const planId = plans[0].id
    const { data: modules, error: modErr } = await supabase
      .from("learning_modules")
      .select("*")
      .eq("plan_id", planId)
      .order("sequence_order", { ascending: true })

    console.log("\n=== LEARNING MODULES ===", modErr || modules)

    if (modules && modules.length > 0) {
      const moduleIds = modules.map((m) => m.id)
      const { data: activities, error: actErr } = await supabase
        .from("module_activities")
        .select("*")
        .in("module_id", moduleIds)
        .order("sequence_order", { ascending: true })

      console.log("\n=== MODULE ACTIVITIES ===", actErr || activities)
    }
  }
}

main().catch(console.error)
