import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { WorkOrder } from "../types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { LoadingScreen } from "@/components/shared/LoadingScreen"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Receipt } from "lucide-react"
import { useWorkOrderInvoice } from "../hooks/useWorkOrderInvoice"
import React, { useMemo } from "react"
import { getWorkOrderStatusVariant } from "@/components/shared/BadgeVariants"

type WorkOrderDetailsDialogProps = {
  workOrder: WorkOrder
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const WorkOrderDetailsDialog = React.memo(function WorkOrderDetailsDialog({
  workOrder,
  open,
  onOpenChange,
}: WorkOrderDetailsDialogProps) {
  const queryClient = useQueryClient()
  const { createInvoice, isCreatingInvoice } = useWorkOrderInvoice()

  // Fetch work order with services
  const { data: workOrderDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ["workOrder", workOrder.id],
    queryFn: async () => {
      // Add a small delay to reduce perception of slowness by showing loading indicator
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const { data, error } = await supabase
        .from("work_orders")
        .select(`
          *,
          service_bays!fk_work_orders_assigned_bay (
            id,
            name
          ),
          work_order_services (
            id,
            service_id,
            quantity,
            unit_price,
            assigned_profile_id,
            commission_rate,
            commission_type,
            service_types (
              id,
              name,
              description
            ),
            profiles (
              id,
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq("id", workOrder.id)
        .single()

      if (error) throw error
      return data
    },
    enabled: open,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Fetch available service bays when needed (prefetched and cached)
  const { data: serviceBays, isLoading: loadingBays } = useQuery({
    queryKey: ["service-bays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_bays')
        .select('*')
        .eq('status', 'available')
        .order('name')
      
      if (error) throw error
      return data
    },
    enabled: open,
    staleTime: 1000 * 60 * 15, // 15 minutes
  })

  // Mutation to update work order assignments
  const updateAssignmentsMutation = useMutation({
    mutationFn: async ({ bayId }: { bayId?: string | null }) => {
      const { error } = await supabase
        .from('work_orders')
        .update({ 
          assigned_bay_id: bayId
        })
        .eq('id', workOrder.id)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success("Work order assignments updated")
      queryClient.invalidateQueries({ queryKey: ["workOrders"] })
      queryClient.invalidateQueries({ queryKey: ["workOrder", workOrder.id] })
    },
    onError: (error) => {
      console.error('Error updating assignments:', error)
      toast.error("Failed to update assignments")
    }
  })

  // Function to handle creating an invoice
  const handleCreateInvoice = () => {
    createInvoice(workOrder.id)
  }

  const getStatusBadge = (status: string) => {
    let badgeVariant: "pending" | "in_progress" | "completed" | "cancelled" | "invoiced" | "default" = "default";
    let label = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    
    // Map status to badge variant
    if (status === "pending" || status === "approved") {
      badgeVariant = "pending";
      label = status === "approved" ? "Pending" : "Pending";
    } else if (status === "in_progress") {
      badgeVariant = "in_progress";
    } else if (status === "completed") {
      badgeVariant = "completed";
    } else if (status === "cancelled" || status === "rejected") {
      badgeVariant = "cancelled";
      label = status === "rejected" ? "Cancelled" : "Cancelled";
    } else if (status === "invoiced") {
      badgeVariant = "invoiced";
    }
    
    return <Badge variant={getWorkOrderStatusVariant(workOrder.status)}>
      {workOrder.status.replace('_', ' ')}
    </Badge>
  }

  const totalServiceCost = useMemo(() => {
    return workOrderDetails?.work_order_services?.reduce(
      (sum, service) => sum + (service.quantity * service.unit_price), 
      0
    ) || 0
  }, [workOrderDetails?.work_order_services]);

  if (loadingDetails || loadingBays) {
    return <LoadingScreen />
  }

  // Don't allow editing if the work order is invoiced
  const isInvoiced = workOrderDetails?.status === 'invoiced';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Work Order Details
            {workOrderDetails?.status && getStatusBadge(workOrderDetails.status)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Customer Information</h3>
              <div className="grid grid-cols-1 gap-2 mt-2">
                <div>
                  <p className="font-medium">{workOrderDetails?.customer_first_name} {workOrderDetails?.customer_last_name}</p>
                  <p className="text-sm text-muted-foreground">{workOrderDetails?.customer_email}</p>
                  <p className="text-sm text-muted-foreground">{workOrderDetails?.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm">Created: {workOrderDetails?.created_at ? formatDate(workOrderDetails.created_at) : '-'}</p>
                  {workOrderDetails?.updated_at && (
                    <p className="text-sm">Last Updated: {formatDate(workOrderDetails.updated_at)}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Vehicle Information</h3>
              <div className="mt-2">
                <p>{workOrderDetails?.vehicle_year} {workOrderDetails?.vehicle_make} {workOrderDetails?.vehicle_model}</p>
                {workOrderDetails?.vehicle_vin && (
                  <p className="text-sm text-muted-foreground">VIN: {workOrderDetails.vehicle_vin}</p>
                )}
              </div>
            </div>

            {/* Assign Bay */}
            <div className="space-y-2">
              <Label>Service Bay Assignment</Label>
              <Select
                value={workOrderDetails?.assigned_bay_id || "none"}
                onValueChange={(value) => {
                  updateAssignmentsMutation.mutate({
                    bayId: value === "none" ? null : value
                  })
                }}
                disabled={isInvoiced}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service bay" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {serviceBays?.map((bay) => (
                    <SelectItem key={bay.id} value={bay.id}>
                      {bay.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes section */}
            {workOrderDetails?.additional_notes && (
              <div>
                <h3 className="text-lg font-semibold">Notes</h3>
                <p className="text-sm mt-1 whitespace-pre-line">{workOrderDetails.additional_notes}</p>
              </div>
            )}

            {/* Schedule information */}
            {(workOrderDetails?.start_time || workOrderDetails?.estimated_duration) && (
              <div>
                <h3 className="text-lg font-semibold">Schedule Information</h3>
                <div className="grid grid-cols-1 gap-1 mt-2">
                  {workOrderDetails.start_time && (
                    <p className="text-sm">
                      Start Time: {new Date(workOrderDetails.start_time).toLocaleString()}
                    </p>
                  )}
                  {workOrderDetails.end_time && (
                    <p className="text-sm">
                      End Time: {new Date(workOrderDetails.end_time).toLocaleString()}
                    </p>
                  )}
                  {workOrderDetails.estimated_duration && (
                    <p className="text-sm">
                      Estimated Duration: {workOrderDetails.estimated_duration} minutes
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Services Information */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Services</h3>
                <p className="font-medium">Total: {formatCurrency(totalServiceCost)}</p>
              </div>
              
              <div className="space-y-2 mt-2">
                {workOrderDetails?.work_order_services?.length ? (
                  workOrderDetails.work_order_services.map((service) => (
                    <div key={service.id} className="border rounded-md p-3">
                      <div className="flex justify-between">
                        <div className="font-medium">{service.service_types?.name}</div>
                        <div>{formatCurrency(service.unit_price * service.quantity)}</div>
                      </div>
                      {service.service_types?.description && (
                        <p className="text-sm text-muted-foreground mt-1">{service.service_types.description}</p>
                      )}
                      <div className="flex justify-between mt-1 text-sm">
                        <div>{service.quantity} × {formatCurrency(service.unit_price)}</div>
                        <div>
                          {service.profiles?.first_name && (
                            <span className="text-muted-foreground">
                              Assigned: {service.profiles.first_name} {service.profiles.last_name}
                            </span>
                          )}
                        </div>
                      </div>

                      {service.commission_rate && service.commission_type && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Commission: {service.commission_rate}
                          {service.commission_type === 'percentage' ? '%' : ' flat rate'}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No services added to this work order.</p>
                )}
              </div>
            </div>

            {/* Create Invoice Button */}
            <div className="mt-4">
              <Button 
                className="w-full" 
                onClick={handleCreateInvoice}
                disabled={!workOrderDetails || 
                          workOrderDetails.status === 'cancelled' || 
                          workOrderDetails.status === 'invoiced' ||
                          isCreatingInvoice}
              >
                <Receipt className="mr-2 h-4 w-4" />
                {isInvoiced ? "Already Invoiced" : isCreatingInvoice ? "Creating Invoice..." : "Create Invoice"}
              </Button>
              {!isInvoiced && workOrderDetails?.status !== 'cancelled' && (
                <p className="text-xs text-center mt-2 text-muted-foreground">
                  When you create an invoice, the work order status will be set to "Invoiced"
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})
