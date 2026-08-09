-- Migration: 20260809000001_add_activity_scheduling.sql
-- Add estimated_minutes and day_number columns to module_activities table safely without corrupting legacy data

ALTER TABLE public.module_activities 
  ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER CHECK (estimated_minutes IS NULL OR estimated_minutes > 0),
  ADD COLUMN IF NOT EXISTS day_number INTEGER CHECK (day_number IS NULL OR day_number > 0);

CREATE INDEX IF NOT EXISTS idx_module_activities_day_number ON public.module_activities(user_id, day_number);
