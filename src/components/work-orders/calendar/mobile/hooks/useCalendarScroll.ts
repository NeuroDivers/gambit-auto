
import { useCallback } from "react"
import { startOfDay, isSameDay } from "date-fns"
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
      const scrollPosition = todayIndex * CELL_WIDTH
      scrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
      onDateChange?.(today)
      setVisibleMonth(today)
    } else {
      toast.error("Today's date not in view. Reloading calendar...")
      resetAroundToday()
      // Wait for state update then scroll
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            left: 15 * CELL_WIDTH,
            behavior: 'smooth'
          })
        }
      }, 100)
    }
  }, [visibleDays, onDateChange, CELL_WIDTH, scrollRef, setVisibleMonth, resetAroundToday])

  return { scrollToToday }
}
