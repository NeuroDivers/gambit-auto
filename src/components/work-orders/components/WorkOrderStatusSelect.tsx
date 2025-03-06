
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { WorkOrderStatus } from "../types";
import { getWorkOrderStatusVariant } from "@/components/shared/BadgeVariants";

export function getStatusLabel(status: WorkOrderStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
}

export function getBadgeVariant(status: WorkOrderStatus) {
  return getWorkOrderStatusVariant(status);
}

interface WorkOrderStatusSelectProps {
  status: WorkOrderStatus;
  onStatusChange: (status: WorkOrderStatus) => void;
  isUpdating?: boolean;
  disabled?: boolean;
}

export function WorkOrderStatusSelect({ 
  status, 
  onStatusChange, 
  isUpdating = false,
  disabled = false
}: WorkOrderStatusSelectProps) {
  return (
    <Select
      value={status}
      onValueChange={(value) => onStatusChange(value as WorkOrderStatus)}
      disabled={isUpdating || disabled}
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Status">
          <div className="flex items-center gap-2">
            <Badge variant={getBadgeVariant(status)}>
              {getStatusLabel(status)}
            </Badge>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">
          <Badge variant={getBadgeVariant("pending")}>
            {getStatusLabel("pending")}
          </Badge>
        </SelectItem>
        <SelectItem value="approved">
          <Badge variant={getBadgeVariant("approved")}>
            {getStatusLabel("approved")}
          </Badge>
        </SelectItem>
        <SelectItem value="in_progress">
          <Badge variant={getBadgeVariant("in_progress")}>
            {getStatusLabel("in_progress")}
          </Badge>
        </SelectItem>
        <SelectItem value="completed">
          <Badge variant={getBadgeVariant("completed")}>
            {getStatusLabel("completed")}
          </Badge>
        </SelectItem>
        <SelectItem value="cancelled">
          <Badge variant={getBadgeVariant("cancelled")}>
            {getStatusLabel("cancelled")}
          </Badge>
        </SelectItem>
        <SelectItem value="invoiced">
          <Badge variant={getBadgeVariant("invoiced")}>
            {getStatusLabel("invoiced")}
          </Badge>
        </SelectItem>
        <SelectItem value="estimated">
          <Badge variant={getBadgeVariant("estimated")}>
            {getStatusLabel("estimated")}
          </Badge>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
