import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useEffect } from "react"

export function TimeSelectionFields({
  form,
}: {
  form: UseFormReturn<WorkOrderFormValues>
}) {
  // Calculate end time when start time or duration changes
  useEffect(() => {
    const startTime = form.getValues("start_time")
    const duration = form.getValues("estimated_duration")

    if (startTime && duration) {
      const endTime = new Date(startTime)
      endTime.setHours(endTime.getHours() + duration)
      form.setValue("end_time", endTime)
    }
  }, [form.watch("start_time"), form.watch("estimated_duration")])

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="start_time"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Start Time</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP HH:mm")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
                <div className="p-3 border-t">
                  <Input
                    type="time"
                    onChange={(e) => {
                      if (field.value) {
                        const [hours, minutes] = e.target.value.split(':')
                        const newDate = new Date(field.value)
                        newDate.setHours(parseInt(hours), parseInt(minutes))
                        field.onChange(newDate)
                      }
                    }}
                    value={field.value ? format(field.value, 'HH:mm') : ''}
                  />
                </div>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="estimated_duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estimated Duration (hours)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                step={0.5}
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
          <FormItem>
            <FormLabel>Estimated End Time</FormLabel>
            <FormControl>
              <Input
                value={field.value ? format(field.value, 'PPP HH:mm') : ''}
                disabled
                className="bg-muted"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}