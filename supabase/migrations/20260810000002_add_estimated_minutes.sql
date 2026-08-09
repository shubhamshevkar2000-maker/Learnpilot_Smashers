-- Migration to add estimated_minutes to module_activities
ALTER TABLE module_activities
ADD COLUMN IF NOT EXISTS estimated_minutes integer DEFAULT 20;

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';
