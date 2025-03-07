import { Badge } from "@/components/ui/badge"
import { WorkOrderStatus } from "./types"
import { useState, useEffect } from "react"
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

  useEffect(() => {
    if (status !== currentStatus) {
      setCurrentStatus(status);
    }
  }, [status]);

  useEffect(() => {
    if (!workOrderId) return;
    
    console.log(`Setting up status subscription for work order ${workOrderId}`);
    
    const channel = supabase
      .channel(`work-order-status-${workOrderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'work_orders',
          filter: `id=eq.${workOrderId}`
        },
        (payload) => {
          console.log('Work order status change detected:', payload);
          if (payload.new && payload.new.status && payload.new.status !== currentStatus) {
            setCurrentStatus(payload.new.status as WorkOrderStatus);
            
            if (!isLoading) {
              toast({
                title: "Status Updated",
                description: `Work order status changed to ${getStatusLabel(payload.new.status as WorkOrderStatus)}`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log(`Cleaning up status subscription for work order ${workOrderId}`);
      supabase.removeChannel(channel);
    };
  }, [workOrderId, currentStatus, isLoading, toast]);

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
      <div className="status-selector">
        <Select
          value={currentStatus}
          onValueChange={(value) => handleStatusChange(value as WorkOrderStatus)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[160px] status-trigger" data-status={currentStatus}>
            <SelectValue>
              <Badge variant={getBadgeVariant(currentStatus)}>
                {getStatusLabel(currentStatus)}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">
              <Badge variant="pending">Pending</Badge>
            </SelectItem>
            <SelectItem value="approved">
              <Badge variant="approved">Approved</Badge>
            </SelectItem>
            <SelectItem value="in_progress">
              <Badge variant="info">In Progress</Badge>
            </SelectItem>
            <SelectItem value="completed">
              <Badge variant="success">Completed</Badge>
            </SelectItem>
            <SelectItem value="cancelled">
              <Badge variant="destructive">Cancelled</Badge>
            </SelectItem>
            <SelectItem value="invoiced">
              <Badge variant="secondary">Invoiced</Badge>
            </SelectItem>
            <SelectItem value="estimated">
              <Badge variant="warning">Estimated</Badge>
            </SelectItem>
          </SelectContent>
        </Select>
        <style>{`
          .status-trigger[data-status="${currentStatus}"] {
            background: transparent;
            border-color: transparent;
            padding-left: 0;
            padding-right: 8px;
            box-shadow: none;
          }
          .status-trigger[data-status="${currentStatus}"]:hover {
            background: transparent;
          }
          .status-selector :global(.select-content) {
            min-width: 140px;
          }
        `}</style>
      </div>
    )
  }

  return (
    <Badge variant={getBadgeVariant(currentStatus)}>
      {getStatusLabel(currentStatus)}
    </Badge>
  )
}
