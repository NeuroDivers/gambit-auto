import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Pencil } from "lucide-react"
import { WorkOrderForm } from "./WorkOrderForm"
import { useRef } from "react"
import { WorkOrder } from "./types"

type EditWorkOrderDialogProps = {
  quote: WorkOrder
}

export function EditWorkOrderDialog({ quote }: EditWorkOrderDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

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
        <WorkOrderForm 
          initialData={quote} 
          onSuccess={() => closeRef.current?.click()} 
        />
        <DialogClose ref={closeRef} className="hidden" />
      </DialogContent>
    </Dialog>
  )
}