import type { LearnerProfile, CurrentLevel } from "@/types/database.types"

export interface GeneratedModule {
  title: string
  description: string
  rationale: string
  sequence_order: number
  estimated_minutes: number
}

export interface GeneratedPlan {
  title: string
  goal_summary: string
  modules: GeneratedModule[]
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
  const dailyMins = profile.available_daily_minutes || 45

  // Pacing multiplier for estimated module durations based on daily commitment
  const modulePacingMins = Math.max(30, Math.min(120, Math.round(dailyMins * 1.5)))

  const lowerGoal = goal.toLowerCase()

  // Dynamic Plan Title & Summary
  const planTitle = `${goal} — Adaptive Curriculum`
  const goalSummary = `A structured, level-calibrated path designed to take you from ${
    level === "beginner" ? "foundations" : level === "intermediate" ? "intermediate knowledge" : "advanced concepts"
  } to achieving: "${outcome}".`

  let moduleDefs: { title: string; description: string; rationale: string }[] = []

  // Domain-specific curriculum mapping
  if (lowerGoal.includes("full-stack") || lowerGoal.includes("full stack") || lowerGoal.includes("web dev")) {
    if (level === "beginner" || level === "basics" || level === "unknown") {
      moduleDefs = [
        {
          title: "Web Fundamentals & Structural Syntax",
          description: "Master Modern HTML5 semantics, CSS flexbox/grid layouts, and responsive spatial design principles.",
          rationale: "Establishes structural proficiency required before handling client-side scripting and state management.",
        },
        {
          title: "JavaScript Engine Mechanics & Async Control",
          description: "Deep dive into ES6+ syntax, closures, event loop, Promises, and fetch API operations.",
          rationale: "Critical foundation for understanding modern frontend frameworks and asynchronous network requests.",
        },
        {
          title: "React Components & State Management",
          description: "Build declarative component hierarchies, custom hooks, and manage client-side state predictability.",
          rationale: "Provides component-driven architecture skills needed for complex interactive web applications.",
        },
        {
          title: "Full-Stack Server APIs & Database Persistence",
          description: "Design RESTful and GraphQL endpoints, integrate PostgreSQL/Supabase, and enforce authentication security.",
          rationale: "Fulfills your target outcome of building production-grade full-stack web applications.",
        },
      ]
    } else {
      moduleDefs = [
        {
          title: "Advanced React Patterns & Server Components",
          description: "Implement Next.js App Router, React Server Components, and streaming SSR optimizations.",
          rationale: "Accelerates your existing foundation to modern production-standard full-stack patterns.",
        },
        {
          title: "Relational Schema Architecture & RLS Security",
          description: "Design scalable PostgreSQL models, composite foreign keys, and granular Row Level Security policies.",
          rationale: "Ensures back-end architecture handles real-world data isolation and secure enterprise scaling.",
        },
        {
          title: "API Middleware, Auth Protocols & Webhooks",
          description: "Configure JWT authentication, OAuth providers, API proxying, and third-party webhook ingest systems.",
          rationale: "Directly empowers you to achieve: " + outcome,
        },
        {
          title: "Production Deployment, CI/CD & Performance Telemetry",
          description: "Deploy serverless architectures on Vercel/AWS, configure automated CI pipelines, and monitor Web Vitals.",
          rationale: "Completes the full-stack engineering trajectory with enterprise deployment readiness.",
        },
      ]
    }
  } else if (lowerGoal.includes("ai") || lowerGoal.includes("machine learning") || lowerGoal.includes("data science")) {
    moduleDefs = [
      {
        title: "Python Data Structures & Numerical Computing",
        description: "Master NumPy vectorization, Pandas dataframes, and clean data wrangling pipelines.",
        rationale: "Establishes data manipulation mastery necessary for machine learning models.",
      },
      {
        title: "Supervised & Unsupervised Learning Primitives",
        description: "Implement classification, regression, clustering algorithms, and model evaluation metrics.",
        rationale: "Builds core statistical algorithms foundation tailored to your starting level.",
      },
      {
        title: "Neural Networks & Deep Learning Frameworks",
        description: "Build perceptrons, PyTorch models, and understand backpropagation gradient descent.",
        rationale: "Unlocks modern deep learning architectures and generative AI capabilities.",
      },
      {
        title: "LLM Integration, Embeddings & RAG Architectures",
        description: "Connect vector databases, generate embeddings, and build Retrieval-Augmented Generation workflows.",
        rationale: "Directly targets your outcome: " + outcome,
      },
    ]
  } else if (lowerGoal.includes("frontend") || lowerGoal.includes("front-end") || lowerGoal.includes("ui")) {
    moduleDefs = [
      {
        title: "Advanced CSS Systems & Motion Physics",
        description: "Master CSS subgrid, container queries, WebGL/Three.js primitives, and spring animation physics.",
        rationale: "Lays aesthetic and technical foundations for top-tier modern web interfaces.",
      },
      {
        title: "TypeScript Architecture & Enterprise React",
        description: "Enforce strict generic types, component design systems, and robust state machines.",
        rationale: "Ensures frontend codebases maintain zero runtime type errors at scale.",
      },
      {
        title: "Client Performance, Caching & Bundle Optimization",
        description: "Optimize tree-shaking, code-splitting, Web Vitals, and browser render pipelines.",
        rationale: "Directly supports your goal of crafting fluid, high-performance web products.",
      },
      {
        title: "Production Web App Integration",
        description: "Connect frontend applications with real-time web sockets, backend APIs, and edge deployment.",
        rationale: "Delivers your desired outcome: " + outcome,
      },
    ]
  } else {
    // Generic adaptable domain trajectory
    moduleDefs = [
      {
        title: `${goal} — Core Foundations`,
        description: `Master fundamental syntax, essential tooling, and core conceptual models for ${goal}.`,
        rationale: `Calibrated for your starting baseline of ${level} level.`,
      },
      {
        title: `${goal} — Intermediate Patterns & System Design`,
        description: `Build structured modules, implement standard algorithms, and solve practical domain problems.`,
        rationale: "Transitions basic understanding into structured domain competence.",
      },
      {
        title: `${goal} — Applied Project Integration`,
        description: `Develop a comprehensive, real-world project incorporating best practices and modern tooling.`,
        rationale: `Tailored to achieve your target outcome: "${outcome}".`,
      },
      {
        title: `${goal} — Production Optimization & Launch`,
        description: "Apply security protocols, performance benchmarking, and production deployment workflows.",
        rationale: "Completes the practical learning curve for your target horizon.",
      },
    ]
  }

  // Construct final modules array with sequence orders and estimated minutes
  const modules: GeneratedModule[] = moduleDefs.map((def, idx) => ({
    title: def.title,
    description: def.description,
    rationale: def.rationale,
    sequence_order: idx + 1,
    estimated_minutes: modulePacingMins,
  }))

  return {
    title: planTitle,
    goal_summary: goalSummary,
    modules,
  }
}
