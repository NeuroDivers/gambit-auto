
import { Loader2, Pencil, FileText } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { EditWorkOrderDialog } from "./EditWorkOrderDialog"
import { useAdminStatus } from "@/hooks/useAdminStatus"
import { WorkOrderFilters } from "./components/WorkOrderFilters"
import { AssignmentSheet } from "./components/AssignmentSheet"
import { useWorkOrderListData } from "./hooks/useWorkOrderListData"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

export function WorkOrderList() {
  const { isAdmin } = useAdminStatus()
  const navigate = useNavigate()
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
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
    handleAssignBay
  } = useWorkOrderListData()

  const handleCreateInvoice = async (workOrderId: string) => {
    try {
      const { data, error } = await supabase.rpc(
        'create_invoice_from_work_order',
        { work_order_id: workOrderId }
      )

      if (error) throw error

      toast.success("Invoice created successfully")
      navigate(`/admin/invoices/${data}/edit`)
    } catch (error: any) {
      console.error('Error creating invoice:', error)
      toast.error("Failed to create invoice")
    }
  }

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
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Bay</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workOrders && workOrders.length > 0 ? (
              workOrders.map((workOrder) => (
                <TableRow key={workOrder.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {workOrder.first_name} {workOrder.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{workOrder.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
                  </TableCell>
                  <TableCell>
                    <Badge variant={workOrder.status === 'completed' ? 'default' : 'secondary'}>
                      {workOrder.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`cursor-pointer ${!workOrder.assigned_to ? 'text-muted-foreground' : ''}`}
                      onClick={() => setAssignWorkOrder(workOrder)}
                    >
                      {workOrder.assigned_to ? (
                        `${workOrder.assigned_to.first_name} ${workOrder.assigned_to.last_name}`
                      ) : (
                        "Unassigned"
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`cursor-pointer ${!workOrder.service_bays ? 'text-muted-foreground' : ''}`}
                      onClick={() => setAssignBayWorkOrder(workOrder)}
                    >
                      {workOrder.service_bays ? (
                        workOrder.service_bays.name
                      ) : (
                        "Not assigned"
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(workOrder.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCreateInvoice(workOrder.id)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedWorkOrder(workOrder)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No work orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedWorkOrder && (
        <EditWorkOrderDialog
          workOrder={selectedWorkOrder}
          open={!!selectedWorkOrder}
          onOpenChange={(open) => !open && setSelectedWorkOrder(null)}
        />
      )}

      <AssignmentSheet
        title="Assign User"
        open={!!assignWorkOrder}
        onOpenChange={(open) => !open && setAssignWorkOrder(null)}
        items={assignableUsers?.map(user => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`
        })) || []}
        onAssign={handleAssignUser}
      />

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
