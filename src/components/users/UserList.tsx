
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCard } from "./UserCard";
import { useUserData, CLIENT_ROLE_ID } from "./hooks/useUserData";
import { useUserSubscription } from "./hooks/useUserSubscription";
import { UserListHeader } from "./UserListHeader";

interface UserListProps {
  initialRoleFilter?: string;
  excludeClients?: boolean;
}

export const UserList = ({ initialRoleFilter = "all", excludeClients = false }: UserListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState(initialRoleFilter);
  const [excludedRoles, setExcludedRoles] = useState<string[]>(excludeClients ? [CLIENT_ROLE_ID] : []);
  const { data: users, isLoading, refetch } = useUserData();
  
  // Update roleFilter when initialRoleFilter changes
  useEffect(() => {
    if (initialRoleFilter !== roleFilter) {
      setRoleFilter(initialRoleFilter);
    }
  }, [initialRoleFilter, roleFilter]);
  
  // Set up realtime subscriptions
  useUserSubscription();

  const filteredUsers = users?.filter(user => {
    const matchesSearch = searchQuery.toLowerCase() === "" || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role?.name === roleFilter;
    const matchesUserType = excludeClients ? user.role?.id !== CLIENT_ROLE_ID : true;
    const notExcluded = !excludedRoles.includes(user.role?.id || '');
    
    return matchesSearch && matchesRole && matchesUserType && notExcluded;
  });

  const handleRefresh = async () => {
    await refetch();
  };

  const handleExcludeRole = (roleId: string) => {
    setExcludedRoles(prev => [...prev, roleId]);
  };

  const handleRemoveExcludedRole = (roleId: string) => {
    setExcludedRoles(prev => prev.filter(r => r !== roleId));
  };

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div>
      <UserListHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        excludedRoles={excludedRoles}
        onExcludeRole={handleExcludeRole}
        onRemoveExcludedRole={handleRemoveExcludedRole}
        onRefresh={handleRefresh}
      />
      <div className="grid gap-4">
        {filteredUsers?.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
        {filteredUsers?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No users found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};
