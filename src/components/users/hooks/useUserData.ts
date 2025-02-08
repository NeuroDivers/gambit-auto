
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = {
  name: string;
  nicename: string;
};

export type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  user_roles: UserRole;
};

export const useUserData = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Fetching users...");
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          first_name,
          last_name,
          roles:roles (
            name,
            nicename
          )
        `)
        .eq('roles.id', 'role_id');

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      console.log("Fetched profiles:", profiles);

      // Transform the data to match the expected type
      return profiles.map((profile: any) => ({
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        user_roles: {
          name: profile.roles?.name || 'no-role',
          nicename: profile.roles?.nicename || 'No Role'
        }
      })) as User[];
    },
  });
};
