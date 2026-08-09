const fs = require('fs');

const p = 'types/database.types.ts';
let c = fs.readFileSync(p, 'utf8');

c += `
export type LearnerProfile = Database["public"]["Tables"]["learner_profiles"]["Row"]
export type LearningPlan = Database["public"]["Tables"]["learning_plans"]["Row"]
export type LearningModule = Database["public"]["Tables"]["learning_modules"]["Row"]
export type ModuleActivity = Database["public"]["Tables"]["module_activities"]["Row"]
export type AssessmentResult = Database["public"]["Tables"]["assessment_results"]["Row"]
export type AgentInsight = Database["public"]["Tables"]["agent_insights"]["Row"]
export type LearnerNote = Database["public"]["Tables"]["learner_notes"]["Row"]
`;

fs.writeFileSync(p, c);

const p2 = 'lib/services/courses-service.ts';
let c2 = fs.readFileSync(p2, 'utf8');
let parts = c2.split('export async function completeCourseLesson');
if (parts.length > 2) {
  c2 = parts[0] + 'export async function completeCourseLesson' + parts[1];
  fs.writeFileSync(p2, c2);
}
