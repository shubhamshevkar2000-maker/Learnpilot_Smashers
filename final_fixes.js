const fs = require('fs');

// 1. database.types.ts
let dbPath = 'types/database.types.ts';
let dbContent = fs.readFileSync(dbPath, 'utf8');
// Fix missing optional modifier in Insert/Update for module_activities and learning_modules
dbContent = dbContent.replace(/estimated_minutes: number \| null/g, 'estimated_minutes?: number | null');
dbContent = dbContent.replace(/day_number: number \| null/g, 'day_number?: number | null');
fs.writeFileSync(dbPath, dbContent);

// 2. generate-plan/route.ts
let p1 = 'app/api/generate-plan/route.ts';
let c1 = fs.readFileSync(p1, 'utf8');
c1 = c1.replace(/day_number: a.day_number,/g, '');
c1 = c1.replace(/day_number: z.number\(\).optional\(\),/g, '');
fs.writeFileSync(p1, c1);

// 3. curriculum-service.ts
let p2 = 'lib/services/curriculum-service.ts';
let c2 = fs.readFileSync(p2, 'utf8');
c2 = c2.replace(/export interface ScheduledActivity extends Partial<ModuleActivity> \{/g, 'export interface ScheduledActivity extends Omit<Partial<ModuleActivity>, "estimated_minutes"|"day_number"> {\n  estimated_minutes?: number | null;\n  day_number?: number | null;');
fs.writeFileSync(p2, c2);

// 4. courses/page.tsx
let p3 = 'app/courses/page.tsx';
let c3 = fs.readFileSync(p3, 'utf8');
c3 = c3.replace(/getPersonalizedCourses/g, 'getPersonalizedCourses_NOT_USED');
c3 = c3.replace(/CourseLessonType/g, 'ActivityType');
c3 = c3.replace(/lesson_type/g, 'activity_type');
c3 = c3.replace(/is_content_missing/g, 'isRecommended');
c3 = c3.replace(/import \{ CONST_COURSES, DATA_ANALYTICS_COURSES/g, 'import { DATA_ANALYTICS_COURSES');
fs.writeFileSync(p3, c3);

// 5. app/path/page.tsx
let p4 = 'app/path/page.tsx';
let c4 = fs.readFileSync(p4, 'utf8');
c4 = c4.replace(/\{mod\.activities\.map/g, '{(mod.activities || []).map');
fs.writeFileSync(p4, c4);

console.log("Applied final fixes.");
