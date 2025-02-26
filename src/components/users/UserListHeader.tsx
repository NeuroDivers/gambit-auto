
import { UserFilters } from "./UserFilters";

interface UserListHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  excludedRoles: string[];
  onExcludeRole: (roleName: string) => void;
  onRemoveExcludedRole: (roleName: string) => void;
}

export const UserListHeader = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  excludedRoles,
  onExcludeRole,
  onRemoveExcludedRole,
}: UserListHeaderProps) => {
  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <UserFilters
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          roleFilter={roleFilter}
          onRoleFilterChange={onRoleFilterChange}
          excludedRoles={excludedRoles}
          onExcludeRole={onExcludeRole}
          onRemoveExcludedRole={onRemoveExcludedRole}
        />
      </div>
    </div>
  );
};
