const fs = require('fs');

let content = fs.readFileSync('app/courses/page.tsx', 'utf8');

// 1. Imports
content = content.replace(
  /import \{\n  getStandaloneCourses,\n  getUserCompletedCourseLessons,\n  completeCourseLesson,\n  type Course,\n  type CourseLesson,\n  type CourseLessonType,\n\} from "@\/lib\/services\/courses-service"/,
  `import {
  getPersonalizedCourses,
  completeCourseLesson,
  type Course,
  type CourseLesson,
  type CourseLessonType,
} from "@/lib/services/courses-service"`
);

// 2. Remove states we don't need
content = content.replace(
  /const \[activePathModules, setActivePathModules\] = useState<string\[\]>\(\[\]\)\n  const \[completedLessonIds, setCompletedLessonIds\] = useState<string\[\]>\(\[\]\)/,
  `const [coursesCatalog, setCoursesCatalog] = useState<Course[]>([])`
);

// 3. Update loadCoursesData
content = content.replace(
  /      \/\/ Fetch active learning path modules for recommendation signal \(read-only\)\n      const pathData = await getActiveCurriculumFoundation\(supabase, user\.id\)\n      if \(pathData && pathData\.modules\) \{\n        setActivePathModules\(pathData\.modules\.map\(\(m\) => m\.title\)\)\n      \}\n\n      \/\/ Fetch user's completed course lessons independently\n      const completions = await getUserCompletedCourseLessons\(supabase, user\.id\)\n      setCompletedLessonIds\(completions\)/,
  `      // Fetch active learning path and populate personalized courses
      const pathData = await getActiveCurriculumFoundation(supabase, user.id)
      if (pathData && pathData.modules) {
        setCoursesCatalog(getPersonalizedCourses(pathData))
      }`
);

// 4. Remove the old coursesCatalog useMemo
content = content.replace(
  /  \/\/ Derive Standalone Courses Catalog\n  const coursesCatalog: Course\[\] = useMemo\(\(\) => \{\n    const rawCatalog = getStandaloneCourses\(profile\?\.learning_goal \|\| "Web Development", activePathModules\)\n    \n    return rawCatalog\.map\(\(course\) => \(\{\n      \.\.\.course,\n      lessons: course\.lessons\.map\(\(lesson\) => \(\{\n        \.\.\.lesson,\n        is_completed: completedLessonIds\.includes\(lesson\.id\),\n      \}\)\),\n    \}\)\)\n  \}, \[profile, activePathModules, completedLessonIds\]\)\n/,
  ``
);

// 5. Update completeCourseLesson handler
content = content.replace(
  /        setCompletedLessonIds\(\(prev\) => \(prev\.includes\(lessonId\) \? prev : \[\.\.\.prev, lessonId\]\)\)/,
  `        setCoursesCatalog(prev => prev.map(c => c.id === courseId ? { ...c, lessons: c.lessons.map(l => l.id === lessonId ? { ...l, is_completed: true } : l) } : c))`
);

fs.writeFileSync('app/courses/page.tsx', content, 'utf8');
console.log("Updated app/courses/page.tsx");
