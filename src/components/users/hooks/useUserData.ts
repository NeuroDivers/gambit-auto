
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
  phone_number?: string;
  // Detailed address fields
  street_address?: string;
  unit_number?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  address?: string; // Keep for backward compatibility
  bio?: string;
  role?: UserRole;
};

type ProfileResponse = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  address: string | null;
  street_address: string | null;
  unit_number: string | null;
  city: string | null;
  state_province: string | null;
  postal_code: string | null;
  country: string | null;
  bio: string | null;
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
  street_address?: string;
  unit_number?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
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
          phone_number,
          address,
          street_address,
          unit_number,
          city,
          state_province,
          postal_code,
          country,
          bio,
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

      // Create user objects directly from profiles
      const allUsers: User[] = profiles.map(profile => ({
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name || undefined,
        last_name: profile.last_name || undefined,
        phone_number: profile.phone_number || undefined,
        address: profile.address || undefined,
        street_address: profile.street_address || undefined,
        unit_number: profile.unit_number || undefined,
        city: profile.city || undefined,
        state_province: profile.state_province || undefined,
        postal_code: profile.postal_code || undefined,
        country: profile.country || undefined,
        bio: profile.bio || undefined,
        role: profile.role
      }));

      // Try to get additional client data if available
      try {
        // Check if client profiles exist
        const clientProfiles = profiles.filter(profile => profile.role?.id === CLIENT_ROLE_ID);
        
        if (clientProfiles.length > 0) {
          // Try to get client data
          const { data: clients, error: clientsError } = await supabase
            .from("clients")
            .select("*")
            .in('user_id', clientProfiles.map(p => p.id))
            .returns<ClientResponse[]>();

          // If client data exists, update the corresponding user objects
          if (!clientsError && clients && clients.length > 0) {
            clients.forEach(client => {
              const userIndex = allUsers.findIndex(u => u.id === client.user_id);
              if (userIndex >= 0) {
                allUsers[userIndex] = {
                  ...allUsers[userIndex],
                  email: client.email || allUsers[userIndex].email,
                  first_name: client.first_name || allUsers[userIndex].first_name,
                  last_name: client.last_name || allUsers[userIndex].last_name,
                  phone_number: client.phone_number || allUsers[userIndex].phone_number,
                  address: client.address || allUsers[userIndex].address,
                  street_address: client.street_address || allUsers[userIndex].street_address,
                  unit_number: client.unit_number || allUsers[userIndex].unit_number,
                  city: client.city || allUsers[userIndex].city,
                  state_province: client.state_province || allUsers[userIndex].state_province,
                  postal_code: client.postal_code || allUsers[userIndex].postal_code,
                  country: client.country || allUsers[userIndex].country,
                };
              }
            });
          }
        }
      } catch (error) {
        // Just log the error but continue with basic user data
        console.error("Error fetching clients:", error);
      }

      return allUsers;
    },
  });
};
