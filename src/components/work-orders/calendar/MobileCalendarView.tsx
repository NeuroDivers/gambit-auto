
import { addDays, startOfMonth } from "date-fns"
import { WorkOrder } from "../types"
import React, { useRef, useEffect, useState, useCallback } from "react"
import { MonthPicker } from "./MonthPicker"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { MobileCalendarHeader } from "./mobile/MobileCalendarHeader"
import { MobileCalendarGrid } from "./mobile/MobileCalendarGrid"
import { ServiceBay } from "@/components/service-bays/hooks/useServiceBays"

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
    // Initialize with 30 days
    const initialDays = Array.from({ length: 30 }, (_, i) => addDays(currentDate, i))
    setVisibleDays(initialDays)
  }, [currentDate])

  const loadMoreDays = useCallback(() => {
    const now = Date.now()
    if (isLoading || now - lastLoadTimeRef.current < 500) return
    
    console.log("Loading more days...")
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
    const todayIndex = visibleDays.findIndex(day => 
      day.getDate() === today.getDate() && 
      day.getMonth() === today.getMonth() && 
      day.getFullYear() === today.getFullYear()
    )
    
    if (todayIndex !== -1 && scrollRef.current) {
      const cellWidth = 68 // width + gap
      scrollRef.current.scrollLeft = todayIndex * cellWidth
      setVisibleMonth(today)
    }
  }, [visibleDays])

  // Update visible month based on scroll position
  const updateVisibleMonth = useCallback(() => {
    if (!scrollRef.current) return

    const scrollElement = scrollRef.current
    const scrollLeft = scrollElement.scrollLeft
    const elementWidth = scrollElement.clientWidth
    const cellWidth = 68 // width + gap
    
    // Calculate the center position of the viewport
    const centerPosition = scrollLeft + (elementWidth / 2)
    const centerIndex = Math.floor(centerPosition / cellWidth)
    
    if (visibleDays[centerIndex]) {
      setVisibleMonth(startOfMonth(visibleDays[centerIndex]))
    }

    // Check if we need to load more days
    const { scrollWidth } = scrollElement
    const remainingScroll = scrollWidth - (scrollLeft + elementWidth)
    if (remainingScroll < 300) {
      loadMoreDays()
    }
  }, [visibleDays, loadMoreDays])

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
