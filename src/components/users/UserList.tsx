
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCard } from "./UserCard";
import { useUserData } from "./hooks/useUserData";
import { useUserSubscription } from "./hooks/useUserSubscription";
import { UserListHeader } from "./UserListHeader";
import { useQueryClient } from "@tanstack/react-query";

interface UserListProps {
  initialRoleFilter?: string;
}

export const UserList = ({ initialRoleFilter = "all" }: UserListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState(initialRoleFilter);
  const { data: users, isLoading, error } = useUserData();
  const queryClient = useQueryClient();
  
  // Update roleFilter when initialRoleFilter changes
  useEffect(() => {
    if (initialRoleFilter !== roleFilter) {
      setRoleFilter(initialRoleFilter);
    }
  }, [initialRoleFilter, roleFilter]);
  
  // Set up realtime subscriptions
  useUserSubscription();

  // Log error if any
  if (error) {
    console.error("Error loading users:", error);
  }

  const filteredUsers = users?.filter(user => {
    const matchesSearch = !searchQuery || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role?.name === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserListHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
      />
      <div className="grid gap-4">
        {filteredUsers?.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
        {(!filteredUsers || filteredUsers.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            No users found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};
