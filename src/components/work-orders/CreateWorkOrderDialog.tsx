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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Work Order</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new work order.
          </DialogDescription>
        </DialogHeader>
        <WorkOrderForm 
          onSuccess={() => setOpen(false)} 
          defaultStartTime={defaultStartTime}
        />
      </DialogContent>
    </Dialog>
  )
}