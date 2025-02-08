
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "manager" | "sidekick" | "client";

export type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  user_roles: {
    role: UserRole;
    nicename: string;
  };
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
          user_roles!inner(
            roles(
              name,
              nicename
            )
          )
        `);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      console.log("Fetched profiles:", profiles);

      // Transform the data to match the expected type
      return profiles.map((profile: any) => ({
        ...profile,
        user_roles: {
          role: profile.user_roles[0]?.roles?.name as UserRole || "client",
          nicename: profile.user_roles[0]?.roles?.nicename || "Client"
        }
      })) as User[];
    },
  });
};
