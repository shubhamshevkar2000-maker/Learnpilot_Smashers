const fs = require('fs');
// Transpile typescript files on the fly if needed, or we can just parse the JSON representation if we have it.

// Transpile typescript files on the fly if needed, or we can just parse the JSON representation if we have it.
// Actually, let's use a regex to parse the TS file for a quick count.
const curriculumContent = fs.readFileSync('lib/generator/curriculum-registry.ts', 'utf8');
const contentRegistryContent = fs.readFileSync('lib/generator/content-registry.ts', 'utf8');

// Find all contentId: "..." in curriculum
const contentIdRegex = /contentId:\s*["']([^"']+)["']/g;
let match;
const curriculumContentIds = [];
while ((match = contentIdRegex.exec(curriculumContent)) !== null) {
  curriculumContentIds.push(match[1]);
}

// Find all keys in CONTENT_REGISTRY
const registryKeyRegex = /["']?([^"'\s]+)["']?:\s*\{\s*title:/g;
const registryKeys = [];
let match2;
while ((match2 = registryKeyRegex.exec(contentRegistryContent)) !== null) {
  registryKeys.push(match2[1]);
}
// wait, keys could be defined differently. 
// Let's count them properly by looking at how many items are in the CONTENT_REGISTRY object
const totalActivitiesMatch = curriculumContent.match(/title:/g);
const totalActivities = totalActivitiesMatch ? totalActivitiesMatch.length - 14 : 0; // rough heuristic

console.log("Total activities with contentId:", curriculumContentIds.length);
let valid = 0;
let missing = 0;
curriculumContentIds.forEach(id => {
  if (contentRegistryContent.includes(`"${id}": {`) || contentRegistryContent.includes(`'${id}': {`) || contentRegistryContent.includes(`${id}: {`)) {
    valid++;
  } else {
    missing++;
  }
});
console.log("Valid CONTENT_REGISTRY matches:", valid);
console.log("Missing content entries:", missing);
