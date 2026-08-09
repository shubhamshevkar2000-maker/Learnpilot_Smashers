const fs = require('fs');

function fixNotesService() {
  const p = 'lib/services/notes-service.ts';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/<<<<<<< ours\n([\s\S]*?)=======\n[\s\S]*?>>>>>>> theirs\n/g, '$1');
  fs.writeFileSync(p, c);
}

function fixDatabaseTypes() {
  const p = 'types/database.types.ts';
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/<<<<<<< ours\n([\s\S]*?)=======\n[\s\S]*?>>>>>>> theirs\n/g, '$1');
  fs.writeFileSync(p, c);
}

function fixCoursesService() {
  const p = 'lib/services/courses-service.ts';
  let c = fs.readFileSync(p, 'utf8');
  // Conflict 1: Course interface
  c = c.replace(/<<<<<<< ours\n([\s\S]*?)=======\n[\s\S]*?>>>>>>> theirs\n/g, (match, ours) => {
    if (ours.includes('domain: "data_analytics"')) {
      return ours;
    }
    // Conflict 2: Hardcoded courses
    if (ours.includes('DOMAIN 1: DATA ANALYTICS')) {
      // We take ours, but need to replace lesson_type with activity_type
      return ours.replace(/lesson_type:/g, 'activity_type:');
    }
    // Conflict 3: getPersonalizedCourses vs local funcs
    if (ours.includes('Storage key helper')) {
      // It's the end of file. We keep both
      let midSplit = match.split('=======\n');
      let theirs = midSplit[1].replace('>>>>>>> theirs\n', '');
      return ours + theirs;
    }
    return ours; // fallback
  });
  fs.writeFileSync(p, c);
}

function fixPlanGenerator() {
  const p = 'lib/generator/plan-generator.ts';
  let c = fs.readFileSync(p, 'utf8');
  
  c = c.replace(/<<<<<<< ours\n  day_number: number\n=======\n  content_id\?: string\n>>>>>>> theirs\n/g,
    '  day_number: number\n  content_id?: string\n');
    
  c = c.replace(/<<<<<<< ours\n \* Target-Date Aware[\s\S]*?=======\n( [\s\S]*?)\n>>>>>>> theirs\n/g, (match, theirs) => {
    // We want the helper functions from theirs, and the target-date aware logic from ours.
    // wait, actually theirs contains the helper functions AND the old generateLearningPlan.
    // we want helper functions + ours' generateLearningPlan.
    let helpers = theirs.split('export function generateLearningPlan')[0];
    let oursBody = match.split('=======\n')[0].replace('<<<<<<< ours\n', '');
    return helpers + oursBody;
  });
  
  c = c.replace(/<<<<<<< ours\n  const lowerGoal[\s\S]*?=======\n>>>>>>> theirs\n/g, (match) => {
    return match.split('=======\n')[0].replace('<<<<<<< ours\n', '');
  });
  
  fs.writeFileSync(p, c);
}

fixNotesService();
fixDatabaseTypes();
fixCoursesService();
fixPlanGenerator();

console.log("Merge completed cleanly.");
