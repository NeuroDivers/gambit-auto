
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRolePermissions } from "./hooks/useRolePermissions";
import { PermissionSection } from "./components/PermissionSection";
import { groupPermissions } from "./types/permissions";

interface RolePermissionsDialogProps {
  roleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RolePermissionsDialog = ({
  roleId,
  open,
  onOpenChange,
}: RolePermissionsDialogProps) => {
  const {
    permissions,
    isLoading,
    isUpdating,
    handlePermissionToggle,
  } = useRolePermissions(roleId);

  if (isLoading) {
    return null;
  }

  const groupedPermissions = permissions ? groupPermissions(permissions) : {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1200px]">
        <DialogHeader>
          <DialogTitle>Manage Role Permissions</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          {Object.entries(groupedPermissions).map(([section, sectionPermissions]) => (
            <PermissionSection
              key={section}
              sectionName={section}
              permissions={sectionPermissions}
              onToggle={handlePermissionToggle}
              isDisabled={isUpdating}
            />
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
