
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { ClientForm } from "./ClientForm"

interface CreateClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateClientDialog({ open, onOpenChange }: CreateClientDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <ClientForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
