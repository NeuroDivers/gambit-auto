
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { WorkOrderFormValues } from "@/components/work-orders/types";

export function TimeSelectionFields() {
  const form = useFormContext<WorkOrderFormValues>();
  
  // Get the current values for start_time and duration
  const startTime = form.watch("start_time") || null;
  const duration = form.watch("estimated_duration") || null;
  
  // Calculate the end time if both start time and duration are available
  const calculateEndTime = () => {
    if (!startTime || !duration) return null;
    
    // Ensure startTime is a Date object
    const startDate = startTime instanceof Date ? startTime : new Date(startTime);
    
    // Create a new date for end time
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + Number(duration));
    
    form.setValue("end_time", endDate);
  };

  return (
    <div className="space-y-6 py-2">
      <div>
        <h3 className="text-lg font-medium mb-4">Schedule</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Select the date and time for this work order.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date/Time Picker */}
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
                            field.value instanceof Date ? 
                              format(field.value, "PPP p") : 
                              format(new Date(field.value), "PPP p")
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
                        selected={field.value instanceof Date ? field.value : field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            // If field.value is already a Date, preserve the time
                            if (field.value) {
                              const existingDate = field.value instanceof Date ? 
                                field.value : 
                                new Date(field.value);
                              
                              date.setHours(existingDate.getHours());
                              date.setMinutes(existingDate.getMinutes());
                            } else {
                              // Default to current time if no time set
                              const now = new Date();
                              date.setHours(now.getHours());
                              date.setMinutes(now.getMinutes());
                            }
                            field.onChange(date);
                          }
                        }}
                      />
                      
                      {field.value && (
                        <div className="p-3 border-t border-border">
                          <div className="space-y-2">
                            <Label>Time</Label>
                            <div className="flex space-x-2">
                              <Input
                                type="time"
                                value={field.value instanceof Date ? 
                                  `${String(field.value.getHours()).padStart(2, '0')}:${String(field.value.getMinutes()).padStart(2, '0')}` : 
                                  field.value ? 
                                    `${String(new Date(field.value).getHours()).padStart(2, '0')}:${String(new Date(field.value).getMinutes()).padStart(2, '0')}` : 
                                    ''}
                                onChange={(e) => {
                                  if (e.target.value && field.value) {
                                    const [hours, minutes] = e.target.value.split(':').map(Number);
                                    const dateVal = field.value instanceof Date ? 
                                      field.value : 
                                      new Date(field.value);
                                    
                                    dateVal.setHours(hours);
                                    dateVal.setMinutes(minutes);
                                    field.onChange(new Date(dateVal));
                                  }
                                }}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Estimated Duration */}
            <FormField
              control={form.control}
              name="estimated_duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Duration (minutes)</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="15"
                        step="15"
                        placeholder="60"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value === '' ? null : Number(e.target.value));
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={calculateEndTime}
                        disabled={!startTime || !duration}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Calculate End Time
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* End Time */}
          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date & Time</FormLabel>
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
                          field.value instanceof Date ? 
                            format(field.value, "PPP p") : 
                            format(new Date(field.value), "PPP p")
                        ) : (
                          <span>Calculate or select end time</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value instanceof Date ? field.value : field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          // If field.value is already a Date, preserve the time
                          if (field.value) {
                            const existingDate = field.value instanceof Date ? 
                              field.value : 
                              new Date(field.value);
                            
                            date.setHours(existingDate.getHours());
                            date.setMinutes(existingDate.getMinutes());
                          } else {
                            // Default to current time if no time set
                            const now = new Date();
                            date.setHours(now.getHours());
                            date.setMinutes(now.getMinutes());
                          }
                          field.onChange(date);
                        }
                      }}
                    />
                    
                    {field.value && (
                      <div className="p-3 border-t border-border">
                        <div className="space-y-2">
                          <Label>Time</Label>
                          <div className="flex space-x-2">
                            <Input
                              type="time"
                              value={field.value instanceof Date ? 
                                `${String(field.value.getHours()).padStart(2, '0')}:${String(field.value.getMinutes()).padStart(2, '0')}` : 
                                field.value ? 
                                  `${String(new Date(field.value).getHours()).padStart(2, '0')}:${String(new Date(field.value).getMinutes()).padStart(2, '0')}` : 
                                  ''}
                              onChange={(e) => {
                                if (e.target.value && field.value) {
                                  const [hours, minutes] = e.target.value.split(':').map(Number);
                                  const dateVal = field.value instanceof Date ? 
                                    field.value : 
                                    new Date(field.value);
                                  
                                  dateVal.setHours(hours);
                                  dateVal.setMinutes(minutes);
                                  field.onChange(new Date(dateVal));
                                }
                              }}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
