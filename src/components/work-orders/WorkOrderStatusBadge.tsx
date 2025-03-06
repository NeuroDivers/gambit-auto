import { Badge } from "@/components/ui/badge";
import { WorkOrderStatusSelect } from "./components/WorkOrderStatusSelect";

type WorkOrderStatus = 
  | "pending"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "invoiced"
  | "estimated";

interface WorkOrderStatusBadgeProps {
  status: WorkOrderStatus;
  workOrderId?: string;
  editable?: boolean;
}

export function WorkOrderStatusBadge({ 
  status, 
  workOrderId, 
  editable = false 
}: WorkOrderStatusBadgeProps) {
  // If editable and we have a workOrderId, render the dropdown select
  if (editable && workOrderId) {
    return <WorkOrderStatusSelect workOrderId={workOrderId} initialStatus={status} />;
  }

  // Otherwise render a static badge
  return (
    <Badge variant={status}>
      {getStatusLabel(status)}
    </Badge>
  );
}

export function getStatusLabel(status: WorkOrderStatus) {
  switch (status) {
    case "pending":
      return "Pending";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "invoiced":
      return "Invoiced";
    case "estimated":
      return "Estimated";
    default:
      // Ensure status is treated as a string by explicitly casting it
      const statusString = String(status);
      return statusString.charAt(0).toUpperCase() + statusString.slice(1);
  }
}
