
import { useCallback } from "react"
import { startOfDay, isSameDay, isBefore } from "date-fns"
import { toast } from "sonner"

interface UseCalendarScrollProps {
  visibleDays: Date[]
  scrollRef: React.RefObject<HTMLDivElement>
  onDateChange?: (date: Date) => void
  setVisibleMonth: (date: Date) => void
  resetAroundToday: () => void
  CELL_WIDTH: number
}

export const useCalendarScroll = ({
  visibleDays,
  scrollRef,
  onDateChange,
  setVisibleMonth,
  resetAroundToday,
  CELL_WIDTH
}: UseCalendarScrollProps) => {
  const scrollToToday = useCallback(() => {
    const today = startOfDay(new Date())
    const todayIndex = visibleDays.findIndex(day => isSameDay(day, today))
    
    if (todayIndex !== -1 && scrollRef.current) {
      scrollRef.current.scrollTo({
        left: todayIndex * CELL_WIDTH,
        behavior: 'smooth'
      })
      onDateChange?.(today)
      setVisibleMonth(today)
    } else {
      toast.message("Scrolling to today's date...")
      resetAroundToday()
      // Wait for state update then scroll
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            left: 0, // Scroll to the beginning since today will be the first day
            behavior: 'smooth'
          })
        }
      }, 100)
    }
  }, [visibleDays, onDateChange, CELL_WIDTH, scrollRef, setVisibleMonth, resetAroundToday])

  return { scrollToToday }
}
