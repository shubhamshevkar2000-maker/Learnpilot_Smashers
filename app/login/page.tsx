"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, ArrowLeft, Rocket } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { MagneticButton } from "@/components/magnetic-button"

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect") || "/onboarding"

  const { user, loading: authLoading, isConfigured, signIn } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirectUrl === "/onboarding" ? "/dashboard" : redirectUrl)
    }
  }, [user, authLoading, router, redirectUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setInfoMessage(null)

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email address and password.")
      return
    }

    if (!isConfigured) {
      setErrorMessage(
        "Supabase credentials are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to enable live authentication.",
      )
      return
    }

    setLoading(true)

    try {
      const { error } = await signIn(email.trim(), password)

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMessage("Invalid email or password. Please check your credentials and try again.")
        } else if (error.message.includes("Email not confirmed")) {
          setErrorMessage("Please check your email and confirm your account before signing in.")
        } else {
          setErrorMessage(error.message || "An error occurred while signing in. Please try again.")
        }
      } else {
        router.push(redirectUrl === "/onboarding" ? "/dashboard" : redirectUrl)
      }
    } catch (err: any) {
      setErrorMessage(err.message || "A network error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setErrorMessage(null)
    setInfoMessage(null)

    if (!isConfigured) {
      setErrorMessage(
        "Supabase credentials are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
      )
      return
    }

    setDemoLoading(true)

    try {
      const { error } = await signIn("demo@learnpilot.app", "LearnPilot@Demo2026!")

      if (error) {
        setErrorMessage(
          error.message.includes("Invalid login credentials")
            ? "Demo account is not seeded yet. Please run 'npm run seed:demo' in the terminal to initialize it."
            : error.message || "Failed to sign into demo account. Please try again."
        )
      } else {
        router.push("/dashboard")
      }
    } catch (err: any) {
      setErrorMessage(err.message || "A network error occurred while connecting to demo account.")
    } finally {
      setDemoLoading(false)
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
            <span>Welcome Back</span>
          </div>
          <h1 className="font-serif text-2xl font-medium tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Continue your
            <br />
            <span className="italic text-primary">learning path.</span>
          </h1>
          <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground">
            Sign in to access your evolving orbital curriculum.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5 sm:p-4 text-xs text-destructive">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Info Banner */}
        {infoMessage && (
          <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 p-3.5 sm:p-4 text-xs text-foreground">
            {infoMessage}
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
              className="w-full rounded-xl border border-border bg-card/80 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-[0.15em] text-foreground/80"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground transition-colors hover:text-primary py-1"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
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
              disabled={loading || demoLoading}
              className="w-full justify-center py-3.5 text-sm min-h-[44px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Continue</span>
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </MagneticButton>
          </div>
        </form>

        {/* Demo Account Section */}
        <div className="mt-5 space-y-3">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/70" />
            </div>
            <span className="relative bg-background px-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              Or explore instantly
            </span>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading || demoLoading}
            id="btn-demo-login"
            className="group relative flex w-full items-center justify-center gap-2.5 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3.5 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/60 hover:bg-primary/15 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99] disabled:opacity-50 min-h-[44px]"
          >
            {demoLoading ? (
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                <span className="text-xs font-semibold text-primary">Signing into demo...</span>
              </div>
            ) : (
              <>
                <Rocket size={16} className="text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                <span className="font-semibold text-primary">🚀 Try Demo Account</span>
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-muted-foreground">
            Explore LearnPilot with a preloaded demo learner
          </p>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline p-1"
          >
            Create account
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
