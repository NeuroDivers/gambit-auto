import { DialogDescription } from "@/components/ui/dialog"

type QuoteFormHeaderProps = {
  isEditing: boolean
}

export function QuoteFormHeader({ isEditing }: QuoteFormHeaderProps) {
  return (
    <div className="space-y-2">
      <DialogDescription>
        {isEditing 
          ? "Update the quote request details below."
          : "Fill out the form below to request a quote for our services."}
      </DialogDescription>
    </div>
  )
}