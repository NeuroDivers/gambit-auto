
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoleForm } from "./form/RoleForm";
import { useRoleForm } from "./form/useRoleForm";

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: {
    id: string;
    name: string;
    nicename: string;
    description: string | null;
    can_be_assigned_to_bay: boolean;
  } | null;
  onSuccess?: () => void;
}

export const RoleDialog = ({ open, onOpenChange, role, onSuccess }: RoleDialogProps) => {
  const { form, onSubmit } = useRoleForm({ role, onSuccess, onOpenChange });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create Role"}</DialogTitle>
        </DialogHeader>

        <RoleForm
          form={form}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          mode={role ? 'edit' : 'create'}
        />
      </DialogContent>
    </Dialog>
  );
};
