
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { format } from "date-fns"
import { Loader2, Trash2 } from "lucide-react"

export function BlockedDatesList() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const queryClient = useQueryClient()

  const { data: blockedDates, isLoading } = useQuery({
    queryKey: ["blocked-dates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocked_dates")
        .select("*")
        .order("date", { ascending: true })

      if (error) throw error
      return data
    }
  })

  const addBlockedDate = useMutation({
    mutationFn: async (date: Date) => {
      const { error } = await supabase
        .from("blocked_dates")
        .insert([{ date: format(date, "yyyy-MM-dd") }])

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-dates"] })
      toast.success("Date blocked successfully")
      setSelectedDate(undefined)
    },
    onError: () => {
      toast.error("Failed to block date")
    }
  })

  const removeBlockedDate = useMutation({
    mutationFn: async (date: string) => {
      const { error } = await supabase
        .from("blocked_dates")
        .delete()
        .eq("date", date)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-dates"] })
      toast.success("Date unblocked successfully")
    },
    onError: () => {
      toast.error("Failed to unblock date")
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
    if (selectedDate) {
      addBlockedDate.mutate(selectedDate)
    }
  }

  const disabledDays = blockedDates?.map(bd => new Date(bd.date)) || []

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={disabledDays}
        />
        <Button 
          onClick={handleAddDate} 
          disabled={!selectedDate}
          className="w-full"
        >
          Block Selected Date
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Blocked Dates</h4>
        {blockedDates && blockedDates.length > 0 ? (
          <div className="space-y-2">
            {blockedDates.map((bd) => (
              <div
                key={bd.date}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <span>{format(new Date(bd.date), "MMMM d, yyyy")}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBlockedDate.mutate(bd.date)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No blocked dates</p>
        )}
      </div>
    </div>
  )
}
