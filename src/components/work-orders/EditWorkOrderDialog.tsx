
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { WorkOrder } from "./types"
import { WorkOrderForm } from "./WorkOrderForm"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCallback } from "react"

type EditWorkOrderDialogProps = {
  workOrder: WorkOrder
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditWorkOrderDialog({ workOrder, open, onOpenChange }: EditWorkOrderDialogProps) {
  const handleSuccess = useCallback(() => {
    // Ensure we close the dialog after a short delay to allow state updates to complete
    setTimeout(() => {
      onOpenChange(false)
    }, 100)
  }, [onOpenChange])

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange} 
      modal={true}
    >
      <DialogContent 
        className="max-w-3xl max-h-[90vh]"
        onPointerDownOutside={(e) => {
          e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault()
        }}
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
      >
        <ScrollArea className="h-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Work Order</DialogTitle>
            <DialogDescription>
              Make changes to the work order details below.
            </DialogDescription>
          </DialogHeader>
          {open && (  // Only render the form when dialog is open
            <WorkOrderForm 
              workOrder={workOrder} 
              onSuccess={handleSuccess}
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
