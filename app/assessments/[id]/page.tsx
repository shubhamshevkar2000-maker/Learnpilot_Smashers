"use client"

import { useState, useEffect, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import type { StaticAssessment } from "@/types/assessment"
import type { Database } from "@/types/database.types"
import { createClient } from "@/lib/supabase/client"
import { getOrCreateActiveCurriculum } from "@/lib/services/curriculum-service"
import { generateAssessmentForModule } from "@/lib/generator/assessment-generator"

type LearnerProfile = Database["public"]["Tables"]["learner_profiles"]["Row"]

export default function AssessmentTakingPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ProtectedRoute>
      <AssessmentTakingContent params={params} />
    </ProtectedRoute>
  )
}

function AssessmentTakingContent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user, isConfigured } = useAuth()
  const supabase = createClient()
  const resolvedParams = use(params)
  
  const [assessment, setAssessment] = useState<StaticAssessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadAssessment = useCallback(async () => {
    if (!user || !isConfigured) return

    try {
      const { data: profData } = await supabase
        .from("learner_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (!profData) throw new Error("Profile not found")

      const curriculum = await getOrCreateActiveCurriculum(supabase, user.id)
      
      if (curriculum && curriculum.modules) {
        // Find the specific module matching the route ID
        const targetModule = curriculum.modules.find(m => m.id === resolvedParams.id)
        if (targetModule) {
          const generated = generateAssessmentForModule(targetModule, profData as LearnerProfile)
          setAssessment(generated)
        }
      }
    } catch (err) {
      console.error("Error loading assessment module:", err)
    } finally {
      setLoading(false)
    }
  }, [user, isConfigured, resolvedParams.id, supabase])

  useEffect(() => {
    loadAssessment()
  }, [loadAssessment])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      </div>
    )
  }

  if (!assessment || assessment.questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">Assessment not found or no questions available for this module.</p>
          <Link href="/assessments" className="text-primary text-xs underline">Back to Assessments</Link>
        </div>
      </div>
    )
  }

  const currentQuestion = assessment.questions[currentQuestionIndex]
  const isFirstQuestion = currentQuestionIndex === 0
  const isLastQuestion = currentQuestionIndex === assessment.questions.length - 1

  const handleSelectOption = (optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }))
  }

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) return
    setSubmitting(true)
    setErrorMessage(null)

    // Calculate score & skill breakdown
    let correctCount = 0
    const totalQuestions = assessment.questions.length
    
    const topicTotal: Record<string, number> = {}
    const topicCorrect: Record<string, number> = {}

    assessment.questions.forEach(q => {
      if (!topicTotal[q.topic]) {
        topicTotal[q.topic] = 0
        topicCorrect[q.topic] = 0
      }
      topicTotal[q.topic]++

      if (answers[q.id] === q.correct_answer_id) {
        correctCount++
        topicCorrect[q.topic]++
      }
    })

    const score = (correctCount / totalQuestions) * 100
    const passed = score >= assessment.passingScore

    const skillBreakdown: Record<string, number> = {}
    for (const topic in topicTotal) {
      skillBreakdown[topic] = Math.round((topicCorrect[topic] / topicTotal[topic]) * 100)
    }

    try {
      const { error } = await supabase
        .from('assessment_results')
        .insert({
          user_id: user.id,
          module_id: assessment.id, // Store foreign key to the module!
          assessment_title: assessment.id, // Keeping this for backward compatibility in history query
          assessment_type: 'checkpoint', 
          score,
          passed,
          metadata: {
            module_title: assessment.title,
            total_questions: totalQuestions,
            correct_answers: correctCount,
            incorrect_answers: totalQuestions - correctCount,
            answers: answers,
            assessmentId: assessment.id,
            role: assessment.roleTarget?.join(', ') || 'General',
            level: assessment.level,
            skillBreakdown: skillBreakdown
          }
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/assessments/${assessment.id}/result`)
    } catch (err) {
      console.error("Failed to submit assessment:", err)
      setErrorMessage("Failed to submit assessment. Please try again.")
      setSubmitting(false)
    }
  }

  const progressPercentage = ((currentQuestionIndex + 1) / assessment.questions.length) * 100
  const hasAnsweredCurrent = !!answers[currentQuestion.id]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-md sticky top-0 z-10 px-4 py-4 sm:px-8 flex items-center justify-between">
        <Link 
          href="/assessments"
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Exit Assessment</span>
        </Link>
        <div className="text-[11px] font-semibold tracking-[0.25em] text-foreground uppercase truncate px-4 max-w-[50vw]">
          {assessment.title}
        </div>
        <div className="w-[100px]" />
      </header>

      <main className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6">
        <div className="w-full max-w-2xl space-y-8">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {assessment.questions.length}</span>
              <span>{Math.round(progressPercentage)}% Completed</span>
            </div>
            <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
              <AlertCircle size={14} />
              {errorMessage}
            </div>
          )}

          <div className="rounded-2xl border border-border/40 bg-card p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-semibold tracking-widest text-primary uppercase bg-primary/10 px-2 py-1 rounded-full">
                {currentQuestion.topic}
              </span>
              <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                {currentQuestion.difficulty}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-foreground mb-8">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.id
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full flex items-center gap-4 text-left p-4 rounded-xl border transition-all duration-200 ${
                      isSelected 
                        ? "border-primary bg-primary/10" 
                        : "border-border/60 hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <div className={`flex shrink-0 h-5 w-5 items-center justify-center rounded-full border ${
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                    }`}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                    </div>
                    <span className={`text-sm sm:text-base ${isSelected ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {option.text}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={handlePrev}
              disabled={isFirstQuestion}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || !hasAnsweredCurrent}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Validation</span>
                    <CheckCircle size={16} />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!hasAnsweredCurrent}
                className="flex items-center gap-2 rounded-lg bg-foreground px-6 py-2.5 text-sm font-medium text-background shadow-sm transition-opacity hover:opacity-90 disabled:opacity-30"
              >
                <span>Next Question</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
