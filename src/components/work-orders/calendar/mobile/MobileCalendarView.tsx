
import { addDays, startOfDay, subDays, isSameDay } from "date-fns"
import { WorkOrder } from "../../types"
import React, { useRef, useEffect, useState, useCallback } from "react"
import { MonthPicker } from "../MonthPicker"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { MobileCalendarHeader } from "./MobileCalendarHeader"
import { MobileCalendarGrid } from "./MobileCalendarGrid"
import { ServiceBay } from "@/components/service-bays/hooks/useServiceBays"
import { useBlockedDates } from "../hooks/useBlockedDates"
import { toast } from "sonner"

type MobileCalendarViewProps = {
  currentDate: Date
  workOrders: WorkOrder[]
  onDateChange?: (date: Date) => void
}

export function MobileCalendarView({ currentDate, workOrders, onDateChange }: MobileCalendarViewProps) {
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(currentDate)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const lastLoadTimeRef = useRef<number>(0)
  const { blockedDates } = useBlockedDates()
  const DAYS_TO_LOAD = 30
  const CELL_WIDTH = 64 // width of each day cell

  // Initialize visible days with only future dates
  const [visibleDays, setVisibleDays] = useState<Date[]>(() => {
    const initialDate = startOfDay(currentDate)
    const futureDays = Array.from({ length: 30 }, (_, i) => addDays(initialDate, i))
    return futureDays
  })

  const { data: serviceBays = [] } = useQuery({
    queryKey: ["serviceBays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("*")
        .order("name")
      
      if (error) throw error
      return data as ServiceBay[]
    }
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

  const resetVisibleDays = useCallback((centerDate: Date) => {
    // Set visible days around the center date, with centerDate at index 15
    const pastDays = Array.from({ length: 15 }, (_, i) => subDays(centerDate, 15 - i))
    const futureDays = Array.from({ length: 15 }, (_, i) => addDays(centerDate, i))
    setVisibleDays([...pastDays, ...futureDays])
  }, [])

  const scrollToToday = useCallback(() => {
    const today = startOfDay(new Date())
    
    // Reset visible days around today
    resetVisibleDays(today)
    
    // Wait for state update then scroll
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          left: 15 * CELL_WIDTH, // Scroll to center where today should be
          behavior: 'smooth'
        })
      }
      onDateChange?.(today)
      setVisibleMonth(today)
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

  const handleDateChange = (date: Date) => {
    onDateChange?.(date)
    setVisibleMonth(date)
    
    // Reset visible days around the new date
    resetVisibleDays(date)
    
    // Scroll to the center after a short delay to allow for state update
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          left: 15 * CELL_WIDTH,
          behavior: 'smooth'
        })
      }
    }, 100)
  }

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
      const initialScrollPosition = 15 * CELL_WIDTH // Scroll to the middle of the initial range
      scrollRef.current.scrollLeft = initialScrollPosition
    }
  }, [])

  return (
    <div className="space-y-4">
      <MobileCalendarHeader
        currentDate={visibleMonth}
        onDateChange={handleDateChange}
        onMonthPickerOpen={() => setShowMonthPicker(true)}
        onTodayClick={scrollToToday}
      />

      <MobileCalendarGrid
        visibleDays={visibleDays}
        workOrders={workOrders}
        serviceBays={serviceBays}
        onScroll={updateVisibleMonth}
        onDateClick={onDateChange || (() => {})}
        scrollRef={scrollRef}
        blockedDates={blockedDates}
      />

      <MonthPicker
        open={showMonthPicker}
        onOpenChange={setShowMonthPicker}
        currentDate={visibleMonth}
        onDateChange={onDateChange || (() => {})}
      />
    </div>
  )
}
