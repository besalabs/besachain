import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-navy-800 focus:ring-offset-2",
        {
          "border-transparent bg-navy-800 text-white hover:bg-navy-900": variant === "default",
          "border-transparent bg-navy-100 text-navy-800 hover:bg-navy-200": variant === "secondary",
          "border-navy-300 text-navy-700": variant === "outline",
          "border-transparent bg-green-100 text-green-800": variant === "success",
          "border-transparent bg-amber-100 text-amber-800": variant === "warning",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
