
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
      if (!user) {
        console.log("No user found in clientRole check")
        return { isClient: false }
      }

      const { data, error } = await supabase.rpc('has_role_by_name', {
        user_id: user.id,
        role_name: 'client'
      })
      
      console.log("Client role check result:", { data, error })
      return { isClient: !!data }
    }
  })

  const { data: workOrders = [], isLoading, refetch } = useQuery({
    queryKey: ["workOrders", roleData?.isClient],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log("No user found in workOrders fetch")
        throw new Error("No user found")
      }

      console.log("Fetching work orders for user:", user.id, "isClient:", roleData?.isClient)

      if (roleData?.isClient) {
        // Get client ID first
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle()

        console.log("Client lookup result:", { clientData, clientError })

        if (clientError) throw clientError
        if (!clientData) {
          toast.error("No client account found. Please contact support.")
          navigate("/auth")
          return []
        }

        // Then get client's work orders
        const { data, error } = await supabase
          .from("work_orders")
          .select(`
            *,
            service_bays!fk_work_orders_assigned_bay (
              name
            )
          `)
          .eq("client_id", clientData.id)
          .order("start_time", { ascending: true })

        console.log("Work orders fetch result:", { data, error, clientId: clientData.id })

        if (error) throw error
        return data || []
      } else {
        // Admin view - get all work orders
        const { data, error } = await supabase
          .from("work_orders")
          .select(`
            *,
            service_bays!fk_work_orders_assigned_bay (
              name
            )
          `)
          .order("start_time", { ascending: true })

        if (error) throw error
        return data || []
      }
    },
    enabled: roleData !== undefined
  })

  return {
    data: workOrders,
    isLoading,
    refetch
  }
}
