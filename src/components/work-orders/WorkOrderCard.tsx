
import { format } from "date-fns";
import { User, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { WorkOrderStatusBadge } from "./WorkOrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface WorkOrderCardProps {
  workOrder: any;
}

export function WorkOrderCard({ workOrder }: WorkOrderCardProps) {
  const formatTime = (timeString: string) => {
    if (!timeString) return null;
    return format(new Date(timeString), "h:mm a");
  };

  const startTime = workOrder.start_time ? formatTime(workOrder.start_time) : null;
  const endTime = workOrder.end_time ? formatTime(workOrder.end_time) : null;

  const assignedStaff = workOrder.profiles ? 
    `${workOrder.profiles.first_name} ${workOrder.profiles.last_name}` : 
    "Unassigned";

  return (
    <Card>
      <CardHeader className="py-3 flex flex-row items-center justify-between">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">
              {workOrder.customer_first_name} {workOrder.customer_last_name}
            </h3>
            <WorkOrderStatusBadge status={workOrder.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {workOrder.customer_vehicle_year} {workOrder.customer_vehicle_make} {workOrder.customer_vehicle_model}
          </p>
        </div>
        <Link to={`/work-orders/${workOrder.id}`}>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="py-3">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              {startTime && endTime
                ? `${startTime} - ${endTime}`
                : "No time specified"}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <User className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{assignedStaff}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              {workOrder.customer_phone || workOrder.customer_email || "No contact info"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
