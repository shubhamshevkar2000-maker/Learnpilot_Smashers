import type { CurrentLevel, ActivityType } from "@/types/database.types"

export type DomainId = "frontend" | "backend" | "fullstack" | "react" | "javascript" | "ai" | "generic"

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
    id: "generic",
    aliases: ["custom", "unknown"],
    progression: {
      beginner: ["mod-custom-foundations", "mod-custom-intermediate"],
      intermediate: ["mod-custom-intermediate", "mod-custom-advanced"],
      advanced: ["mod-custom-advanced"]
    }
  }
]
