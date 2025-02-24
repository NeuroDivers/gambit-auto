import { PageBreadcrumbs } from "@/components/navigation/PageBreadcrumbs"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ClientDashboard({ profile }: { profile: any }) {
  // Fetch client's quotes and quote requests
  const { data: quotes, isLoading: quotesLoading } = useQuery({
    queryKey: ["client-quotes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      const { data: clientData } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (!clientData) {
        console.log("No client found for user:", user.id)
        return []
      }

      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("client_id", clientData.id)
        .order("created_at", { ascending: false })
      
      if (error) throw error
      return data
    },
  })

  // Fetch client's invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["client-invoices"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      const { data: clientData } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (!clientData) {
        console.log("No client found for user:", user.id)
        return []
      }

      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("client_id", clientData.id)
        .order("created_at", { ascending: false })
      
      if (error) throw error
      return data
    },
  })

  const isLoading = quotesLoading || invoicesLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Prepare data for charts
  const invoiceData = invoices?.map(invoice => ({
    name: formatDistanceToNow(new Date(invoice.created_at), { addSuffix: true }),
    amount: Number(invoice.total) || 0
  })) || []

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <PageBreadcrumbs />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, {profile?.first_name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your quotes, invoices, and bookings all in one place.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {quotes?.filter(q => q.status !== 'converted').length || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {invoices?.filter(i => i.status === 'pending').length || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(invoices?.reduce((acc, inv) => acc + (Number(inv.total) || 0), 0) || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice History Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {invoiceData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={invoiceData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Bar dataKey="amount" fill="#9b87f5" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No invoice history available yet.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
