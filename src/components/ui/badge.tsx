
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: 
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        warning: 
          "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        info: 
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
        draft: 
          "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200",
        sent: 
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
        paid: 
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        accepted: 
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        rejected: 
          "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
        expired: 
          "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200",
        converted: 
          "border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200",
        partial: 
          "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        overdue:
          "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
        void:
          "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200",
        // Add direct mappings to theme variables for work order statuses
        pending:
          "border-transparent bg-[hsl(var(--status-pending-bg))] text-[hsl(var(--status-pending-text))]",
        approved:
          "border-transparent bg-[hsl(var(--status-approved-bg))] text-[hsl(var(--status-approved-text))]",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
