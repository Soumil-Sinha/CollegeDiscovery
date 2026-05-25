import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm",
        hover && "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-0.5 transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-5 py-4 border-b border-gray-100 dark:border-gray-800", className)}>{children}</div>
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl", className)}>{children}</div>
}
