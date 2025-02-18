import { useState } from "react";
import { addMonths, subMonths, startOfDay, endOfDay } from "date-fns";
import { CalendarGrid } from "./calendar/CalendarGrid";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { useWorkOrderData } from "./calendar/useWorkOrderData";
import { StatusLegend } from "./StatusLegend";
import { CalendarDayView } from "./calendar/CalendarDayView";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { BlockedDatesList } from "./calendar/BlockedDatesList";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

export function WorkOrderCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'day'>('month');
  const {
    data: workOrders = [],
    isLoading
  } = useWorkOrderData();
  const {
    isAdmin
  } = useAdminStatus();
  const isMobile = useIsMobile();

  const statusCounts = {
    pending: workOrders.filter(wo => wo.status === 'pending').length,
    approved: workOrders.filter(wo => wo.status === 'approved').length,
    rejected: workOrders.filter(wo => wo.status === 'rejected').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length
  };

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const getWorkOrdersForDay = () => {
    const dayStart = startOfDay(currentDate);
    const dayEnd = endOfDay(currentDate);
    return workOrders.filter(workOrder => {
      if (!workOrder.start_time) return false;
      const orderDate = new Date(workOrder.start_time);
      return orderDate >= dayStart && orderDate <= dayEnd;
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-primary/60">Loading calendar...</div>
      </div>;
  }

  return <section className="">
      <div className="space-y-6 p-6 px-0">
        <ToggleGroup type="single" value={view} onValueChange={value => value && setView(value as 'month' | 'day')}>
          <ToggleGroupItem value="month" aria-label="Month view">
            <CalendarIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="day" aria-label="Day view">
            <Clock className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        {!isMobile && <StatusLegend statusCounts={statusCounts} />}
        <div className="space-y-4">
          {view === 'month' ? <CalendarGrid currentDate={currentDate} workOrders={workOrders} onDateChange={handleDateChange} /> : <CalendarDayView currentDate={currentDate} workOrders={getWorkOrdersForDay()} />}
        </div>
        {isAdmin && <div className="pt-8 space-y-4">
            <Separator />
            <h4 className="font-medium">Blocked Dates</h4>
            <BlockedDatesList />
          </div>}
      </div>
    </section>;
}
