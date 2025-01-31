import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import type { QuoteRequestFormValues } from "../QuoteRequestFormFields"

export function useQuoteUpdate() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const updateQuote = async (
    quoteId: string, 
    data: QuoteRequestFormValues, 
    mediaUrl: string | null
  ) => {
    // Update existing quote request
    const { error: quoteError } = await supabase
      .from("quote_requests")
      .update({
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
      .eq("id", quoteId)

    if (quoteError) throw quoteError

    // Update services
    const { error: deleteError } = await supabase
      .from("quote_request_services")
      .delete()
      .eq("quote_request_id", quoteId)

    if (deleteError) throw deleteError

    const { error: servicesError } = await supabase
      .from("quote_request_services")
      .insert(
        data.service_ids.map(serviceId => ({
          quote_request_id: quoteId,
          service_id: serviceId
        }))
      )

    if (servicesError) throw servicesError

    toast({
      title: "Success",
      description: "Quote request has been updated successfully.",
    })

    queryClient.invalidateQueries({ queryKey: ["quoteRequests"] })
  }

  return { updateQuote }
}