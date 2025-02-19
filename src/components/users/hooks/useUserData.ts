
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = {
  id: string;
  name: string;
  nicename: string;
};

export type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
};

type ProfileResponse = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
};

type ClientResponse = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_id?: string;
  phone_number?: string;
  address?: string;
  role: UserRole;
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
          role:role_id (
            id,
            name,
            nicename
          )
        `)
        .returns<ProfileResponse[]>();

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      if (!profiles) {
        return [];
      }

      // Get all non-client profiles
      const nonClientProfiles = profiles.filter(profile => profile.role?.name !== 'client');

      // Now fetch all clients directly (regardless of user_id)
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select(`
          id,
          email,
          first_name,
          last_name,
          user_id,
          phone_number,
          address,
          role:role_id (
            id,
            name,
            nicename
          )
        `)
        .returns<ClientResponse[]>();

      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
      }

      console.log("Fetched clients:", clients);

      // Map clients to User type
      const clientUsers = (clients || []).map(client => ({
        id: client.id, // Use client's own ID instead of user_id
        email: client.email,
        first_name: client.first_name,
        last_name: client.last_name,
        role: client.role
      }));

      // Combine non-client profiles with client users
      const allUsers: User[] = [
        ...nonClientProfiles,
        ...clientUsers
      ];

      return allUsers;
    },
  });
};
