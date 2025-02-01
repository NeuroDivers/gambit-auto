import { cn } from "@/lib/utils"

type QuoteFormHeaderProps = {
  isEditing: boolean
}

export function QuoteFormHeader({ isEditing }: QuoteFormHeaderProps) {
  return (
    <div className="space-y-2">
      <p className={cn(
        "text-sm text-muted-foreground"
      )}>
        {isEditing 
          ? "Update the quote request details below."
          : "Fill out the form below to request a quote for our services."}
      </p>
    </div>
  )
}