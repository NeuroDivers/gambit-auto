
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
  role?: UserRole;
  avatar_url?: string | null;
  phone_number?: string | null;
  address?: string | null;
  bio?: string | null;
};

type ProfileResponse = ProfilesTable['Row'] & {
  role: UserRole;
};

export const useUserData = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        // First, verify roles exist and log them
        const { data: roles, error: rolesError } = await supabase
          .from("roles")
          .select("*");

        if (rolesError) {
          console.error("Error fetching roles:", rolesError);
          throw rolesError;
        }

        console.log("Available roles:", roles);

        // Fetch profiles with their roles using a join
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select(`
            id,
            email,
            first_name,
            last_name,
            avatar_url,
            phone_number,
            address,
            bio,
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

        if (!profiles) {
          console.log("No profiles found");
          return [];
        }

        console.log("Raw profiles data:", profiles);

        const users: User[] = profiles.map(profile => ({
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
