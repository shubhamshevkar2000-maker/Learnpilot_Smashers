git show HEAD:types/database.types.ts > types/database.types.ts
git show HEAD:lib/services/notes-service.ts > lib/services/notes-service.ts
git show HEAD:app/path/page.tsx > app/path/page.tsx
git show HEAD:app/ai-coach/page.tsx > app/ai-coach/page.tsx
git show HEAD:app/journey/page.tsx > app/journey/page.tsx
git show HEAD:lib/generator/plan-generator.ts > lib/generator/plan-generator.ts
git show HEAD:lib/services/courses-service.ts > lib/services/courses-service.ts

git show stash@{0}:app/assessments/page.tsx > app/assessments/page.tsx
git show stash@{0}:app/courses/page.tsx > app/courses/page.tsx
git show stash@{0}:app/progress/page.tsx > app/progress/page.tsx

echo "Clean extraction complete."
