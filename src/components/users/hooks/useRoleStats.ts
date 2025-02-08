
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type RoleStats = Record<string, number>;

export const useRoleStats = () => {
  return useQuery({
    queryKey: ["roleStats"],
    queryFn: async () => {
      console.log("Fetching role stats...");
      
      // First get all roles to ensure we include roles with 0 users
      const { data: roles, error: rolesError } = await supabase
        .from("roles")
        .select("name");
      
      if (rolesError) throw rolesError;
      
      // Initialize stats with 0 for all roles
      const stats: RoleStats = {};
      roles.forEach(role => {
        stats[role.name as string] = 0;
      });

      // Count users for each role
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          roles (
            name
          )
        `);
      
      if (profilesError) throw profilesError;

      // Update counts for roles that have users
      profiles.forEach((profile) => {
        if (profile.roles?.name) {
          stats[profile.roles.name] = (stats[profile.roles.name] || 0) + 1;
        }
      });
      
      console.log("Role stats calculated:", stats);
      return stats;
    },
  });
};
