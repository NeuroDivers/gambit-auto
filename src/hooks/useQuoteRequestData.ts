
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { ServiceTypesTable } from "@/integrations/supabase/types/service-types"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import type { QuoteRequest } from "@/types/quote-request"

export function useQuoteRequestData() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      if (!session) throw new Error("Not authenticated")
      return session
    }
  })

  const { data: services } = useQuery({
    queryKey: ["services"],
    enabled: !!session,
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
    enabled: !!session?.user?.id,
    queryFn: async () => {
      if (!session?.user?.id) throw new Error("Not authenticated")

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
        .eq("client_id", session.user.id)
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
