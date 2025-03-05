
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
import { useInvoiceFormSubmission } from "./hooks/useInvoiceFormSubmission"
import { useCreateInvoice } from "./hooks/useCreateInvoice"
import { Card } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { InvoiceFormValues } from "./types"

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

  const form = useForm<InvoiceFormValues>({
    defaultValues: {
      notes: '',
      status: 'draft',
      invoice_items: [],
      customer_first_name: '',
      customer_last_name: '',
      customer_email: '',
      customer_phone: '',
      customer_address: '',
      vehicle_make: '',
      vehicle_model: '',
      vehicle_year: 0,
      vehicle_vin: ''
    }
  })

  const { handleSubmit } = useInvoiceFormSubmission({
    onSuccess: () => {
      onOpenChange(false)
      resetForm()
    },
    ...formData,
    businessProfile,
    businessTaxes
  })

  // Function to handle customer selection
  const handleCustomerSelect = (customerId: string) => {
    // This is just a placeholder function, actual implementation would depend on your app
    console.log('Customer selected:', customerId);
    if (setters.setCustomerId) {
      setters.setCustomerId(customerId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full h-screen flex flex-col animate-slide-in-right data-[state=closed]:animate-slide-out-right">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl">Create Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice from scratch or convert an existing work order.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6">
          <form onSubmit={handleSubmit} className="space-y-6 pb-6">
            <InvoiceFormFields
              form={form}
              selectedWorkOrderId={formData.selectedWorkOrderId}
              onWorkOrderSelect={handleWorkOrderSelect}
              workOrders={workOrders || []}
              invoiceItems={formData.invoiceItems}
              setInvoiceItems={setters.setInvoiceItems}
              notes={formData.notes}
              setNotes={setters.setNotes}
              onCustomerSelect={handleCustomerSelect}
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
