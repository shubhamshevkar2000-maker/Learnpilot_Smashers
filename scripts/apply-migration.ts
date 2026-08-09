import { config } from "dotenv"
config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log("Verifying module_activities schema...")

  // Test selecting columns from module_activities
  const { data, error } = await supabase
    .from("module_activities")
    .select("id, module_id, user_id, activity_type, title, sequence_order, is_completed, estimated_minutes, day_number")
    .limit(1)

  if (error) {
    console.log("Column check returned notice/error (columns may need SQL execution):", error.message)
  } else {
    console.log("Successfully verified module_activities schema! Columns estimated_minutes and day_number are active.")
  }
}

main().catch(console.error)
