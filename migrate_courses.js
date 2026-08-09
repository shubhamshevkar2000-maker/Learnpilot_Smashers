import fs from 'fs';
import path from 'path';

const coursesServicePath = path.join(process.cwd(), 'lib/services/courses-service.ts');
let code = fs.readFileSync(coursesServicePath, 'utf8');

const match = code.match(/export const CONST_COURSES: Course\[\] = (\[[\s\S]*?\])\n\n\/\//);
if (match) {
  const coursesText = match[1];
  
  const evalCode = `
    const courses = ${coursesText};
    
    const registry = {};
    for (const c of courses) {
      for (const l of c.lessons) {
        registry[l.id] = {
          id: l.id,
          title: l.title,
          type: l.lesson_type,
          objective: l.objective,
          concept_guide: l.concept_guide,
          code_example: l.code_example,
          practical_exercise: l.practical_exercise,
          checkpoint_question: l.checkpoint_question,
          checkpoint_options: l.checkpoint_options,
          checkpoint_correct_index: l.checkpoint_correct_index,
          checkpoint_explanation: l.checkpoint_explanation,
          topic: c.title,
          difficulty: c.difficulty
        };
      }
    }
    
    console.log(JSON.stringify(registry, null, 2));
  `;
  
  try {
    fs.writeFileSync('temp-extract.js', evalCode);
  } catch (e) {
    console.error(e);
  }
} else {
  console.log("Could not find CONST_COURSES");
}
