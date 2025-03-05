
import { Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { WorkOrder } from "../types"  // Use our local WorkOrder type
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  in_progress: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  completed: "bg-green-100 text-green-700 hover:bg-green-200",
  cancelled: "bg-red-100 text-red-700 hover:bg-red-200",
}

type Status = keyof typeof statusStyles

const statusLabels: Record<Status, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
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
      queryClient.invalidateQueries({ queryKey: ['work-orders'] })
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error("Failed to update status")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isLoading} asChild>
        <button
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            statusStyles[workOrder.status as Status] || statusStyles.pending
          )}
        >
          {statusLabels[workOrder.status as Status] || "Pending"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {Object.entries(statusLabels).map(([status, label]) => (
          <DropdownMenuItem
            key={status}
            onClick={() => updateStatus(status as Status)}
            className="flex items-center justify-between"
          >
            <span>{label}</span>
            {status === workOrder.status && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
