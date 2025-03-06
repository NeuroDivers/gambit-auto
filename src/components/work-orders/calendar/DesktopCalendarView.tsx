
import { useState } from "react";
import { eachDayOfInterval, endOfWeek, format, startOfWeek, addDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { WorkOrder } from "../types";
import { useBlockedDates } from "./hooks/useBlockedDates";
import { CalendarHeader } from "@/components/calendar/components/CalendarHeader";
import { CalendarContent } from "@/components/calendar/components/CalendarContent";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { WorkOrderDetailsDialog } from "./WorkOrderDetailsDialog";

interface DesktopCalendarViewProps {
  currentDate: Date;
  workOrders: WorkOrder[];
  onDateChange?: (date: Date) => void;
}

export function DesktopCalendarView({ currentDate, workOrders, onDateChange }: DesktopCalendarViewProps) {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const { isDateBlocked } = useBlockedDates();
  
  // Get the days for the current week
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Fetch service bays for the calendar rows
  const { data: serviceBays = [], isLoading: isLoadingBays } = useQuery({
    queryKey: ["serviceBays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const handleWorkOrderSelect = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
  };

  const handleDateSelect = (date: Date) => {
    if (onDateChange) {
      onDateChange(date);
    }
  };

  if (isLoadingBays) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="overflow-auto border border-gray-200 shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <CalendarHeader 
              days={days} 
              isDateBlocked={isDateBlocked}
              onDateChange={onDateChange}
            />
            <CalendarContent
              days={days}
              serviceBays={serviceBays}
              workOrders={workOrders}
              isDateBlocked={isDateBlocked}
              onDateSelect={handleDateSelect}
              onWorkOrderSelect={handleWorkOrderSelect}
            />
          </div>
        </div>
      </CardContent>

      {selectedWorkOrder && (
        <WorkOrderDetailsDialog
          workOrder={selectedWorkOrder}
          open={!!selectedWorkOrder}
          onOpenChange={(open) => !open && setSelectedWorkOrder(null)}
        />
      )}
    </Card>
  );
}
