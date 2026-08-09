"use client"

import { useState, useEffect, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  BarChart2
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { createClient } from "@/lib/supabase/client"

export default function AssessmentResultPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ProtectedRoute>
      <AssessmentResultContent params={params} />
    </ProtectedRoute>
  )
}

function AssessmentResultContent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const resolvedParams = use(params)
  
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadResult = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', resolvedParams.id) // Query by module_id
        .order('attempted_at', { ascending: false })
        .limit(1)
        .single()

      // Fallback to checking assessment_title just in case for older records
      if (error && error.code === 'PGRST116') {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('assessment_results')
          .select('*')
          .eq('user_id', user.id)
          .eq('assessment_title', resolvedParams.id)
          .order('attempted_at', { ascending: false })
          .limit(1)
          .single()

        if (!fallbackError && fallbackData) {
          setResult(fallbackData)
        }
      } else if (!error && data) {
        setResult(data)
      }
    } catch (err) {
      console.error("Failed to load result:", err)
    } finally {
      setLoading(false)
    }
  }, [user, resolvedParams.id, supabase])

  useEffect(() => {
    loadResult()
  }, [loadResult])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">Result not found or assessment invalid.</p>
          <Link href="/assessments" className="text-primary text-xs underline">Return to Assessments</Link>
        </div>
      </div>
    )
  }

  const { score, passed, metadata } = result
  
  // Extract data from metadata or fallback
  const assessmentTitle = metadata?.module_title || metadata?.assessmentId || result.assessment_title || "Validation Complete"
  const totalQuestions = metadata?.total_questions || 0
  const correctAnswers = metadata?.correct_answers || 0
  const incorrectAnswers = metadata?.incorrect_answers || 0
  const skillBreakdown = metadata?.skillBreakdown || {}

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="text-center space-y-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Validation Result
          </span>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground md:text-4xl px-4 line-clamp-2">
            {assessmentTitle}
          </h1>
        </div>

        <div className="rounded-2xl border border-border/40 bg-card p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
          <div 
            className={`absolute inset-0 opacity-10 ${passed ? 'bg-primary' : 'bg-destructive'}`} 
            style={{ filter: 'blur(100px)' }}
          />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="space-y-1">
              <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Your Score
              </div>
              <div className={`text-6xl font-serif tracking-tighter ${passed ? 'text-primary' : 'text-destructive'}`}>
                {Math.round(score)}<span className="text-4xl text-muted-foreground">%</span>
              </div>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              passed ? 'border-primary/30 bg-primary/10 text-primary' : 'border-destructive/30 bg-destructive/10 text-destructive'
            }`}>
              {passed ? <CheckCircle size={14} /> : <XCircle size={14} />}
              <span>{passed ? 'Passed' : 'Needs Review'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border/40 bg-card p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Correct</span>
            </div>
            <div className="text-2xl font-serif">{correctAnswers} <span className="text-sm font-sans text-muted-foreground">/ {totalQuestions}</span></div>
          </div>
          
          <div className="rounded-xl border border-border/40 bg-card p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Incorrect</span>
            </div>
            <div className="text-2xl font-serif">{incorrectAnswers} <span className="text-sm font-sans text-muted-foreground">/ {totalQuestions}</span></div>
          </div>
        </div>

        {Object.keys(skillBreakdown).length > 0 && (
          <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-foreground">
              <BarChart2 size={16} />
              <h3 className="text-sm font-semibold">Skill Breakdown</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(skillBreakdown).map(([topic, perc]) => (
                <div key={topic} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-muted-foreground">{topic}</span>
                    <span className="font-semibold text-foreground">{perc as number}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
                    <div 
                      className={`h-full transition-all duration-300 ease-out ${(perc as number) >= 70 ? 'bg-primary' : 'bg-destructive'}`} 
                      style={{ width: `${perc}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-border/40 bg-muted/30 p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground mb-1">
            <TrendingUp size={16} />
            <h3 className="text-sm font-semibold">Performance Summary</h3>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {passed 
              ? `Great job! You demonstrated a solid understanding of this module's concepts. Your results have been securely saved and will inform your future learning path.`
              : `You've identified some knowledge gaps in this module. Review the foundational concepts and try again when you're ready.`}
          </p>
        </div>

        <div className="pt-4 flex justify-center">
          <Link 
            href="/assessments"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-8 py-3 text-sm font-medium text-background shadow-sm transition-opacity hover:opacity-90"
          >
            <span>Return to Validation List</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
