import { config } from "dotenv"
config({ path: ".env.local" })

import { createClient } from "@supabase/supabase-js"
import type { Database, CurrentLevel, ActivityType, ModuleStatus } from "../types/database.types"

const DEMO_EMAIL = "demo@learnpilot.app"
const DEMO_PASSWORD = "LearnPilot@Demo2026!"
const DEMO_NAME = "Alex Morgan"
const DEMO_GOAL = "Full-Stack Web Development"
const DEMO_OUTCOME = "Build production-ready full-stack applications"
const DEMO_LEVEL: CurrentLevel = "intermediate"
const DEMO_DAILY_MINUTES = 45
const DEMO_TARGET_DATE = "2026-11-30"

interface ModuleSeedDef {
  sequence: number
  title: string
  description: string
  rationale: string
  status: ModuleStatus
  estimatedMinutes: number
  startedDaysAgo?: number
  completedDaysAgo?: number
  activities: {
    sequence: number
    title: string
    activityType: ActivityType
    estimatedMinutes: number
    dayNumber: number
    contentId: string
    isCompleted: boolean
    completedHoursAgo?: number
  }[]
}

const SEED_MODULES: ModuleSeedDef[] = [
  {
    sequence: 1,
    title: "Web Fundamentals",
    description: "Master HTML5 semantics, accessibility, and foundational CSS layout principles.",
    rationale: "Establishes structural and design proficiency required before client-side scripting.",
    status: "completed",
    estimatedMinutes: 145,
    startedDaysAgo: 14,
    completedDaysAgo: 10,
    activities: [
      { sequence: 1, title: "HTML5 Document Structure & Page Syntax", activityType: "concept", estimatedMinutes: 20, dayNumber: 1, contentId: "html-css-l1", isCompleted: true, completedHoursAgo: 240 },
      { sequence: 2, title: "Semantic HTML5 Elements & Accessibility", activityType: "exercise", estimatedMinutes: 25, dayNumber: 1, contentId: "html-css-l2", isCompleted: true, completedHoursAgo: 238 },
      { sequence: 3, title: "CSS Selectors, Box Model & Spacing Rules", activityType: "concept", estimatedMinutes: 25, dayNumber: 2, contentId: "html-css-l3", isCompleted: true, completedHoursAgo: 235 },
      { sequence: 4, title: "CSS Flexbox One-Dimensional Layouts", activityType: "exercise", estimatedMinutes: 30, dayNumber: 2, contentId: "html-css-l4", isCompleted: true, completedHoursAgo: 230 },
      { sequence: 5, title: "Responsive Layout Capstone Project", activityType: "project", estimatedMinutes: 45, dayNumber: 3, contentId: "html-css-l6", isCompleted: true, completedHoursAgo: 220 },
    ],
  },
  {
    sequence: 2,
    title: "JavaScript Foundations",
    description: "Deep dive into ES6+ syntax, variable scopes, closures, and DOM interaction.",
    rationale: "Critical core programming foundation for modern interactive web applications.",
    status: "completed",
    estimatedMinutes: 135,
    startedDaysAgo: 10,
    completedDaysAgo: 3,
    activities: [
      { sequence: 1, title: "ES6+ Syntax Essentials, Let/Const & Arrow Functions", activityType: "concept", estimatedMinutes: 20, dayNumber: 3, contentId: "js-fund-l1", isCompleted: true, completedHoursAgo: 72 },
      { sequence: 2, title: "Variable Scope, Execution Context & Closures", activityType: "concept", estimatedMinutes: 25, dayNumber: 4, contentId: "js-fund-l2", isCompleted: true, completedHoursAgo: 70 },
      { sequence: 3, title: "DOM Node Selection & Event Listeners", activityType: "exercise", estimatedMinutes: 30, dayNumber: 4, contentId: "js-fund-l3", isCompleted: true, completedHoursAgo: 68 },
      { sequence: 4, title: "Interactive DOM Manipulation Project", activityType: "project", estimatedMinutes: 45, dayNumber: 5, contentId: "auto-gen-2", isCompleted: true, completedHoursAgo: 60 },
      { sequence: 5, title: "JavaScript Fundamentals Checkpoint", activityType: "reflection", estimatedMinutes: 15, dayNumber: 5, contentId: "auto-gen-3", isCompleted: true, completedHoursAgo: 58 },
    ],
  },
  {
    sequence: 3,
    title: "Advanced JavaScript & Async Programming",
    description: "Master the Event Loop, Promises, async/await, and Fetch API communication.",
    rationale: "Essential for communicating with backend services and building non-blocking web apps.",
    status: "in_progress",
    estimatedMinutes: 145,
    startedDaysAgo: 3,
    activities: [
      { sequence: 1, title: "JavaScript Event Loop & Execution Context", activityType: "concept", estimatedMinutes: 20, dayNumber: 6, contentId: "auto-gen-4", isCompleted: true, completedHoursAgo: 2 },
      { sequence: 2, title: "Promises, Chaining & Async/Await Deep Dive", activityType: "exercise", estimatedMinutes: 25, dayNumber: 6, contentId: "js-fund-l4", isCompleted: false },
      { sequence: 3, title: "Fetch API & Remote HTTP Data Operations", activityType: "exercise", estimatedMinutes: 25, dayNumber: 7, contentId: "js-fund-l5", isCompleted: false },
      { sequence: 4, title: "Web Workers & Async Performance Patterns", activityType: "project", estimatedMinutes: 45, dayNumber: 7, contentId: "auto-gen-9", isCompleted: false },
      { sequence: 5, title: "Async Programming Knowledge Checkpoint", activityType: "reflection", estimatedMinutes: 30, dayNumber: 8, contentId: "auto-gen-5", isCompleted: false },
    ],
  },
  {
    sequence: 4,
    title: "React & Component Architecture",
    description: "Build declarative component hierarchies, manage state with hooks, and handle side effects.",
    rationale: "Provides the modern frontend architecture for scalable web apps.",
    status: "not_started",
    estimatedMinutes: 155,
    activities: [
      { sequence: 1, title: "JSX Syntax & Component Declarations", activityType: "concept", estimatedMinutes: 25, dayNumber: 8, contentId: "react-l1", isCompleted: false },
      { sequence: 2, title: "Props, Data Flow & Immutability", activityType: "exercise", estimatedMinutes: 25, dayNumber: 9, contentId: "react-l2", isCompleted: false },
      { sequence: 3, title: "Local State Management with useState", activityType: "exercise", estimatedMinutes: 30, dayNumber: 9, contentId: "react-l3", isCompleted: false },
      { sequence: 4, title: "Side Effects & the useEffect Lifecycle", activityType: "concept", estimatedMinutes: 30, dayNumber: 10, contentId: "react-l4", isCompleted: false },
      { sequence: 5, title: "React State & Props Capstone Project", activityType: "project", estimatedMinutes: 45, dayNumber: 10, contentId: "react-l5", isCompleted: false },
    ],
  },
  {
    sequence: 5,
    title: "Node.js & APIs",
    description: "Construct scalable RESTful APIs, HTTP servers, and structured middleware pipelines.",
    rationale: "Forms the robust business logic and API backend layer for full-stack applications.",
    status: "not_started",
    estimatedMinutes: 130,
    activities: [
      { sequence: 1, title: "Node.js Runtime & HTTP Protocol Fundamentals", activityType: "concept", estimatedMinutes: 25, dayNumber: 11, contentId: "auto-gen-15", isCompleted: false },
      { sequence: 2, title: "RESTful API Design Principles & Routing", activityType: "exercise", estimatedMinutes: 30, dayNumber: 11, contentId: "auto-gen-16", isCompleted: false },
      { sequence: 3, title: "Request Validation & Error Handling Middleware", activityType: "exercise", estimatedMinutes: 30, dayNumber: 12, contentId: "auto-gen-17", isCompleted: false },
      { sequence: 4, title: "Build a Robust REST API Project", activityType: "project", estimatedMinutes: 45, dayNumber: 12, contentId: "auto-gen-18", isCompleted: false },
    ],
  },
  {
    sequence: 6,
    title: "PostgreSQL & Databases",
    description: "Relational data modeling, ACID transactions, complex joins, and indexing strategies.",
    rationale: "Guarantees reliable persistence, data integrity, and fast querying at scale.",
    status: "not_started",
    estimatedMinutes: 140,
    activities: [
      { sequence: 1, title: "Relational Modeling & Schema Design", activityType: "concept", estimatedMinutes: 25, dayNumber: 13, contentId: "auto-gen-19", isCompleted: false },
      { sequence: 2, title: "Complex Queries, Joins & Aggregations", activityType: "exercise", estimatedMinutes: 35, dayNumber: 13, contentId: "auto-gen-20", isCompleted: false },
      { sequence: 3, title: "B-Tree Indexes & Query Optimization", activityType: "concept", estimatedMinutes: 35, dayNumber: 14, contentId: "auto-gen-21", isCompleted: false },
      { sequence: 4, title: "Database Migrations & Constraints Project", activityType: "project", estimatedMinutes: 45, dayNumber: 14, contentId: "auto-gen-22", isCompleted: false },
    ],
  },
  {
    sequence: 7,
    title: "Authentication & Security",
    description: "JWTs, session management, OAuth 2.0, Row Level Security (RLS), and OWASP best practices.",
    rationale: "Protects sensitive user data and enforces multi-tenant security guarantees.",
    status: "not_started",
    estimatedMinutes: 120,
    activities: [
      { sequence: 1, title: "Session Auth vs Token-Based Auth (JWT)", activityType: "concept", estimatedMinutes: 25, dayNumber: 15, contentId: "auto-gen-23", isCompleted: false },
      { sequence: 2, title: "Implementing Password Hashing & Salts", activityType: "exercise", estimatedMinutes: 30, dayNumber: 15, contentId: "auto-gen-24", isCompleted: false },
      { sequence: 3, title: "Row Level Security (RLS) & Multi-Tenancy", activityType: "exercise", estimatedMinutes: 30, dayNumber: 16, contentId: "auto-gen-25", isCompleted: false },
      { sequence: 4, title: "Securing APIs Against OWASP Top 10", activityType: "project", estimatedMinutes: 35, dayNumber: 16, contentId: "auto-gen-26", isCompleted: false },
    ],
  },
  {
    sequence: 8,
    title: "Production Deployment",
    description: "Containerization with Docker, CI/CD pipelines, edge caching, and serverless hosting.",
    rationale: "Ensures production reliability, zero-downtime deployments, and global low latency.",
    status: "not_started",
    estimatedMinutes: 110,
    activities: [
      { sequence: 1, title: "Production Build Optimizations & Tree Shaking", activityType: "concept", estimatedMinutes: 25, dayNumber: 17, contentId: "auto-gen-27", isCompleted: false },
      { sequence: 2, title: "CI/CD Automation & Automated Testing", activityType: "exercise", estimatedMinutes: 30, dayNumber: 17, contentId: "auto-gen-28", isCompleted: false },
      { sequence: 3, title: "Edge Caching, CDN & Serverless Deployments", activityType: "concept", estimatedMinutes: 25, dayNumber: 18, contentId: "auto-gen-29", isCompleted: false },
      { sequence: 4, title: "Full-Stack Production Deployment Capstone", activityType: "project", estimatedMinutes: 30, dayNumber: 18, contentId: "auto-gen-30", isCompleted: false },
    ],
  },
]

