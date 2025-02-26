
import { Loader2 } from "lucide-react"
import { EditWorkOrderDialog } from "./EditWorkOrderDialog"
import { WorkOrderFilters } from "./components/WorkOrderFilters"
import { AssignmentSheet } from "./components/AssignmentSheet"
import { useWorkOrderListData } from "./hooks/useWorkOrderListData"
import { useNavigate } from "react-router-dom"
import { WorkOrderTable } from "./components/WorkOrderTable"
import { WorkOrderPagination } from "./components/WorkOrderPagination"
import { useIsMobile } from "@/hooks/use-mobile"
import { WorkOrderMobileList } from "./components/WorkOrderMobileList"

export function WorkOrderList() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const {
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
    workOrders,
    isLoading,
    error,
    assignableUsers,
    serviceBays,
    handleAssignUser,
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

  return (
    <div className="space-y-4">
      <WorkOrderFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        assignmentFilter={assignmentFilter}
        onAssignmentFilterChange={setAssignmentFilter}
      />

      {isMobile ? (
        <WorkOrderMobileList
          workOrders={workOrders}
          onAssignBay={setAssignBayWorkOrder}
          onEdit={setSelectedWorkOrder}
          onCreateInvoice={handleCreateInvoice}
        />
      ) : (
        <WorkOrderTable
          workOrders={workOrders}
          onAssignBay={setAssignBayWorkOrder}
          onEdit={setSelectedWorkOrder}
          onCreateInvoice={handleCreateInvoice}
        />
      )}

      <WorkOrderPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {selectedWorkOrder && (
        <EditWorkOrderDialog
          workOrder={selectedWorkOrder}
          open={!!selectedWorkOrder}
          onOpenChange={(open) => !open && setSelectedWorkOrder(null)}
        />
      )}

      <AssignmentSheet
        title="Assign Bay"
        open={!!assignBayWorkOrder}
        onOpenChange={(open) => !open && setAssignBayWorkOrder(null)}
        items={serviceBays?.map(bay => ({
          id: bay.id,
          name: bay.name
        })) || []}
        onAssign={handleAssignBay}
      />
    </div>
  )
}
