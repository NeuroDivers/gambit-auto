
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Client } from "@/components/clients/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Mail, Phone, Calendar, User, Car } from "lucide-react"
import { VehicleList } from "@/components/clients/vehicles/VehicleList"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

interface ClientWithAuth extends Client {
  last_sign_in_at?: string | null;
}

export default function ClientDetails() {
  const { id } = useParams()

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      // Fetch client details with auth data
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select(`
          *,
          user:user_id (
            last_sign_in_at
          )
        `)
        .eq('id', id)
        .single()
      
      if (clientError) throw clientError
      
      // Get last 6 months of invoice data for the chart
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('total, created_at')
        .eq('client_id', id)
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true })
      
      if (invoiceError) throw invoiceError

      // Process invoice data for the chart
      const monthlySpending = invoiceData?.reduce((acc: any[], invoice) => {
        const month = new Date(invoice.created_at).toLocaleString('default', { month: 'short' })
        const existingMonth = acc.find(item => item.month === month)
        
        if (existingMonth) {
          existingMonth.amount += invoice.total
        } else {
          acc.push({ month, amount: invoice.total })
        }
        return acc
      }, []) || []

      return {
        ...clientData,
        last_sign_in_at: clientData.user?.last_sign_in_at,
        monthlySpending
      } as ClientWithAuth
    }
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!client) {
    return <div>Client not found</div>
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={`https://avatar.vercel.sh/${client.email}.png`} />
              <AvatarFallback className="text-2xl">
                {client.first_name[0]}{client.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-2xl">
                {client.first_name} {client.last_name}
              </CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {client.email}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {client.phone_number || 'No phone number'}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                {client.address || 'No address'}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Last sign in: {client.last_sign_in_at 
                  ? new Date(client.last_sign_in_at).toLocaleDateString()
                  : 'Never'
                }
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Client Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${client.total_spent?.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.total_invoices || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Work Orders</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.total_work_orders || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Spending Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spending</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={client.monthlySpending}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="var(--primary)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

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
          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-4">
              {[...(client.invoices || []), ...(client.quotes || [])]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {'invoice_number' in item ? `Invoice #${item.invoice_number}` : `Quote #${item.quote_number}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-medium">
                          ${item.total}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="invoices" className="border rounded-lg mt-6">
          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-4">
              {client.invoices?.map((invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Invoice #{invoice.invoice_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${invoice.total}</p>
                        <p className="text-sm text-muted-foreground capitalize">{invoice.status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="quotes" className="border rounded-lg mt-6">
          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-4">
              {client.quotes?.map((quote) => (
                <Card key={quote.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Quote #{quote.quote_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(quote.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${quote.total}</p>
                        <p className="text-sm text-muted-foreground capitalize">{quote.status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
