
import { startOfWeek, addDays, format } from "date-fns";
import { DesktopCalendarView } from "./DesktopCalendarView";
import { WorkOrder } from "../types";

interface CalendarGridProps {
  currentDate: Date;
  workOrders: WorkOrder[];
}

export function CalendarGrid({ currentDate, workOrders }: CalendarGridProps) {
  // Start from the beginning of the week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
  
  // Create an array of days for the week
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  return (
    <div className="grid grid-cols-7 border-t">
      {/* Day headers */}
      {days.map((day) => (
        <div 
          key={`header-${format(day, "yyyy-MM-dd")}`}
          className="p-2 text-center font-medium text-sm border-b border-r last:border-r-0"
        >
          {format(day, "EEE")}
          <div className="text-xs text-muted-foreground">
            {format(day, "MMM d")}
          </div>
        </div>
      ))}
      
      {/* Work order grid */}
      <div className="col-span-7 grid grid-cols-7">
        {days.map((day) => (
          <DesktopCalendarView
            key={format(day, "yyyy-MM-dd")}
            currentDate={day}
            workOrders={workOrders.filter((wo) => {
              if (!wo.start_time) return false;
              const startDate = new Date(wo.start_time);
              return (
                startDate.getDate() === day.getDate() &&
                startDate.getMonth() === day.getMonth() &&
                startDate.getFullYear() === day.getFullYear()
              );
            })}
          />
        ))}
      </div>
    </div>
  );
}
