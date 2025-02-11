
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"

type MonthPickerProps = {
  currentDate: Date
  open: boolean
  onOpenChange: (open: boolean) => void
  onDateChange: (date: Date) => void
}

export function MonthPicker({ currentDate, open, onOpenChange, onDateChange }: MonthPickerProps) {
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(date)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={handleSelect}
          initialFocus
        />
      </DialogContent>
    </Dialog>
  )
}
