
import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { WorkOrder } from "../types"
import { toast } from "sonner"

export function useWorkOrderListData() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [assignmentFilter, setAssignmentFilter] = useState<string>("all")
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)
  const [assignBayWorkOrder, setAssignBayWorkOrder] = useState<WorkOrder | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const { data: workOrders, isLoading, error } = useQuery({
    queryKey: ["workOrders", searchTerm, statusFilter, assignmentFilter, page],
    queryFn: async () => {
      try {
        let query = supabase
          .from("work_orders")
          .select(`
            *,
            service_bays!fk_work_orders_assigned_bay (
              id,
              name
            )
          `)
          .order("created_at", { ascending: false })

        if (searchTerm) {
          query = query.or(
            `first_name.ilike.%${searchTerm}%,` +
            `last_name.ilike.%${searchTerm}%,` +
            `email.ilike.%${searchTerm}%,` +
            `phone_number.ilike.%${searchTerm}%`
          )
        }

        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter)
        }

        if (assignmentFilter === "assigned") {
          query = query.not("assigned_bay_id", "is", null)
        } else if (assignmentFilter === "unassigned") {
          query = query.is("assigned_bay_id", null)
        }

        const { data, error } = await query

        if (error) {
          console.error('Work orders fetch error:', error)
          throw new Error(`Failed to fetch work orders: ${error.message}`)
        }

        return data || []
      } catch (err) {
        console.error('Work orders fetch error:', err)
        toast.error('Failed to load work orders')
        throw err
      }
    }
  })

  const { data: serviceBays } = useQuery({
    queryKey: ["service-bays"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("service_bays")
          .select("*")
          .eq("status", "available")
          .order('name')
      
        if (error) {
          console.error('Service bays fetch error:', error)
          throw new Error(`Failed to fetch service bays: ${error.message}`)
        }

        return data || []
      } catch (err) {
        console.error('Service bays fetch error:', err)
        toast.error('Failed to load service bays')
        throw err
      }
    }
  })

  const handleAssignBay = async (workOrderId: string, bayId: string | null) => {
    try {
      console.log('Assigning bay:', { workOrderId, bayId })
      const { data, error } = await supabase
        .from('work_orders')
        .update({ 
          assigned_bay_id: bayId === "unassigned" ? null : bayId,
          updated_at: new Date().toISOString()
        })
        .eq("id", workOrderId)
        .select(`*, service_bays!fk_work_orders_assigned_bay (id, name)`)
        .single()

      if (error) {
        console.error('Bay assignment error:', error)
        throw error
      }

      console.log('Bay assignment result:', data)
      
      // Invalidate the queries to refetch the latest data
      await queryClient.invalidateQueries({ queryKey: ["workOrders"] })
      await queryClient.invalidateQueries({ queryKey: ["service-bays"] })
      
      toast.success('Bay assigned successfully')
      
      // Clear the assignment modal state
      setAssignBayWorkOrder(null)
    } catch (err) {
      console.error('Bay assignment error:', err)
      toast.error('Failed to assign bay')
      throw err
    }
  }

  const handleCreateInvoice = async (workOrderId: string) => {
    // Logic to create an invoice
  }

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    assignmentFilter,
    setAssignmentFilter,
    selectedWorkOrder,
    setSelectedWorkOrder,
    assignBayWorkOrder,
    setAssignBayWorkOrder,
    workOrders,
    isLoading,
    error,
    serviceBays,
    handleAssignBay,
    handleCreateInvoice,
    page,
    setPage,
    totalPages
  }
}
