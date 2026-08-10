"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  Compass, Calendar, Layers, BookOpen, Bot, CheckCircle, BarChart3,
  FileText, Settings, LogOut, Menu, X
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Layers, href: "/dashboard" },
  { id: "journey", label: "Daily Journey", icon: Calendar, href: "/journey" },
  { id: "path", label: "Learning Path", icon: Compass, href: "/path" },
  { id: "courses", label: "Courses", icon: BookOpen, href: "/courses" },
  { id: "ai-coach", label: "AI Coach", icon: Bot, href: "/ai-coach" },
  { id: "assessments", label: "Assessments", icon: CheckCircle, href: "/assessments" },
  { id: "progress", label: "Progress", icon: BarChart3, href: "/progress" },
  { id: "notes", label: "Notes", icon: FileText, href: "/notes" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
]

interface AppShellProps {
  children: React.ReactNode
  maxWidth?: "900px" | "1100px" | "1280px" | "1400px" | "full" | "none"
  noPadding?: boolean
  fullHeight?: boolean
}

export function AppShell({
  children,
  maxWidth = "1280px",
  noPadding = false,
  fullHeight = false,
}: AppShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isConfigured, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false)
    if (href && href !== "#") router.push(href)
  }

  const maxWidthClass =
    maxWidth === "full" || maxWidth === "none"
      ? "max-w-none w-full"
      : maxWidth === "900px"
      ? "max-w-[900px]"
      : maxWidth === "1100px"
      ? "max-w-[1100px]"
      : maxWidth === "1400px"
      ? "max-w-[1400px]"
      : "max-w-[1280px]"

  return (
    <div
      className={`flex ${
        fullHeight ? "h-screen overflow-hidden" : "min-h-screen"
      } bg-background text-foreground transition-colors duration-300`}
    >
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* LEFT COLUMN: Fixed Width Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[240px] min-w-[240px] max-w-[240px] shrink-0 flex-shrink-0 flex-col justify-between border-r border-border/40 bg-background/95 px-5 py-6 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-8">
            <Link
              href="/"
              className="text-[12px] font-semibold tracking-[0.25em] text-foreground transition-opacity hover:opacity-80"
            >
              LEARNPILOT
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-1 text-muted-foreground hover:text-foreground lg:hidden"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname?.startsWith(item.href)

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.href)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
                    active
                      ? "font-medium text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon size={16} className={active ? "text-primary" : "text-muted-foreground"} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="space-y-4 pt-6 border-t border-border/40">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              Appearance
            </span>
            <ThemeToggle />
          </div>
          {isConfigured && user && (
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          )}
        </div>
      </aside>

      {/* RIGHT COLUMN: Main Content Area */}
      <main
        className={`flex-1 min-w-0 w-full ${
          fullHeight ? "h-full overflow-hidden flex flex-col" : "overflow-y-auto overflow-x-hidden"
        } ${maxWidthClass} ${
          noPadding
            ? ""
            : "mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 lg:py-10 space-y-8 sm:space-y-12"
        }`}
      >
        {/* Mobile Header (Only visible on small screens) */}
        <div
          className={`flex items-center justify-between border-b border-border/40 lg:hidden ${
            noPadding ? "p-3 shrink-0" : "pb-4 mb-6"
          }`}
        >
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted/50"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <span className="text-[12px] font-semibold tracking-[0.25em] text-foreground">
            LEARNPILOT
          </span>
          <div className="w-10" />
        </div>

        {/* The actual page content is injected here */}
        <div className={`min-w-0 w-full ${fullHeight ? "flex-1 flex flex-col h-full overflow-hidden" : ""}`}>
          {children}
        </div>
      </main>
    </div>
  )
}
