const fs = require('fs');

let content = fs.readFileSync('lib/generator/curriculum-registry.ts', 'utf8');

// Update ActivityTemplate interface
content = content.replace(
  /export interface ActivityTemplate {[\s\S]*?}/,
  `export interface ActivityTemplate {
  title: string
  activity_type: ActivityType
  estimated_minutes: number
  learning_objective: string
  is_interview_prep?: boolean
  is_architecture?: boolean
  is_production?: boolean
  contentId?: string
}`
);

// We will do some string replacements for specific activities based on exact matches
const replacements = [
  ['title: "HTML5 Document Structure & Page Syntax"', 'title: "HTML5 Document Structure & Page Syntax", contentId: "html-css-l1"'],
  ['title: "Semantic HTML5 Elements & Content Outlining"', 'title: "Semantic HTML5 Elements & Content Outlining", contentId: "html-css-l2"'],
  ['title: "CSS Selectors, Box Model & Spacing Rules"', 'title: "CSS Selectors, Box Model & Spacing Rules", contentId: "html-css-l3"'],
  ['title: "CSS Flexbox One-Dimensional Layout Architecture"', 'title: "CSS Flexbox One-Dimensional Layout Architecture", contentId: "html-css-l4"'],
  ['title: "Responsive Layout Capstone Project"', 'title: "Responsive Layout Capstone Project", contentId: "html-css-l6"'],
  
  ['title: "ES6+ Syntax Essentials, Let/Const & Arrow Functions"', 'title: "ES6+ Syntax Essentials, Let/Const & Arrow Functions", contentId: "js-fund-l1"'],
  ['title: "Variable Scope, Execution Context & Closures"', 'title: "Variable Scope, Execution Context & Closures", contentId: "js-fund-l2"'],
  ['title: "DOM Node Selection & Event Listeners"', 'title: "DOM Node Selection & Event Listeners", contentId: "js-fund-l3"'],
  
  ['title: "Promises, Chaining & Error Handling"', 'title: "Promises, Chaining & Error Handling", contentId: "js-fund-l4"'],
  ['title: "Fetch API & Remote HTTP Data Operations"', 'title: "Fetch API & Remote HTTP Data Operations", contentId: "js-fund-l5"'],
  ['title: "Async Web Application Project"', 'title: "Async Web Application Project", contentId: "js-fund-l6"'],
  
  ['title: "JSX Syntax & Component Declarations"', 'title: "JSX Syntax & Component Declarations", contentId: "react-l1"'],
  ['title: "Props, Data Flow & Immutability"', 'title: "Props, Data Flow & Immutability", contentId: "react-l2"'],
  ['title: "Local State Management with useState"', 'title: "Local State Management with useState", contentId: "react-l3"'],
  ['title: "Side Effects & the useEffect Lifecycle"', 'title: "Side Effects & the useEffect Lifecycle", contentId: "react-l4"'],
  ['title: "React State & Props Capstone Project"', 'title: "React State & Props Capstone Project", contentId: "react-l5"']
];

for (const [search, replace] of replacements) {
  content = content.replace(search, replace);
}

fs.writeFileSync('lib/generator/curriculum-registry.ts', content, 'utf8');
console.log("Updated curriculum-registry.ts");
