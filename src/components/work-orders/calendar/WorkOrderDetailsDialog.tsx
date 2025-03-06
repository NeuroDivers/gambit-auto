
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
import { useNavigate } from "react-router-dom"

type WorkOrderDetailsDialogProps = {
  workOrder: WorkOrder
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WorkOrderDetailsDialog({
  workOrder,
  open,
  onOpenChange,
}: WorkOrderDetailsDialogProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Fetch work order with services
  const { data: workOrderDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ["workOrder", workOrder.id],
    queryFn: async () => {
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
    enabled: open
  })

  // Fetch available users (staff)
  const { data: assignableUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ["assignable-users"],
    queryFn: async () => {
      const { data: assignableRoles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .eq('can_be_assigned_to_bay', true)

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
    },
    enabled: open
  })

  // Fetch available service bays
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
    enabled: open
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
  const handleCreateInvoice = async () => {
    try {
      const { data, error } = await supabase.rpc(
        'create_invoice_from_work_order',
        { work_order_id: workOrder.id }
      )

      if (error) throw error

      toast.success("Invoice created successfully")
      // Update the work order status to indicate it's been invoiced
      await supabase
        .from('work_orders')
        .update({ status: 'completed' })
        .eq('id', workOrder.id)

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["workOrders"] })
      
      // Navigate to the newly created invoice
      if (data) {
        navigate(`/invoices/${data}/edit`)
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error("Failed to create invoice")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, variant: "default" | "outline" | "secondary" | "destructive" | "success" }> = {
      pending: { label: "Pending", variant: "outline" },
      approved: { label: "Pending", variant: "outline" },
      rejected: { label: "Cancelled", variant: "destructive" },
      in_progress: { label: "In Progress", variant: "secondary" },
      completed: { label: "Completed", variant: "success" },
      cancelled: { label: "Cancelled", variant: "destructive" }
    }

    const { label, variant } = statusMap[status] || { label: status, variant: "outline" }
    
    return <Badge variant={variant}>{label}</Badge>
  }

  if (loadingDetails || loadingUsers || loadingBays) {
    return <LoadingScreen />
  }

  const totalServiceCost = workOrderDetails?.work_order_services?.reduce(
    (sum, service) => sum + (service.quantity * service.unit_price), 
    0
  ) || 0

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
                  <p className="text-sm">Created: {workOrderDetails?.created_at ? formatDate(new Date(workOrderDetails.created_at)) : '-'}</p>
                  {workOrderDetails?.updated_at && (
                    <p className="text-sm">Last Updated: {formatDate(new Date(workOrderDetails.updated_at))}</p>
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
                disabled={!workOrderDetails || workOrderDetails.status === 'cancelled'}
              >
                <Receipt className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
              {workOrderDetails?.status !== 'completed' && (
                <p className="text-xs text-center mt-2 text-muted-foreground">
                  When you create an invoice, the work order status will be set to "Completed"
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
