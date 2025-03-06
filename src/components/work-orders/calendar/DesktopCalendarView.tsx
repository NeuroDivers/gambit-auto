
import { useState } from "react";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { WorkOrder } from "../types";

export interface DesktopCalendarViewProps {
  currentDate: Date;
  workOrders: WorkOrder[];
  onDateChange?: (date: Date) => void;
}

export function DesktopCalendarView({ currentDate, workOrders, onDateChange }: DesktopCalendarViewProps) {
  const [displayDate, setDisplayDate] = useState(currentDate);

  const handleDateChange = (newDate: Date) => {
    setDisplayDate(newDate);
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  return (
    <div className="bg-background border rounded-md overflow-hidden">
      <CalendarHeader 
        currentDate={displayDate} 
        onDateChange={handleDateChange}
      />
      <CalendarGrid 
        currentDate={displayDate} 
        workOrders={workOrders}
      />
    </div>
  );
}
