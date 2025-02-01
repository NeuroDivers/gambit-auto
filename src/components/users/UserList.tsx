import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserCard } from "./UserCard";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserFilters } from "./UserFilters";

type UserRole = "admin" | "manager" | "sidekick" | "client";

type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  user_roles: {
    role: UserRole;
  } | null;
};

export const UserList = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name");

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      return profiles?.map(profile => ({
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        user_roles: roles?.find(role => role.user_id === profile.id)
          ? { role: roles.find(role => role.user_id === profile.id)?.role as UserRole }
          : { role: 'client' as UserRole }
      })) as User[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["users"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filteredUsers = users?.filter(user => {
    const matchesSearch = searchQuery.toLowerCase() === "" || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.user_roles?.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

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
      <UserFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
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