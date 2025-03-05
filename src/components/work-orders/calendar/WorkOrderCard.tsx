
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar, Clock, User2 } from "lucide-react";
import { WorkOrder } from "@/types/work-order";

interface WorkOrderCardProps {
  workOrder: WorkOrder & {
    isStart?: boolean;
    isEnd?: boolean;
    duration?: number;
  };
  className?: string;
  onClick?: () => void;
}

export function WorkOrderCard({
  workOrder,
  className,
  onClick,
}: WorkOrderCardProps) {
  // Format the start time
  const formatStartTime = (startTime: string | null | undefined) => {
    if (!startTime) return "N/A";
    try {
      return format(new Date(startTime), "h:mm a");
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid time";
    }
  };

  // Get status color class
  const getStatusColorClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-500";
      case "confirmed":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg shadow-sm p-3 cursor-pointer transition-all",
        "border border-border hover:shadow-md",
        className
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-sm">
            {workOrder.first_name} {workOrder.last_name}
          </h3>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatStartTime(workOrder.start_time)}</span>
          </div>
          {workOrder.service_bays && (
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{workOrder.service_bays.name}</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            getStatusColorClass(workOrder.status)
          )}
        />
      </div>
    </div>
  );
}
