
import { Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { getStatusLabel } from "../WorkOrderStatusBadge"

type Status = "pending" | "approved" | "rejected" | "in_progress" | "completed" | "cancelled" | "invoiced" | "estimated"

interface WorkOrderStatusSelectProps {
  workOrderId: string;
  initialStatus: Status;
}

export function WorkOrderStatusSelect({ workOrderId, initialStatus }: WorkOrderStatusSelectProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<Status>(initialStatus)
  const queryClient = useQueryClient()

  const updateStatus = async (newStatus: Status) => {
    if (newStatus === status) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ status: newStatus })
        .eq('id', workOrderId)

      if (error) throw error

      setStatus(newStatus)
      toast.success(`Status updated to ${getStatusLabel(newStatus)}`)
      queryClient.invalidateQueries({ queryKey: ['workOrders'] })
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error("Failed to update status")
    } finally {
      setIsLoading(false)
    }
  }

  const allStatuses: Status[] = [
    "pending", 
    "approved", 
    "rejected", 
    "in_progress", 
    "completed", 
    "cancelled", 
    "invoiced", 
    "estimated"
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isLoading} asChild>
        <div>
          <Badge 
            variant={status}
            className="cursor-pointer"
          >
            {getStatusLabel(status)}
          </Badge>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {allStatuses.map((statusOption) => (
          <DropdownMenuItem
            key={statusOption}
            onClick={() => updateStatus(statusOption)}
            className={cn(
              "flex items-center justify-between",
              statusOption === status && "bg-accent"
            )}
          >
            <span>{getStatusLabel(statusOption)}</span>
            {statusOption === status && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
