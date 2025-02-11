
import { addDays, startOfMonth, isWithinInterval, endOfMonth } from "date-fns"
import React, { useRef, useEffect, useState, useCallback } from "react"
import { WorkOrder } from "@/components/work-orders/types"
import { MonthPicker } from "../MonthPicker"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { MobileCalendarHeader } from "./MobileCalendarHeader"
import { MobileCalendarGrid } from "./MobileCalendarGrid"
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

  // Update visible month based on scroll position
  const updateVisibleMonth = useCallback(() => {
    if (!scrollRef.current) return

    const scrollElement = scrollRef.current
    const scrollLeft = scrollElement.scrollLeft
    const cellWidth = 68 // width + gap (64px + 4px)
    const visibleIndex = Math.floor(scrollLeft / cellWidth)
    
    if (visibleDays[visibleIndex]) {
      const newVisibleMonth = startOfMonth(visibleDays[visibleIndex])
      setVisibleMonth(newVisibleMonth)
    }
  }, [visibleDays])

  // Add scroll event listener
  useEffect(() => {
    const currentRef = scrollRef.current
    if (!currentRef) return

    const handleScroll = () => {
      updateVisibleMonth()

      // Check if we need to load more days
      const { scrollLeft, scrollWidth, clientWidth } = currentRef
      if (scrollWidth - (scrollLeft + clientWidth) < 300) { // Trigger earlier
        loadMoreDays()
      }
    }

    currentRef.addEventListener('scroll', handleScroll)
    return () => currentRef.removeEventListener('scroll', handleScroll)
  }, [updateVisibleMonth])

  const loadMoreDays = useCallback(() => {
    const now = Date.now()
    if (isLoading || now - lastLoadTimeRef.current < 500) return
    
    console.log("Loading more days...")
    setIsLoading(true)
    lastLoadTimeRef.current = now

    setVisibleDays(prev => {
      const lastDay = prev[prev.length - 1]
      const newDays = Array.from({ length: 30 }, (_, i) => addDays(lastDay, i + 1))
      return [...prev, ...newDays]
    })

    setTimeout(() => setIsLoading(false), 300)
  }, [isLoading])

  return (
    <div className="space-y-4">
      <MobileCalendarHeader
        currentDate={visibleMonth}
        onDateChange={onDateChange || (() => {})}
        onMonthPickerOpen={() => setShowMonthPicker(true)}
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
