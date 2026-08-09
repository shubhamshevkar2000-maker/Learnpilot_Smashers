-- Migration: 20260810000000_learner_notes.sql
-- LearnPilot Learner Notes Table Migration

CREATE TABLE IF NOT EXISTS public.learner_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Note',
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}'::text[],
  source_type TEXT DEFAULT 'general'
    CHECK (source_type IN ('learning_path', 'activity', 'course', 'lesson', 'journey', 'general')),
  source_id TEXT,
  source_title TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_learner_notes_user_id ON public.learner_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_learner_notes_user_pinned ON public.learner_notes(user_id, is_pinned);

-- Row Level Security (RLS)
ALTER TABLE public.learner_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Learners can manage own notes" ON public.learner_notes;
CREATE POLICY "Learners can manage own notes" ON public.learner_notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Updated at trigger
DROP TRIGGER IF EXISTS set_learner_notes_updated_at ON public.learner_notes;
CREATE TRIGGER set_learner_notes_updated_at BEFORE UPDATE ON public.learner_notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
