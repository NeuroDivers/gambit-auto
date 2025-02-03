import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Pencil } from "lucide-react"
import { WorkOrder } from "./types"

type EditWorkOrderDialogProps = {
  quote: WorkOrder
}

export function EditWorkOrderDialog({ quote }: EditWorkOrderDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Work Order</DialogTitle>
        </DialogHeader>
        <div className="text-center py-8 text-white/60">
          Work order form has been removed
        </div>
      </DialogContent>
    </Dialog>
  )
}