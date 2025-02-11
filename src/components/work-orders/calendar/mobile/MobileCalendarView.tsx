
import { addDays } from "date-fns"
import { WorkOrder } from "../../types"
import React, { useRef, useEffect, useState, useCallback } from "react"
import { MonthPicker } from "../MonthPicker"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { MobileCalendarHeader } from "./MobileCalendarHeader"
import { MobileCalendarGrid } from "./MobileCalendarGrid"
import { ServiceBay } from "@/components/service-bays/hooks/useServiceBays"
import { useBlockedDates } from "../hooks/useBlockedDates"

type MobileCalendarViewProps = {
  currentDate: Date
  workOrders: WorkOrder[]
  onDateChange?: (date: Date) => void
}

export function MobileCalendarView({ currentDate, workOrders, onDateChange }: MobileCalendarViewProps) {
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [visibleDays, setVisibleDays] = useState<Date[]>([])
  const [visibleMonth, setVisibleMonth] = useState(currentDate)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const lastLoadTimeRef = useRef<number>(0)
  const CELL_WIDTH = 68 // width + gap

  const { blockedDates } = useBlockedDates()

  const { data: serviceBays = [] } = useQuery({
    queryKey: ["serviceBays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("*")
        .order("name")
      
      if (error) throw error
      
      const bays = data.map(bay => ({
        id: bay.id,
        name: bay.name,
        status: bay.status || 'available',
        assigned_profile_id: bay.assigned_profile_id,
        notes: bay.notes
      })) as ServiceBay[]
      
      return bays
    }
  })

  useEffect(() => {
    // Initialize with 30 days starting from 15 days before the current date
    const startDate = new Date(currentDate)
    startDate.setDate(startDate.getDate() - 15)
    const initialDays = Array.from({ length: 30 }, (_, i) => addDays(startDate, i))
    setVisibleDays(initialDays)
  }, [currentDate])

  const loadMoreDays = useCallback(() => {
    const now = Date.now()
    if (isLoading || now - lastLoadTimeRef.current < 500) return
    
    setIsLoading(true)
    lastLoadTimeRef.current = now

    // Get the last day from the current visibleDays array
    const lastDay = visibleDays[visibleDays.length - 1]
    const newDays = Array.from({ length: 30 }, (_, i) => addDays(lastDay, i + 1))

    // Update visibleDays by appending the new days
    setVisibleDays(prevDays => [...prevDays, ...newDays])

    setTimeout(() => setIsLoading(false), 300)
  }, [isLoading, visibleDays])

  const scrollToToday = useCallback(() => {
    const today = new Date()
    // Reset the days array to start from today
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 15)
    const newDays = Array.from({ length: 30 }, (_, i) => addDays(startDate, i))
    setVisibleDays(newDays)
    
    // Wait for the state update and then scroll to center
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = 0 // Reset to start
        const centerOffset = 15 * CELL_WIDTH // Position "today" at the start
        scrollRef.current.scrollLeft = centerOffset
        onDateChange?.(today)
        setVisibleMonth(today)
      }
    }, 0)
  }, [onDateChange])

  const updateVisibleMonth = useCallback(() => {
    if (!scrollRef.current) return

    const scrollElement = scrollRef.current
    const scrollLeft = scrollElement.scrollLeft
    const elementWidth = scrollElement.clientWidth
    
    // Calculate the leftmost visible date index
    const leftmostIndex = Math.floor(scrollLeft / CELL_WIDTH)
    // Calculate the rightmost visible date index
    const rightmostIndex = Math.floor((scrollLeft + elementWidth) / CELL_WIDTH)
    
    // Get the date in the middle of the visible range
    const centerIndex = Math.floor((leftmostIndex + rightmostIndex) / 2)
    
    // Ensure we have a valid index and corresponding date
    if (centerIndex >= 0 && centerIndex < visibleDays.length) {
      const centerDate = visibleDays[centerIndex]
      onDateChange?.(centerDate)
      setVisibleMonth(centerDate)
    }

    // Check if we need to load more days
    const { scrollWidth } = scrollElement
    const remainingScroll = scrollWidth - (scrollLeft + elementWidth)
    if (remainingScroll < 500) {
      loadMoreDays()
    }
  }, [visibleDays, loadMoreDays, onDateChange])

  // Add scroll event listener with debounce
  useEffect(() => {
    const currentRef = scrollRef.current
    if (!currentRef) return

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }

      scrollTimeout = setTimeout(() => {
        updateVisibleMonth()
      }, 100)
    }

    currentRef.addEventListener('scroll', handleScroll)
    return () => {
      currentRef.removeEventListener('scroll', handleScroll)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    }
  }, [updateVisibleMonth])

  return (
    <div className="space-y-4">
      <MobileCalendarHeader
        currentDate={visibleMonth}
        onDateChange={onDateChange || (() => {})}
        onMonthPickerOpen={() => setShowMonthPicker(true)}
        onTodayClick={scrollToToday}
      />

      <MobileCalendarGrid
        visibleDays={visibleDays}
        workOrders={workOrders}
        serviceBays={serviceBays}
        onScroll={loadMoreDays}
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
