
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  user_roles: {
    role: "admin" | "manager" | "sidekick" | "client";
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
          roles (
            name
          )
        `);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      console.log("Fetched profiles:", profiles);

      // Transform the data to match the expected type
      return profiles.map(profile => ({
        ...profile,
        user_roles: {
          role: profile.roles.name as "admin" | "manager" | "sidekick" | "client"
        }
      })) as User[];
    },
  });
};
