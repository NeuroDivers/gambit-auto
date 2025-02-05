import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { QuoteForm } from "./QuoteForm"
import { Quote } from "./types"

type EditQuoteDialogProps = {
  quote: Quote
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditQuoteDialog({ quote, open, onOpenChange }: EditQuoteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Quote</DialogTitle>
        </DialogHeader>
        <QuoteForm quote={quote} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}