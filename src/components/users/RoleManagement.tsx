import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { RoleStatsCard } from "./RoleStatsCard";
import { RoleDistributionChart } from "./RoleDistributionChart";

export const RoleManagement = () => {
  const queryClient = useQueryClient();
  
  const { data: roleStats } = useQuery({
    queryKey: ["roleStats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role");
      
      if (error) throw error;

      const stats = {
        admin: 0,
        manager: 0,
        sidekick: 0,
        client: 0
      };
      
      data?.forEach((row) => {
        if (row.role) {
          stats[row.role] = (stats[row.role] || 0) + 1;
        }
      });
      
      return stats;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["roleStats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2 text-white/[0.87]">Role Overview</h3>
        <p className="text-sm text-white/60">
          Current distribution of user roles
        </p>
      </div>
      
      {roleStats && <RoleDistributionChart roleStats={roleStats} />}

      <div className="grid gap-4">
        {roleStats && Object.entries(roleStats).map(([role, count]) => (
          <RoleStatsCard key={role} role={role} count={count} />
        ))}
      </div>
    </div>
  );
};