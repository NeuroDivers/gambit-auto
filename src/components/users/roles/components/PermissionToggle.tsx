
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Permission } from "../types/permissions";

interface PermissionToggleProps {
  permission: Permission;
  onToggle: (permission: Permission, newValue: boolean) => void;
  isDisabled: boolean;
}

export const PermissionToggle = ({
  permission,
  onToggle,
  isDisabled
}: PermissionToggleProps) => {
  const switchId = `permission-${permission.id}`;
  
  return (
    <div className="flex items-start justify-between space-x-4 p-4 rounded-lg bg-muted/50">
      <Label htmlFor={switchId} className="flex-1">
        <span className="font-medium">
          {permission.resource_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
        {permission.description && (
          <p className="text-sm text-muted-foreground">{permission.description}</p>
        )}
      </Label>
      <Switch
        id={switchId}
        name={switchId}
        checked={permission.is_active}
        onCheckedChange={(checked) => onToggle(permission, checked)}
        disabled={isDisabled}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
};
