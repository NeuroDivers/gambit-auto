
import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/table"
import {
  CommissionTransaction,
  CommissionAnalytics,
  ServiceCommission,
} from "@/types/commission"
import { supabase } from "@/integrations/supabase/client"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { DollarSign, AlertCircle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

export default function CommissionsPage() {
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["commission-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_commission_analytics")
        .select("*")
      if (error) throw error
      return data as CommissionAnalytics[]
    },
  })

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["commission-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_transactions")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      return data as CommissionTransaction[]
    },
  })

  if (isLoadingAnalytics || isLoadingTransactions) {
    return <div>Loading...</div>
  }

  const currentUserAnalytics = analytics?.[0]

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Commissions</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Commissions Overview</AlertTitle>
          <AlertDescription>
            Track your earned commissions and commission rates for different
            services.
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${currentUserAnalytics?.daily_amount.toFixed(2) ?? "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${currentUserAnalytics?.weekly_amount.toFixed(2) ?? "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${currentUserAnalytics?.monthly_amount.toFixed(2) ?? "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.map((transaction) => (
                  <tr key={transaction.id} className="border-b">
                    <td className="p-2">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-2">${transaction.amount.toFixed(2)}</td>
                    <td className="p-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          transaction.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : transaction.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
