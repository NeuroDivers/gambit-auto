import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { WorkOrder } from "./types"
import { WorkOrderForm } from "./WorkOrderForm"

type EditWorkOrderDialogProps = {
  workOrder: WorkOrder
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditWorkOrderDialog({ workOrder, open, onOpenChange }: EditWorkOrderDialogProps) {
  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange} 
      modal={true}
    >
      <DialogContent 
        className="max-w-3xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Edit Work Order</DialogTitle>
          <DialogDescription>
            Make changes to the work order details below.
          </DialogDescription>
        </DialogHeader>
        <WorkOrderForm 
          workOrder={workOrder} 
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}