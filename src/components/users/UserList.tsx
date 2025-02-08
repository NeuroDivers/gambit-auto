
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCard } from "./UserCard";
import { useUserData, User } from "./hooks/useUserData";
import { useUserSubscription } from "./hooks/useUserSubscription";
import { UserListHeader } from "./UserListHeader";

export const UserList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { data: users, isLoading, refetch } = useUserData();
  
  // Set up realtime subscriptions
  useUserSubscription();

  const filteredUsers = users?.filter(user => {
    const matchesSearch = searchQuery.toLowerCase() === "" || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.user_roles.name === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleRefresh = async () => {
    await refetch();
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
        onRefresh={handleRefresh}
      />
      <div className="grid gap-4">
        {filteredUsers?.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
        {filteredUsers?.length === 0 && (
          <div className="text-center py-8 text-white/60">
            No users found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};
