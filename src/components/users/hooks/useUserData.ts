
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
  roles: UserRole | null;
};

export const useUserData = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select(`
            *,
            roles!profiles_role_id_fkey (
              id,
              name,
              nicename
            )
          `);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          throw profilesError;
        }

        if (!profiles) {
          console.log("No profiles found");
          return [];
        }

        const users: User[] = (profiles as ProfileWithRole[]).map(profile => ({
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          role: profile.roles,
          avatar_url: profile.avatar_url,
          phone_number: profile.phone_number,
          address: profile.address,
          bio: profile.bio
        }));

        return users;
      } catch (error) {
        console.error("Error in useUserData:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60, // Data considered fresh for 1 minute
    refetchOnMount: true,
  });
};
