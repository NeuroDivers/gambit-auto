import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { CreateWorkOrderForm } from "./CreateWorkOrderForm"

type CreateWorkOrderDialogProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateWorkOrderDialog({ open, onOpenChange }: CreateWorkOrderDialogProps) {
  if (open !== undefined && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Work Order</DialogTitle>
          </DialogHeader>
          <CreateWorkOrderForm onSuccess={() => onOpenChange(false)} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Create Work Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Work Order</DialogTitle>
        </DialogHeader>
        <CreateWorkOrderForm />
      </DialogContent>
    </Dialog>
  )
}