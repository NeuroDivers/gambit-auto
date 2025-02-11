
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InvoiceView } from "../InvoiceView"

type InvoiceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: string | null
  onClose: () => void
}

export function InvoiceDialog({ open, onOpenChange, invoiceId, onClose }: InvoiceDialogProps) {
  if (!invoiceId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
          <DialogDescription>
            Make changes to your invoice details and items.
          </DialogDescription>
        </DialogHeader>
        <InvoiceView 
          invoiceId={invoiceId} 
          isEditing={true}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
