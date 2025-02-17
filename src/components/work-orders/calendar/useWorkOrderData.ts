
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function useWorkOrderData() {
  const { data: roleData } = useQuery({
    queryKey: ["clientRole"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { isClient: false }

      const { data } = await supabase.rpc('has_role_by_name', {
        user_id: user.id,
        role_name: 'client'
      })
      
      return { isClient: !!data }
    }
  })

  const { data: workOrders = [], isLoading } = useQuery({
    queryKey: ["workOrders", roleData?.isClient],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      if (roleData?.isClient) {
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
        return data || []
      } else {
        // Admin view - get all work orders
        const { data, error } = await supabase
          .from("work_orders")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        return data || []
      }
    },
    enabled: roleData !== undefined
  })

  return {
    data: workOrders,
    isLoading
  }
}
