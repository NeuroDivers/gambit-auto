
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WorkOrderStatus } from "../types"
import { Badge } from "@/components/ui/badge"
import { getBadgeVariant } from "../WorkOrderStatusBadge"

type WorkOrderStatusSelectProps = {
  value: WorkOrderStatus
  onChange: (value: WorkOrderStatus) => void
  disabled?: boolean
}

// Helper function to manually get status label since we can't import it
const getStatusLabel = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
}

// Helper function for badge variant mapping
const getBadgeVariant = (status: WorkOrderStatus) => {
  switch (status) {
    case "pending":
      return "outline" 
    case "approved":
      return "outline" 
    case "rejected":
      return "rejected"
    case "in_progress":
      return "info"
    case "completed":
      return "success"
    case "cancelled":
      return "destructive"
    case "invoiced":
      return "secondary"
    case "estimated":
      return "warning"
    default:
      return "default"
  }
}

export function WorkOrderStatusSelect({ value, onChange, disabled = false }: WorkOrderStatusSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as WorkOrderStatus)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select status">
          <div className="flex items-center gap-2">
            <Badge variant={getBadgeVariant(value)}>
              {getStatusLabel(value)}
            </Badge>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Pending</Badge>
          </div>
        </SelectItem>
        <SelectItem value="approved">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Approved</Badge>
          </div>
        </SelectItem>
        <SelectItem value="in_progress">
          <div className="flex items-center gap-2">
            <Badge variant="info">In Progress</Badge>
          </div>
        </SelectItem>
        <SelectItem value="completed">
          <div className="flex items-center gap-2">
            <Badge variant="success">Completed</Badge>
          </div>
        </SelectItem>
        <SelectItem value="cancelled">
          <div className="flex items-center gap-2">
            <Badge variant="destructive">Cancelled</Badge>
          </div>
        </SelectItem>
        <SelectItem value="invoiced">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Invoiced</Badge>
          </div>
        </SelectItem>
        <SelectItem value="estimated">
          <div className="flex items-center gap-2">
            <Badge variant="warning">Estimated</Badge>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
