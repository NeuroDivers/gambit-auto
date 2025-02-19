
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type CalendarHeaderProps = {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

export function CalendarHeader({
  currentDate,
  onPrevMonth,
  onNextMonth
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-border/50">
      <div className="flex gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onPrevMonth} 
          className="text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onNextMonth} 
          className="text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
