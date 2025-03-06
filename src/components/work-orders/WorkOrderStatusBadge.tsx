
import { Badge } from "@/components/ui/badge"
import { WorkOrderStatus } from "./types"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getWorkOrderStatusVariant } from "@/components/shared/BadgeVariants"

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

  const handleStatusChange = async (newStatus: WorkOrderStatus) => {
    if (!workOrderId) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ status: newStatus })
        .eq('id', workOrderId)
      
      if (error) throw error
      
      setCurrentStatus(newStatus)
      toast({
        title: "Status Updated",
        description: `Work order status changed to ${getStatusLabel(newStatus)}`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
          <SelectItem value="invoiced">Invoiced</SelectItem>
          <SelectItem value="estimated">Estimated</SelectItem>
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
