
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { ClientForm } from "./ClientForm"
import { Client } from "./types"

interface EditClientDialogProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditClientDialog({ client, open, onOpenChange }: EditClientDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        <ClientForm client={client} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
