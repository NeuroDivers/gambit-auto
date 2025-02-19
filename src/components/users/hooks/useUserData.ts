
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfilesTable } from "@/integrations/supabase/types/profiles";

export type UserRole = {
  id: string;
  name: string;
  nicename: string;
};

export type User = {
  id: string;
  email: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role?: UserRole | null;
  avatar_url?: string | null;
  phone_number?: string | null;
  address?: string | null;
  bio?: string | null;
};

type ProfileWithRole = ProfilesTable['Row'] & {
  role: UserRole | null;
};

export const useUserData = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        // Fetch profiles with their roles using a join
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select(`
            *,
            role:role_id (
              id,
              name,
              nicename
            )
          `);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          throw profilesError;
        }

        console.log("Raw profiles data:", profiles);

        if (!profiles) {
          console.log("No profiles found");
          return [];
        }

        const users: User[] = (profiles as ProfileWithRole[]).map(profile => ({
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          role: profile.role,
          avatar_url: profile.avatar_url,
          phone_number: profile.phone_number,
          address: profile.address,
          bio: profile.bio
        }));

        console.log("Transformed users data:", users);
        return users;
      } catch (error) {
        console.error("Error in useUserData:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60, // Data considered fresh for 1 minute
    refetchOnMount: true, // Refetch when component mounts
  });
};
