
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CalendarOff, Plus, Calendar } from "lucide-react"
import { useBlockedDates, BlockedDate } from "./hooks/useBlockedDates"
import { Badge } from "@/components/ui/badge"
import { BlockedDateItem } from "./components/BlockedDateItem"
import { BlockedDatesListView } from "./components/BlockedDatesList"
import { DateRangeSelector } from "./components/DateRangeSelector"

export function BlockedDatesDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const { blockedDates, isLoading, removeBlockedDate, addBlockedDate } = useBlockedDates()
  
  const blockedCount = blockedDates?.length || 0

  const handleAddBlockedDate = async (startDate: Date, endDate: Date, reason: string | null) => {
    const success = await addBlockedDate(startDate, endDate, reason)
    if (success) {
      setShowAddForm(false)
    }
  }

  const handleDeleteBlockedDate = async (id: string) => {
    await removeBlockedDate(id)
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <CalendarOff className="h-4 w-4" />
        <span>Manage Blocked Dates</span>
        {!isLoading && blockedCount > 0 && (
          <Badge variant="destructive" className="ml-1">
            {blockedCount}
          </Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CalendarOff className="h-5 w-5" />
              Manage Blocked Dates
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {showAddForm ? (
              <div className="border rounded-md p-4 bg-muted/20">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Block New Date Range
                </h4>
                
                <DateRangeSelector 
                  onSubmit={handleAddBlockedDate}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            ) : (
              <Button 
                onClick={() => setShowAddForm(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Block New Date Range
              </Button>
            )}
            
            <BlockedDatesListView blockedDates={blockedDates}>
              {blockedDates?.map((blockedDate: BlockedDate) => (
                <BlockedDateItem
                  key={blockedDate.id}
                  blockedDate={blockedDate}
                  onDelete={() => handleDeleteBlockedDate(blockedDate.id)}
                />
              ))}
            </BlockedDatesListView>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
