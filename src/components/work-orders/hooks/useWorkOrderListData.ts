
import { useState } from "react"
import { WorkOrder } from "../types"
import { useWorkOrderQueries } from "./useWorkOrderQueries"
import { useWorkOrderSubscription } from "./useWorkOrderSubscription"
import { useWorkOrderAssignment } from "./useWorkOrderAssignment"
import { useWorkOrderInvoice } from "./useWorkOrderInvoice"

export function useWorkOrderListData() {
  // Initialize all state first
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [assignmentFilter, setAssignmentFilter] = useState<string>("all")
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)
  const [assignWorkOrder, setAssignWorkOrder] = useState<WorkOrder | null>(null)
  const [assignBayWorkOrder, setAssignBayWorkOrder] = useState<WorkOrder | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Initialize hooks unconditionally
  const { workOrdersData, isLoading, error, assignableUsers, serviceBays } = useWorkOrderQueries(page, pageSize)
  const { handleAssignUser, handleAssignBay } = useWorkOrderAssignment()
  const { handleCreateInvoice } = useWorkOrderInvoice()

  // Set up subscriptions after other hooks
  useWorkOrderSubscription()

  // Filter work orders only if we have data
  const filteredWorkOrders = workOrdersData?.workOrders.filter(order => {
    const matchesSearch = (
      order.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicle_make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicle_model?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    const matchesAssignment = (() => {
      switch (assignmentFilter) {
        case "unassigned-user":
          return !order.assigned_profile_id
        case "assigned-user":
          return !!order.assigned_profile_id
        case "unassigned-bay":
          return !order.assigned_bay_id
        case "assigned-bay":
          return !!order.assigned_bay_id
        default:
          return true
      }
    })()

    return matchesSearch && matchesStatus && matchesAssignment
  }) || []

  const totalPages = workOrdersData ? Math.ceil(workOrdersData.totalCount / pageSize) : 0

  // Wrap assignment handlers
  const handleAssignUserWrapper = async (userId: string | null) => {
    if (!assignWorkOrder) return
    if (await handleAssignUser(assignWorkOrder.id, userId)) {
      setAssignWorkOrder(null)
    }
  }

  const handleAssignBayWrapper = async (bayId: string | null) => {
    if (!assignBayWorkOrder) return
    if (await handleAssignBay(assignBayWorkOrder.id, bayId)) {
      setAssignBayWorkOrder(null)
    }
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
    assignWorkOrder,
    setAssignWorkOrder,
    assignBayWorkOrder,
    setAssignBayWorkOrder,
    workOrders: filteredWorkOrders,
    isLoading,
    error,
    assignableUsers,
    serviceBays,
    handleAssignUser: handleAssignUserWrapper,
    handleAssignBay: handleAssignBayWrapper,
    handleCreateInvoice,
    page,
    setPage,
    totalPages
  }
}
