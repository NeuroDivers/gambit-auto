
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "../types";
import { FormField } from "@/components/ui/form";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SchedulingFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

export function SchedulingFields({ form }: SchedulingFieldsProps) {
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
                      "w-[240px] pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
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
                  selected={field.value || undefined}
                  onSelect={field.onChange}
                  initialFocus
                />
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
            <FormLabel>Estimated Duration (hours)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                value={field.value || ''}
                onChange={e => field.onChange(e.target.valueAsNumber || null)}
                placeholder="Enter estimated duration" 
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
