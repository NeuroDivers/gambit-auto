
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { EstimateFormValues } from "../types"

export function useCreateQuoteForm() {
  const navigate = useNavigate()
  
  const form = useForm<EstimateFormValues>({
    defaultValues: {
      customer_first_name: "",
      customer_last_name: "",
      customer_email: "",
      customer_phone: "",
      customer_address: "",
      vehicle_make: "",
      vehicle_model: "",
      vehicle_year: new Date().getFullYear(),
      vehicle_vin: "",
      vehicle_body_class: "",
      vehicle_doors: undefined,
      vehicle_trim: "",
      service_items: [],
      notes: "",
      status: "draft"
    }
  })

  const onSubmit = async (data: EstimateFormValues) => {
    try {
      // Calculate totals
      const subtotal = data.service_items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0
      )

      // Create quote
      const { data: quote, error } = await supabase
        .from('quotes')
        .insert({
          customer_first_name: data.customer_first_name,
          customer_last_name: data.customer_last_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          customer_address: data.customer_address,
          vehicle_make: data.vehicle_make,
          vehicle_model: data.vehicle_model,
          vehicle_year: data.vehicle_year,
          vehicle_vin: data.vehicle_vin,
          vehicle_body_class: data.vehicle_body_class,
          vehicle_doors: data.vehicle_doors,
          vehicle_trim: data.vehicle_trim,
          notes: data.notes,
          subtotal,
          total: subtotal,
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error

      // Add quote items
      if (quote) {
        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(
            data.service_items.map(item => ({
              quote_id: quote.id,
              service_id: item.service_id,
              service_name: item.service_name,
              quantity: item.quantity,
              unit_price: item.unit_price
            }))
          )

        if (itemsError) throw itemsError
      }

      toast.success("Estimate created successfully")
      navigate(`/admin/estimates/${quote?.id}`)
    } catch (error: any) {
      console.error('Error creating estimate:', error)
      toast.error("Failed to create estimate")
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit)
  }
}
