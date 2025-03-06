
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format, addDays, parseISO } from "date-fns"
import { Loader2, Trash2, CalendarRange } from "lucide-react"
import { useBlockedDates, BlockedDate } from "./hooks/useBlockedDates"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function BlockedDatesList() {
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(undefined)
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(undefined)
  const [blockReason, setBlockReason] = useState<string>("")
  const queryClient = useQueryClient()
  
  const { 
    blockedDates, 
    isLoading, 
    addBlockedDate, 
    removeBlockedDate 
  } = useBlockedDates()

  const addBlockedDateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStartDate) return false;
      
      // Use the same date as end date if not selected
      const endDate = selectedEndDate || selectedStartDate;
      
      return addBlockedDate(selectedStartDate, endDate, blockReason || null);
    },
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["blockedDates"] })
        setSelectedStartDate(undefined)
        setSelectedEndDate(undefined)
        setBlockReason("")
      }
    }
  })

  const removeBlockedDateMutation = useMutation({
    mutationFn: async (id: string) => {
      return removeBlockedDate(id);
    },
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["blockedDates"] })
      }
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  const handleAddDate = () => {
    if (!selectedStartDate) {
      toast.error("Please select a start date")
      return;
    }
    
    addBlockedDateMutation.mutate()
  }

  const calendarDate = selectedStartDate || new Date();

  // Prepare already blocked dates to disable in calendar
  const disabledDates = blockedDates?.flatMap(bd => {
    const startDate = parseISO(bd.start_date);
    const endDate = parseISO(bd.end_date);
    
    // Generate all dates in the range
    const dates: Date[] = [];
    let currentDate = startDate;
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    
    return dates;
  }) || [];

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-2 block">Block Date Range</Label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-full sm:w-1/2">
            <Label className="text-xs mb-1 block">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarRange className="mr-2 h-4 w-4" />
                  {selectedStartDate ? format(selectedStartDate, "PPP") : "Select start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedStartDate}
                  onSelect={setSelectedStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="w-full sm:w-1/2">
            <Label className="text-xs mb-1 block">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarRange className="mr-2 h-4 w-4" />
                  {selectedEndDate ? format(selectedEndDate, "PPP") : "Select end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedEndDate}
                  onSelect={setSelectedEndDate}
                  disabled={date => {
                    // Can't select end date before start date
                    return selectedStartDate ? date < selectedStartDate : false;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="mt-4">
          <Label htmlFor="block-reason" className="text-sm font-medium">Reason (optional)</Label>
          <Input
            id="block-reason"
            placeholder="Enter reason for blocking"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            className="mt-1"
          />
        </div>
        
        <Button 
          onClick={handleAddDate} 
          disabled={!selectedStartDate || addBlockedDateMutation.isPending}
          className="w-full mt-4"
        >
          {addBlockedDateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Block Date{selectedStartDate && selectedEndDate && selectedStartDate.getTime() !== selectedEndDate.getTime() ? " Range" : ""}
        </Button>
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="font-medium">Blocked Date Ranges</h4>
        {blockedDates && blockedDates.length > 0 ? (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {blockedDates.map((bd: BlockedDate) => {
              const startDate = parseISO(bd.start_date);
              const endDate = parseISO(bd.end_date);
              const isRange = bd.start_date !== bd.end_date;
              
              return (
                <div
                  key={bd.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="space-y-1">
                    <div className="font-medium">
                      {format(startDate, "MMMM d, yyyy")}
                      {isRange && ` - ${format(endDate, "MMMM d, yyyy")}`}
                    </div>
                    {bd.reason && (
                      <p className="text-sm text-muted-foreground">{bd.reason}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBlockedDateMutation.mutate(bd.id)}
                    disabled={removeBlockedDateMutation.isPending}
                  >
                    {removeBlockedDateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground p-4 text-center border rounded-md">
            No dates are currently blocked
          </p>
        )}
      </div>
    </div>
  )
}
