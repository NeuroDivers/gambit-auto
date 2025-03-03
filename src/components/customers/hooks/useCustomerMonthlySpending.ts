
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

type MonthlySpending = {
  month: string
  amount: number
}

export function useCustomerMonthlySpending(customerId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["customer_monthly_spending", customerId],
    queryFn: async () => {
      if (!customerId) return []
      
      const { data, error } = await supabase
        .from("customer_monthly_spending")
        .select("month, amount, year")
        .eq("customer_id", customerId)
        .order("year", { ascending: true })
        .order("month", { ascending: true })
        
      if (error) {
        console.error("Error fetching customer monthly spending:", error)
        throw error
      }
      
      // Convert to the format expected by the SpendingChart component
      return data.map(item => ({
        month: item.month,
        amount: Number(item.amount)
      })) as MonthlySpending[]
    },
    enabled: !!customerId,
  })

  return {
    monthlySpending: data || [],
    isLoading,
    error,
  }
}
