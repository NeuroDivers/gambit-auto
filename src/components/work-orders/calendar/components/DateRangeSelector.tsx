
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Loader2, CalendarRange } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "sonner"

interface DateRangeSelectorProps {
  onAddBlockedDate: (startDate: Date, endDate: Date, reason: string) => void
  isLoading: boolean
}

export function DateRangeSelector({ onAddBlockedDate, isLoading }: DateRangeSelectorProps) {
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(undefined)
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(undefined)
  const [blockReason, setBlockReason] = useState<string>("")

  const handleAddDate = () => {
    if (!selectedStartDate) {
      toast.error("Please select a start date")
      return;
    }
    
    // Use the same date as end date if not selected
    const endDate = selectedEndDate || selectedStartDate;
    
    onAddBlockedDate(selectedStartDate, endDate, blockReason);
    
    // Reset form after submission
    setSelectedStartDate(undefined);
    setSelectedEndDate(undefined);
    setBlockReason("");
  }

  return (
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
        disabled={!selectedStartDate || isLoading}
        className="w-full mt-4"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Block Date{selectedStartDate && selectedEndDate && selectedStartDate.getTime() !== selectedEndDate.getTime() ? " Range" : ""}
      </Button>
    </div>
  )
}
