const fs = require('fs');
const paths = [
  'app/ai-coach/page.tsx',
  'app/assessments/page.tsx',
  'app/courses/page.tsx',
  'app/journey/page.tsx',
  'app/path/page.tsx',
  'app/progress/page.tsx',
  'lib/generator/plan-generator.ts',
  'lib/services/courses-service.ts',
  'lib/services/notes-service.ts',
  'types/database.types.ts'
];

for (const p of paths) {
  if (!fs.existsSync(p)) continue;
  let content = fs.readFileSync(p, 'utf-8');
  
  // Resolve nav items for notes/settings
  content = content.replace(/<<<<<<< Updated upstream\n\s*{ id: "notes", label: "Notes", icon: FileText, href: "\/notes" },\n\s*{ id: "settings", label: "Settings", icon: Settings, href: "\/settings" },\n=======\n\s*{ id: "notes", label: "Notes", icon: FileText, href: "#" },\n\s*{ id: "settings", label: "Settings", icon: Settings, href: "#" },\n>>>>>>> Stashed changes/g,
    '  { id: "notes", label: "Notes", icon: FileText, href: "/notes" },\n  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },');

  // Resolve nav items for courses
  content = content.replace(/<<<<<<< Updated upstream\n\s*{ id: "courses", label: "Courses", icon: BookOpen, href: "#" },\n=======\n\s*{ id: "courses", label: "Courses", icon: BookOpen, href: "\/courses" },\n>>>>>>> Stashed changes/g,
    '  { id: "courses", label: "Courses", icon: BookOpen, href: "/courses" },');

  // courses-service.ts
  content = content.replace(/<<<<<<< Updated upstream\n\/\/ Storage key helper[\s\S]*?=======\n\/\*\*\n \* Marks a lesson \(module_activity\) as completed directly in the DB\.\n \*\/\n>>>>>>> Stashed changes/g,
    '/**\n * Marks a lesson (module_activity) as completed directly in the DB.\n */');
    
  // app/courses/page.tsx
  content = content.replace(/<<<<<<< Updated upstream\n\s*\/\/ Derive Standalone Courses Catalog[\s\S]*?=======\n>>>>>>> Stashed changes/g,
    '');

  // app/journey/page.tsx
  content = content.replace(/<<<<<<< Updated upstream\n\s*\/\/ Helper to select today's assigned activities based on the current active day[\s\S]*?=======\n>>>>>>> Stashed changes/g,
    '');

  // app/path/page.tsx conflict
  content = content.replace(/<<<<<<< Updated upstream[\s\S]*?=======\n\s*\/\* Day Activities \*\//g,
    '                      {/* Day Activities */');

  content = content.replace(/<<<<<<< Updated upstream\n\s*{ id: "courses", label: "Courses", icon: BookOpen, href: "#" },\n=======\n\s*{ id: "courses", label: "Courses", icon: BookOpen, href: "\/courses" },\n>>>>>>> Stashed changes/g,
    '  { id: "courses", label: "Courses", icon: BookOpen, href: "/courses" },');

  // lib/generator/plan-generator.ts
  content = content.replace(/<<<<<<< Updated upstream\n\s*day_number: number\n=======\n\s*content_id\?: string\n>>>>>>> Stashed changes/g,
    '  day_number: number\n  content_id?: string');

  content = content.replace(/<<<<<<< Updated upstream\n \*\ Target-Date Aware[\s\S]*?=======\n \*\ Matches a user's learning goal[\s\S]*?>>>>>>> Stashed changes/g,
    ' * Matches a user\'s learning goal to the closest Domain using alias matching.\n */\nfunction matchDomain(goal: string): DomainId {\n  const lowerGoal = goal.toLowerCase()\n  for (const domain of DOMAIN_REGISTRY) {\n    if (domain.id !== "generic" && domain.aliases.some(alias => lowerGoal.includes(alias))) {\n      return domain.id\n    }\n  }\n  return "generic"\n}\n\n/**\n * Maps the user\'s current level to the corresponding progression track in a domain.\n */\nfunction getProgressionKey(level: CurrentLevel): "beginner" | "intermediate" | "advanced" {\n  if (level === "intermediate") return "intermediate"\n  if (level === "advanced") return "advanced"\n  return "beginner" // "beginner", "basics", or "unknown" default to beginner track\n}\n\n/**\n * Adjusts activity durations based on the user\'s desired outcome.\n */\nfunction adaptActivitiesForOutcome(activities: ActivityTemplate[], outcome: string): ActivityTemplate[] {\n  const lower = outcome.toLowerCase()\n  const isJobFocused = lower.includes("job") || lower.includes("role") || lower.includes("interview") || lower.includes("hire")\n  const isProductionFocused = lower.includes("production") || lower.includes("scale") || lower.includes("enterprise") || lower.includes("startup")\n  const isFundamentals = lower.includes("fundamental") || lower.includes("basics") || lower.includes("foundation") || lower.includes("concept")\n\n  return activities.map(act => {\n    let weight = 1.0\n    if (isJobFocused && act.is_interview_prep) weight = 1.4\n    if (isProductionFocused && act.is_production) weight = 1.4\n    if (isProductionFocused && act.is_architecture) weight = 1.2\n    if (isFundamentals && act.activity_type === "concept") weight = 1.3\n\n    return {\n      ...act,\n      estimated_minutes: Math.round(act.estimated_minutes * weight)\n    }\n  })\n}\n\n/**\n * Chunks activities if their estimated minutes greatly exceed the user\'s daily availability.\n */\nfunction chunkActivities(activities: ActivityTemplate[], dailyMinutes: number | null): ActivityTemplate[] {\n  if (!dailyMinutes || dailyMinutes >= 45) return activities\n  const targetMax = Math.max(dailyMinutes, 15) // Never chunk below 15m chunks\n  \n  const chunked: ActivityTemplate[] = []\n  for (const act of activities) {\n    if (act.estimated_minutes <= targetMax * 1.5) {\n      chunked.push(act)\n    } else {\n      const parts = Math.ceil(act.estimated_minutes / targetMax)\n      const minutesPerPart = Math.floor(act.estimated_minutes / parts)\n      for (let i = 0; i < parts; i++) {\n        chunked.push({\n          ...act,\n          title: `${act.title} (Part ${i + 1})`,\n          estimated_minutes: i === parts - 1 ? act.estimated_minutes - (minutesPerPart * (parts - 1)) : minutesPerPart\n        })\n      }\n    }\n  }\n  return chunked\n}\n\n/**\n * Deterministic, highly personalized learning plan generator using Domain Composition.\n */\nexport function generateLearningPlan(profile: LearnerProfile): GeneratedPlan {\n  const goal = (profile.learning_goal || "General Web Development").trim()\n  const outcome = (profile.desired_outcome || "Achieve proficiency").trim()\n  const level: CurrentLevel = profile.current_level || "beginner"\n  const dailyMinutes = profile.available_daily_minutes');
    
  // plan-generator.ts: lowerGoal / dailyBudget block
  content = content.replace(/<<<<<<< Updated upstream\n\s*const lowerGoal = goal\.toLowerCase\(\)\n\s*const dailyBudget[\s\S]*?=======\n>>>>>>> Stashed changes/g,
    '');

  // lib/services/notes-service.ts
  content = content.replace(/<<<<<<< Updated upstream\nimport type { Database } from "@/types\/database\.types"\n\nexport type NoteSourceType = "learning_path" \| "activity" \| "course" \| "lesson" \| "journey" \| "general"\n\nexport interface LearnerNote {[\s\S]*?=======\n>>>>>>> Stashed changes/g,
    'import type { Database } from "@/types/database.types"\n\nexport type NoteSourceType = "learning_path" | "activity" | "course" | "lesson" | "journey" | "general"\n\nexport interface LearnerNote {\n  id: string\n  user_id: string\n  title: string\n  content: string\n  tags: string[]\n  source_type: NoteSourceType\n  source_id?: string | null\n  source_title?: string | null\n  is_pinned: boolean\n  created_at: string\n  updated_at: string\n}');

  // types/database.types.ts
  content = content.replace(/<<<<<<< Updated upstream\n\s*title: string\n\s*content: string\n\s*tags: string\[\]\n\s*source_type: string\n\s*source_id: string \| null\n\s*source_title: string \| null\n\s*is_pinned: boolean\n\s*created_at: string\n\s*updated_at: string\n=======\n\s*module_id: string \| null\n\s*activity_id: string \| null\n\s*topic: string\n\s*note_content: string\n\s*difficulty_reflection: string \| null\n\s*created_at: string\n>>>>>>> Stashed changes/g,
    '          title: string\n          content: string\n          tags: string[]\n          source_type: string\n          source_id: string | null\n          source_title: string | null\n          is_pinned: boolean\n          created_at: string\n          updated_at: string');

  content = content.replace(/<<<<<<< Updated upstream\n\s*title\?: string\n\s*content\?: string\n\s*tags\?: string\[\]\n\s*source_type\?: string\n\s*source_id\?: string \| null\n\s*source_title\?: string \| null\n\s*is_pinned\?: boolean\n\s*created_at\?: string\n\s*updated_at\?: string\n=======\n\s*module_id\?: string \| null\n\s*activity_id\?: string \| null\n\s*topic: string\n\s*note_content: string\n\s*difficulty_reflection\?: string \| null\n\s*created_at\?: string\n>>>>>>> Stashed changes/g,
    '          title?: string\n          content?: string\n          tags?: string[]\n          source_type?: string\n          source_id?: string | null\n          source_title?: string | null\n          is_pinned?: boolean\n          created_at?: string\n          updated_at?: string');

  content = content.replace(/<<<<<<< Updated upstream\n\s*title\?: string\n\s*content\?: string\n\s*tags\?: string\[\]\n\s*source_type\?: string\n\s*source_id\?: string \| null\n\s*source_title\?: string \| null\n\s*is_pinned\?: boolean\n\s*created_at\?: string\n\s*updated_at\?: string\n\s*}\n\s*}\n=======\n\s*module_id\?: string \| null\n\s*activity_id\?: string \| null\n\s*topic\?: string\n\s*note_content\?: string\n\s*difficulty_reflection\?: string \| null\n\s*created_at\?: string\n\s*}\n\s*Relationships: \[\]\n\s*}\n\s*}\n\s*Views: {\n\s*\[key: string\]: never\n\s*}\n\s*Functions: {\n\s*\[key: string\]: never\n\s*}\n\s*Enums: {\n\s*\[key: string\]: never\n\s*}\n\s*CompositeTypes: {\n\s*\[key: string\]: never\n>>>>>>> Stashed changes/g,
    '          title?: string\n          content?: string\n          tags?: string[]\n          source_type?: string\n          source_id?: string | null\n          source_title?: string | null\n          is_pinned?: boolean\n          created_at?: string\n          updated_at?: string\n        }\n      }\n    }\n    Views: {\n      [key: string]: never\n    }\n    Functions: {\n      [key: string]: never\n    }\n    Enums: {\n      [key: string]: never\n    }\n    CompositeTypes: {\n      [key: string]: never');

  fs.writeFileSync(p, content);
}
