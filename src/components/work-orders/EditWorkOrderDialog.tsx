
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { WorkOrder } from "./types"
import { WorkOrderForm } from "./WorkOrderForm"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCallback, useState } from "react"

type EditWorkOrderDialogProps = {
  workOrder: WorkOrder
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditWorkOrderDialog({ workOrder, open, onOpenChange }: EditWorkOrderDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSuccess = useCallback(() => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }, [onOpenChange, isSubmitting])

  const handleSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting)
  }, [])

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!isSubmitting) {
          onOpenChange(newOpen)
        }
      }}
    >
      <DialogContent 
        className="max-w-3xl max-h-[90vh] p-0"
        onPointerDownOutside={(e) => {
          if (isSubmitting) {
            e.preventDefault()
          }
        }}
        onInteractOutside={(e) => {
          if (isSubmitting) {
            e.preventDefault()
          }
        }}
      >
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle>Edit Work Order</DialogTitle>
            <DialogDescription>
              Make changes to the work order details below.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="px-6 pb-6">
          <ScrollArea className="h-[calc(85vh-8rem)] rounded-md">
            <div className="pr-4">
              <WorkOrderForm 
                workOrder={workOrder} 
                onSuccess={handleSuccess}
                onSubmitting={handleSubmitting}
              />
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
