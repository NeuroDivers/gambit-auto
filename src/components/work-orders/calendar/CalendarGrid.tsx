
import { WorkOrder } from "../types";

interface CalendarGridProps {
  currentDate: Date;
  workOrders: WorkOrder[];
  days: Date[];
  isDateBlocked: (date: Date) => boolean;
}

export function CalendarGrid({ currentDate, workOrders, days, isDateBlocked }: CalendarGridProps) {
  // This is a placeholder implementation - we would need to implement the actual grid rendering
  return (
    <div className="h-96 p-4 flex items-center justify-center text-muted-foreground">
      <p>Calendar grid will be implemented here with {workOrders.length} work orders</p>
    </div>
  );
}
