
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { WorkOrderFormValues } from "../types"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type TimeSelectionFieldsProps = {
  form: UseFormReturn<WorkOrderFormValues>
  disabled?: boolean
}

export function TimeSelectionFields({ form, disabled }: TimeSelectionFieldsProps) {
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
            <FormLabel htmlFor="start_time_button">Start Time</FormLabel>
            <Dialog>
              <DialogTrigger asChild>
                <FormControl>
                  <Button
                    id="start_time_button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={disabled}
                  >
                    {field.value ? (
                      format(field.value, "PPP HH:mm")
                    ) : (
                      <span>Pick a date and time</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select Date and Time</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Calendar
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={(date) => {
                      if (date) {
                        const currentValue = field.value || new Date()
                        date.setHours(currentValue.getHours())
                        date.setMinutes(currentValue.getMinutes())
                        field.onChange(date)
                      }
                    }}
                    initialFocus
                  />
                  <div className="pt-4 border-t">
                    <FormLabel htmlFor="time_input">Time</FormLabel>
                    <Input
                      id="time_input"
                      name="time_input"
                      type="time"
                      className="mt-2"
                      onChange={(e) => {
                        if (field.value) {
                          const [hours, minutes] = e.target.value.split(':')
                          const newDate = new Date(field.value)
                          newDate.setHours(parseInt(hours), parseInt(minutes))
                          field.onChange(newDate)
                        } else {
                          const newDate = new Date()
                          const [hours, minutes] = e.target.value.split(':')
                          newDate.setHours(parseInt(hours), parseInt(minutes))
                          field.onChange(newDate)
                        }
                      }}
                      value={field.value ? format(field.value, 'HH:mm') : ''}
                      disabled={disabled}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="estimated_duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="estimated_duration">Estimated Duration (hours)</FormLabel>
            <FormControl>
              <Input
                id="estimated_duration"
                name="estimated_duration"
                type="number"
                min={0}
                step={0.5}
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || '')}
                disabled={disabled}
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
            <FormLabel htmlFor="end_time">Estimated End Time</FormLabel>
            <FormControl>
              <Input
                id="end_time"
                name="end_time"
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
