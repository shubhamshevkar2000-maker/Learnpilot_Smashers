const fs = require('fs');
let text = fs.readFileSync('lib/generator/content-registry.ts', 'utf8');

let out = '';
let inString = false;
let escapeNext = false;

for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (escapeNext) {
        out += char;
        escapeNext = false;
        continue;
    }
    
    if (char === '\\') {
        out += char;
        escapeNext = true;
        continue;
    }
    
    if (char === '"') {
        inString = !inString;
        out += char;
        continue;
    }
    
    if (char === '\n' && inString) {
        out += '\\n';
        continue;
    }
    
    out += char;
}

fs.writeFileSync('lib/generator/content-registry.ts', out);
console.log('Fixed newlines inside strings!');
