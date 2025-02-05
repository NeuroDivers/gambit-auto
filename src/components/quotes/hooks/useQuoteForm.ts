import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Quote, QuoteFormValues } from "../types"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"

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
  service_items: z.array(z.object({
    service_name: z.string(),
    description: z.string().optional(),
    quantity: z.number(),
    unit_price: z.number()
  }))
})

interface UseQuoteFormProps {
  quote?: Quote
  onSuccess?: () => void
}

export function useQuoteForm({ quote, onSuccess }: UseQuoteFormProps = {}) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: quote ? {
      customer_first_name: quote.customer_first_name || '',
      customer_last_name: quote.customer_last_name || '',
      customer_email: quote.customer_email || '',
      customer_phone: quote.customer_phone || '',
      customer_address: quote.customer_address || '',
      vehicle_make: quote.vehicle_make || '',
      vehicle_model: quote.vehicle_model || '',
      vehicle_year: quote.vehicle_year || new Date().getFullYear(),
      vehicle_vin: quote.vehicle_vin || '',
      notes: quote.notes || '',
      service_items: quote.quote_items || []
    } : {
      customer_first_name: '',
      customer_last_name: '',
      customer_email: '',
      customer_phone: '',
      customer_address: '',
      vehicle_make: '',
      vehicle_model: '',
      vehicle_year: new Date().getFullYear(),
      vehicle_vin: '',
      notes: '',
      service_items: []
    }
  })

  const onSubmit = async (values: QuoteFormValues) => {
    try {
      console.log('Starting quote submission with values:', values)
      
      // Calculate totals
      const subtotal = values.service_items.reduce(
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

      console.log('Calculated values:', { subtotal, taxAmount, total })

      if (quote) {
        // Update existing quote
        const { error: quoteError } = await supabase
          .from("quotes")
          .update({
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
            total
          })
          .eq('id', quote.id)

        if (quoteError) {
          console.error('Error updating quote:', quoteError)
          throw new Error('Failed to update quote')
        }

        // Delete existing quote items
        const { error: deleteError } = await supabase
          .from("quote_items")
          .delete()
          .eq('quote_id', quote.id)

        if (deleteError) {
          console.error('Error deleting quote items:', deleteError)
          throw new Error('Failed to delete quote items')
        }

        // Insert new quote items
        if (values.service_items.length > 0) {
          console.log('Inserting quote items:', values.service_items)
          const { error: itemsError } = await supabase
            .from("quote_items")
            .insert(
              values.service_items.map(item => ({
                quote_id: quote.id,
                service_name: item.service_name,
                description: item.description || '',
                quantity: item.quantity,
                unit_price: item.unit_price
              }))
            )

          if (itemsError) {
            console.error('Error creating quote items:', itemsError)
            throw new Error('Failed to create quote items')
          }
        }

        toast({
          title: "Success",
          description: "Quote updated successfully",
        })
      } else {
        // Generate quote number for new quote
        const { data: quoteNumber } = await supabase
          .rpc('generate_quote_number')

        if (!quoteNumber) {
          throw new Error('Failed to generate quote number')
        }

        // Insert new quote
        const { data: newQuote, error: quoteError } = await supabase
          .from("quotes")
          .insert({
            quote_number: quoteNumber,
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
            status: "draft"
          })
          .select()
          .single()

        if (quoteError || !newQuote) {
          console.error('Error creating quote:', quoteError)
          throw new Error('Failed to create quote')
        }

        // Insert quote items
        if (values.service_items.length > 0) {
          console.log('Inserting quote items:', values.service_items)
          const { error: itemsError } = await supabase
            .from("quote_items")
            .insert(
              values.service_items.map(item => ({
                quote_id: newQuote.id,
                service_name: item.service_name,
                description: item.description || '',
                quantity: item.quantity,
                unit_price: item.unit_price
              }))
            )

          if (itemsError) {
            console.error('Error creating quote items:', itemsError)
            throw new Error('Failed to create quote items')
          }
        }

        toast({
          title: "Success",
          description: "Quote created successfully",
        })
      }

      await queryClient.invalidateQueries({ queryKey: ["quotes"] })
      onSuccess?.()
    } catch (error: any) {
      console.error('Form submission error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to save quote'
      })
    }
  }

  return {
    form,
    onSubmit
  }
}