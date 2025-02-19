
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
      // First, let's verify roles exist
      const { data: roles, error: rolesError } = await supabase
        .from("roles")
        .select("*");

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
        throw rolesError;
      }

      console.log("Available roles:", roles);

      // Then fetch profiles with their roles
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

      if (!profiles || profiles.length === 0) {
        console.log("No profiles found in the database");
        return [];
      }

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
    },
  });
};
