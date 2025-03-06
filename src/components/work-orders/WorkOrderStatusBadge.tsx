
import { Badge } from "@/components/ui/badge";

type WorkOrderStatus = 
  | "pending"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "invoiced";

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
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Badge variant={getVariant(status)}>
      {getLabel(status)}
    </Badge>
  );
}
