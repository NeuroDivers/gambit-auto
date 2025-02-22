
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

  const chartData = Object.entries(roleStats).map(([name, value], index) => {
    const displayName = roleNames?.[name] || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return {
      id: index,
      name,
      value,
      displayName
    };
  });

  const total = Object.values(roleStats).reduce((acc, curr) => acc + curr, 0);

  return (
    <Card className="bg-card border-border/50 p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Role Distribution</h3>
          <p className="text-sm text-muted-foreground">Total users: {total}</p>
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
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
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: 'var(--foreground)'
                }}
                itemStyle={{
                  color: 'var(--foreground)'
                }}
                labelStyle={{
                  color: 'var(--foreground)'
                }}
                formatter={(value: number, name: string) => [
                  `${value} user${value !== 1 ? 's' : ''}`,
                  name
                ]}
              />
              <Legend 
                verticalAlign="bottom" 
                height={48}
                iconType="circle"
                formatter={(value) => {
                  if (typeof value === 'string') {
                    return value;
                  }
                  return '';
                }}
                wrapperStyle={{
                  color: 'var(--foreground)',
                  paddingTop: '16px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};
