
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { Check } from "lucide-react"

interface WorkOrderStatusBadgeProps {
  status: string
  workOrderId?: string
  editable?: boolean
}

const getWorkOrderStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "success"
    case "in_progress":
      return "warning"
    case "pending":
      return "secondary"
    case "cancelled":
      return "destructive"
    case "approved":
      return "info"
    default:
      return "default"
  }
}

export function WorkOrderStatusBadge({ 
  status, 
  workOrderId, 
  editable = false 
}: WorkOrderStatusBadgeProps) {
  const [currentStatus, setCurrentStatus] = useState(status)
  const [isUpdating, setIsUpdating] = useState(false)

  const variant = getWorkOrderStatusVariant(currentStatus)
  
  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!workOrderId || newStatus === currentStatus) return
    
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ status: newStatus })
        .eq('id', workOrderId)
      
      if (error) throw error
      
      setCurrentStatus(newStatus)
      toast.success(`Status updated to ${formatStatus(newStatus)}`)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const statuses = ["pending", "in_progress", "completed", "cancelled"]

  if (editable && workOrderId) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger disabled={isUpdating} asChild>
          <div className="cursor-pointer">
            <Badge variant={variant as any} className={isUpdating ? "opacity-50" : ""}>
              {formatStatus(currentStatus)}
            </Badge>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {statuses.map((statusOption) => (
            <DropdownMenuItem 
              key={statusOption}
              onClick={() => handleStatusChange(statusOption)}
              className="flex items-center justify-between"
            >
              <span>{formatStatus(statusOption)}</span>
              {statusOption === currentStatus && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  
  return (
    <Badge variant={variant as any}>
      {formatStatus(currentStatus)}
    </Badge>
  )
}
