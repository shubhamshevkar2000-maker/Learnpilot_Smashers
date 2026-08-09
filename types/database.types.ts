export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type CurrentLevel = "beginner" | "basics" | "intermediate" | "advanced" | "unknown"
export type PlanStatus = "active" | "completed" | "archived" | "paused"
export type ModuleStatus = "not_started" | "in_progress" | "completed" | "skipped"
export type ActivityType = "concept" | "exercise" | "project" | "reflection"
export type AssessmentType = "diagnostic" | "checkpoint" | "final"
export type InsightCategory = "strength" | "weakness" | "preference" | "adaptation_event" | "note"

export interface Database {
  public: {
    Tables: {
      learner_profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string | null
          learning_goal: string | null
          desired_outcome: string | null
          current_level: CurrentLevel
          available_daily_minutes: number | null
          target_date: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          learning_goal?: string | null
          desired_outcome?: string | null
          current_level?: CurrentLevel
          available_daily_minutes?: number | null
          target_date?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          learning_goal?: string | null
          desired_outcome?: string | null
          current_level?: CurrentLevel
          available_daily_minutes?: number | null
          target_date?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      learning_plans: {
        Row: {
          id: string
          user_id: string
          title: string
          goal_summary: string | null
          status: PlanStatus
          generation_metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          goal_summary?: string | null
          status?: PlanStatus
          generation_metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          goal_summary?: string | null
          status?: PlanStatus
          generation_metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      learning_modules: {
        Row: {
          id: string
          plan_id: string
          user_id: string
          title: string
          description: string | null
          rationale: string | null
          sequence_order: number
          estimated_minutes: number | null
          status: ModuleStatus
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          user_id: string
          title: string
          description?: string | null
          rationale?: string | null
          sequence_order: number
          estimated_minutes?: number | null
          status?: ModuleStatus
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          user_id?: string
          title?: string
          description?: string | null
          rationale?: string | null
          sequence_order?: number
          estimated_minutes?: number | null
          status?: ModuleStatus
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      module_activities: {
        Row: {
          id: string
          module_id: string
          user_id: string
          activity_type: ActivityType
          title: string
          sequence_order: number
          is_completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          user_id: string
          activity_type: ActivityType
          title: string
          sequence_order: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          user_id?: string
          activity_type?: ActivityType
          title?: string
          sequence_order?: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
      }
      assessment_results: {
        Row: {
          id: string
          user_id: string
          module_id: string | null
          assessment_title: string
          assessment_type: AssessmentType
          score: number
          passed: boolean
          feedback_summary: string | null
          metadata: Json
          attempted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id?: string | null
          assessment_title: string
          assessment_type: AssessmentType
          score: number
          passed?: boolean
          feedback_summary?: string | null
          metadata?: Json
          attempted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string | null
          assessment_title?: string
          assessment_type?: AssessmentType
          score?: number
          passed?: boolean
          feedback_summary?: string | null
          metadata?: Json
          attempted_at?: string
        }
      }
      agent_insights: {
        Row: {
          id: string
          user_id: string
          category: InsightCategory
          topic: string
          content: string
          confidence: number | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: InsightCategory
          topic: string
          content: string
          confidence?: number | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: InsightCategory
          topic?: string
          content?: string
          confidence?: number | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      learner_notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          tags: string[]
          source_type: string
          source_id: string | null
          source_title: string | null
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          content?: string
          tags?: string[]
          source_type?: string
          source_id?: string | null
          source_title?: string | null
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          tags?: string[]
          source_type?: string
          source_id?: string | null
          source_title?: string | null
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
