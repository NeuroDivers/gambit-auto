
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { QuoteForm } from "./QuoteForm"
import type { Estimate } from "./types"

interface EditQuoteDialogProps {
  quote: Estimate
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EditQuoteDialog({ quote, onSuccess, open, onOpenChange }: EditQuoteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <QuoteForm quote={quote} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  )
}
