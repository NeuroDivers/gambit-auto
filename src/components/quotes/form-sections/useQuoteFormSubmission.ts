import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import * as z from "zod"
import { formSchema } from "../QuoteRequestFormFields"

type UseQuoteFormSubmissionProps = {
  initialData?: {
    id: string
    media_url?: string | null
  }
  mediaUrl: string | null
  onSuccess?: () => void
}

export function useQuoteFormSubmission({ 
  initialData, 
  mediaUrl,
  onSuccess 
}: UseQuoteFormSubmissionProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
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
          .eq("id", initialData.id)

        if (quoteError) throw quoteError

        // Update services
        const { error: deleteError } = await supabase
          .from("quote_request_services")
          .delete()
          .eq("quote_request_id", initialData.id)

        if (deleteError) throw deleteError

        const { error: servicesError } = await supabase
          .from("quote_request_services")
          .insert(
            data.service_ids.map(serviceId => ({
              quote_request_id: initialData.id,
              service_id: serviceId
            }))
          )

        if (servicesError) throw servicesError

        toast({
          title: "Success",
          description: "Quote request has been updated successfully.",
        })
      } else {
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

        const { error: servicesError } = await supabase
          .from("quote_request_services")
          .insert(
            data.service_ids.map(serviceId => ({
              quote_request_id: newQuote.id,
              service_id: serviceId
            }))
          )

        if (servicesError) throw servicesError

        toast({
          title: "Success",
          description: "Your quote request has been submitted successfully.",
        })

        if (onSuccess) {
          onSuccess()
        }
      }

      queryClient.invalidateQueries({ queryKey: ["quoteRequests"] })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return { handleSubmit }
}