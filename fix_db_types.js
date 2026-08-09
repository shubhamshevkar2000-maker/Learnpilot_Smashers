const fs = require('fs');

let content = fs.readFileSync('types/database.types.ts', 'utf8');

// We need to add Relationships: [] to the end of each table definition.
// A table looks like:
//       table_name: {
//         Row: { ... }
//         Insert: { ... }
//         Update: { ... }
//       }
// We want to add Relationships: [] after Update.

content = content.replace(/Update: \{[\s\S]*?\n        \}/g, match => {
  return match + '\n        Relationships: []';
});

fs.writeFileSync('types/database.types.ts', content, 'utf8');
console.log("Added Relationships: [] to database.types.ts");
