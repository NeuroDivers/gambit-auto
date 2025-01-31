import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const RoleManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: roleStats } = useQuery({
    queryKey: ["roleStats"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role");
      
      const stats = {
        admin: 0,
        user: 0,
      };
      
      data?.forEach((row) => {
        stats[row.role] = (stats[row.role] || 0) + 1;
      });
      
      return stats;
    },
  });

  useEffect(() => {
    // Subscribe to changes in the user_roles table
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
        <h3 className="text-xl font-semibold mb-2">Role Overview</h3>
        <p className="text-sm text-muted-foreground">
          Current distribution of user roles
        </p>
      </div>
      <div className="grid gap-4">
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Administrators</p>
              <p className="text-sm text-muted-foreground">
                Count: {roleStats?.admin || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Regular Users</p>
              <p className="text-sm text-muted-foreground">
                Count: {roleStats?.user || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};