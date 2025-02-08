
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
        .select("name, nicename")
        .in('name', ['admin', 'manager', 'sidekick', 'client']);
      
      if (rolesError) throw rolesError;
      
      // Initialize stats with 0 for all roles
      const stats: RoleStats = {} as RoleStats;
      (roles as Role[]).forEach((role) => {
        stats[role.name as UserRole] = 0;
      });

      // Count users for each role by joining profiles and user_roles
      const { data: userRoles, error: userRolesError } = await supabase
        .from("profiles")
        .select(`
          user_roles!inner(
            roles(
              name
            )
          )
        `);
      
      if (userRolesError) throw userRolesError;

      // Update counts for roles that have users
      userRoles.forEach((profile: any) => {
        const roleName = profile.user_roles[0]?.roles?.name;
        if (roleName) {
          stats[roleName as UserRole] = (stats[roleName as UserRole] || 0) + 1;
        }
      });
      
      console.log("Role stats calculated:", stats);
      return stats;
    },
  });
};
