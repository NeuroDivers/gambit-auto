
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { WorkOrderForm } from "./WorkOrderForm"
import { useState } from "react"

type CreateWorkOrderDialogProps = {
  defaultStartTime?: Date
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateWorkOrderDialog({ defaultStartTime, open: controlledOpen, onOpenChange }: CreateWorkOrderDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-full w-screen h-screen max-h-screen overflow-y-auto p-0 m-0 rounded-none">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Create Work Order</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new work order.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 pt-2">
          <WorkOrderForm 
            onSuccess={() => setOpen(false)} 
            defaultStartTime={defaultStartTime}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
