
import { Badge } from "@/components/ui/badge";

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
}

export function WorkOrderStatusBadge({ status }: WorkOrderStatusBadgeProps) {
  const getVariant = (status: WorkOrderStatus) => {
    switch (status) {
      case "pending":
        return "pending";
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      case "in_progress":
        return "in_progress";
      case "completed":
        return "completed";
      case "cancelled":
        return "cancelled";
      case "invoiced":
        return "invoiced";
      case "estimated":
        return "estimate_pending";
      default:
        return "default";
    }
  };

  const getLabel = (status: WorkOrderStatus) => {
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
        // Fix the "never" type issue by ensuring status is treated as a string
        return (typeof status === 'string') 
          ? status.charAt(0).toUpperCase() + status.slice(1) 
          : "Unknown";
    }
  };

  return (
    <Badge variant={getVariant(status)}>
      {getLabel(status)}
    </Badge>
  );
}
