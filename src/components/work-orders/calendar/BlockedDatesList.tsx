
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useBlockedDates } from "./hooks/useBlockedDates"
import { Separator } from "@/components/ui/separator"
import { DateRangeSelector } from "./components/DateRangeSelector"
import { BlockedDateItem } from "./components/BlockedDateItem"
import { BlockedDatesListView } from "./components/BlockedDatesList"

export function BlockedDatesList() {
  const queryClient = useQueryClient()
  
  const { 
    blockedDates, 
    isLoading, 
    addBlockedDate, 
    removeBlockedDate 
  } = useBlockedDates()

  const addBlockedDateMutation = useMutation({
    mutationFn: async (params: { startDate: Date, endDate: Date, reason: string }) => {
      const { startDate, endDate, reason } = params;
      return addBlockedDate(startDate, endDate, reason || null);
    },
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ["blockedDates"] })
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

  const handleAddBlockedDate = (startDate: Date, endDate: Date, reason: string) => {
    addBlockedDateMutation.mutate({ startDate, endDate, reason });
  }

  return (
    <div className="space-y-6">
      <DateRangeSelector 
        onAddBlockedDate={handleAddBlockedDate}
        isLoading={addBlockedDateMutation.isPending}
      />

      <Separator />

      <BlockedDatesListView blockedDates={blockedDates}>
        {blockedDates.map((blockedDate) => (
          <BlockedDateItem 
            key={blockedDate.id}
            blockedDate={blockedDate}
            onRemove={id => removeBlockedDateMutation.mutate(id)}
            isRemoving={removeBlockedDateMutation.isPending}
          />
        ))}
      </BlockedDatesListView>
    </div>
  )
}
