
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { ClientForm } from "./ClientForm"

export function CreateClientDialog() {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <ClientForm />
      </DialogContent>
    </Dialog>
  )
}
