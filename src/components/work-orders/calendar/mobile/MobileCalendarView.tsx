import React from 'react';
import { WorkOrder } from "../../types";
import { format, isToday, isYesterday, isTomorrow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ClockIcon, UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTimeDisplay } from '@/lib/date-utils';

export interface MobileCalendarViewProps {
  workOrders: any[];
  onDateChange: (date: any) => void;
  currentDate: Date;
}

export function MobileCalendarView({ workOrders, onDateChange, currentDate }: MobileCalendarViewProps) {
  const formatDateHeader = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else {
      return format(date, 'EEEE, MMMM d');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'invoiced':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'estimated':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const groupWorkOrdersByDate = () => {
    const grouped: Record<string, WorkOrder[]> = {};
    
    workOrders.forEach((workOrder) => {
      const date = workOrder.start_time 
        ? format(new Date(workOrder.start_time), 'yyyy-MM-dd')
        : 'unscheduled';
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      
      grouped[date].push(workOrder);
    });
    
    return grouped;
  };

  const groupedWorkOrders = groupWorkOrdersByDate();
  const dateKeys = Object.keys(groupedWorkOrders).sort();
  
  // Handle unscheduled work orders separately
  const unscheduledWorkOrders = groupedWorkOrders['unscheduled'] || [];
  const scheduledDateKeys = dateKeys.filter(date => date !== 'unscheduled');

  return (
    <div className="space-y-6">
      {scheduledDateKeys.map(dateKey => (
        <div key={dateKey} className="space-y-3">
          <h3 className="font-medium text-lg">
            {formatDateHeader(new Date(dateKey))}
          </h3>
          
          <div className="space-y-3">
            {groupedWorkOrders[dateKey].map((workOrder: WorkOrder) => (
              <Card key={workOrder.id} className="shadow-sm hover:shadow transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">
                        {workOrder.customer_first_name} {workOrder.customer_last_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {workOrder.customer_vehicle_make} {workOrder.customer_vehicle_model}
                      </p>
                    </div>
                    
                    <Badge className={cn("font-normal", getStatusColor(workOrder.status))}>
                      {workOrder.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {workOrder.start_time && (
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{formatTimeDisplay(workOrder.start_time)}</span>
                      </div>
                    )}
                    
                    {workOrder.profiles && (
                      <div className="flex items-center gap-1.5">
                        <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>
                          {workOrder.profiles.first_name} {workOrder.profiles.last_name}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
      
      {unscheduledWorkOrders.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-lg text-muted-foreground">
            Unscheduled
          </h3>
          
          <div className="space-y-3">
            {unscheduledWorkOrders.map((workOrder: WorkOrder) => (
              <Card key={workOrder.id} className="shadow-sm hover:shadow transition-shadow border-dashed">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">
                        {workOrder.customer_first_name} {workOrder.customer_last_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {workOrder.customer_vehicle_make} {workOrder.customer_vehicle_model}
                      </p>
                    </div>
                    
                    <Badge className={cn("font-normal", getStatusColor(workOrder.status))}>
                      {workOrder.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span>Not scheduled</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {Object.keys(groupedWorkOrders).length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No work orders found for this date range</p>
        </div>
      )}
    </div>
  );
}
