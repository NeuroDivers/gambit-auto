import { format, startOfMonth } from "date-fns";
import { useState } from "react";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { CalendarGrid } from "./calendar/CalendarGrid";
import { useWorkOrderData } from "./calendar/useWorkOrderData";
import { LoadingScreen } from "../shared/LoadingScreen";
import { CreateWorkOrderDialog } from "./CreateWorkOrderDialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "lucide-react";
interface WorkOrderCalendarProps {
  clientView?: boolean;
}
export function WorkOrderCalendar({
  clientView = false
}: WorkOrderCalendarProps) {
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()));
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const {
    data: workOrders = [],
    isLoading
  } = useWorkOrderData();
  const handlePrevMonth = () => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentDate(prevMonth);
  };
  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentDate(nextMonth);
  };
  if (isLoading) {
    return <LoadingScreen />;
  }
  if (workOrders.length === 0 && clientView) {
    return <Alert>
        <Calendar className="h-4 w-4" />
        <AlertTitle>No Bookings Found</AlertTitle>
        <AlertDescription>
          You don't have any bookings scheduled at the moment.
        </AlertDescription>
      </Alert>;
  }
  return <div className="space-y-6">
      {!clientView && <div className="flex items-center justify-between">
          
          <CreateWorkOrderDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
        </div>}
      
      <div className="rounded-lg border bg-card">
        <CalendarHeader currentDate={currentDate} onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth} />
        <CalendarGrid currentDate={currentDate} workOrders={workOrders} onDateChange={!clientView ? date => {
        setCurrentDate(date);
        setShowCreateDialog(true);
      } : undefined} />
      </div>
    </div>;
}