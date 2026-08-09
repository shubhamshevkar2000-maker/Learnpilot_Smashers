import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyDatabase() {
  // Try to authenticate using the provided env or just use raw data access if RLS allows (assuming local token or testing)
  // Let's fetch the first active learning plan
  const { data: plans, error: planError } = await supabase
    .from("learning_plans")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)

  if (planError || !plans || plans.length === 0) {
    console.log("No learning plan found", planError)
    return
  }

  const activePlan = plans[0]
  console.log("Active Plan ID:", activePlan.id)

  const { data: modules, error: modError } = await supabase
    .from("learning_modules")
    .select("*")
    .eq("plan_id", activePlan.id)
    .order("sequence_order", { ascending: true })

  if (modError || !modules) {
    console.log("No modules found", modError)
    return
  }

  console.log(`Found ${modules.length} modules`)

  for (const module of modules) {
    const { data: activities, error: actError } = await supabase
      .from("module_activities")
      .select("*")
      .eq("module_id", module.id)

    console.log(`Module: ${module.title}`)
    console.log(`module ID = ${module.id}`)
    console.log(`activity count = ${activities ? activities.length : 0}`)
    if (activities && activities.length > 0) {
      console.log(`activity titles = ${activities.map(a => a.title).join(", ")}`)
    }
    console.log("---")
  }
}

verifyDatabase().catch(console.error)
