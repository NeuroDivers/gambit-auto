
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { QuoteRequest } from "./useQuoteRequestActions"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function useQuoteRequestData() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
      if (error) throw error
      return data
    },
  })

  const { data: quoteRequests, isLoading } = useQuery({
    queryKey: ["quoteRequests"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("quote_requests")
        .select(`
          id,
          status,
          vehicle_make,
          vehicle_model,
          vehicle_year,
          vehicle_vin,
          description,
          created_at,
          estimated_amount,
          client_response,
          service_ids,
          media_urls,
          client_id
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as QuoteRequest[]
    },
    meta: {
      onError: (error: Error) => {
        console.error("Error fetching quotes:", error)
        if (error.message === "Not authenticated") {
          navigate("/auth")
        } else {
          toast.error("Failed to load quote requests")
        }
      }
    }
  })

  return {
    services,
    quoteRequests,
    isLoading,
    queryClient
  }
}

