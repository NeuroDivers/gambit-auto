
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

interface SpendingChartProps {
  data: Array<{ month: string; amount: number }>
}

export function SpendingChart({ data }: SpendingChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Spending</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart 
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis 
              dataKey="month" 
              stroke="var(--muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              cursor={false}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                padding: '8px 12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              labelStyle={{
                color: 'hsl(var(--foreground))',
                fontWeight: 500,
                marginBottom: '4px',
              }}
              itemStyle={{
                color: 'hsl(var(--foreground))',
                fontSize: '14px',
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
            />
            <Bar 
              dataKey="amount" 
              fill="#9b87f5"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
