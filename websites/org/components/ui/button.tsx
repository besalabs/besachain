import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "secondary"
  size?: "default" | "sm" | "lg"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        className: cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-800 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-navy-800 text-white hover:bg-navy-900": variant === "default",
            "bg-white text-navy-900 hover:bg-navy-50": variant === "secondary",
            "border-2 border-navy-800 bg-transparent text-navy-800 hover:bg-navy-50": variant === "outline",
            "hover:bg-navy-100 text-navy-800": variant === "ghost",
            "text-navy-800 underline-offset-4 hover:underline": variant === "link",
            "h-10 px-4 py-2": size === "default",
            "h-8 px-3 text-sm": size === "sm",
            "h-12 px-6 text-lg": size === "lg",
          },
          className,
          (children.props as any).className
        ),
        ref,
      })
    }

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-800 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-navy-800 text-white hover:bg-navy-900": variant === "default",
            "bg-white text-navy-900 hover:bg-navy-50": variant === "secondary",
            "border-2 border-navy-800 bg-transparent text-navy-800 hover:bg-navy-50": variant === "outline",
            "hover:bg-navy-100 text-navy-800": variant === "ghost",
            "text-navy-800 underline-offset-4 hover:underline": variant === "link",
            "h-10 px-4 py-2": size === "default",
            "h-8 px-3 text-sm": size === "sm",
            "h-12 px-6 text-lg": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
