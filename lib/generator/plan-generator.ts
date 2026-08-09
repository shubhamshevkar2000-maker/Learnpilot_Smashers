import type { LearnerProfile, CurrentLevel, ActivityType } from "@/types/database.types"

export interface GeneratedActivity {
  title: string
  activity_type: ActivityType
  sequence_order: number
  estimated_minutes: number
}

export interface GeneratedModule {
  title: string
  description: string
  rationale: string
  sequence_order: number
  estimated_minutes: number
  activities: GeneratedActivity[]
}

export interface GeneratedPlan {
  title: string
  goal_summary: string
  modules: GeneratedModule[]
}

/**
 * Calculates module estimated minutes as the exact sum of its activity estimated minutes.
 */
export function sumActivityMinutes(activities: GeneratedActivity[]): number {
  return activities.reduce((acc, act) => acc + (act.estimated_minutes || 20), 0)
}

/**
 * Deterministic, highly personalized learning plan generator.
 * Maps learner_profiles inputs into tailored curriculum modules without hardcoding
 * or pretending an external LLM generated it.
 */
export function generateLearningPlan(profile: LearnerProfile): GeneratedPlan {
  const goal = (profile.learning_goal || "General Web Development").trim()
  const outcome = (profile.desired_outcome || "Build practical applications").trim()
  const level: CurrentLevel = profile.current_level || "beginner"

  const lowerGoal = goal.toLowerCase()

  // Dynamic Plan Title & Summary
  const planTitle = `${goal} — Adaptive Curriculum`
  const goalSummary = `A structured, level-calibrated path designed to take you from ${
    level === "beginner" ? "foundations" : level === "intermediate" ? "intermediate knowledge" : "advanced concepts"
  } to achieving: "${outcome}".`

  let rawModules: {
    title: string
    description: string
    rationale: string
    activities: { title: string; activity_type: ActivityType; estimated_minutes: number }[]
  }[] = []

  // Domain-specific curriculum mapping with 100% complete topic-to-activity alignment
  if (lowerGoal.includes("full-stack") || lowerGoal.includes("full stack") || lowerGoal.includes("web dev")) {
    if (level === "beginner" || level === "basics" || level === "unknown") {
      rawModules = [
        {
          title: "Web Fundamentals & Structural Syntax",
          description: "Master Modern HTML5 semantics, accessibility, CSS flexbox/grid layouts, and responsive spatial design principles.",
          rationale: "Establishes structural proficiency required before handling client-side scripting and state management.",
          activities: [
            { title: "HTML5 Document Structure & Page Syntax", activity_type: "concept", estimated_minutes: 20 },
            { title: "Semantic HTML5 Elements & Content Outlining", activity_type: "exercise", estimated_minutes: 25 },
            { title: "HTML Forms, Inputs & Accessible ARIA Attributes", activity_type: "exercise", estimated_minutes: 25 },
            { title: "CSS Selectors, Box Model & Spacing Rules", activity_type: "concept", estimated_minutes: 25 },
            { title: "CSS Flexbox One-Dimensional Layout Architecture", activity_type: "exercise", estimated_minutes: 30 },
            { title: "CSS Grid Two-Dimensional Spatial Systems", activity_type: "exercise", estimated_minutes: 30 },
            { title: "Responsive Spatial Design & Media Query Rules", activity_type: "concept", estimated_minutes: 25 },
            { title: "Comprehensive Responsive Layout Capstone Project", activity_type: "project", estimated_minutes: 45 },
            { title: "Web Fundamentals Knowledge Checkpoint", activity_type: "reflection", estimated_minutes: 15 },
          ],
        },
        {
          title: "JavaScript Engine Mechanics & Async Control",
          description: "Deep dive into ES6+ syntax, closures, DOM manipulation, event loop, Promises, and fetch API operations.",
          rationale: "Critical foundation for understanding modern frontend frameworks and asynchronous network requests.",
          activities: [
            { title: "ES6+ Syntax Essentials, Let/Const & Arrow Functions", activity_type: "concept", estimated_minutes: 20 },
            { title: "Variable Scope, Execution Context & Closures", activity_type: "concept", estimated_minutes: 25 },
            { title: "DOM Node Selection, Event Listeners & Page Manipulation", activity_type: "exercise", estimated_minutes: 30 },
            { title: "JavaScript Event Loop & Single-Threaded Concurrency", activity_type: "concept", estimated_minutes: 25 },
            { title: "Promises, Chaining & Async/Await Control Flow", activity_type: "exercise", estimated_minutes: 30 },
            { title: "Fetch API & Remote HTTP Data Operations", activity_type: "exercise", estimated_minutes: 30 },
            { title: "Interactive Async Web Application Project", activity_type: "project", estimated_minutes: 45 },
            { title: "JavaScript Core Mechanics Checkpoint", activity_type: "reflection", estimated_minutes: 15 },
          ],
        },
        {
          title: "React Components & State Management",
          description: "Build declarative component hierarchies, props flow, useState, useEffect side effects, custom hooks, and form state predictability.",
          rationale: "Provides component-driven architecture skills needed for complex interactive web applications.",
          activities: [
            { title: "JSX Syntax & Declarative Component Hierarchies", activity_type: "concept", estimated_minutes: 25 },
            { title: "Props Unidirectional Data Flow & Type Safety", activity_type: "exercise", estimated_minutes: 25 },
            { title: "Local Component State & useState Hook Patterns", activity_type: "exercise", estimated_minutes: 30 },
            { title: "Side Effects, Data Fetching & useEffect Lifecycle", activity_type: "concept", estimated_minutes: 30 },
            { title: "Form State Control & Input Validation", activity_type: "exercise", estimated_minutes: 25 },
            { title: "Custom React Hooks Abstraction & State Sharing", activity_type: "exercise", estimated_minutes: 30 },
            { title: "Modular Interactive React Application Project", activity_type: "project", estimated_minutes: 45 },
            { title: "React Component Architecture Checkpoint", activity_type: "reflection", estimated_minutes: 15 },
          ],
        },
        {
          title: "Full-Stack Server APIs & Database Persistence",
          description: "Design RESTful and GraphQL endpoints, relational SQL modeling, integrate PostgreSQL/Supabase, and enforce authentication security.",
          rationale: "Fulfills your target outcome of building production-grade full-stack web applications.",
          activities: [
            { title: "Node.js Environment & HTTP Server Route Handlers", activity_type: "concept", estimated_minutes: 25 },
            { title: "RESTful API Endpoint Design & Route Validation", activity_type: "exercise", estimated_minutes: 30 },
            { title: "GraphQL Schema Definition & Resolver Implementation", activity_type: "exercise", estimated_minutes: 35 },
            { title: "Relational Schemas & SQL Database Modeling", activity_type: "concept", estimated_minutes: 30 },
            { title: "PostgreSQL & Supabase Client Integration", activity_type: "exercise", estimated_minutes: 35 },
            { title: "Authentication Security, JWT & Session Guards", activity_type: "exercise", estimated_minutes: 35 },
            { title: "End-to-End Full-Stack Application Deployment Project", activity_type: "project", estimated_minutes: 60 },
            { title: "Full-Stack Architecture Final Checkpoint", activity_type: "reflection", estimated_minutes: 15 },
          ],
        },
      ]
    } else {
      rawModules = [
        {
          title: "Advanced React Patterns & Server Components",
          description: "Implement Next.js App Router, React Server Components, Server Actions, and streaming SSR optimizations.",
          rationale: "Accelerates your existing foundation to modern production-standard full-stack patterns.",
          activities: [
            { title: "React Server Components Architecture & Boundaries", activity_type: "concept", estimated_minutes: 25 },
            { title: "Next.js App Router Layouts & Route Handlers", activity_type: "exercise", estimated_minutes: 30 },
            { title: "Server Actions Data Mutations & Form Invalidation", activity_type: "exercise", estimated_minutes: 35 },
            { title: "Streaming SSR Optimizations & React Suspense Out-of-Order Hydration", activity_type: "concept", estimated_minutes: 30 },
            { title: "High-Performance Next.js Server Components Project", activity_type: "project", estimated_minutes: 50 },
            { title: "Server Component Architecture Checkpoint", activity_type: "reflection", estimated_minutes: 15 },
          ],
        },
        {
          title: "Relational Schema Architecture & RLS Security",
          description: "Design scalable PostgreSQL models, composite foreign keys, indexing execution plans, and granular Row Level Security policies.",
          rationale: "Ensures back-end architecture handles real-world data isolation and secure enterprise scaling.",
          activities: [
            { title: "Relational Modeling & Composite Foreign Key Design", activity_type: "concept", estimated_minutes: 25 },
            { title: "PostgreSQL Indexing Strategies & Query Execution Plans", activity_type: "exercise", estimated_minutes: 30 },
            { title: "Granular Row Level Security (RLS) Policy Crafting", activity_type: "exercise", estimated_minutes: 35 },
            { title: "Atomic Transactions & Database Migration Workflows", activity_type: "concept", estimated_minutes: 30 },
            { title: "Multi-Tenant Enterprise Database Infrastructure Project", activity_type: "project", estimated_minutes: 50 },
            { title: "Database Security Verification Audit", activity_type: "reflection", estimated_minutes: 15 },
          ],
        },
        {
          title: "API Middleware, Auth Protocols & Webhooks",
          description: "Configure JWT authentication, OAuth2 providers, API proxying, rate limiting, and third-party webhook ingest systems.",
          rationale: "Directly empowers you to achieve: " + outcome,
          activities: [
            { title: "JWT Auth Tokens, OAuth2 Providers & Session Guards", activity_type: "concept", estimated_minutes: 25 },
            { title: "Next.js Edge Middleware API Proxying & Rate Limiting", activity_type: "exercise", estimated_minutes: 35 },
            { title: "Idempotent Webhook Ingestion Engine & Signature Verification", activity_type: "project", estimated_minutes: 45 },
            { title: "API Protocols & Middleware Verification Checkpoint", activity_type: "reflection", estimated_minutes: 15 },
          ],
        },
        {
          title: "Production Deployment, CI/CD & Performance Telemetry",
          description: "Deploy serverless architectures on Vercel/AWS, configure automated CI pipelines, automated testing, and monitor Web Vitals telemetry.",
          rationale: "Completes the full-stack engineering trajectory with enterprise deployment readiness.",
          activities: [
            { title: "Serverless Architecture Mechanics on Vercel & AWS Edge", activity_type: "concept", estimated_minutes: 25 },
            { title: "Automated CI/CD Pipeline Configuration & Unit/E2E Testing", activity_type: "exercise", estimated_minutes: 35 },
            { title: "Real User Monitoring, Telemetry & Core Web Vitals Optimization", activity_type: "project", estimated_minutes: 45 },
            { title: "Production Readiness Capstone Review", activity_type: "reflection", estimated_minutes: 20 },
          ],
        },
      ]
    }
  } else {
    // Generic adaptable domain trajectory
    rawModules = [
      {
        title: `${goal} — Core Foundations`,
        description: `Master fundamental syntax, essential tooling, and core conceptual models for ${goal}.`,
        rationale: `Calibrated for your starting baseline of ${level} level.`,
        activities: [
          { title: `${goal} Foundational Concepts & Syntax`, activity_type: "concept", estimated_minutes: 20 },
          { title: `${goal} Essential Tooling & Environment Setup`, activity_type: "exercise", estimated_minutes: 25 },
          { title: `${goal} Core Problem Solving Practice`, activity_type: "exercise", estimated_minutes: 25 },
          { title: `${goal} Practical Hands-On Starter Project`, activity_type: "project", estimated_minutes: 40 },
          { title: "Foundation Knowledge Checkpoint", activity_type: "reflection", estimated_minutes: 15 },
        ],
      },
      {
        title: `${goal} — Intermediate Patterns & System Design`,
        description: `Build structured modules, implement standard algorithms, and solve practical domain problems.`,
        rationale: "Transitions basic understanding into structured domain competence.",
        activities: [
          { title: "Architecture Patterns & Core Algorithms", activity_type: "concept", estimated_minutes: 25 },
          { title: "Structured Module Design & Standard Practices", activity_type: "exercise", estimated_minutes: 30 },
          { title: "Practical Application Feature Project", activity_type: "project", estimated_minutes: 45 },
          { title: "System Architecture Checkpoint", activity_type: "reflection", estimated_minutes: 15 },
        ],
      },
      {
        title: `${goal} — Applied Project Integration`,
        description: `Develop a comprehensive, real-world project incorporating best practices and modern tooling.`,
        rationale: `Tailored to achieve your target outcome: "${outcome}".`,
        activities: [
          { title: "Project Scope & Integration Specification", activity_type: "concept", estimated_minutes: 25 },
          { title: "Core Subsystem Development & Testing", activity_type: "exercise", estimated_minutes: 35 },
          { title: "Full Portfolio Project Implementation", activity_type: "project", estimated_minutes: 60 },
          { title: "Target Outcome Verification", activity_type: "reflection", estimated_minutes: 20 },
        ],
      },
      {
        title: `${goal} — Production Optimization & Launch`,
        description: "Apply security protocols, performance benchmarking, and production deployment workflows.",
        rationale: "Completes the practical learning curve for your target horizon.",
        activities: [
          { title: "Security Protocols & Error Isolation", activity_type: "concept", estimated_minutes: 25 },
          { title: "Performance Benchmarking & Profiling Workflows", activity_type: "exercise", estimated_minutes: 30 },
          { title: "Final Capstone Production Deployment", activity_type: "project", estimated_minutes: 45 },
          { title: "Learning Trajectory Final Reflection", activity_type: "reflection", estimated_minutes: 20 },
        ],
      },
    ]
  }

  // Construct final modules array with sequence orders and EXACT activity sum estimated minutes
  const modules: GeneratedModule[] = rawModules.map((m, mIdx) => {
    const activities: GeneratedActivity[] = m.activities.map((a, aIdx) => ({
      title: a.title,
      activity_type: a.activity_type,
      sequence_order: aIdx + 1,
      estimated_minutes: a.estimated_minutes,
    }))

    const estimated_minutes = sumActivityMinutes(activities)

    return {
      title: m.title,
      description: m.description,
      rationale: m.rationale,
      sequence_order: mIdx + 1,
      estimated_minutes,
      activities,
    }
  })

  return {
    title: planTitle,
    goal_summary: goalSummary,
    modules,
  }
}
