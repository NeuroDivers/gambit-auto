import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
  );
};