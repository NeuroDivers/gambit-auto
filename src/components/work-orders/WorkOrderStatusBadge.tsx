
import { Badge } from "@/components/ui/badge"
import { WorkOrderStatus } from "./types"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getWorkOrderStatusVariant } from "@/components/shared/BadgeVariants"
import { useQueryClient } from "@tanstack/react-query"

type WorkOrderStatusBadgeProps = {
  status: WorkOrderStatus
  workOrderId?: string
  editable?: boolean
}

export function getStatusLabel(status: WorkOrderStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
}

export function getBadgeVariant(status: WorkOrderStatus) {
  return getWorkOrderStatusVariant(status);
}

export function WorkOrderStatusBadge({ status, workOrderId, editable = false }: WorkOrderStatusBadgeProps) {
  const [currentStatus, setCurrentStatus] = useState<WorkOrderStatus>(status)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleStatusChange = async (newStatus: WorkOrderStatus) => {
    if (!workOrderId) return

    setIsLoading(true)
    try {
      console.log(`Updating work order ${workOrderId} status to ${newStatus}`)
      
      const { error } = await supabase
        .from('work_orders')
        .update({ status: newStatus })
        .eq('id', workOrderId)
      
      if (error) {
        console.error("Error updating status:", error)
        throw error
      }
      
      setCurrentStatus(newStatus)
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['work-orders'] })
      queryClient.invalidateQueries({ queryKey: ['workOrder', workOrderId] })
      
      toast({
        title: "Status Updated",
        description: `Work order status changed to ${getStatusLabel(newStatus)}`,
      })
    } catch (error: any) {
      console.error("Status update error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (editable && workOrderId) {
    return (
      <Select
        value={currentStatus}
        onValueChange={(value) => handleStatusChange(value as WorkOrderStatus)}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status">
            <Badge variant={getBadgeVariant(currentStatus)} className="mr-2">
              {getStatusLabel(currentStatus)}
            </Badge>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">
            <Badge variant="outline" className="mr-2">Pending</Badge>
          </SelectItem>
          <SelectItem value="approved">
            <Badge variant="outline" className="mr-2">Approved</Badge>
          </SelectItem>
          <SelectItem value="in_progress">
            <Badge variant="info" className="mr-2">In Progress</Badge>
          </SelectItem>
          <SelectItem value="completed">
            <Badge variant="success" className="mr-2">Completed</Badge>
          </SelectItem>
          <SelectItem value="cancelled">
            <Badge variant="destructive" className="mr-2">Cancelled</Badge>
          </SelectItem>
          <SelectItem value="invoiced">
            <Badge variant="secondary" className="mr-2">Invoiced</Badge>
          </SelectItem>
          <SelectItem value="estimated">
            <Badge variant="warning" className="mr-2">Estimated</Badge>
          </SelectItem>
        </SelectContent>
      </Select>
    )
  }

  return (
    <Badge variant={getBadgeVariant(currentStatus)}>
      {getStatusLabel(currentStatus)}
    </Badge>
  )
}
