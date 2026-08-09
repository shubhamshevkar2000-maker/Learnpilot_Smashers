const fs = require('fs');
const path = require('path');

const PAGES = [
  'app/dashboard/page.tsx',
  'app/journey/page.tsx',
  'app/path/page.tsx',
  'app/progress/page.tsx',
  'app/settings/page.tsx',
  'app/ai-coach/page.tsx',
  'app/assessments/page.tsx',
  'app/notes/page.tsx',
];

for (const p of PAGES) {
  const filePath = path.join(__dirname, p);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has AppShell
  if (content.includes('AppShell')) {
    console.log(`Skipping ${p}, already has AppShell`);
    continue;
  }

  // 1. Remove NAV_ITEMS array
  content = content.replace(/const NAV_ITEMS = \[\s*([\s\S]*?)\]/m, '');

  // 2. Remove mobileMenuOpen state
  content = content.replace(/const \[mobileMenuOpen, setMobileMenuOpen\] = useState\(false\)\n?/, '');

  // 3. Import AppShell and PageHeader
  if (!content.includes('import { AppShell }')) {
    content = content.replace(/import { ThemeToggle } from "@\/components\/theme-toggle"/, 
      `import { AppShell } from "@/components/layout/app-shell"\nimport { PageHeader } from "@/components/layout/page-header"`);
  }

  // 4. Remove unused imports (LogOut, Menu, X, ThemeToggle)
  content = content.replace(/ThemeToggle/g, '/*ThemeToggle*/'); // Temporary hide
  content = content.replace(/LogOut,\s*/g, '');
  content = content.replace(/Menu,\s*/g, '');
  content = content.replace(/X,\s*/g, '');
  content = content.replace(/,\s*Menu\s*}/g, '}');
  content = content.replace(/,\s*X\s*}/g, '}');

  // 5. Find the <aside> block and everything around it up to <main
  const asideRegex = /<div className="flex min-h-screen[^>]*>[\s\S]*?<aside[\s\S]*?<\/aside>\s*<main[^>]*>(\s*<div[^>]*>)?[\s\S]*?<header[^>]*>\s*<h1[^>]*>(.*?)<\/h1>\s*<p[^>]*>(.*?)<\/p>\s*<\/header>/;
  
  const match = content.match(asideRegex);
  if (match) {
    const title = match[2];
    const desc = match[3];
    
    let maxWidth = "1280px";
    if (p.includes('journey') || p.includes('path') || p.includes('settings')) maxWidth = "1100px";
    if (p.includes('assessments') || p.includes('ai-coach') || p.includes('notes')) maxWidth = "900px";

    const replacement = `<AppShell maxWidth="${maxWidth}">\n      <div className="space-y-8">\n        <PageHeader title="${title}" description="${desc}" />`;
    
    content = content.replace(asideRegex, replacement);
    
    // Replace the trailing closing tags
    // Usually it's `</div>\n      </main>\n    </div>`
    content = content.replace(/<\/main>\s*<\/div>\s*\)\s*}\s*$/, '</AppShell>\n  )\n}\n');
    content = content.replace(/<\/div>\s*<\/main>\s*<\/div>\s*\)\s*}\s*$/, '</div>\n    </AppShell>\n  )\n}\n');
    
    fs.writeFileSync(filePath, content);
    console.log(`Successfully refactored ${p}`);
  } else {
    console.log(`Regex did not match for ${p}. Manual intervention required.`);
  }
}
