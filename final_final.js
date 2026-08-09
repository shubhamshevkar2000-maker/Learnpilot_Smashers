const fs = require('fs');

let p2 = 'lib/services/courses-service.ts';
let c2 = fs.readFileSync(p2, 'utf8');
c2 = c2.replace(/export interface CourseLesson \{/g, 'export interface CourseLesson {\n  activity_type?: string;\n  isRecommended?: boolean;');
fs.writeFileSync(p2, c2);

let p3 = 'app/courses/page.tsx';
let c3 = fs.readFileSync(p3, 'utf8');
c3 = c3.replace(/await updateNote\(note\)/g, 'await updateNote(note as any)');
c3 = c3.replace(/const res = await getPersonalizedCourses_NOT_USED\(profile\.id\)/g, 'const res = await getPersonalizedCourses_NOT_USED()');
c3 = c3.replace(/getPersonalizedCourses_NOT_USED\(profile\.id\)/g, 'getPersonalizedCourses_NOT_USED()');
fs.writeFileSync(p3, c3);

let p4 = 'app/notes/page.tsx';
let c4 = fs.readFileSync(p4, 'utf8');
// Fix Lucide Icon error - it's because Icon is a functional component
c4 = c4.replace(/<Icon className="h-6 w-6 text-primary" \/>/g, '<(Icon as any) className="h-6 w-6 text-primary" />');
c4 = c4.replace(/<Icon className="h-5 w-5 text-muted-foreground mr-3" \/>/g, '<(Icon as any) className="h-5 w-5 text-muted-foreground mr-3" />');
fs.writeFileSync(p4, c4);

console.log("final_final.js complete");
