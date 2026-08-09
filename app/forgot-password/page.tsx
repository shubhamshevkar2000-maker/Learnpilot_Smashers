"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Sparkles, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { MagneticButton } from "@/components/magnetic-button"

export default function ForgotPasswordPage() {
  const { isConfigured, resetPassword } = useAuth()

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!email.trim()) {
      setErrorMessage("Please enter your registered email address.")
      return
    }

    if (!isConfigured) {
      setErrorMessage(
        "Supabase credentials are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
      )
      return
    }

    setLoading(true)

    try {
      const { error } = await resetPassword(email.trim())

      if (error) {
        setErrorMessage(error.message || "Failed to send password reset instructions. Please try again.")
      } else {
        setSuccessMessage(
          `Password reset link has been dispatched. If an account exists for ${email.trim()}, you will receive instructions shortly.`,
        )
      }
    } catch (err: any) {
      setErrorMessage(err.message || "A network error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-background px-6 py-8 text-foreground transition-colors duration-300 md:px-12">
      {/* Top Bar */}
      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between">
        <Link
          href="/login"
          className="group flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-foreground transition-opacity hover:opacity-80"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          LEARNPILOT
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="mx-auto my-auto w-full max-w-md py-10">
        <div className="mb-8 text-left">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.3em] text-primary backdrop-blur-sm">
            <Sparkles size={12} />
            <span>Account Recovery</span>
          </div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl">
            Reset your
            <br />
            <span className="italic text-primary">password.</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Enter your email to receive recovery instructions.
          </p>
        </div>


        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs text-destructive">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-xs text-foreground">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
            <p className="leading-relaxed">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-foreground/80"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full rounded-xl border border-border bg-card/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="pt-2">
            <MagneticButton
              type="submit"
              disabled={loading}
              className="w-full justify-center py-3.5 text-sm"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  <span>Sending reset link...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Send reset link</span>
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </MagneticButton>
          </div>
        </form>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Back to login
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto flex w-full max-w-[1200px] items-center justify-between text-[11px] text-muted-foreground">
        <span>© {new Date().getFullYear()} LearnPilot</span>
        <div className="flex items-center gap-6">
          <Link href="/login" className="hover:text-foreground transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="hover:text-foreground transition-colors">
            Sign up
          </Link>
        </div>
      </footer>
    </div>
  )
}
