import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserCard } from "./UserCard";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserFilters } from "./UserFilters";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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
  const { toast } = useToast();
  
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Fetching users...");
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
    console.log("Setting up realtime subscription for profiles and user_roles");
    
    // Subscribe to profiles changes
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log("Received realtime update for profiles:", payload);
          queryClient.invalidateQueries({ queryKey: ["users"] });
          
          if (payload.eventType === 'DELETE') {
            toast({
              title: "User deleted",
              description: "User has been removed successfully",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "User updated",
              description: "User information has been updated",
            });
          } else if (payload.eventType === 'INSERT') {
            toast({
              title: "User added",
              description: "New user has been added",
            });
          }
        }
      )
      .subscribe();

    // Subscribe to user_roles changes
    const rolesChannel = supabase
      .channel('roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles'
        },
        (payload) => {
          console.log("Received realtime update for user roles:", payload);
          queryClient.invalidateQueries({ queryKey: ["users"] });
          
          if (payload.eventType === 'UPDATE') {
            toast({
              title: "Role updated",
              description: "User role has been updated",
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up realtime subscriptions");
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(rolesChannel);
    };
  }, [queryClient, toast]);

  const handleRefresh = async () => {
    console.log("Manually refreshing users list...");
    await refetch();
    toast({
      title: "Refreshed",
      description: "User list has been updated",
    });
  };

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
      <div className="flex items-center justify-between mb-4">
        <UserFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
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