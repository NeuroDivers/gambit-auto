import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { InvoiceFormValues } from "../types"
import { InvoiceStatusField } from "../form-sections/InvoiceStatusField"
import { InvoiceNotesField } from "../form-sections/InvoiceNotesField"
import { CustomerInfoFields } from "../form-sections/CustomerInfoFields"
import { VehicleInfoFields } from "../form-sections/VehicleInfoFields"
import { InvoiceServiceItems } from "./InvoiceServiceItems"
import { InvoiceTotalsDisplay } from "../form-sections/InvoiceTotalsDisplay"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type EditInvoiceFormProps = {
  form: UseFormReturn<InvoiceFormValues>
  onSubmit: (values: InvoiceFormValues) => void
  isPending: boolean
  invoiceId: string
}

export function EditInvoiceForm({ form, onSubmit, isPending, invoiceId }: EditInvoiceFormProps) {
  // Fetch business taxes for calculations
  const { data: taxes } = useQuery({
    queryKey: ["business-taxes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_taxes")
        .select("*")
      
      if (error) throw error
      return data
    },
  })

  const handleSubmit = (values: InvoiceFormValues) => {
    // Calculate totals before submitting
    const subtotal = values.invoice_items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    )
    
    const gstTax = taxes?.find(tax => tax.tax_type === 'GST')
    const qstTax = taxes?.find(tax => tax.tax_type === 'QST')
    
    const gstAmount = gstTax ? (subtotal * gstTax.tax_rate) / 100 : 0
    const qstAmount = qstTax ? (subtotal * qstTax.tax_rate) / 100 : 0
    const total = subtotal + gstAmount + qstAmount

    // Include calculated values in the submission
    onSubmit({
      ...values,
      subtotal,
      tax_amount: gstAmount + qstAmount,
      total
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <InvoiceStatusField form={form} />
            <CustomerInfoFields 
              customerFirstName={form.watch('customer_first_name')}
              setCustomerFirstName={(value) => form.setValue('customer_first_name', value)}
              customerLastName={form.watch('customer_last_name')}
              setCustomerLastName={(value) => form.setValue('customer_last_name', value)}
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

        <div className="border-t pt-4">
          <InvoiceTotalsDisplay 
            items={form.watch('invoice_items')} 
            taxes={taxes}
          />
        </div>

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