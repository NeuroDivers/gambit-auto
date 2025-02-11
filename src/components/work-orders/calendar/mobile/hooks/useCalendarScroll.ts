
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
    
    const scrollToPosition = (position: number) => {
      if (scrollRef.current) {
        // First reset the scroll position
        scrollRef.current.scrollLeft = 0
        // Force layout recalculation
        void scrollRef.current.offsetWidth
        // Then set the new position
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            scrollRef.current.style.scrollBehavior = 'auto'
            scrollRef.current.scrollLeft = position
            // Reset scroll behavior after the scroll
            setTimeout(() => {
              if (scrollRef.current) {
                scrollRef.current.style.scrollBehavior = 'smooth'
              }
            }, 0)
          }
        })
      }
    }
    
    if (todayIndex !== -1 && scrollRef.current) {
      const targetPosition = todayIndex * CELL_WIDTH
      scrollToPosition(targetPosition)
      onDateChange?.(today)
      setVisibleMonth(today)
    } else {
      toast.message("Scrolling to today's date...")
      resetAroundToday()
      // Wait for state update then scroll
      setTimeout(() => {
        scrollToPosition(0) // Scroll to the beginning since today will be the first day
      }, 100)
    }
  }, [visibleDays, onDateChange, CELL_WIDTH, scrollRef, setVisibleMonth, resetAroundToday])

  return { scrollToToday }
}
