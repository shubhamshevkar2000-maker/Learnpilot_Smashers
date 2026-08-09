"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { MagneticButton } from "@/components/magnetic-button"

export default function SignupPage() {
  const router = useRouter()
  const { user, loading: authLoading, isConfigured, signUp } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/onboarding")
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.")
      return
    }

    if (!email.trim()) {
      setErrorMessage("Please enter a valid email address.")
      return
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.")
      return
    }

    if (!isConfigured) {
      setErrorMessage(
        "Supabase credentials are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable live account creation.",
      )
      return
    }

    setLoading(true)

    try {
      const { error, user: createdUser } = await signUp(name.trim(), email.trim(), password)

      if (error) {
        if (error.message.includes("User already registered")) {
          setErrorMessage("An account with this email already exists. Please log in instead.")
        } else if (error.message.includes("Password should be")) {
          setErrorMessage("Password should be at least 6 characters.")
        } else {
          setErrorMessage(error.message || "Failed to create account. Please try again.")
        }
      } else if (createdUser) {
        if (createdUser.identities && createdUser.identities.length === 0) {
          setErrorMessage("An account with this email already exists. Please log in instead.")
        } else {
          setSuccessMessage(
            "Account successfully created! Redirecting to your learning workspace...",
          )
          setTimeout(() => {
            router.push("/onboarding")
          }, 1200)
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "A network error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-background px-4 py-6 text-foreground transition-colors duration-300 sm:px-6 md:px-12 md:py-8">
      {/* Top Bar */}
      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-foreground transition-opacity hover:opacity-80 min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          <span>LEARNPILOT</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="mx-auto my-auto w-full max-w-md py-6 sm:py-10">
        <div className="mb-6 sm:mb-8 text-left">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] sm:tracking-[0.3em] text-primary backdrop-blur-sm">
            <Sparkles size={12} />
            <span>Create Account</span>
          </div>
          <h1 className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Let&apos;s build your
            <br />
            <span className="italic text-primary">learning journey.</span>
          </h1>
          <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground">
            Experience an AI companion that maps and adapts around your goals.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5 sm:p-4 text-xs text-destructive">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-3.5 sm:p-4 text-xs text-foreground">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
            <p className="leading-relaxed">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-foreground/80"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Morgan"
              className="w-full rounded-xl border border-border bg-card/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
            />
          </div>

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
              className="w-full rounded-xl border border-border bg-card/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-foreground/80"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-border bg-card/80 px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground transition-colors hover:text-foreground min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <MagneticButton
              type="submit"
              disabled={loading}
              className="w-full justify-center py-3.5 text-sm min-h-[44px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Create account</span>
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </MagneticButton>
          </div>
        </form>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline p-1"
          >
            Log in
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto flex w-full max-w-[1200px] flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 text-[11px] text-muted-foreground pt-4">
        <span>© {new Date().getFullYear()} LearnPilot</span>
        <div className="flex items-center gap-6">
          <span className="hover:text-foreground cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Terms</span>
        </div>
      </footer>
    </div>
  )
}
