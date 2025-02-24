
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RoleForm } from "./form/RoleForm"
import { useRoleForm } from "./form/useRoleForm"
import { Role } from "./types/role"

interface RoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null
  onSuccess?: () => void
}

export const RoleDialog = ({ open, onOpenChange, role, onSuccess }: RoleDialogProps) => {
  const { form, onSubmit } = useRoleForm({ 
    role, 
    onSuccess, 
    onOpenChange 
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create Role"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <RoleForm
            form={form}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            mode={role ? 'edit' : 'create'}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
