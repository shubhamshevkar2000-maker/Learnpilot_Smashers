import re

with open('types/database.types.ts', 'r') as f:
    c = f.read()

# Fix module_activities to have estimated_minutes and day_number
c = re.sub(r'(content_id:\s*string\s*\|\s*null\n\s*)}', r'\1          estimated_minutes?: number | null\n          day_number?: number | null\n        }', c)
c = re.sub(r'(content_id\?:\s*string\s*\|\s*null\n\s*)}', r'\1          estimated_minutes?: number | null\n          day_number?: number | null\n        }', c)

# Fix learner_notes to have the new fields
new_fields = """          module_id?: string | null
          activity_id?: string | null
          topic?: string
          note_content?: string
          difficulty_reflection?: string | null"""

# Find learner_notes definition and replace within it
learner_notes_start = c.find('learner_notes: {')
if learner_notes_start != -1:
    before = c[:learner_notes_start]
    after = c[learner_notes_start:]
    
    after = re.sub(r'(updated_at:\s*string\n\s*)}', rf'\1{new_fields}\n        }}', after, count=1)
    after = re.sub(r'(updated_at\?:\s*string\n\s*)}', rf'\1{new_fields}\n        }}', after, count=2)
    
    c = before + after

# Ensure exports exist
if 'export type LearnerProfile' not in c:
    c += '\nexport type LearnerProfile = Database["public"]["Tables"]["learner_profiles"]["Row"]\n'
    c += 'export type LearningPlan = Database["public"]["Tables"]["learning_plans"]["Row"]\n'
    c += 'export type LearningModule = Database["public"]["Tables"]["learning_modules"]["Row"]\n'
    c += 'export type ModuleActivity = Database["public"]["Tables"]["module_activities"]["Row"]\n'
    c += 'export type AssessmentResult = Database["public"]["Tables"]["assessment_results"]["Row"]\n'
    c += 'export type AgentInsight = Database["public"]["Tables"]["agent_insights"]["Row"]\n'
    c += 'export type LearnerNote = Database["public"]["Tables"]["learner_notes"]["Row"]\n'

with open('types/database.types.ts', 'w') as f:
    f.write(c)
