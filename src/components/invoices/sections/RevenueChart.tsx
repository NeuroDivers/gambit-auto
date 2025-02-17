
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type RevenueChartProps = {
  data: Array<{ month: string; revenue: number }>
  isClient: boolean | undefined
}

export function RevenueChart({ data, isClient }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isClient ? 'Your Invoice History' : 'Monthly Revenue'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, isClient ? 'Amount' : 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#9b87f5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
