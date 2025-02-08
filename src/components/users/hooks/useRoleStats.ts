
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type RoleStats = {
  admin: number;
  manager: number;
  sidekick: number;
  client: number;
};

export const useRoleStats = () => {
  return useQuery({
    queryKey: ["roleStats"],
    queryFn: async () => {
      console.log("Fetching role stats...");
      const { data, error } = await supabase
        .from("profiles")
        .select("role");
      
      if (error) {
        console.error("Error fetching role stats:", error);
        throw error;
      }

      const stats = {
        admin: 0,
        manager: 0,
        sidekick: 0,
        client: 0
      };
      
      if (!data || data.length === 0) {
        console.log("No roles found, returning default stats");
        return stats;
      }
      
      data.forEach((profile) => {
        if (profile.role) {
          stats[profile.role] = (stats[profile.role] || 0) + 1;
        }
      });
      
      console.log("Role stats calculated:", stats);
      return stats;
    },
  });
};
