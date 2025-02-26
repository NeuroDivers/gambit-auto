import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { WorkOrder } from "../types"

export function useWorkOrderListData() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [assignmentFilter, setAssignmentFilter] = useState<string>("all")
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)
  const [assignBayWorkOrder, setAssignBayWorkOrder] = useState<WorkOrder | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch work orders with filters
  const { data: workOrders, isLoading, error } = useQuery({
    queryKey: ["workOrders", searchTerm, statusFilter, assignmentFilter, page],
    queryFn: async () => {
      let query = supabase
        .from("work_orders")
        .select(`
          *,
          service_bays (
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

      if (error) throw error
      return data
    }
  })

  // Fetch service bays
  const { data: serviceBays } = useQuery({
    queryKey: ["service-bays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("*")
        .eq("status", "available")

      if (error) throw error
      return data
    }
  })

  const handleAssignBay = async (workOrderId: string, bayId: string) => {
    const { error } = await supabase
      .from("work_orders")
      .update({ assigned_bay_id: bayId })
      .eq("id", workOrderId)

    if (error) throw error
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
