import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { InvoiceFormValues } from "../types"

export function useInvoiceMutation(invoiceId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: InvoiceFormValues) => {
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          notes: values.notes,
          status: values.status,
          customer_name: values.customer_name,
          customer_email: values.customer_email,
          customer_phone: values.customer_phone,
          customer_address: values.customer_address,
          vehicle_make: values.vehicle_make,
          vehicle_model: values.vehicle_model,
          vehicle_year: values.vehicle_year,
          vehicle_vin: values.vehicle_vin
        })
        .eq('id', invoiceId)

      if (invoiceError) throw invoiceError

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .upsert(
          values.invoice_items.map(item => ({
            invoice_id: invoiceId,
            ...item
          }))
        )

      if (itemsError) throw itemsError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] })
      toast.success('Invoice updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update invoice')
      console.error('Error updating invoice:', error)
    }
  })
}