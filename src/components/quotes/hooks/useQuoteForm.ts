import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { QuoteFormValues } from "../types"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

const formSchema = z.object({
  customer_first_name: z.string().min(1, "First name is required"),
  customer_last_name: z.string().min(1, "Last name is required"),
  customer_email: z.string().email("Invalid email address"),
  customer_phone: z.string().min(1, "Phone number is required"),
  customer_address: z.string().optional(),
  vehicle_make: z.string().min(1, "Vehicle make is required"),
  vehicle_model: z.string().min(1, "Vehicle model is required"),
  vehicle_year: z.number().min(1900).max(new Date().getFullYear() + 1),
  vehicle_vin: z.string().min(1, "Vehicle VIN is required"),
  notes: z.string().optional(),
  quote_items: z.array(z.object({
    service_id: z.string(),
    service_name: z.string(),
    quantity: z.number(),
    unit_price: z.number()
  }))
})

export function useQuoteForm(onSuccess?: () => void) {
  const { toast } = useToast()

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quote_items: []
    }
  })

  const onSubmit = async (values: QuoteFormValues) => {
    try {
      // Calculate totals
      const subtotal = values.quote_items.reduce(
        (sum, item) => sum + (item.quantity * item.unit_price),
        0
      )

      // Get tax rate from business_taxes
      const { data: taxData } = await supabase
        .from("business_taxes")
        .select("tax_rate")
        .limit(1)
        .single()

      const taxRate = taxData?.tax_rate || 0
      const taxAmount = subtotal * (taxRate / 100)
      const total = subtotal + taxAmount

      // Insert quote
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          customer_first_name: values.customer_first_name,
          customer_last_name: values.customer_last_name,
          customer_email: values.customer_email,
          customer_phone: values.customer_phone,
          customer_address: values.customer_address,
          vehicle_make: values.vehicle_make,
          vehicle_model: values.vehicle_model,
          vehicle_year: values.vehicle_year,
          vehicle_vin: values.vehicle_vin,
          notes: values.notes,
          subtotal,
          tax_amount: taxAmount,
          total,
          quote_number: await generateQuoteNumber(),
          status: "draft"
        })
        .select()
        .single()

      if (quoteError) throw quoteError

      // Insert quote items
      if (values.quote_items.length > 0) {
        const { error: itemsError } = await supabase
          .from("quote_items")
          .insert(
            values.quote_items.map(item => ({
              quote_id: quote.id,
              service_name: item.service_name,
              quantity: item.quantity,
              unit_price: item.unit_price
            }))
          )

        if (itemsError) throw itemsError
      }

      onSuccess?.()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      })
    }
  }

  return {
    form,
    onSubmit
  }
}

async function generateQuoteNumber() {
  const { data, error } = await supabase
    .rpc('generate_quote_number')

  if (error) throw error
  return data
}