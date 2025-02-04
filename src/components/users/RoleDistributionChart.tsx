import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";

const COLORS = ['#BB86FC', '#9B6BFD', '#7B51FE', '#03DAC5'];

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
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
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
                formatter={(value) => (
                  <span className="text-sm text-white/80">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};