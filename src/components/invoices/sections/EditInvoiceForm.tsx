import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { InvoiceFormValues } from "../types"
import { InvoiceStatusField } from "../form-sections/InvoiceStatusField"
import { InvoiceNotesField } from "../form-sections/InvoiceNotesField"
import { CustomerInfoFields } from "../form-sections/CustomerInfoFields"
import { VehicleInfoFields } from "../form-sections/VehicleInfoFields"
import { InvoiceServiceItems } from "./InvoiceServiceItems"

type EditInvoiceFormProps = {
  form: UseFormReturn<InvoiceFormValues>
  onSubmit: (values: InvoiceFormValues) => void
  isPending: boolean
  invoiceId: string
}

export function EditInvoiceForm({ form, onSubmit, isPending, invoiceId }: EditInvoiceFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <InvoiceStatusField form={form} />
            <CustomerInfoFields 
              customerName={form.watch('customer_name')}
              setCustomerName={(value) => form.setValue('customer_name', value)}
              customerEmail={form.watch('customer_email')}
              setCustomerEmail={(value) => form.setValue('customer_email', value)}
              customerPhone={form.watch('customer_phone')}
              setCustomerPhone={(value) => form.setValue('customer_phone', value)}
              customerAddress={form.watch('customer_address')}
              setCustomerAddress={(value) => form.setValue('customer_address', value)}
            />
          </div>
          <div className="space-y-6">
            <VehicleInfoFields 
              vehicleMake={form.watch('vehicle_make')}
              setVehicleMake={(value) => form.setValue('vehicle_make', value)}
              vehicleModel={form.watch('vehicle_model')}
              setVehicleModel={(value) => form.setValue('vehicle_model', value)}
              vehicleYear={form.watch('vehicle_year')}
              setVehicleYear={(value) => form.setValue('vehicle_year', value)}
              vehicleVin={form.watch('vehicle_vin')}
              setVehicleVin={(value) => form.setValue('vehicle_vin', value)}
            />
          </div>
        </div>
        
        <InvoiceServiceItems 
          items={form.watch('invoice_items')}
          setItems={(items) => form.setValue('invoice_items', items)}
        />

        <InvoiceNotesField form={form} />

        <div className="flex justify-end gap-4 sticky bottom-0 bg-background py-4 border-t">
          <Button variant="outline" type="button" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}