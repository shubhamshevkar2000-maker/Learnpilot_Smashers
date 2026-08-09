import type { ActivityType } from "@/types/database.types"

export interface ContentPayload {
  id: string
  title: string
  type: ActivityType
  objective: string
  concept_guide?: string
  code_example?: string
  practical_exercise?: string
  checkpoint_question?: string
  checkpoint_options?: string[]
  checkpoint_correct_index?: number
  checkpoint_explanation?: string
  topic?: string
  skill?: string
  difficulty?: string
}

export const CONTENT_REGISTRY: Record<string, ContentPayload> = {
  "html-css-l1": {
      "id": "html-css-l1",
      "title": "HTML5 Document Structure & Syntax Rules",
      "type": "concept",
      "objective": "Master standard HTML5 document syntax, doctype declarations, head metadata, and tag nesting hierarchy.",
      "concept_guide": "HTML (HyperText Markup Language) provides the fundamental structural blueprint of every webpage on the internet. Browsers parse HTML documents from top to bottom, constructing a Document Object Model (DOM) tree in memory.\n\nThe <!DOCTYPE html> declaration informs the browser engine that the document complies with the modern HTML5 specification, preventing browsers from triggering legacy \"quirks mode\".\n\nInside the root <html> element, the document is partitioned into two primary children:\n1. <head>: Contains non-visual metadata, document title, character encoding (<meta charset=\"UTF-8\">), viewport scaling rules, and linked external stylesheet assets.\n2. <body>: Encloses all renderable UI content including text, images, forms, and structural sections.\n\nStrict syntax rules dictate that all opening tags must be properly closed or self-closed, attributes must be enclosed in quotes, and elements must follow clean ancestor-descendant nesting without overlapping tags.",
      "code_example": "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>HTML5 Structural Blueprint</title>\n  <link rel=\"stylesheet\" href=\"styles.css\">\n</head>\n<body>\n  <header>\n    <h1>Modern Web Development</h1>\n    <p>Building accessible, performant interfaces</p>\n  </header>\n  <main>\n    <article>\n      <h2>Document Object Model Hierarchy</h2>\n      <p>HTML tags construct DOM nodes parsed sequentially by web browsers.</p>\n    </article>\n  </main>\n  <footer>\n    <p>&copy; 2026 LearnPilot Academy</p>\n  </footer>\n</body>\n</html>",
      "practical_exercise": "Open your code editor and build an HTML5 file named `index.html`. Add a valid head section with viewport metadata, a title of 'My First Web Page', and a body containing a main element with an h1 heading and two paragraph elements.",
      "checkpoint_question": "Why is the <!DOCTYPE html> declaration placed at the very first line of an HTML document?",
      "checkpoint_options": [
          "It forces the browser to download external JavaScript files faster.",
          "It informs the browser to parse the page using standard HTML5 rendering rules instead of quirks mode.",
          "It creates an encrypted secure connection to the web server.",
          "It styles the page with default CSS framework reset rules."
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "The doctype declaration tells the browser's rendering engine that the document follows the HTML5 specification, preventing legacy rendering quirks.",
      "topic": "HTML & CSS Foundations",
      "difficulty": "Beginner"
  },
  "html-css-l2": {
      "id": "html-css-l2",
      "title": "Semantic Elements & ARIA Accessibility",
      "type": "exercise",
      "objective": "Apply HTML5 semantic sectioning elements and ARIA accessibility roles to create machine-readable document landmarks.",
      "concept_guide": "In early web development, layouts were constructed using generic <div> tags with custom class names like <div class=\"header\">. HTML5 introduced semantic elements (<header>, <nav>, <main>, <article>, <section>, <aside>, <footer>) that explicitly describe their content's purpose to browsers, search engines, and screen readers.\n\nSemantic markup produces clear document outlines and enhances web accessibility (a11y). Screen reader users rely on landmark navigation keys to jump directly between main content, navigation bars, and footers.\n\nWhen native HTML elements cannot fully express a custom widget's interactive state, WAI-ARIA (Accessible Rich Internet Applications) attributes bridge the gap using roles (role=\"dialog\"), states (aria-expanded=\"true\"), and accessible names (aria-label=\"Close modal window\").",
      "code_example": "<header role=\"banner\" className=\"site-header\">\n  <nav aria-label=\"Primary Navigation\">\n    <ul>\n      <li><a href=\"#courses\">Courses</a></li>\n      <li><a href=\"#about\">About</a></li>\n    </ul>\n  </nav>\n</header>\n\n<main id=\"main-content\">\n  <section aria-labelledby=\"section-heading\">\n    <h2 id=\"section-heading\">Semantic Principles</h2>\n    <article className=\"card\">\n      <h3>Accessibility First</h3>\n      <p>Semantic tags allow assistive tools to navigate page landmarks seamlessly.</p>\n    </article>\n  </section>\n</main>",
      "practical_exercise": "Refactor a webpage layout consisting entirely of <div> elements into semantic elements (<header>, <nav>, <main>, <article>, <footer>) and add an aria-label to the navigation bar.",
      "checkpoint_question": "Which HTML element should be used to enclose self-contained, independently redistributable content like a blog post or news article?",
      "checkpoint_options": [
          "<section>",
          "<div>",
          "<article>",
          "<aside>"
      ],
      "checkpoint_correct_index": 2,
      "checkpoint_explanation": "The <article> element represents a self-contained composition intended to be independently reusable or redistributable.",
      "topic": "HTML & CSS Foundations",
      "difficulty": "Beginner"
  },
  "html-css-l3": {
      "id": "html-css-l3",
      "title": "CSS Selectors, Specificity & Box Model",
      "type": "concept",
      "objective": "Master CSS rule declaration syntax, selector specificity calculation, and element dimension box model physics.",
      "concept_guide": "CSS (Cascading Style Sheets) controls the visual presentation, typography, and spatial geometry of HTML elements.\n\nThe CSS Box Model is the foundational layout physics engine. Every HTML element is modeled as a rectangular box comprising four concentric layers:\n1. Content Box: Where text, images, and child elements render.\n2. Padding: Transparent buffer space surrounding the content.\n3. Border: Visible line surrounding the padding.\n4. Margin: Transparent outer spacing separating the element from sibling boxes.\n\nBy default, CSS uses content-box sizing where width specifies only the content width, causing padding and borders to expand total element size. Applying `box-sizing: border-box` universally forces width and height to include padding and border inside specified dimensions.\n\nCSS Specificity determines which style rules apply when multiple selectors target the same element:\nInline Styles (1000) > IDs (100) > Classes/Attributes (10) > Elements/Types (1).",
      "code_example": "/* Universal Box Sizing Reset */\n*, *::before, *::after {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\n/* Card Component Box Model */\n.card-container {\n  width: 320px;\n  padding: 24px;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  margin: 16px auto;\n  border-radius: 12px;\n  background-color: #1e293b;\n}",
      "practical_exercise": "Calculate total calculated element width for a div with width: 300px, padding: 20px, and border: 2px under content-box vs border-box.",
      "checkpoint_question": "With box-sizing: border-box enabled, what is the total rendered width of an element with width: 250px, padding: 20px, and border: 5px?",
      "checkpoint_options": [
          "300px",
          "250px",
          "275px",
          "295px"
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "With border-box, total width remains exactly equal to the specified width (250px) because padding and border are absorbed inward.",
      "topic": "HTML & CSS Foundations",
      "difficulty": "Beginner"
  },
  "html-css-l4": {
      "id": "html-css-l4",
      "title": "CSS Flexbox One-Dimensional Layout Systems",
      "type": "exercise",
      "objective": "Construct dynamic flexible rows and columns using Flexbox container properties and item distribution controls.",
      "concept_guide": "Flexbox (Flexible Box Layout) is a one-dimensional CSS layout system designed for distributing space and aligning items along a single axis (either row or column).\n\nWhen `display: flex` is declared on a container:\n1. Main Axis: Defined by flex-direction (row default, column). Justified using `justify-content` (flex-start, flex-end, center, space-between, space-around, space-evenly).\n2. Cross Axis: Perpendicular to the main axis. Aligned using `align-items` (flex-start, flex-end, center, stretch, baseline).\n\nIndividual flex items can grow to fill available space (`flex-grow: 1`), shrink when constrained (`flex-shrink: 1`), or establish a base size (`flex-basis: 200px`).",
      "code_example": ".navbar-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 1.5rem;\n  padding: 1rem 2rem;\n  background-color: #0f172a;\n}\n\n.nav-links {\n  display: flex;\n  align-items: center;\n  gap: 1rem;\n  list-style: none;\n}",
      "practical_exercise": "Create a flexbox container holding three pricing cards. Align the cards side by side with equal gaps and ensure all cards stretch to match the tallest card's height.",
      "checkpoint_question": "Which Flexbox property controls item alignment along the MAIN axis?",
      "checkpoint_options": [
          "align-items",
          "justify-content",
          "flex-wrap",
          "align-content"
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "justify-content aligns items along the primary main axis established by flex-direction.",
      "topic": "HTML & CSS Foundations",
      "difficulty": "Beginner"
  },
  "html-css-l5": {
      "id": "html-css-l5",
      "title": "CSS Grid Two-Dimensional Spatial Systems",
      "type": "exercise",
      "objective": "Design two-dimensional grid layouts with explicit columns, rows, fractional fr units, and responsive auto-fit minmax patterns.",
      "concept_guide": "CSS Grid is a two-dimensional spatial layout system capable of handling both rows and columns simultaneously.\n\nUnlike Flexbox which works from content outward, Grid allows developers to define a structural layout mesh first and place content items into explicit grid tracks.\n\nKey Grid properties:\n- `grid-template-columns`: Defines track widths using pixels, percentages, or flexible fractional units (`1fr`).\n- `gap`: Defines spatial gutters between tracks.\n- Responsive grid magic: `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));` creates an auto-responsive layout grid that automatically wraps columns into rows without needing media queries!",
      "code_example": ".dashboard-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: 1.5rem;\n  padding: 2rem;\n}\n\n.grid-card {\n  background: #1e293b;\n  border-radius: 1rem;\n  padding: 1.5rem;\n}",
      "practical_exercise": "Build a photo gallery grid displaying 6 images in a 3-column layout on desktop that dynamically reflows to 2 columns on tablet and 1 column on mobile screens.",
      "checkpoint_question": "What does the fractional unit (1fr) represent in CSS Grid layout calculations?",
      "checkpoint_options": [
          "One frame per second in CSS animations.",
          "One fraction of the remaining free space inside the grid container.",
          "One fixed rem unit relative to the root font size.",
          "One percentage of the total browser viewport height."
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "The fr unit represents a fraction of the remaining available space inside the grid container after fixed tracks are allocated.",
      "topic": "HTML & CSS Foundations",
      "difficulty": "Beginner"
  },
  "html-css-l6": {
      "id": "html-css-l6",
      "title": "Responsive Design & Mobile-First Media Queries",
      "type": "project",
      "objective": "Assemble a responsive portfolio landing page layout using fluid typography, media queries, and mobile-first breakpoints.",
      "concept_guide": "Mobile-First Responsive Web Design is the industry standard practice of designing the base CSS styles for small viewports first, then using progressive enhancement via min-width media queries to enhance layouts for larger screens.\n\nBenefits of Mobile-First design:\n1. Performance: Mobile devices load lightweight core styles without downloading unnecessary desktop desktop desktop rules.\n2. Usability: Forces developers to prioritize essential content before expanding spatial real estate.\n\nStandard Breakpoint Conventions:\n- Mobile Small: 320px - 480px\n- Tablet: 768px (`@media (min-width: 768px)`)\n- Desktop: 1024px (`@media (min-width: 1024px)`)\n- Ultra Wide: 1280px+",
      "code_example": "/* Base Mobile Styles */\n.hero-container {\n  display: flex;\n  flex-direction: column;\n  padding: 1.5rem;\n}\n\n/* Tablet & Desktop Enhancement */\n@media (min-width: 768px) {\n  .hero-container {\n    flex-direction: row;\n    align-items: center;\n    padding: 4rem;\n  }\n}",
      "practical_exercise": "Take your semantic web page layout and write media queries to transform a stacked 1-column mobile layout into a multi-column desktop layout above 768px.",
      "checkpoint_question": "In mobile-first responsive design, which media query parameter is typically used to progressively enhance layouts?",
      "checkpoint_options": [
          "(max-width: 768px)",
          "(min-width: 768px)",
          "(orientation: portrait)",
          "(device-pixel-ratio: 2)"
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "min-width queries target viewports at or above the specified width threshold, enabling mobile-first progressive enhancement.",
      "topic": "HTML & CSS Foundations",
      "difficulty": "Beginner"
  },
  "js-fund-l1": {
      "id": "js-fund-l1",
      "title": "ES6+ Syntax, Let/Const & Variable Scoping",
      "type": "concept",
      "objective": "Understand block scoping, temporal dead zone, immutability conventions, and template literal interpolation.",
      "concept_guide": "JavaScript (ECMAScript) is the dynamic programming language of the web. ES6 (2015) revolutionized JavaScript by introducing modern variable declarations: `let` and `const`.\n\nScoping Differences:\n- `var`: Function-scoped or globally-scoped. Subject to hoisting quirks where variables can be accessed before declaration as undefined.\n- `let`: Block-scoped (enclosed within `{}`). Reassignable value.\n- `const`: Block-scoped. Cannot be reassigned after initialization.\n\nImportant: `const` prevents variable identifier reassignment, but does NOT make object or array contents immutable! Properties of a `const` object can still be modified.\n\nTemplate literals (` ${expr} `) enable clean string interpolation and multi-line string construction without cumbersome concatenation.",
      "code_example": "const learner = { name: \"Alex\", score: 95 };\nlearner.score = 98; // Valid property mutation\n\nlet statusMessage = \"In Progress\";\nstatusMessage = \"Completed\"; // Valid variable reassignment\n\nconst summary = `Learner ${learner.name} scored ${learner.score}%. Status: ${statusMessage}.`;\nconsole.log(summary);",
      "practical_exercise": "Write a function that accepts a user object and returns a formatted multi-line summary string using ES6 template literals and destructuring.",
      "checkpoint_question": "What happens if you attempt to reassign a variable declared with const (e.g. const x = 10; x = 20;)?",
      "checkpoint_options": [
          "x silently converts to a let variable and accepts 20.",
          "JavaScript throws a TypeError: Assignment to constant variable.",
          "The variable value becomes undefined.",
          "The value automatically rolls back to 10."
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "Reassigning a const variable throws an explicit TypeError at runtime.",
      "topic": "JavaScript Fundamentals",
      "difficulty": "Beginner"
  },
  "js-fund-l2": {
      "id": "js-fund-l2",
      "title": "Functions, Lexical Scope & Closures",
      "type": "concept",
      "objective": "Master first-class function expressions, arrow function lexical this binding, and closure scope preservation.",
      "concept_guide": "Functions in JavaScript are first-class objects, meaning they can be assigned to variables, passed as arguments to other functions, and returned from function calls.\n\nA Closure is the combination of a function bundled together with references to its surrounding lexical environment. In plain terms: an inner function always retains access to variables declared in its outer parent scope, even after the parent function has finished executing!\n\nClosures enable data privacy, module encapsulation, and state preservation in functional programming patterns.",
      "code_example": "function createScoreCounter(initialScore = 0) {\n  let count = initialScore; // Private encapsulated state\n\n  return {\n    increment: () => ++count,\n    decrement: () => --count,\n    getValue: () => count\n  };\n}\n\nconst alexCounter = createScoreCounter(10);\nalexCounter.increment(); // 11\nconsole.log(alexCounter.getValue()); // 11 (count is inaccessible directly)",
      "practical_exercise": "Build a function named `createIdGenerator(prefix)` that returns a closure generating sequential IDs (e.g. `user_1`, `user_2`).",
      "checkpoint_question": "What defines a closure in JavaScript?",
      "checkpoint_options": [
          "A function that automatically closes all open database connections.",
          "An inner function that retains access to variables from its outer lexical scope after the outer function has returned.",
          "A block of CSS code that closes a flexbox container.",
          "An async function that returns a Promise resolved value."
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "A closure allows an inner function to remember and access variables from its outer lexical environment even after execution completes.",
      "topic": "JavaScript Fundamentals",
      "difficulty": "Beginner"
  },
  "js-fund-l3": {
      "id": "js-fund-l3",
      "title": "DOM Node Selection & Event Delegation",
      "type": "exercise",
      "objective": "Interact with the browser DOM tree, attach event listeners, and utilize event delegation bubbling.",
      "concept_guide": "The Document Object Model (DOM) is an object-oriented representation of the webpage hierarchy. JavaScript uses methods like `document.querySelector()` and `document.querySelectorAll()` to query DOM elements using standard CSS selector strings.\n\nEvent Propagation flows through three phases:\n1. Capturing Phase: Event descends from window to target element.\n2. Target Phase: Event reaches target node.\n3. Bubbling Phase: Event ascends from target node back up through parent DOM ancestors.\n\nEvent Delegation leverages event bubbling by attaching a single event listener to a parent element rather than attaching individual listeners to dozens of child elements. When a child is clicked, the event bubbles up to the parent listener, which inspects `event.target` to handle the action efficiently!",
      "code_example": "const todoList = document.querySelector('#todo-list');\n\n// Event Delegation on parent container\ntodoList.addEventListener('click', (event) => {\n  if (event.target.matches('.delete-btn')) {\n    const item = event.target.closest('li');\n    item.remove();\n  }\n});",
      "practical_exercise": "Create an interactive list where clicking any list item toggles a `.completed` CSS class on that specific item using a single event listener on the parent ul.",
      "checkpoint_question": "Why is event delegation more efficient than attaching event listeners to 100 individual button elements?",
      "checkpoint_options": [
          "It uses less memory by creating only 1 listener function instead of 100 separate event listener instances.",
          "It prevents the browser from making network HTTP calls.",
          "It automatically encrypts user click events.",
          "It forces the DOM to render in WebGL mode."
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Event delegation reduces memory overhead and simplifies dynamic DOM element management by using a single ancestor listener.",
      "topic": "JavaScript Fundamentals",
      "difficulty": "Beginner"
  },
  "js-fund-l4": {
      "id": "js-fund-l4",
      "title": "Promises & Async/Await Control Flow",
      "type": "concept",
      "objective": "Master single-threaded Event Loop execution, Promise states, and async/await syntax error handling.",
      "concept_guide": "JavaScript executes in a single-threaded runtime environment driven by an Event Loop. Asynchronous operations like network requests, timers, and file I/O are offloaded to background Web APIs without blocking the main execution thread.\n\nA Promise is an object representing the eventual completion (or failure) of an asynchronous operation.\nA Promise exists in one of three states:\n1. Pending: Initial state, operation incomplete.\n2. Fulfilled: Operation completed successfully (`resolve(value)`).\n3. Rejected: Operation failed (`reject(error)`).\n\nES2017 introduced `async/await` as syntactic sugar over Promises, allowing developers to write asynchronous code that reads sequentially like synchronous code using `try / catch` error blocks.",
      "code_example": "async function fetchLearnerProfile(userId) {\n  try {\n    const response = await fetch(`/api/profiles/${userId}`);\n    if (!response.ok) {\n      throw new Error(`HTTP Error ${response.status}: Failed to load profile`);\n    }\n    const profileData = await response.json();\n    return profileData;\n  } catch (error) {\n    console.error(\"Network fetch failed:\", error.message);\n    throw error;\n  }\n}",
      "practical_exercise": "Write an async function `loadUserCurriculum(userId)` that fetches user data, validates response status, parses JSON, and logs the returned curriculum plan.",
      "checkpoint_question": "What does the await keyword do when placed before a Promise expression inside an async function?",
      "checkpoint_options": [
          "It terminates the browser tab if the Promise rejects.",
          "It pauses async function execution until the Promise resolves or rejects, returning the fulfilled value.",
          "It forces the Promise to execute synchronously on a secondary multi-threaded worker.",
          "It converts the Promise into a string representation."
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "The await operator pauses async function execution until the Promise settles, resuming with the resolved value or throwing an error if rejected.",
      "topic": "JavaScript Fundamentals",
      "difficulty": "Beginner"
  },
  "js-fund-l5": {
      "id": "js-fund-l5",
      "title": "Fetch API & Remote Data Operations",
      "type": "exercise",
      "objective": "Execute HTTP GET, POST, and PUT operations using fetch, set request headers, and send JSON payloads.",
      "concept_guide": "The Fetch API provides a modern interface for fetching web resources over HTTP/HTTPS protocols.\n\nImportant Fetch Behavior:\n- Fetch Promises only reject on actual network errors (e.g. lost internet connection).\n- Fetch Promises DO NOT reject on HTTP error status codes like 404 (Not Found) or 500 (Internal Server Error)! Developers must manually check `response.ok` (true if status is 200-299).\n\nWhen sending data to a server using POST or PUT:\n1. Specify `method: 'POST'`.\n2. Pass `headers: { 'Content-Type': 'application/json' }`.\n3. Convert data payload into a JSON string using `body: JSON.stringify(data)`.",
      "code_example": "async function saveLessonCompletion(courseId, lessonId) {\n  const payload = { course_id: courseId, lesson_id: lessonId };\n  \n  const res = await fetch('/api/completions', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(payload)\n  });\n\n  if (!res.ok) {\n    throw new Error(`Failed to save completion: ${res.statusText}`);\n  }\n\n  return await res.json();\n}",
      "practical_exercise": "Write a function that posts a new note object `{ title: 'JS Study Note', content: 'Closures are powerful' }` to `/api/notes` and logs the server response.",
      "checkpoint_question": "Why must you check response.ok when using the Fetch API?",
      "checkpoint_options": [
          "Because fetch automatically deletes local files if response is false.",
          "Because fetch does not reject its promise on 404 or 500 HTTP error status codes.",
          "Because response.ok is required to parse CSS stylesheets.",
          "Because fetch only works when response.ok is set to string 'ok'."
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "Fetch resolves its promise normally even if the server returns 404 or 500 error status codes, requiring developers to inspect response.ok.",
      "topic": "JavaScript Fundamentals",
      "difficulty": "Beginner"
  },
  "js-fund-l6": {
      "id": "js-fund-l6",
      "title": "Dynamic Client Application Capstone",
      "type": "project",
      "objective": "Assemble a dynamic client-side application featuring modular state management, DOM rendering, and API persistence.",
      "concept_guide": "Building production-ready client applications requires combining DOM manipulation, event handling, asynchronous fetching, and state management into a clean architecture.\n\nArchitecture Principles:\n1. Single Source of Truth: Store application state in a central object or module.\n2. Render Function: Re-render UI views dynamically whenever application state updates.\n3. Separation of Concerns: Decouple API fetching logic from DOM presentation code.",
      "code_example": "class CourseApp {\n  constructor(apiEndpoint) {\n    this.endpoint = apiEndpoint;\n    this.state = { lessons: [], activeId: null };\n  }\n\n  async init() {\n    this.state.lessons = await fetch(this.endpoint).then(res => res.json());\n    this.render();\n  }\n\n  render() {\n    const list = document.querySelector('#app');\n    list.innerHTML = this.state.lessons.map(l => `\n      <div class=\"card\">${l.title}</div>\n    `).join('');\n  }\n}",
      "practical_exercise": "Build an interactive task tracker app where users can add tasks via a form, toggle completion state, filter by active/completed status, and persist tasks in localStorage.",
      "checkpoint_question": "What is the primary benefit of separating application state from DOM presentation code?",
      "checkpoint_options": [
          "It makes state predictable, easier to test, and enables consistent UI rendering when data changes.",
          "It speeds up internet connection bandwidth.",
          "It bypasses CORS security policies.",
          "It automatically minifies JavaScript source files."
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Decoupling state from DOM representation ensures state changes drive predictable, bug-free UI updates.",
      "topic": "JavaScript Fundamentals",
      "difficulty": "Beginner"
  },
  "git-l1": {
      "id": "git-l1",
      "title": "Version Control Concepts & Local Repositories",
      "type": "concept",
      "objective": "Initialize Git repositories, stage changes, and create atomic commits with descriptive commit messages.",
      "concept_guide": "Git is a distributed version control system (DVCS) that records changes to files over time, allowing developers to recall specific versions, compare code diffs, and collaborate concurrently.\n\nGit maintains three main states for your files:\n1. Working Tree: The active filesystem directory where files are created and edited.\n2. Staging Index (`git add`): The staging area where selected file changes are prepared into atomic snapshots.\n3. Git History (`git commit`): The permanent database of committed snapshots recorded with unique SHA-1 hashes.",
      "code_example": "# Initialize local repository\ngit init\n\n# Check working tree status\ngit status\n\n# Stage specific files\ngit add index.html src/styles.css\n\n# Commit staged snapshot with descriptive message\ngit commit -m \"feat: initialize HTML structure and CSS reset\"",
      "practical_exercise": "Create a local project directory, initialize a git repository, add a README.md file, stage it, and commit it with a clear commit message.",
      "checkpoint_question": "What is the primary purpose of the Git Staging Index (git add)?",
      "checkpoint_options": [
          "To upload files directly to GitHub servers.",
          "To allow developers to select and review granular file changes before recording them into a permanent commit snapshot.",
          "To automatically format code with Prettier.",
          "To compile TypeScript code into JavaScript."
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "The staging index acts as a preparation area where developers choose exactly which changes to bundle into the next commit.",
      "topic": "Git & GitHub Essentials",
      "difficulty": "Beginner"
  },
  "git-l2": {
      "id": "git-l2",
      "title": "Branching Strategies & Feature Isolation",
      "type": "exercise",
      "objective": "Create, switch, and merge feature branches to isolate work without destabilizing the main production branch.",
      "concept_guide": "Branching is one of Git's most powerful capabilities. A branch represents an independent line of development pointing to a specific commit.\n\nBranching Workflows:\n- `main` / `master`: Production-ready code branch. Should always be stable and deployable.\n- `feature/*`: Short-lived isolated branches created for specific features, bug fixes, or experiments.\n\nCreating feature branches ensures that incomplete code never breaks production environments.",
      "code_example": "# Create and switch to new feature branch\ngit checkout -b feature/auth-system\n\n# Perform edits and commit work\ngit add .\ngit commit -m \"feat: implement login form validation\"\n\n# Switch back to main branch and merge feature\ngit checkout main\ngit merge feature/auth-system",
      "practical_exercise": "Create a branch named `feature/footer`, add a footer element to your index.html file, commit the change, switch back to main, and merge the branch.",
      "checkpoint_question": "Which Git command creates a new branch and immediately switches your working tree to it?",
      "checkpoint_options": [
          "git branch new-name",
          "git checkout -b new-name",
          "git merge new-name",
          "git push -u origin new-name"
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "git checkout -b creates the specified branch and checks it out into your active working directory in one command.",
      "topic": "Git & GitHub Essentials",
      "difficulty": "Beginner"
  },
  "git-l3": {
      "id": "git-l3",
      "title": "Remote Repositories & GitHub Synchronization",
      "type": "concept",
      "objective": "Connect local Git repositories to GitHub remote origins, push branches, and pull upstream team updates.",
      "concept_guide": "GitHub is a cloud platform for hosting Git repositories, providing web interfaces, access controls, collaboration tools, and CI/CD automation pipelines.\n\nCommands for Remote Sync:\n- `git remote add origin <url>`: Links local repository to remote GitHub repository.\n- `git push -u origin <branch>`: Uploads local branch commits to GitHub and sets upstream tracking.\n- `git fetch`: Downloads new remote commits without modifying your local working tree.\n- `git pull`: Performs a `git fetch` followed by `git merge` to integrate remote changes into your active branch.",
      "code_example": "# Link local repo to GitHub remote origin\ngit remote add origin https://github.com/user/learnpilot-project.git\n\n# Push main branch to remote and set upstream tracking\ngit push -u origin main\n\n# Pull latest team updates from remote main branch\ngit pull origin main",
      "practical_exercise": "Create a GitHub repository online, connect your local repository via `git remote add origin`, and push your main branch.",
      "checkpoint_question": "What is the key difference between git fetch and git pull?",
      "checkpoint_options": [
          "git fetch deletes local commits, while git pull keeps them.",
          "git fetch downloads remote metadata without modifying working files, whereas git pull fetches and automatically merges changes into your active branch.",
          "git fetch requires admin password privileges, while git pull does not.",
          "git fetch only works on Windows operating systems."
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "git fetch safely inspects remote changes without touching your working files, while git pull immediately fetches and merges.",
      "topic": "Git & GitHub Essentials",
      "difficulty": "Beginner"
  },
  "git-l4": {
      "id": "git-l4",
      "title": "Pull Requests & Collaborative Code Reviews",
      "type": "exercise",
      "objective": "Submit GitHub Pull Requests (PRs), participate in code reviews, and automate quality checks before merging.",
      "concept_guide": "A Pull Request (PR) is a GitHub feature that proposes integrating changes from a feature branch into a target branch (e.g. main).\n\nPR Workflow Benefits:\n1. Code Review: Teammates review diffs, leave comments, and suggest improvements.\n2. Automated Testing: CI/CD runners (GitHub Actions) run automated test suites and linters.\n3. Protected Branches: Prevents direct unreviewed commits to production branches.",
      "code_example": "# Create PR using GitHub CLI\ngh pr create \\\n  --title \"feat: implement standalone course learning workspace\" \\\n  --body \"Adds interactive course workspace with lesson stepper and progress persistence.\" \\\n  --base main \\\n  --head feature/courses-learning-workspace",
      "practical_exercise": "Push a feature branch to GitHub, navigate to the GitHub repository web UI, open a Pull Request against main, and inspect the unified code diff view.",
      "checkpoint_question": "Why are Pull Requests used in team software development?",
      "checkpoint_options": [
          "To force developers to re-install Git every week.",
          "To enable code reviews, automated CI test runs, and peer feedback before merging code into main branches.",
          "To speed up CSS flexbox rendering.",
          "To compile database migrations into SQL files."
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "Pull Requests foster quality control through peer code reviews and automated CI checks before code enters production.",
      "topic": "Git & GitHub Essentials",
      "difficulty": "Beginner"
  },
  "git-l5": {
      "id": "git-l5",
      "title": "Resolving Merge Conflicts",
      "type": "exercise",
      "objective": "Identify conflict markers (<<<<<<< HEAD), resolve competing edits across branches, and finalize merge commits.",
      "concept_guide": "A Merge Conflict occurs when Git tries to merge two branches that modified the exact same lines of code in conflicting ways, or when one branch deleted a file that another branch edited.\n\nGit marks conflicting files and inserts conflict markers directly into the code:\n- `<<<<<<< HEAD`: Indicates changes on your current active branch.\n- `=======`: Separator dividing opposing changes.\n- `>>>>>>> branch-name`: Indicates incoming changes from the branch being merged.\n\nTo resolve:\n1. Inspect conflicting files and edit code to keep intended changes.\n2. Remove conflict marker lines (`<<<<<<<`, `=======`, `>>>>>>>`).\n3. Stage resolved files (`git add`) and commit (`git commit`).",
      "code_example": "<<<<<<< HEAD\nconst API_PORT = process.env.PORT || 3000;\n=======\nconst API_PORT = process.env.PORT || 8080;\n>>>>>>> feature/port-update\n\n/* RESOLVED EDITED CODE */\nconst API_PORT = process.env.PORT || 3000;",
      "practical_exercise": "Simulate a merge conflict by editing line 1 of README.md on two different branches, attempting a merge, removing conflict markers, and committing the resolution.",
      "checkpoint_question": "How do you complete a merge after manually resolving conflict markers in your code editor?",
      "checkpoint_options": [
          "Run git abort --force.",
          "Stage the resolved files with git add and execute git commit.",
          "Delete the .git hidden directory.",
          "Restart the computer operating system."
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "Staging the resolved files with git add signals to Git that conflicts are settled, allowing git commit to record the merge.",
      "topic": "Git & GitHub Essentials",
      "difficulty": "Beginner"
  },
  "react-l1": {
      "id": "react-l1",
      "title": "Declarative Components & JSX Syntax Rules",
      "type": "concept",
      "objective": "Understand Virtual DOM reconciliation, declarative component rendering, and JSX syntax transpilation.",
      "concept_guide": "React is a declarative component-driven JavaScript library for building user interfaces. Instead of manually manipulating DOM nodes using imperative JavaScript (`document.createElement`), React developers declare what the UI should look like for a given state using JSX (JavaScript XML).\n\nVirtual DOM: React maintains a lightweight Virtual DOM representation in memory. When state updates occur, React renders a new Virtual DOM tree, performs a diffing algorithm (Reconciliation), and efficiently updates only the changed real DOM nodes.\n\nJSX Rules:\n1. Component function names MUST start with a capital letter (`MyComponent`).\n2. JSX tags must return a single root element or Fragment (`<>`).\n3. Use `className` instead of `class` and `htmlFor` instead of `for`.\n4. Embed JavaScript expressions inside curly braces `{expression}`.",
      "code_example": "export function LearnerCard({ name, role }: { name: string; role: string }) {\n  const isLead = role === \"Lead Developer\";\n\n  return (\n    <div className=\"card-container\">\n      <h3 className=\"text-sm font-bold\">{name}</h3>\n      <span className={isLead ? \"badge-gold\" : \"badge-blue\"}>\n        {role}\n      </span>\n    </div>\n  );\n}",
      "practical_exercise": "Build a functional React component named `CourseBadge` that accepts `title` and `difficulty` as props and renders styled HTML with dynamic conditional colors.",
      "checkpoint_question": "Why must React components return a single root element or Fragment (<>...</>)?",
      "checkpoint_options": [
          "To allow CSS grid to render 3D graphics.",
          "Because JSX transpiles into React.createElement function calls which expect a single parent element returned.",
          "Because web browsers reject pages with more than 1 HTML tag.",
          "To automatically save component data to local storage."
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "JSX is transpiled into JavaScript function calls, requiring a single enclosing root element or fragment.",
      "topic": "React & Component Architecture",
      "difficulty": "Intermediate"
  },
  "react-l2": {
      "id": "react-l2",
      "title": "Props Unidirectional Data Flow",
      "type": "exercise",
      "objective": "Pass read-only props down component hierarchies and pass event handler callbacks up for parent state updates.",
      "concept_guide": "Data in React flows unidirectionally downward from parent components to child components via `props` (properties).\n\nProps Principles:\n- Props are IMMUTABLE read-only objects. A child component must NEVER attempt to modify its own props.\n- To communicate from child to parent, the parent passes a callback function down as a prop. When an event occurs in the child, it invokes the parent callback, allowing the parent to update its state!",
      "code_example": "// Child Component\nfunction FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {\n  return (\n    <button\n      onClick={onClick}\n      className={active ? \"bg-primary text-white\" : \"bg-muted text-gray font-normal\"}\n    >\n      {label}\n    </button>\n  );\n}",
      "practical_exercise": "Create a `LessonStepper` component where parent state tracks active lesson index and child `NextButton` and `PrevButton` trigger parent index increment and decrement callbacks.",
      "checkpoint_question": "What happens if a child component attempts to directly mutate a prop (e.g. props.title = 'New Title')?",
      "checkpoint_options": [
          "React updates the parent component state automatically.",
          "React throws a runtime error because props are immutable read-only objects.",
          "The browser reloads the page.",
          "The CSS background color turns red."
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "Props are strictly read-only inputs in React; mutating props violates unidirectional data flow and triggers errors.",
      "topic": "React & Component Architecture",
      "difficulty": "Intermediate"
  },
  "react-l3": {
      "id": "react-l3",
      "title": "State Management with useState Hook",
      "type": "exercise",
      "objective": "Declare component state, perform immutable state updates, and handle controlled form inputs using useState.",
      "concept_guide": "State represents data that changes over time within a component. Calling `useState(initialValue)` returns an array containing two elements:\n1. Current State Value.\n2. Setter Function: Function used to update state and trigger a component re-render.\n\nState Update Rules:\n- Never mutate state directly (`state.count = 5` ❌). Always call the setter function (`setCount(5)` ✅).\n- When next state depends on previous state, pass a functional updater (`setCount(prev => prev + 1)`) to avoid closure stale state bugs during batched updates.",
      "code_example": "import { useState } from \"react\";\n\nexport function Counter() {\n  const [count, setCount] = useState(0);\n\n  const handleIncrement = () => {\n    setCount((prevCount) => prevCount + 1);\n  };\n\n  return (\n    <button onClick={handleIncrement} className=\"btn-primary\">\n      Completed Lessons: {count}\n    </button>\n  );\n}",
      "practical_exercise": "Build a controlled search input component using useState where typing updates query state and filters an array of course titles in real-time.",
      "checkpoint_question": "Why should you pass a functional updater (setCount(prev => prev + 1)) when deriving next state from current state?",
      "checkpoint_options": [
          "It forces React to bypass Virtual DOM diffing.",
          "It guarantees working with the most up-to-date state value even during batched asynchronous state updates.",
          "It converts the state value into a database string.",
          "It prevents the button from being double-clicked."
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "Functional state updaters receive the guaranteed latest pending state value during React batched update cycles.",
      "topic": "React & Component Architecture",
      "difficulty": "Intermediate"
  },
  "react-l4": {
      "id": "react-l4",
      "title": "Side Effects & useEffect Lifecycle",
      "type": "concept",
      "objective": "Execute data fetching, DOM subscriptions, and timer side effects while managing dependency arrays and cleanup functions.",
      "concept_guide": "Side effects are operations that interact with the outside world beyond React's pure rendering cycle (e.g. API fetching, DOM listeners, timers, web sockets).\n\nThe `useEffect(effectFunction, dependencyArray)` hook synchronizes side effects with component lifecycle:\n1. No Dependency Array (`useEffect(fn)`): Runs after EVERY render.\n2. Empty Dependency Array (`useEffect(fn, [])`): Runs ONCE after initial component mount.\n3. Specific Dependencies (`useEffect(fn, [id])`): Runs on initial mount AND whenever specified dependency values change.\n\nEffect Cleanup: Returning a cleanup function from `useEffect` ensures timer intervals, event listeners, and API subscriptions are cleaned up before component unmount or re-render.",
      "code_example": "useEffect(() => {\n  let isMounted = true;\n\n  async function loadCourse() {\n    const data = await fetchCourseData(courseId);\n    if (isMounted) setCourse(data);\n  }\n\n  loadCourse();\n\n  return () => {\n    isMounted = false; // Cleanup flag preventing memory leaks\n  };\n}, [courseId]);",
      "practical_exercise": "Write a useEffect hook that attaches a window resize event listener to update a `windowWidth` state variable and returns a cleanup function calling `removeEventListener`.",
      "checkpoint_question": "When does the cleanup function returned from a useEffect hook execute?",
      "checkpoint_options": [
          "Only when the browser window closes.",
          "Before the component unmounts and before re-running the effect on dependency changes.",
          "Immediately before the first initial render.",
          "Whenever a user clicks a button."
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "Cleanup functions execute before component unmounting and prior to re-executing the effect when dependencies change.",
      "topic": "React & Component Architecture",
      "difficulty": "Intermediate"
  },
  "react-l5": {
      "id": "react-l5",
      "title": "Custom Hooks & Logic Reusability",
      "type": "exercise",
      "objective": "Extract component state and effect logic into reusable custom hooks prefixed with use...",
      "concept_guide": "Custom Hooks are JavaScript functions whose names start with `use` and that call other React hooks (`useState`, `useEffect`, `useCallback`).\n\nCustom hooks allow developers to extract complex stateful business logic out of UI component views into reusable, testable utility functions!",
      "code_example": "import { useState, useEffect } from \"react\";\n\nexport function useLocalStorage<T>(key: string, initialValue: T) {\n  const [storedValue, setStoredValue] = useState<T>(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch {\n      return initialValue;\n    }\n  });\n\n  useEffect(() => {\n    window.localStorage.setItem(key, JSON.stringify(storedValue));\n  }, [key, storedValue]);\n\n  return [storedValue, setStoredValue] as const;\n}",
      "practical_exercise": "Build a custom hook named `useFetch(url)` returning `{ data, loading, error }` and consume it inside a `CourseList` component.",
      "checkpoint_question": "What naming convention must all React custom hooks follow?",
      "checkpoint_options": [
          "Must end with ...Component",
          "Must start with the lowercase prefix 'use' (e.g. useCourseProgress)",
          "Must be written in capital letters (e.g. USE_DATA)",
          "Must start with 'get'"
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "React requires custom hooks to start with 'use' so linter rules can verify hook usage rules automatically.",
      "topic": "React & Component Architecture",
      "difficulty": "Intermediate"
  },
  "react-l6": {
      "id": "react-l6",
      "title": "Interactive Course Application Capstone",
      "type": "project",
      "objective": "Build a full-featured interactive React learning application with tabbed views, custom hooks, and persistent completion state.",
      "concept_guide": "Assembling scalable React applications requires organizing components into clear directory structures, maintaining clean prop interfaces, and using custom hooks for state management.",
      "code_example": "export default function CourseWorkspaceApp() {\n  const { course, loading } = useCourseData();\n  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);\n\n  if (loading) return <LoadingSpinner />;\n\n  return (\n    <div className=\"flex h-screen border border-border\">\n      <LessonSidebar course={course} activeId={activeLessonId} onSelect={setActiveLessonId} />\n      <LessonWorkspace lessonId={activeLessonId} />\n    </div>\n  );\n}",
      "practical_exercise": "Build an interactive course learning workspace application with lesson selection sidebar, reading area, and progress calculation.",
      "checkpoint_question": "Which component architecture pattern promotes high maintainability and testability in React applications?",
      "checkpoint_options": [
          "Writing all application code inside a single 5000-line index.js file.",
          "Decomposing UI into small, focused presentational components and extracting stateful logic into custom hooks.",
          "Using inline style attributes for every element.",
          "Storing all state in global window variables."
      ],
      "checkpoint_correct_index": 1,
      "checkpoint_explanation": "Separating UI into modular presentational components and isolating stateful logic in custom hooks promotes maintainability.",
      "topic": "React & Component Architecture",
      "difficulty": "Intermediate"
  },
  "auto-gen-1": {

      "id": "auto-gen-1",
      "title": "Web Fundamentals Knowledge Checkpoint",
      "type": "concept",
      "objective": "This checkpoint verifies your understanding of HTML semantics, CSS box model, and responsive design principles.",
      "concept_guide": "This checkpoint verifies your understanding of HTML semantics, CSS box model, and responsive design principles.",
      "code_example": "<!DOCTYPE html>\\n<html>\\n<head>\\n<style>\\n.box { box-sizing: border-box; }\\n</style>\\n</head>\\n<body>\\n<div class='box'>Test</div>\\n</body>\\n</html>",
      "practical_exercise": "Review your semantic tags and ensure your layout is responsive.",
      "checkpoint_question": "What does box-sizing: border-box do?",
      "checkpoint_options": [
            "Includes padding and border in the element's total width",
            "Excludes padding from width",
            "Makes the element a flex container",
            "Adds a border automatically"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "border-box ensures that padding and borders are included in the element's specified width and height.",
      "topic": "HTML/CSS Foundations",
      "difficulty": "Intermediate"
  },
  "auto-gen-2": {

      "id": "auto-gen-2",
      "title": "Interactive DOM Manipulation Project",
      "type": "project",
      "objective": "The DOM (Document Object Model) is a programming interface for web documents.",
      "concept_guide": "The DOM (Document Object Model) is a programming interface for web documents. It represents the page so that programs can change the document structure, style, and content. You will build an interactive to-do list.",
      "code_example": "const btn = document.getElementById('add');\\nbtn.addEventListener('click', () => {\\n  const li = document.createElement('li');\\n  li.textContent = 'New Task';\\n  document.querySelector('ul').appendChild(li);\\n});",
      "practical_exercise": "Build a task list where you can add, complete, and delete items using vanilla JavaScript DOM methods.",
      "checkpoint_question": "Which method creates a new DOM element?",
      "checkpoint_options": [
            "document.createElement()",
            "document.newElement()",
            "document.addNode()",
            "window.create()"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "document.createElement() creates the HTML element specified by the tag name.",
      "topic": "DOM",
      "difficulty": "Intermediate"
  },
  "auto-gen-3": {

      "id": "auto-gen-3",
      "title": "JavaScript Fundamentals Checkpoint",
      "type": "reflection",
      "objective": "JavaScript is a synchronous, single-threaded language with a non-blocking event loop.",
      "concept_guide": "JavaScript is a synchronous, single-threaded language with a non-blocking event loop. This checkpoint tests closures, scope, and basic event handling.",
      "code_example": "function closureExample() {\\n  let count = 0;\\n  return () => count++;\\n}",
      "practical_exercise": "Reflect on how closures preserve scope in your recent projects.",
      "checkpoint_question": "What is a closure?",
      "checkpoint_options": [
            "A function that has access to its outer function scope even after the outer function has returned",
            "A way to close the browser window",
            "A method to end a loop",
            "A secure way to encrypt data"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Closures allow inner functions to access variables from an enclosing scope.",
      "topic": "JavaScript",
      "difficulty": "Intermediate"
  },
  "auto-gen-4": {

      "id": "auto-gen-4",
      "title": "JavaScript Event Loop & Concurrency Model",
      "type": "concept",
      "objective": "The event loop is responsible for executing the code, collecting and processing events, and executing queued sub-tasks.",
      "concept_guide": "The event loop is responsible for executing the code, collecting and processing events, and executing queued sub-tasks. The call stack handles synchronous code, while the task queue handles asynchronous callbacks (like setTimeout).",
      "code_example": "console.log('1');\\nsetTimeout(() => console.log('2'), 0);\\nPromise.resolve().then(() => console.log('3'));\\nconsole.log('4');\\n// Output: 1, 4, 3, 2",
      "practical_exercise": "Trace the execution order of synchronous code, promises (microtasks), and setTimeouts (macrotasks) in the provided snippet.",
      "checkpoint_question": "Which queue has higher priority in the event loop?",
      "checkpoint_options": [
            "Microtask queue (Promises)",
            "Macrotask queue (setTimeout)",
            "Render queue",
            "Callback queue"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "The microtask queue is emptied immediately after the currently executing script and before any macrotasks.",
      "topic": "JavaScript",
      "difficulty": "Intermediate"
  },
  "auto-gen-5": {

      "id": "auto-gen-5",
      "title": "Async/Await Control Flow",
      "type": "concept",
      "objective": "Async/await is syntactic sugar over Promises, allowing you to write asynchronous code that looks and behaves like synchronous code.",
      "concept_guide": "Async/await is syntactic sugar over Promises, allowing you to write asynchronous code that looks and behaves like synchronous code. An async function always returns a Promise.",
      "code_example": "async function fetchData() {\\n  try {\\n    const res = await fetch('https://api.example.com/data');\\n    const data = await res.json();\\n    return data;\\n  } catch (err) {\\n    console.error(err);\\n  }\\n}",
      "practical_exercise": "Rewrite a Promise chain using async/await and wrap it in a try/catch block.",
      "checkpoint_question": "What does the await keyword do?",
      "checkpoint_options": [
            "Pauses the execution of the async function until the Promise settles",
            "Stops the entire JavaScript thread",
            "Automatically retries failed requests",
            "Makes the function run synchronously"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "await pauses the async function execution until the Promise resolves or rejects.",
      "topic": "JavaScript",
      "difficulty": "Intermediate"
  },
  "auto-gen-6": {

      "id": "auto-gen-6",
      "title": "Prototypal Inheritance & the Prototype Chain",
      "type": "concept",
      "objective": "JavaScript objects have a special hidden property [[Prototype]] (accessed via __proto__ or Object.",
      "concept_guide": "JavaScript objects have a special hidden property [[Prototype]] (accessed via __proto__ or Object.getPrototypeOf). When reading a property, if it's missing, JavaScript automatically takes it from the prototype.",
      "code_example": "const animal = { eats: true };\\nconst rabbit = { jumps: true };\\nrabbit.__proto__ = animal;\\nconsole.log(rabbit.eats); // true",
      "practical_exercise": "Create a class hierarchy using ES6 classes and inspect their prototype chain in the console.",
      "checkpoint_question": "If an object doesn't have a property, where does JavaScript look next?",
      "checkpoint_options": [
            "Its prototype",
            "The global window object",
            "The Object constructor",
            "It throws an error immediately"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "JavaScript traverses up the prototype chain to find the property.",
      "topic": "JavaScript",
      "difficulty": "Intermediate"
  },
  "auto-gen-7": {

      "id": "auto-gen-7",
      "title": "Memory Management & Garbage Collection",
      "type": "concept",
      "objective": "JavaScript automatically allocates memory when objects are created and frees it when they are not used anymore (Garbage Collection).",
      "concept_guide": "JavaScript automatically allocates memory when objects are created and frees it when they are not used anymore (Garbage Collection). The main algorithm is 'mark-and-sweep', which removes unreachable objects.",
      "code_example": "let user = { name: 'John' };\\nuser = null; // The object { name: 'John' } becomes unreachable and is garbage collected.",
      "practical_exercise": "Identify a memory leak caused by a forgotten setInterval or an unremoved event listener in a component.",
      "checkpoint_question": "What makes an object eligible for garbage collection in JavaScript?",
      "checkpoint_options": [
            "When it becomes unreachable from the root (e.g., window)",
            "When it is set to false",
            "When the function returns",
            "When the browser tab is minimized"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Unreachable objects cannot be accessed by the application and are safely deleted by the garbage collector.",
      "topic": "JavaScript",
      "difficulty": "Intermediate"
  },
  "auto-gen-8": {

      "id": "auto-gen-8",
      "title": "ES Modules, Bundlers & Tree Shaking",
      "type": "exercise",
      "objective": "ES Modules (ESM) use import and export statements to share code.",
      "concept_guide": "ES Modules (ESM) use import and export statements to share code. Bundlers like Webpack or Vite combine these modules into a single file. Tree shaking is the process of removing dead (unused) code from the final bundle.",
      "code_example": "// math.js\\nexport const add = (a, b) => a + b;\\nexport const sub = (a, b) => a - b;\\n\\n// main.js\\nimport { add } from './math.js';\\n// 'sub' can be tree-shaken away",
      "practical_exercise": "Configure a basic Vite project, write modular functions, and observe how only imported functions end up in the build output.",
      "checkpoint_question": "What is tree shaking?",
      "checkpoint_options": [
            "Dead code elimination in module bundlers",
            "A method to parse JSON",
            "An animation library for React",
            "A way to compress image assets"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Tree shaking removes unused exports from the final JavaScript bundle, reducing file size.",
      "topic": "JavaScript",
      "difficulty": "Intermediate"
  },
  "auto-gen-9": {

      "id": "auto-gen-9",
      "title": "Web Workers & Thread Offloading",
      "type": "project",
      "objective": "Web Workers allow you to run JavaScript in background threads, preventing CPU-intensive tasks from blocking the main UI thread.",
      "concept_guide": "Web Workers allow you to run JavaScript in background threads, preventing CPU-intensive tasks from blocking the main UI thread. They communicate with the main thread via postMessage.",
      "code_example": "// worker.js\\nonmessage = function(e) {\\n  let result = heavyComputation(e.data);\\n  postMessage(result);\\n}\\n// main.js\\nconst worker = new Worker('worker.js');\\nworker.postMessage(data);",
      "practical_exercise": "Build an application that calculates prime numbers. Offload the heavy loop to a Web Worker so the UI remains responsive.",
      "checkpoint_question": "How do Web Workers communicate with the main thread?",
      "checkpoint_options": [
            "Using the postMessage API",
            "By sharing memory directly",
            "Through localStorage",
            "Via HTTP requests"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Workers run in an isolated context and pass messages asynchronously using postMessage.",
      "topic": "JavaScript",
      "difficulty": "Intermediate"
  },
  "auto-gen-10": {

      "id": "auto-gen-10",
      "title": "React Server Components vs Client Components",
      "type": "concept",
      "objective": "Server Components run exclusively on the server, reducing bundle size and allowing direct access to backend resources (like databases).",
      "concept_guide": "Server Components run exclusively on the server, reducing bundle size and allowing direct access to backend resources (like databases). Client Components run in the browser and support interactivity (useState, onClick).",
      "code_example": "// Server Component\\nimport db from './db';\\nexport default async function Page() {\\n  const data = await db.query();\\n  return <div>{data}</div>;\\n}",
      "practical_exercise": "Refactor a Next.js page to extract interactive parts into a separate Client Component ('use client'), keeping the parent as a Server Component.",
      "checkpoint_question": "Which feature is NOT available in a React Server Component?",
      "checkpoint_options": [
            "useState and useEffect hooks",
            "Direct database access",
            "Async/await rendering",
            "Reading server files"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Server Components cannot use state, effects, or browser APIs because they never run in the browser.",
      "topic": "React",
      "difficulty": "Intermediate"
  },
  "auto-gen-11": {

      "id": "auto-gen-11",
      "title": "Next.js App Router Layouts & Nested Routing",
      "type": "exercise",
      "objective": "Next.",
      "concept_guide": "Next.js App Router uses folders to define routes. layout.tsx wraps pages and preserves state across navigations. page.tsx is the UI unique to a route.",
      "code_example": "// app/dashboard/layout.tsx\\nexport default function Layout({ children }) {\\n  return <><nav>Sidebar</nav><main>{children}</main></>;\\n}",
      "practical_exercise": "Create a nested routing structure with a shared dashboard layout and nested settings/profile pages.",
      "checkpoint_question": "What is the purpose of layout.tsx in the Next.js App Router?",
      "checkpoint_options": [
            "To share UI across multiple routes and preserve state during navigation",
            "To define API endpoints",
            "To handle 404 errors",
            "To configure Tailwind CSS"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Layouts wrap nested pages and do not re-render entirely on navigation, preserving their own state.",
      "topic": "React",
      "difficulty": "Intermediate"
  },
  "auto-gen-12": {

      "id": "auto-gen-12",
      "title": "Server Actions Data Mutations & Form Validation",
      "type": "exercise",
      "objective": "Server Actions allow you to run asynchronous code directly on the server from client or server components, replacing traditional API routes for form submissions.",
      "concept_guide": "Server Actions allow you to run asynchronous code directly on the server from client or server components, replacing traditional API routes for form submissions.",
      "code_example": "export default function Form() {\\n  async function createPost(formData: FormData) {\\n    \\'use server\\'\\n    await db.post.insert({ title: formData.get('title') })\\n  }\\n  return <form action={createPost}><input name='title'/><button>Save</button></form>\\n}",
      "practical_exercise": "Implement a form with a Server Action that validates input using Zod, inserts data into a database, and calls revalidatePath.",
      "checkpoint_question": "What directive is used to mark a function as a Server Action?",
      "checkpoint_options": [
            "'use server'",
            "'use client'",
            "'server only'",
            "@server"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "'use server' tells the bundler to create a secure endpoint for this function to be called from the client.",
      "topic": "React",
      "difficulty": "Intermediate"
  },
  "auto-gen-13": {

      "id": "auto-gen-13",
      "title": "Custom React Hooks Abstraction & Context API",
      "type": "exercise",
      "objective": "Custom hooks allow you to extract and reuse stateful logic.",
      "concept_guide": "Custom hooks allow you to extract and reuse stateful logic. The Context API provides a way to pass data through the component tree without prop drilling.",
      "code_example": "function useWindowSize() {\\n  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);\\n  useEffect(() => {\\n    const handleResize = () => setSize([window.innerWidth, window.innerHeight]);\\n    window.addEventListener('resize', handleResize);\\n    return () => window.removeEventListener('resize', handleResize);\\n  }, []);\\n  return size;\\n}",
      "practical_exercise": "Create a custom useAuth hook coupled with an AuthContext provider to manage user sessions application-wide.",
      "checkpoint_question": "What must a custom hook's name start with?",
      "checkpoint_options": [
            "use",
            "get",
            "hook",
            "It doesn't matter"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Custom hooks must start with 'use' so React can enforce the Rules of Hooks.",
      "topic": "React",
      "difficulty": "Intermediate"
  },
  "auto-gen-14": {

      "id": "auto-gen-14",
      "title": "High-Performance Next.js Project",
      "type": "project",
      "objective": "Optimizing Next.",
      "concept_guide": "Optimizing Next.js apps involves leveraging Server Components, implementing caching (fetch cache, memoization), streaming with Suspense, and optimizing images using next/image.",
      "code_example": "import { Suspense } from 'react';\\nimport { Skeleton } from './Skeleton';\\nexport default function Page() {\\n  return (\\n    <Suspense fallback={<Skeleton />}>\\n      <SlowDataFetchingComponent />\\n    </Suspense>\\n  );\\n}",
      "practical_exercise": "Build a production-ready application that utilizes Suspense boundaries to stream UI chunks progressively to the client.",
      "checkpoint_question": "How does React Suspense improve the user experience?",
      "checkpoint_options": [
            "By showing a fallback UI while an asynchronous operation (like data fetching) completes",
            "By making API calls twice as fast",
            "By compressing images automatically",
            "By preventing CSS from blocking render"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Suspense lets you declaratively specify a loading state while a component waits for data or code to load.",
      "topic": "React",
      "difficulty": "Intermediate"
  },
  "auto-gen-15": {

      "id": "auto-gen-15",
      "title": "Node.js Runtime & HTTP Protocol Fundamentals",
      "type": "concept",
      "objective": "Node.",
      "concept_guide": "Node.js is a runtime that executes JavaScript outside the browser using the V8 engine. It uses an event-driven, non-blocking I/O model. HTTP is the protocol used for transmitting hypermedia documents.",
      "code_example": "const http = require('http');\\nconst server = http.createServer((req, res) => {\\n  res.writeHead(200, { 'Content-Type': 'text/plain' });\\n  res.end('Hello World');\\n});\\nserver.listen(3000);",
      "practical_exercise": "Create a raw Node.js HTTP server that parses the request URL and responds with different messages based on the route.",
      "checkpoint_question": "What architectural pattern allows Node.js to handle thousands of concurrent connections efficiently?",
      "checkpoint_options": [
            "Non-blocking, event-driven I/O",
            "Multi-threading with thread pools",
            "Synchronous blocking execution",
            "Object-Oriented Programming"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Node.js uses a single-threaded event loop to handle non-blocking I/O operations concurrently.",
      "topic": "Backend",
      "difficulty": "Intermediate"
  },
  "auto-gen-16": {

      "id": "auto-gen-16",
      "title": "RESTful API Design Principles & Routing",
      "type": "exercise",
      "objective": "REST (Representational State Transfer) relies on stateless, client-server communication using standard HTTP methods (GET, POST, PUT, DELETE) and resource-based URLs (e.",
      "concept_guide": "REST (Representational State Transfer) relies on stateless, client-server communication using standard HTTP methods (GET, POST, PUT, DELETE) and resource-based URLs (e.g., /users/123).",
      "code_example": "app.get('/api/users/:id', async (req, res) => {\\n  const user = await db.getUser(req.params.id);\\n  res.json(user);\\n});",
      "practical_exercise": "Design a RESTful router using Express for a 'Books' resource supporting CRUD operations.",
      "checkpoint_question": "Which HTTP method is idempotent and typically used to update an entire resource?",
      "checkpoint_options": [
            "PUT",
            "POST",
            "PATCH",
            "OPTIONS"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "PUT is idempotent (repeated requests have the same effect) and replaces the target resource entirely.",
      "topic": "Backend",
      "difficulty": "Intermediate"
  },
  "auto-gen-17": {

      "id": "auto-gen-17",
      "title": "Request Validation & Error Handling Middleware",
      "type": "exercise",
      "objective": "Middleware are functions that execute during the request-response cycle.",
      "concept_guide": "Middleware are functions that execute during the request-response cycle. They can validate incoming payloads and catch errors to prevent server crashes and send standardized error responses.",
      "code_example": "app.use((err, req, res, next) => {\\n  console.error(err.stack);\\n  res.status(500).json({ error: 'Internal Server Error' });\\n});",
      "practical_exercise": "Implement Zod validation middleware to verify POST bodies before they reach your controller logic.",
      "checkpoint_question": "In Express, how does a middleware function pass control to the next function in the stack?",
      "checkpoint_options": [
            "By calling the next() function",
            "By returning true",
            "By calling res.send()",
            "By throwing an exception"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Calling next() passes execution to the next middleware or route handler.",
      "topic": "Backend",
      "difficulty": "Intermediate"
  },
  "auto-gen-18": {

      "id": "auto-gen-18",
      "title": "Build a Robust REST API Project",
      "type": "project",
      "objective": "A robust API features modular routing, environment variable configuration, secure headers, CORS support, validation, and a structured database abstraction layer.",
      "concept_guide": "A robust API features modular routing, environment variable configuration, secure headers, CORS support, validation, and a structured database abstraction layer.",
      "code_example": "const express = require('express');\\nconst helmet = require('helmet');\\nconst app = express();\\napp.use(helmet());\\napp.use(express.json());\\n// ... route definitions",
      "practical_exercise": "Construct a full Express.js API serving a frontend application, complete with logging, error handling, and data persistence.",
      "checkpoint_question": "What is the purpose of the CORS middleware?",
      "checkpoint_options": [
            "To allow cross-origin HTTP requests from browsers",
            "To encrypt database passwords",
            "To compress HTTP responses",
            "To validate JSON schemas"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Cross-Origin Resource Sharing (CORS) is a security feature that controls how web pages request resources from a different domain.",
      "topic": "Backend",
      "difficulty": "Intermediate"
  },
  "auto-gen-19": {

      "id": "auto-gen-19",
      "title": "Relational Database Concepts & Normalization",
      "type": "concept",
      "objective": "Relational databases organize data into tables with columns and rows.",
      "concept_guide": "Relational databases organize data into tables with columns and rows. Normalization is the process of structuring a database to reduce redundancy and improve data integrity using primary and foreign keys.",
      "code_example": "CREATE TABLE users (\\n  id SERIAL PRIMARY KEY,\\n  email VARCHAR(255) UNIQUE NOT NULL\\n);\\nCREATE TABLE posts (\\n  id SERIAL PRIMARY KEY,\\n  user_id INT REFERENCES users(id),\\n  title VARCHAR(255)\\n);",
      "practical_exercise": "Design a normalized schema for an e-commerce store with users, orders, and products.",
      "checkpoint_question": "What is a Foreign Key?",
      "checkpoint_options": [
            "A column that uniquely identifies a row in another table",
            "The main identifier for a table",
            "An encrypted password field",
            "A database index for fast searching"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "A foreign key establishes a link between data in two tables.",
      "topic": "Backend",
      "difficulty": "Intermediate"
  },
  "auto-gen-20": {

      "id": "auto-gen-20",
      "title": "SQL Queries: Joins, Grouping & Aggregation",
      "type": "exercise",
      "objective": "SQL allows complex data retrieval.",
      "concept_guide": "SQL allows complex data retrieval. JOINs combine rows from two or more tables based on a related column. GROUP BY groups rows that have the same values, used with aggregations like COUNT, SUM, or AVG.",
      "code_example": "SELECT users.name, COUNT(posts.id) as post_count \\nFROM users \\nLEFT JOIN posts ON users.id = posts.user_id \\nGROUP BY users.id;",
      "practical_exercise": "Write a SQL query that retrieves the top 5 users with the highest number of completed courses.",
      "checkpoint_question": "Which JOIN returns all records from the left table, and the matched records from the right table?",
      "checkpoint_options": [
            "LEFT JOIN",
            "INNER JOIN",
            "RIGHT JOIN",
            "FULL OUTER JOIN"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "LEFT JOIN returns all left table records, filling right table columns with NULL if no match exists.",
      "topic": "Backend",
      "difficulty": "Intermediate"
  },
  "auto-gen-21": {

      "id": "auto-gen-21",
      "title": "PostgreSQL Client Integration & ORMs",
      "type": "exercise",
      "objective": "An ORM (Object-Relational Mapper) maps database tables to classes/objects in your code (e.",
      "concept_guide": "An ORM (Object-Relational Mapper) maps database tables to classes/objects in your code (e.g., Prisma, TypeORM), simplifying query writing and providing type safety.",
      "code_example": "// Using Prisma ORM\\nconst newPost = await prisma.post.create({\\n  data: {\\n    title: 'Hello World',\\n    authorId: 1\\n  }\\n});",
      "practical_exercise": "Set up Prisma in a project, define a schema, run migrations, and write a script to query data.",
      "checkpoint_question": "What is a major benefit of using an ORM like Prisma with TypeScript?",
      "checkpoint_options": [
            "Auto-generated type definitions for database queries",
            "It makes the database run faster",
            "It eliminates the need for a database server",
            "It automatically writes CSS"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "ORMs provide strong typing, ensuring your code expects the correct schema structures.",
      "topic": "Backend",
      "difficulty": "Intermediate"
  },
  "auto-gen-22": {

      "id": "auto-gen-22",
      "title": "Database Integration Capstone Project",
      "type": "project",
      "objective": "Integrating a database into an application requires connection pooling, environment variable management (DATABASE_URL), and handling transaction failures gracefully.",
      "concept_guide": "Integrating a database into an application requires connection pooling, environment variable management (DATABASE_URL), and handling transaction failures gracefully.",
      "code_example": "// Database connection pool setup\\nconst { Pool } = require('pg');\\nconst pool = new Pool({ connectionString: process.env.DATABASE_URL });\\nmodule.exports = pool;",
      "practical_exercise": "Build a backend API that executes complex transactions across multiple tables, ensuring rollback on failure.",
      "checkpoint_question": "What is connection pooling?",
      "checkpoint_options": [
            "Maintaining a cache of database connections to be reused for future requests",
            "Merging two databases together",
            "Using WebSockets for database queries",
            "Downloading the entire database to memory"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Connection pooling avoids the overhead of establishing a new database connection for every query.",
      "topic": "Backend",
      "difficulty": "Intermediate"
  },
  "auto-gen-23": {

      "id": "auto-gen-23",
      "title": "GraphQL Schema Definition & Resolver Implementation",
      "type": "exercise",
      "objective": "GraphQL is a query language for APIs.",
      "concept_guide": "GraphQL is a query language for APIs. Unlike REST, clients request exactly the data they need. It relies on a typed Schema and Resolvers that fetch the data for those fields.",
      "code_example": "type Query {\\n  user(id: ID!): User\\n}\\ntype User {\\n  id: ID!\\n  name: String!\\n  posts: [Post]\\n}",
      "practical_exercise": "Define a GraphQL schema for a blog and implement resolvers that fetch data from a mock database.",
      "checkpoint_question": "In GraphQL, what determines the structure of the response?",
      "checkpoint_options": [
            "The client's query",
            "The server's routing setup",
            "The database schema",
            "The HTTP method used"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "The client explicitly specifies the fields it wants in the query, and the response matches that shape exactly.",
      "topic": "Backend",
      "difficulty": "Intermediate"
  },
  "auto-gen-24": {

      "id": "auto-gen-24",
      "title": "PostgreSQL Indexing & Query Optimization",
      "type": "concept",
      "objective": "Indexes improve data retrieval speed by creating a structured lookup table (like a book index).",
      "concept_guide": "Indexes improve data retrieval speed by creating a structured lookup table (like a book index). However, they slow down write operations (INSERT, UPDATE) because the index must also be updated.",
      "code_example": "CREATE INDEX idx_users_email ON users(email);\\nEXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';",
      "practical_exercise": "Use EXPLAIN ANALYZE on a large table to observe the performance difference before and after adding an index.",
      "checkpoint_question": "When should you typically add an index to a database column?",
      "checkpoint_options": [
            "When the column is frequently used in WHERE clauses or JOIN conditions",
            "On every single column in the table",
            "Only on columns containing boolean values",
            "When the table has less than 100 rows"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Indexes dramatically speed up lookups for frequently queried columns.",
      "topic": "Backend",
      "difficulty": "Intermediate"
  },
  "auto-gen-25": {

      "id": "auto-gen-25",
      "title": "Authentication, JWT & Granular Row Level Security (RLS)",
      "type": "exercise",
      "objective": "JSON Web Tokens (JWT) are securely signed tokens used for stateless authentication.",
      "concept_guide": "JSON Web Tokens (JWT) are securely signed tokens used for stateless authentication. Row Level Security (RLS) in databases like PostgreSQL restricts which rows a user can read or modify based on their identity.",
      "code_example": "ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;\\nCREATE POLICY 'Users can only view their own data'\\nON user_data FOR SELECT\\nUSING (auth.uid() = user_id);",
      "practical_exercise": "Implement JWT verification middleware and configure PostgreSQL RLS policies in a Supabase project.",
      "checkpoint_question": "What prevents a JWT from being forged or tampered with by the client?",
      "checkpoint_options": [
            "The cryptographic signature verified by the server's secret key",
            "It is encrypted using AES-256",
            "It is stored in an HttpOnly cookie",
            "It automatically expires"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "The signature guarantees that the token payload has not been modified since the server issued it.",
      "topic": "Backend",
      "difficulty": "Intermediate"
  },
  "auto-gen-26": {

      "id": "auto-gen-26",
      "title": "Secure Multi-Tenant Enterprise Backend Project",
      "type": "project",
      "objective": "Multi-tenant architectures serve multiple organizations (tenants) from a single database.",
      "concept_guide": "Multi-tenant architectures serve multiple organizations (tenants) from a single database. Tenant isolation must be strictly enforced using RLS or tenant_id checks on every query.",
      "code_example": "SELECT * FROM invoices WHERE tenant_id = $1 AND invoice_id = $2;",
      "practical_exercise": "Build a multi-tenant API where users belong to organizations, and ensure users cannot access data outside their organization.",
      "checkpoint_question": "What is the primary security risk in a multi-tenant application?",
      "checkpoint_options": [
            "Cross-tenant data leakage",
            "SQL Injection",
            "Cross-Site Scripting (XSS)",
            "Denial of Service (DoS)"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Failing to enforce tenant isolation properly allows one customer to view or modify another customer's data.",
      "topic": "Backend",
      "difficulty": "Intermediate"
  },
  "auto-gen-27": {

      "id": "auto-gen-27",
      "title": "Serverless Deployments & Edge Infrastructure",
      "type": "concept",
      "objective": "Serverless functions (like AWS Lambda, Vercel) scale to zero and bill per execution.",
      "concept_guide": "Serverless functions (like AWS Lambda, Vercel) scale to zero and bill per execution. Edge computing runs logic geographically close to the user via CDN nodes, reducing latency.",
      "code_example": "export const config = { runtime: 'edge' };\\nexport default function handler(req) {\\n  return new Response('Hello from the Edge!');\\n}",
      "practical_exercise": "Deploy a Next.js application to Vercel and write an Edge Middleware function to rewrite paths based on geolocation.",
      "checkpoint_question": "What is a primary characteristic of serverless computing?",
      "checkpoint_options": [
            "Automatic scaling and pay-per-execution billing",
            "You manage the physical hardware",
            "Server instances run 24/7 constantly",
            "It only supports JavaScript"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Serverless platforms automatically handle scaling up and scaling down to zero.",
      "topic": "Fullstack",
      "difficulty": "Intermediate"
  },
  "auto-gen-28": {

      "id": "auto-gen-28",
      "title": "Automated CI/CD Pipeline Configuration",
      "type": "exercise",
      "objective": "CI/CD (Continuous Integration/Continuous Deployment) automates testing and deployment.",
      "concept_guide": "CI/CD (Continuous Integration/Continuous Deployment) automates testing and deployment. GitHub Actions allows you to define workflows in YAML that run on push or PR.",
      "code_example": "name: CI\\non: [push]\\njobs:\\n  test:\\n    runs-on: ubuntu-latest\\n    steps:\\n      - uses: actions/checkout@v3\\n      - run: npm ci\\n      - run: npm test",
      "practical_exercise": "Create a GitHub Actions workflow that runs ESLint and Jest tests automatically on every pull request.",
      "checkpoint_question": "What is the purpose of Continuous Integration (CI)?",
      "checkpoint_options": [
            "To automatically build and test code changes frequently",
            "To deploy code to production immediately",
            "To write code automatically using AI",
            "To manage database migrations"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "CI ensures that new code changes integrate smoothly and pass automated quality checks.",
      "topic": "Fullstack",
      "difficulty": "Intermediate"
  },
  "auto-gen-29": {

      "id": "auto-gen-29",
      "title": "Real User Monitoring & Core Web Vitals Optimization",
      "type": "project",
      "objective": "Core Web Vitals are Google's metrics for UX: LCP (Largest Contentful Paint), FID (First Input Delay), and CLS (Cumulative Layout Shift).",
      "concept_guide": "Core Web Vitals are Google's metrics for UX: LCP (Largest Contentful Paint), FID (First Input Delay), and CLS (Cumulative Layout Shift). Optimizing them involves lazy loading, optimizing fonts/images, and reducing JS execution.",
      "code_example": "import Image from 'next/image';\\n// Automatically optimizes webp, handles lazy loading and prevents CLS\\n<Image src='/hero.jpg' width={800} height={400} alt='Hero' />",
      "practical_exercise": "Audit a web application using Lighthouse, identify a CLS issue caused by unoptimized images, and fix it.",
      "checkpoint_question": "Which Core Web Vital metric measures visual stability (elements moving unexpectedly)?",
      "checkpoint_options": [
            "Cumulative Layout Shift (CLS)",
            "Largest Contentful Paint (LCP)",
            "First Input Delay (FID)",
            "Time to First Byte (TTFB)"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "CLS measures how much the page layout shifts unexpectedly during loading.",
      "topic": "Fullstack",
      "difficulty": "Intermediate"
  },
  "auto-gen-30": {

      "id": "auto-gen-30",
      "title": "Large Language Model Architecture Overview",
      "type": "concept",
      "objective": "LLMs like GPT-4 are based on the Transformer architecture.",
      "concept_guide": "LLMs like GPT-4 are based on the Transformer architecture. They process text using self-attention mechanisms, predicting the most probable next token based on the provided context window.",
      "code_example": "// Example representation of token generation\\nlet context = 'The sky is';\\nlet nextToken = model.predict(context); // ' blue'",
      "practical_exercise": "Explore a token counting tool to see how sentences are broken down into sub-word tokens by byte-pair encoding (BPE).",
      "checkpoint_question": "What is the primary underlying architecture of modern LLMs?",
      "checkpoint_options": [
            "The Transformer",
            "Recurrent Neural Networks (RNN)",
            "Convolutional Neural Networks (CNN)",
            "Decision Trees"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "The Transformer architecture, introduced in 2017, relies on self-attention and enables massive parallelization.",
      "topic": "AI",
      "difficulty": "Intermediate"
  },
  "auto-gen-31": {

      "id": "auto-gen-31",
      "title": "API Integration, Authentication & Streaming Responses",
      "type": "exercise",
      "objective": "Integrating AI involves calling APIs (e.",
      "concept_guide": "Integrating AI involves calling APIs (e.g., OpenAI). For responsive UX, responses are often streamed back chunk-by-chunk using Server-Sent Events (SSE) instead of waiting for the full generation.",
      "code_example": "const completion = await openai.chat.completions.create({\\n  model: 'gpt-4',\\n  messages: [{ role: 'user', content: 'Hello!' }],\\n  stream: true,\\n});\\nfor await (const chunk of completion) {\\n  process.stdout.write(chunk.choices[0]?.delta?.content || '');\\n}",
      "practical_exercise": "Build a Node.js endpoint that streams an AI response back to a client application in real-time.",
      "checkpoint_question": "Why is streaming important in LLM chat applications?",
      "checkpoint_options": [
            "It reduces perceived latency by displaying text as it is generated",
            "It reduces API costs",
            "It makes the AI smarter",
            "It prevents the AI from hallucinating"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Streaming improves UX significantly by showing output immediately, rather than waiting seconds for the whole response.",
      "topic": "AI",
      "difficulty": "Intermediate"
  },
  "auto-gen-32": {

      "id": "auto-gen-32",
      "title": "Advanced Prompt Engineering & System Directives",
      "type": "exercise",
      "objective": "Prompt engineering involves crafting inputs to guide the model.",
      "concept_guide": "Prompt engineering involves crafting inputs to guide the model. System prompts define the model's persona and rules. Few-shot prompting provides examples to guide the output format.",
      "code_example": "const messages = [\\n  { role: 'system', content: 'You are an API that only responds with valid JSON.' },\\n  { role: 'user', content: 'Extract names from: Alice and Bob' }\\n];",
      "practical_exercise": "Write a system prompt that forces the AI to evaluate a coding assignment and output a strict JSON grading rubric.",
      "checkpoint_question": "What is 'few-shot' prompting?",
      "checkpoint_options": [
            "Providing the model with a few examples of desired input-output pairs",
            "Giving the model limited time to respond",
            "Using a very short prompt",
            "Prompting the model multiple times in parallel"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Few-shot prompting shows the model exactly how you want it to behave using examples.",
      "topic": "AI",
      "difficulty": "Intermediate"
  },
  "auto-gen-33": {

      "id": "auto-gen-33",
      "title": "AI Assistant Capstone Project",
      "type": "project",
      "objective": "An AI assistant needs conversation history management, context truncation, and robust error handling to maintain a coherent multi-turn dialogue.",
      "concept_guide": "An AI assistant needs conversation history management, context truncation, and robust error handling to maintain a coherent multi-turn dialogue.",
      "code_example": "// Maintaining context window\\nlet conversationHistory = [];\\nfunction chat(userInput) {\\n  conversationHistory.push({ role: 'user', content: userInput });\\n  // truncate history if it exceeds token limits...\\n}",
      "practical_exercise": "Build a full-stack AI chat interface that remembers past messages and uses a custom system prompt.",
      "checkpoint_question": "Why must conversation history be managed carefully in an AI app?",
      "checkpoint_options": [
            "Because LLMs have a maximum context window (token limit)",
            "Because it slows down the database",
            "Because the AI forgets things automatically",
            "To save on local storage space"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "If the conversation exceeds the model's token limit, the API request will fail, necessitating truncation.",
      "topic": "AI",
      "difficulty": "Intermediate"
  },
  "auto-gen-34": {

      "id": "auto-gen-34",
      "title": "Text Embeddings & Semantic Vector Space",
      "type": "concept",
      "objective": "Embeddings convert text into high-dimensional numerical vectors.",
      "concept_guide": "Embeddings convert text into high-dimensional numerical vectors. Texts with similar semantic meanings will have vectors that are closer together in this mathematical space, enabling semantic search.",
      "code_example": "const vector1 = [0.1, 0.5, -0.2]; // 'Dog'\\nconst vector2 = [0.12, 0.48, -0.19]; // 'Puppy'\\n// Cosine similarity between these vectors will be high.",
      "practical_exercise": "Generate embeddings for several sentences and calculate the cosine similarity between them using a script.",
      "checkpoint_question": "What do text embeddings capture that keyword search does not?",
      "checkpoint_options": [
            "Semantic meaning and context",
            "Exact spelling matches",
            "Punctuation errors",
            "Word counts"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Embeddings capture the underlying meaning, so 'car' and 'automobile' are recognized as similar.",
      "topic": "AI",
      "difficulty": "Intermediate"
  },
  "auto-gen-35": {

      "id": "auto-gen-35",
      "title": "Vector Database Setup & Similarity Search",
      "type": "exercise",
      "objective": "Vector databases (like Pinecone, Qdrant, or pgvector) are designed to store embeddings and perform rapid similarity searches (k-nearest neighbors) at scale.",
      "concept_guide": "Vector databases (like Pinecone, Qdrant, or pgvector) are designed to store embeddings and perform rapid similarity searches (k-nearest neighbors) at scale.",
      "code_example": "// PostgreSQL pgvector extension\\nSELECT text_chunk FROM document_embeddings \\nORDER BY embedding <=> '[0.1, 0.2, 0.3]' LIMIT 5;",
      "practical_exercise": "Set up a local instance of pgvector, insert text embeddings, and query for the 3 most similar documents to a search query.",
      "checkpoint_question": "What is the primary operation performed by a Vector Database?",
      "checkpoint_options": [
            "Similarity Search (finding vectors closest to a query vector)",
            "Relational table joins",
            "Key-value caching",
            "Full-text indexing"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Vector databases specialize in calculating mathematical distances between high-dimensional vectors to find similarities.",
      "topic": "AI",
      "difficulty": "Intermediate"
  },
  "auto-gen-36": {

      "id": "auto-gen-36",
      "title": "RAG Pipeline Orchestration",
      "type": "project",
      "objective": "Retrieval-Augmented Generation (RAG) combines semantic search with LLMs.",
      "concept_guide": "Retrieval-Augmented Generation (RAG) combines semantic search with LLMs. Step 1: Embed user query. Step 2: Search vector DB for relevant context. Step 3: Pass context + query to the LLM to generate an informed answer.",
      "code_example": "const context = await vectorDb.search(userQuery);\\nconst prompt = `Answer the query using ONLY this context: ${context}\\nQuery: ${userQuery}`;\\nconst answer = await llm.generate(prompt);",
      "practical_exercise": "Build a script that ingests a PDF, chunks the text, creates embeddings, and allows a user to ask questions about the document.",
      "checkpoint_question": "What problem does RAG primarily solve in Large Language Models?",
      "checkpoint_options": [
            "Hallucinations and lack of access to private/recent data",
            "Slow response times",
            "High API costs",
            "Context window limitations"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "RAG grounds the LLM by providing factual, retrieved context in the prompt, reducing hallucinations.",
      "topic": "AI",
      "difficulty": "Intermediate"
  },
  "auto-gen-37": {

      "id": "auto-gen-37",
      "title": "Domain Conceptual Architecture",
      "type": "concept",
      "objective": "Understanding the conceptual architecture of a new domain involves mapping its core paradigms, data flow, and separation of concerns before writing code.",
      "concept_guide": "Understanding the conceptual architecture of a new domain involves mapping its core paradigms, data flow, and separation of concerns before writing code.",
      "code_example": "// Architecture mapping\\n// UI Layer <-> Business Logic <-> Data Access Layer",
      "practical_exercise": "Draw a block diagram of the domain architecture identifying the key components and their interactions.",
      "checkpoint_question": "Why is conceptual architecture important?",
      "checkpoint_options": [
            "It provides a high-level roadmap and structural understanding before implementation",
            "It writes the code for you",
            "It makes the app run faster",
            "It bypasses security checks"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "A strong conceptual understanding prevents fundamental structural mistakes during implementation.",
      "topic": "Generic",
      "difficulty": "Intermediate"
  },
  "auto-gen-38": {

      "id": "auto-gen-38",
      "title": "Environment Setup & Tooling Configuration",
      "type": "exercise",
      "objective": "Setting up the development environment correctly (compilers, linters, SDKs, environment variables) is a critical prerequisite for any project.",
      "concept_guide": "Setting up the development environment correctly (compilers, linters, SDKs, environment variables) is a critical prerequisite for any project.",
      "code_example": "# Example setup commands\\nnpm install\\ncp .env.example .env\\nnpm run dev",
      "practical_exercise": "Follow the setup documentation to initialize the project, install dependencies, and successfully run the local development server.",
      "checkpoint_question": "What is the purpose of an .env file?",
      "checkpoint_options": [
            "To store configuration and secrets securely outside of version control",
            "To style the application",
            "To define database schemas",
            "To list project dependencies"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Environment variables keep secrets like API keys out of source code repositories.",
      "topic": "Generic",
      "difficulty": "Intermediate"
  },
  "auto-gen-39": {

      "id": "auto-gen-39",
      "title": "First Practical Implementation Project",
      "type": "project",
      "objective": "The first practical implementation (a 'Hello World' or 'Todo App') validates that the environment is working and the developer understands the basic syntax and flow.",
      "concept_guide": "The first practical implementation (a 'Hello World' or 'Todo App') validates that the environment is working and the developer understands the basic syntax and flow.",
      "code_example": "function bootstrap() {\\n  console.log('System initialized and ready.');\\n}\\nbootstrap();",
      "practical_exercise": "Build the minimal viable implementation of the domain's core concept from scratch.",
      "checkpoint_question": "What is the goal of a minimal viable implementation?",
      "checkpoint_options": [
            "To prove the end-to-end setup works and grasp the core mechanics",
            "To build a production-ready enterprise app",
            "To pass a coding interview",
            "To optimize server performance"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Building a minimal version proves understanding of the fundamentals and verifies the environment.",
      "topic": "Generic",
      "difficulty": "Intermediate"
  },
  "auto-gen-40": {

      "id": "auto-gen-40",
      "title": "Standard Architecture Patterns",
      "type": "concept",
      "objective": "Design patterns (like MVC, Singleton, Factory, Repository) provide proven solutions to common architectural problems, making code more maintainable and readable to other developers.",
      "concept_guide": "Design patterns (like MVC, Singleton, Factory, Repository) provide proven solutions to common architectural problems, making code more maintainable and readable to other developers.",
      "code_example": "class Singleton {\\n  static instance;\\n  constructor() {\\n    if (Singleton.instance) return Singleton.instance;\\n    Singleton.instance = this;\\n  }\\n}",
      "practical_exercise": "Identify where the Model-View-Controller (MVC) pattern is used within your current framework.",
      "checkpoint_question": "What is a software design pattern?",
      "checkpoint_options": [
            "A reusable solution to a commonly occurring problem in software design",
            "A specific programming language",
            "A UI component library",
            "A database query technique"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Patterns are proven templates for solving recurring architectural challenges.",
      "topic": "Generic",
      "difficulty": "Intermediate"
  },
  "auto-gen-41": {

      "id": "auto-gen-41",
      "title": "Implementation & Debugging Workflow",
      "type": "exercise",
      "objective": "Effective debugging involves isolating variables, reading stack traces, using breakpoints (or console logs), and searching for root causes systematically rather than guessing.",
      "concept_guide": "Effective debugging involves isolating variables, reading stack traces, using breakpoints (or console logs), and searching for root causes systematically rather than guessing.",
      "code_example": "try {\\n  riskyOperation();\\n} catch (error) {\\n  console.error('Operation failed at step 2:', error.stack);\\n}",
      "practical_exercise": "Introduce a bug into your application and use the debugger tool in your IDE to step through the code and inspect variable states.",
      "checkpoint_question": "What is a stack trace?",
      "checkpoint_options": [
            "A report of the active stack frames showing the function calls that led to an error",
            "A list of all variables in the application",
            "A network activity log",
            "A database backup file"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "The stack trace shows exactly which function called which function, leading up to the crash.",
      "topic": "Generic",
      "difficulty": "Intermediate"
  },
  "auto-gen-42": {

      "id": "auto-gen-42",
      "title": "Comprehensive Feature Integration Project",
      "type": "project",
      "objective": "Feature integration requires combining multiple sub-systems (UI, API, database) into a cohesive workflow, handling edge cases and loading states.",
      "concept_guide": "Feature integration requires combining multiple sub-systems (UI, API, database) into a cohesive workflow, handling edge cases and loading states.",
      "code_example": "// End-to-end feature flow\\nUI.onSubmit(async (data) => {\\n  UI.setLoading(true);\\n  await API.saveData(data);\\n  UI.setLoading(false);\\n});",
      "practical_exercise": "Implement a complete user flow from frontend click to database persistence and back to UI update.",
      "checkpoint_question": "Why are loading states important in feature integration?",
      "checkpoint_options": [
            "They provide visual feedback to the user during asynchronous operations",
            "They make the code run faster",
            "They prevent hackers from attacking",
            "They compile the CSS"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Loading states prevent user frustration and duplicate actions while waiting for the backend.",
      "topic": "Generic",
      "difficulty": "Intermediate"
  },
  "auto-gen-43": {

      "id": "auto-gen-43",
      "title": "Advanced System Design & Scalability",
      "type": "concept",
      "objective": "System design at scale involves load balancing, caching (Redis), asynchronous message queues (RabbitMQ/Kafka), and horizontal vs vertical scaling.",
      "concept_guide": "System design at scale involves load balancing, caching (Redis), asynchronous message queues (RabbitMQ/Kafka), and horizontal vs vertical scaling.",
      "code_example": "// Caching strategy example\\nlet data = cache.get(key);\\nif (!data) {\\n  data = await db.query(key);\\n  cache.set(key, data, { ttl: 3600 });\\n}",
      "practical_exercise": "Design a system architecture diagram for an application expecting 1 million daily active users.",
      "checkpoint_question": "What is horizontal scaling?",
      "checkpoint_options": [
            "Adding more server instances to distribute the load",
            "Upgrading a single server with more RAM and CPU",
            "Using a faster database",
            "Minifying JavaScript code"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Horizontal scaling involves provisioning additional servers behind a load balancer.",
      "topic": "Generic",
      "difficulty": "Intermediate"
  },
  "auto-gen-44": {

      "id": "auto-gen-44",
      "title": "Performance Profiling & Optimization",
      "type": "exercise",
      "objective": "Profiling involves measuring memory usage, CPU time, and network latency to identify bottlenecks.",
      "concept_guide": "Profiling involves measuring memory usage, CPU time, and network latency to identify bottlenecks. Optimization might involve memoization, indexing, or bundle splitting.",
      "code_example": "console.time('heavyTask');\\nperformHeavyTask();\\nconsole.timeEnd('heavyTask');",
      "practical_exercise": "Use Chrome DevTools Performance tab to record a profile of your app, identify a slow function, and optimize it.",
      "checkpoint_question": "What is memoization?",
      "checkpoint_options": [
            "Caching the result of an expensive function call based on its inputs",
            "Writing memos in the code comments",
            "A type of database index",
            "A memory leak"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Memoization stores function results so that repeated calls with the same inputs return instantly.",
      "topic": "Generic",
      "difficulty": "Intermediate"
  },
  "auto-gen-45": {

      "id": "auto-gen-45",
      "title": "Production Readiness Capstone Deployment",
      "type": "project",
      "objective": "Production readiness requires configuring environment variables securely, setting up CI/CD, enabling HTTPS, configuring domain names, and establishing logging/monitoring.",
      "concept_guide": "Production readiness requires configuring environment variables securely, setting up CI/CD, enabling HTTPS, configuring domain names, and establishing logging/monitoring.",
      "code_example": "// Production logging\\nconst logger = require('winston');\\nlogger.info('Server started in production mode on port 443');",
      "practical_exercise": "Deploy your application to a production environment, configure a custom domain, and secure it with an SSL certificate.",
      "checkpoint_question": "Which is a critical checklist item before going to production?",
      "checkpoint_options": [
            "Ensuring all secret keys are managed securely via environment variables",
            "Leaving debug mode enabled",
            "Committing the .env file to GitHub",
            "Using console.log for all monitoring"
      ],
      "checkpoint_correct_index": 0,
      "checkpoint_explanation": "Secret management is critical to prevent API keys and database credentials from being compromised.",
      "topic": "Generic",
      "difficulty": "Intermediate"
  }
}