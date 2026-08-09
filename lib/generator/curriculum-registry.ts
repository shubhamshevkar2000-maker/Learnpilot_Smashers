import type { CurrentLevel, ActivityType } from "@/types/database.types"

export type DomainId = "frontend" | "backend" | "fullstack" | "react" | "javascript" | "ai" | "python" | "generic"

export interface ActivityTemplate {
  title: string
  activity_type: ActivityType
  estimated_minutes: number
  learning_objective: string
  is_interview_prep?: boolean
  is_architecture?: boolean
  is_production?: boolean
  contentId?: string
}

export interface ModuleTemplate {
  id: string
  domain: DomainId
  skill: string
  title: string
  description: string
  rationale: string
  targetLevels: CurrentLevel[]
  activities: ActivityTemplate[]
  skillsTaught?: string[]
  prerequisites?: string[]
}

export interface DomainProgression {
  beginner: string[] // Array of ModuleTemplate IDs
  intermediate: string[]
  advanced: string[]
}

export interface DomainConfig {
  id: DomainId
  aliases: string[]
  progression: DomainProgression
}

// ----------------------------------------------------------------------------
// REUSABLE MODULE TEMPLATES
// ----------------------------------------------------------------------------

export const MODULE_REGISTRY: Record<string, ModuleTemplate> = {
  // --- FRONTEND FOUNDATIONS ---
  "mod-html-css-basics": {
    id: "mod-html-css-basics",
    skillsTaught: ["HTML","CSS","Flexbox","Responsive Design"],
    prerequisites: [],
    domain: "frontend",
    skill: "HTML & CSS",
    title: "Web Fundamentals & Structural Syntax",
    description: "Master HTML5 semantics, accessibility, and foundational CSS layout principles.",
    rationale: "Establishes structural proficiency required before handling client-side scripting.",
    targetLevels: ["beginner", "basics", "unknown"],
    activities: [
      { title: "HTML5 Document Structure & Page Syntax", contentId: "html-css-l1", activity_type: "concept", estimated_minutes: 20, learning_objective: "Understand HTML markup and document flow." },
      { title: "Semantic HTML5 Elements & Content Outlining", contentId: "html-css-l2", activity_type: "exercise", estimated_minutes: 25, learning_objective: "Apply semantic tags for accessibility." },
      { title: "CSS Selectors, Box Model & Spacing Rules", contentId: "html-css-l3", activity_type: "concept", estimated_minutes: 25, learning_objective: "Master CSS specificity and box physics." },
      { title: "CSS Flexbox One-Dimensional Layout Architecture", contentId: "html-css-l4", activity_type: "exercise", estimated_minutes: 30, learning_objective: "Build flexible rows and columns." },
      { title: "Responsive Layout Capstone Project", contentId: "html-css-l6", activity_type: "project", estimated_minutes: 45, learning_objective: "Assemble a responsive landing page." },
      { title: "Web Fundamentals Knowledge Checkpoint", contentId: "auto-gen-1", activity_type: "reflection", estimated_minutes: 15, learning_objective: "Verify understanding of HTML/CSS." },
    ]
  },
  "mod-js-basics": {
    id: "mod-js-basics",
    skillsTaught: ["JavaScript","Variables","Loops","Functions","Arrays"],
    prerequisites: ["mod-html-css-basics"],
    domain: "javascript",
    skill: "JavaScript Core",
    title: "JavaScript Engine Mechanics & Core Syntax",
    description: "Deep dive into ES6+ syntax, closures, and basic DOM manipulation.",
    rationale: "Critical foundation for understanding modern interactive web interfaces.",
    targetLevels: ["beginner", "basics", "unknown"],
    activities: [
      { title: "ES6+ Syntax Essentials, Let/Const & Arrow Functions", contentId: "js-fund-l1", activity_type: "concept", estimated_minutes: 20, learning_objective: "Understand modern variable scoping and function declarations." },
      { title: "Variable Scope, Execution Context & Closures", contentId: "js-fund-l2", activity_type: "concept", estimated_minutes: 25, learning_objective: "Master lexical scope and closure privacy.", is_interview_prep: true },
      { title: "DOM Node Selection & Event Listeners", contentId: "js-fund-l3", activity_type: "exercise", estimated_minutes: 30, learning_objective: "Interact with the browser DOM tree." },
      { title: "Interactive DOM Manipulation Project", contentId: "auto-gen-2", activity_type: "project", estimated_minutes: 45, learning_objective: "Build a dynamic task list app." },
      { title: "JavaScript Fundamentals Checkpoint", contentId: "auto-gen-3", activity_type: "reflection", estimated_minutes: 15, learning_objective: "Verify understanding of core JS concepts." },
    ]
  },

  // --- INTERMEDIATE JS & ASYNC ---
  "mod-js-async": {
    id: "mod-js-async",
    skillsTaught: ["JavaScript","Promises","Async/Await","Fetch API","DOM"],
    prerequisites: ["mod-js-basics"],
    domain: "javascript",
    skill: "JavaScript Async",
    title: "Asynchronous JavaScript & Network Requests",
    description: "Master the Event Loop, Promises, async/await, and the Fetch API.",
    rationale: "Essential for communicating with backend services and handling external data.",
    targetLevels: ["beginner", "basics", "intermediate", "unknown"],
    activities: [
      { title: "JavaScript Event Loop & Concurrency Model", contentId: "auto-gen-4", activity_type: "concept", estimated_minutes: 25, learning_objective: "Understand how the single-threaded event loop processes tasks.", is_interview_prep: true },
      { title: "Promises, Chaining & Error Handling", contentId: "js-fund-l4", activity_type: "exercise", estimated_minutes: 30, learning_objective: "Manage asynchronous operations using Promises." },
      { title: "Async/Await Control Flow", contentId: "auto-gen-5", activity_type: "concept", estimated_minutes: 25, learning_objective: "Write clean synchronous-looking asynchronous code." },
      { title: "Fetch API & Remote HTTP Data Operations", contentId: "js-fund-l5", activity_type: "exercise", estimated_minutes: 30, learning_objective: "Interact with REST APIs using fetch." },
      { title: "Async Web Application Project", contentId: "js-fund-l6", activity_type: "project", estimated_minutes: 45, learning_objective: "Build an app that consumes an external public API." },
    ]
  },
  "mod-js-advanced": {
    id: "mod-js-advanced",
    skillsTaught: ["JavaScript","Closures","Prototypal Inheritance","Event Loop","ES6+"],
    prerequisites: ["mod-js-async"],
    domain: "javascript",
    skill: "Advanced JavaScript",
    title: "Advanced JS: Prototypes, Modules & Performance",
    description: "Explore prototypal inheritance, memory management, ES modules, and performance optimization.",
    rationale: "Bridges the gap between writing functional code and engineering robust architectures.",
    targetLevels: ["intermediate", "advanced"],
    activities: [
      { title: "Prototypal Inheritance & the Prototype Chain", contentId: "auto-gen-6", activity_type: "concept", estimated_minutes: 25, learning_objective: "Master JavaScript's object-oriented inheritance model.", is_interview_prep: true },
      { title: "Memory Management & Garbage Collection", contentId: "auto-gen-7", activity_type: "concept", estimated_minutes: 25, learning_objective: "Understand memory leaks and optimization techniques.", is_architecture: true },
      { title: "ES Modules, Bundlers & Tree Shaking", contentId: "auto-gen-8", activity_type: "exercise", estimated_minutes: 30, learning_objective: "Structure scalable codebases using module systems." },
      { title: "Web Workers & Thread Offloading", contentId: "auto-gen-9", activity_type: "project", estimated_minutes: 40, learning_objective: "Implement heavy computations off the main thread.", is_production: true },
    ]
  },

  // --- REACT & NEXT.JS ---
  "mod-react-basics": {
    id: "mod-react-basics",
    skillsTaught: ["React","Components","JSX","State","Props"],
    prerequisites: ["mod-js-basics","mod-js-async"],
    domain: "react",
    skill: "React Core",
    title: "React Components & State Management",
    description: "Build declarative component hierarchies, manage state with hooks, and handle side effects.",
    rationale: "Provides the core mental model required for React application development.",
    targetLevels: ["beginner", "basics", "intermediate"],
    activities: [
      { title: "JSX Syntax & Component Declarations", contentId: "react-l1", activity_type: "concept", estimated_minutes: 25, learning_objective: "Understand React's Virtual DOM and declarative syntax." },
      { title: "Props, Data Flow & Immutability", contentId: "react-l2", activity_type: "exercise", estimated_minutes: 25, learning_objective: "Pass data cleanly between component hierarchies." },
      { title: "Local State Management with useState", contentId: "react-l3", activity_type: "exercise", estimated_minutes: 30, learning_objective: "Manage interactive component state." },
      { title: "Side Effects & the useEffect Lifecycle", contentId: "react-l4", activity_type: "concept", estimated_minutes: 30, learning_objective: "Synchronize components with external systems.", is_interview_prep: true },
      { title: "React State & Props Capstone Project", contentId: "react-l5", activity_type: "project", estimated_minutes: 45, learning_objective: "Build a comprehensive modular React app." },
    ]
  },
  "mod-react-advanced": {
    id: "mod-react-advanced",
    skillsTaught: ["React","Hooks","Context API","Performance","Custom Hooks"],
    prerequisites: ["mod-react-basics"],
    domain: "react",
    skill: "Advanced React",
    title: "Advanced React Patterns & Next.js Architecture",
    description: "Implement Server Components, Server Actions, streaming SSR, and complex state abstraction.",
    rationale: "Accelerates your existing React knowledge to modern production-standard Next.js patterns.",
    targetLevels: ["intermediate", "advanced"],
    activities: [
      { title: "React Server Components vs Client Components", contentId: "auto-gen-10", activity_type: "concept", estimated_minutes: 25, learning_objective: "Design optimized rendering boundary strategies.", is_architecture: true },
      { title: "Next.js App Router Layouts & Nested Routing", contentId: "auto-gen-11", activity_type: "exercise", estimated_minutes: 30, learning_objective: "Build scalable route structures in Next.js." },
      { title: "Server Actions Data Mutations & Form Validation", contentId: "auto-gen-12", activity_type: "exercise", estimated_minutes: 35, learning_objective: "Handle backend mutations securely without API routes.", is_production: true },
      { title: "Custom React Hooks Abstraction & Context API", contentId: "auto-gen-13", activity_type: "exercise", estimated_minutes: 30, learning_objective: "Abstract complex state logic into reusable hooks.", is_interview_prep: true },
      { title: "High-Performance Next.js Project", contentId: "auto-gen-14", activity_type: "project", estimated_minutes: 50, learning_objective: "Deploy a production-ready Server Components app." },
    ]
  },

  // --- BACKEND & DATABASES ---
  "mod-backend-basics": {
    id: "mod-backend-basics",
    skillsTaught: ["Node.js","Express","REST APIs","Middleware"],
    prerequisites: ["mod-js-async"],
    domain: "backend",
    skill: "Backend Core",
    title: "Backend Servers & RESTful APIs",
    description: "Build robust HTTP servers, design API endpoints, and handle client requests.",
    rationale: "Essential for constructing the business logic layer of web applications.",
    targetLevels: ["beginner", "basics", "intermediate"],
    activities: [
      { title: "Node.js Runtime & HTTP Protocol Fundamentals", contentId: "auto-gen-15", activity_type: "concept", estimated_minutes: 25, learning_objective: "Understand backend runtime environments and HTTP mechanics." },
      { title: "RESTful API Design Principles & Routing", contentId: "auto-gen-16", activity_type: "exercise", estimated_minutes: 30, learning_objective: "Design predictable, resource-oriented API endpoints." },
      { title: "Request Validation & Error Handling Middleware", contentId: "auto-gen-17", activity_type: "exercise", estimated_minutes: 30, learning_objective: "Protect servers against malformed data." },
      { title: "Build a Robust REST API Project", contentId: "auto-gen-18", activity_type: "project", estimated_minutes: 45, learning_objective: "Implement a fully functional API backend." },
    ]
  },
  "mod-db-sql": {
    id: "mod-db-sql",
    skillsTaught: ["SQL","PostgreSQL","Database Design","Queries"],
    prerequisites: [],
    domain: "backend",
    skill: "Databases",
    title: "Relational Schemas & SQL Database Modeling",
    description: "Design relational data models, write complex SQL queries, and integrate with applications.",
    rationale: "Data persistence is the foundation of full-stack engineering.",
    targetLevels: ["beginner", "basics", "intermediate"],
    activities: [
      { title: "Relational Database Concepts & Normalization", contentId: "auto-gen-19", activity_type: "concept", estimated_minutes: 25, learning_objective: "Design structured relational database schemas.", is_architecture: true },
      { title: "SQL Queries: Joins, Grouping & Aggregation", contentId: "auto-gen-20", activity_type: "exercise", estimated_minutes: 30, learning_objective: "Extract and manipulate complex datasets using SQL.", is_interview_prep: true },
      { title: "PostgreSQL Client Integration & ORMs", contentId: "auto-gen-21", activity_type: "exercise", estimated_minutes: 35, learning_objective: "Connect application servers to databases securely." },
      { title: "Database Integration Capstone Project", contentId: "auto-gen-22", activity_type: "project", estimated_minutes: 45, learning_objective: "Build a CRUD application powered by a relational DB." },
    ]
  },
  "mod-backend-advanced": {
    id: "mod-backend-advanced",
    skillsTaught: ["Node.js","Authentication","WebSockets","Microservices"],
    prerequisites: ["mod-backend-basics","mod-db-sql"],
    domain: "backend",
    skill: "Backend Architecture",
    title: "Advanced API Architecture & Database Security",
    description: "Implement GraphQL, Row Level Security, indexing, and authentication systems.",
    rationale: "Prepares you for enterprise-grade backend infrastructure and security requirements.",
    targetLevels: ["intermediate", "advanced"],
    activities: [
      { title: "GraphQL Schema Definition & Resolver Implementation", contentId: "auto-gen-23", activity_type: "exercise", estimated_minutes: 35, learning_objective: "Build flexible, client-driven API graphs.", is_architecture: true },
      { title: "PostgreSQL Indexing & Query Optimization", contentId: "auto-gen-24", activity_type: "concept", estimated_minutes: 30, learning_objective: "Optimize slow database queries using execution plans.", is_interview_prep: true },
      { title: "Authentication, JWT & Granular Row Level Security (RLS)", contentId: "auto-gen-25", activity_type: "exercise", estimated_minutes: 40, learning_objective: "Secure data using robust auth paradigms.", is_production: true },
      { title: "Secure Multi-Tenant Enterprise Backend Project", contentId: "auto-gen-26", activity_type: "project", estimated_minutes: 55, learning_objective: "Architect a secure, scalable enterprise backend." },
    ]
  },
  
  // --- PRODUCTION & ARCHITECTURE ---
  "mod-production": {
    id: "mod-production",
    skillsTaught: ["Deployment","Docker","CI/CD","Testing"],
    prerequisites: ["mod-react-advanced","mod-backend-advanced"],
    domain: "fullstack",
    skill: "DevOps & Production",
    title: "Production Deployment, CI/CD & Telemetry",
    description: "Deploy scalable architectures, configure automated testing, and monitor telemetry.",
    rationale: "Completes the engineering trajectory with enterprise deployment readiness.",
    targetLevels: ["intermediate", "advanced"],
    activities: [
      { title: "Serverless Deployments & Edge Infrastructure", contentId: "auto-gen-27", activity_type: "concept", estimated_minutes: 25, learning_objective: "Understand modern deployment targets.", is_architecture: true },
      { title: "Automated CI/CD Pipeline Configuration", contentId: "auto-gen-28", activity_type: "exercise", estimated_minutes: 35, learning_objective: "Automate testing and deployment workflows.", is_production: true },
      { title: "Real User Monitoring & Core Web Vitals Optimization", contentId: "auto-gen-29", activity_type: "project", estimated_minutes: 45, learning_objective: "Monitor and optimize production application performance." },
    ]
  },

  // --- AI & LLMs ---
  "mod-ai-integration": {
    id: "mod-ai-integration",
    skillsTaught: ["AI","OpenAI API","Prompt Engineering"],
    prerequisites: ["mod-backend-basics"],
    domain: "ai",
    skill: "AI Engineering",
    title: "LLM Integration & Prompt Engineering",
    description: "Connect to AI APIs, design robust system prompts, and handle token streaming.",
    rationale: "Introduces the mechanics of modern AI-augmented application development.",
    targetLevels: ["beginner", "intermediate", "advanced"],
    activities: [
      { title: "Large Language Model Architecture Overview", contentId: "auto-gen-30", activity_type: "concept", estimated_minutes: 20, learning_objective: "Understand how LLMs process tokens and contexts." },
      { title: "API Integration, Authentication & Streaming Responses", contentId: "auto-gen-31", activity_type: "exercise", estimated_minutes: 35, learning_objective: "Build real-time streaming AI chat interfaces." },
      { title: "Advanced Prompt Engineering & System Directives", contentId: "auto-gen-32", activity_type: "exercise", estimated_minutes: 30, learning_objective: "Control AI behavior using structured constraints." },
      { title: "AI Assistant Capstone Project", contentId: "auto-gen-33", activity_type: "project", estimated_minutes: 50, learning_objective: "Develop a specialized, context-aware AI application." },
    ]
  },
  "mod-ai-rag": {
    id: "mod-ai-rag",
    skillsTaught: ["AI","RAG","Vector Databases","Embeddings"],
    prerequisites: ["mod-ai-integration"],
    domain: "ai",
    skill: "RAG & Vector DBs",
    title: "Retrieval-Augmented Generation (RAG)",
    description: "Implement text embeddings, vector databases, and semantic search algorithms.",
    rationale: "Enables AI systems to operate on private datasets and mitigate hallucinations.",
    targetLevels: ["intermediate", "advanced"],
    activities: [
      { title: "Text Embeddings & Semantic Vector Space", contentId: "auto-gen-34", activity_type: "concept", estimated_minutes: 25, learning_objective: "Understand multi-dimensional text representation.", is_architecture: true },
      { title: "Vector Database Setup & Similarity Search", contentId: "auto-gen-35", activity_type: "exercise", estimated_minutes: 35, learning_objective: "Store and query embedded document vectors." },
      { title: "RAG Pipeline Orchestration", contentId: "auto-gen-36", activity_type: "project", estimated_minutes: 50, learning_objective: "Build a document chat system using semantic retrieval.", is_production: true },
    ]
  },

  // --- PYTHON ---
  "mod-python-fundamentals": {
    id: "mod-python-fundamentals",
    skillsTaught: ["Python","Variables","Operators","Logic","Loops","Functions"],
    prerequisites: [],
    domain: "python",
    skill: "Programming Fundamentals",
    title: "Python Programming Fundamentals",
    description: "Master basic Python programming including variables, data types, control flow, loops, and functions.",
    rationale: "Provides the core foundation for all subsequent Python development.",
    targetLevels: ["beginner", "basics", "unknown"],
    activities: [
      { title: "Python Variables and Data Types", contentId: "py-fund-1", activity_type: "concept", estimated_minutes: 20, learning_objective: "Understand basic Python data types and variable assignment." },
      { title: "Operators and Expressions", contentId: "py-fund-2", activity_type: "exercise", estimated_minutes: 20, learning_objective: "Perform mathematical and logical operations." },
      { title: "Conditional Logic", contentId: "py-fund-3", activity_type: "exercise", estimated_minutes: 20, learning_objective: "Implement if, elif, and else control flow structures." },
      { title: "Loops and Iteration", contentId: "py-fund-4", activity_type: "exercise", estimated_minutes: 25, learning_objective: "Master for and while loops." },
      { title: "Functions", contentId: "py-fund-5", activity_type: "concept", estimated_minutes: 25, learning_objective: "Define and invoke reusable functions." },
      { title: "Python Practice Project", contentId: "py-fund-6", activity_type: "project", estimated_minutes: 40, learning_objective: "Combine basics into a coherent script." },
    ]
  },
  "mod-python-data-structures": {
    id: "mod-python-data-structures",
    skillsTaught: ["Python","Lists","Tuples","Sets","Dictionaries","Comprehensions"],
    prerequisites: ["mod-python-fundamentals"],
    domain: "python",
    skill: "Data Structures",
    title: "Python Data Structures",
    description: "Learn to store, access, and manipulate data efficiently using Python's built-in data structures.",
    rationale: "Crucial for handling data effectively in software development.",
    targetLevels: ["beginner", "intermediate", "unknown"],
    activities: [
      { title: "Lists and Tuples", contentId: "py-ds-1", activity_type: "concept", estimated_minutes: 20, learning_objective: "Understand mutable lists and immutable tuples." },
      { title: "Sets", contentId: "py-ds-2", activity_type: "exercise", estimated_minutes: 20, learning_objective: "Work with unique collections." },
      { title: "Dictionaries", contentId: "py-ds-3", activity_type: "exercise", estimated_minutes: 25, learning_objective: "Store and access key-value pairs." },
      { title: "Comprehensions", contentId: "py-ds-4", activity_type: "concept", estimated_minutes: 25, learning_objective: "Generate collections concisely using comprehensions." },
      { title: "Nested Data Structures", contentId: "py-ds-5", activity_type: "exercise", estimated_minutes: 25, learning_objective: "Handle complex, deeply nested JSON-like data." },
      { title: "Data Processing Exercise", contentId: "py-ds-6", activity_type: "project", estimated_minutes: 40, learning_objective: "Process and transform real-world structured data." },
    ]
  },
  "mod-python-oop": {
    id: "mod-python-oop",
    skillsTaught: ["Python","Classes","Objects","Inheritance","Composition"],
    prerequisites: ["mod-python-data-structures"],
    domain: "python",
    skill: "Object-Oriented Programming",
    title: "Object-Oriented Python",
    description: "Design software using object-oriented principles, classes, methods, and inheritance in Python.",
    rationale: "Essential for structuring and maintaining large applications.",
    targetLevels: ["intermediate", "unknown"],
    activities: [
      { title: "Classes and Objects", contentId: "py-oop-new-1", activity_type: "concept", estimated_minutes: 25, learning_objective: "Understand the blueprint of objects and instantiation." },
      { title: "__init__ and Instance State", contentId: "py-oop-new-2", activity_type: "exercise", estimated_minutes: 25, learning_objective: "Initialize object attributes correctly." },
      { title: "Methods and Encapsulation", contentId: "py-oop-new-3", activity_type: "concept", estimated_minutes: 25, learning_objective: "Add behavior to objects and control access to state." },
      { title: "Inheritance", contentId: "py-oop-new-4", activity_type: "exercise", estimated_minutes: 30, learning_objective: "Reuse code by inheriting from base classes." },
      { title: "Composition", contentId: "py-oop-new-5", activity_type: "concept", estimated_minutes: 25, learning_objective: "Build complex objects by composing simpler ones." },
      { title: "OOP Project", contentId: "py-oop-new-6", activity_type: "project", estimated_minutes: 45, learning_objective: "Design a fully object-oriented system from scratch." },
    ]
  },
  "mod-python-testing": {
    id: "mod-python-testing",
    skillsTaught: ["Python","Exceptions","Debugging","Unit Testing","Pytest"],
    prerequisites: ["mod-python-fundamentals"],
    domain: "python",
    skill: "Testing and Debugging",
    title: "Python Errors, Testing & Debugging",
    description: "Make your code robust by handling exceptions properly and writing unit tests.",
    rationale: "Critical for production-ready engineering and maintaining code quality over time.",
    targetLevels: ["intermediate", "advanced", "unknown"],
    activities: [
      { title: "Exceptions", contentId: "py-test-1", activity_type: "concept", estimated_minutes: 20, learning_objective: "Catch and handle runtime errors safely." },
      { title: "Custom Exceptions", contentId: "py-test-2", activity_type: "exercise", estimated_minutes: 20, learning_objective: "Define domain-specific error classes." },
      { title: "Debugging", contentId: "py-test-3", activity_type: "concept", estimated_minutes: 25, learning_objective: "Use debugging tools to inspect program state." },
      { title: "Assertions", contentId: "py-test-4", activity_type: "exercise", estimated_minutes: 20, learning_objective: "Validate internal state assumptions using assert." },
      { title: "Unit Testing", contentId: "py-test-5", activity_type: "concept", estimated_minutes: 30, learning_objective: "Write test suites using the unittest or pytest framework." },
      { title: "Testing Exercise", contentId: "py-test-6", activity_type: "project", estimated_minutes: 40, learning_objective: "Implement a full test suite for a provided application module." },
    ]
  },
  "mod-python-advanced": {
    id: "mod-python-advanced-new",
    skillsTaught: ["Python","Iterators","Generators","Decorators","Context Managers","Type Hints"],
    prerequisites: ["mod-python-oop"],
    domain: "python",
    skill: "Advanced Python Features",
    title: "Advanced Python Programming",
    description: "Unlock the full power of Python with advanced features like generators, decorators, and type hinting.",
    rationale: "Separates intermediate users from professional Python engineers.",
    targetLevels: ["advanced"],
    activities: [
      { title: "Iterators", contentId: "py-adv-new-1", activity_type: "concept", estimated_minutes: 20, learning_objective: "Understand the iterator protocol." },
      { title: "Generators", contentId: "py-adv-new-2", activity_type: "exercise", estimated_minutes: 25, learning_objective: "Create lazy sequences using the yield keyword." },
      { title: "Decorators", contentId: "py-adv-new-3", activity_type: "exercise", estimated_minutes: 30, learning_objective: "Modify function behavior dynamically with decorators." },
      { title: "Context Managers", contentId: "py-adv-new-4", activity_type: "concept", estimated_minutes: 25, learning_objective: "Manage resources safely using the with statement." },
      { title: "Type Hints", contentId: "py-adv-new-5", activity_type: "concept", estimated_minutes: 25, learning_objective: "Add static typing to Python for better tooling and safety." },
      { title: "Advanced Python Project", contentId: "py-adv-new-6", activity_type: "project", estimated_minutes: 45, learning_objective: "Build a highly optimized script utilizing advanced language features." },
    ]
  },
  "mod-python-apis": {
    id: "mod-python-apis",
    skillsTaught: ["Python","JSON","File Handling","HTTP requests","APIs","Environment Variables"],
    prerequisites: ["mod-python-data-structures"],
    domain: "python",
    skill: "Application Development",
    title: "Python APIs & Application Development",
    description: "Connect Python to the outside world by reading files, parsing JSON, and making HTTP requests.",
    rationale: "Modern applications rely heavily on external APIs and filesystem interaction.",
    targetLevels: ["intermediate", "advanced"],
    activities: [
      { title: "JSON", contentId: "py-api-1", activity_type: "concept", estimated_minutes: 20, learning_objective: "Parse and generate JSON data formats." },
      { title: "File Handling", contentId: "py-api-2", activity_type: "exercise", estimated_minutes: 20, learning_objective: "Read from and write to text files safely." },
      { title: "pathlib", contentId: "py-api-3", activity_type: "concept", estimated_minutes: 20, learning_objective: "Navigate cross-platform file paths objectively." },
      { title: "HTTP/API Requests", contentId: "py-api-4", activity_type: "exercise", estimated_minutes: 30, learning_objective: "Use the requests library to interact with REST APIs." },
      { title: "Environment Variables", contentId: "py-api-5", activity_type: "concept", estimated_minutes: 20, learning_objective: "Store sensitive configuration outside of source code." },
      { title: "Practical API Project", contentId: "py-api-6", activity_type: "project", estimated_minutes: 45, learning_objective: "Build a CLI tool that consumes an external weather or finance API." },
    ]
  },

  // --- GENERIC / CUSTOM ---
  "mod-custom-foundations": {
    id: "mod-custom-foundations",
    domain: "generic",
    skill: "Core Competency",
    title: "Core Foundations & Setup",
    description: "Master fundamental syntax, tooling, and conceptual models for your target domain.",
    rationale: "Establishes a solid baseline for customized learning trajectories.",
    targetLevels: ["beginner", "basics", "unknown"],
    activities: [
      { title: "Domain Conceptual Architecture", contentId: "auto-gen-37", activity_type: "concept", estimated_minutes: 20, learning_objective: "Understand the core paradigm of the domain." },
      { title: "Environment Setup & Tooling Configuration", contentId: "auto-gen-38", activity_type: "exercise", estimated_minutes: 25, learning_objective: "Prepare the development workspace." },
      { title: "First Practical Implementation Project", contentId: "auto-gen-39", activity_type: "project", estimated_minutes: 40, learning_objective: "Build a minimal working example." },
    ]
  },
  "mod-custom-intermediate": {
    id: "mod-custom-intermediate",
    domain: "generic",
    skill: "Intermediate Application",
    title: "Intermediate Patterns & Execution",
    description: "Build structured systems, implement standard practices, and solve domain problems.",
    rationale: "Transitions basic understanding into structured competence.",
    targetLevels: ["intermediate", "unknown"],
    activities: [
      { title: "Standard Architecture Patterns", contentId: "auto-gen-40", activity_type: "concept", estimated_minutes: 25, learning_objective: "Learn industry-standard structural patterns." },
      { title: "Implementation & Debugging Workflow", contentId: "auto-gen-41", activity_type: "exercise", estimated_minutes: 30, learning_objective: "Isolate and resolve common domain issues.", is_interview_prep: true },
      { title: "Comprehensive Feature Integration Project", contentId: "auto-gen-42", activity_type: "project", estimated_minutes: 45, learning_objective: "Assemble a robust, multi-component system." },
    ]
  },
  "mod-custom-advanced": {
    id: "mod-custom-advanced",
    domain: "generic",
    skill: "Advanced Architecture",
    title: "Production Optimization & Architecture",
    description: "Apply security, performance benchmarking, and complex system design workflows.",
    rationale: "Polishes practical execution for production-ready standards.",
    targetLevels: ["advanced", "unknown"],
    activities: [
      { title: "Advanced System Design & Scalability", contentId: "auto-gen-43", activity_type: "concept", estimated_minutes: 30, learning_objective: "Design for scale and fault tolerance.", is_architecture: true },
      { title: "Performance Profiling & Optimization", contentId: "auto-gen-44", activity_type: "exercise", estimated_minutes: 35, learning_objective: "Identify and resolve system bottlenecks.", is_production: true },
      { title: "Production Readiness Capstone Deployment", contentId: "auto-gen-45", activity_type: "project", estimated_minutes: 50, learning_objective: "Finalize and deploy a robust solution." },
    ]
  }
}

