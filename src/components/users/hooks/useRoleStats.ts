
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "./useUserData";

export type RoleStats = Record<UserRole, number>;

interface Role {
  name: string;
  nicename: string;
}

export const useRoleStats = () => {
  return useQuery({
    queryKey: ["roleStats"],
    queryFn: async () => {
      console.log("Fetching role stats...");
      
      // First get all roles to ensure we include roles with 0 users
      const { data: roles, error: rolesError } = await supabase
        .from("roles")
        .select("name, nicename");
      
      if (rolesError) throw rolesError;
      
      // Initialize stats with 0 for all roles
      const stats: RoleStats = {} as RoleStats;
      (roles as Role[]).forEach((role: any) => {
        stats[role.name as UserRole] = 0;
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
      profiles.forEach((profile: any) => {
        if (profile.roles?.name) {
          const roleName = profile.roles.name as UserRole;
          stats[roleName] = (stats[roleName] || 0) + 1;
        }
      });
      
      console.log("Role stats calculated:", stats);
      return stats;
    },
  });
};
