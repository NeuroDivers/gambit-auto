import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const RoleManagement = () => {
  const { toast } = useToast();
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

  const chartData = roleStats ? [
    { name: 'Administrators', value: roleStats.admin || 0 },
    { name: 'Managers', value: roleStats.manager || 0 },
    { name: 'Sidekicks', value: roleStats.sidekick || 0 },
    { name: 'Clients', value: roleStats.client || 0 }
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2 text-white/[0.87]">Role Overview</h3>
        <p className="text-sm text-white/60">
          Current distribution of user roles
        </p>
      </div>
      
      <div className="h-[300px] w-full bg-[#242424] border border-white/12 rounded-lg p-4">
        <ChartContainer
          className="w-full"
          config={{
            administrators: {
              label: "Administrators",
              theme: {
                light: "#0088FE",
                dark: "#0088FE"
              }
            },
            managers: {
              label: "Managers",
              theme: {
                light: "#00C49F",
                dark: "#00C49F"
              }
            },
            sidekicks: {
              label: "Sidekicks",
              theme: {
                light: "#FFBB28",
                dark: "#FFBB28"
              }
            },
            clients: {
              label: "Clients",
              theme: {
                light: "#FF8042",
                dark: "#FF8042"
              }
            }
          }}
        >
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartContainer>
      </div>

      <div className="grid gap-4">
        {Object.entries(roleStats || {}).map(([role, count]) => (
          <div key={role} className="bg-[#242424] border border-white/12 rounded-lg p-4 transition-all duration-200 hover:border-[#BB86FC]/50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[#BB86FC]/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-[#BB86FC]" />
              </div>
              <div>
                <p className="font-medium capitalize text-white/[0.87]">{role}s</p>
                <p className="text-sm text-white/60">
                  Count: {count}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};