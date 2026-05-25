import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "success" | "warning" | "info" | "purple" | "gold"

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  success: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-700/50",
  warning: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-700/50",
  info: "bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border border-sky-200/60 dark:border-sky-700/50",
  purple: "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-200/60 dark:border-violet-700/50",
  gold: "bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200/60 dark:border-amber-700/50",
}

const dotColor: Record<BadgeVariant, string> = {
  default: "bg-gray-400",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  info: "bg-sky-500",
  purple: "bg-violet-500",
  gold: "bg-amber-500",
}

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium tracking-wide", variantClasses[variant], className)}>
      {children}
    </span>
  )
}

const insightVariants: Record<string, BadgeVariant> = {
  "Top ROI": "gold",
  "Best Value": "success",
  "Rising Placements": "info",
  "Highest Placed": "purple",
}

export function InsightBadge({ label }: { label: string }) {
  const variant = insightVariants[label] ?? "default"
  return (
    <Badge variant={variant}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dotColor[variant])} />
      {label}
    </Badge>
  )
}
