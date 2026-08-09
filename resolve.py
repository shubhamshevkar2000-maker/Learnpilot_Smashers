import re

def resolve_file(path, strat):
    with open(path, 'r') as f:
        content = f.read()

    pattern = re.compile(r'^<<<<<<< ours\n(.*?)^=======\n(.*?)^>>>>>>> theirs\n?', re.MULTILINE | re.DOTALL)
    
    def replacer(match):
        ours = match.group(1)
        theirs = match.group(2)
        if strat == 'courses':
            if 'domain: "data_analytics"' in ours:
                return ours
            if 'DOMAIN 1: DATA ANALYTICS' in ours:
                return ours.replace('lesson_type:', 'activity_type:')
            if 'Storage key helper' in ours:
                theirs = theirs.replace('difficulty: "Beginner", // Derivable from profile level if needed\n      estimated_minutes: mod.estimated_minutes || 0,\n      lessons', 'difficulty: "Beginner", // Derivable from profile level if needed\n      estimated_minutes: mod.estimated_minutes || 0,\n      domain: "general",\n      lessons')
                return theirs + ours
            return ours
        elif strat == 'plan':
            if 'day_number: number' in ours:
                return '  day_number: number\n  content_id?: string\n'
            if 'Target-Date Aware' in ours:
                helpers = theirs.split('export function generateLearningPlan')[0]
                return helpers + '/**\n * Target-Date Aware' + ours.split('Target-Date Aware')[1]
            if 'const lowerGoal' in ours:
                return ours
            return ours
        return ours
        
    resolved = pattern.sub(replacer, content)
    with open(path, 'w') as f:
        f.write(resolved)

resolve_file('lib/services/courses-service.ts', 'courses')
resolve_file('lib/generator/plan-generator.ts', 'plan')

# Append to database types
with open('types/database.types.ts', 'a') as f:
    f.write('\n')
    f.write('export type LearnerProfile = Database["public"]["Tables"]["learner_profiles"]["Row"]\n')
    f.write('export type LearningPlan = Database["public"]["Tables"]["learning_plans"]["Row"]\n')
    f.write('export type LearningModule = Database["public"]["Tables"]["learning_modules"]["Row"]\n')
    f.write('export type ModuleActivity = Database["public"]["Tables"]["module_activities"]["Row"]\n')
    f.write('export type AssessmentResult = Database["public"]["Tables"]["assessment_results"]["Row"]\n')
    f.write('export type AgentInsight = Database["public"]["Tables"]["agent_insights"]["Row"]\n')
    f.write('export type LearnerNote = Database["public"]["Tables"]["learner_notes"]["Row"]\n')

print("Resolved conflicts with python script")
