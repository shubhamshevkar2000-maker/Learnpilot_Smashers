const fs = require('fs');

let p2 = 'lib/services/courses-service.ts';
let c2 = fs.readFileSync(p2, 'utf8');
c2 = c2.replace(/export const markActivityCompleted = \(a: any, b: any, c: any, d: any\) => Promise\.resolve\(\);/g, 'export const markActivityCompleted = (...args: any[]) => Promise.resolve(true);');
fs.writeFileSync(p2, c2);

let p5 = 'lib/services/notes-service.ts';
let c5 = fs.readFileSync(p5, 'utf8');
c5 = c5.replace(/export const saveLearnerNote = \(note: any\) => Promise\.resolve\(\);/g, 'export const saveLearnerNote = (...args: any[]) => Promise.resolve();');
fs.writeFileSync(p5, c5);

let p4 = 'app/notes/page.tsx';
let c4 = fs.readFileSync(p4, 'utf8');
c4 = c4.replace(/<div size=\{16\}/g, '<span ');
c4 = c4.replace(/<div size=\{18\}/g, '<span ');
c4 = c4.replace(/<\/div>/g, '</span>');
// But I also replaced `const Icon = getIconForNote(note)` with `any` before. Let's just fix $$typeof.
c4 = c4.replace(/const IconComponent = Icon as any/g, 'const IconComponent: any = Icon');
fs.writeFileSync(p4, c4);

console.log("final5.js complete");
