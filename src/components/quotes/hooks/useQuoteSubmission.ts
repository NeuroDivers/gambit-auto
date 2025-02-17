
import { QuoteFormValues } from "../types"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

export function useQuoteSubmission() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const submitQuote = async (values: QuoteFormValues, quoteId?: string) => {
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

      if (quoteId) {
        await updateQuote(quoteId, values, subtotal, taxAmount, total)
      } else {
        await createQuote(values, subtotal, taxAmount, total)
      }

      await queryClient.invalidateQueries({ queryKey: ["quotes"] })
      
      toast({
        title: "Success",
        description: quoteId ? "Quote updated successfully" : "Quote created successfully",
      })

      return true
    } catch (error: any) {
      console.error('Form submission error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to save quote'
      })
      return false
    }
  }

  return { submitQuote }
}

async function updateQuote(
  quoteId: string, 
  values: QuoteFormValues, 
  subtotal: number, 
  taxAmount: number, 
  total: number
) {
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
      total,
      status: values.status
    })
    .eq('id', quoteId)

  if (quoteError) {
    console.error('Error updating quote:', quoteError)
    throw new Error('Failed to update quote')
  }

  // Delete existing quote items
  const { error: deleteError } = await supabase
    .from("quote_items")
    .delete()
    .eq('quote_id', quoteId)

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
          quote_id: quoteId,
          service_name: item.service_name,
          description: item.description || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          service_id: item.service_id || null // Set to null if empty string or undefined
        }))
      )

    if (itemsError) {
      console.error('Error creating quote items:', itemsError)
      throw new Error('Failed to create quote items')
    }
  }
}

async function createQuote(
  values: QuoteFormValues, 
  subtotal: number, 
  taxAmount: number, 
  total: number
) {
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
      status: values.status
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
          unit_price: item.unit_price,
          service_id: item.service_id || null // Set to null if empty string or undefined
        }))
      )

    if (itemsError) {
      console.error('Error creating quote items:', itemsError)
      throw new Error('Failed to create quote items')
    }
  }
}
