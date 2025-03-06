
import { Loader2 } from "lucide-react"
import { WorkOrderFilters } from "./components/WorkOrderFilters"
import { AssignmentSheet } from "./components/AssignmentSheet"
import { useWorkOrderListData } from "./hooks/useWorkOrderListData"
import { WorkOrderTable } from "./components/WorkOrderTable"
import { WorkOrderPagination } from "./components/WorkOrderPagination"
import { useIsMobile } from "@/hooks/use-mobile"
import { WorkOrderMobileList } from "./components/WorkOrderMobileList"
import { useNavigate } from "react-router-dom"
import { WorkOrderDetailsDialog } from "./calendar/WorkOrderDetailsDialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { WorkOrder } from "./types"

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
    assignBayWorkOrder,
    setAssignBayWorkOrder,
    selectedWorkOrder,
    setSelectedWorkOrder,
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

  const handleEdit = (workOrder: WorkOrder) => {
    navigate(`/work-orders/${workOrder.id}/edit`)
  }

  // Handle create invoice action 
  const onCreateInvoice = (workOrder: WorkOrder) => {
    handleCreateInvoice(workOrder.id)
  }

  // Always render the filter section
  const renderFilters = () => (
    <TooltipProvider>
      <WorkOrderFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        assignmentFilter={assignmentFilter}
        onAssignmentFilterChange={setAssignmentFilter}
      />
    </TooltipProvider>
  )

  // Render content based on loading/error state
  const renderContent = () => {
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
      <>
        {isMobile ? (
          <WorkOrderMobileList
            workOrders={workOrders}
            onAssignBay={setAssignBayWorkOrder}
            onEdit={handleEdit}
            onCreateInvoice={onCreateInvoice}
            onViewDetails={setSelectedWorkOrder}
          />
        ) : (
          <WorkOrderTable
            workOrders={workOrders}
            onAssignBay={setAssignBayWorkOrder}
            onEdit={handleEdit}
            onCreateInvoice={onCreateInvoice}
            onViewDetails={setSelectedWorkOrder}
          />
        )}

        <WorkOrderPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter section is always visible */}
      {renderFilters()}
      
      {/* Only this section reloads when filtering */}
      <div id="work-orders-content" className="space-y-4">
        {renderContent()}
      </div>

      {/* Modals and sheets */}
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
      
      {selectedWorkOrder && (
        <WorkOrderDetailsDialog 
          workOrder={selectedWorkOrder} 
          open={!!selectedWorkOrder} 
          onOpenChange={(open) => !open && setSelectedWorkOrder(null)} 
        />
      )}
    </div>
  )
}
