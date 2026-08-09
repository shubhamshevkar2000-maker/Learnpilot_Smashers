const fs = require('fs');

let c = fs.readFileSync('lib/services/courses-service.ts', 'utf8');
c = c.replace(/<<<<<<< ours\n/g, '').replace(/=======\n/g, '').replace(/>>>>>>> theirs\n/g, '');
c = c.replace(/lesson_type:/g, 'activity_type:');

// Fix getPersonalizedCourses missing domain
c = c.replace(/difficulty: "Beginner", \/\/ Derivable from profile level if needed\n\s*estimated_minutes: mod.estimated_minutes \|\| 0,\n\s*lessons/g,
  'difficulty: "Beginner", // Derivable from profile level if needed\n      estimated_minutes: mod.estimated_minutes || 0,\n      domain: "general",\n      lessons');

fs.writeFileSync('lib/services/courses-service.ts', c);
