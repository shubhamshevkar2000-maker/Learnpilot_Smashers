import { config } from "dotenv"
config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key in .env.local")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // 1. Fetch all learning plans
  const { data: plans, error: planErr } = await supabase
    .from("learning_plans")
    .select("*")

  if (planErr || !plans || plans.length === 0) {
    console.log("No learning plans found.", planErr)
    return
  }

  console.log("=== ALL LEARNING PLANS ===")
  plans.forEach((p) => {
    console.log(`Plan ID: ${p.id}, Title: "${p.title}", Status: ${p.status}, User: ${p.user_id}`)
  })

  const planId = plans[0].id

  // 2. Fetch modules for active plan
  const { data: modules, error: modErr } = await supabase
    .from("learning_modules")
    .select("*")
    .eq("plan_id", planId)
    .order("sequence_order", { ascending: true })

  if (modErr || !modules) {
    console.log("Error fetching modules:", modErr)
    return
  }

  console.log("\n=== MODULES ===")
  modules.forEach((m) => {
    console.log(`Module ID: ${m.id}, Seq: ${m.sequence_order}, Title: "${m.title}", Status: ${m.status}`)
  })

  // 3. Fetch activities for all modules
  const moduleIds = modules.map((m) => m.id)
  const { data: activities, error: actErr } = await supabase
    .from("module_activities")
    .select("*")
    .in("module_id", moduleIds)
    .order("sequence_order", { ascending: true })

  if (actErr || !activities) {
    console.log("Error fetching activities:", actErr)
    return
  }

  console.log("\n=== MODULE ACTIVITIES ===")
  activities.forEach((a) => {
    console.log(`Activity ID: ${a.id}, ModuleID: ${a.module_id}, Seq: ${a.sequence_order}, Title: "${a.title}", is_completed: ${a.is_completed}, completed_at: ${a.completed_at}`)
  })
}

main().catch(console.error)
