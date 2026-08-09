const fs = require('fs');

function resolveCourses() {
  const p = 'lib/services/courses-service.ts';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/<<<<<<< ours\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> theirs\n/g, '$2');
  fs.writeFileSync(p, c);
}

function resolvePlanGenerator() {
  const p = 'lib/generator/plan-generator.ts';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/<<<<<<< ours\n  day_number: number\n=======\n  content_id\?: string\n>>>>>>> theirs\n/g, '  day_number: number\n  content_id?: string\n');
  
  c = c.replace(/<<<<<<< ours\n \* Target-Date Aware[\s\S]*?=======\n([\s\S]*?)\n>>>>>>> theirs\n/g, (match, theirs) => {
    let helpers = theirs.split('export function generateLearningPlan')[0];
    let oursBody = match.split('=======\n')[0].replace('<<<<<<< ours\n', '');
    return helpers + oursBody;
  });

  c = c.replace(/<<<<<<< ours\n  const lowerGoal[\s\S]*?=======\n>>>>>>> theirs\n/g, (match) => {
    return match.split('=======\n')[0].replace('<<<<<<< ours\n', '');
  });
  fs.writeFileSync(p, c);
}

function resolveNotesService() {
  const p = 'lib/services/notes-service.ts';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/<<<<<<< ours\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> theirs\n/g, '$1');
  fs.writeFileSync(p, c);
}

function resolveDatabaseTypes() {
  const p = 'types/database.types.ts';
  let c = fs.readFileSync(p, 'utf8');
  
  // Custom combine for LearnerNote type (ours is learning_path, activity etc, theirs is module_id, activity_id)
  // Let's just use ours and add their fields optionally.
  c = c.replace(/<<<<<<< ours\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> theirs\n/g, (match, ours, theirs) => {
    return ours + '\n          // Added from Phase 3:\n          module_id?: string | null;\n          activity_id?: string | null;\n          topic?: string;\n          note_content?: string;\n          difficulty_reflection?: string | null;\n';
  });
  fs.writeFileSync(p, c);
}

try {
  resolveCourses();
  resolvePlanGenerator();
  resolveNotesService();
  resolveDatabaseTypes();
  console.log("Resolved successfully");
} catch(e) {
  console.error(e);
}
