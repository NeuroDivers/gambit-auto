
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
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
    setIsSubmitting(false) // Reset submitting state
    onOpenChange(false) // Close the sheet
  }, [onOpenChange])

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
        onEscapeKeyDown={(e) => {
          if (isSubmitting) {
            e.preventDefault()
          }
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault() // Prevent focus trap issues
        }}
      >
        <SheetHeader className="p-6 pb-0">
          <SheetTitle>Edit Work Order</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 p-6">
          <WorkOrderForm 
            workOrder={workOrder} 
            onSuccess={handleSuccess}
            onSubmitting={handleSubmitting}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
