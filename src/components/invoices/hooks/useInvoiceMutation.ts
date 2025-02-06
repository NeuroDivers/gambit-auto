import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { InvoiceFormValues, InvoiceItem } from "../types"

export function useInvoiceMutation(invoiceId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: InvoiceFormValues) => {
      // First update the invoice details
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          notes: values.notes,
          status: values.status,
          customer_first_name: values.customer_first_name,
          customer_last_name: values.customer_last_name,
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

      // Get existing invoice items to compare
      const { data: existingItems, error: fetchError } = await supabase
        .from('invoice_items')
        .select('id')
        .eq('invoice_id', invoiceId)

      if (fetchError) throw fetchError

      // Delete all existing items first
      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId)

      if (deleteError) throw deleteError

      // Then insert all items as new
      if (values.invoice_items.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            values.invoice_items.map((item: InvoiceItem) => ({
              invoice_id: invoiceId,
              service_name: item.service_name,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
            }))
          )

        if (itemsError) throw itemsError
      }
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