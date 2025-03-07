
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { InvoiceFormValues, InvoiceItem } from "../types"
import { useNavigate } from "react-router-dom"

export function useInvoiceMutation(invoiceId?: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const isValidUUID = (uuid: string | null | undefined): boolean => {
    if (!uuid) return false
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  const sanitizeItem = (item: InvoiceItem, invoiceId: string) => {
    if (!isValidUUID(item.service_id)) {
      return null
    }

    return {
      invoice_id: invoiceId,
      service_id: item.service_id,
      package_id: isValidUUID(item.package_id) ? item.package_id : null,
      service_name: item.service_name || "",
      description: item.description || "",
      quantity: Math.max(1, item.quantity || 1),
      unit_price: Math.max(0, item.unit_price || 0),
      commission_rate: item.commission_rate,
      commission_type: item.commission_type,
      assigned_profile_id: item.assigned_profile_id
    }
  }

  return useMutation({
    mutationFn: async (values: InvoiceFormValues) => {
      if (!invoiceId || !isValidUUID(invoiceId)) {
        throw new Error("Valid Invoice ID is required")
      }

      // Calculate subtotal from invoice items
      const subtotal = values.invoice_items.reduce((total, item) => {
        return total + (item.quantity * item.unit_price)
      }, 0)

      // Get tax rates from business_taxes table
      const { data: taxRates, error: taxError } = await supabase
        .from('business_taxes')
        .select('tax_type, tax_rate')

      if (taxError) throw taxError

      // Find GST and QST rates
      const gstRate = taxRates.find(tax => tax.tax_type === 'GST')?.tax_rate || 0
      const qstRate = taxRates.find(tax => tax.tax_type === 'QST')?.tax_rate || 0

      // Calculate GST and QST amounts
      const gstAmount = subtotal * (gstRate / 100)
      const qstAmount = subtotal * (qstRate / 100)

      // Calculate total including both taxes
      const total = subtotal + gstAmount + qstAmount

      // First update the invoice details
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          notes: values.notes || "",
          status: values.status,
          due_date: values.due_date,
          customer_first_name: values.customer_first_name || "",
          customer_last_name: values.customer_last_name || "",
          customer_email: values.customer_email || "",
          customer_phone: values.customer_phone || "",
          customer_address: values.customer_address || "",
          customer_vehicle_make: values.customer_vehicle_make || "",
          customer_vehicle_model: values.customer_vehicle_model || "",
          customer_vehicle_year: values.customer_vehicle_year || 0,
          customer_vehicle_vin: values.customer_vehicle_vin || "",
          customer_vehicle_body_class: values.customer_vehicle_body_class || "",
          customer_vehicle_doors: values.customer_vehicle_doors || null,
          customer_vehicle_trim: values.customer_vehicle_trim || "",
          subtotal: subtotal,
          gst_amount: gstAmount,
          qst_amount: qstAmount,
          total: total
        })
        .eq('id', invoiceId)

      if (invoiceError) throw invoiceError

      // Delete all existing items first
      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId)

      if (deleteError) throw deleteError

      // Then insert all items as new
      if (values.invoice_items?.length > 0) {
        const itemsToInsert = values.invoice_items
          .map(item => sanitizeItem(item, invoiceId))
          .filter((item): item is NonNullable<typeof item> => item !== null)

        if (itemsToInsert.length > 0) {
          console.log('Inserting items:', itemsToInsert)
          const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(itemsToInsert)

          if (itemsError) {
            console.error('Error inserting items:', itemsError)
            throw itemsError
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] })
      toast.success('Invoice updated successfully')
      navigate('/admin/invoices')
    },
    onError: (error: any) => {
      console.error('Error updating invoice:', error)
      toast.error('Failed to update invoice: ' + error.message)
    }
  })
}
