
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"
import { WorkOrderForm } from "./WorkOrderForm"

type CreateWorkOrderDialogProps = {
  defaultStartTime?: Date
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateWorkOrderDialog({ defaultStartTime, open: controlledOpen, onOpenChange }: CreateWorkOrderDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Work Order</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <WorkOrderForm 
            onSuccess={() => setOpen(false)} 
            defaultStartTime={defaultStartTime}
            onSubmitting={setIsSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
