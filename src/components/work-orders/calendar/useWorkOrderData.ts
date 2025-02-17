
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

export function useWorkOrderData() {
  const navigate = useNavigate()

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
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle()

        if (clientError) throw clientError
        if (!clientData) {
          // Handle case where no client is found
          toast.error("No client account found. Please contact support.")
          navigate("/auth")
          return []
        }

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
