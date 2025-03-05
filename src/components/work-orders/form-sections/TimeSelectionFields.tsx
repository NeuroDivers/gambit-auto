
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format, addHours } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TimeSelectionFields() {
  const form = useFormContext();
  const durations = Array.from({ length: 12 }, (_, i) => (i + 1) * 30);
  
  // Ensure dates are properly converted
  const getDate = (value: Date | string | null): Date | null => {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  };

  // Watch for changes in start_time and estimated_duration
  const watchedStartTime = form.watch("start_time");
  const watchedDuration = form.watch("estimated_duration");
  
  // Convert start_time to Date object if it's a string
  const startDate = getDate(watchedStartTime);
  
  // Update end time when start time or duration changes
  useEffect(() => {
    if (startDate && watchedDuration) {
      const durationInMs = watchedDuration * 60 * 1000;
      const endDate = new Date(startDate.getTime() + durationInMs);
      form.setValue("end_time", endDate);
    }
  }, [startDate, watchedDuration, form]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="start_time"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Start Date & Time</FormLabel>
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
                      format(getDate(field.value) as Date, "PPP p")
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
                  selected={getDate(field.value) as Date}
                  onSelect={(date) => {
                    if (date) {
                      // Preserve the time from the existing value or default to current time
                      const existingDate = getDate(field.value);
                      const hours = existingDate ? existingDate.getHours() : new Date().getHours();
                      const minutes = existingDate ? existingDate.getMinutes() : new Date().getMinutes();
                      
                      const newDate = new Date(date);
                      newDate.setHours(hours);
                      newDate.setMinutes(minutes);
                      
                      field.onChange(newDate);
                    }
                  }}
                  initialFocus
                />
                <div className="p-3 border-t border-border">
                  <div className="flex space-x-2">
                    <Select
                      value={getDate(field.value) ? String(getDate(field.value)?.getHours()) : undefined}
                      onValueChange={(value) => {
                        const currentDate = getDate(field.value) || new Date();
                        const newDate = new Date(currentDate);
                        newDate.setHours(parseInt(value));
                        field.onChange(newDate);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={String(i)}>
                            {i.toString().padStart(2, "0")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={getDate(field.value) ? String(getDate(field.value)?.getMinutes()) : undefined}
                      onValueChange={(value) => {
                        const currentDate = getDate(field.value) || new Date();
                        const newDate = new Date(currentDate);
                        newDate.setMinutes(parseInt(value));
                        field.onChange(newDate);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Min" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                          <SelectItem key={minute} value={String(minute)}>
                            {minute.toString().padStart(2, "0")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="estimated_duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Duration (minutes)</FormLabel>
            <Select
              value={field.value?.toString()}
              onValueChange={(value) => {
                field.onChange(parseInt(value));
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {durations.map((duration) => (
                  <SelectItem key={duration} value={duration.toString()}>
                    {duration} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="end_time"
        render={({ field }) => (
          <FormItem>
            <FormLabel>End Time (calculated)</FormLabel>
            <FormControl>
              <Input
                value={field.value ? format(getDate(field.value) as Date, "PPP p") : ""}
                disabled
                readOnly
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
