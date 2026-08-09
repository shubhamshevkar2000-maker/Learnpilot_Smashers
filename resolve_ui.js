const fs = require('fs');
const files = [
  'app/ai-coach/page.tsx', 'app/assessments/page.tsx', 'app/courses/page.tsx',
  'app/journey/page.tsx', 'app/progress/page.tsx', 
];

for (let path of files) {
  let c = fs.readFileSync(path, 'utf8');
  c = c.replace(/<<<<<<< ours\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> theirs\n?/g, (match, ours, theirs) => {
    if (ours.includes('href: "/notes"') || ours.includes('href: "/settings"')) {
      return ours;
    }
    return theirs;
  });
  fs.writeFileSync(path, c);
}
console.log("UI resolved");
