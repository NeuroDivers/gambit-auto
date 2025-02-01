import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { QuoteRequest } from "../types"

export function useQuoteData() {
  return useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_requests")
        .select(`
          *,
          quote_request_services (
            service_types (
              name
            )
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as QuoteRequest[]
    },
  })
}