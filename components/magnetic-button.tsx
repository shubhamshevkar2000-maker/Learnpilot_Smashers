"use client"

import { useRef, type ReactNode } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

type Props = {
  children: ReactNode
  className?: string
  variant?: "solid" | "ghost"
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  disabled?: boolean
}

export function MagneticButton({ children, className, variant = "solid", onClick, type = "button", disabled = false }: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 })

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const relX = e.clientX - rect.left - rect.width / 2
    const relY = e.clientY - rect.top - rect.height / 2
    x.set(relX * 0.35)
    y.set(relY * 0.35)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      whileHover={disabled ? {} : { scale: 1.04 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={cn(
        "group relative inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-wide transition-colors",
        variant === "solid"
          ? "bg-primary text-primary-foreground shadow-[0_0_40px_-8px_var(--primary)] hover:shadow-[0_0_60px_-6px_var(--primary)]"
          : "border border-border bg-transparent text-foreground hover:border-primary/60",
        className,
      )}
    >
      {children}
    </motion.button>
  )
}
