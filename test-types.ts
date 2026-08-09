import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './types/database.types'

const client: SupabaseClient<Database> = {} as any;
const test = client.from("learner_profiles");
