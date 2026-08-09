const fs = require('fs');
const files = [
  'app/ai-coach/page.tsx',
  'app/assessments/page.tsx',
  'app/progress/page.tsx',
  'app/path/page.tsx',
  'app/journey/page.tsx',
  'app/dashboard/page.tsx',
  'app/courses/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/{ id: "ai-coach", label: "AI Coach", icon: ([^,]+), href: "(?:#|\/ai-coach)"(.*?) }/g, '{ id: "ai-coach", label: "AI Coach", icon: $1, href: "/ai-coach"$2 }');
    content = content.replace(/{ id: "assessments", label: "Assessments", icon: ([^,]+), href: "(?:#|\/assessments)"(.*?) }/g, '{ id: "assessments", label: "Assessments", icon: $1, href: "/assessments"$2 }');
    content = content.replace(/{ id: "progress", label: "Progress", icon: ([^,]+), href: "(?:#|\/progress)"(.*?) }/g, '{ id: "progress", label: "Progress", icon: $1, href: "/progress"$2 }');
    content = content.replace(/{ id: "courses", label: "Courses", icon: ([^,]+), href: "(?:#|\/courses)"(.*?) }/g, '{ id: "courses", label: "Courses", icon: $1, href: "/courses"$2 }');
    fs.writeFileSync(file, content, 'utf8');
    console.log("Updated", file);
  }
});
