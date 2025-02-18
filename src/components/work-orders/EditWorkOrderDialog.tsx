
import { Sheet, SheetContent } from "@/components/ui/sheet"
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
    <Sheet 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!isSubmitting) {
          onOpenChange(newOpen)
        }
      }}
    >
      <SheetContent 
        side="right"
        className="sm:max-w-sm p-0"
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
        <div className="flex flex-col h-full">
          <div className="p-6 pb-0">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Edit Work Order</h2>
              <p className="text-sm text-muted-foreground">
                Make changes to the work order details below.
              </p>
            </div>
          </div>
          <ScrollArea className="flex-1 p-6">
            <WorkOrderForm 
              workOrder={workOrder} 
              onSuccess={handleSuccess}
              onSubmitting={handleSubmitting}
            />
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
