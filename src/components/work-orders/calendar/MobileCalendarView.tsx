
import { addDays } from "date-fns"
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)

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
    if (isLoading) return

    setIsLoading(true)
    const lastDay = visibleDays[visibleDays.length - 1]
    const nextDays = Array.from({ length: 10 }, (_, i) => addDays(lastDay, i + 1))
    
    setVisibleDays(prev => [...prev, ...nextDays])
    setIsLoading(false)
  }, [visibleDays, isLoading])

  return (
    <div className="space-y-4">
      <MobileCalendarHeader
        currentDate={currentDate}
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
        currentDate={currentDate}
        onDateChange={onDateChange || (() => {})}
      />
    </div>
  )
}
