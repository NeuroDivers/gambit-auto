import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { QuoteForm } from "./QuoteForm"
import { Quote } from "./types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EditQuoteDialogProps {
  quote: Quote
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditQuoteDialog({ quote, open, onOpenChange, onSuccess }: EditQuoteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Quote {quote.quote_number}</DialogTitle>
          <DialogDescription>
            Make changes to the quote details below.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
          <QuoteForm quote={quote} onSuccess={onSuccess} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}