import { WorkOrder } from "../types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { CalendarClock, Clock, User } from "lucide-react";

export interface WorkOrderCardProps {
  workOrder: WorkOrder;
  date: Date;
  span: number;
  onClick: () => void;
}

export function WorkOrderCard({ workOrder, date, span, onClick }: WorkOrderCardProps) {
  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'invoiced':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'estimated':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return 'NA';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
  };

  const formatCustomerName = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return 'No Name';
    return `${firstName || ''} ${lastName || ''}`.trim();
  };

  const startTime = workOrder.start_time ? new Date(workOrder.start_time) : null;
  const endTime = workOrder.end_time ? new Date(workOrder.end_time) : null;

  return (
    <Card 
      className={cn(
        "p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4",
        getStatusColor(workOrder.status),
        span > 1 ? "col-span-2" : ""
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium text-sm">
            {formatCustomerName(workOrder.customer_first_name, workOrder.customer_last_name)}
          </h4>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3 mr-1" />
            <span>
              {startTime ? formatTime(startTime) : 'No time'} 
              {endTime ? ` - ${formatTime(endTime)}` : ''}
            </span>
          </div>
        </div>
        <Badge variant="outline" className={cn("text-xs", getStatusColor(workOrder.status))}>
          {workOrder.status.replace('_', ' ')}
        </Badge>
      </div>
      
      {workOrder.vehicle_make && workOrder.vehicle_model && (
        <div className="text-xs text-muted-foreground mb-2">
          <span className="font-medium">Vehicle:</span> {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
        </div>
      )}
      
      <div className="flex justify-between items-center mt-2">
        {workOrder.profiles?.first_name ? (
          <div className="flex items-center">
            <Avatar className="h-5 w-5 mr-1">
              <AvatarFallback className="text-[10px]">
                {getInitials(workOrder.profiles.first_name, workOrder.profiles.last_name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs">
              {formatCustomerName(workOrder.profiles.first_name, workOrder.profiles.last_name)}
            </span>
          </div>
        ) : (
          <div className="flex items-center text-xs text-muted-foreground">
            <User className="h-3 w-3 mr-1" />
            <span>Unassigned</span>
          </div>
        )}
        
        {workOrder.estimated_duration && (
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarClock className="h-3 w-3 mr-1" />
            <span>{workOrder.estimated_duration} min</span>
          </div>
        )}
      </div>
    </Card>
  );
}
