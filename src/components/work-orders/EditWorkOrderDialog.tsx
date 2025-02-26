
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { WorkOrder } from "./types"
import { WorkOrderForm } from "./WorkOrderForm"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCallback, useState, useEffect } from "react"

type EditWorkOrderDialogProps = {
  workOrder: WorkOrder
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditWorkOrderDialog({ workOrder, open, onOpenChange }: EditWorkOrderDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset submitting state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsSubmitting(false)
    }
  }, [open])

  const handleSuccess = useCallback(() => {
    setIsSubmitting(false)
    onOpenChange(false)
  }, [onOpenChange])

  const handleSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting)
  }, [])

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen)
      if (!newOpen) {
        setIsSubmitting(false)
      }
    }
  }, [isSubmitting, onOpenChange])

  return (
    <Sheet 
      open={open} 
      onOpenChange={handleOpenChange}
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
          e.preventDefault()
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
