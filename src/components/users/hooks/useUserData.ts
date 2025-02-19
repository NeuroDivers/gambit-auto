
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
        `);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      console.log("Fetched profiles:", profiles);

      // Separate client profiles - we'll get their data from clients table
      const clientProfiles = profiles.filter(profile => profile.role?.name === 'client');
      const nonClientProfiles = profiles.filter(profile => profile.role?.name !== 'client');

      // Get client data for client profiles
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .in('user_id', clientProfiles.map(p => p.id));

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
          first_name: clientData?.first_name,
          last_name: clientData?.last_name,
          role: profile.role
        };
      });

      // Combine non-client profiles with client users
      const allUsers = [
        ...nonClientProfiles,
        ...clientUsers
      ].map(user => ({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      })) as User[];

      return allUsers;
    },
  });
};
