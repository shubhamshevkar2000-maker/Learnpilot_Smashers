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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
          content_id: string | null
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
          content_id?: string | null
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
          content_id?: string | null
        }
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      learner_notes: {
        Row: {
          id: string
          user_id: string
          module_id: string | null
          activity_id: string | null
          topic: string
          note_content: string
          difficulty_reflection: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id?: string | null
          activity_id?: string | null
          topic: string
          note_content: string
          difficulty_reflection?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string | null
          activity_id?: string | null
          topic?: string
          note_content?: string
          difficulty_reflection?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [key: string]: never
    }
    Functions: {
      [key: string]: never
    }
    Enums: {
      [key: string]: never
    }
    CompositeTypes: {
      [key: string]: never
    }
  }
}

export type LearnerProfile = Database["public"]["Tables"]["learner_profiles"]["Row"]
export type LearningPlan = Database["public"]["Tables"]["learning_plans"]["Row"]
export type LearningModule = Database["public"]["Tables"]["learning_modules"]["Row"]
export type ModuleActivity = Database["public"]["Tables"]["module_activities"]["Row"]
export type AssessmentResult = Database["public"]["Tables"]["assessment_results"]["Row"]
export type AgentInsight = Database["public"]["Tables"]["agent_insights"]["Row"]
export type LearnerNote = Database["public"]["Tables"]["learner_notes"]["Row"]
