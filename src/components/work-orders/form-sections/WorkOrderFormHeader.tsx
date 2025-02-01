import { cn } from "@/lib/utils"

type WorkOrderFormHeaderProps = {
  isEditing: boolean
}

export function WorkOrderFormHeader({ isEditing }: WorkOrderFormHeaderProps) {
  return (
    <div className="space-y-2">
      <p className={cn(
        "text-sm text-muted-foreground"
      )}>
        {isEditing 
          ? "Update the work order details below."
          : "Fill out the form below to create a work order."}
      </p>
    </div>
  )
}