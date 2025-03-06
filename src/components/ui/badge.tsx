
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-[#8B5CF6] text-white",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        success:
          "border-transparent bg-green-500 text-white",
        outline: "text-foreground",
        
        // Work Order Status Badges using CSS variables 
        pending:
          "border-transparent bg-[hsl(var(--status-pending-bg))] text-[hsl(var(--status-pending-text))]",
        in_progress:
          "border-transparent bg-[hsl(var(--status-in-progress-bg))] text-[hsl(var(--status-in-progress-text))]",
        completed:
          "border-transparent bg-[hsl(var(--status-completed-bg))] text-[hsl(var(--status-completed-text))]",
        cancelled:
          "border-transparent bg-[hsl(var(--status-cancelled-bg))] text-[hsl(var(--status-cancelled-text))]",
        invoiced:
          "border-transparent bg-[hsl(var(--status-invoiced-bg))] text-[hsl(var(--status-invoiced-text))]",
        
        // Invoice status badges
        draft:
          "border-transparent bg-[hsl(var(--invoice-draft-bg))] text-[hsl(var(--invoice-draft-text))]",
        sent:
          "border-transparent bg-[hsl(var(--invoice-sent-bg))] text-[hsl(var(--invoice-sent-text))]",
        paid:
          "border-transparent bg-[hsl(var(--invoice-paid-bg))] text-[hsl(var(--invoice-paid-text))]",
        overdue:
          "border-transparent bg-[hsl(var(--invoice-overdue-bg))] text-[hsl(var(--invoice-overdue-text))]",
        
        // Estimate status badges
        estimate_pending:
          "border-transparent bg-[hsl(var(--estimate-pending-bg))] text-[hsl(var(--estimate-pending-text))]",
        accepted:
          "border-transparent bg-[hsl(var(--estimate-accepted-bg))] text-[hsl(var(--estimate-accepted-text))]",
        rejected:
          "border-transparent bg-[hsl(var(--estimate-rejected-bg))] text-[hsl(var(--estimate-rejected-text))]",
        expired:
          "border-transparent bg-[hsl(var(--estimate-expired-bg))] text-[hsl(var(--estimate-expired-text))]",
        estimated:
          "border-transparent bg-[hsl(var(--estimate-pending-bg))] text-[hsl(var(--estimate-pending-text))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
