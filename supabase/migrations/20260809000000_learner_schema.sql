-- Migration: 20260809000000_learner_schema.sql
-- LearnPilot Learner Data Model Migration

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. LEARNER PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.learner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  learning_goal TEXT,
  desired_outcome TEXT,
  current_level TEXT NOT NULL DEFAULT 'unknown' 
    CHECK (current_level IN ('beginner', 'basics', 'intermediate', 'advanced', 'unknown')),
  available_daily_minutes INTEGER 
    CHECK (available_daily_minutes IS NULL OR available_daily_minutes > 0),
  target_date DATE,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. LEARNING PLANS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.learning_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  goal_summary TEXT,
  status TEXT NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'completed', 'archived', 'paused')),
  generation_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_learning_plans_id_user UNIQUE (id, user_id)
);

-- ============================================================================
-- 3. LEARNING MODULES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  rationale TEXT,
  sequence_order INTEGER NOT NULL,
  estimated_minutes INTEGER 
    CHECK (estimated_minutes IS NULL OR estimated_minutes > 0),
  status TEXT NOT NULL DEFAULT 'not_started' 
    CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_modules_plan_user 
    FOREIGN KEY (plan_id, user_id) 
    REFERENCES public.learning_plans(id, user_id) 
    ON DELETE CASCADE,
  CONSTRAINT uq_learning_modules_id_user UNIQUE (id, user_id),
  CONSTRAINT uq_plan_sequence UNIQUE (plan_id, sequence_order)
);

-- ============================================================================
-- 4. MODULE ACTIVITIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.module_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL 
    CHECK (activity_type IN ('concept', 'exercise', 'project', 'reflection')),
  title TEXT NOT NULL,
  sequence_order INTEGER NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_activities_module_user 
    FOREIGN KEY (module_id, user_id) 
    REFERENCES public.learning_modules(id, user_id) 
    ON DELETE CASCADE,
  CONSTRAINT uq_module_activity_order UNIQUE (module_id, sequence_order)
);

-- ============================================================================
-- 5. ASSESSMENT RESULTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID,
  assessment_title TEXT NOT NULL,
  assessment_type TEXT NOT NULL 
    CHECK (assessment_type IN ('diagnostic', 'checkpoint', 'final')),
  score NUMERIC(5, 2) NOT NULL 
    CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN NOT NULL DEFAULT false,
  feedback_summary TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_assessment_module_user 
    FOREIGN KEY (module_id, user_id) 
    REFERENCES public.learning_modules(id, user_id) 
    ON DELETE SET NULL (module_id)
);

-- ============================================================================
-- 6. AGENT INSIGHTS (Long-term Adaptive Semantic Memory)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agent_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL 
    CHECK (category IN ('strength', 'weakness', 'preference', 'adaptation_event', 'note')),
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  confidence NUMERIC(3, 2) 
    CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 7. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_learner_profiles_user_id ON public.learner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_plans_user_id ON public.learning_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_modules_plan_id ON public.learning_modules(plan_id);
CREATE INDEX IF NOT EXISTS idx_learning_modules_user_id ON public.learning_modules(user_id);
CREATE INDEX IF NOT EXISTS idx_module_activities_module_id ON public.module_activities(module_id);
CREATE INDEX IF NOT EXISTS idx_module_activities_user_id ON public.module_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_user_id ON public.assessment_results(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_module_id ON public.assessment_results(module_id);
CREATE INDEX IF NOT EXISTS idx_agent_insights_user_id ON public.agent_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_insights_topic ON public.agent_insights(user_id, topic);

-- ============================================================================
-- 8. ROW LEVEL SECURITY (Strict Multi-Tenant Isolation)
-- ============================================================================
ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_insights ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Learners can manage own profile" ON public.learner_profiles;
  DROP POLICY IF EXISTS "Learners can manage own plans" ON public.learning_plans;
  DROP POLICY IF EXISTS "Learners can manage own modules" ON public.learning_modules;
  DROP POLICY IF EXISTS "Learners can manage own activities" ON public.module_activities;
  DROP POLICY IF EXISTS "Learners can manage own assessment results" ON public.assessment_results;
  DROP POLICY IF EXISTS "Learners can manage own agent insights" ON public.agent_insights;
END $$;

CREATE POLICY "Learners can manage own profile" ON public.learner_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Learners can manage own plans" ON public.learning_plans
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Learners can manage own modules" ON public.learning_modules
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Learners can manage own activities" ON public.module_activities
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Learners can manage own assessment results" ON public.assessment_results
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Learners can manage own agent insights" ON public.agent_insights
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 9. IDEMPOTENT UPDATED_AT TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_learner_profiles_updated_at ON public.learner_profiles;
CREATE TRIGGER set_learner_profiles_updated_at BEFORE UPDATE ON public.learner_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_learning_plans_updated_at ON public.learning_plans;
CREATE TRIGGER set_learning_plans_updated_at BEFORE UPDATE ON public.learning_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_learning_modules_updated_at ON public.learning_modules;
CREATE TRIGGER set_learning_modules_updated_at BEFORE UPDATE ON public.learning_modules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_agent_insights_updated_at ON public.agent_insights;
CREATE TRIGGER set_agent_insights_updated_at BEFORE UPDATE ON public.agent_insights
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
