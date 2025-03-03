
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCard } from "./UserCard";
import { useUserData, CLIENT_ROLE_ID, User } from "./hooks/useUserData";
import { useStaffUserData, StaffUser } from "./hooks/useStaffUserData";
import { useUserSubscription } from "./hooks/useUserSubscription";
import { UserListHeader } from "./UserListHeader";

interface UserListProps {
  initialRoleFilter?: string;
  excludeClients?: boolean;
  useStaffView?: boolean; // New prop to determine data source
}

export const UserList = ({ 
  initialRoleFilter = "all", 
  excludeClients = false,
  useStaffView = false 
}: UserListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState(initialRoleFilter);
  const [excludedRoles, setExcludedRoles] = useState<string[]>(
    excludeClients ? [CLIENT_ROLE_ID] : []
  );
  
  // Fetch data from appropriate source based on useStaffView prop
  const { data: regularUsers, isLoading: isLoadingUsers } = useUserData();
  const { data: staffUsers, isLoading: isLoadingStaffUsers } = useStaffUserData();
  
  // Determine which data source to use
  const users = useStaffView ? staffUsers : regularUsers;
  const isLoading = useStaffView ? isLoadingStaffUsers : isLoadingUsers;
  
  // Update roleFilter when initialRoleFilter changes
  useEffect(() => {
    if (initialRoleFilter !== roleFilter) {
      setRoleFilter(initialRoleFilter);
    }
  }, [initialRoleFilter, roleFilter]);
  
  // Set up realtime subscriptions
  useUserSubscription();

  const filterUserBySearch = (user: User | StaffUser, query: string) => {
    if (query.toLowerCase() === "") return true;
    
    // Check email
    if (user.email?.toLowerCase().includes(query.toLowerCase())) return true;
    
    // Check name
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    if (fullName.includes(query.toLowerCase())) return true;
    
    // If this is a staff user, also check department and position
    if ('department' in user && user.department?.toLowerCase().includes(query.toLowerCase())) return true;
    if ('position' in user && user.position?.toLowerCase().includes(query.toLowerCase())) return true;
    
    return false;
  };

  const filteredUsers = users?.filter(user => {
    // Search filter
    const matchesSearch = filterUserBySearch(user, searchQuery);
    
    // Role filter
    const matchesRole = roleFilter === "all" || user.role?.name === roleFilter;
    
    // Excluded roles
    const notExcluded = !excludedRoles.includes(user.role?.id || '');
    
    return matchesSearch && matchesRole && notExcluded;
  });

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
        showStaffFilters={useStaffView}
      />
      <div className="grid gap-4">
        {filteredUsers?.map((user) => (
          <UserCard key={user.id} user={user} isStaffView={useStaffView} />
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
