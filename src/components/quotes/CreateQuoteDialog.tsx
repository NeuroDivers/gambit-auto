
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { QuoteForm } from "./QuoteForm"

interface CreateQuoteDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateQuoteDialog({ open, onOpenChange, onSuccess }: CreateQuoteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <QuoteForm onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  )
}
