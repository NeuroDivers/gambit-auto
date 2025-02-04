import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { RoleStatsCard } from "./RoleStatsCard";
import { RoleDistributionChart } from "./RoleDistributionChart";
import { useToast } from "@/hooks/use-toast";

export const RoleManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: roleStats } = useQuery({
    queryKey: ["roleStats"],
    queryFn: async () => {
      console.log("Fetching role stats...");
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .maybeSingle();
      
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
      
      // If no roles are found, return default stats
      if (!data) {
        console.log("No roles found, returning default stats");
        return stats;
      }
      
      if (data.role) {
        stats[data.role] = (stats[data.role] || 0) + 1;
      }
      
      return stats;
    },
  });

  useEffect(() => {
    console.log("Setting up realtime subscription for user roles and profiles");
    
    // Subscribe to user_roles changes for ALL events
    const rolesChannel = supabase
      .channel('roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events
          schema: 'public',
          table: 'user_roles'
        },
        (payload) => {
          console.log("Received realtime update for user roles:", payload);
          queryClient.invalidateQueries({ queryKey: ["roleStats"] });
          
          if (payload.eventType === 'DELETE') {
            toast({
              title: "Role removed",
              description: "User role has been removed",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Role updated",
              description: "User role has been updated",
            });
          } else if (payload.eventType === 'INSERT') {
            toast({
              title: "Role added",
              description: "New user role has been added",
            });
          }
        }
      )
      .subscribe();

    // Subscribe to profiles changes
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log("Received realtime update for profiles:", payload);
          queryClient.invalidateQueries({ queryKey: ["roleStats"] });
          
          toast({
            title: "User deleted",
            description: "User and associated role have been removed",
          });
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up realtime subscriptions");
      supabase.removeChannel(rolesChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [queryClient, toast]);

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