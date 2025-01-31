import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRow } from "./UserRow";
import { Skeleton } from "@/components/ui/skeleton";

export const UserList = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      // First, get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email");

      if (profilesError) throw profilesError;

      // Then, get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine the data
      return profiles?.map(profile => ({
        id: profile.id,
        email: profile.email,
        user_roles: roles?.find(role => role.user_id === profile.id)
          ? { role: roles.find(role => role.user_id === profile.id)?.role || 'user' }
          : { role: 'user' }
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Users</h3>
        <p className="text-sm text-muted-foreground">View and manage users</p>
      </div>
      <div className="space-y-4">
        {users?.map((user) => (
          <UserRow key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};