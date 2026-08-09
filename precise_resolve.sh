#!/bin/bash
set -e

# Take Phase 3.5 (stash) for these files
git checkout stash@{0} -- app/path/page.tsx
git checkout stash@{0} -- app/journey/page.tsx
git checkout stash@{0} -- app/dashboard/page.tsx 2>/dev/null || true
git checkout stash@{0} -- lib/services/curriculum-service.ts
git checkout stash@{0} -- app/ai-coach/page.tsx 2>/dev/null || true
git checkout stash@{0} -- app/assessments/page.tsx 2>/dev/null || true
git checkout stash@{0} -- app/progress/page.tsx 2>/dev/null || true
git checkout stash@{0} -- app/courses/page.tsx 2>/dev/null || true

# Take Main (HEAD) for these files
git checkout HEAD -- lib/services/notes-service.ts
git checkout HEAD -- lib/services/courses-service.ts

# For types/database.types.ts, take Main (HEAD) and then inject Phase 3.5 fields
git checkout HEAD -- types/database.types.ts
node -e "
const fs = require('fs');
let c = fs.readFileSync('types/database.types.ts', 'utf8');
c = c.replace(/content_id: string \| null\n        }/g, 'content_id: string | null\n          estimated_minutes?: number\n        }');
c = c.replace(/content_id\?: string \| null\n        }/g, 'content_id?: string | null\n          estimated_minutes?: number\n        }');
c = c.replace(/sequence_order\?: number\n          estimated_minutes\?: number \| null/g, 'sequence_order?: number\n          estimated_minutes?: number | null');
fs.writeFileSync('types/database.types.ts', c);
"

# For lib/generator/plan-generator.ts, take stash (Phase 3.5) and just ensure content_id is there
git checkout stash@{0} -- lib/generator/plan-generator.ts
node -e "
const fs = require('fs');
let c = fs.readFileSync('lib/generator/plan-generator.ts', 'utf8');
c = c.replace(/day_number: number\n}/g, 'day_number: number\n  content_id?: string\n}');
fs.writeFileSync('lib/generator/plan-generator.ts', c);
"

git add .
npx tsc --noEmit
