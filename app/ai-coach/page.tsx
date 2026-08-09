"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Compass,
  Layers,
  BookOpen,
  Calendar,
  Bot,
  CheckCircle,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Send,
  Sparkles,
  AlertCircle,
  User as UserIcon,
  RefreshCw,
  Clock,
  Target,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import type { LearnerProfile, CurrentLevel } from "@/types/database.types"

const LEVEL_LABELS: Record<CurrentLevel, string> = {
  beginner: "Beginner",
  basics: "Foundational Basics",
  intermediate: "Intermediate",
  advanced: "Advanced",
  unknown: "Exploratory",
}

interface NavItem {
  id: string
  label: string
  icon: typeof Compass
  href: string
  active?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Layers, href: "/dashboard" },
  { id: "journey", label: "Daily Journey", icon: Calendar, href: "/journey" },
  { id: "path", label: "Learning Path", icon: Compass, href: "/path" },
  { id: "courses", label: "Courses", icon: BookOpen, href: "/courses" },
  { id: "ai-coach", label: "AI Coach", icon: Bot, href: "/ai-coach", active: true },
  { id: "assessments", label: "Assessments", icon: CheckCircle, href: "/assessments" },
  { id: "progress", label: "Progress", icon: BarChart3, href: "/progress" },
  { id: "notes", label: "Notes", icon: FileText, href: "/notes" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
]

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

