
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = {
  id: string;
  name: string;
  nicename: string;
  default_dashboard?: "admin" | "staff" | "client";
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
  user_id: string;
  phone_number?: string;
  address?: string;
};

export const CLIENT_ROLE_ID = "73a06339-6dd6-4da7-ac27-db9e160c2ff6";

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
            nicename,
            default_dashboard
          )
        `)
        .returns<ProfileResponse[]>();

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      console.log("Fetched profiles:", profiles);

      // Separate client profiles - we'll get their data from clients table
      const clientProfiles = profiles.filter(profile => profile.role?.id === CLIENT_ROLE_ID);
      const nonClientProfiles = profiles.filter(profile => profile.role?.id !== CLIENT_ROLE_ID);

      // Get client data for client profiles
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .in('user_id', clientProfiles.map(p => p.id))
        .returns<ClientResponse[]>();

      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
        throw clientsError;
      }

      // Map client profiles to include client data
      const clientUsers = clientProfiles.map(profile => {
        const clientData = clients.find(c => c.user_id === profile.id);
        return {
          id: profile.id,
          email: clientData?.email || profile.email,
          first_name: clientData?.first_name || profile.first_name,
          last_name: clientData?.last_name || profile.last_name,
          role: profile.role
        } satisfies User;
      });

      // Combine non-client profiles with client users
      const allUsers: User[] = [
        ...nonClientProfiles,
        ...clientUsers
      ];

      return allUsers;
    },
  });
};
