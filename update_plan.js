const fs = require('fs');

// 1. Update plan-generator.ts
let planContent = fs.readFileSync('lib/generator/plan-generator.ts', 'utf8');

planContent = planContent.replace(
  /export interface GeneratedActivity {\n  title: string\n  activity_type: ActivityType\n  sequence_order: number\n  estimated_minutes: number\n}/,
  `export interface GeneratedActivity {
  title: string
  activity_type: ActivityType
  sequence_order: number
  estimated_minutes: number
  content_id?: string
}`
);

planContent = planContent.replace(
  /const finalActivities: GeneratedActivity\[\] = adaptedActivities.map\(\(a, aIdx\) => \(\{\n      title: a.title,\n      activity_type: a.activity_type,\n      sequence_order: aIdx \+ 1,\n      estimated_minutes: a.estimated_minutes,\n    \}\)\)/,
  `const finalActivities: GeneratedActivity[] = adaptedActivities.map((a, aIdx) => ({
      title: a.title,
      activity_type: a.activity_type,
      sequence_order: aIdx + 1,
      estimated_minutes: a.estimated_minutes,
      content_id: a.contentId,
    }))`
);

fs.writeFileSync('lib/generator/plan-generator.ts', planContent, 'utf8');

// 2. Update route.ts
let routeContent = fs.readFileSync('app/api/generate-plan/route.ts', 'utf8');

routeContent = routeContent.replace(
  /export interface AIActivityOutput {\n  title: string\n  activity_type: ActivityType\n  sequence_order: number\n  estimated_minutes: number\n}/,
  `export interface AIActivityOutput {
  title: string
  activity_type: ActivityType
  sequence_order: number
  estimated_minutes: number
  content_id?: string
}`
);

// We need to add content_id to the JSON schema prompt in route.ts
routeContent = routeContent.replace(
  /"estimated_minutes": 20/,
  `"estimated_minutes": 20,
          "content_id": "optional-content-id-string"`
);

// When mapping activity inserts, we need to add content_id
routeContent = routeContent.replace(
  /activity_type: act.activity_type,\n            title: act.title.trim\(\),\n            sequence_order: act.sequence_order,\n            is_completed: false,/,
  `activity_type: act.activity_type,
            title: act.title.trim(),
            sequence_order: act.sequence_order,
            is_completed: false,
            content_id: act.content_id || null,`
);

fs.writeFileSync('app/api/generate-plan/route.ts', routeContent, 'utf8');
console.log("Updated plan-generator.ts and route.ts");
