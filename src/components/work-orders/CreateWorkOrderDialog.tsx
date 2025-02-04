import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { WorkOrderForm } from "./WorkOrderForm"
import { useState } from "react"

export function CreateWorkOrderDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Work Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Work Order</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new work order.
          </DialogDescription>
        </DialogHeader>
        <WorkOrderForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}