
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Role } from "../types/role";

interface DeleteRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRole: Role | null;
  roles: Role[];
  newRoleId: string;
  onNewRoleSelect: (value: string) => void;
  onDelete: (roleId: string) => void;
}

export const DeleteRoleDialog = ({
  open,
  onOpenChange,
  selectedRole,
  roles,
  newRoleId,
  onNewRoleSelect,
  onDelete,
}: DeleteRoleDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Role</DialogTitle>
          <DialogDescription>
            Please select a new role to assign to users with the {selectedRole?.nicename} role.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Select
            value={newRoleId}
            onValueChange={onNewRoleSelect}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles?.filter(role => role.id !== selectedRole?.id).map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.nicename}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => selectedRole && onDelete(selectedRole.id)}
          >
            Delete Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