function parseInline(text: string, isUser: boolean) {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong
          key={i}
          className={isUser ? "font-semibold text-primary-foreground" : "font-semibold text-foreground"}
        >
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

function FormattedMessage({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) {
    return <div className="whitespace-pre-wrap font-sans break-words">{content}</div>
  }

  const blocks = content.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)

  return (
    <div className="space-y-3 font-sans leading-relaxed text-xs break-words">
      {blocks.map((block, idx) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean)

        const isAllNumbered = lines.length > 0 && lines.every((l) => /^\d+\.\s+/.test(l))
        const isAllBullet = lines.length > 0 && lines.every((l) => /^[-*]\s+/.test(l))

        if (isAllNumbered) {
          return (
            <ol key={idx} className="list-decimal pl-4 space-y-1.5 my-1.5">
              {lines.map((line, lIdx) => {
                const itemText = line.replace(/^\d+\.\s+/, "")
                return (
                  <li key={lIdx} className="pl-1 leading-relaxed">
                    {parseInline(itemText, isUser)}
                  </li>
                )
              })}
            </ol>
          )
        }

        if (isAllBullet) {
          return (
            <ul key={idx} className="list-disc pl-4 space-y-1.5 my-1.5">
              {lines.map((line, lIdx) => {
                const itemText = line.replace(/^[-*]\s+/, "")
                return (
                  <li key={lIdx} className="pl-1 leading-relaxed">
                    {parseInline(itemText, isUser)}
                  </li>
                )
              })}
            </ul>
          )
        }

        if (block.startsWith("### ") || block.startsWith("## ") || block.startsWith("# ")) {
          const headingText = block.replace(/^#{1,3}\s+/, "")
          return (
            <h4 key={idx} className="text-xs font-semibold text-foreground pt-1">
              {parseInline(headingText, isUser)}
            </h4>
          )
        }

        return (
          <div key={idx} className="space-y-1">
            {lines.map((line, lIdx) => {
              if (/^\d+\.\s+/.test(line)) {
                const itemText = line.replace(/^\d+\.\s+/, "")
                const num = line.match(/^(\d+)\./)?.[1]
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1.5 my-1">
                    <span className="font-medium text-foreground/90 shrink-0">{num}.</span>
                    <span>{parseInline(itemText, isUser)}</span>
                  </div>
                )
              }
              if (/^[-*]\s+/.test(line)) {
                const itemText = line.replace(/^[-*]\s+/, "")
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1.5 my-1">
                    <span className="text-primary shrink-0">•</span>
                    <span>{parseInline(itemText, isUser)}</span>
                  </div>
                )
              }
              return (
                <p key={lIdx} className="leading-relaxed">
                  {parseInline(line, isUser)}
                </p>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default function AICoachPage() {
  return (
    <ProtectedRoute>
      <AICoachContent />
    </ProtectedRoute>
  )
}

function AICoachContent() {
  const router = useRouter()
  const { user, isConfigured, signOut } = useAuth()
  const supabase = createClient()

  const [profile, setProfile] = useState<LearnerProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, sending, scrollToBottom])

  // Fetch real learner profile for display & context indicator
  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      if (!isConfigured) {
        router.replace("/login")
        return
      }

      try {
        const { data, error } = await supabase
          .from("learner_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()

        if (error || !data || !data.onboarding_completed) {
          router.replace("/onboarding")
          return
        }

        setProfile(data as LearnerProfile)
      } catch (err) {
        console.error("Failed to load profile:", err)
        setErrorMessage("Could not load learner profile. Please refresh.")
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [user, isConfigured, supabase, router])

  // Handle message submit
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim()
    if (!text || sending) return

    setErrorMessage(null)

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInputMessage("")
    setSending(true)

    try {
      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to receive AI Coach response.")
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch (err: any) {
      console.error("Coach send error:", err)
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Suggested prompts tailored to profile
  const suggestedPrompts = [
    profile?.learning_goal
      ? `How should I structure my daily ${profile.available_daily_minutes || 30}-minute study sessions for "${profile.learning_goal}"?`
      : "How can I structure my daily study schedule effectively?",
    profile?.current_level
      ? `What are the core concepts I should focus on at my ${LEVEL_LABELS[profile.current_level as CurrentLevel] || profile.current_level} level?`
      : "What key foundational concepts should I focus on first?",
    "Can you ask me a practice question to test my understanding?",
    "How can I stay consistent when learning complex topics?",
  ]

  if (profileLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <p className="text-xs text-muted-foreground">Connecting to your AI Coach...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground transition-colors duration-300">
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card/60 backdrop-blur-xl transition-transform duration-300 md:static md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <Link
            href="/"
            className="text-xs font-semibold tracking-[0.25em] text-foreground transition-opacity hover:opacity-80"
          >
            LEARNPILOT
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-muted-foreground hover:text-foreground md:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Info Card */}
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserIcon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground">
                {profile?.display_name || user?.email?.split("@")[0] || "Learner"}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {profile?.current_level
                  ? LEVEL_LABELS[profile.current_level as CurrentLevel] || profile.current_level
                  : "Learner"}
              </p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = item.active
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border p-4 flex items-center justify-between">
          <ThemeToggle />
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/40 px-4 md:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-muted-foreground hover:text-foreground md:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bot size={18} />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground leading-none">AI Learning Coach</h1>
                <p className="text-[11px] text-muted-foreground mt-0.5 hidden sm:block">
                  Personalized guidance powered by real learner context
                </p>
              </div>
            </div>
          </div>

          {/* Profile Context Pill */}
          {profile && (
            <div className="hidden lg:flex items-center gap-4 text-[11px] text-muted-foreground bg-accent/50 px-3 py-1.5 rounded-full border border-border">
              <div className="flex items-center gap-1.5 text-foreground font-medium truncate max-w-[200px]">
                <Target size={12} className="text-primary" />
                <span className="truncate">{profile.learning_goal}</span>
              </div>
              <span className="h-3 w-px bg-border" />
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-primary" />
                <span>{profile.available_daily_minutes || 30}m/day</span>
              </div>
            </div>
          )}
        </header>

        {/* Chat Conversation Viewport */}
        <main className="flex-1 overflow-y-auto w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="mx-auto max-w-2xl py-8 text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles size={28} />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-serif font-medium text-foreground">
                  Hello, {profile?.display_name || "Learner"}!
                </h2>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  I am your personal AI Learning Coach. I know your goal is{" "}
                  <span className="text-foreground font-medium">&quot;{profile?.learning_goal || "mastery"}&quot;</span> at a{" "}
                  <span className="text-foreground font-medium">
                    {LEVEL_LABELS[profile?.current_level as CurrentLevel] || profile?.current_level}
                  </span>{" "}
                  level. Ask me anything to guide your learning today.
                </p>
              </div>

              {/* Starter Prompts */}
              <div className="pt-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  Suggested topics to start:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left max-w-xl mx-auto">
                  {suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="group flex flex-col justify-between rounded-xl border border-border bg-card/60 p-3.5 text-xs text-foreground/90 transition-all hover:border-primary/50 hover:bg-card hover:shadow-sm"
                    >
                      <span className="line-clamp-2 leading-relaxed">{prompt}</span>
                      <span className="mt-2 text-[10px] text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Ask coach →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Message List */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-3xl mx-auto ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-1">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-[85%] sm:max-w-[75%] space-y-1 shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-xs"
                    : "bg-card border border-border text-foreground rounded-tl-xs"
                }`}
              >
                <FormattedMessage content={msg.content} isUser={msg.role === "user"} />
                <div
                  className={`text-[9px] text-right mt-1 opacity-70 ${
                    msg.role === "user" ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>

              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-foreground mt-1">
                  <UserIcon size={16} />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {sending && (
            <div className="flex items-start gap-3 max-w-3xl mx-auto justify-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-1">
                <Bot size={16} />
              </div>
              <div className="rounded-2xl rounded-tl-xs border border-border bg-card px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary delay-150" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary delay-300" />
                </div>
                <span>AI Coach is crafting a response...</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-[11px] font-medium underline underline-offset-2 hover:opacity-80"
              >
                Dismiss
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* Input Bar */}
        <footer className="shrink-0 border-t border-border bg-card/60 p-4 md:px-8 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="max-w-3xl mx-auto relative flex items-center gap-2"
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your AI Coach anything about your goal..."
              disabled={sending}
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 pr-12 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || sending}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              {sending ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
            </button>
          </form>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            AI Coach responses are personalized using your profile context. Press Enter to send.
          </p>
        </footer>
      </div>
    </div>
  )
}
