import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { WorkOrderForm } from "./WorkOrderForm"
import type { WorkOrder } from "./types"

interface WorkOrderDialogProps {
  workOrder: WorkOrder
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WorkOrderDialog({
  workOrder,
  open,
  onOpenChange,
}: WorkOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Work Order</DialogTitle>
        </DialogHeader>
        <WorkOrderForm
          workOrder={workOrder}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}