
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Client } from "@/components/clients/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Mail, Phone } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ClientDetails() {
  const { id } = useParams()

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as Client
    }
  })

  const { data: invoices } = useQuery({
    queryKey: ['client-invoices', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    }
  })

  const { data: quotes } = useQuery({
    queryKey: ['client-quotes', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
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
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="history" className="w-full">
        <TabsList>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="border rounded-lg mt-6">
          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-4">
              {[...(invoices || []), ...(quotes || [])]
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
              {invoices?.map((invoice) => (
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
              {quotes?.map((quote) => (
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
