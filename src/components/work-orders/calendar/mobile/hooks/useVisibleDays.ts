
import { useState, useCallback } from "react"
import { addDays, startOfDay, subDays } from "date-fns"

export const useVisibleDays = (currentDate: Date, DAYS_TO_LOAD = 30) => {
  const [isLoading, setIsLoading] = useState(false)
  const lastLoadTimeRef = { current: 0 }

  // Initialize visible days with only future dates
  const [visibleDays, setVisibleDays] = useState<Date[]>(() => {
    const initialDate = startOfDay(currentDate)
    const futureDays = Array.from({ length: 30 }, (_, i) => addDays(initialDate, i))
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
    const newDays = Array.from({ length: 30 }, (_, i) => addDays(startOfDay(date), i))
    setVisibleDays(newDays)
  }, [])

  const resetAroundToday = useCallback(() => {
    const today = startOfDay(new Date())
    const pastDays = Array.from({ length: 15 }, (_, i) => subDays(today, 15 - i))
    const futureDays = Array.from({ length: 15 }, (_, i) => addDays(today, i))
    setVisibleDays([...pastDays, ...futureDays])
  }, [])

  return {
    visibleDays,
    loadMoreDays,
    resetVisibleDays,
    resetAroundToday,
    isLoading
  }
}
