import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { WorkOrder } from "../types"
import { format } from "date-fns"

type WorkOrderDetailsDialogProps = {
  workOrder: WorkOrder
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WorkOrderDetailsDialog({ 
  workOrder, 
  open, 
  onOpenChange 
}: WorkOrderDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Work Order Details</DialogTitle>
          <DialogDescription>
            View the complete details of this work order.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-background/40 rounded-lg p-3">
              <span className="text-sm text-white/50 block mb-1">Customer</span>
              <p className="text-sm text-white/90">
                {workOrder.first_name} {workOrder.last_name}
              </p>
              <p className="text-sm text-white/70 mt-1">{workOrder.email}</p>
              <p className="text-sm text-white/70">{workOrder.phone_number}</p>
            </div>
            <div className="bg-background/40 rounded-lg p-3">
              <span className="text-sm text-white/50 block mb-1">Vehicle</span>
              <p className="text-sm text-white/90">
                {workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}
              </p>
              <p className="text-sm text-white/70 mt-1">
                Serial: {workOrder.vehicle_serial}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {workOrder.additional_notes && (
              <div className="bg-background/40 rounded-lg p-3">
                <span className="text-sm text-white/50 block mb-1">Notes</span>
                <p className="text-sm text-white/90">{workOrder.additional_notes}</p>
              </div>
            )}
            <div className="bg-background/40 rounded-lg p-3">
              <span className="text-sm text-white/50 block mb-1">Created</span>
              <p className="text-sm text-white/90">
                {format(new Date(workOrder.created_at), "PPP")}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}