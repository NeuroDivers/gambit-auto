
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

export type QuoteRequest = {
  id: string
  status: "pending" | "estimated" | "accepted" | "rejected" | "converted"
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_vin: string
  description: string
  created_at: string
  estimated_amount: number | null
  service_estimates: Record<string, number> | null
  client_response: "accepted" | "rejected" | null
  service_ids: string[]
  media_urls: string[]
}

export function useQuoteRequestActions() {
  const queryClient = useQueryClient()

  const handleResponseMutation = useMutation({
    mutationFn: async ({ id, response }: { id: string, response: "accepted" | "rejected" }) => {
      const { error } = await supabase
        .from("quote_requests")
        .update({ 
          client_response: response,
          status: response === "accepted" ? "accepted" : "rejected"
        })
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quoteRequests"] })
      toast.success("Response submitted successfully")
    },
    onError: (error) => {
      toast.error("Failed to submit response: " + error.message)
    }
  })

  return {
    handleResponseMutation
  }
}
