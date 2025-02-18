
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { WorkOrder } from "../types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { LoadingScreen } from "@/components/shared/LoadingScreen"

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

  // Fetch available users (staff)
  const { data: assignableUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ["assignable-users"],
    queryFn: async () => {
      console.log("Fetching assignable users...")
      
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
    }
  })

  // Fetch available service bays
  const { data: serviceBays, isLoading: loadingBays } = useQuery({
    queryKey: ["service-bays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_bays')
        .select('*')
        .eq('status', 'available')
      
      if (error) throw error
      return data
    }
  })

  // Mutation to update work order assignments
  const updateAssignmentsMutation = useMutation({
    mutationFn: async ({ bayId, userId }: { bayId?: string | null, userId?: string | null }) => {
      console.log('Updating assignments:', { bayId, userId, workOrderId: workOrder.id })
      
      const { error } = await supabase
        .from('work_orders')
        .update({ 
          assigned_bay_id: bayId,
          assigned_profile_id: userId
        })
        .eq('id', workOrder.id)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success("Work order assignments updated")
      queryClient.invalidateQueries({ queryKey: ["workOrders"] })
    },
    onError: (error) => {
      console.error('Error updating assignments:', error)
      toast.error("Failed to update assignments")
    }
  })

  if (loadingUsers || loadingBays) {
    return <LoadingScreen />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Work Order Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic work order info */}
          <div>
            <h3 className="font-medium">Customer Information</h3>
            <p>{workOrder.first_name} {workOrder.last_name}</p>
            <p className="text-sm text-muted-foreground">{workOrder.email}</p>
          </div>

          <div>
            <h3 className="font-medium">Vehicle Information</h3>
            <p>{workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}</p>
          </div>

          {/* Assign Staff */}
          <div className="space-y-2">
            <Label>Assign Staff</Label>
            <Select
              value={workOrder.assigned_profile_id || "none"}
              onValueChange={(value) => {
                updateAssignmentsMutation.mutate({
                  userId: value === "none" ? null : value,
                  bayId: workOrder.assigned_bay_id
                })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {assignableUsers?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assign Bay */}
          <div className="space-y-2">
            <Label>Assign Service Bay</Label>
            <Select
              value={workOrder.assigned_bay_id || "none"}
              onValueChange={(value) => {
                updateAssignmentsMutation.mutate({
                  bayId: value === "none" ? null : value,
                  userId: workOrder.assigned_profile_id
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
