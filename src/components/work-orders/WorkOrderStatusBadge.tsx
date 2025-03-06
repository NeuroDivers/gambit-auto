
import { Badge } from "@/components/ui/badge"
import { WorkOrderStatus } from "./types"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type WorkOrderStatusBadgeProps = {
  status: WorkOrderStatus
  workOrderId?: string
  editable?: boolean
}

export function WorkOrderStatusBadge({ status, workOrderId, editable = false }: WorkOrderStatusBadgeProps) {
  const [currentStatus, setCurrentStatus] = useState<WorkOrderStatus>(status)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Map work order status to badge variant
  const getBadgeVariant = (status: WorkOrderStatus) => {
    switch (status) {
      case "pending":
        return "outline" // Using outline instead of pending
      case "approved":
        return "outline" 
      case "rejected":
        return "rejected"
      case "in_progress":
        return "info" // Using info instead of in_progress
      case "completed":
        return "success"
      case "cancelled":
        return "destructive"
      case "invoiced":
        return "secondary"
      case "estimated":
        return "warning" // Using warning instead of estimated
      default:
        return "default"
    }
  }

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
        description: `Work order status changed to ${newStatus}`,
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
      {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1).replace('_', ' ')}
    </Badge>
  )
}
