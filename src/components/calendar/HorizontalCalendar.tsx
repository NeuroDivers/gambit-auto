
import React, { useEffect, useRef, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { add, eachDayOfInterval, endOfMonth, endOfWeek, format, getDay, isEqual, isSameDay, isSameMonth, isToday, parse, startOfMonth, startOfToday, startOfWeek } from 'date-fns'
import { cn } from '@/lib/utils'
import { useDragScroll } from './hooks/useDragScroll'
import { WorkOrder } from '@/components/work-orders/types'

export interface HorizontalCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  range?: 'week' | 'month';
  className?: string;
  workOrders?: WorkOrder[] | { id: string; start_time: string }[];
}

export function HorizontalCalendar({ 
  selectedDate, 
  onDateSelect, 
  range = 'week', 
  className,
  workOrders = [] 
}: HorizontalCalendarProps) {
  const today = startOfToday()
  const [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'))
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date())
  const [view, setView] = useState<'week' | 'month'>(range)
  
  const daysRef = useRef<HTMLDivElement>(null)
  const { handleMouseDown } = useDragScroll(daysRef)

  // Get all days in current month view
  const days = view === 'month' 
    ? eachDayOfInterval({
        start: startOfWeek(startOfMonth(firstDayCurrentMonth)),
        end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
      })
    : eachDayOfInterval({
        start: startOfWeek(today),
        end: endOfWeek(add(today, { days: 6 })),
      })

  useEffect(() => {
    // Scroll to today's date when component mounts
    if (daysRef.current) {
      const todayElement = daysRef.current.querySelector('[data-today="true"]')
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: 'smooth', inline: 'center' })
      }
    }
  }, [view])

  function previousMonth() {
    const firstDayPreviousMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayPreviousMonth, 'MMM-yyyy'))
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'))
  }

  // Function to handle date changes
  const handleDateChange = (day: Date) => {
    onDateSelect(day)
  }

  // Check if a day has workOrders
  const getDayStatus = (day: Date) => {
    if (!workOrders?.length) return null;
    
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    
    // Check if any work order falls on this day
    const hasWorkOrders = workOrders.some(order => {
      if (!order.start_time) return false;
      
      const orderDate = new Date(order.start_time);
      return orderDate >= dayStart && orderDate <= dayEnd;
    });
    
    return hasWorkOrders ? 'has-events' : null;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-semibold">{format(firstDayCurrentMonth, 'MMMM yyyy')}</h2>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onDateSelect(today)}
          >
            Today
          </Button>
          
          <Tabs 
            defaultValue={view} 
            value={view}
            onValueChange={(value) => setView(value as 'week' | 'month')}
          >
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div 
        ref={daysRef}
        onMouseDown={handleMouseDown}
        className="flex overflow-x-auto pb-4 cursor-grab active:cursor-grabbing"
      >
        <div className="flex space-x-1 min-w-full">
          {days.map((day, dayIdx) => {
            const dayStatus = getDayStatus(day);
            
            return (
              <div
                key={day.toString()}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[3rem] rounded-lg py-2 transition-colors",
                  isEqual(day, selectedDate) && "bg-primary text-primary-foreground",
                  !isEqual(day, selectedDate) && isToday(day) && "bg-muted",
                  !isEqual(day, selectedDate) && !isToday(day) && isSameMonth(day, firstDayCurrentMonth) && "bg-background hover:bg-muted",
                  !isEqual(day, selectedDate) && !isToday(day) && !isSameMonth(day, firstDayCurrentMonth) && "bg-muted/30 text-muted-foreground",
                  (dayIdx === 0 || getDay(day) === 0) && "rounded-l-lg",
                  (dayIdx === days.length - 1 || getDay(day) === 6) && "rounded-r-lg",
                  "cursor-pointer",
                  dayStatus === 'has-events' && !isEqual(day, selectedDate) && "border-b-2 border-primary"
                )}
                onClick={() => handleDateChange(day)}
                data-today={isToday(day) ? "true" : "false"}
              >
                <div className={cn(
                  "text-xs font-medium",
                  (getDay(day) === 0 || getDay(day) === 6) && !isEqual(day, selectedDate) && "text-rose-500"
                )}>
                  {format(day, 'EEE')}
                </div>
                <div className="text-lg font-semibold">{format(day, 'd')}</div>
                {dayStatus === 'has-events' && !isEqual(day, selectedDate) && (
                  <div className="w-1 h-1 rounded-full bg-primary mt-1"></div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
