import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CalendarHeaderProps {
  view: 'month' | 'day'
  setView: (view: 'month' | 'day') => void
}

export function CalendarHeader({ view, setView }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">Bay Availability</h2>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-card rounded-lg p-1">
          <Button
            variant={view === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('month')}
          >
            Month
          </Button>
          <Button
            variant={view === 'day' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('day')}
          >
            Day
          </Button>
        </div>
        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>
  )
}