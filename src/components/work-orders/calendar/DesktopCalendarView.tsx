
import { useState } from "react";
import { 
  eachDayOfInterval, 
  endOfWeek, 
  format, 
  startOfWeek, 
  addDays,
  addWeeks,
  subWeeks 
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { WorkOrder } from "../types";
import { useBlockedDates } from "./hooks/useBlockedDates";
import { CalendarHeader } from "@/components/calendar/components/CalendarHeader";
import { CalendarContent } from "@/components/calendar/components/CalendarContent";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { WorkOrderDetailsDialog } from "./WorkOrderDetailsDialog";
import { MonthPicker } from "./MonthPicker";
import { format as formatDate } from "date-fns";

interface DesktopCalendarViewProps {
  currentDate: Date;
  workOrders: WorkOrder[];
  onDateChange?: (date: Date) => void;
}

export function DesktopCalendarView({ currentDate, workOrders, onDateChange }: DesktopCalendarViewProps) {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const { isDateBlocked, getBlockedDateReason } = useBlockedDates();
  
  // Get the days for the current week
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Navigation functions
  const goToPreviousWeek = () => {
    if (onDateChange) {
      const newDate = subWeeks(currentDate, 1);
      onDateChange(newDate);
    }
  };

  const goToNextWeek = () => {
    if (onDateChange) {
      const newDate = addWeeks(currentDate, 1);
      onDateChange(newDate);
    }
  };

  const goToToday = () => {
    if (onDateChange) {
      onDateChange(new Date());
    }
  };

  const handleMonthSelect = (date: Date) => {
    if (onDateChange) {
      onDateChange(date);
    }
    setShowMonthPicker(false);
  };

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

  const currentMonthYear = formatDate(currentDate, "MMMM yyyy");
  const weekRange = `${formatDate(weekStart, "MMM d")} - ${formatDate(weekEnd, "MMM d")}`;

  return (
    <Card className="overflow-auto border border-gray-200 shadow-sm">
      <CardHeader className="p-4 border-b bg-muted/30">
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl font-semibold flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
            Calendar View
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowMonthPicker(true)}
              className="font-medium"
            >
              {currentMonthYear}
            </Button>
            
            <div className="flex items-center space-x-1 bg-muted rounded-md p-0.5">
              <Button variant="ghost" size="icon" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs">
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground mt-1">
          Viewing week: {weekRange}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <CalendarHeader 
              days={days} 
              isDateBlocked={isDateBlocked}
              getBlockedDateReason={getBlockedDateReason}
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
      
      <MonthPicker
        currentDate={currentDate}
        open={showMonthPicker}
        onOpenChange={setShowMonthPicker}
        onDateChange={handleMonthSelect}
      />
    </Card>
  );
}
