
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserFilters } from "./UserFilters";
import { useToast } from "@/hooks/use-toast";

interface UserListHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  excludedRoles: string[];
  onExcludeRole: (roleName: string) => void;
  onRemoveExcludedRole: (roleName: string) => void;
  onRefresh: () => Promise<void>;
}

export const UserListHeader = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  excludedRoles,
  onExcludeRole,
  onRemoveExcludedRole,
  onRefresh,
}: UserListHeaderProps) => {
  const { toast } = useToast();

  const handleRefresh = async () => {
    console.log("Manually refreshing users list...");
    await onRefresh();
    toast({
      title: "Refreshed",
      description: "User list has been updated",
    });
  };

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
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="ml-2 shrink-0"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
};
