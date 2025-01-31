import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { WorkOrderForm } from "./WorkOrderForm"
import { Calendar } from "@/components/ui/calendar"

type CreateWorkOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate?: Date
  quoteRequest?: any // We'll type this properly later
}

export function CreateWorkOrderDialog({
  open,
  onOpenChange,
  selectedDate,
  quoteRequest
}: CreateWorkOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Work Order</DialogTitle>
        </DialogHeader>
        <WorkOrderForm
          selectedDate={selectedDate}
          quoteRequest={quoteRequest}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}