
import { Loader2 } from "lucide-react"
import { WorkOrderFilters } from "./components/WorkOrderFilters"
import { AssignmentSheet } from "./components/AssignmentSheet"
import { useWorkOrderListData } from "./hooks/useWorkOrderListData"
import { WorkOrderTable } from "./components/WorkOrderTable"
import { WorkOrderPagination } from "./components/WorkOrderPagination"
import { useIsMobile } from "@/hooks/use-mobile"
import { WorkOrderMobileList } from "./components/WorkOrderMobileList"
import { useNavigate } from "react-router-dom"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { WorkOrder } from "./types"
import { memo } from "react"
import { useWorkOrderSubscription } from "@/hooks/useWorkOrderSubscription"

// Using memo to prevent unnecessary re-renders
const MemoizedWorkOrderFilters = memo(WorkOrderFilters)
const MemoizedWorkOrderPagination = memo(WorkOrderPagination)

export function WorkOrderList() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  // Use the subscription hook to listen for real-time updates
  useWorkOrderSubscription()
  
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    assignmentFilter,
    setAssignmentFilter,
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
  } = useWorkOrderListData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading work orders. Please try again later.
      </div>
    )
  }

  const handleEdit = (workOrder: WorkOrder) => {
    navigate(`/work-orders/${workOrder.id}/edit`)
  }

  // Handle create invoice action 
  const onCreateInvoice = (workOrder: WorkOrder) => {
    handleCreateInvoice(workOrder.id)
  }

  return (
    <div className="space-y-4">
      <TooltipProvider>
        <MemoizedWorkOrderFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          assignmentFilter={assignmentFilter}
          onAssignmentFilterChange={setAssignmentFilter}
        />
      </TooltipProvider>

      {isMobile ? (
        <WorkOrderMobileList
          workOrders={workOrders}
          onAssignBay={setAssignBayWorkOrder}
          onEdit={handleEdit}
          onCreateInvoice={onCreateInvoice}
        />
      ) : (
        <WorkOrderTable
          workOrders={workOrders}
          onAssignBay={setAssignBayWorkOrder}
          onEdit={handleEdit}
          onCreateInvoice={onCreateInvoice}
        />
      )}

      <MemoizedWorkOrderPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <AssignmentSheet
        title="Assign Bay"
        open={!!assignBayWorkOrder}
        onOpenChange={(open) => !open && setAssignBayWorkOrder(null)}
        items={serviceBays?.map(bay => ({
          id: bay.id,
          name: bay.name
        })) || []}
        onAssign={(bayId) => assignBayWorkOrder && handleAssignBay(assignBayWorkOrder.id, bayId || null)}
      />
    </div>
  )
}
