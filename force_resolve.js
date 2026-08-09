const fs = require('fs');

function keepOurs(path) {
  let content = fs.readFileSync(path, 'utf8');
  let resolved = content.replace(/<<<<<<< ours\n([\s\S]*?)=======\n[\s\S]*?>>>>>>> theirs\n?/g, '$1');
  fs.writeFileSync(path, resolved);
}

function resolveCourses() {
  let path = 'lib/services/courses-service.ts';
  let content = fs.readFileSync(path, 'utf8');
  
  // Custom manual resolution by splitting on markers
  // We assume exactly 3 conflicts in courses-service
  let parts = content.split(/<<<<<<< ours\n|=======\n|>>>>>>> theirs\n?/);
  // parts[0]: before conflict 1
  // parts[1]: conflict 1 ours
  // parts[2]: conflict 1 theirs
  // parts[3]: between 1 and 2
  // parts[4]: conflict 2 ours
  // parts[5]: conflict 2 theirs
  // parts[6]: between 2 and 3
  // parts[7]: conflict 3 ours
  // parts[8]: conflict 3 theirs
  // parts[9]: after conflict 3
  
  if (parts.length >= 10) {
    let resolved = parts[0] + parts[1] + parts[3];
    let conflict2Ours = parts[4].replace(/lesson_type:/g, 'activity_type:');
    resolved += conflict2Ours + parts[6] + parts[7] + parts[8] + parts[9];
    fs.writeFileSync(path, resolved);
  } else {
    console.error("COURSES SERVICE SPLIT FAILED. Length: " + parts.length);
  }
}

function resolvePlan() {
  let path = 'lib/generator/plan-generator.ts';
  let content = fs.readFileSync(path, 'utf8');
  let parts = content.split(/<<<<<<< ours\n|=======\n|>>>>>>> theirs\n?/);
  // We expect 3 or 4 conflicts depending on how it was chunked.
  // Let's just manually replace known markers.
  let resolved = content.replace(/<<<<<<< ours\n  day_number: number\n=======\n  content_id\?: string\n>>>>>>> theirs\n?/g, '  day_number: number\n  content_id?: string\n');
  
  resolved = resolved.replace(/<<<<<<< ours\n \* Target-Date Aware[\s\S]*?=======\n([\s\S]*?)export function generateLearningPlan\(profile: LearnerProfile\): GeneratedPlan \{\n  const goal = \(profile\.learning_goal \|\| "General Web Development"\)\.trim\(\)\n  const outcome = \(profile\.desired_outcome \|\| "Achieve proficiency"\)\.trim\(\)\n>>>>>>> theirs\n?/g,
  (match, helpers) => {
    return helpers + `\n/**\n * Target-Date Aware, Production-Grade Curriculum & Schedule Generator.\n */\nexport function generateLearningPlan(profile: LearnerProfile): GeneratedPlan {\n  const goal = (profile.learning_goal || "General Skill Mastery").trim()\n  const outcome = (profile.desired_outcome || "Achieve practical mastery").trim()\n`;
  });
  
  resolved = resolved.replace(/<<<<<<< ours\n  const lowerGoal[\s\S]*?=======\n>>>>>>> theirs\n?/g, (match) => {
    return match.replace(/<<<<<<< ours\n/, '').replace(/=======\n>>>>>>> theirs\n?/, '');
  });
  
  fs.writeFileSync(path, resolved);
}

// 1. Database types
keepOurs('types/database.types.ts');
// Also we need to append the aliases since ours missed them!
let dbContent = fs.readFileSync('types/database.types.ts', 'utf8');
dbContent += `
export type LearnerProfile = Database["public"]["Tables"]["learner_profiles"]["Row"]
export type LearningPlan = Database["public"]["Tables"]["learning_plans"]["Row"]
export type LearningModule = Database["public"]["Tables"]["learning_modules"]["Row"]
export type ModuleActivity = Database["public"]["Tables"]["module_activities"]["Row"]
export type AssessmentResult = Database["public"]["Tables"]["assessment_results"]["Row"]
export type AgentInsight = Database["public"]["Tables"]["agent_insights"]["Row"]
export type LearnerNote = Database["public"]["Tables"]["learner_notes"]["Row"]
`;
fs.writeFileSync('types/database.types.ts', dbContent);

// 2. Notes Service
keepOurs('lib/services/notes-service.ts');

// 3. Courses Service
resolveCourses();

// 4. Plan Generator
resolvePlan();

console.log("force_resolve complete.");
