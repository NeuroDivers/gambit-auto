
import { QuoteRequestSheet } from "./QuoteRequestSheet"

interface QuoteRequestFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuoteRequestFormDialog({ open, onOpenChange }: QuoteRequestFormDialogProps) {
  return <QuoteRequestSheet open={open} onOpenChange={onOpenChange} />
}
