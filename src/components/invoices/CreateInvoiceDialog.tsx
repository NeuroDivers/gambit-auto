
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
              selectedWorkOrderId={formData.selectedWorkOrderId}
              onWorkOrderSelect={handleWorkOrderSelect}
              workOrders={workOrders || []}
              invoiceItems={formData.invoiceItems}
              setInvoiceItems={setters.setInvoiceItems}
              customerFirstName={formData.customerFirstName}
              setCustomerFirstName={setters.setCustomerFirstName}
              customerLastName={formData.customerLastName}
              setCustomerLastName={setters.setCustomerLastName}
              customerEmail={formData.customerEmail}
              setCustomerEmail={setters.setCustomerEmail}
              customerPhone={formData.customerPhone}
              setCustomerPhone={setters.setCustomerPhone}
              customerAddress={formData.customerAddress}
              setCustomerAddress={setters.setCustomerAddress}
              vehicleMake={formData.vehicleMake}
              setVehicleMake={setters.setVehicleMake}
              vehicleModel={formData.vehicleModel}
              setVehicleModel={setters.setVehicleModel}
              vehicleYear={formData.vehicleYear}
              setVehicleYear={setters.setVehicleYear}
              vehicleVin={formData.vehicleVin}
              setVehicleVin={setters.setVehicleVin}
              vehicleBodyClass={formData.vehicleBodyClass || ""}
              setVehicleBodyClass={setters.setVehicleBodyClass}
              vehicleDoors={formData.vehicleDoors || 0}
              setVehicleDoors={setters.setVehicleDoors}
              vehicleTrim={formData.vehicleTrim || ""}
              setVehicleTrim={setters.setVehicleTrim}
              notes={formData.notes}
              setNotes={setters.setNotes}
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
