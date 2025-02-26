
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { WorkOrder } from "../types"
import { toast } from "sonner"

export function useWorkOrderListData() {
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
    },
    retry: 2 // Retry failed requests up to 2 times
  })

  const { data: serviceBays } = useQuery({
    queryKey: ["service-bays"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("service_bays")
          .select("*")
          .eq("status", "available")

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
      const { error } = await supabase
        .from("work_orders")
        .update({ assigned_bay_id: bayId })
        .eq("id", workOrderId)

      if (error) throw error

      toast.success('Bay assigned successfully')
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
