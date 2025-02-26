
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
          "border-transparent bg-[#FEF7CD] text-[#946800]",
        accepted:
          "border-transparent bg-[#F2FCE2] text-[#3F6212]",
        rejected:
          "border-transparent bg-[#FFDEE2] text-[#BE123C]",
        estimated:
          "border-transparent bg-[#D3E4FD] text-[#1E40AF]",
        draft:
          "border-transparent bg-[#F1F0FB] text-[#4338CA]",
        sent:
          "border-transparent bg-[#E5DEFF] text-[#6D28D9]",
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
