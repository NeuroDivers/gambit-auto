
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns"
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

type MonthPickerProps = {
  currentDate: Date
  open: boolean
  onOpenChange: (open: boolean) => void
  onDateChange: (date: Date) => void
}

export function MonthPicker({ currentDate, open, onOpenChange, onDateChange }: MonthPickerProps) {
  // Generate next 12 months starting from current date
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = addMonths(startOfMonth(currentDate), i)
    const days = eachDayOfInterval({
      start: startOfMonth(date),
      end: endOfMonth(date)
    })
    return { date, days }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen max-w-none m-0 rounded-none p-0">
        <div className="flex items-center justify-between border-b p-4">
          <DialogTitle className="text-xl font-semibold">Jump to a date</DialogTitle>
          <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="p-4 space-y-8">
            {months.map(({ date, days }) => (
              <div key={date.toISOString()} className="space-y-4">
                <h3 className="font-semibold text-lg">
                  {format(date, 'MMMM yyyy')}
                </h3>
                <div className="grid grid-cols-7 gap-1 text-sm">
                  {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(day => (
                    <div key={day} className="h-8 flex items-center justify-center text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  {days.map(day => {
                    const isCurrentMonth = isSameMonth(day, date)
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => {
                          onDateChange(day)
                          onOpenChange(false)
                        }}
                        className={cn(
                          "h-8 w-full flex items-center justify-center rounded-sm hover:bg-accent",
                          !isCurrentMonth && "text-muted-foreground opacity-50",
                          day.toDateString() === currentDate.toDateString() && "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                      >
                        {format(day, 'd')}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
