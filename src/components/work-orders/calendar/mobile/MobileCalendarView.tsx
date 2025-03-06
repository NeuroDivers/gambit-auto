
import React, { useState } from "react";
import { 
  Card, 
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HorizontalCalendar } from "@/components/calendar/HorizontalCalendar";
import { Button } from "@/components/ui/button";
import { WorkOrderCard } from "@/components/work-orders/calendar/WorkOrderCard";
import { CreateWorkOrderDialog } from "@/components/work-orders/CreateWorkOrderDialog";
import { format } from "date-fns";
import { PlusCircle } from "lucide-react";
import { WorkOrder } from "@/components/work-orders/types";

interface MobileCalendarViewProps {
  workOrders: WorkOrder[];
  isLoading: boolean;
  title?: string;
  onDateSelected?: (date: Date) => void;
}

export function MobileCalendarView({
  workOrders = [],
  isLoading,
  title = "Work Orders",
  onDateSelected,
}: MobileCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Filter work orders for the selected date
  const filteredWorkOrders = workOrders.filter((order) => {
    if (!order.start_time) return false;
    const startDate = new Date(order.start_time);
    return (
      startDate.getDate() === selectedDate.getDate() &&
      startDate.getMonth() === selectedDate.getMonth() &&
      startDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (onDateSelected) {
      onDateSelected(date);
    }
  };

  return (
    <div className="space-y-4">
      <HorizontalCalendar 
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        className="bg-card p-4 rounded-lg"
      />
      
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {format(selectedDate, "MMMM d, yyyy")}
        </h2>
        <Button
          size="sm"
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-1"
        >
          <PlusCircle className="w-4 h-4" />
          New
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : filteredWorkOrders.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-20rem)]">
              <div className="space-y-4">
                {filteredWorkOrders.map((order) => (
                  <WorkOrderCard key={order.id} workOrder={order} />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No work orders scheduled for this date.
            </div>
          )}
        </CardContent>
      </Card>

      <CreateWorkOrderDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        defaultStartTime={selectedDate}
      />
    </div>
  );
}
