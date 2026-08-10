import type { AssessmentQuestion } from "@/types/assessment"

// Deterministic question bank mapped by granular domain / module keywords.
// Features deep, challenging, level-appropriate questions across 8 diverse formats.

export const QUESTION_BANK: Record<string, Omit<AssessmentQuestion, "id">[]> = {
  // ---------------------------------------------------------
  // 1. HTML5 & WEB FUNDAMENTALS (mod-html-css-basics)
  // ---------------------------------------------------------
  "html": [
    {
      question: "You are architecting a modern news publication article page. Which HTML5 structural hierarchy maximizes both accessibility tree semantics and SEO indexing?",
      options: [
        { id: "a", text: "<main> enclosing a single <article> with internal <header>, <section> chunks, and <aside> for related stories." },
        { id: "b", text: "<div id=\"main\"> with nested <section> tags and <div> containers for styling." },
        { id: "c", text: "<section> enclosing multiple <main> elements for each content paragraph." },
        { id: "d", text: "<body> containing directly rendered <div> and <span> tags with ARIA roles." },
      ],
      correct_answer_id: "a",
      explanation: "<main> declares the primary unique document landmark, while <article> encapsulates independent distributable content with semantic header/section/aside sub-regions.",
      topic: "HTML5 Semantics & a11y",
      difficulty: "intermediate",
      questionType: "mcq"
    },
    {
      question: "In the browser's Critical Rendering Path, what is the exact execution and parsing behavior of `<script defer src=\"...\">` versus `<script async src=\"...\">`?",
      options: [
        { id: "a", text: "`defer` downloads in parallel and executes strictly in document order after HTML parsing completes; `async` downloads in parallel and executes immediately upon download, interrupting HTML parsing." },
        { id: "b", text: "`async` executes only after DOMContentLoaded fires, whereas `defer` blocks initial paint." },
        { id: "c", text: "Both attributes behave identically in HTTP/2." },
        { id: "d", text: "`defer` pauses network requests until CSSOM is constructed." },
      ],
      correct_answer_id: "a",
      explanation: "`defer` scripts are fetched asynchronously and run in sequential order when HTML parsing finishes. `async` scripts execute as soon as they are loaded, potentially out-of-order and interrupting DOM construction.",
      topic: "Browser Rendering Pipeline",
      difficulty: "advanced",
      questionType: "mcq"
    },
    {
      question: "What will the browser submit for the form payload in this snippet when the user clicks 'Save'?",
      codeSnippet: "<form action=\"/api/profile\" method=\"POST\">\n  <input type=\"text\" value=\"Alex\" />\n  <input type=\"text\" name=\"role\" value=\"Engineer\" />\n  <input type=\"text\" name=\"status\" value=\"Active\" disabled />\n  <button type=\"submit\">Save</button>\n</form>",
      options: [
        { id: "a", text: "role=Engineer&status=Active" },
        { id: "b", text: "role=Engineer" },
        { id: "c", text: "Alex&role=Engineer&status=Active" },
        { id: "d", text: "status=Active" }
      ],
      correct_answer_id: "b",
      explanation: "Inputs without a `name` attribute are not successful form controls and are omitted. Inputs with the `disabled` attribute are also omitted from form submissions.",
      topic: "HTML Forms Specification",
      difficulty: "intermediate",
      questionType: "code_output"
    },
    {
      question: "Identify why screen readers fail to announce error states dynamically in this form validation markup:",
      codeSnippet: "<input id=\"email\" type=\"email\" class=\"border-red-500\" />\n<span class=\"error-text\">Please enter a valid work email</span>",
      options: [
        { id: "a", text: "The input lacks `aria-invalid=\"true\"` and `aria-describedby` referencing the error message element id." },
        { id: "b", text: "The span tag must be replaced with a <p> tag." },
        { id: "c", text: "The input type cannot be email." },
        { id: "d", text: "The input requires a tabindex of -1." }
      ],
      correct_answer_id: "a",
      explanation: "Assistive technologies require `aria-invalid=\"true\"` to communicate error status and `aria-describedby=\"error-id\"` to associate the error description with the input.",
      topic: "Web Accessibility (a11y)",
      difficulty: "advanced",
      questionType: "debugging"
    },
    {
      question: "Which of the following practices are essential for achieving WCAG 2.1 AA Web Accessibility compliance? (Select all that apply)",
      options: [
        { id: "a", text: "Ensuring normal text has at least a 4.5:1 contrast ratio against its background." },
        { id: "b", text: "Providing meaningful text alternatives via `alt` attributes for non-decorative images." },
        { id: "c", text: "Enabling complete keyboard navigability (visible focus indicators, no keyboard traps)." },
        { id: "d", text: "Removing outline styles with `outline: none` without providing an alternative focus indicator." }
      ],
      multiple_correct_ids: ["a", "b", "c"],
      explanation: "Contrast ratios (>= 4.5:1), image alt descriptions, and full keyboard operability are core WCAG AA guidelines. Removing outlines without replacement violates accessibility.",
      topic: "Web Accessibility (a11y)",
      difficulty: "intermediate",
      questionType: "multiple_select"
    },
    {
      question: "An e-commerce site replaces standard clickable `<button>` and `<a>` elements with styled `<div onclick=\"...\">` for custom animations. What critical operational defect does this introduce?",
      options: [
        { id: "a", text: "Divs lack keyboard accessibility (Tab focus and Enter/Space actuation) and native ARIA roles, breaking navigation for keyboard and screen-reader users." },
        { id: "b", text: "Divs cannot trigger HTTP POST requests." },
        { id: "c", text: "Divs cause the GPU compositing engine to crash." },
        { id: "d", text: "Divs disable CSS Transitions." }
      ],
      correct_answer_id: "a",
      explanation: "Native interactive elements have built-in focusability, keyboard event handling, and accessibility tree semantics that generic div containers completely lack.",
      topic: "Web Accessibility (a11y)",
      difficulty: "intermediate",
      questionType: "scenario"
    },
    {
      question: "Adding `rel=\"noopener noreferrer\"` to external target links (`target=\"_blank\"`) prevents the newly opened page from accessing `window.opener` and mitigates reverse tab-nabbing security exploits.",
      options: [
        { id: "true", text: "True" },
        { id: "false", text: "False" }
      ],
      correct_answer_id: "true",
      explanation: "`noopener` prevents the target page from obtaining a reference to the originating window (`window.opener = null`), protecting users against malicious redirects.",
      topic: "Web Security",
      difficulty: "intermediate",
      questionType: "true_false"
    },
    {
      question: "When structuring an SPA vs Multi-Page HTML document, what is the architectural trade-off between Server-Side Rendered (SSR) HTML and Client-Side Rendered (CSR) DOM generation regarding First Contentful Paint (FCP) and Time to Interactive (TTI)?",
      options: [
        { id: "a", text: "SSR delivers fully parsed HTML immediately improving FCP and SEO, but can increase TTI until client-side hydration completes; CSR has slower initial FCP but zero hydration mismatch risk." },
        { id: "b", text: "CSR always renders faster than SSR because it avoids network requests." },
        { id: "c", text: "SSR eliminates the need for JavaScript entirely." },
        { id: "d", text: "There is no difference in rendering performance." }
      ],
      correct_answer_id: "a",
      explanation: "SSR provides immediate visual DOM markup (fast FCP and optimal SEO indexing), but interactive events may lag until client hydration finishes, defining the classic SSR vs CSR trade-off.",
      topic: "Web Architecture",
      difficulty: "advanced",
      questionType: "scenario"
    },
    {
      question: "Write a JavaScript function `slugifyTitle` that transforms an arbitrary article title string into a clean, lowercase URL slug (replacing spaces with hyphens, removing non-alphanumeric chars, and trimming).",
      language: "javascript",
      starterCode: "function slugifyTitle(title) {\n  // your code here\n}",
      testCases: [
        { input: "slugifyTitle('Web Fundamentals & HTML5!')", expected: "'web-fundamentals-html5'" },
        { input: "slugifyTitle('  CSS Box Model 101  ')", expected: "'css-box-model-101'" }
      ],
      expectedBehavior: "Return a lowercase, hyphenated slug without punctuation or leading/trailing dashes.",
      hints: ["Use .toLowerCase().trim()", "Use regex to replace non-alphanumerics and collapse multiple hyphens."],
      explanation: "Proper URL slug generation is essential for semantic, SEO-friendly routing.",
      topic: "Web Fundamentals",
      difficulty: "intermediate",
      questionType: "code_write"
    },
    {
      question: "Explain the purpose of Document Object Model (DOM) and how the browser constructs the Render Tree from the DOM and CSSOM.",
      selfReviewCriteria: [
        "Mentioned HTML parser generating DOM nodes from raw bytes/tokens.",
        "Mentioned CSS parser constructing CSSOM rules.",
        "Explained that the Render Tree combines DOM and CSSOM, excluding invisible nodes (e.g. display: none, <head>).",
        "Explained subsequent Layout (reflow) and Paint stages."
      ],
      topic: "Browser Architecture",
      difficulty: "intermediate",
      questionType: "short_answer"
    }
  ],

  // ---------------------------------------------------------
  // 2. CSS LAYOUTS & RESPONSIVE DESIGN (mod-html-css-basics)
  // ---------------------------------------------------------
  "css": [
    {
      question: "In the CSS Box Model, when `box-sizing: border-box` is applied, which box layers are included within the declared `width` and `height` dimensions?",
      options: [
        { id: "a", text: "Content, Padding, and Border (Margin is added outside)." },
        { id: "b", text: "Content only (Padding, Border, and Margin are added outside)." },
        { id: "c", text: "Content and Margin only." },
        { id: "d", text: "Content, Padding, Border, and Margin." }
      ],
      correct_answer_id: "a",
      explanation: "`border-box` contains content + padding + border inside the specified width/height, making layout arithmetic predictable.",
      topic: "CSS Box Model",
      difficulty: "beginner",
      questionType: "mcq"
    },
    {
      question: "Which CSS layout mechanism is designed for two-dimensional content placement (controlling rows and columns simultaneously) with explicit track sizing?",
      options: [
        { id: "a", text: "CSS Grid Layout" },
        { id: "b", text: "CSS Flexbox" },
        { id: "c", text: "CSS Multi-Column Layout" },
        { id: "d", text: "Absolute Positioning" }
      ],
      correct_answer_id: "a",
      explanation: "CSS Grid is inherently 2D (rows + columns), whereas Flexbox is designed primarily for 1D distribution along a single main axis.",
      topic: "CSS Grid",
      difficulty: "intermediate",
      questionType: "mcq"
    },
    {
      question: "What is the calculated computed width of `.child` in this layout scenario?",
      codeSnippet: ".parent {\n  width: 400px;\n  padding: 20px;\n  box-sizing: border-box;\n}\n.child {\n  width: 50%;\n  padding: 10px;\n  box-sizing: content-box;\n}",
      options: [
        { id: "a", text: "200px total (180px content + 20px padding)" },
        { id: "b", text: "180px content + 20px padding = 200px total rendered width" },
        { id: "c", text: "220px total" },
        { id: "d", text: "160px total" }
      ],
      correct_answer_id: "b",
      explanation: "Parent content box is 400px - 40px (padding) = 360px. Child's 50% width is 180px content. With content-box, child's 20px total horizontal padding makes its rendered width 200px.",
      topic: "CSS Box Model & Calculation",
      difficulty: "advanced",
      questionType: "code_output"
    },
    {
      question: "A developer notices that an image in a Flexbox container is stretching vertically and distorting its aspect ratio. What property must be applied to the image or flex container to fix this bug?",
      codeSnippet: ".flex-container {\n  display: flex;\n}\n.flex-container img {\n  /* missing property */\n}",
      options: [
        { id: "a", text: "align-self: flex-start; (or align-items: center on container) to override default `align-items: stretch`." },
        { id: "b", text: "flex-grow: 1;" },
        { id: "c", text: "position: relative;" },
        { id: "d", text: "display: block;" }
      ],
      correct_answer_id: "a",
      explanation: "Flex containers default to `align-items: stretch`, causing cross-axis stretching unless `align-items` or `align-self` is set to `flex-start`, `center`, or `object-fit: cover` is added.",
      topic: "Flexbox Debugging",
      difficulty: "intermediate",
      questionType: "debugging"
    },
    {
      question: "Which of the following CSS selectors will select all `<input>` elements with a type of 'text' that are currently disabled? (Select all that apply)",
      options: [
        { id: "a", text: "input[type=\"text\"]:disabled" },
        { id: "b", text: "input:disabled[type=\"text\"]" },
        { id: "c", text: "input[type=\"text\"][disabled]" },
        { id: "d", text: "input.text:disabled" }
      ],
      multiple_correct_ids: ["a", "b", "c"],
      explanation: "Attribute selectors combined with pseudo-class `:disabled` or attribute check `[disabled]` match disabled text inputs.",
      topic: "CSS Selectors",
      difficulty: "intermediate",
      questionType: "multiple_select"
    },
    {
      question: "You need to implement a complex dashboard widget where cards re-order dynamically based on container size, but the widget can be placed in either a narrow 300px sidebar or an 800px main column. Why should you use CSS `@container` queries instead of `@media` queries?",
      options: [
        { id: "a", text: "Container queries query the dimensional constraints of the direct parent container rather than the global viewport width, allowing true component encapsulation." },
        { id: "b", text: "Container queries execute faster in the JavaScript thread." },
        { id: "c", text: "Media queries cannot read pixel units." },
        { id: "d", text: "Container queries eliminate the CSS cascade." }
      ],
      correct_answer_id: "a",
      explanation: "Container queries enable modular, context-aware component styling based on parent container dimensions rather than viewport bounds.",
      topic: "Responsive Architecture",
      difficulty: "advanced",
      questionType: "scenario"
    },
    {
      question: "The CSS declaration `transform: translate3d(0, 0, 0)` or `will-change: transform` can promote an element to its own GPU compositing layer, reducing CPU layout reflows during animations.",
      options: [
        { id: "true", text: "True" },
        { id: "false", text: "False" }
      ],
      correct_answer_id: "true",
      explanation: "Layer promotion isolates animated elements to GPU rendering textures, avoiding repeated reflow/repaint passes on main document layers.",
      topic: "CSS Performance",
      difficulty: "intermediate",
      questionType: "true_false"
    },
    {
      question: "When styling a large design system, what is the architectural trade-off between using TailwindCSS utility classes versus CSS Modules with BEM methodology?",
      options: [
        { id: "a", text: "Tailwind eliminates CSS bloat and naming fatigue via atomic purging, but couples styles to markup; CSS Modules provides scoped isolation and semantic separation at the cost of larger stylesheet footprints." },
        { id: "b", text: "CSS Modules executes only on the server." },
        { id: "c", text: "Tailwind requires Node.js runtime on the client browser." },
        { id: "d", text: "BEM is required for WebAssembly integration." }
      ],
      correct_answer_id: "a",
      explanation: "Atomic CSS (Tailwind) limits CSS bundle growth and accelerates prototyping, while CSS Modules encapsulates styles cleanly in separate files with semantic naming.",
      topic: "CSS Architecture",
      difficulty: "advanced",
      questionType: "scenario"
    },
    {
      question: "Write a JavaScript function `calculateResponsiveColumns` that returns the number of columns (integer) for a CSS grid given a container width in pixels and a minimum column width.",
      language: "javascript",
      starterCode: "function calculateResponsiveColumns(containerWidth, minColWidth, gap = 16) {\n  // your code here\n}",
      testCases: [
        { input: "calculateResponsiveColumns(800, 200, 16)", expected: "3" },
        { input: "calculateResponsiveColumns(1200, 250, 20)", expected: "4" }
      ],
      expectedBehavior: "Calculate Math.floor((containerWidth + gap) / (minColWidth + gap)) with minimum 1 column.",
      hints: ["Remember grid gaps between columns.", "Return Math.max(1, Math.floor(...))."],
      explanation: "Mimics browser CSS Grid auto-fit column calculation math.",
      topic: "Layout Algorithms",
      difficulty: "intermediate",
      questionType: "code_write"
    },
    {
      question: "Explain the concept of CSS Specificity and describe how the browser resolves conflicting rules with matching specificity.",
      selfReviewCriteria: [
        "Explained the (Inline, ID, Class/Attribute/Pseudo-class, Element/Pseudo-element) specificity hierarchy.",
        "Explained that equal specificity resolves via source order (the latest declared rule wins).",
        "Mentioned the impact of !important and CSS Cascade layers (@layer)."
      ],
      topic: "CSS Cascade & Specificity",
      difficulty: "intermediate",
      questionType: "short_answer"
    }
  ],

  // ---------------------------------------------------------
  // 3. JAVASCRIPT CORE & SCOPE (mod-js-basics)
  // ---------------------------------------------------------
  "javascript": [
    {
      question: "How does the JavaScript engine handle variables declared with `var` versus `let` during the Execution Context Creation Phase?",
      options: [
        { id: "a", text: "`var` is hoisted and initialized with `undefined`; `let` is hoisted into the Temporal Dead Zone (TDZ) and remains uninitialized until its declaration is evaluated." },
        { id: "b", text: "`let` is not hoisted at all; `var` is hoisted to the global object only." },
        { id: "c", text: "`var` variables are block-scoped, while `let` variables are function-scoped." },
        { id: "d", text: "Both are initialized to `null` immediately." }
      ],
      correct_answer_id: "a",
      explanation: "`var` is hoisted and initialized to `undefined`. `let` and `const` are hoisted into lexical environments but cannot be accessed until initialization (TDZ), throwing a `ReferenceError` if accessed early.",
      topic: "JS Execution Context",
      difficulty: "intermediate",
      questionType: "mcq"
    },
    {
      question: "Which statement accurately describes how closures maintain access to outer lexical environment variables in memory?",
      options: [
        { id: "a", text: "The inner function retains an internal `[[Environment]]` reference to its outer Lexical Environment Record, preventing garbage collection of referenced variables." },
        { id: "b", text: "Closures clone the entire heap memory of the outer function." },
        { id: "c", text: "Closures serialize variables into JSON and store them in localStorage." },
        { id: "d", text: "Closures only work if the outer function was declared with the `async` keyword." }
      ],
      correct_answer_id: "a",
      explanation: "Functions in JS are closures holding a hidden `[[Environment]]` slot that points to their enclosing scope chain, keeping live references active.",
      topic: "JS Closures & Memory",
      difficulty: "advanced",
      questionType: "mcq"
    },
    {
      question: "What will this code output to the console?",
      codeSnippet: "for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\nfor (let j = 0; j < 3; j++) {\n  setTimeout(() => console.log(j), 0);\n}",
      options: [
        { id: "a", text: "3, 3, 3 followed by 0, 1, 2" },
        { id: "b", text: "0, 1, 2 followed by 0, 1, 2" },
        { id: "c", text: "3, 3, 3 followed by 3, 3, 3" },
        { id: "d", text: "0, 1, 2 followed by 3, 3, 3" }
      ],
      correct_answer_id: "a",
      explanation: "`var` shares a single function/global scope variable `i` that equals 3 when timers run. `let j` creates a fresh lexical binding per loop iteration, preserving 0, 1, 2.",
      topic: "JS Scoping & Event Loop",
      difficulty: "intermediate",
      questionType: "code_output"
    },
    {
      question: "Identify the bug causing unexpected state mutation in this shallow copy snippet:",
      codeSnippet: "const user = { name: 'Sarah', preferences: { theme: 'dark' } };\nconst updatedUser = { ...user };\nupdatedUser.preferences.theme = 'light';\nconsole.log(user.preferences.theme); // Logs 'light'!",
      options: [
        { id: "a", text: "Spread syntax `{ ...user }` only creates a shallow copy; nested object references (`preferences`) are shared between both instances." },
        { id: "b", text: "Object spread syntax is invalid in ES6+." },
        { id: "c", text: "Sarah is a reserved identifier." },
        { id: "d", text: "Const prevents any object modification." }
      ],
      correct_answer_id: "a",
      explanation: "Shallow copying copies property values by assignment. For nested objects, memory references are copied, meaning changes to nested fields mutate the original object. `structuredClone()` or nested spread is required.",
      topic: "JS Immutability & References",
      difficulty: "intermediate",
      questionType: "debugging"
    },
    {
      question: "Which of the following operations evaluate to `true` in JavaScript? (Select all that apply)",
      options: [
        { id: "a", text: "NaN !== NaN" },
        { id: "b", text: "Object.is(-0, +0) === false" },
        { id: "c", text: "typeof function() {} === 'function'" },
        { id: "d", text: "[] == false" }
      ],
      multiple_correct_ids: ["a", "b", "c", "d"],
      explanation: "In JS: `NaN !== NaN` is true; `Object.is(-0, +0)` is false; `typeof fn` is `'function'`; `[] == false` evaluates to true via type coercion.",
      topic: "JS Types & Equality",
      difficulty: "advanced",
      questionType: "multiple_select"
    },
    {
      question: "You are designing a high-throughput event logging library for a web app. Why is Event Delegation using a single listener on `document.body` preferred over attaching individual `click` listeners to 5,000 table row buttons?",
      options: [
        { id: "a", text: "Event delegation minimizes memory overhead and garbage collection by maintaining 1 listener and automatically handles dynamically inserted rows via event bubbling." },
        { id: "b", text: "Individual event listeners disable browser hardware acceleration." },
        { id: "c", text: "Event delegation executes synchronously before CSS is parsed." },
        { id: "d", text: "Event delegation prevents the user from clicking too fast." }
      ],
      correct_answer_id: "a",
      explanation: "Attaching thousands of listeners consumes considerable heap memory and requires manual cleanup. Event delegation leverages bubbling to handle all clicks centrally.",
      topic: "DOM Event Architecture",
      difficulty: "intermediate",
      questionType: "scenario"
    },
    {
      question: "Arrow functions cannot be used as constructors and calling them with the `new` operator throws a `TypeError` because they lack a `[[Construct]]` internal method and a `.prototype` property.",
      options: [
        { id: "true", text: "True" },
        { id: "false", text: "False" }
      ],
      correct_answer_id: "true",
      explanation: "Arrow functions are lightweight lexical functions designed without constructor capabilities (`[[Construct]]`) or prototype objects.",
      topic: "JS Function Internals",
      difficulty: "intermediate",
      questionType: "true_false"
    },
    {
      question: "When designing a JavaScript utility library, what are the architectural trade-offs between implementing functionality via Object Prototypes (modifying `Array.prototype`) versus Pure Higher-Order Utility Functions?",
      options: [
        { id: "a", text: "Prototype modification risks namespace collisions and breaks third-party script compatibility (monkey-patching); pure utility functions are tree-shakeable, immutable, and side-effect free." },
        { id: "b", text: "Prototype modification makes the code run 100x faster." },
        { id: "c", text: "Pure functions cannot be compiled by V8." },
        { id: "d", text: "There are no architectural trade-offs." }
      ],
      correct_answer_id: "a",
      explanation: "Polluting native prototypes causes severe interoperability and collision bugs. Pure composable functions enable tree-shaking and predictability.",
      topic: "JS Architecture & Design Patterns",
      difficulty: "advanced",
      questionType: "scenario"
    },
    {
      question: "Write a JavaScript function `groupBy` that takes an array of objects and a key name, and returns an object grouping items by that key's value.",
      language: "javascript",
      starterCode: "function groupBy(array, key) {\n  // your code here\n}",
      testCases: [
        { input: "groupBy([{role: 'admin', id: 1}, {role: 'dev', id: 2}, {role: 'admin', id: 3}], 'role')", expected: "{'admin':[{role:'admin',id:1},{role:'admin',id:3}],'dev':[{role:'dev',id:2}]}" }
      ],
      expectedBehavior: "Return an object with keys mapped to arrays of matching elements.",
      hints: ["Use array.reduce() with an initial accumulator of {}.", "Check if acc[item[key]] exists, initialize as [] if not."],
      explanation: "Standard data grouping pattern implemented with Array.prototype.reduce.",
      topic: "Functional JavaScript",
      difficulty: "intermediate",
      questionType: "code_write"
    },
    {
      question: "Explain the difference between Pass-by-Value and Pass-by-Reference-Value in JavaScript for primitives versus object types.",
      selfReviewCriteria: [
        "Explained that primitive types (string, number, boolean) are copied by direct value.",
        "Explained that objects/arrays pass a copy of the reference pointer (pass-by-value of the reference).",
        "Clarified that reassigning the parameter variable does not affect outer reference, but mutating properties does."
      ],
      topic: "JS Memory Model",
      difficulty: "intermediate",
      questionType: "short_answer"
    }
  ],

  // ---------------------------------------------------------
  // 4. ASYNCHRONOUS JS & EVENT LOOP (mod-js-async)
  // ---------------------------------------------------------
  "js_async": [
    {
      question: "In the JavaScript Event Loop, what is the exact execution priority order between the Call Stack, Microtask Queue (Promises, queueMicrotask), and Macrotask Queue (setTimeout, setInterval, I/O)?",
      options: [
        { id: "a", text: "Call Stack executes synchronously until empty -> Microtask Queue is completely drained -> One Macrotask is processed -> Microtask Queue is drained again." },
        { id: "b", text: "Macrotask Queue executes before Microtask Queue." },
        { id: "c", text: "Microtasks and Macrotasks run simultaneously on separate threads." },
        { id: "d", text: "Timers preempt the Call Stack immediately." }
      ],
      correct_answer_id: "a",
      explanation: "The microtask queue has strict priority over macrotasks: the runtime must drain all pending microtasks before processing the next macrotask.",
      topic: "Event Loop Mechanics",
      difficulty: "advanced",
      questionType: "mcq"
    },
    {
      question: "What happens when an error is thrown inside an `async` function without an enclosing `try/catch` block?",
      options: [
        { id: "a", text: "The returned Promise is rejected with the thrown error as its rejection reason." },
        { id: "b", text: "The entire JavaScript process crashes immediately." },
        { id: "c", text: "The error is silently suppressed and `null` is returned." },
        { id: "d", text: "The browser freezes the thread." }
      ],
      correct_answer_id: "a",
      explanation: "`async` functions always wrap returned values in `Promise.resolve()` and unhandled thrown errors in `Promise.reject(err)`.",
      topic: "Async/Await Control Flow",
      difficulty: "intermediate",
      questionType: "mcq"
    },
    {
      question: "What is the exact logged order of messages in this asynchronous code?",
      codeSnippet: "console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => {\n  console.log('C');\n  queueMicrotask(() => console.log('D'));\n});\nconsole.log('E');",
      options: [
        { id: "a", text: "A, E, C, D, B" },
        { id: "b", text: "A, B, C, D, E" },
        { id: "c", text: "A, E, B, C, D" },
        { id: "d", text: "A, C, D, E, B" }
      ],
      correct_answer_id: "a",
      explanation: "Synchronous 'A' and 'E' execute first. Next, microtasks 'C' and nested microtask 'D' run. Finally, macrotask 'B' from setTimeout executes.",
      topic: "Event Loop Tracing",
      difficulty: "advanced",
      questionType: "code_output"
    },
    {
      question: "Why does this retry logic fail to wait for delays between network attempts?",
      codeSnippet: "async function fetchWithRetry(url, retries = 3) {\n  for (let i = 0; i < retries; i++) {\n    try {\n      return await fetch(url);\n    } catch (err) {\n      setTimeout(() => console.log('Retrying...'), 1000);\n    }\n  }\n}",
      options: [
        { id: "a", text: "`setTimeout` is non-blocking and does not return a Promise; the loop immediately iterates without waiting. It needs `await new Promise(r => setTimeout(r, 1000))`." },
        { id: "b", text: "Async functions cannot contain for loops." },
        { id: "c", text: "Fetch cannot be called in a catch block." },
        { id: "d", text: "Retries must be an integer string." }
      ],
      correct_answer_id: "a",
      explanation: "`setTimeout` schedules a callback on the macrotask queue asynchronously without delaying loop execution. A Promisified sleep helper must be awaited.",
      topic: "Async Debugging",
      difficulty: "intermediate",
      questionType: "debugging"
    },
    {
      question: "Which of the following Promise combinators will reject immediately if even a single input Promise rejects? (Select all that apply)",
      options: [
        { id: "a", text: "Promise.all()" },
        { id: "b", text: "Promise.allSettled()" },
        { id: "c", text: "Promise.race()" },
        { id: "d", text: "Promise.any()" }
      ],
      multiple_correct_ids: ["a", "c"],
      explanation: "`Promise.all` short-circuits on first rejection. `Promise.race` settles with whichever promise completes first (fulfilled or rejected). `Promise.allSettled` never rejects; `Promise.any` only rejects if ALL fail.",
      topic: "Promise Combinators",
      difficulty: "intermediate",
      questionType: "multiple_select"
    },
    {
      question: "You need to fetch pricing data from 4 decentralized provider APIs. You want the fastest successful response, ignoring failed providers unless all 4 fail. Which Promise method should you use?",
      options: [
        { id: "a", text: "Promise.any([p1, p2, p3, p4])" },
        { id: "b", text: "Promise.all([p1, p2, p3, p4])" },
        { id: "c", text: "Promise.race([p1, p2, p3, p4])" },
        { id: "d", text: "Promise.allSettled([p1, p2, p3, p4])" }
      ],
      correct_answer_id: "a",
      explanation: "`Promise.any()` resolves with the first fulfilled promise value and ignores rejections until all input promises have failed (yielding an `AggregateError`).",
      topic: "Async Architecture",
      difficulty: "intermediate",
      questionType: "scenario"
    },
    {
      question: "`AbortController` can be passed to the `fetch()` API via the `signal` option to cancel in-flight HTTP network requests and release network connections.",
      options: [
        { id: "true", text: "True" },
        { id: "false", text: "False" }
      ],
      correct_answer_id: "true",
      explanation: "`const controller = new AbortController(); fetch(url, { signal: controller.signal })` enables programmatic aborting via `controller.abort()`.",
      topic: "Fetch API & Cancellation",
      difficulty: "intermediate",
      questionType: "true_false"
    },
    {
      question: "When building a web application with multiple real-time data feeds, what is the architectural trade-off between HTTP Long Polling versus WebSockets?",
      options: [
        { id: "a", text: "WebSockets establish a persistent, bidirectional full-duplex TCP connection with low frame overhead; Long Polling creates repeated HTTP request/response overhead but works seamlessly over restrictive firewalls without custom protocol proxies." },
        { id: "b", text: "Long polling requires WebAssembly." },
        { id: "c", text: "WebSockets only send binary data." },
        { id: "d", text: "There is no difference in network efficiency." }
      ],
      correct_answer_id: "a",
      explanation: "WebSockets offer low latency and minimal header overhead for bidirectional streams, whereas HTTP polling carries header overhead per cycle but relies on standard HTTP infrastructure.",
      topic: "Network Protocols & Architecture",
      difficulty: "advanced",
      questionType: "scenario"
    },
    {
      question: "Write a JavaScript function `timeoutPromise` that wraps a promise and rejects with `new Error('Timeout')` if the promise does not settle within `ms` milliseconds.",
      language: "javascript",
      starterCode: "function timeoutPromise(promise, ms) {\n  // your code here\n}",
      testCases: [
        { input: "timeoutPromise(Promise.resolve('ok'), 1000).then(r => r)", expected: "'ok'" },
        { input: "timeoutPromise(new Promise(r => setTimeout(() => r('slow'), 500)), 50).catch(e => e.message)", expected: "'Timeout'" }
      ],
      expectedBehavior: "Use Promise.race between the target promise and a timer rejection.",
      hints: ["Create a timer promise: new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)).", "Return Promise.race([promise, timerPromise])."],
      explanation: "Standard async pattern for enforcing SLA deadlines on network operations.",
      topic: "Async Patterns",
      difficulty: "advanced",
      questionType: "code_write"
    },
    {
      question: "Explain the concept of an unhandled promise rejection in Node.js and the browser, and describe how to globally catch and log unhandled asynchronous exceptions.",
      selfReviewCriteria: [
        "Explained why unhandled rejections occur (omitted .catch() or try/catch around await).",
        "Mentioned window.addEventListener('unhandledrejection') in browser environments.",
        "Mentioned process.on('unhandledRejection') in Node.js environments.",
        "Explained potential process termination or telemetry impacts."
      ],
      topic: "Async Error Handling",
      difficulty: "intermediate",
      questionType: "short_answer"
    }
  ],

  // ---------------------------------------------------------
  // 5. REACT & MODERN FRONTEND (mod-react-basics & mod-react-advanced)
  // ---------------------------------------------------------
  "react": [
    {
      question: "How does React's Reconciliation engine determine whether to preserve or unmount a component subtree during re-rendering?",
      options: [
        { id: "a", text: "By comparing the element's position and type (and `key` prop if in a list) between Virtual DOM trees: if element type changes, the old tree is destroyed and remounted." },
        { id: "b", text: "By checking whether the CSS class names match." },
        { id: "c", text: "By checking if state variables have numbers or strings." },
        { id: "d", text: "React always unmounts all children on every state update." }
      ],
      correct_answer_id: "a",
      explanation: "React's diffing algorithm matches components by their type and `key`. If the type at a given tree position changes, React unmounts the old component and mounts a new one.",
      topic: "React Reconciliation",
      difficulty: "advanced",
      questionType: "mcq"
    },
    {
      question: "In Next.js App Router, how do Server Components interact with Client Components across the rendering boundary?",
      options: [
        { id: "a", text: "Server Components render exclusively on the server and can pass serializable props or JSX `children` to Client Components marked with `'use client'`." },
        { id: "b", text: "Client Components can import and execute Server Components directly inside client event handlers." },
        { id: "c", text: "Server Components convert all JavaScript into WebAssembly." },
        { id: "d", text: "Client Components cannot receive props from Server Components." }
      ],
      correct_answer_id: "a",
      explanation: "RSC boundaries allow server components to pass serializable props or pass other server components as `children` composition props into client components without bundling server code to the client.",
      topic: "React Server Components",
      difficulty: "advanced",
      questionType: "mcq"
    },
    {
      question: "What will happen in this component when the button is clicked twice in quick succession?",
      codeSnippet: "function Counter() {\n  const [count, setCount] = useState(0);\n  const handleClick = () => {\n    setTimeout(() => {\n      setCount(count + 1);\n    }, 1000);\n  };\n  return <button onClick={handleClick}>{count}</button>;\n}",
      options: [
        { id: "a", text: "The count will become 1 (not 2) because both timeouts captured the same stale closure value `count = 0`." },
        { id: "b", text: "The count will become 2." },
        { id: "c", text: "The component will crash with an infinite loop." },
        { id: "d", text: "React will cancel the second timeout." }
      ],
      correct_answer_id: "a",
      explanation: "Both clicks capture `count = 0` in their closure scope. When each timer completes, it executes `setCount(0 + 1)`, leaving count at 1. Using `setCount(prev => prev + 1)` prevents stale closure bugs.",
      topic: "React State & Closures",
      difficulty: "intermediate",
      questionType: "code_output"
    },
    {
      question: "Identify why this `useEffect` causes a memory leak warning when the component unmounts before the timer finishes:",
      codeSnippet: "useEffect(() => {\n  const interval = setInterval(() => {\n    fetchData();\n  }, 5000);\n}, []);",
      options: [
        { id: "a", text: "The effect lacks a cleanup return function `return () => clearInterval(interval);`." },
        { id: "b", text: "The dependency array cannot be empty." },
        { id: "c", text: "setInterval is not supported in React." },
        { id: "d", text: "fetchData must be synchronous." }
      ],
      correct_answer_id: "a",
      explanation: "Effects that initiate timers, subscriptions, or listeners must return a cleanup function to dispose of resources when the component unmounts or before re-running.",
      topic: "React Effects Cleanup",
      difficulty: "intermediate",
      questionType: "debugging"
    },
    {
      question: "Which of the following React hooks will preserve values across renders WITHOUT causing a re-render when mutated? (Select all that apply)",
      options: [
        { id: "a", text: "useRef" },
        { id: "b", text: "useState" },
        { id: "c", text: "useReducer" },
        { id: "d", text: "useMemo" }
      ],
      multiple_correct_ids: ["a"],
      explanation: "`useRef` returns a mutable object whose `.current` property can be updated without triggering a render cycle.",
      topic: "React Hooks",
      difficulty: "beginner",
      questionType: "multiple_select"
    },
    {
      question: "A high-frequency dashboard re-renders 50 child chart components on every keystroke in a search filter. What is the optimal architectural optimization?",
      options: [
        { id: "a", text: "Wrap individual chart components in `React.memo` with stable props, memoize callback handlers with `useCallback`, and debounce search input state updates." },
        { id: "b", text: "Convert all chart components to Class components." },
        { id: "c", text: "Remove state and use global window variables." },
        { id: "d", text: "Disable React Strict Mode." }
      ],
      correct_answer_id: "a",
      explanation: "Component memoization (`React.memo`), callback reference stability (`useCallback`), and state debouncing prevent unnecessary re-rendering across pure child trees.",
      topic: "React Performance Optimization",
      difficulty: "advanced",
      questionType: "scenario"
    },
    {
      question: "In React 18 and 19, multiple state updates called inside asynchronous functions or timeouts are automatically batched into a single re-render cycle by default.",
      options: [
        { id: "true", text: "True" },
        { id: "false", text: "False" }
      ],
      correct_answer_id: "true",
      explanation: "Automatic Batching in React 18+ groups all state updates (including promises, setTimeout, native event handlers) into a single render pass.",
      topic: "React Batching",
      difficulty: "intermediate",
      questionType: "true_false"
    },
    {
      question: "When architecting global state in a large React application, what are the trade-offs between React Context API versus an external atomic store like Zustand or Jotai?",
      options: [
        { id: "a", text: "Context triggers re-renders on all consuming components whenever any value in the context object changes; atomic/selector stores allow granular subscriptions so components only re-render when their specific selected slice updates." },
        { id: "b", text: "Zustand can only be used on the backend." },
        { id: "c", text: "Context requires Redux as a peer dependency." },
        { id: "d", text: "Atomic stores cannot handle asynchronous data." }
      ],
      correct_answer_id: "a",
      explanation: "React Context lacks selector-based bailout, leading to widespread re-renders unless deeply split, while atomic state libraries provide precision selector subscriptions.",
      topic: "State Management Architecture",
      difficulty: "advanced",
      questionType: "scenario"
    },
    {
      question: "Write a custom React hook `useDebounce` in JavaScript that takes a value and a delay (ms) and returns the debounced value.",
      language: "javascript",
      starterCode: "import { useState, useEffect } from 'react';\n\nexport function useDebounce(value, delay) {\n  // your code here\n}",
      testCases: [
        { input: "const val = useDebounce('hello', 300); return typeof val;", expected: "'string'" }
      ],
      expectedBehavior: "Return state updated after `delay` ms using setTimeout inside useEffect with cleanup.",
      hints: ["Use useState(value).", "In useEffect([value, delay]), create a timer to update debouncedValue and return () => clearTimeout(timer)."],
      explanation: "Essential production custom hook pattern for search and resize throttling.",
      topic: "React Custom Hooks",
      difficulty: "advanced",
      questionType: "code_write"
    },
    {
      question: "Explain the Rules of Hooks in React and detail why hooks cannot be called conditionally or inside regular loops.",
      selfReviewCriteria: [
        "Explained that hooks must be called at the top level of React function components or custom hooks.",
        "Explained that React tracks hook state internally using sequential index order across renders.",
        "Explained how conditional calls disrupt the internal pointer order, causing state corruption."
      ],
      topic: "React Hook Internals",
      difficulty: "intermediate",
      questionType: "short_answer"
    }
  ],

  // ---------------------------------------------------------
  // 6. BACKEND & DATABASES (mod-backend-basics, mod-db-sql, mod-backend-advanced)
  // ---------------------------------------------------------
  "database": [
    {
      question: "What is the primary difference between a B-Tree Index and a Hash Index in a relational database like PostgreSQL?",
      options: [
        { id: "a", text: "B-Tree indexes support equality (`=`) and range queries (`<`, `>`, `BETWEEN`, `ORDER BY`); Hash indexes only support exact equality lookups." },
        { id: "b", text: "Hash indexes are always slower than full table scans." },
        { id: "c", text: "B-Tree indexes cannot be used on string columns." },
        { id: "d", text: "Hash indexes automatically replicate data to Redis." }
      ],
      correct_answer_id: "a",
      explanation: "B-Tree indexes maintain sorted balanced tree structures capable of range scans, prefix matching, and sorted outputs, while Hash indexes evaluate hash values exclusively for exact equality.",
      topic: "Database Indexing Internals",
      difficulty: "advanced",
      questionType: "mcq"
    },
    {
      question: "In database transaction theory, what is the anomaly known as a 'Phantom Read' that can occur under the `Read Committed` isolation level?",
      options: [
        { id: "a", text: "A transaction re-executes a range query and discovers new rows inserted and committed by a concurrent transaction that satisfy the search condition." },
        { id: "b", text: "Reading uncommitted data that is subsequently rolled back (Dirty Read)." },
        { id: "c", text: "A database node losing network connectivity." },
        { id: "d", text: "Deleting rows without a primary key." }
      ],
      correct_answer_id: "a",
      explanation: "Phantom reads occur when concurrent transactions insert new records matching a predicate query between reads within another active transaction.",
      topic: "ACID & Transaction Isolation",
      difficulty: "advanced",
      questionType: "mcq"
    },
    {
      question: "What will this SQL query return?",
      codeSnippet: "SELECT department, COUNT(*) AS employee_count\nFROM employees\nWHERE salary > 50000\nGROUP BY department\nHAVING COUNT(*) >= 2\nORDER BY employee_count DESC;",
      options: [
        { id: "a", text: "Departments having 2 or more employees with salary > 50,000, ordered from highest to lowest count." },
        { id: "b", text: "All departments with total salary > 50,000." },
        { id: "c", text: "The top 2 departments regardless of salary." },
        { id: "d", text: "A syntax error because HAVING cannot follow GROUP BY." }
      ],
      correct_answer_id: "a",
      explanation: "`WHERE` filters individual salary rows > 50k, `GROUP BY` aggregates by department, `HAVING` filters aggregated groups >= 2, and `ORDER BY` sorts descending.",
      topic: "SQL Query Execution",
      difficulty: "intermediate",
      questionType: "code_output"
    },
    {
      question: "Identify why this authentication endpoint is vulnerable to SQL Injection attacks:",
      codeSnippet: "app.post('/login', async (req, res) => {\n  const { email, password } = req.body;\n  const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;\n  const result = await db.query(query);\n});",
      options: [
        { id: "a", text: "Direct string interpolation permits attackers to inject malicious SQL syntax (e.g. `' OR '1'='1`). Parameterized queries (`$1, $2`) must be used." },
        { id: "b", text: "Async/await cannot be used with database queries." },
        { id: "c", text: "The table name must be in uppercase." },
        { id: "d", text: "Express requires GET for login." }
      ],
      correct_answer_id: "a",
      explanation: "Concatenating user inputs into raw SQL strings creates severe SQL injection vulnerabilities. Parameterized queries enforce separation between query logic and data literals.",
      topic: "Backend Security & SQLi",
      difficulty: "intermediate",
      questionType: "debugging"
    },
    {
      question: "Which of the following HTTP response headers provide crucial protection against Cross-Site Scripting (XSS) and Clickjacking? (Select all that apply)",
      options: [
        { id: "a", text: "Content-Security-Policy (CSP)" },
        { id: "b", text: "X-Frame-Options: DENY" },
        { id: "c", text: "X-Content-Type-Options: nosniff" },
        { id: "d", text: "Access-Control-Allow-Origin: *" }
      ],
      multiple_correct_ids: ["a", "b", "c"],
      explanation: "CSP mitigates XSS and script injection; X-Frame-Options prevents clickjacking frames; nosniff blocks MIME sniffing. Wildcard CORS actually weakens cross-origin restrictions.",
      topic: "Backend Security Headers",
      difficulty: "advanced",
      questionType: "multiple_select"
    },
    {
      question: "A high-traffic e-commerce checkout service needs to reserve inventory for 5 minutes during payment processing without overselling stock during flash sales. What is the most resilient concurrency strategy?",
      options: [
        { id: "a", text: "Use database transactions with pessimistic row-level locking (`SELECT ... FOR UPDATE`) or atomic decrement with conditional checks (`UPDATE stock SET qty = qty - 1 WHERE id = $1 AND qty > 0`)." },
        { id: "b", text: "Read the quantity in JavaScript, check `if (qty > 0)`, and write back 5 seconds later." },
        { id: "c", text: "Store inventory exclusively in browser localStorage." },
        { id: "d", text: "Allow all orders and cancel excess orders manually." }
      ],
      correct_answer_id: "a",
      explanation: "Atomic conditional updates (`WHERE qty > 0`) or row-level pessimistic locks (`FOR UPDATE`) prevent race conditions and double-spending across concurrent requests.",
      topic: "Concurrency & Distributed Systems",
      difficulty: "advanced",
      questionType: "scenario"
    },
    {
      question: "JSON Web Tokens (JWT) stored in `localStorage` are vulnerable to Cross-Site Scripting (XSS) theft; storing authentication tokens in `HttpOnly, Secure, SameSite=Strict` cookies prevents client-side script access.",
      options: [
        { id: "true", text: "True" },
        { id: "false", text: "False" }
      ],
      correct_answer_id: "true",
      explanation: "`HttpOnly` cookies cannot be accessed via `document.cookie` in JavaScript, neutralizing token exfiltration from XSS vulnerabilities.",
      topic: "Authentication Security",
      difficulty: "intermediate",
      questionType: "true_false"
    },
    {
      question: "When scaling an API service experiencing 90% read traffic versus 10% write traffic, what is the architectural trade-off between introducing a Redis caching layer versus Database Read Replicas?",
      options: [
        { id: "a", text: "Redis delivers sub-millisecond in-memory lookups but requires cache invalidation strategies (e.g. Cache-Aside, TTL); Read Replicas scale SQL queries transparently with eventual consistency replication lag." },
        { id: "b", text: "Redis can only store 100 rows total." },
        { id: "c", text: "Read replicas eliminate the need for primary database servers." },
        { id: "d", text: "Read replicas do not support SQL joins." }
      ],
      correct_answer_id: "a",
      explanation: "In-memory caches (Redis) provide ultra-fast throughput but introduce invalidation complexity, whereas read replicas handle complex SQL query offloading with slight replication delay.",
      topic: "System Design & Scaling",
      difficulty: "advanced",
      questionType: "scenario"
    },
    {
      question: "Write a JavaScript function `buildSelectQuery` that safely constructs a SQL SELECT statement and parameter values array given a table name, an object of column filters, and a limit.",
      language: "javascript",
      starterCode: "function buildSelectQuery(table, filters, limit = 10) {\n  // your code here\n}",
      testCases: [
        { input: "buildSelectQuery('users', { role: 'admin', active: true }, 5)", expected: "{text: 'SELECT * FROM users WHERE role = $1 AND active = $2 LIMIT $3', values: ['admin', true, 5]}" }
      ],
      expectedBehavior: "Construct parameterized SQL string with $1, $2 placeholders and return {text, values}.",
      hints: ["Object.keys(filters).map((k, i) => `${k} = $${i+1}`)", "Push filter values and limit into values array."],
      explanation: "Foundational pattern used by query builders to ensure SQL parameterization safety.",
      topic: "Backend Query Construction",
      difficulty: "advanced",
      questionType: "code_write"
    },
    {
      question: "Explain Database Normalization through Third Normal Form (1NF, 2NF, 3NF) and identify when deliberate Denormalization is beneficial in production.",
      selfReviewCriteria: [
        "Defined 1NF (atomic columns, unique rows).",
        "Defined 2NF (1NF + no partial dependencies on composite keys).",
        "Defined 3NF (2NF + no transitive dependencies).",
        "Explained that denormalization optimizes read-heavy queries by reducing costly table JOINs."
      ],
      topic: "Database Architecture",
      difficulty: "advanced",
      questionType: "short_answer"
    }
  ],

  // ---------------------------------------------------------
  // 7. AI & LLMs / RAG (mod-ai-integration & mod-ai-rag)
  // ---------------------------------------------------------
  "ai": [
    {
      question: "In a production Retrieval-Augmented Generation (RAG) system, why is semantic document chunking with overlap (e.g. 500 tokens with 50-token overlap) critical prior to embedding generation?",
      options: [
        { id: "a", text: "It ensures sentence and context continuity across chunk boundaries so semantic meaning is not severed midway through key concepts." },
        { id: "b", text: "It doubles the speed of vector search." },
        { id: "c", text: "It compresses text into binary format." },
        { id: "d", text: "It prevents the LLM from generating output tokens." }
      ],
      correct_answer_id: "a",
      explanation: "Chunk overlap prevents contextual loss at hard cutoff boundaries, ensuring embedding vectors accurately capture surrounding thoughts.",
      topic: "RAG & Chunking",
      difficulty: "advanced",
      questionType: "mcq"
    },
    {
      question: "What mathematical property makes Cosine Similarity invariant to document text length when comparing embeddings?",
      options: [
        { id: "a", text: "It normalizes vectors by their magnitudes, measuring only the directional angle between vectors rather than Euclidean distance." },
        { id: "b", text: "It only operates on integers." },
        { id: "c", text: "It ignores negative numbers." },
        { id: "d", text: "It computes character length differences." }
      ],
      correct_answer_id: "a",
      explanation: "Cosine similarity divides dot product by vector magnitudes (`A · B / ||A|| ||B||`), isolating angular directional similarity irrespective of vector magnitude.",
      topic: "Vector Math & Embeddings",
      difficulty: "advanced",
      questionType: "mcq"
    },
    {
      question: "An AI coding assistant produces subtly broken syntax when answering multi-step architectural questions. What prompt engineering technique is proven to dramatically increase reasoning quality?",
      options: [
        { id: "a", text: "Chain-of-Thought (CoT) prompting (e.g. 'Think step-by-step through the requirements before outputting code')." },
        { id: "b", text: "Increasing temperature to 1.9." },
        { id: "c", text: "Writing the prompt in all capital letters." },
        { id: "d", text: "Removing system instructions entirely." }
      ],
      correct_answer_id: "a",
      explanation: "Chain-of-Thought prompting directs the transformer to generate intermediate token reasoning steps, allocating compute before finalizing conclusions.",
      topic: "Prompt Engineering",
      difficulty: "intermediate",
      questionType: "scenario"
    },
    {
      question: "Identify why this serverless AI streaming handler crashes after 10 seconds on long LLM responses:",
      codeSnippet: "export async function POST(req) {\n  const { prompt } = await req.json();\n  const response = await openai.chat.completions.create({\n    model: 'gpt-4o',\n    messages: [{ role: 'user', content: prompt }],\n    stream: false\n  });\n  return Response.json(response);\n}",
      options: [
        { id: "a", text: "Setting `stream: false` blocks the request until completion, hitting serverless execution timeouts; setting `stream: true` and returning a `ReadableStream` streams tokens immediately." },
        { id: "b", text: "OpenAI does not support POST requests." },
        { id: "c", text: "Prompt must be encrypted." },
        { id: "d", text: "Serverless functions cannot parse JSON." }
      ],
      correct_answer_id: "a",
      explanation: "Non-streaming calls block until the entire completion generates, risking serverless HTTP gateway timeouts. Streaming yields TTFT (Time to First Token) in milliseconds.",
      topic: "AI Streaming & Serverless",
      difficulty: "advanced",
      questionType: "debugging"
    },
    {
      question: "Which of the following techniques directly mitigate hallucinations in Large Language Model applications? (Select all that apply)",
      options: [
        { id: "a", text: "Retrieval-Augmented Generation (grounding prompts with verified source documents)" },
        { id: "b", text: "Setting lower temperature settings (e.g. 0.0 - 0.2) for deterministic extraction" },
        { id: "c", text: "Enforcing strict structured JSON schemas (Function Calling / Structured Outputs)" },
        { id: "d", text: "Increasing top_p to 1.0 with temperature 2.0" }
      ],
      multiple_correct_ids: ["a", "b", "c"],
      explanation: "RAG grounding, low temperature sampling, and strict JSON schemas enforce factual consistency and eliminate format drift.",
      topic: "AI Reliability",
      difficulty: "intermediate",
      questionType: "multiple_select"
    },
    {
      question: "In vector databases (such as pgvector, Pinecone, Qdrant), what is the difference between exact KNN search and Approximate Nearest Neighbor (ANN) algorithms like HNSW (Hierarchical Navigable Small World)?",
      options: [
        { id: "a", text: "KNN computes exact distances to every vector (O(N) full scan); HNSW creates a multi-layer graph index for logarithmic O(log N) approximate retrieval at high recall." },
        { id: "b", text: "HNSW is only compatible with Python." },
        { id: "c", text: "KNN does not work with embeddings." },
        { id: "d", text: "HNSW removes all vectors with negative values." }
      ],
      correct_answer_id: "a",
      explanation: "Exact KNN scans all vectors (prohibitive at scale), whereas HNSW graph indexing provides sub-linear fast approximate nearest neighbor search.",
      topic: "Vector Search Indexing",
      difficulty: "advanced",
      questionType: "mcq"
    },
    {
      question: "Embeddings produced by different embedding models (e.g. OpenAI `text-embedding-3-small` vs Cohere `embed-english-v3.0`) cannot be compared against each other in the same vector space.",
      options: [
        { id: "true", text: "True" },
        { id: "false", text: "False" }
      ],
      correct_answer_id: "true",
      explanation: "Each embedding model projects text into its own unique high-dimensional semantic latent space; comparing cross-model vectors yields meaningless distance values.",
      topic: "Embeddings Compatibility",
      difficulty: "intermediate",
      questionType: "true_false"
    },
    {
      question: "When building an AI Agent capable of multi-step execution, what is the architectural trade-off between ReAct (Reason + Act) tool-calling loops versus Single-Prompt Pipeline execution?",
      options: [
        { id: "a", text: "ReAct loops allow dynamic error recovery, environmental feedback, and iterative planning at the cost of higher latency and token spend; single-prompt pipelines are fast and deterministic but cannot adapt dynamically." },
        { id: "b", text: "Single-prompt pipelines can run infinite loops." },
        { id: "c", text: "ReAct agents do not require an LLM." },
        { id: "d", text: "Tool calling is only possible with local models." }
      ],
      correct_answer_id: "a",
      explanation: "Autonomous ReAct loops inspect tool outputs to decide subsequent actions, providing agency and flexibility in exchange for multi-turn latency.",
      topic: "AI Agent Architecture",
      difficulty: "advanced",
      questionType: "scenario"
    },
    {
      question: "Write a JavaScript function `calculateTopKSimilar` that takes a query vector, an array of document objects with `embedding` vectors, and returns the top K documents sorted by cosine similarity.",
      language: "javascript",
      starterCode: "function calculateTopKSimilar(queryVec, docs, k = 2) {\n  // your code here\n}",
      testCases: [
        { input: "calculateTopKSimilar([1, 0], [{id: 1, embedding: [1, 0]}, {id: 2, embedding: [0, 1]}], 1)", expected: "[{id: 1, embedding: [1, 0]}]" }
      ],
      expectedBehavior: "Compute cosine similarity for each doc and return the top K highest scoring docs.",
      hints: ["Cosine sim = dotProduct(a, b) / (mag(a) * mag(b)).", "Sort docs descending by similarity score."],
      explanation: "Core in-memory similarity ranking mechanism in vector search pipelines.",
      topic: "Vector Search Algorithms",
      difficulty: "advanced",
      questionType: "code_write"
    },
    {
      question: "Explain the RAG Triad evaluation metrics (Context Relevance, Groundedness / Faithfulness, Answer Relevance) and how to detect hallucination in AI pipelines.",
      selfReviewCriteria: [
        "Defined Context Relevance (retrieved chunks contain only necessary information for the query).",
        "Defined Groundedness/Faithfulness (response claims are strictly supported by retrieved context).",
        "Defined Answer Relevance (response directly addresses the user's initial question).",
        "Explained automated LLM-as-a-judge scoring frameworks (e.g. Ragas, TruLens)."
      ],
      topic: "RAG Evaluation & Quality",
      difficulty: "advanced",
      questionType: "short_answer"
    }
  ],

  // ---------------------------------------------------------
  // 8. GENERAL SOFTWARE ENGINEERING / SYSTEM DESIGN / CS
  // ---------------------------------------------------------
  "general": [
    {
      question: "In distributed systems design, what does the CAP Theorem state regarding Partition Tolerance?",
      options: [
        { id: "a", text: "In the event of a network partition (P), a distributed data store must choose between Consistency (C) and Availability (A)." },
        { id: "b", text: "Systems can guarantee 100% Consistency, Availability, and Partition Tolerance simultaneously." },
        { id: "c", text: "Partition tolerance can be eliminated by using faster network switches." },
        { id: "d", text: "CAP theorem only applies to single-threaded databases." }
      ],
      correct_answer_id: "a",
      explanation: "Network partitions are inevitable in distributed systems; when a network partition occurs, the system must trade off between returning consistent data or remaining available.",
      topic: "Distributed Systems (CAP)",
      difficulty: "advanced",
      questionType: "mcq"
    },
    {
      question: "What is the time and space complexity of searching an element in an unsorted array versus a Hash Table?",
      options: [
        { id: "a", text: "Unsorted Array: O(N) time, O(1) auxiliary space; Hash Table: O(1) average time, O(N) space." },
        { id: "b", text: "Both are O(1) time and space." },
        { id: "c", text: "Array is O(log N); Hash Table is O(N^2)." },
        { id: "d", text: "Hash Table is O(N) average time." }
      ],
      correct_answer_id: "a",
      explanation: "Linear search checks up to N elements (O(N)). Hash tables compute bucket indices in O(1) average time at the expense of O(N) storage.",
      topic: "Algorithms & Complexity",
      difficulty: "intermediate",
      questionType: "mcq"
    },
    {
      question: "What is the output of this JavaScript snippet demonstrating Big-O complexity behavior?",
      codeSnippet: "function test(n) {\n  let count = 0;\n  for (let i = 1; i < n; i *= 2) {\n    count++;\n  }\n  return count;\n}\nconsole.log(test(32));",
      options: [
        { id: "a", text: "5" },
        { id: "b", text: "32" },
        { id: "c", text: "16" },
        { id: "d", text: "6" }
      ],
      correct_answer_id: "a",
      explanation: "The loop variable `i` doubles each step (1, 2, 4, 8, 16, then 32 terminates). That runs log2(32) = 5 times (O(log N) time).",
      topic: "Big-O Analysis",
      difficulty: "intermediate",
      questionType: "code_output"
    },
    {
      question: "Identify the architectural violation in this microservice implementation:",
      codeSnippet: "// Order Service\nasync function createOrder(req) {\n  const user = await db.query('SELECT * FROM user_db.users WHERE id = $1', [req.userId]);\n  // Directly querying another service's private database schema\n}",
      options: [
        { id: "a", text: "Violates Database-per-Service encapsulation; microservices must communicate via well-defined APIs or events, not direct cross-database queries." },
        { id: "b", text: "SELECT queries are not allowed in microservices." },
        { id: "c", text: "Order service cannot have a database." },
        { id: "d", text: "req.userId must be an email." }
      ],
      correct_answer_id: "a",
      explanation: "Direct database coupling breaks service boundaries, prevents independent schema migrations, and violates microservice autonomy.",
      topic: "Microservice Architecture",
      difficulty: "advanced",
      questionType: "debugging"
    },
    {
      question: "Which of the following principles are part of the SOLID object-oriented design framework? (Select all that apply)",
      options: [
        { id: "a", text: "Single Responsibility Principle (a class should have only one reason to change)" },
        { id: "b", text: "Open/Closed Principle (open for extension, closed for modification)" },
        { id: "c", text: "Liskov Substitution Principle (subtypes must be substitutable for their base types)" },
        { id: "d", text: "Direct Coupling Principle (classes should import concrete implementations directly)" }
      ],
      multiple_correct_ids: ["a", "b", "c"],
      explanation: "SOLID consists of Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion. Direct coupling is an anti-pattern.",
      topic: "Software Design Principles",
      difficulty: "intermediate",
      questionType: "multiple_select"
    },
    {
      question: "A high-frequency messaging system encounters sudden traffic spikes that cause downstream database workers to crash under overload. What architectural pattern provides load leveling and backpressure?",
      options: [
        { id: "a", text: "Message Queue / Buffer (e.g. RabbitMQ, Kafka, SQS) to decouple producers and consumers and process events at a controlled rate." },
        { id: "b", text: "Removing all database validation constraints." },
        { id: "c", text: "Converting all database tables to CSV files." },
        { id: "d", text: "Increasing frontend request timeouts to 1 hour." }
      ],
      correct_answer_id: "a",
      explanation: "Message queues absorb burst spikes, queueing incoming payloads and allowing worker pools to consume records at a sustainable throughput.",
      topic: "System Design & Resilience",
      difficulty: "advanced",
      questionType: "scenario"
    },
    {
      question: "In continuous delivery pipelines, Blue-Green Deployment reduces downtime by running two identical production environments and instantly switching traffic router pointers to the updated environment.",
      options: [
        { id: "true", text: "True" },
        { id: "false", text: "False" }
      ],
      correct_answer_id: "true",
      explanation: "Blue-Green deployments maintain idle standby (Green) alongside live (Blue), allowing zero-downtime cutover and instant rollback if issues arise.",
      topic: "DevOps & CI/CD",
      difficulty: "intermediate",
      questionType: "true_false"
    },
    {
      question: "Explain the difference between Optimistic Concurrency Control (version numbers/eTags) and Pessimistic Concurrency Control (locks), and describe when to use each.",
      selfReviewCriteria: [
        "Explained Optimistic locking checks version/timestamp at write time and aborts if changed.",
        "Explained Pessimistic locking locks records for the duration of the transaction.",
        "Explained Optimistic is ideal for low-contention reads; Pessimistic is ideal for high-contention critical operations."
      ],
      topic: "Concurrency Architecture",
      difficulty: "advanced",
      questionType: "short_answer"
    },
    {
      question: "Write a JavaScript function `binarySearch` that takes a sorted array of numbers and a target value, and returns the index of the target or -1 if not found in O(log N) time.",
      language: "javascript",
      starterCode: "function binarySearch(arr, target) {\n  // your code here\n}",
      testCases: [
        { input: "binarySearch([1, 3, 5, 7, 9, 11], 7)", expected: "3" },
        { input: "binarySearch([2, 4, 6, 8], 5)", expected: "-1" }
      ],
      expectedBehavior: "Implement binary search with left/right pointers and middle pivot comparisons.",
      hints: ["let left = 0, right = arr.length - 1;", "while (left <= right) { const mid = Math.floor((left + right) / 2); ... }"],
      explanation: "Classic algorithmic search achieving logarithmic O(log N) time efficiency.",
      topic: "Algorithms & Search",
      difficulty: "intermediate",
      questionType: "code_write"
    },
    {
      question: "Explain why automated Integration Testing is crucial in addition to Unit Testing in modern microservice and full-stack architectures.",
      selfReviewCriteria: [
        "Mentioned that unit tests isolate single components using mocks and can miss integration defects.",
        "Mentioned that integration tests verify contract adherence, database queries, network protocols, and third-party APIs.",
        "Discussed testing pyramid balance between speed, cost, and reliability confidence."
      ],
      topic: "Testing Strategy",
      difficulty: "intermediate",
      questionType: "short_answer"
    }
  ]
}
