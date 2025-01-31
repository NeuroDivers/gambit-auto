import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRow } from "./UserRow";
import { Skeleton } from "@/components/ui/skeleton";

export const UserList = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          user_roles (
            role
          )
        `);

      if (error) throw error;
      
      return data?.map(user => ({
        id: user.id,
        email: user.email,
        user_roles: typeof user.user_roles?.[0] === 'object' 
          ? user.user_roles[0] 
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