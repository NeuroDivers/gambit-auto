
import { useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { WorkOrder } from "../types"

export function useWorkOrderQueries(page: number, pageSize: number) {
  const fetchWorkOrders = useCallback(async () => {
    try {
      const { count } = await supabase
        .from('work_orders')
        .select('*', { count: 'exact', head: true })

      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          service_bays!fk_work_orders_assigned_bay (
            name
          ),
          assigned_to:profiles!assigned_profile_id (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (error) throw error

      return {
        workOrders: data as WorkOrder[],
        totalCount: count || 0
      }
    } catch (error) {
      console.error('Error fetching work orders:', error)
      throw error
    }
  }, [page, pageSize])

  const { data: workOrdersData, isLoading, error } = useQuery({
    queryKey: ['work-orders', page, pageSize],
    queryFn: fetchWorkOrders
  })

  const { data: assignableUsers } = useQuery({
    queryKey: ['assignable-users'],
    queryFn: async () => {
      const { data: assignableRoles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .eq('can_be_assigned_work_orders', true)

      if (rolesError) throw rolesError

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role_id,
          roles (
            id,
            name,
            nicename
          )
        `)
        .in('role_id', assignableRoles.map(role => role.id))

      if (error) throw error
      return profiles
    }
  })

  const { data: serviceBays } = useQuery({
    queryKey: ['service-bays'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_bays')
        .select('*')
        .eq('status', 'available')
        .order('name')
      
      if (error) throw error
      return data
    }
  })

  return {
    workOrdersData,
    isLoading,
    error,
    assignableUsers,
    serviceBays
  }
}
