
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { ServiceTypesTable } from "@/integrations/supabase/types/service-types"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export type QuoteRequest = {
  id: string
  client_id: string
  status: string
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_year: number | null
  vehicle_vin: string | null
  description: string | null
  service_ids: string[]
  service_details: Record<string, any> | null
  service_estimates: Record<string, number> | null
  estimated_amount: number | null
  client_response: string | null
  created_at: string
  media_urls: string[] | null
}

export function useQuoteRequestData() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .eq("status", "active")
      
      if (error) throw error
      return data as ServiceTypesTable["Row"][]
    }
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
          client_id,
          status,
          vehicle_make,
          vehicle_model,
          vehicle_year,
          vehicle_vin,
          description,
          service_ids,
          service_details,
          service_estimates,
          estimated_amount,
          client_response,
          created_at,
          media_urls
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
