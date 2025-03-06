
import { Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { WorkOrder } from "../types"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"

type Status = "pending" | "in_progress" | "completed" | "cancelled" | "invoiced"

const statusLabels: Record<Status, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  invoiced: "Invoiced",
}

interface WorkOrderStatusSelectProps {
  workOrder: WorkOrder
}

export function WorkOrderStatusSelect({ workOrder }: WorkOrderStatusSelectProps) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const updateStatus = async (newStatus: Status) => {
    if (newStatus === workOrder.status) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ status: newStatus })
        .eq('id', workOrder.id)

      if (error) throw error

      toast.success(`Status updated to ${statusLabels[newStatus]}`)
      queryClient.invalidateQueries({ queryKey: ['workOrders'] })
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error("Failed to update status")
    } finally {
      setIsLoading(false)
    }
  }

  // Map any legacy status values to our new consistent values
  const currentStatus = (workOrder.status in statusLabels) 
    ? workOrder.status as Status 
    : workOrder.status === "approved" 
      ? "pending" 
      : workOrder.status === "rejected" 
        ? "cancelled" 
        : "pending";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isLoading} asChild>
        <div>
          <Badge 
            variant={currentStatus}
            className="cursor-pointer"
          >
            {statusLabels[currentStatus]}
          </Badge>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {Object.entries(statusLabels).map(([status, label]) => (
          <DropdownMenuItem
            key={status}
            onClick={() => updateStatus(status as Status)}
            disabled={status === "invoiced"}
            className={cn(
              "flex items-center justify-between",
              status === "invoiced" && "opacity-60 cursor-not-allowed"
            )}
          >
            <span>{label}</span>
            {status === currentStatus && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