async function seedDemo() {
  console.log("==================================================")
  console.log("🚀 Initializing LearnPilot Demo Account Seeder")
  console.log("==================================================")

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
    process.exit(1)
  }

  const baseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)

  // 1. Authenticate or Register Demo User
  console.log(`\n[1/7] Authenticating demo user: ${DEMO_EMAIL}...`)
  let userId: string
  let accessToken: string

  const { data: signInData, error: signInError } = await baseClient.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  })

  if (signInData?.user && signInData?.session) {
    console.log(`✅ Existing demo user authenticated (UUID: ${signInData.user.id})`)
    userId = signInData.user.id
    accessToken = signInData.session.access_token
  } else {
    console.log(`ℹ️ User not found or sign-in failed (${signInError?.message}). Creating new Supabase Auth user...`)
    const { data: signUpData, error: signUpError } = await baseClient.auth.signUp({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      options: {
        data: {
          full_name: DEMO_NAME,
          name: DEMO_NAME,
        },
      },
    })

    if (signUpError || !signUpData.user) {
      console.error("❌ Failed to create demo user:", signUpError)
      process.exit(1)
    }

    userId = signUpData.user.id
    console.log(`✅ Created demo user (UUID: ${userId})`)

    // Attempt immediate sign-in to obtain access token
    const { data: followSignIn, error: followSignInErr } = await baseClient.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })

    if (followSignIn?.session) {
      accessToken = followSignIn.session.access_token
    } else {
      console.warn("⚠️ Immediate sign-in after signup did not return session:", followSignInErr?.message)
      accessToken = ""
    }
  }

  // Create an authenticated client scoped to this user
  const authClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  })

  // 2. Seed Learner Profile
  console.log(`\n[2/7] Seeding Learner Profile for ${DEMO_NAME}...`)
  const { data: existingProfile } = await authClient
    .from("learner_profiles")
    .select("id, user_id")
    .eq("user_id", userId)
    .maybeSingle()

  const profilePayload = {
    user_id: userId,
    display_name: DEMO_NAME,
    learning_goal: DEMO_GOAL,
    desired_outcome: DEMO_OUTCOME,
    current_level: DEMO_LEVEL,
    available_daily_minutes: DEMO_DAILY_MINUTES,
    target_date: DEMO_TARGET_DATE,
    onboarding_completed: true,
  }

  if (existingProfile) {
    const { error: profUpErr } = await authClient
      .from("learner_profiles")
      .update(profilePayload)
      .eq("user_id", userId)

    if (profUpErr) console.error("Error updating profile:", profUpErr)
    else console.log("✅ Profile updated successfully")
  } else {
    const { error: profInsErr } = await authClient
      .from("learner_profiles")
      .insert(profilePayload)

    if (profInsErr) console.error("Error inserting profile:", profInsErr)
    else console.log("✅ Profile inserted successfully")
  }

  // 3. Seed Learning Plan
  console.log(`\n[3/7] Seeding Active Learning Plan...`)
  const { data: existingPlan } = await authClient
    .from("learning_plans")
    .select("id, user_id, title")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle()

  let planId: string

  if (existingPlan) {
    planId = existingPlan.id
    console.log(`✅ Reusing existing active plan (Plan ID: ${planId})`)
  } else {
    const { data: newPlan, error: planErr } = await authClient
      .from("learning_plans")
      .insert({
        user_id: userId,
        title: `${DEMO_GOAL} — Comprehensive Career Roadmap`,
        goal_summary: `A realistic, structured curriculum taking you from intermediate knowledge to achieving "${DEMO_OUTCOME}" over a target horizon of ~6 months.`,
        status: "active",
        generation_metadata: {
          generator: "demo_seed_v1",
          domain: "fullstack",
          seeded_at: new Date().toISOString(),
        },
      })
      .select("id")
      .single()

    if (planErr || !newPlan) {
      console.error("❌ Error creating learning plan:", planErr)
      process.exit(1)
    }

    planId = newPlan.id
    console.log(`✅ Created new active learning plan (Plan ID: ${planId})`)
  }

  // 4. Seed Learning Modules & Activities (Idempotently)
  console.log(`\n[4/7] Seeding 8 Sequential Learning Modules & Activities...`)
  const { data: existingModules } = await authClient
    .from("learning_modules")
    .select("id, sequence_order, title")
    .eq("plan_id", planId)
    .order("sequence_order", { ascending: true })

  const existingModMap = new Map<number, { id: string; title: string }>()
  if (existingModules) {
    existingModules.forEach((m) => existingModMap.set(m.sequence_order, { id: m.id, title: m.title }))
  }

  const moduleIdsForAssessment: { seq: number; id: string; title: string }[] = []

  for (const modDef of SEED_MODULES) {
    let moduleId: string
    const now = new Date()

    let startedAt: string | null = null
    let completedAt: string | null = null

    if (modDef.startedDaysAgo !== undefined) {
      const sDate = new Date(now.getTime() - modDef.startedDaysAgo * 24 * 60 * 60 * 1000)
      startedAt = sDate.toISOString()
    }
    if (modDef.completedDaysAgo !== undefined) {
      const cDate = new Date(now.getTime() - modDef.completedDaysAgo * 24 * 60 * 60 * 1000)
      completedAt = cDate.toISOString()
    }

    if (existingModMap.has(modDef.sequence)) {
      moduleId = existingModMap.get(modDef.sequence)!.id
      // Update module status and timestamps to match desired demo state
      await authClient
        .from("learning_modules")
        .update({
          title: modDef.title,
          description: modDef.description,
          rationale: modDef.rationale,
          status: modDef.status,
          estimated_minutes: modDef.estimatedMinutes,
          started_at: startedAt,
          completed_at: completedAt,
        })
        .eq("id", moduleId)
    } else {
      const { data: newMod, error: modErr } = await authClient
        .from("learning_modules")
        .insert({
          plan_id: planId,
          user_id: userId,
          title: modDef.title,
          description: modDef.description,
          rationale: modDef.rationale,
          sequence_order: modDef.sequence,
          estimated_minutes: modDef.estimatedMinutes,
          status: modDef.status,
          started_at: startedAt,
          completed_at: completedAt,
        })
        .select("id")
        .single()

      if (modErr || !newMod) {
        console.error(`❌ Error creating module ${modDef.sequence}:`, modErr)
        continue
      }
      moduleId = newMod.id
    }

    moduleIdsForAssessment.push({ seq: modDef.sequence, id: moduleId, title: modDef.title })

    // Check existing activities for this module
    const { data: existingActivities } = await authClient
      .from("module_activities")
      .select("id, sequence_order")
      .eq("module_id", moduleId)

    const existingActMap = new Map<number, string>()
    if (existingActivities) {
      existingActivities.forEach((a) => existingActMap.set(a.sequence_order, a.id))
    }

    for (const actDef of modDef.activities) {
      let actCompletedAt: string | null = null
      if (actDef.isCompleted) {
        if (actDef.completedHoursAgo !== undefined) {
          actCompletedAt = new Date(now.getTime() - actDef.completedHoursAgo * 60 * 60 * 1000).toISOString()
        } else {
          actCompletedAt = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
        }
      }

      if (existingActMap.has(actDef.sequence)) {
        const actId = existingActMap.get(actDef.sequence)!
        const { error: actUpErr } = await authClient
          .from("module_activities")
          .update({
            title: actDef.title,
            activity_type: actDef.activityType,
            content_id: actDef.contentId,
            is_completed: actDef.isCompleted,
            completed_at: actCompletedAt,
          })
          .eq("id", actId)
        if (actUpErr) console.error(`Error updating activity "${actDef.title}":`, actUpErr)
      } else {
        const { error: actInsErr } = await authClient.from("module_activities").insert({
          module_id: moduleId,
          user_id: userId,
          title: actDef.title,
          activity_type: actDef.activityType,
          sequence_order: actDef.sequence,
          content_id: actDef.contentId,
          is_completed: actDef.isCompleted,
          completed_at: actCompletedAt,
        })
        if (actInsErr) console.error(`Error inserting activity "${actDef.title}":`, actInsErr)
      }
    }
  }
  console.log("✅ Seeded all 8 Modules and associated Activities")

  // 5. Seed Assessment Results (Idempotently)
  console.log(`\n[5/7] Seeding Completed Assessment Results...`)
  const mod1 = moduleIdsForAssessment.find((m) => m.seq === 1)
  const mod2 = moduleIdsForAssessment.find((m) => m.seq === 2)

  if (mod1) {
    const { data: existingA1 } = await authClient
      .from("assessment_results")
      .select("id")
      .eq("user_id", userId)
      .eq("module_id", mod1.id)
      .maybeSingle()

    if (!existingA1) {
      const { error: a1Err } = await authClient.from("assessment_results").insert({
        user_id: userId,
        module_id: mod1.id,
        assessment_title: "Web Fundamentals Checkpoint",
        assessment_type: "checkpoint",
        score: 90.0,
        passed: true,
        feedback_summary: "Outstanding mastery of HTML5 document semantics, responsive design, and CSS layout algorithms.",
        metadata: {
          total_questions: 10,
          correct_answers: 9,
          module_title: "Web Fundamentals",
          skillBreakdown: {
            "HTML5 Semantics": 95,
            "CSS Box Model": 90,
            "Flexbox Layouts": 85,
            "Responsive Web": 90,
          },
          typeBreakdown: {
            "Conceptual MCQ": 90,
            "Code Output": 90,
            "Debugging": 90,
          },
        },
        attempted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      })
      if (a1Err) console.error("Error inserting Assessment 1:", a1Err)
      else console.log("✅ Seeded Module 1 Assessment Result (90% score)")
    } else {
      console.log("ℹ️ Module 1 Assessment Result already exists")
    }
  }

  if (mod2) {
    const { data: existingA2 } = await authClient
      .from("assessment_results")
      .select("id")
      .eq("user_id", userId)
      .eq("module_id", mod2.id)
      .maybeSingle()

    if (!existingA2) {
      const { error: a2Err } = await authClient.from("assessment_results").insert({
        user_id: userId,
        module_id: mod2.id,
        assessment_title: "JavaScript Foundations Validation",
        assessment_type: "checkpoint",
        score: 80.0,
        passed: true,
        feedback_summary: "Strong comprehension of ES6 syntax, scopes, and closure encapsulation. Keep practicing event bubbling.",
        metadata: {
          total_questions: 10,
          correct_answers: 8,
          module_title: "JavaScript Foundations",
          skillBreakdown: {
            "ES6+ Syntax": 85,
            "Variable Scopes": 80,
            "Closures": 85,
            "DOM Events": 70,
          },
          typeBreakdown: {
            "Conceptual MCQ": 85,
            "Code Output": 80,
            "Debugging": 75,
          },
        },
        attempted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      })
      if (a2Err) console.error("Error inserting Assessment 2:", a2Err)
      else console.log("✅ Seeded Module 2 Assessment Result (80% score)")
    } else {
      console.log("ℹ️ Module 2 Assessment Result already exists")
    }
  }

  // 6. Seed Learning Notes (Idempotently)
  console.log(`\n[6/7] Seeding Personal Learning Notebook Notes...`)

  const SEED_NOTES = [
    {
      title: "JavaScript Closures & Lexical Scope",
      moduleSeq: 2,
      content: `# JavaScript Closures & Lexical Scope

A **closure** is the combination of a function bundled together with references to its surrounding state (the lexical environment). In JavaScript, closures give a function access to its outer function's scope from an inner function.

\`\`\`javascript
function createCounter(initialValue = 0) {
  let count = initialValue; // Private state retained in heap

  return {
    increment: () => ++count,
    decrement: () => --count,
    getValue: () => count,
  };
}

const counter = createCounter(10);
console.log(counter.increment()); // 11
console.log(counter.getValue());   // 11
\`\`\`

### Practical Use Cases:
1. **Data Encapsulation / Private Variables**: Creating true private state before ES2022 private fields (\`#field\`).
2. **Partial Application & Currying**: Pre-configuring arguments for reusable utility functions.
3. **Event Handler Factories**: Passing custom context to asynchronous DOM handlers.

> **Key Rule**: Inner functions retain references to outer scope variables, not value copies. Keep memory lifecycle in mind to avoid retaining detached DOM elements.`,
      tags: ["JavaScript", "Async", "Core Concepts"],
      source_type: "journey",
      source_title: "Variable Scope, Execution Context & Closures",
      is_pinned: true,
    },
    {
      title: "React useEffect Dependency Array & Cleanup",
      moduleSeq: 4,
      content: `# React useEffect Dependency Array & Cleanup

The \`useEffect\` hook synchronizes a React component with an external system (network, DOM subscriptions, browser timers).

\`\`\`tsx
useEffect(() => {
  const abortController = new AbortController();

  async function fetchLearnerData() {
    try {
      const res = await fetch(\`/api/learner/\${userId}\`, {
        signal: abortController.signal,
      });
      const data = await res.json();
      setProfile(data);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Fetch failed:', err);
      }
    }
  }

  fetchLearnerData();

  // Cleanup function runs on unmount & before next execution
  return () => {
    abortController.abort();
  };
}, [userId]);
\`\`\`

### Golden Rules:
- **Exhaustive Dependencies**: Always include all reactive values (\`props\`, \`state\`, derived values) referenced in the effect.
- **Race Condition Prevention**: Always use \`AbortController\` or active booleans for async effects to avoid updating unmounted states.
- **Event Listeners**: Always remove \`window.addEventListener\` in the cleanup return callback.`,
      tags: ["React", "Hooks", "Frontend"],
      source_type: "learning_path",
      source_title: "React Components & State Management",
      is_pinned: false,
    },
    {
      title: "REST API Design Best Practices & Error Handling",
      moduleSeq: 5,
      content: `# REST API Design Best Practices & Error Handling

Standardized guidelines for robust, predictable, production-grade REST APIs.

### 1. HTTP Methods & Resource URIs
- \`GET /api/v1/courses\` — Retrieve collection
- \`POST /api/v1/courses\` — Create resource
- \`GET /api/v1/courses/:id\` — Retrieve single resource
- \`PATCH /api/v1/courses/:id\` — Partial update
- \`DELETE /api/v1/courses/:id\` — Safe deletion

### 2. Standardized Error Response Contract
\`\`\`json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested course ID 817 does not exist.",
    "status": 404,
    "timestamp": "2026-08-10T05:30:00Z"
  }
}
\`\`\`

### 3. Key Status Codes:
- \`200 OK\` / \`201 Created\` / \`204 No Content\`
- \`400 Bad Request\` / \`401 Unauthorized\` / \`403 Forbidden\` / \`404 Not Found\`
- \`409 Conflict\` / \`422 Unprocessable Entity\` / \`429 Rate Limited\`
- \`500 Internal Server Error\``,
      tags: ["Node.js", "APIs", "Backend"],
      source_type: "course",
      source_title: "Backend Servers & RESTful APIs",
      is_pinned: false,
    },
    {
      title: "PostgreSQL Indexing & Query Optimization",
      moduleSeq: 6,
      content: `# PostgreSQL Indexing & Query Optimization

Effective indexing turns slow table scans ($O(N)$) into blazing fast index lookups ($O(\\log N)$).

\`\`\`sql
-- 1. Explain query execution plan
EXPLAIN ANALYZE
SELECT id, title, status 
FROM module_activities 
WHERE user_id = 'a1b2c3d4-0000-0000-0000-000000000000' 
  AND day_number = 3;

-- 2. Create composite B-Tree index on high-cardinality filters
CREATE INDEX idx_module_activities_user_day 
ON public.module_activities(user_id, day_number);

-- 3. GIN index for JSONB or array searches
CREATE INDEX idx_learner_notes_tags 
ON public.learner_notes USING GIN(tags);
\`\`\`

### Index Guidelines:
- **Leftmost Prefix Rule**: In composite indexes \`(a, b)\`, queries filtering by \`a\` or \`(a, b)\` use the index; queries filtering *only* by \`b\` do not.
- **Over-indexing Warning**: Every index accelerates \`SELECT\` queries but adds write overhead to \`INSERT\`, \`UPDATE\`, and \`DELETE\`.`,
      tags: ["Database", "PostgreSQL", "Performance"],
      source_type: "general",
      source_title: "Relational Databases & SQL Fundamentals",
      is_pinned: false,
    },
  ]

  for (const note of SEED_NOTES) {
    const { data: existingNote } = await authClient
      .from("learner_notes" as any)
      .select("id")
      .eq("user_id", userId)
      .eq("topic", note.title)
      .maybeSingle()

    const noteMod = moduleIdsForAssessment.find((m) => m.seq === note.moduleSeq)

    if (!existingNote) {
      const { error: noteInsErr } = await authClient.from("learner_notes" as any).insert({
        user_id: userId,
        module_id: noteMod?.id || null,
        topic: note.title,
        note_content: note.content,
      } as any)
      if (noteInsErr) console.error(`Error inserting note "${note.title}":`, noteInsErr)
      else console.log(`✅ Seeded Note: "${note.title}"`)
    } else {
      console.log(`ℹ️ Note already exists: "${note.title}"`)
    }
  }

  // 7. Seed Semantic Agent Insights
  console.log(`\n[7/7] Seeding Semantic Memory & Agent Insights...`)
  const SEED_INSIGHTS = [
    {
      category: "strength",
      topic: "JavaScript & Architecture",
      content: "Demonstrates strong understanding of lexical scope, closures, and modular architecture.",
      confidence: 0.95,
    },
    {
      category: "preference",
      topic: "Daily Pacing",
      content: "Maintains optimal learning velocity with 45-minute daily focus batches and hands-on exercises.",
      confidence: 0.9,
    },
  ]

  for (const insight of SEED_INSIGHTS) {
    const { data: existingInsight } = await authClient
      .from("agent_insights")
      .select("id")
      .eq("user_id", userId)
      .eq("topic", insight.topic)
      .maybeSingle()

    if (!existingInsight) {
      await authClient.from("agent_insights").insert({
        user_id: userId,
        category: insight.category as any,
        topic: insight.topic,
        content: insight.content,
        confidence: insight.confidence,
        active: true,
      })
      console.log(`✅ Seeded Insight: "${insight.topic}"`)
    }
  }

  console.log("\n==================================================")
  console.log("🎉 Demo Account Seeding Completed Successfully!")
  console.log("==================================================")
  console.log(`👤 Name:       ${DEMO_NAME}`)
  console.log(`📧 Email:      ${DEMO_EMAIL}`)
  console.log(`🔑 Password:   ${DEMO_PASSWORD}`)
  console.log(`🎯 Goal:       ${DEMO_GOAL}`)
  console.log(`⏱️ Daily Time: ${DEMO_DAILY_MINUTES} min/day`)
  console.log("==================================================\n")
}

seedDemo().catch((err) => {
  console.error("❌ Fatal error during demo seeding:", err)
  process.exit(1)
})
