
import { PermissionToggle } from "./PermissionToggle";
import { Permission } from "../types/permissions";

interface PermissionSectionProps {
  sectionName: string;
  permissions: Permission[];
  onToggle: (permission: Permission, newValue: boolean) => void;
  isDisabled: boolean;
}

export const PermissionSection = ({
  sectionName,
  permissions,
  onToggle,
  isDisabled
}: PermissionSectionProps) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-primary">
        {sectionName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </h3>
      <div className="grid grid-cols-4 gap-4">
        {permissions.map((permission) => (
          <PermissionToggle
            key={permission.id}
            permission={permission}
            onToggle={onToggle}
            isDisabled={isDisabled}
          />
        ))}
      </div>
    </div>
  );
};
