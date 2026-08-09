const fs = require('fs');
const lines = fs.readFileSync('lib/generator/content-registry.ts', 'utf8').split('\n');

let newLines = [];
let buffer = '';
let insideCodeExample = false;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    if (!insideCodeExample && (line.includes('"code_example": "') || line.includes('"concept_guide": "') || line.includes('"practical_exercise": "') || line.includes('"objective": "'))) {
        let keyEndIndex = line.indexOf('": "') + 4;
        let afterQuote = line.substring(keyEndIndex);
        if (!afterQuote.endsWith('",') && !afterQuote.endsWith('"')) {
            insideCodeExample = true;
            buffer = line + '\\n';
            continue;
        }
    }
    
    if (insideCodeExample) {
        if (line.endsWith('",') || line.endsWith('"')) {
            insideCodeExample = false;
            buffer += line;
            newLines.push(buffer);
            buffer = '';
        } else {
            buffer += line + '\\n';
        }
    } else {
        newLines.push(line);
    }
}

fs.writeFileSync('lib/generator/content-registry.ts', newLines.join('\n'));
console.log('Fixed multiline strings!');
