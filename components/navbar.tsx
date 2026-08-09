"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { MagneticButton } from "@/components/magnetic-button"
import { useAuth } from "@/components/auth/auth-provider"

const LINKS = [
  { label: "Overview", progress: 0 },
  { label: "Experience", progress: 0.3 },
  { label: "How It Works", progress: 0.72 },
]

export function Navbar() {
  const router = useRouter()
  const { user } = useAuth()

  const scrollTo = (targetProgress: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({
      top: max * targetProgress,
      behavior: "smooth",
    })
  }

  const handleStartLearning = () => {
    router.push(user ? "/onboarding" : "/login")
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6 md:px-10">
        <button
          onClick={() => scrollTo(0)}
          className="text-left text-sm font-semibold tracking-[0.25em] text-foreground transition-opacity hover:opacity-80"
        >
          LEARNPILOT
        </button>

        <div className="hidden items-center gap-9 md:flex">
          {LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.progress)}
              className="group relative text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <MagneticButton
            onClick={handleStartLearning}
            className="hidden px-5 py-2.5 text-xs sm:inline-flex"
          >
            Start Learning
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </MagneticButton>
        </div>
      </nav>
    </motion.header>
  )
}

