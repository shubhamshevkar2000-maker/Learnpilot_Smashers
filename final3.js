const fs = require('fs');

let p3 = 'app/courses/page.tsx';
let c3 = fs.readFileSync(p3, 'utf8');
c3 = c3.replace(/getPersonalizedCourses_NOT_USED\(profile\.id\)/g, 'getPersonalizedCourses_NOT_USED()');
c3 = c3.replace(/await updateNote\(\{ userId: user\.id, moduleId: course\.id, activityId: lesson\.id, topic: lesson\.title, noteContent, difficultyReflection: "" \}\)/g, 'await updateNote({ userId: user.id, moduleId: course.id, activityId: lesson.id, topic: lesson.title, noteContent, difficultyReflection: "" } as any)');
c3 = c3.replace(/\[lesson\.activity_type\]/g, '[lesson.activity_type || "concept"]');
fs.writeFileSync(p3, c3);

let p4 = 'app/notes/page.tsx';
let c4 = fs.readFileSync(p4, 'utf8');
c4 = c4.replace(/const Icon = getIconForNote\(note\)/g, 'const Icon = getIconForNote(note) as any');
c4 = c4.replace(/<\(Icon as any\)/g, '<Icon');
fs.writeFileSync(p4, c4);

console.log("Done");
