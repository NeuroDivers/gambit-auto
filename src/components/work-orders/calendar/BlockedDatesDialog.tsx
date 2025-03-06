
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { BlockedDatesList } from "./BlockedDatesList"
import { Button } from "@/components/ui/button"
import { CalendarOff } from "lucide-react"

export function BlockedDatesDialog() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <CalendarOff className="h-4 w-4" />
        <span>Manage Blocked Dates</span>
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
