
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useWorkOrderData() {
  // First get the current user's role
  const { data: isClient } = useQuery({
    queryKey: ["isClient"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data } = await supabase.rpc('has_role_by_name', {
        user_id: user.id,
        role_name: 'client'
      })
      
      return !!data
    }
  })

  return useQuery({
    queryKey: ["workOrders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      if (isClient) {
        // Get client ID first
        const { data: clientData } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", user.id)
          .single()

        if (!clientData) throw new Error("No client found")

        // Then get client's work orders
        const { data, error } = await supabase
          .from("work_orders")
          .select("*")
          .eq("client_id", clientData.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        return data
      } else {
        // Admin view - get all work orders
        const { data, error } = await supabase
          .from("work_orders")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        return data
      }
    },
    enabled: isClient !== undefined
  })
}
