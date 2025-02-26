
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
        pending:
          "border-transparent bg-yellow-100 text-yellow-700",
        accepted:
          "border-transparent bg-green-100 text-green-700",
        rejected:
          "border-transparent bg-red-100 text-red-700",
        estimated:
          "border-transparent bg-blue-100 text-blue-700",
        draft:
          "border-transparent bg-gray-100 text-gray-700",
        sent:
          "border-transparent bg-purple-100 text-purple-700",
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
