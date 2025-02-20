
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { MultiStepQuoteRequestForm } from "./MultiStepQuoteRequestForm"
import { ScrollArea } from "@/components/ui/scroll-area"

interface QuoteRequestSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuoteRequestSheet({ open, onOpenChange }: QuoteRequestSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[900px] p-0">
        <ScrollArea className="h-full p-6">
          <MultiStepQuoteRequestForm onSuccess={() => onOpenChange(false)} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
