
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { InvoiceFormFields } from "./form-sections/InvoiceFormFields"
import { useInvoiceFormSubmission } from "./form-sections/useInvoiceFormSubmission"
import { useCreateInvoice } from "./hooks/useCreateInvoice"

type CreateInvoiceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateInvoiceDialog({ open, onOpenChange }: CreateInvoiceDialogProps) {
  const {
    formData,
    setters,
    workOrders,
    businessProfile,
    businessTaxes,
    handleWorkOrderSelect,
    resetForm
  } = useCreateInvoice()

  const { handleSubmit } = useInvoiceFormSubmission({
    onSuccess: () => {
      onOpenChange(false)
      resetForm()
    },
    ...formData,
    businessProfile,
    businessTaxes
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice from scratch or convert an existing work order.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <InvoiceFormFields
              {...formData}
              {...setters}
              selectedWorkOrderId={formData.selectedWorkOrderId}
              onWorkOrderSelect={handleWorkOrderSelect}
              workOrders={workOrders || []}
              invoiceItems={formData.invoiceItems}
              setInvoiceItems={setters.setInvoiceItems}
            />
            <Button type="submit" className="w-full">
              Create Invoice
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
