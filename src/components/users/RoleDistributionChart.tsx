
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ['#BB86FC', '#9B6BFD', '#7B51FE', '#03DAC5'];

type RoleStats = Record<string, number>;

interface RoleDistributionChartProps {
  roleStats: RoleStats;
}

export const RoleDistributionChart = ({ roleStats }: RoleDistributionChartProps) => {
  // Fetch role names to display proper labels
  const { data: roleNames } = useQuery({
    queryKey: ["roleNames"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("name, nicename");
      
      if (error) throw error;
      
      return Object.fromEntries(
        data.map((role) => [role.name, role.nicename])
      );
    }
  });

  // Transform the roleStats object into an array format for Recharts
  const chartData = Object.entries(roleStats).map(([name, value], index) => ({
    id: index,
    name,
    value,
    // Use the display name for the chart labels
    displayName: roleNames?.[name] || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }));

  const total = Object.values(roleStats).reduce((acc, curr) => acc + curr, 0);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/[0.08] p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white/[0.87]">Role Distribution</h3>
          <p className="text-sm text-white/60">Total users: {total}</p>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                nameKey="displayName"
              >
                {chartData.map((entry) => (
                  <Cell 
                    key={`cell-${entry.id}`} 
                    fill={COLORS[entry.id % COLORS.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 17, 17, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
                formatter={(value: number, name: string) => [
                  `${value} user${value !== 1 ? 's' : ''}`,
                  name
                ]}
              />
              <Legend 
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value: string) => value}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};
