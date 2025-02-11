
import { format, addMonths } from "date-fns"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

type MonthPickerProps = {
  currentDate: Date
  open: boolean
  onOpenChange: (open: boolean) => void
  onDateChange: (date: Date) => void
}

export function MonthPicker({ currentDate, open, onOpenChange, onDateChange }: MonthPickerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-4">
            {Array.from({ length: 12 }, (_, i) => addMonths(currentDate, i)).map((date) => (
              <Button
                key={date.toISOString()}
                variant="ghost"
                className="w-full justify-start text-left font-normal"
                onClick={() => {
                  onDateChange(date)
                  onOpenChange(false)
                }}
              >
                {format(date, 'MMMM yyyy')}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
