const fs = require('fs');

const p = 'lib/services/courses-service.ts';
let c = fs.readFileSync(p, 'utf8');

const markerOurs = '<<<<<<< ours\n';
const markerMid = '=======\n';
const markerTheirs = '>>>>>>> theirs\n';

let chunks = c.split(markerOurs);
if (chunks.length > 1) {
  let resolved = chunks[0];
  for (let i = 1; i < chunks.length; i++) {
    let midSplit = chunks[i].split(markerMid);
    let oursPart = midSplit[0];
    let theirsSplit = midSplit[1].split(markerTheirs);
    let theirsPart = theirsSplit[0];
    let afterPart = theirsSplit[1];

    if (i === 1) {
      // Conflict 1: Course interface
      resolved += oursPart + afterPart;
    } else if (i === 2) {
      // Conflict 2: Hardcoded courses
      resolved += oursPart + afterPart;
    } else if (i === 3) {
      // Conflict 3: getPersonalizedCourses etc.
      // We will keep both
      resolved += oursPart + theirsPart + afterPart;
    }
  }
  
  // Also fix the lesson_type vs activity_type issue in the hardcoded courses
  resolved = resolved.replace(/lesson_type:/g, 'activity_type:');
  
  fs.writeFileSync(p, resolved);
}
