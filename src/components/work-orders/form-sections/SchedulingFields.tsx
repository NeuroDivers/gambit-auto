
import { useState, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CalendarIcon, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addMinutes, differenceInMinutes } from "date-fns"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SchedulingFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>
}

export function SchedulingFields({ form }: SchedulingFieldsProps) {
  // Generate time options in 15-minute increments
  const timeOptions = []
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const formattedHour = hour.toString().padStart(2, '0')
      const formattedMinute = minute.toString().padStart(2, '0')
      timeOptions.push(`${formattedHour}:${formattedMinute}`)
    }
  }

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    form.getValues().start_time || undefined
  )

  // Helper to combine date and time
  const combineDateAndTime = (date: Date | null, timeString: string): Date | null => {
    if (!date) return null
    
    const [hours, minutes] = timeString.split(':').map(Number)
    const newDate = new Date(date)
    newDate.setHours(hours, minutes, 0, 0)
    return newDate
  }
  
  // Synchronize end time based on start time and duration
  useEffect(() => {
    const startTime = form.watch('start_time');
    const duration = form.watch('estimated_duration');
    
    if (startTime && duration) {
      // Calculate end time by adding minutes to start time
      const endTime = addMinutes(startTime, duration);
      form.setValue('end_time', endTime, { shouldValidate: true });
    }
  }, [form.watch('start_time'), form.watch('estimated_duration')]);

  // Calculate duration when end time is manually set
  useEffect(() => {
    const startTime = form.watch('start_time');
    const endTime = form.watch('end_time');
    
    if (startTime && endTime) {
      // Only update if the user manually changed the end time (not via our own effect)
      const calculatedDuration = differenceInMinutes(endTime, startTime);
      if (calculatedDuration > 0 && calculatedDuration !== form.watch('estimated_duration')) {
        form.setValue('estimated_duration', calculatedDuration, { shouldValidate: true });
      }
    }
  }, [form.watch('end_time')]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Scheduling</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="start_time"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Select date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={(date) => {
                      setSelectedDate(date || undefined)
                      if (date) {
                        // Preserve time if already set
                        const currentValue = field.value
                        if (currentValue) {
                          date.setHours(
                            currentValue.getHours(),
                            currentValue.getMinutes(),
                            0,
                            0
                          )
                        }
                        field.onChange(date)
                      } else {
                        field.onChange(null)
                      }
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="start_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <Select
                disabled={!selectedDate}
                onValueChange={(time) => {
                  const newDateTime = combineDateAndTime(selectedDate || null, time)
                  if (newDateTime) {
                    field.onChange(newDateTime)
                  }
                }}
                value={field.value ? format(field.value, "HH:mm") : undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time">
                      {field.value ? (
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {format(field.value, "h:mm a")}
                        </div>
                      ) : (
                        "Select time"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeOptions.map((time) => {
                    // Convert 24h format to 12h format for display
                    const [hours, minutes] = time.split(':').map(Number)
                    const displayTime = format(
                      new Date().setHours(hours, minutes, 0, 0),
                      "h:mm a"
                    )
                    
                    return (
                      <SelectItem key={time} value={time}>
                        {displayTime}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="estimated_duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Duration (minutes)</FormLabel>
              <FormControl>
                <Input
                  type="number" 
                  min="0"
                  step="15"
                  placeholder="e.g. 60"
                  {...field}
                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="end_time"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Date/Time</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP p")
                      ) : (
                        <span>Select date and time</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={(date) => {
                      if (date) {
                        // Preserve time if already set
                        const currentValue = field.value
                        if (currentValue) {
                          date.setHours(
                            currentValue.getHours(),
                            currentValue.getMinutes(),
                            0,
                            0
                          )
                        }
                        field.onChange(date)
                      } else {
                        field.onChange(null)
                      }
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
