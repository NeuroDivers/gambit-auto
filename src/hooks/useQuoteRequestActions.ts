
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import type { QuoteRequest } from "@/types/quote-request"

export function useQuoteRequestActions() {
  const queryClient = useQueryClient()

  const handleResponseMutation = useMutation({
    mutationFn: async ({ id, response }: { id: string; response: QuoteRequest['client_response'] }) => {
      const { error } = await supabase
        .from("quote_requests")
        .update({ client_response: response })
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quoteRequests"] })
      toast.success("Response submitted successfully")
    },
    onError: (error: Error) => {
      console.error("Error submitting response:", error)
      toast.error("Failed to submit response")
    }
  })

  return {
    handleResponseMutation
  }
}
