import { useState } from "react"
import { addMonths, subMonths } from "date-fns"
import { CreateQuoteDialog } from "./CreateQuoteDialog"
import { CalendarDay } from "./calendar/CalendarDay"
import { CalendarGrid } from "./calendar/CalendarGrid"
import { CalendarHeader } from "./calendar/CalendarHeader"
import { useQuoteData } from "./calendar/useQuoteData"

export function QuoteCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { data: quotes = [], isLoading } = useQuoteData()

  const handlePrevMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-primary/60">Loading calendar...</div>
      </div>
    )
  }

  return (
    <section className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-white/5 p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Quote Calendar</h3>
          <CreateQuoteDialog />
        </div>
        <div className="space-y-4">
          <CalendarHeader
            currentDate={currentDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
          <CalendarGrid
            currentDate={currentDate}
            quotes={quotes}
          />
        </div>
      </div>
    </section>
  )
}