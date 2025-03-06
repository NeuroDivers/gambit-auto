
import { useState } from "react";
import { WorkOrder } from "../types";
import { CalendarHeader } from "@/components/calendar/components/CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { eachDayOfInterval, endOfWeek, startOfWeek } from "date-fns";
import { useBlockedDates } from "./hooks/useBlockedDates";

export interface DesktopCalendarViewProps {
  currentDate: Date;
  workOrders: WorkOrder[];
  onDateChange?: (date: Date) => void;
}

export function DesktopCalendarView({ currentDate, workOrders, onDateChange }: DesktopCalendarViewProps) {
  const [displayDate, setDisplayDate] = useState(currentDate);
  const { blockedDates, isDateBlocked } = useBlockedDates();

  const handleDateChange = (newDate: Date) => {
    setDisplayDate(newDate);
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  const days = eachDayOfInterval({
    start: startOfWeek(displayDate, { weekStartsOn: 1 }),
    end: endOfWeek(displayDate, { weekStartsOn: 1 })
  });

  return (
    <div className="bg-background border rounded-md overflow-hidden">
      <CalendarHeader 
        days={days}
        isDateBlocked={isDateBlocked}
        onDateChange={handleDateChange}
      />
      <CalendarGrid 
        currentDate={displayDate} 
        workOrders={workOrders}
        days={days}
        isDateBlocked={isDateBlocked}
      />
    </div>
  );
}
