import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Groq from "groq-sdk"

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Groq API Key on server side
    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey || groqApiKey.trim() === "" || groqApiKey.includes("your-groq-key")) {
      return NextResponse.json(
        { error: "Groq API key is not configured." },
        { status: 500 }
      )
    }

    // 2. Authenticate user from Supabase session
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

    // 3. Parse request payload
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request payload." },
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

    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || !lastMessage.content || typeof lastMessage.content !== "string" || !lastMessage.content.trim()) {
      return NextResponse.json(
        { error: "Message content cannot be empty." },
        { status: 400 }
      )
    }

    // 4. Retrieve real learner profile context
    const { data: profile, error: profileError } = await supabase
      .from("learner_profiles")
      .select("display_name, learning_goal, desired_outcome, current_level, available_daily_minutes, target_date")
      .eq("user_id", user.id)
      .maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Learner profile not found. Please complete onboarding first." },
        { status: 404 }
      )
    }

    // 5. Construct System Prompt using real profile details
    const displayName = profile.display_name || "Learner"
    const learningGoal = profile.learning_goal || "Mastering target skill"
    const desiredOutcome = profile.desired_outcome || "Achieving mastery"
    const currentLevel = profile.current_level || "unknown"
    const dailyMinutes = profile.available_daily_minutes ? `${profile.available_daily_minutes} minutes/day` : "Not specified"
    const targetDate = profile.target_date || "Not set"

    const systemPrompt = `You are the LearnPilot AI Coach, an expert, engaging, and practical learning guide.

LEARNER PROFILE CONTEXT (REAL DATA):
- Name: ${displayName}
- Primary Learning Goal: ${learningGoal}
- Desired Outcome: ${desiredOutcome}
- Current Level: ${currentLevel}
- Daily Study Time Constraint: ${dailyMinutes}
- Target Goal Date: ${targetDate}

COACHING DIRECTIVES & BEHAVIOR:
1. Tailor all explanations, study strategies, and responses to the learner's current level (${currentLevel}) and goal (${learningGoal}).
2. When suggesting study tasks or exercises, strictly respect their daily time constraint of ${dailyMinutes}.
3. Keep answers clear, well-structured, practical, and direct. Avoid unnecessary generic fluff.
4. If the learner's query is broad or ambiguous, give a concise helpful explanation and ask a focused follow-up question.
5. GROUND TRUTH RULE: Do NOT invent completed lessons, assessment scores, or progress percentages that are not provided in the prompt context. Only reference information explicitly known.
6. Address ${displayName} directly as their supportive personal AI learning coach.`

    // 6. Format conversation history for Groq SDK
    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: String(m.content).trim(),
      })),
    ]

    // 7. Invoke Groq API
    const groq = new Groq({ apiKey: groqApiKey })
    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"

    const completion = await groq.chat.completions.create({
      messages: groqMessages,
      model: model,
      temperature: 0.7,
      max_tokens: 1024,
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      return NextResponse.json(
        { error: "AI Coach was unable to generate a response. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({ response: aiResponse })
  } catch (error: any) {
    console.error("AI Coach API error:", error?.message || error)

    if (error?.status === 429 || error?.message?.includes("rate limit")) {
      return NextResponse.json(
        { error: "The AI Coach is experiencing high traffic right now. Please wait a moment and try again." },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: "An unexpected error occurred while communicating with the AI Coach." },
      { status: 500 }
    )
  }
}
