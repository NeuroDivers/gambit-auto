
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { WorkOrder } from "../../types"
import { useVisibleDays } from "./hooks/useVisibleDays"
import { useCalendarScroll } from "./hooks/useCalendarScroll"
import { useServiceBays } from "./hooks/useServiceBays"

interface MobileCalendarContextType {
  currentDate: Date
  visibleMonth: Date
  visibleDays: Date[]
  serviceBays: any[]
  scrollRef: React.RefObject<HTMLDivElement>
  showMonthPicker: boolean
  handleDateChange: (date: Date) => void
  setShowMonthPicker: (show: boolean) => void
  scrollToToday: () => void
}

const MobileCalendarContext = createContext<MobileCalendarContextType | undefined>(undefined)

export const useMobileCalendar = () => {
  const context = useContext(MobileCalendarContext)
  if (!context) {
    throw new Error("useMobileCalendar must be used within a MobileCalendarProvider")
  }
  return context
}

interface MobileCalendarProviderProps {
  children: React.ReactNode
  currentDate: Date
  workOrders: WorkOrder[]
  onDateChange?: (date: Date) => void
}

const CELL_WIDTH = 64

export function MobileCalendarProvider({ 
  children, 
  currentDate, 
  onDateChange 
}: MobileCalendarProviderProps) {
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(currentDate)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { 
    visibleDays, 
    loadMoreDays, 
    resetVisibleDays,
    resetAroundToday 
  } = useVisibleDays(currentDate)

  const { data: serviceBays = [] } = useServiceBays()

  const { scrollToToday } = useCalendarScroll({
    visibleDays,
    scrollRef,
    onDateChange,
    setVisibleMonth,
    resetAroundToday,
    CELL_WIDTH
  })

  const handleDateChange = useCallback((date: Date) => {
    onDateChange?.(date)
    setVisibleMonth(date)
    resetVisibleDays(date)
    
    // Scroll to the beginning after a short delay to allow for state update
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = 0
      }
    }, 100)
  }, [onDateChange, resetVisibleDays])

  const updateVisibleMonth = useCallback(() => {
    if (!scrollRef.current) return

    const scrollElement = scrollRef.current
    const scrollLeft = scrollElement.scrollLeft
    const elementWidth = scrollElement.clientWidth
    
    // Calculate the center position
    const centerScrollPosition = scrollLeft + (elementWidth / 2)
    const centerDayIndex = Math.floor(centerScrollPosition / CELL_WIDTH)
    
    // Check if we need to load more days
    const { scrollWidth } = scrollElement
    const remainingScroll = scrollWidth - (scrollLeft + elementWidth)
    const scrolledPercent = scrollLeft / scrollWidth

    if (scrolledPercent < 0.2) {
      loadMoreDays('past')
    } else if (remainingScroll < elementWidth * 0.5) {
      loadMoreDays('future')
    }

    // Update visible month and current date
    if (centerDayIndex >= 0 && centerDayIndex < visibleDays.length) {
      const centerDate = visibleDays[centerDayIndex]
      setVisibleMonth(centerDate)
      onDateChange?.(centerDate)
    }
  }, [visibleDays, loadMoreDays, onDateChange])

  useEffect(() => {
    const currentRef = scrollRef.current
    if (!currentRef) return

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(updateVisibleMonth, 100)
    }

    currentRef.addEventListener('scroll', handleScroll)
    return () => {
      currentRef.removeEventListener('scroll', handleScroll)
      if (scrollTimeout) clearTimeout(scrollTimeout)
    }
  }, [updateVisibleMonth])

  // Initial scroll to center the calendar
  useEffect(() => {
    if (scrollRef.current) {
      const initialScrollPosition = 15 * CELL_WIDTH
      scrollRef.current.scrollLeft = initialScrollPosition
    }
  }, [])

  const value = {
    currentDate,
    visibleMonth,
    visibleDays,
    serviceBays,
    scrollRef,
    showMonthPicker,
    handleDateChange,
    setShowMonthPicker,
    scrollToToday
  }

  return (
    <MobileCalendarContext.Provider value={value}>
      {children}
    </MobileCalendarContext.Provider>
  )
}
