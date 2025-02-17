
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { InvoiceList } from "@/components/invoices/InvoiceList"
import { useNavigate } from "react-router-dom"
import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { InvoiceStatistics } from "@/components/invoices/sections/InvoiceStatistics"
import { RevenueChart } from "@/components/invoices/sections/RevenueChart"
import { useInvoiceStatistics } from "@/components/invoices/hooks/useInvoiceStatistics"
import { useMonthlyRevenue } from "@/components/invoices/hooks/useMonthlyRevenue"

export default function Invoices() {
  const navigate = useNavigate()

  // Check if user is a client
  const { data: isClient } = useQuery({
    queryKey: ["isClient"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data } = await supabase.rpc('has_role_by_name', {
        user_id: user.id,
        role_name: 'client'
      })
      
      return !!data
    }
  })

  // Fetch client ID if user is a client
  const { data: clientId } = useQuery({
    queryKey: ["clientId"],
    enabled: isClient,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .single()
      
      return data?.id
    }
  })

  const { data: stats } = useInvoiceStatistics(isClient, clientId)
  const { data: monthlyData } = useMonthlyRevenue(isClient, clientId)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageBreadcrumbs />
        {!isClient && (
          <Button onClick={() => navigate("/invoices/create")} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        )}
      </div>

      <InvoiceStatistics stats={stats} isClient={isClient} />
      <RevenueChart data={monthlyData || []} isClient={isClient} />
      <InvoiceList />
    </div>
  )
}
