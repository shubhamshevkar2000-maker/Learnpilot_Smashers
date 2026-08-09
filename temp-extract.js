
    const courses = [
  {
    id: "course-html-css",
    title: "HTML & CSS Foundations",
    description: "Master modern HTML5 semantics, accessibility standards, Flexbox/Grid spatial layouts, and responsive CSS architecture.",
    category: "frontend",
    difficulty: "Beginner",
    estimated_minutes: 145,
    lessons: [
      {
        id: "html-css-l1",
        course_id: "course-html-css",
        title: "HTML5 Document Structure & Syntax Rules",
        lesson_type: "concept",
        sequence_order: 1,
        estimated_minutes: 20,
        objective: "Master standard HTML5 document syntax, doctype declarations, head metadata, and tag nesting hierarchy.",
        concept_guide: `HTML (HyperText Markup Language) provides the fundamental structural blueprint of every webpage on the internet. Browsers parse HTML documents from top to bottom, constructing a Document Object Model (DOM) tree in memory.

The <!DOCTYPE html> declaration informs the browser engine that the document complies with the modern HTML5 specification, preventing browsers from triggering legacy "quirks mode".

Inside the root <html> element, the document is partitioned into two primary children:
1. <head>: Contains non-visual metadata, document title, character encoding (<meta charset="UTF-8">), viewport scaling rules, and linked external stylesheet assets.
2. <body>: Encloses all renderable UI content including text, images, forms, and structural sections.

Strict syntax rules dictate that all opening tags must be properly closed or self-closed, attributes must be enclosed in quotes, and elements must follow clean ancestor-descendant nesting without overlapping tags.`,
        code_example: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML5 Structural Blueprint</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>Modern Web Development</h1>
    <p>Building accessible, performant interfaces</p>
  </header>
  <main>
    <article>
      <h2>Document Object Model Hierarchy</h2>
      <p>HTML tags construct DOM nodes parsed sequentially by web browsers.</p>
    </article>
  </main>
  <footer>
    <p>&copy; 2026 LearnPilot Academy</p>
  </footer>
</body>
</html>`,
        code_explanation: "This snippet demonstrates a standards-compliant HTML5 document with charset encoding, responsive viewport meta tags, semantic landmarks (header, main, article, footer), and clean hierarchy.",
        practical_exercise: "Open your code editor and build an HTML5 file named `index.html`. Add a valid head section with viewport metadata, a title of 'My First Web Page', and a body containing a main element with an h1 heading and two paragraph elements.",
        checkpoint_question: "Why is the <!DOCTYPE html> declaration placed at the very first line of an HTML document?",
        checkpoint_options: [
          "It forces the browser to download external JavaScript files faster.",
          "It informs the browser to parse the page using standard HTML5 rendering rules instead of quirks mode.",
          "It creates an encrypted secure connection to the web server.",
          "It styles the page with default CSS framework reset rules."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "The doctype declaration tells the browser's rendering engine that the document follows the HTML5 specification, preventing legacy rendering quirks."
      },
      {
        id: "html-css-l2",
        course_id: "course-html-css",
        title: "Semantic Elements & ARIA Accessibility",
        lesson_type: "exercise",
        sequence_order: 2,
        estimated_minutes: 25,
        objective: "Apply HTML5 semantic sectioning elements and ARIA accessibility roles to create machine-readable document landmarks.",
        concept_guide: `In early web development, layouts were constructed using generic <div> tags with custom class names like <div class="header">. HTML5 introduced semantic elements (<header>, <nav>, <main>, <article>, <section>, <aside>, <footer>) that explicitly describe their content's purpose to browsers, search engines, and screen readers.

Semantic markup produces clear document outlines and enhances web accessibility (a11y). Screen reader users rely on landmark navigation keys to jump directly between main content, navigation bars, and footers.

When native HTML elements cannot fully express a custom widget's interactive state, WAI-ARIA (Accessible Rich Internet Applications) attributes bridge the gap using roles (role="dialog"), states (aria-expanded="true"), and accessible names (aria-label="Close modal window").`,
        code_example: `<header role="banner" className="site-header">
  <nav aria-label="Primary Navigation">
    <ul>
      <li><a href="#courses">Courses</a></li>
      <li><a href="#about">About</a></li>
    </ul>
  </nav>
</header>

<main id="main-content">
  <section aria-labelledby="section-heading">
    <h2 id="section-heading">Semantic Principles</h2>
    <article className="card">
      <h3>Accessibility First</h3>
      <p>Semantic tags allow assistive tools to navigate page landmarks seamlessly.</p>
    </article>
  </section>
</main>`,
        code_explanation: "Demonstrates semantic landmarks with ARIA attributes (aria-label, aria-labelledby) for screen reader accessibility.",
        practical_exercise: "Refactor a webpage layout consisting entirely of <div> elements into semantic elements (<header>, <nav>, <main>, <article>, <footer>) and add an aria-label to the navigation bar.",
        checkpoint_question: "Which HTML element should be used to enclose self-contained, independently redistributable content like a blog post or news article?",
        checkpoint_options: [
          "<section>",
          "<div>",
          "<article>",
          "<aside>"
        ],
        checkpoint_correct_index: 2,
        checkpoint_explanation: "The <article> element represents a self-contained composition intended to be independently reusable or redistributable."
      },
      {
        id: "html-css-l3",
        course_id: "course-html-css",
        title: "CSS Selectors, Specificity & Box Model",
        lesson_type: "concept",
        sequence_order: 3,
        estimated_minutes: 20,
        objective: "Master CSS rule declaration syntax, selector specificity calculation, and element dimension box model physics.",
        concept_guide: `CSS (Cascading Style Sheets) controls the visual presentation, typography, and spatial geometry of HTML elements.

The CSS Box Model is the foundational layout physics engine. Every HTML element is modeled as a rectangular box comprising four concentric layers:
1. Content Box: Where text, images, and child elements render.
2. Padding: Transparent buffer space surrounding the content.
3. Border: Visible line surrounding the padding.
4. Margin: Transparent outer spacing separating the element from sibling boxes.

By default, CSS uses content-box sizing where width specifies only the content width, causing padding and borders to expand total element size. Applying \`box-sizing: border-box\` universally forces width and height to include padding and border inside specified dimensions.

CSS Specificity determines which style rules apply when multiple selectors target the same element:
Inline Styles (1000) > IDs (100) > Classes/Attributes (10) > Elements/Types (1).`,
        code_example: `/* Universal Box Sizing Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Card Component Box Model */
.card-container {
  width: 320px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin: 16px auto;
  border-radius: 12px;
  background-color: #1e293b;
}`,
        code_explanation: "Defines universal box-sizing reset and demonstrates explicit padding, border, and margin rules.",
        practical_exercise: "Calculate total calculated element width for a div with width: 300px, padding: 20px, and border: 2px under content-box vs border-box.",
        checkpoint_question: "With box-sizing: border-box enabled, what is the total rendered width of an element with width: 250px, padding: 20px, and border: 5px?",
        checkpoint_options: [
          "300px",
          "250px",
          "275px",
          "295px"
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "With border-box, total width remains exactly equal to the specified width (250px) because padding and border are absorbed inward."
      },
      {
        id: "html-css-l4",
        course_id: "course-html-css",
        title: "CSS Flexbox One-Dimensional Layout Systems",
        lesson_type: "exercise",
        sequence_order: 4,
        estimated_minutes: 25,
        objective: "Construct dynamic flexible rows and columns using Flexbox container properties and item distribution controls.",
        concept_guide: `Flexbox (Flexible Box Layout) is a one-dimensional CSS layout system designed for distributing space and aligning items along a single axis (either row or column).

When \`display: flex\` is declared on a container:
1. Main Axis: Defined by flex-direction (row default, column). Justified using \`justify-content\` (flex-start, flex-end, center, space-between, space-around, space-evenly).
2. Cross Axis: Perpendicular to the main axis. Aligned using \`align-items\` (flex-start, flex-end, center, stretch, baseline).

Individual flex items can grow to fill available space (\`flex-grow: 1\`), shrink when constrained (\`flex-shrink: 1\`), or establish a base size (\`flex-basis: 200px\`).`,
        code_example: `.navbar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 2rem;
  background-color: #0f172a;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
  list-style: none;
}`,
        code_explanation: "Demonstrates flexbox container alignment to distribute brand logo and navigation link items across a header bar.",
        practical_exercise: "Create a flexbox container holding three pricing cards. Align the cards side by side with equal gaps and ensure all cards stretch to match the tallest card's height.",
        checkpoint_question: "Which Flexbox property controls item alignment along the MAIN axis?",
        checkpoint_options: [
          "align-items",
          "justify-content",
          "flex-wrap",
          "align-content"
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "justify-content aligns items along the primary main axis established by flex-direction."
      },
      {
        id: "html-css-l5",
        course_id: "course-html-css",
        title: "CSS Grid Two-Dimensional Spatial Systems",
        lesson_type: "exercise",
        sequence_order: 5,
        estimated_minutes: 25,
        objective: "Design two-dimensional grid layouts with explicit columns, rows, fractional fr units, and responsive auto-fit minmax patterns.",
        concept_guide: `CSS Grid is a two-dimensional spatial layout system capable of handling both rows and columns simultaneously.

Unlike Flexbox which works from content outward, Grid allows developers to define a structural layout mesh first and place content items into explicit grid tracks.

Key Grid properties:
- \`grid-template-columns\`: Defines track widths using pixels, percentages, or flexible fractional units (\`1fr\`).
- \`gap\`: Defines spatial gutters between tracks.
- Responsive grid magic: \`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\` creates an auto-responsive layout grid that automatically wraps columns into rows without needing media queries!`,
        code_example: `.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.grid-card {
  background: #1e293b;
  border-radius: 1rem;
  padding: 1.5rem;
}`,
        code_explanation: "Uses auto-fit and minmax to create a responsive multi-column dashboard grid that adapts smoothly across screen sizes.",
        practical_exercise: "Build a photo gallery grid displaying 6 images in a 3-column layout on desktop that dynamically reflows to 2 columns on tablet and 1 column on mobile screens.",
        checkpoint_question: "What does the fractional unit (1fr) represent in CSS Grid layout calculations?",
        checkpoint_options: [
          "One frame per second in CSS animations.",
          "One fraction of the remaining free space inside the grid container.",
          "One fixed rem unit relative to the root font size.",
          "One percentage of the total browser viewport height."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "The fr unit represents a fraction of the remaining available space inside the grid container after fixed tracks are allocated."
      },
      {
        id: "html-css-l6",
        course_id: "course-html-css",
        title: "Responsive Design & Mobile-First Media Queries",
        lesson_type: "project",
        sequence_order: 6,
        estimated_minutes: 30,
        objective: "Assemble a responsive portfolio landing page layout using fluid typography, media queries, and mobile-first breakpoints.",
        concept_guide: `Mobile-First Responsive Web Design is the industry standard practice of designing the base CSS styles for small viewports first, then using progressive enhancement via min-width media queries to enhance layouts for larger screens.

Benefits of Mobile-First design:
1. Performance: Mobile devices load lightweight core styles without downloading unnecessary desktop desktop desktop rules.
2. Usability: Forces developers to prioritize essential content before expanding spatial real estate.

Standard Breakpoint Conventions:
- Mobile Small: 320px - 480px
- Tablet: 768px (\`@media (min-width: 768px)\`)
- Desktop: 1024px (\`@media (min-width: 1024px)\`)
- Ultra Wide: 1280px+`,
        code_example: `/* Base Mobile Styles */
.hero-container {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

/* Tablet & Desktop Enhancement */
@media (min-width: 768px) {
  .hero-container {
    flex-direction: row;
    align-items: center;
    padding: 4rem;
  }
}`,
        code_explanation: "Demonstrates mobile-first flex-direction stacking that converts into a horizontal row at tablet width (768px).",
        practical_exercise: "Take your semantic web page layout and write media queries to transform a stacked 1-column mobile layout into a multi-column desktop layout above 768px.",
        checkpoint_question: "In mobile-first responsive design, which media query parameter is typically used to progressively enhance layouts?",
        checkpoint_options: [
          "(max-width: 768px)",
          "(min-width: 768px)",
          "(orientation: portrait)",
          "(device-pixel-ratio: 2)"
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "min-width queries target viewports at or above the specified width threshold, enabling mobile-first progressive enhancement."
      }
    ]
  },
  {
    id: "course-javascript-fundamentals",
    title: "JavaScript Fundamentals",
    description: "Deep dive into ES6+ syntax, functions, closures, DOM manipulation, promises, async/await, and event handling.",
    category: "javascript",
    difficulty: "Beginner",
    estimated_minutes: 140,
    lessons: [
      {
        id: "js-fund-l1",
        course_id: "course-javascript-fundamentals",
        title: "ES6+ Syntax, Let/Const & Variable Scoping",
        lesson_type: "concept",
        sequence_order: 1,
        estimated_minutes: 20,
        objective: "Understand block scoping, temporal dead zone, immutability conventions, and template literal interpolation.",
        concept_guide: `JavaScript (ECMAScript) is the dynamic programming language of the web. ES6 (2015) revolutionized JavaScript by introducing modern variable declarations: \`let\` and \`const\`.

Scoping Differences:
- \`var\`: Function-scoped or globally-scoped. Subject to hoisting quirks where variables can be accessed before declaration as undefined.
- \`let\`: Block-scoped (enclosed within \`{}\`). Reassignable value.
- \`const\`: Block-scoped. Cannot be reassigned after initialization.

Important: \`const\` prevents variable identifier reassignment, but does NOT make object or array contents immutable! Properties of a \`const\` object can still be modified.

Template literals (\` \${expr} \`) enable clean string interpolation and multi-line string construction without cumbersome concatenation.`,
        code_example: `const learner = { name: "Alex", score: 95 };
learner.score = 98; // Valid property mutation

let statusMessage = "In Progress";
statusMessage = "Completed"; // Valid variable reassignment

const summary = \`Learner \${learner.name} scored \${learner.score}%. Status: \${statusMessage}.\`;
console.log(summary);`,
        code_explanation: "Demonstrates const object property mutation versus let variable reassignment and template literal string interpolation.",
        practical_exercise: "Write a function that accepts a user object and returns a formatted multi-line summary string using ES6 template literals and destructuring.",
        checkpoint_question: "What happens if you attempt to reassign a variable declared with const (e.g. const x = 10; x = 20;)?",
        checkpoint_options: [
          "x silently converts to a let variable and accepts 20.",
          "JavaScript throws a TypeError: Assignment to constant variable.",
          "The variable value becomes undefined.",
          "The value automatically rolls back to 10."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "Reassigning a const variable throws an explicit TypeError at runtime."
      },
      {
        id: "js-fund-l2",
        course_id: "course-javascript-fundamentals",
        title: "Functions, Lexical Scope & Closures",
        lesson_type: "concept",
        sequence_order: 2,
        estimated_minutes: 25,
        objective: "Master first-class function expressions, arrow function lexical this binding, and closure scope preservation.",
        concept_guide: `Functions in JavaScript are first-class objects, meaning they can be assigned to variables, passed as arguments to other functions, and returned from function calls.

A Closure is the combination of a function bundled together with references to its surrounding lexical environment. In plain terms: an inner function always retains access to variables declared in its outer parent scope, even after the parent function has finished executing!

Closures enable data privacy, module encapsulation, and state preservation in functional programming patterns.`,
        code_example: `function createScoreCounter(initialScore = 0) {
  let count = initialScore; // Private encapsulated state

  return {
    increment: () => ++count,
    decrement: () => --count,
    getValue: () => count
  };
}

const alexCounter = createScoreCounter(10);
alexCounter.increment(); // 11
console.log(alexCounter.getValue()); // 11 (count is inaccessible directly)`,
        code_explanation: "Illustrates a closure factory returning an object whose methods retain private lexical access to count.",
        practical_exercise: "Build a function named `createIdGenerator(prefix)` that returns a closure generating sequential IDs (e.g. `user_1`, `user_2`).",
        checkpoint_question: "What defines a closure in JavaScript?",
        checkpoint_options: [
          "A function that automatically closes all open database connections.",
          "An inner function that retains access to variables from its outer lexical scope after the outer function has returned.",
          "A block of CSS code that closes a flexbox container.",
          "An async function that returns a Promise resolved value."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "A closure allows an inner function to remember and access variables from its outer lexical environment even after execution completes."
      },
      {
        id: "js-fund-l3",
        course_id: "course-javascript-fundamentals",
        title: "DOM Node Selection & Event Delegation",
        lesson_type: "exercise",
        sequence_order: 3,
        estimated_minutes: 25,
        objective: "Interact with the browser DOM tree, attach event listeners, and utilize event delegation bubbling.",
        concept_guide: `The Document Object Model (DOM) is an object-oriented representation of the webpage hierarchy. JavaScript uses methods like \`document.querySelector()\` and \`document.querySelectorAll()\` to query DOM elements using standard CSS selector strings.

Event Propagation flows through three phases:
1. Capturing Phase: Event descends from window to target element.
2. Target Phase: Event reaches target node.
3. Bubbling Phase: Event ascends from target node back up through parent DOM ancestors.

Event Delegation leverages event bubbling by attaching a single event listener to a parent element rather than attaching individual listeners to dozens of child elements. When a child is clicked, the event bubbles up to the parent listener, which inspects \`event.target\` to handle the action efficiently!`,
        code_example: `const todoList = document.querySelector('#todo-list');

// Event Delegation on parent container
todoList.addEventListener('click', (event) => {
  if (event.target.matches('.delete-btn')) {
    const item = event.target.closest('li');
    item.remove();
  }
});`,
        code_explanation: "Uses event delegation on a parent list element to catch delete button clicks on dynamically generated list items.",
        practical_exercise: "Create an interactive list where clicking any list item toggles a `.completed` CSS class on that specific item using a single event listener on the parent ul.",
        checkpoint_question: "Why is event delegation more efficient than attaching event listeners to 100 individual button elements?",
        checkpoint_options: [
          "It uses less memory by creating only 1 listener function instead of 100 separate event listener instances.",
          "It prevents the browser from making network HTTP calls.",
          "It automatically encrypts user click events.",
          "It forces the DOM to render in WebGL mode."
        ],
        checkpoint_correct_index: 0,
        checkpoint_explanation: "Event delegation reduces memory overhead and simplifies dynamic DOM element management by using a single ancestor listener."
      },
      {
        id: "js-fund-l4",
        course_id: "course-javascript-fundamentals",
        title: "Promises & Async/Await Control Flow",
        lesson_type: "concept",
        sequence_order: 4,
        estimated_minutes: 25,
        objective: "Master single-threaded Event Loop execution, Promise states, and async/await syntax error handling.",
        concept_guide: `JavaScript executes in a single-threaded runtime environment driven by an Event Loop. Asynchronous operations like network requests, timers, and file I/O are offloaded to background Web APIs without blocking the main execution thread.

A Promise is an object representing the eventual completion (or failure) of an asynchronous operation.
A Promise exists in one of three states:
1. Pending: Initial state, operation incomplete.
2. Fulfilled: Operation completed successfully (\`resolve(value)\`).
3. Rejected: Operation failed (\`reject(error)\`).

ES2017 introduced \`async/await\` as syntactic sugar over Promises, allowing developers to write asynchronous code that reads sequentially like synchronous code using \`try / catch\` error blocks.`,
        code_example: `async function fetchLearnerProfile(userId) {
  try {
    const response = await fetch(\`/api/profiles/\${userId}\`);
    if (!response.ok) {
      throw new Error(\`HTTP Error \${response.status}: Failed to load profile\`);
    }
    const profileData = await response.json();
    return profileData;
  } catch (error) {
    console.error("Network fetch failed:", error.message);
    throw error;
  }
}`,
        code_explanation: "Demonstrates an async function wrapping a fetch request with HTTP response status validation and try/catch block handling.",
        practical_exercise: "Write an async function `loadUserCurriculum(userId)` that fetches user data, validates response status, parses JSON, and logs the returned curriculum plan.",
        checkpoint_question: "What does the await keyword do when placed before a Promise expression inside an async function?",
        checkpoint_options: [
          "It terminates the browser tab if the Promise rejects.",
          "It pauses async function execution until the Promise resolves or rejects, returning the fulfilled value.",
          "It forces the Promise to execute synchronously on a secondary multi-threaded worker.",
          "It converts the Promise into a string representation."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "The await operator pauses async function execution until the Promise settles, resuming with the resolved value or throwing an error if rejected."
      },
      {
        id: "js-fund-l5",
        course_id: "course-javascript-fundamentals",
        title: "Fetch API & Remote Data Operations",
        lesson_type: "exercise",
        sequence_order: 5,
        estimated_minutes: 25,
        objective: "Execute HTTP GET, POST, and PUT operations using fetch, set request headers, and send JSON payloads.",
        concept_guide: `The Fetch API provides a modern interface for fetching web resources over HTTP/HTTPS protocols.

Important Fetch Behavior:
- Fetch Promises only reject on actual network errors (e.g. lost internet connection).
- Fetch Promises DO NOT reject on HTTP error status codes like 404 (Not Found) or 500 (Internal Server Error)! Developers must manually check \`response.ok\` (true if status is 200-299).

When sending data to a server using POST or PUT:
1. Specify \`method: 'POST'\`.
2. Pass \`headers: { 'Content-Type': 'application/json' }\`.
3. Convert data payload into a JSON string using \`body: JSON.stringify(data)\`.`,
        code_example: `async function saveLessonCompletion(courseId, lessonId) {
  const payload = { course_id: courseId, lesson_id: lessonId };
  
  const res = await fetch('/api/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(\`Failed to save completion: \${res.statusText}\`);
  }

  return await res.json();
}`,
        code_explanation: "Demonstrates sending a JSON payload via HTTP POST using fetch with proper headers and response validation.",
        practical_exercise: "Write a function that posts a new note object `{ title: 'JS Study Note', content: 'Closures are powerful' }` to `/api/notes` and logs the server response.",
        checkpoint_question: "Why must you check response.ok when using the Fetch API?",
        checkpoint_options: [
          "Because fetch automatically deletes local files if response is false.",
          "Because fetch does not reject its promise on 404 or 500 HTTP error status codes.",
          "Because response.ok is required to parse CSS stylesheets.",
          "Because fetch only works when response.ok is set to string 'ok'."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "Fetch resolves its promise normally even if the server returns 404 or 500 error status codes, requiring developers to inspect response.ok."
      },
      {
        id: "js-fund-l6",
        course_id: "course-javascript-fundamentals",
        title: "Dynamic Client Application Capstone",
        lesson_type: "project",
        sequence_order: 6,
        estimated_minutes: 35,
        objective: "Assemble a dynamic client-side application featuring modular state management, DOM rendering, and API persistence.",
        concept_guide: `Building production-ready client applications requires combining DOM manipulation, event handling, asynchronous fetching, and state management into a clean architecture.

Architecture Principles:
1. Single Source of Truth: Store application state in a central object or module.
2. Render Function: Re-render UI views dynamically whenever application state updates.
3. Separation of Concerns: Decouple API fetching logic from DOM presentation code.`,
        code_example: `class CourseApp {
  constructor(apiEndpoint) {
    this.endpoint = apiEndpoint;
    this.state = { lessons: [], activeId: null };
  }

  async init() {
    this.state.lessons = await fetch(this.endpoint).then(res => res.json());
    this.render();
  }

  render() {
    const list = document.querySelector('#app');
    list.innerHTML = this.state.lessons.map(l => \`
      <div class="card">\${l.title}</div>
    \`).join('');
  }
}`,
        code_explanation: "Demonstrates a clean object-oriented client app pattern separating state initialization, API fetching, and dynamic rendering.",
        practical_exercise: "Build an interactive task tracker app where users can add tasks via a form, toggle completion state, filter by active/completed status, and persist tasks in localStorage.",
        checkpoint_question: "What is the primary benefit of separating application state from DOM presentation code?",
        checkpoint_options: [
          "It makes state predictable, easier to test, and enables consistent UI rendering when data changes.",
          "It speeds up internet connection bandwidth.",
          "It bypasses CORS security policies.",
          "It automatically minifies JavaScript source files."
        ],
        checkpoint_correct_index: 0,
        checkpoint_explanation: "Decoupling state from DOM representation ensures state changes drive predictable, bug-free UI updates."
      }
    ]
  },
  {
    id: "course-git-github",
    title: "Git & GitHub Essentials",
    description: "Master distributed version control, branching strategies, pull requests, merge conflict resolution, and collaborative workflows.",
    category: "tooling",
    difficulty: "Beginner",
    estimated_minutes: 100,
    lessons: [
      {
        id: "git-l1",
        course_id: "course-git-github",
        title: "Version Control Concepts & Local Repositories",
        lesson_type: "concept",
        sequence_order: 1,
        estimated_minutes: 15,
        objective: "Initialize Git repositories, stage changes, and create atomic commits with descriptive commit messages.",
        concept_guide: `Git is a distributed version control system (DVCS) that records changes to files over time, allowing developers to recall specific versions, compare code diffs, and collaborate concurrently.

Git maintains three main states for your files:
1. Working Tree: The active filesystem directory where files are created and edited.
2. Staging Index (\`git add\`): The staging area where selected file changes are prepared into atomic snapshots.
3. Git History (\`git commit\`): The permanent database of committed snapshots recorded with unique SHA-1 hashes.`,
        code_example: `# Initialize local repository
git init

# Check working tree status
git status

# Stage specific files
git add index.html src/styles.css

# Commit staged snapshot with descriptive message
git commit -m "feat: initialize HTML structure and CSS reset"`,
        code_explanation: "Demonstrates initializing a repository, staging files into the index, and committing a snapshot with conventional commit syntax.",
        practical_exercise: "Create a local project directory, initialize a git repository, add a README.md file, stage it, and commit it with a clear commit message.",
        checkpoint_question: "What is the primary purpose of the Git Staging Index (git add)?",
        checkpoint_options: [
          "To upload files directly to GitHub servers.",
          "To allow developers to select and review granular file changes before recording them into a permanent commit snapshot.",
          "To automatically format code with Prettier.",
          "To compile TypeScript code into JavaScript."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "The staging index acts as a preparation area where developers choose exactly which changes to bundle into the next commit."
      },
      {
        id: "git-l2",
        course_id: "course-git-github",
        title: "Branching Strategies & Feature Isolation",
        lesson_type: "exercise",
        sequence_order: 2,
        estimated_minutes: 20,
        objective: "Create, switch, and merge feature branches to isolate work without destabilizing the main production branch.",
        concept_guide: `Branching is one of Git's most powerful capabilities. A branch represents an independent line of development pointing to a specific commit.

Branching Workflows:
- \`main\` / \`master\`: Production-ready code branch. Should always be stable and deployable.
- \`feature/*\`: Short-lived isolated branches created for specific features, bug fixes, or experiments.

Creating feature branches ensures that incomplete code never breaks production environments.`,
        code_example: `# Create and switch to new feature branch
git checkout -b feature/auth-system

# Perform edits and commit work
git add .
git commit -m "feat: implement login form validation"

# Switch back to main branch and merge feature
git checkout main
git merge feature/auth-system`,
        code_explanation: "Demonstrates creating a feature branch, making commits in isolation, switching back to main, and merging changes.",
        practical_exercise: "Create a branch named `feature/footer`, add a footer element to your index.html file, commit the change, switch back to main, and merge the branch.",
        checkpoint_question: "Which Git command creates a new branch and immediately switches your working tree to it?",
        checkpoint_options: [
          "git branch new-name",
          "git checkout -b new-name",
          "git merge new-name",
          "git push -u origin new-name"
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "git checkout -b creates the specified branch and checks it out into your active working directory in one command."
      },
      {
        id: "git-l3",
        course_id: "course-git-github",
        title: "Remote Repositories & GitHub Synchronization",
        lesson_type: "concept",
        sequence_order: 3,
        estimated_minutes: 20,
        objective: "Connect local Git repositories to GitHub remote origins, push branches, and pull upstream team updates.",
        concept_guide: `GitHub is a cloud platform for hosting Git repositories, providing web interfaces, access controls, collaboration tools, and CI/CD automation pipelines.

Commands for Remote Sync:
- \`git remote add origin <url>\`: Links local repository to remote GitHub repository.
- \`git push -u origin <branch>\`: Uploads local branch commits to GitHub and sets upstream tracking.
- \`git fetch\`: Downloads new remote commits without modifying your local working tree.
- \`git pull\`: Performs a \`git fetch\` followed by \`git merge\` to integrate remote changes into your active branch.`,
        code_example: `# Link local repo to GitHub remote origin
git remote add origin https://github.com/user/learnpilot-project.git

# Push main branch to remote and set upstream tracking
git push -u origin main

# Pull latest team updates from remote main branch
git pull origin main`,
        code_explanation: "Demonstrates linking a remote GitHub repository origin and executing push and pull operations.",
        practical_exercise: "Create a GitHub repository online, connect your local repository via `git remote add origin`, and push your main branch.",
        checkpoint_question: "What is the key difference between git fetch and git pull?",
        checkpoint_options: [
          "git fetch deletes local commits, while git pull keeps them.",
          "git fetch downloads remote metadata without modifying working files, whereas git pull fetches and automatically merges changes into your active branch.",
          "git fetch requires admin password privileges, while git pull does not.",
          "git fetch only works on Windows operating systems."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "git fetch safely inspects remote changes without touching your working files, while git pull immediately fetches and merges."
      },
      {
        id: "git-l4",
        course_id: "course-git-github",
        title: "Pull Requests & Collaborative Code Reviews",
        lesson_type: "exercise",
        sequence_order: 4,
        estimated_minutes: 25,
        objective: "Submit GitHub Pull Requests (PRs), participate in code reviews, and automate quality checks before merging.",
        concept_guide: `A Pull Request (PR) is a GitHub feature that proposes integrating changes from a feature branch into a target branch (e.g. main).

PR Workflow Benefits:
1. Code Review: Teammates review diffs, leave comments, and suggest improvements.
2. Automated Testing: CI/CD runners (GitHub Actions) run automated test suites and linters.
3. Protected Branches: Prevents direct unreviewed commits to production branches.`,
        code_example: `# Create PR using GitHub CLI
gh pr create \\
  --title "feat: implement standalone course learning workspace" \\
  --body "Adds interactive course workspace with lesson stepper and progress persistence." \\
  --base main \\
  --head feature/courses-learning-workspace`,
        code_explanation: "Demonstrates creating a pull request using GitHub CLI specifying title, description, base, and feature head branch.",
        practical_exercise: "Push a feature branch to GitHub, navigate to the GitHub repository web UI, open a Pull Request against main, and inspect the unified code diff view.",
        checkpoint_question: "Why are Pull Requests used in team software development?",
        checkpoint_options: [
          "To force developers to re-install Git every week.",
          "To enable code reviews, automated CI test runs, and peer feedback before merging code into main branches.",
          "To speed up CSS flexbox rendering.",
          "To compile database migrations into SQL files."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "Pull Requests foster quality control through peer code reviews and automated CI checks before code enters production."
      },
      {
        id: "git-l5",
        course_id: "course-git-github",
        title: "Resolving Merge Conflicts",
        lesson_type: "exercise",
        sequence_order: 5,
        estimated_minutes: 20,
        objective: "Identify conflict markers (<<<<<<< HEAD), resolve competing edits across branches, and finalize merge commits.",
        concept_guide: `A Merge Conflict occurs when Git tries to merge two branches that modified the exact same lines of code in conflicting ways, or when one branch deleted a file that another branch edited.

Git marks conflicting files and inserts conflict markers directly into the code:
- \`<<<<<<< HEAD\`: Indicates changes on your current active branch.
- \`=======\`: Separator dividing opposing changes.
- \`>>>>>>> branch-name\`: Indicates incoming changes from the branch being merged.

To resolve:
1. Inspect conflicting files and edit code to keep intended changes.
2. Remove conflict marker lines (\`<<<<<<<\`, \`=======\`, \`>>>>>>>\`).
3. Stage resolved files (\`git add\`) and commit (\`git commit\`).`,
        code_example: `<<<<<<< HEAD
const API_PORT = process.env.PORT || 3000;
=======
const API_PORT = process.env.PORT || 8080;
>>>>>>> feature/port-update

/* RESOLVED EDITED CODE */
const API_PORT = process.env.PORT || 3000;`,
        code_explanation: "Shows raw Git conflict markers around opposing line edits and the resulting clean resolved code.",
        practical_exercise: "Simulate a merge conflict by editing line 1 of README.md on two different branches, attempting a merge, removing conflict markers, and committing the resolution.",
        checkpoint_question: "How do you complete a merge after manually resolving conflict markers in your code editor?",
        checkpoint_options: [
          "Run git abort --force.",
          "Stage the resolved files with git add and execute git commit.",
          "Delete the .git hidden directory.",
          "Restart the computer operating system."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "Staging the resolved files with git add signals to Git that conflicts are settled, allowing git commit to record the merge."
      }
    ]
  },
  {
    id: "course-react-architecture",
    title: "React & Component Architecture",
    description: "Build declarative component hierarchies, props flow, useState, useEffect side effects, custom hooks, and predictable state.",
    category: "frontend",
    difficulty: "Intermediate",
    estimated_minutes: 160,
    lessons: [
      {
        id: "react-l1",
        course_id: "course-react-architecture",
        title: "Declarative Components & JSX Syntax Rules",
        lesson_type: "concept",
        sequence_order: 1,
        estimated_minutes: 20,
        objective: "Understand Virtual DOM reconciliation, declarative component rendering, and JSX syntax transpilation.",
        concept_guide: `React is a declarative component-driven JavaScript library for building user interfaces. Instead of manually manipulating DOM nodes using imperative JavaScript (\`document.createElement\`), React developers declare what the UI should look like for a given state using JSX (JavaScript XML).

Virtual DOM: React maintains a lightweight Virtual DOM representation in memory. When state updates occur, React renders a new Virtual DOM tree, performs a diffing algorithm (Reconciliation), and efficiently updates only the changed real DOM nodes.

JSX Rules:
1. Component function names MUST start with a capital letter (\`MyComponent\`).
2. JSX tags must return a single root element or Fragment (\`<>\`).
3. Use \`className\` instead of \`class\` and \`htmlFor\` instead of \`for\`.
4. Embed JavaScript expressions inside curly braces \`{expression}\`.`,
        code_example: `export function LearnerCard({ name, role }: { name: string; role: string }) {
  const isLead = role === "Lead Developer";

  return (
    <div className="card-container">
      <h3 className="text-sm font-bold">{name}</h3>
      <span className={isLead ? "badge-gold" : "badge-blue"}>
        {role}
      </span>
    </div>
  );
}`,
        code_explanation: "Demonstrates a clean functional React component returning JSX with conditional class styling and embedded variable expressions.",
        practical_exercise: "Build a functional React component named `CourseBadge` that accepts `title` and `difficulty` as props and renders styled HTML with dynamic conditional colors.",
        checkpoint_question: "Why must React components return a single root element or Fragment (<>...</>)?",
        checkpoint_options: [
          "To allow CSS grid to render 3D graphics.",
          "Because JSX transpiles into React.createElement function calls which expect a single parent element returned.",
          "Because web browsers reject pages with more than 1 HTML tag.",
          "To automatically save component data to local storage."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "JSX is transpiled into JavaScript function calls, requiring a single enclosing root element or fragment."
      },
      {
        id: "react-l2",
        course_id: "course-react-architecture",
        title: "Props Unidirectional Data Flow",
        lesson_type: "exercise",
        sequence_order: 2,
        estimated_minutes: 25,
        objective: "Pass read-only props down component hierarchies and pass event handler callbacks up for parent state updates.",
        concept_guide: `Data in React flows unidirectionally downward from parent components to child components via \`props\` (properties).

Props Principles:
- Props are IMMUTABLE read-only objects. A child component must NEVER attempt to modify its own props.
- To communicate from child to parent, the parent passes a callback function down as a prop. When an event occurs in the child, it invokes the parent callback, allowing the parent to update its state!`,
        code_example: `// Child Component
function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={active ? "bg-primary text-white" : "bg-muted text-gray font-normal"}
    >
      {label}
    </button>
  );
}`,
        code_explanation: "Demonstrates a presentational child component receiving immutable props and executing a parent callback on click.",
        practical_exercise: "Create a `LessonStepper` component where parent state tracks active lesson index and child `NextButton` and `PrevButton` trigger parent index increment and decrement callbacks.",
        checkpoint_question: "What happens if a child component attempts to directly mutate a prop (e.g. props.title = 'New Title')?",
        checkpoint_options: [
          "React updates the parent component state automatically.",
          "React throws a runtime error because props are immutable read-only objects.",
          "The browser reloads the page.",
          "The CSS background color turns red."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "Props are strictly read-only inputs in React; mutating props violates unidirectional data flow and triggers errors."
      },
      {
        id: "react-l3",
        course_id: "course-react-architecture",
        title: "State Management with useState Hook",
        lesson_type: "exercise",
        sequence_order: 3,
        estimated_minutes: 25,
        objective: "Declare component state, perform immutable state updates, and handle controlled form inputs using useState.",
        concept_guide: `State represents data that changes over time within a component. Calling \`useState(initialValue)\` returns an array containing two elements:
1. Current State Value.
2. Setter Function: Function used to update state and trigger a component re-render.

State Update Rules:
- Never mutate state directly (\`state.count = 5\` ❌). Always call the setter function (\`setCount(5)\` ✅).
- When next state depends on previous state, pass a functional updater (\`setCount(prev => prev + 1)\`) to avoid closure stale state bugs during batched updates.`,
        code_example: `import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    setCount((prevCount) => prevCount + 1);
  };

  return (
    <button onClick={handleIncrement} className="btn-primary">
      Completed Lessons: {count}
    </button>
  );
}`,
        code_explanation: "Demonstrates useState hook declaration and functional state updater execution on button click.",
        practical_exercise: "Build a controlled search input component using useState where typing updates query state and filters an array of course titles in real-time.",
        checkpoint_question: "Why should you pass a functional updater (setCount(prev => prev + 1)) when deriving next state from current state?",
        checkpoint_options: [
          "It forces React to bypass Virtual DOM diffing.",
          "It guarantees working with the most up-to-date state value even during batched asynchronous state updates.",
          "It converts the state value into a database string.",
          "It prevents the button from being double-clicked."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "Functional state updaters receive the guaranteed latest pending state value during React batched update cycles."
      },
      {
        id: "react-l4",
        course_id: "course-react-architecture",
        title: "Side Effects & useEffect Lifecycle",
        lesson_type: "concept",
        sequence_order: 4,
        estimated_minutes: 25,
        objective: "Execute data fetching, DOM subscriptions, and timer side effects while managing dependency arrays and cleanup functions.",
        concept_guide: `Side effects are operations that interact with the outside world beyond React's pure rendering cycle (e.g. API fetching, DOM listeners, timers, web sockets).

The \`useEffect(effectFunction, dependencyArray)\` hook synchronizes side effects with component lifecycle:
1. No Dependency Array (\`useEffect(fn)\`): Runs after EVERY render.
2. Empty Dependency Array (\`useEffect(fn, [])\`): Runs ONCE after initial component mount.
3. Specific Dependencies (\`useEffect(fn, [id])\`): Runs on initial mount AND whenever specified dependency values change.

Effect Cleanup: Returning a cleanup function from \`useEffect\` ensures timer intervals, event listeners, and API subscriptions are cleaned up before component unmount or re-render.`,
        code_example: `useEffect(() => {
  let isMounted = true;

  async function loadCourse() {
    const data = await fetchCourseData(courseId);
    if (isMounted) setCourse(data);
  }

  loadCourse();

  return () => {
    isMounted = false; // Cleanup flag preventing memory leaks
  };
}, [courseId]);`,
        code_explanation: "Demonstrates useEffect data fetching scoped to courseId with a cleanup flag preventing state updates on unmounted components.",
        practical_exercise: "Write a useEffect hook that attaches a window resize event listener to update a `windowWidth` state variable and returns a cleanup function calling `removeEventListener`.",
        checkpoint_question: "When does the cleanup function returned from a useEffect hook execute?",
        checkpoint_options: [
          "Only when the browser window closes.",
          "Before the component unmounts and before re-running the effect on dependency changes.",
          "Immediately before the first initial render.",
          "Whenever a user clicks a button."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "Cleanup functions execute before component unmounting and prior to re-executing the effect when dependencies change."
      },
      {
        id: "react-l5",
        course_id: "course-react-architecture",
        title: "Custom Hooks & Logic Reusability",
        lesson_type: "exercise",
        sequence_order: 5,
        estimated_minutes: 30,
        objective: "Extract component state and effect logic into reusable custom hooks prefixed with use...",
        concept_guide: `Custom Hooks are JavaScript functions whose names start with \`use\` and that call other React hooks (\`useState\`, \`useEffect\`, \`useCallback\`).

Custom hooks allow developers to extract complex stateful business logic out of UI component views into reusable, testable utility functions!`,
        code_example: `import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(storedValue));
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}`,
        code_explanation: "Custom hook encapsulating localStorage synchronization with generic TypeScript typing.",
        practical_exercise: "Build a custom hook named `useFetch(url)` returning `{ data, loading, error }` and consume it inside a `CourseList` component.",
        checkpoint_question: "What naming convention must all React custom hooks follow?",
        checkpoint_options: [
          "Must end with ...Component",
          "Must start with the lowercase prefix 'use' (e.g. useCourseProgress)",
          "Must be written in capital letters (e.g. USE_DATA)",
          "Must start with 'get'"
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "React requires custom hooks to start with 'use' so linter rules can verify hook usage rules automatically."
      },
      {
        id: "react-l6",
        course_id: "course-react-architecture",
        title: "Interactive Course Application Capstone",
        lesson_type: "project",
        sequence_order: 6,
        estimated_minutes: 35,
        objective: "Build a full-featured interactive React learning application with tabbed views, custom hooks, and persistent completion state.",
        concept_guide: `Assembling scalable React applications requires organizing components into clear directory structures, maintaining clean prop interfaces, and using custom hooks for state management.`,
        code_example: `export default function CourseWorkspaceApp() {
  const { course, loading } = useCourseData();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex h-screen border border-border">
      <LessonSidebar course={course} activeId={activeLessonId} onSelect={setActiveLessonId} />
      <LessonWorkspace lessonId={activeLessonId} />
    </div>
  );
}`,
        code_explanation: "Demonstrates main workspace component layout composing loading spinner, sidebar stepper, and active workspace view.",
        practical_exercise: "Build an interactive course learning workspace application with lesson selection sidebar, reading area, and progress calculation.",
        checkpoint_question: "Which component architecture pattern promotes high maintainability and testability in React applications?",
        checkpoint_options: [
          "Writing all application code inside a single 5000-line index.js file.",
          "Decomposing UI into small, focused presentational components and extracting stateful logic into custom hooks.",
          "Using inline style attributes for every element.",
          "Storing all state in global window variables."
        ],
        checkpoint_correct_index: 1,
        checkpoint_explanation: "Separating UI into modular presentational components and isolating stateful logic in custom hooks promotes maintainability."
      }
    ]
  }
];
    
    const registry = {};
    for (const c of courses) {
      for (const l of c.lessons) {
        registry[l.id] = {
          id: l.id,
          title: l.title,
          type: l.lesson_type,
          objective: l.objective,
          concept_guide: l.concept_guide,
          code_example: l.code_example,
          practical_exercise: l.practical_exercise,
          checkpoint_question: l.checkpoint_question,
          checkpoint_options: l.checkpoint_options,
          checkpoint_correct_index: l.checkpoint_correct_index,
          checkpoint_explanation: l.checkpoint_explanation,
          topic: c.title,
          difficulty: c.difficulty
        };
      }
    }
    
    console.log(JSON.stringify(registry, null, 2));
  