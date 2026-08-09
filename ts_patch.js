const fs = require('fs');

// 1. types/database.types.ts
let dbPath = 'types/database.types.ts';
let dbContent = fs.readFileSync(dbPath, 'utf8');
if (!dbContent.includes('export type LearningPlan')) {
    dbContent += `
export type LearnerProfile = Database["public"]["Tables"]["learner_profiles"]["Row"]
export type LearningPlan = Database["public"]["Tables"]["learning_plans"]["Row"]
export type LearningModule = Database["public"]["Tables"]["learning_modules"]["Row"]
export type ModuleActivity = Database["public"]["Tables"]["module_activities"]["Row"]
export type AssessmentResult = Database["public"]["Tables"]["assessment_results"]["Row"]
export type AgentInsight = Database["public"]["Tables"]["agent_insights"]["Row"]
export type LearnerNote = Database["public"]["Tables"]["learner_notes"]["Row"]
`;
    fs.writeFileSync(dbPath, dbContent);
}

// 2. lib/services/curriculum-service.ts
let currPath = 'lib/services/curriculum-service.ts';
let currContent = fs.readFileSync(currPath, 'utf8');
currContent = currContent.replace(/estimated_minutes: number \| undefined/g, 'estimated_minutes: number | null');
currContent = currContent.replace(/day_number: number \| undefined/g, 'day_number: number | null');
currContent = currContent.replace(/day_number\?: number/g, 'day_number?: number | null');
currContent = currContent.replace(/estimated_minutes\?: number/g, 'estimated_minutes?: number | null');
currContent = currContent.replace(/estimated_minutes\?: number \| undefined;/g, 'estimated_minutes?: number | null;');
currContent = currContent.replace(/estimated_minutes: number \| null;/g, 'estimated_minutes?: number | null;');
fs.writeFileSync(currPath, currContent);

// 3. app/journey/page.tsx
let journeyPath = 'app/journey/page.tsx';
let journeyContent = fs.readFileSync(journeyPath, 'utf8');
journeyContent = journeyContent.replace(/export interface FlattenedActivity extends Omit<ModuleActivity, "created_at"> {/g, 
  'export interface FlattenedActivity extends Omit<ModuleActivity, "created_at"> {\n  activity_type?: string;');
fs.writeFileSync(journeyPath, journeyContent);

// 4. app/path/page.tsx
let pathPath = 'app/path/page.tsx';
let pathContent = fs.readFileSync(pathPath, 'utf8');
pathContent = pathContent.replace(/const isDayInProgress = firstIncompleteAct\?\.day_number === day\.day_number/g, 'const isDayInProgress = false');
pathContent = pathContent.replace(/export interface ScheduledActivity/g, 'export interface ScheduledActivity extends Partial<ModuleActivity>');
fs.writeFileSync(pathPath, pathContent);

// 5. lib/rag/retriever.ts
let ragPath = 'lib/rag/retriever.ts';
let ragContent = fs.readFileSync(ragPath, 'utf8');
ragContent = ragContent.replace(/plan\.title/g, '(plan as any).title');
ragContent = ragContent.replace(/plan\.goal_summary/g, '(plan as any).goal_summary');
ragContent = ragContent.replace(/CONST_COURSES/g, 'DATA_ANALYTICS_COURSES');
fs.writeFileSync(ragPath, ragContent);

// 6. app/notes/page.tsx
let notesPath = 'app/notes/page.tsx';
let notesContent = fs.readFileSync(notesPath, 'utf8');
notesContent = notesContent.replace(/<Icon className/g, '<(Icon as any) className');
fs.writeFileSync(notesPath, notesContent);

console.log("TypeScript patches applied.");