// ----------------------------------------------------------------------------
// DOMAIN CONFIGURATIONS & PROGRESSIONS
// ----------------------------------------------------------------------------

export const DOMAIN_REGISTRY: DomainConfig[] = [
  {
    id: "frontend",
    aliases: ["frontend", "front-end", "front end", "ui", "ux", "web design"],
    progression: {
      beginner: ["mod-html-css-basics", "mod-js-basics", "mod-js-async", "mod-react-basics"],
      intermediate: ["mod-js-async", "mod-react-basics", "mod-js-advanced", "mod-react-advanced"],
      advanced: ["mod-react-advanced", "mod-js-advanced", "mod-production"]
    }
  },
  {
    id: "backend",
    aliases: ["backend", "back-end", "back end", "api", "database", "server", "node"],
    progression: {
      beginner: ["mod-js-basics", "mod-backend-basics", "mod-db-sql"],
      intermediate: ["mod-backend-basics", "mod-db-sql", "mod-backend-advanced", "mod-production"],
      advanced: ["mod-backend-advanced", "mod-production"]
    }
  },
  {
    id: "fullstack",
    aliases: ["full-stack", "full stack", "fullstack", "web dev", "web development", "software engineer", "software engineering"],
    progression: {
      beginner: ["mod-html-css-basics", "mod-js-basics", "mod-react-basics", "mod-backend-basics", "mod-db-sql"],
      intermediate: ["mod-react-basics", "mod-backend-basics", "mod-react-advanced", "mod-backend-advanced"],
      advanced: ["mod-react-advanced", "mod-backend-advanced", "mod-production"]
    }
  },
  {
    id: "react",
    aliases: ["react", "next.js", "nextjs", "next js", "next", "react.js", "reactjs", "react mastery"],
    progression: {
      beginner: ["mod-js-basics", "mod-react-basics", "mod-react-advanced"],
      intermediate: ["mod-react-basics", "mod-react-advanced", "mod-production"],
      advanced: ["mod-react-advanced", "mod-production"]
    }
  },
  {
    id: "javascript",
    aliases: ["javascript", "js", "typescript", "ts", "javascript core", "async"],
    progression: {
      beginner: ["mod-js-basics", "mod-js-async"],
      intermediate: ["mod-js-async", "mod-js-advanced"],
      advanced: ["mod-js-advanced"]
    }
  },
  {
    id: "ai",
    aliases: ["ai", "llm", "artificial intelligence", "machine learning", "rag", "vector db", "prompt engineering", "ai integration"],
    progression: {
      beginner: ["mod-js-basics", "mod-ai-integration", "mod-ai-rag"],
      intermediate: ["mod-ai-integration", "mod-ai-rag"],
      advanced: ["mod-ai-integration", "mod-ai-rag"]
    }
  },
  {
    id: "python",
    aliases: ["python", "python developer", "python development", "data scientist", "data science", "data analysis", "machine learning engineer", "ml engineer", "ai engineer"],
    progression: {
      beginner: ["mod-python-fundamentals", "mod-python-data-structures"],
      intermediate: ["mod-python-oop", "mod-python-testing", "mod-python-apis"],
      advanced: ["mod-python-advanced-new"]
    }
  },
  {
    id: "generic",
    aliases: ["custom", "unknown"],
    progression: {
      beginner: ["mod-custom-foundations", "mod-custom-intermediate"],
      intermediate: ["mod-custom-intermediate", "mod-custom-advanced"],
      advanced: ["mod-custom-advanced"]
    }
  }
]
