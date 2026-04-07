import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface ButtonProps {
  children: ReactNode
  variant?: "primary" | "secondary" | "outline"
  size?: "sm" | "md" | "lg"
  className?: string
  onClick?: () => void
  href?: string
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  href,
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg btn-glow"
  
  const variants = {
    primary: "bg-accent-cyan text-background hover:bg-cyan-300 glow-cyan-sm",
    secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/20",
    outline: "border border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan/10",
  }
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }

  const classes = cn(baseStyles, variants[variant], sizes[size], className)

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    )
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  )
}
