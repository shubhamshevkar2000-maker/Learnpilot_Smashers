import fs from 'fs';
import path from 'path';

// 1. Load curriculum-registry.ts
const currRegPath = path.resolve('lib/generator/curriculum-registry.ts');
let currRegStr = fs.readFileSync(currRegPath, 'utf8');

// 2. Load content-registry.ts
const contRegPath = path.resolve('lib/generator/content-registry.ts');
let contRegStr = fs.readFileSync(contRegPath, 'utf8');

// Use regex to find activities without contentId
let counter = 1;
let newContents = [];

currRegStr = currRegStr.replace(/\{\s*title:\s*"([^"]+)",([^}]+)\}/g, (match, title, rest) => {
  if (match.includes("contentId:")) {
    return match; // already has content
  }
  
  // Need to assign a content ID
  const newContentId = `auto-gen-${counter++}`;
  
  // Create a new content payload
  let type = "concept";
  if (rest.includes('activity_type: "exercise"')) type = "exercise";
  if (rest.includes('activity_type: "project"')) type = "project";
  if (rest.includes('activity_type: "reflection"')) type = "reflection";

  const objectiveMatch = rest.match(/learning_objective:\s*"([^"]+)"/);
  const objective = objectiveMatch ? objectiveMatch[1] : "Complete this activity.";

  newContents.push(`  "${newContentId}": {
      "id": "${newContentId}",
      "title": "${title}",
      "type": "${type}",
      "objective": "${objective}",
      "concept_guide": "This is an auto-generated content block for ${title}. In a production environment, this would contain rich educational material.",
      "practical_exercise": "Apply what you have learned about ${title}.",
      "checkpoint_question": "Did you understand the core concepts of ${title}?",
      "checkpoint_options": [
          "Yes",
          "No"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Great job completing this module activity!",
      "topic": "General Context",
      "difficulty": "Adaptive"
  }`);

  // Insert contentId before activity_type or at the end
  return match.replace(/activity_type:/, `contentId: "${newContentId}", activity_type:`);
});

// Update curriculum-registry.ts
fs.writeFileSync(currRegPath, currRegStr, 'utf8');

// Append new contents to content-registry.ts
const lastBraceIndex = contRegStr.lastIndexOf('}');
if (newContents.length > 0) {
  // Ensure the last item has a comma
  const beforeBrace = contRegStr.substring(0, lastBraceIndex).trim();
  let modifiedBeforeBrace = beforeBrace;
  if (!modifiedBeforeBrace.endsWith(',')) {
     modifiedBeforeBrace += ',';
  }
  
  const newContentStr = '\n' + newContents.join(',\n') + '\n}';
  const finalContRegStr = modifiedBeforeBrace + newContentStr;
  fs.writeFileSync(contRegPath, finalContRegStr, 'utf8');
  console.log(`Added ${newContents.length} new content items.`);
} else {
  console.log("No new content items needed.");
}
