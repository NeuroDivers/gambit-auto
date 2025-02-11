
import { addDays } from "date-fns"
import { WorkOrder } from "../types"
import React, { useRef, useEffect, useState } from "react"
import { MonthPicker } from "./MonthPicker"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { MobileCalendarHeader } from "./mobile/MobileCalendarHeader"
import { MobileCalendarGrid } from "./mobile/MobileCalendarGrid"

type MobileCalendarViewProps = {
  currentDate: Date
  workOrders: WorkOrder[]
  onDateChange?: (date: Date) => void
}

export function MobileCalendarView({ currentDate, workOrders, onDateChange }: MobileCalendarViewProps) {
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [visibleDays, setVisibleDays] = useState<Date[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: serviceBays = [] } = useQuery({
    queryKey: ["serviceBays"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bays")
        .select("id, name")
        .order("name")
      
      if (error) throw error
      return data
    }
  })

  useEffect(() => {
    // Initialize with 20 days
    const initialDays = Array.from({ length: 20 }, (_, i) => addDays(currentDate, i))
    setVisibleDays(initialDays)
  }, [currentDate])

  const loadMoreDays = () => {
    const lastDay = visibleDays[visibleDays.length - 1]
    const nextDays = Array.from({ length: 10 }, (_, i) => addDays(lastDay, i + 1))
    setVisibleDays([...visibleDays, ...nextDays])
  }

  const handleScroll = () => {
    if (!scrollRef.current) return
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    if (scrollWidth - (scrollLeft + clientWidth) < 200) {
      loadMoreDays()
    }
  }

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
        onScroll={handleScroll}
        onDateClick={onDateChange || (() => {})}
        scrollRef={scrollRef}
      />

      <MonthPicker
        currentDate={currentDate}
        open={showMonthPicker}
        onOpenChange={setShowMonthPicker}
        onDateChange={onDateChange || (() => {})}
      />
    </div>
  )
}
