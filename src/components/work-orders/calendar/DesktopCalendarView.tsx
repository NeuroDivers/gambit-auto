
import React, { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { WorkOrder } from "@/components/work-orders/types";
import { BlockedDatesDialog } from "./BlockedDatesDialog";
import { CalendarDayView } from "./CalendarDayView";
import { ServiceLegend } from "./ServiceLegend";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface DesktopCalendarViewProps {
  date: Date;
  workOrders: WorkOrder[];
  onDateSelect?: (date: Date) => void;
}

export function DesktopCalendarView({
  date,
  workOrders,
  onDateSelect,
}: DesktopCalendarViewProps) {
  const [showBlockedDatesDialog, setShowBlockedDatesDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      onDateSelect?.(date);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>Calendar</span>
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowBlockedDatesDialog(true)}
              className="font-semibold"
            >
              Blocked Dates
            </Button>
          </div>
          <ServiceLegend />
        </div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          className="rounded-md border"
        />
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold">
          {selectedDate && format(selectedDate, "MMMM d, yyyy")}
        </h2>
        <CalendarDayView date={selectedDate} workOrders={workOrders} />
      </div>

      {showBlockedDatesDialog && (
        <BlockedDatesDialog
          open={showBlockedDatesDialog}
          onOpenChange={setShowBlockedDatesDialog}
        />
      )}
    </div>
  );
}
