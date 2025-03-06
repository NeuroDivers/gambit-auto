
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useState } from "react"
import { WorkOrderForm } from "./WorkOrderForm"
import { Loader2 } from "lucide-react"

type CreateWorkOrderDialogProps = {
  defaultStartTime?: Date
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateWorkOrderDialog({ 
  defaultStartTime, 
  open: controlledOpen, 
  onOpenChange 
}: CreateWorkOrderDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (isSubmitting) return; // Prevent closing while submitting
      setOpen(newOpen);
    }}>
      <DialogContent className="max-w-4xl h-[90vh] p-0">
        <div className="sticky top-0 z-10 bg-background border-b">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-xl">Create Work Order</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a new work order
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="overflow-y-auto px-6 pb-6 pt-2 max-h-[calc(90vh-80px)]">
          <WorkOrderForm 
            onSuccess={() => setOpen(false)} 
            defaultStartTime={defaultStartTime}
            onSubmitting={setIsSubmitting}
          />
        </div>
        
        {isSubmitting && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Creating work order...</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
