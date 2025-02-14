
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useState, useCallback } from "react"
import { WorkOrderForm } from "../WorkOrderForm"
import { ScrollArea } from "@/components/ui/scroll-area"

export function CreateWorkOrderDialog() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSuccess = useCallback(() => {
    if (!isSubmitting) {
      setOpen(false)
    }
  }, [isSubmitting])

  const handleSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting)
  }, [])

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!isSubmitting) {
          setOpen(newOpen)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Work Order
        </Button>
      </DialogTrigger>
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
            <DialogTitle>Create Work Order</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a new work order.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="px-6 pb-6">
          <ScrollArea className="h-[calc(85vh-8rem)] rounded-md">
            <div className="pr-4">
              <WorkOrderForm 
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
