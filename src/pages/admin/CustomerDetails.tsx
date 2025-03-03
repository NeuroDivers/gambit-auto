
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Customer } from "@/components/customers/types"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VehicleList } from "@/components/customers/vehicles/VehicleList"
import { CustomerHeader } from "@/components/customers/details/CustomerHeader"
import { CustomerStats } from "@/components/customers/details/CustomerStats"
import { SpendingChart } from "@/components/customers/details/SpendingChart"
import { CustomerHistory } from "@/components/customers/details/CustomerHistory"
import { CustomerInvoices } from "@/components/customers/details/CustomerInvoices"
import { CustomerQuotes } from "@/components/customers/details/CustomerQuotes"

export default function CustomerDetails() {
  const { id } = useParams()

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone_number,
          unit_number,
          street_address,
          city,
          state_province,
          postal_code,
          country,
          invoices (
            id,
            invoice_number,
            total,
            status,
            created_at
          ),
          quotes!quotes_client_id_fkey (
            id,
            quote_number,
            total,
            status,
            created_at
          )
        `)
        .eq('id', id)
        .single()
      
      if (customerError) throw customerError
      
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('total, created_at')
        .eq('customer_id', id)
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true })
      
      if (invoiceError) throw invoiceError

      const monthlySpending = invoiceData?.reduce((acc: Array<{month: string, amount: number}>, invoice) => {
        const month = new Date(invoice.created_at).toLocaleString('default', { month: 'short' })
        const existingMonth = acc.find(item => item.month === month)
        
        if (existingMonth) {
          existingMonth.amount += invoice.total
        } else {
          acc.push({ month, amount: invoice.total })
        }
        return acc
      }, []) || []

      const total_spent = invoiceData?.reduce((sum, invoice) => sum + (invoice.total || 0), 0) || 0
      const total_invoices = customerData?.invoices?.length || 0
      const total_work_orders = 0

      return {
        ...customerData,
        monthlySpending,
        total_spent,
        total_invoices,
        total_work_orders
      } as Customer
    }
  })

  if (isLoading) return <div>Loading...</div>
  if (!customer) return <div>Customer not found</div>

  return (
    <div className="p-6 space-y-6">
      <CustomerHeader customer={customer} />
      <CustomerStats customer={customer} />
      <SpendingChart data={customer.monthlySpending || []} />

      <Tabs defaultValue="vehicles" className="w-full">
        <TabsList>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="quotes">Estimates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vehicles" className="border rounded-lg mt-6">
          <VehicleList customerId={customer.id} />
        </TabsContent>

        <TabsContent value="history" className="border rounded-lg mt-6">
          <CustomerHistory customer={customer} />
        </TabsContent>

        <TabsContent value="invoices" className="border rounded-lg mt-6">
          <CustomerInvoices customer={customer} />
        </TabsContent>

        <TabsContent value="quotes" className="border rounded-lg mt-6">
          <CustomerQuotes customer={customer} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
