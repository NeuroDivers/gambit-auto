
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type CustomerHistoryItem = {
  id: string
  event_type: string
  event_date: string
  description: string
  amount: number | null
  related_entity_type: string | null
  related_entity_id: string | null
}

export function useCustomerHistory(customerId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["customer_history", customerId],
    queryFn: async () => {
      if (!customerId) return []
      
      const { data, error } = await supabase
        .from("customer_history")
        .select("*")
        .eq("customer_id", customerId)
        .order("event_date", { ascending: false })
        
      if (error) {
        console.error("Error fetching customer history:", error)
        throw error
      }
      
      return data as CustomerHistoryItem[]
    },
    enabled: !!customerId,
  })

  return {
    history: data || [],
    isLoading,
    error,
  }
}
