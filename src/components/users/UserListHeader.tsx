import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserFilters } from "./UserFilters";
import { useToast } from "@/hooks/use-toast";

interface UserListHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  onRefresh: () => Promise<void>;
}

export const UserListHeader = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
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
    <div className="flex items-center justify-between mb-4">
      <UserFilters
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        roleFilter={roleFilter}
        onRoleFilterChange={onRoleFilterChange}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        className="ml-2"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>
  );
};