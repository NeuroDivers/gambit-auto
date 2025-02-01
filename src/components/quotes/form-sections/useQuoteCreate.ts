import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import type { QuoteRequestFormValues } from "../QuoteRequestFormFields"

export function useQuoteCreate() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const createQuote = async (data: QuoteRequestFormValues, mediaUrl: string | null) => {
    // Create new quote request
    const { data: newQuote, error: quoteError } = await supabase
      .from("quote_requests")
      .insert({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number,
        contact_preference: data.contact_preference,
        vehicle_make: data.vehicle_make,
        vehicle_model: data.vehicle_model,
        vehicle_year: data.vehicle_year,
        vehicle_serial: data.vehicle_serial,
        additional_notes: data.additional_notes,
        media_url: mediaUrl,
        timeframe: data.timeframe,
        price: data.price,
      })
      .select()
      .single()

    if (quoteError) throw quoteError

    // Insert services only if we have a valid quote request ID
    if (newQuote?.id) {
      const { error: servicesError } = await supabase
        .from("quote_request_services")
        .insert(
          data.service_ids.map(serviceId => ({
            quote_request_id: newQuote.id,
            service_id: serviceId
          }))
        )

      if (servicesError) throw servicesError
    }

    toast({
      title: "Success",
      description: "Your quote request has been submitted successfully.",
    })

    queryClient.invalidateQueries({ queryKey: ["quoteRequests"] })
    
    return newQuote
  }

  return { createQuote }
}