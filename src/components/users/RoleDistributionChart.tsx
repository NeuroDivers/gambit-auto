import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

const COLORS = ['#9b87f5', '#7E69AB', '#6E59A5', '#D6BCFA'];

interface RoleStats {
  admin: number;
  manager: number;
  sidekick: number;
  client: number;
}

interface RoleDistributionChartProps {
  roleStats: RoleStats;
}

export const RoleDistributionChart = ({ roleStats }: RoleDistributionChartProps) => {
  const chartData = [
    { name: 'Administrators', value: roleStats.admin || 0 },
    { name: 'Managers', value: roleStats.manager || 0 },
    { name: 'Sidekicks', value: roleStats.sidekick || 0 },
    { name: 'Clients', value: roleStats.client || 0 }
  ];

  return (
    <div className="relative h-[300px] w-full bg-gradient-to-br from-card/50 to-card border border-white/[0.08] rounded-xl p-6 backdrop-blur-sm shadow-lg">
      <div className="absolute inset-0 bg-purple-500/5 rounded-xl" />
      <div className="relative">
        <h3 className="text-lg font-medium text-white/90 mb-4">Role Distribution</h3>
        <ChartContainer
          className="w-full"
          config={{
            administrators: {
              label: "Administrators",
              theme: {
                light: COLORS[0],
                dark: COLORS[0]
              }
            },
            managers: {
              label: "Managers",
              theme: {
                light: COLORS[1],
                dark: COLORS[1]
              }
            },
            sidekicks: {
              label: "Sidekicks",
              theme: {
                light: COLORS[2],
                dark: COLORS[2]
              }
            },
            clients: {
              label: "Clients",
              theme: {
                light: COLORS[3],
                dark: COLORS[3]
              }
            }
          }}
        >
          <ResponsiveContainer width="100%" height={200}>
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
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 17, 17, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm text-white/80">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};