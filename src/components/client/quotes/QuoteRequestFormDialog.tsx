
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { MultiStepQuoteRequestForm } from "./MultiStepQuoteRequestForm"
import { ScrollArea } from "@/components/ui/scroll-area"

interface QuoteRequestFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuoteRequestFormDialog({ open, onOpenChange }: QuoteRequestFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <ScrollArea className="h-full pr-4">
          <MultiStepQuoteRequestForm onSuccess={() => onOpenChange(false)} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
