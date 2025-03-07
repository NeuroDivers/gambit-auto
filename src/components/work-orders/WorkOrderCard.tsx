
import { format } from "date-fns";
import { User, Calendar, Clock, Wrench, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { WorkOrderStatusBadge } from "./WorkOrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { WorkOrder } from "./types";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WorkOrderCardProps {
  workOrder: WorkOrder;
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

  // Format duration to a human-readable format (e.g., "2 hrs")
  const formatDuration = (minutes: number | null | undefined) => {
    if (!minutes) return "Not specified";
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours} hr ${remainingMinutes} min` 
        : `${hours} hr`;
    }
  };

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
                : startTime
                ? `${startTime}`
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
              {formatDuration(workOrder.estimated_duration)}
            </span>
          </div>
          
          {workOrder.service_bay && (
            <div className="flex items-center text-sm">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Bay: {workOrder.service_bay.name}</span>
            </div>
          )}
          
          <div className="flex flex-col mt-2 pt-2 border-t border-border">
            <div className="flex items-center text-sm mb-1">
              <Wrench className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Services:</span>
            </div>
            
            {workOrder.services && workOrder.services.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-1">
                {workOrder.services.map((service, idx) => (
                  <TooltipProvider key={idx}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-xs">
                          {service.service?.name || "Unnamed Service"}
                          {service.quantity > 1 && ` (x${service.quantity})`}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{service.service?.description || "No description"}</p>
                        {service.unit_price && (
                          <p className="font-medium mt-1">
                            ${service.unit_price.toFixed(2)} 
                            {service.quantity > 1 && ` × ${service.quantity} = $${(service.unit_price * service.quantity).toFixed(2)}`}
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No services assigned</p>
            )}
          </div>
          
          <div className="flex items-center text-sm mt-2">
            <span className="font-medium mr-2">Contact:</span>
            <span className="text-muted-foreground">
              {workOrder.contact_preference === 'phone' && workOrder.customer_phone 
                ? formatPhoneNumber(workOrder.customer_phone)
                : workOrder.customer_email || "No contact info"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to format phone numbers nicely
function formatPhoneNumber(phoneNumber: string) {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, "");
  
  // Check if it's a valid North American phone number
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[2]}) ${match[3]}-${match[4]}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
  }
  
  // If not a standard format, just return the original
  return phoneNumber;
}
