
import { useState, useCallback } from "react"
import { addDays, startOfDay, isBefore } from "date-fns"

export const useVisibleDays = (currentDate: Date, DAYS_TO_LOAD = 30) => {
  const [isLoading, setIsLoading] = useState(false)
  const lastLoadTimeRef = { current: 0 }
  const today = startOfDay(new Date())

  // Initialize visible days with only future dates starting from today
  const [visibleDays, setVisibleDays] = useState<Date[]>(() => {
    const initialDate = startOfDay(currentDate)
    // If currentDate is in the past, use today instead
    const startDate = isBefore(initialDate, today) ? today : initialDate
    const futureDays = Array.from({ length: 30 }, (_, i) => addDays(startDate, i))
    return futureDays
  })

  const loadMoreDays = useCallback((direction: 'past' | 'future') => {
    const now = Date.now()
    if (isLoading || now - lastLoadTimeRef.current < 500) return
    
    setIsLoading(true)
    lastLoadTimeRef.current = now

    setVisibleDays(prevDays => {
      if (direction === 'past') {
        // Don't load past days
        return prevDays
      } else {
        const lastDay = prevDays[prevDays.length - 1]
        const newFutureDays = Array.from(
          { length: DAYS_TO_LOAD }, 
          (_, i) => addDays(lastDay, i + 1)
        )
        return [...prevDays, ...newFutureDays]
      }
    })

    setTimeout(() => setIsLoading(false), 300)
  }, [isLoading])

  const resetVisibleDays = useCallback((date: Date) => {
    const startDate = isBefore(date, today) ? today : date
    const newDays = Array.from({ length: 30 }, (_, i) => addDays(startDate, i))
    setVisibleDays(newDays)
  }, [today])

  const resetAroundToday = useCallback(() => {
    const newDays = Array.from({ length: 30 }, (_, i) => addDays(today, i))
    setVisibleDays(newDays)
  }, [today])

  return {
    visibleDays,
    loadMoreDays,
    resetVisibleDays,
    resetAroundToday,
    isLoading
  }
}
