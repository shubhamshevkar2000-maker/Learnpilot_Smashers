const fs = require('fs');

function fixCoursesService() {
  const p = 'lib/services/courses-service.ts';
  let c = fs.readFileSync(p, 'utf8');

  // Conflict 1: Course interface
  c = c.replace(/<<<<<<< ours\n  domain: "data_analytics" \| "full_stack" \| "ui_ux" \| "devops" \| "cybersecurity" \| "general"\n  isRecommended\?: boolean\n  recommendation_reason\?: string\n=======\n>>>>>>> theirs/g,
    '  domain: "data_analytics" | "full_stack" | "ui_ux" | "devops" | "cybersecurity" | "general"\n  isRecommended?: boolean\n  recommendation_reason?: string');

  // Conflict 2: Hardcoded courses
  c = c.replace(/<<<<<<< ours\n\/\/ ============================================================================\n\/\/ DOMAIN 1:/g,
    '// ============================================================================\n// DOMAIN 1:');
    
  // Find all remaining '>>>>>>> theirs' related to the hardcoded courses blocks (lines 900+)
  // Actually, wait, let's just replace all `lesson_type:` with `activity_type:`
  c = c.replace(/lesson_type:/g, 'activity_type:');
  
  // Conflict 3: getPersonalizedCourses vs getStorageKey
  c = c.replace(/=======[\s\S]*?export function getPersonalizedCourses[\s\S]*?>>>>>>> theirs/g, (match) => {
    return match.replace(/=======/, '').replace(/>>>>>>> theirs/, '');
  });
  
  c = c.replace(/<<<<<<< ours\n\/\/ Storage key helper/g, '// Storage key helper');
  c = c.replace(/<<<<<<< ours\n\/\/ Persistent course progress fetcher/g, '// Persistent course progress fetcher');
  
  // Clean up any stray markers
  c = c.replace(/<<<<<<< ours\n/g, '');
  c = c.replace(/=======\n/g, '');
  c = c.replace(/>>>>>>> theirs\n/g, '');

  fs.writeFileSync(p, c);
}

function fixNotesService() {
  const p = 'lib/services/notes-service.ts';
  let c = fs.readFileSync(p, 'utf8');
  // I already overwrote it, let's check if it still has markers.
  // The git restore might not have affected notes-service if I only restored courses-service!
  // Wait, I only did `git restore -m lib/services/courses-service.ts`.
  // So notes-service wasn't restored. But the TS error said `lib/services/notes-service.ts(265,1): error TS1185` earlier.
  // I will just strip markers from notes-service if they exist.
  c = c.replace(/<<<<<<< Updated upstream\n/g, '');
  c = c.replace(/<<<<<<< ours\n/g, '');
  c = c.replace(/=======\n[\s\S]*?>>>>>>> (Stashed changes|theirs)\n/g, '');
  fs.writeFileSync(p, c);
}

function fixPlanGenerator() {
  const p = 'lib/generator/plan-generator.ts';
  let c = fs.readFileSync(p, 'utf8');
  // plan-generator also wasn't restored. It has `=======` and `>>>>>>> Stashed changes`
  c = c.replace(/=======\n[\s\S]*?>>>>>>> (Stashed changes|theirs)\n/g, '');
  fs.writeFileSync(p, c);
}

function fixCurriculumService() {
  const p = 'lib/services/curriculum-service.ts';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/estimated_minutes: number \| undefined/g, 'estimated_minutes: number | null');
  c = c.replace(/day_number: number \| undefined/g, 'day_number: number | null');
  c = c.replace(/day_number\?: number/g, 'day_number?: number | null');
  c = c.replace(/estimated_minutes\?: number/g, 'estimated_minutes?: number | null');
  fs.writeFileSync(p, c);
}

function fixRagRetriever() {
  const p = 'lib/rag/retriever.ts';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/plan\.title/g, '(plan as any).title');
  c = c.replace(/plan\.goal_summary/g, '(plan as any).goal_summary');
  fs.writeFileSync(p, c);
}

fixCoursesService();
fixNotesService();
fixPlanGenerator();
fixCurriculumService();
fixRagRetriever();

console.log("Fixes applied.");
