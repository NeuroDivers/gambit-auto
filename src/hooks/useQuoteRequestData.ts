
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { QuoteRequest } from "./useQuoteRequestActions"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function useQuoteRequestData() {
  const navigate = useNavigate()

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
        .select("*")
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
    isLoading
  }
}

