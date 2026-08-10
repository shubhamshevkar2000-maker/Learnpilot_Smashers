"use client"

import { useState, useEffect, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  PlayCircle
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
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Code write specific state
  const [codeExecuting, setCodeExecuting] = useState(false)
  const [testResults, setTestResults] = useState<any[] | null>(null)

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
    if (currentQuestion.questionType === "multiple_select") {
      setAnswers(prev => {
        const currentArr = (prev[currentQuestion.id] || []) as string[]
        if (currentArr.includes(optionId)) {
          return { ...prev, [currentQuestion.id]: currentArr.filter(id => id !== optionId) }
        } else {
          return { ...prev, [currentQuestion.id]: [...currentArr, optionId] }
        }
      })
    } else {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }))
    }
  }

  const handleShortAnswerChange = (val: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }))
  }

  const handleSelfReviewCheck = (idx: number) => {
    setAnswers(prev => {
      const currentChecks = (prev[`${currentQuestion.id}_checks`] || []) as number[]
      if (currentChecks.includes(idx)) {
        return { ...prev, [`${currentQuestion.id}_checks`]: currentChecks.filter(i => i !== idx) }
      } else {
        return { ...prev, [`${currentQuestion.id}_checks`]: [...currentChecks, idx] }
      }
    })
  }

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1)
      setTestResults(null)
    }
  }

  const handleCodeChange = (val: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }))
    setTestResults(null)
  }

  const executeCode = () => {
    if (!currentQuestion.testCases) return
    setCodeExecuting(true)
    setTestResults(null)
    
    const code = answers[currentQuestion.id] || currentQuestion.starterCode || ""
    
    // Create an iframe to safely execute code
    const iframe = document.createElement("iframe")
    iframe.style.display = "none"
    document.body.appendChild(iframe)
    
    const results: any[] = []
    
    try {
      const win = iframe.contentWindow as any
      
      // Setup simple React mock in the iframe
      win._state = undefined
      win.React = {
        useState: function(init: any) {
          if (win._state === undefined) win._state = init
          return [
            win._state, 
            function(newVal: any) { win._state = typeof newVal === 'function' ? newVal(win._state) : newVal }
          ]
        }
      }
      win.useState = win.React.useState
      
      // Clean up imports and exports
      let executableCode = code.replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
      executableCode = executableCode.replace(/export\s+/g, '')
      
      currentQuestion.testCases.forEach((tc) => {
        try {
          win._state = undefined // reset state between tests
          const runFn = new win.Function('useState', 'React', `
            ${executableCode}
            
            ${tc.input.includes('return') ? tc.input : `return ${tc.input};`}
          `)
          
          const result = runFn(win.useState, win.React)
          const cleanOutput = String(result).replace(/^['"]|['"]$/g, '').trim()
          const cleanExpected = String(tc.expected).replace(/^['"]|['"]$/g, '').trim()
          const isPassed = String(result) === tc.expected || cleanOutput === cleanExpected || JSON.stringify(result) === tc.expected
          results.push({
            input: tc.input,
            expected: tc.expected,
            output: typeof result === 'object' ? JSON.stringify(result) : String(result),
            passed: isPassed
          })
        } catch (err: any) {
          results.push({
            input: tc.input,
            expected: tc.expected,
            output: err.message || "Error",
            passed: false
          })
        }
      })
      
      setTestResults(results)
      
      const allPassed = results.every(r => r.passed)
      if (allPassed) {
         setAnswers(prev => ({ ...prev, [`${currentQuestion.id}_passed`]: true }))
      } else {
         setAnswers(prev => ({ ...prev, [`${currentQuestion.id}_passed`]: false }))
      }
      
    } catch (e: any) {
      console.error(e)
    } finally {
      document.body.removeChild(iframe)
      setCodeExecuting(false)
    }
  }

  const handleSubmit = async () => {
    if (!user) return
    setSubmitting(true)
    setErrorMessage(null)

    // Calculate score & skill breakdown
    let objectiveCorrectCount = 0
    let objectiveTotal = 0
    let selfReviewCount = 0
    
    const topicTotal: Record<string, number> = {}
    const topicCorrect: Record<string, number> = {}
    const typeTotal: Record<string, number> = {}
    const typeCorrect: Record<string, number> = {}

    assessment.questions.forEach(q => {
      if (q.questionType === "short_answer") {
        selfReviewCount++
        return // skip objective scoring
      }

      objectiveTotal++
      if (!topicTotal[q.topic]) {
        topicTotal[q.topic] = 0
        topicCorrect[q.topic] = 0
      }
      if (!typeTotal[q.questionType]) {
        typeTotal[q.questionType] = 0
        typeCorrect[q.questionType] = 0
      }
      
      topicTotal[q.topic]++
      typeTotal[q.questionType]++

      let isCorrect = false
      if (q.questionType === "multiple_select") {
        const userAns = (answers[q.id] || []) as string[]
        const expected = q.multiple_correct_ids || []
        isCorrect = userAns.length === expected.length && userAns.every(ans => expected.includes(ans))
      } else if (q.questionType === "code_write") {
        isCorrect = !!answers[`${q.id}_passed`]
      } else {
        isCorrect = answers[q.id] === q.correct_answer_id
      }

      if (isCorrect) {
        objectiveCorrectCount++
        topicCorrect[q.topic]++
        typeCorrect[q.questionType]++
      }
    })

    const score = objectiveTotal > 0 ? (objectiveCorrectCount / objectiveTotal) * 100 : 100
    const passed = score >= assessment.passingScore

    const skillBreakdown: Record<string, number> = {}
    for (const topic in topicTotal) {
      skillBreakdown[topic] = Math.round((topicCorrect[topic] / topicTotal[topic]) * 100)
    }

    const typeBreakdown: Record<string, number> = {}
    for (const type in typeTotal) {
      typeBreakdown[type] = Math.round((typeCorrect[type] / typeTotal[type]) * 100)
    }

    try {
      const { error } = await supabase
        .from('assessment_results')
        .insert({
          user_id: user.id,
          module_id: assessment.id,
          assessment_title: assessment.title, 
          assessment_type: 'checkpoint', 
          score,
          passed,
          metadata: {
            module_title: assessment.title,
            total_questions: objectiveTotal,
            correct_answers: objectiveCorrectCount,
            incorrect_answers: objectiveTotal - objectiveCorrectCount,
            self_review_count: selfReviewCount,
            answers: answers,
            assessmentId: assessment.id,
            level: assessment.level,
            skillBreakdown: skillBreakdown,
            typeBreakdown: typeBreakdown
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
  
  const hasAnsweredCurrent = (() => {
    if (currentQuestion.questionType === "short_answer") {
      const text = answers[currentQuestion.id]
      const checks = answers[`${currentQuestion.id}_checks`] || []
      const hasText = (text?.trim().length || 0) > 0
      const hasChecks = !currentQuestion.selfReviewCriteria || currentQuestion.selfReviewCriteria.length === 0 || checks.length > 0
      return hasText && hasChecks
    }
    if (currentQuestion.questionType === "code_write") {
      return answers[`${currentQuestion.id}_passed`] !== undefined
    }
    if (currentQuestion.questionType === "multiple_select") {
      return (answers[currentQuestion.id] || []).length > 0
    }
    return !!answers[currentQuestion.id]
  })()

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
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold tracking-widest text-foreground uppercase bg-muted px-2 py-1 rounded-full">
                  {currentQuestion.questionType.replace("_", " ")}
                </span>
                <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  {currentQuestion.difficulty}
                </span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-foreground mb-6">
              {currentQuestion.question}
            </h2>

            {currentQuestion.codeSnippet && (
              <div className="relative rounded-xl overflow-hidden border border-border/40 bg-slate-950 p-4 mb-6">
                <pre className="font-mono text-xs md:text-sm overflow-x-auto text-emerald-400 leading-relaxed">
                  {currentQuestion.codeSnippet}
                </pre>
              </div>
            )}

            {currentQuestion.questionType === "short_answer" ? (
              <div className="space-y-6">
                <textarea
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleShortAnswerChange(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full min-h-[150px] p-4 rounded-xl border border-border/60 bg-muted/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-sm"
                />
                
                {(answers[currentQuestion.id] || "").trim().length > 0 && currentQuestion.selfReviewCriteria && (
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
                    <h3 className="text-sm font-semibold text-amber-600">Self Review Checklist</h3>
                    <p className="text-xs text-muted-foreground">Does your answer include the following?</p>
                    <div className="space-y-2">
                      {currentQuestion.selfReviewCriteria.map((criterion, idx) => {
                        const isChecked = (answers[`${currentQuestion.id}_checks`] || []).includes(idx)
                        return (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => handleSelfReviewCheck(idx)}
                            className="w-full flex items-start gap-3 cursor-pointer group text-left transition-colors"
                          >
                            <div className={`mt-0.5 shrink-0 h-4 w-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-amber-500 border-amber-500' : 'border-border/60 group-hover:border-amber-400'}`}>
                              {isChecked && <CheckCircle size={12} className="text-white" />}
                            </div>
                            <span className={`text-sm ${isChecked ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{criterion}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : currentQuestion.questionType === "code_write" ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-border/40 bg-slate-950 overflow-hidden flex flex-col min-h-[300px]">
                  <div className="bg-slate-900 border-b border-white/10 px-4 py-2 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">main.{currentQuestion.language === "javascript" ? "js" : "ts"}</span>
                  </div>
                  <textarea
                    value={answers[currentQuestion.id] ?? currentQuestion.starterCode ?? ""}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className="flex-1 w-full p-4 bg-transparent font-mono text-xs sm:text-sm text-emerald-400 focus:outline-none resize-none leading-relaxed"
                    spellCheck={false}
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={executeCode}
                    disabled={codeExecuting}
                    className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {codeExecuting ? (
                       <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : <PlayCircle size={14} />}
                    <span>Run Tests</span>
                  </button>
                </div>
                
                {testResults && (
                  <div className="space-y-3 p-4 rounded-xl border border-border/40 bg-muted/20">
                    <h3 className="text-xs font-semibold text-foreground">Test Results</h3>
                    <div className="space-y-2">
                      {testResults.map((tr, i) => (
                        <div key={i} className={`text-xs p-3 rounded-lg border ${tr.passed ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-destructive/30 bg-destructive/10'}`}>
                           <div className="flex items-center gap-2 mb-2">
                             {tr.passed ? <CheckCircle size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-destructive" />}
                             <span className={`font-medium ${tr.passed ? 'text-emerald-500' : 'text-destructive'}`}>Test Case {i + 1}</span>
                           </div>
                           <div className="space-y-1 font-mono text-[10px] text-muted-foreground">
                             <p>Input: {tr.input}</p>
                             <p>Expected: {tr.expected}</p>
                             <p>Output: {tr.output}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => {
                  let isSelected = false
                  if (currentQuestion.questionType === "multiple_select") {
                    isSelected = (answers[currentQuestion.id] || []).includes(option.id)
                  } else {
                    isSelected = answers[currentQuestion.id] === option.id
                  }
                  
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
                      <div className={`flex shrink-0 h-5 w-5 items-center justify-center border ${
                        currentQuestion.questionType === "multiple_select" ? "rounded-md" : "rounded-full"
                      } ${
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
            )}
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
