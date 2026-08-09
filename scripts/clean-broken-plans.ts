import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

async function run() {
  console.log("This script would normally need a service role key to delete other users' plans.")
  console.log("Since we don't have it, we can't delete them from the backend.")
}

run()
