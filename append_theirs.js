const fs = require('fs');

const theirsContent = fs.readFileSync('theirs.ts', 'utf8');
const oursPath = 'lib/services/courses-service.ts';
let oursContent = fs.readFileSync(oursPath, 'utf8');

// Extract getPersonalizedCourses and completeCourseLesson from theirs
const match = theirsContent.match(/(\/\*\*\n \* Maps the personalized Learning Modules[\s\S]*)/);
if (match) {
  let toAppend = match[1];
  
  // Replace missing domain
  toAppend = toAppend.replace(/difficulty: "Beginner", \/\/ Derivable from profile level if needed\n\s*estimated_minutes: mod.estimated_minutes \|\| 0,\n\s*lessons/g,
    'difficulty: "Beginner", // Derivable from profile level if needed\n      estimated_minutes: mod.estimated_minutes || 0,\n      domain: "general",\n      lessons');
      
  oursContent += '\n\n' + toAppend;
}

oursContent = oursContent.replace(/lesson_type:/g, 'activity_type:');

fs.writeFileSync(oursPath, oursContent);
