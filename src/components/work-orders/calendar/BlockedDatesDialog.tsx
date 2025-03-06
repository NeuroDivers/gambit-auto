
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { BlockedDatesList } from "./BlockedDatesList"
import { Button } from "@/components/ui/button"
import { CalendarOff } from "lucide-react"
import { useBlockedDates } from "./hooks/useBlockedDates"
import { Badge } from "@/components/ui/badge"

export function BlockedDatesDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const { blockedDates, isLoading } = useBlockedDates()
  
  const blockedCount = blockedDates?.length || 0

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
          <Badge variant="secondary" className="ml-1">
            {blockedCount}
          </Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Manage Blocked Dates</DialogTitle>
          </DialogHeader>
          <BlockedDatesList />
        </DialogContent>
      </Dialog>
    </>
  )
}
