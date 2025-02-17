
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
      const subtotal = invoiceItems.reduce((acc: number, item: any) => {
        return acc + (item.quantity * item.unit_price)
      }, 0)

      const taxes = businessTaxes.reduce((acc: number, tax: any) => {
        return acc + (subtotal * (tax.rate / 100))
      }, 0)

      const total = subtotal + taxes

      const invoiceData = {
        customer_first_name: customerInfo.firstName,
        customer_last_name: customerInfo.lastName,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        vehicle_make: vehicleInfo.make,
        vehicle_model: vehicleInfo.model,
        vehicle_year: vehicleInfo.year,
        vehicle_vin: vehicleInfo.vin,
        subtotal,
        tax_amount: taxes,
        total,
        notes,
        status,
        work_order_id: workOrderId || null,
        business_profile_id: businessProfile?.id,
        invoice_number: `INV-${Date.now()}`
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
              service_id: item.service_id,
              package_id: item.package_id,
              service_name: item.service_name,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
            }))
          )

        if (itemsError) throw itemsError

        toast({
          title: "Success",
          description: "Invoice updated successfully",
        })
      } else {
        // Create new invoice
        const { data: invoice, error: createError } = await supabase
          .from("invoices")
          .insert(invoiceData)
          .select()
          .single()

        if (createError) throw createError

        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(
            invoiceItems.map((item: any) => ({
              invoice_id: invoice.id,
              service_id: item.service_id,
              package_id: item.package_id,
              service_name: item.service_name,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
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
