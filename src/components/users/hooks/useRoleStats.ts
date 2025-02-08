
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type RoleStats = Record<string, number>;

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
      const stats: RoleStats = {};
      (roles as Role[]).forEach((role) => {
        stats[role.name] = 0;
      });

      // Count users for each role by joining profiles with roles
      const { data: profilesWithRoles, error: countError } = await supabase
        .from("profiles")
        .select(`
          role:role_id (
            name
          )
        `);
      
      if (countError) throw countError;

      // Update counts for roles that have users
      profilesWithRoles.forEach((profile: any) => {
        const roleName = profile.role?.name;
        if (roleName) {
          stats[roleName] = (stats[roleName] || 0) + 1;
        }
      });
      
      console.log("Role stats calculated:", stats);
      return stats;
    },
  });
};
