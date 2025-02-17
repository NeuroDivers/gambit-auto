
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

export function useInvoiceFormSubmission({
  invoiceId,
  customerInfo,
  vehicleInfo,
  invoiceItems,
  notes,
  status,
  workOrderId,
  setWorkOrderId,
  businessProfile,
  businessTaxes,
  onSuccess,
}: any) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!Array.isArray(invoiceItems)) {
        throw new Error("Invoice items must be an array")
      }

      // Ensure we have valid invoice items
      if (invoiceItems.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please add at least one item to the invoice",
        })
        return
      }

      // Calculate subtotal with proper type checking and default values
      const subtotal = invoiceItems.reduce((acc: number, item: any) => {
        const quantity = Number(item.quantity) || 0
        const unitPrice = Number(item.unit_price) || 0
        return acc + (quantity * unitPrice)
      }, 0)

      // Calculate taxes with proper type checking
      const taxes = Array.isArray(businessTaxes) ? businessTaxes.reduce((acc: number, tax: any) => {
        const rate = Number(tax.rate) || 0
        return acc + (subtotal * (rate / 100))
      }, 0) : 0

      const total = subtotal + taxes

      const invoiceData = {
        customer_first_name: customerInfo.firstName || '',
        customer_last_name: customerInfo.lastName || '',
        customer_email: customerInfo.email || '',
        customer_phone: customerInfo.phone || '',
        customer_address: customerInfo.address || '',
        vehicle_make: vehicleInfo.make || '',
        vehicle_model: vehicleInfo.model || '',
        vehicle_year: vehicleInfo.year || null,
        vehicle_vin: vehicleInfo.vin || '',
        subtotal: subtotal || 0, // Ensure subtotal is never null
        tax_amount: taxes || 0,  // Ensure tax_amount is never null
        total: total || 0,       // Ensure total is never null
        notes: notes || '',
        status: status || 'draft',
        work_order_id: workOrderId || null,
        business_profile_id: businessProfile?.id || null
      }

      if (invoiceId) {
        // Update existing invoice
        const { error: updateError } = await supabase
          .from("invoices")
          .update(invoiceData)
          .eq("id", invoiceId)

        if (updateError) throw updateError

        // Update invoice items
        await supabase
          .from("invoice_items")
          .delete()
          .eq("invoice_id", invoiceId)

        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(
            invoiceItems.map((item: any) => ({
              invoice_id: invoiceId,
              service_id: item.service_id || null,
              package_id: item.package_id || null,
              service_name: item.service_name || '',
              description: item.description || '',
              quantity: Number(item.quantity) || 1,
              unit_price: Number(item.unit_price) || 0,
            }))
          )

        if (itemsError) throw itemsError

        toast({
          title: "Success",
          description: "Invoice updated successfully",
        })
      } else {
        // Create new invoice
        const { data: newInvoice, error: createError } = await supabase
          .from("invoices")
          .insert(invoiceData)
          .select()
          .single()

        if (createError) throw createError

        // Insert invoice items
        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(
            invoiceItems.map((item: any) => ({
              invoice_id: newInvoice.id,
              service_id: item.service_id || null,
              package_id: item.package_id || null,
              service_name: item.service_name || '',
              description: item.description || '',
              quantity: Number(item.quantity) || 1,
              unit_price: Number(item.unit_price) || 0,
            }))
          )

        if (itemsError) throw itemsError

        toast({
          title: "Success",
          description: "Invoice created successfully",
        })
      }

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ["invoices"] })
      
      if (workOrderId) {
        setWorkOrderId("")
      }

      if (onSuccess) {
        onSuccess()
      }

      // Navigate back to invoices page after successful submission
      navigate("/invoices")
    } catch (error: any) {
      console.error("Error saving invoice:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save invoice",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return { handleSubmit, isSubmitting }
}
