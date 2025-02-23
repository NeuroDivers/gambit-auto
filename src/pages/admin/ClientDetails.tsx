
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Client } from "@/components/clients/types"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VehicleList } from "@/components/clients/vehicles/VehicleList"
import { ClientHeader } from "@/components/clients/details/ClientHeader"
import { ClientStats } from "@/components/clients/details/ClientStats"
import { SpendingChart } from "@/components/clients/details/SpendingChart"
import { ClientHistory } from "@/components/clients/details/ClientHistory"
import { ClientInvoices } from "@/components/clients/details/ClientInvoices"
import { ClientQuotes } from "@/components/clients/details/ClientQuotes"

export default function ClientDetails() {
  const { id } = useParams()

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
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
      
      if (clientError) throw clientError
      
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('total, created_at')
        .eq('client_id', id)
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
      const total_invoices = clientData?.invoices?.length || 0
      const total_work_orders = 0

      return {
        ...clientData,
        monthlySpending,
        total_spent,
        total_invoices,
        total_work_orders
      } as Client
    }
  })

  if (isLoading) return <div>Loading...</div>
  if (!client) return <div>Client not found</div>

  return (
    <div className="p-6 space-y-6">
      <ClientHeader client={client} />
      <ClientStats client={client} />
      <SpendingChart data={client.monthlySpending || []} />

      <Tabs defaultValue="vehicles" className="w-full">
        <TabsList>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vehicles" className="border rounded-lg mt-6">
          <VehicleList clientId={client.id} />
        </TabsContent>

        <TabsContent value="history" className="border rounded-lg mt-6">
          <ClientHistory client={client} />
        </TabsContent>

        <TabsContent value="invoices" className="border rounded-lg mt-6">
          <ClientInvoices client={client} />
        </TabsContent>

        <TabsContent value="quotes" className="border rounded-lg mt-6">
          <ClientQuotes client={client} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
