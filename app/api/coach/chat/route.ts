import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Groq from "groq-sdk"
import { retrieveRAGContext } from "@/lib/rag/retriever"

export async function POST(request: NextRequest) {
  try {
    // 1. Server-side Groq API Key check
    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey || groqApiKey.trim() === "" || groqApiKey.includes("your-groq-key")) {
      return NextResponse.json(
        { error: "Groq API key is not configured." },
        { status: 500 }
      )
    }

    // 2. Strict Supabase session authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to access the AI Coach." },
        { status: 401 }
      )
    }

    // 3. Parse and validate message payload
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request format." },
        { status: 400 }
      )
    }

    const { messages } = body
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Message content cannot be empty." },
        { status: 400 }
      )
    }

    const lastMsg = messages[messages.length - 1]
    if (!lastMsg || typeof lastMsg.content !== "string" || !lastMsg.content.trim()) {
      return NextResponse.json(
        { error: "Message content cannot be empty." },
        { status: 400 }
      )
    }

    // 4. Retrieve authenticated learner's profile strictly by auth.uid()
    const { data: profile, error: profileError } = await supabase
      .from("learner_profiles")
      .select("display_name, learning_goal, desired_outcome, current_level, available_daily_minutes, target_date")
      .eq("user_id", user.id)
      .maybeSingle()

    if (profileError) {
      return NextResponse.json(
        { error: "Unable to retrieve learner profile. Please try again." },
        { status: 500 }
      )
    }

    if (!profile) {
      return NextResponse.json(
        { error: "Learner profile not found. Please complete onboarding first." },
        { status: 404 }
      )
    }

    // 5. Construct deeply personalized system context with RAG Grounding
    const displayName = (profile.display_name || "Learner").trim().slice(0, 100)
    const learningGoal = (profile.learning_goal || "General Skill Mastery").trim().slice(0, 300)
    const desiredOutcome = (profile.desired_outcome || "Achieve proficiency").trim().slice(0, 300)
    const currentLevel = (profile.current_level || "unknown").toLowerCase()
    const dailyMinutes = profile.available_daily_minutes ? Math.min(Math.max(profile.available_daily_minutes, 5), 480) : 30
    const targetDate = profile.target_date ? String(profile.target_date).slice(0, 20) : "Not set"

    // Retrieve real RAG Grounding Context (Supabase Active Plan + Course Catalog)
    const { fullRAGContext } = await retrieveRAGContext({
      supabase,
      userId: user.id,
      userQuery: String(lastMsg.content),
      learningGoal,
    })

    // Depth & Pacing guidance based on current_level and available_daily_minutes
    let depthGuidance = ""
    if (currentLevel === "beginner" || currentLevel === "basics") {
      depthGuidance = "Use clear, plain language with simple step-by-step analogies. Avoid obscure jargon unless explained immediately."
    } else if (currentLevel === "intermediate") {
      depthGuidance = "Provide practical, technical explanations with real-world context and best practices. Balance theory with hands-on application."
    } else if (currentLevel === "advanced") {
      depthGuidance = "Deliver concise, high-level, architecture-focused or advanced technical insights. Dive directly into nuance and optimization."
    } else {
      depthGuidance = "Adapt explanation depth dynamically based on the complexity of the learner's query."
    }

    let pacingGuidance = ""
    if (dailyMinutes <= 20) {
      pacingGuidance = `The learner has only ${dailyMinutes} minutes/day. Keep study recommendations focused on single, micro-learning topics.`
    } else if (dailyMinutes <= 45) {
      pacingGuidance = `The learner has ${dailyMinutes} minutes/day. Recommend structured 30-40 minute focused study blocks.`
    } else {
      pacingGuidance = `The learner has ${dailyMinutes} minutes/day available. Suggest deeper hands-on practice or mini-projects.`
    }

    const systemPrompt = `You are the LearnPilot AI Coach, an expert, personalized, and practical AI learning guide.

AUTHENTICATED LEARNER CONTEXT:
- Name: ${displayName}
- Primary Goal: ${learningGoal}
- Desired Outcome: ${desiredOutcome}
- Current Level: ${currentLevel}
- Available Daily Time: ${dailyMinutes} minutes/day
- Target Goal Date: ${targetDate}

REAL RETRIEVED KNOWLEDGE BASE (RAG):
${fullRAGContext}

PERSONALIZED COACHING DIRECTIVES:
1. ADAPTATION: ${depthGuidance}
2. TIME CONSTRAINT: ${pacingGuidance} Never recommend study routines or schedules exceeding ${dailyMinutes} minutes per day.
3. GOAL ORIENTATION: Relate concepts and advice directly to their primary goal ("${learningGoal}") and desired outcome ("${desiredOutcome}").
4. BEHAVIOR: Be supportive, structured, direct, and actionable. Avoid generic fluff or repetitive boilerplate disclaimers.
5. AMBIGUITY: If a learner's query is broad, give a clear initial answer and ask 1 focused follow-up question.
6. GROUND TRUTH: Do NOT invent completed lessons, test scores, or progress percentages. Only reference facts provided in this prompt.
7. Addressing: Address ${displayName} directly as their personal AI coach.
8. GROUNDING: Ground your advice in the learner's active curriculum and real course materials provided above whenever relevant.`

    // 6. Format recent message history (prevent context overflow)
    const formattedHistory = messages.slice(-8).map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: String(m.content).trim().slice(0, 2000),
    }))

    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...formattedHistory,
    ]

    // 7. Call Groq API via Server SDK
    const groq = new Groq({ apiKey: groqApiKey })
    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"

    const completion = await groq.chat.completions.create({
      messages: groqMessages,
      model: model,
      temperature: 0.7,
      max_tokens: 1024,
    })

    const aiAnswer = completion.choices[0]?.message?.content

    if (!aiAnswer) {
      return NextResponse.json(
        { error: "AI Coach was unable to generate a response. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({ response: aiAnswer })
  } catch (error: any) {
    console.error("AI Coach Phase 2 API error:", error?.message || error)

    if (error?.status === 429 || error?.message?.includes("rate limit")) {
      return NextResponse.json(
        { error: "The AI Coach is receiving high traffic right now. Please wait a moment and try again." },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: "An unexpected error occurred while communicating with the AI Coach." },
      { status: 500 }
    )
  }
}
