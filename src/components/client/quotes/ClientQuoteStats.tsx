
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

export function ClientQuoteStats() {
  const queryClient = useQueryClient()

  const { data: stats = { total: 0, pending: 0, accepted: 0, rejected: 0 } } = useQuery({
    queryKey: ["clientQuoteStats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // First get client ID
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (!client) throw new Error("No client found")

      // Get quotes statistics with fixed status counting
      const { data: quotes } = await supabase
        .from("quote_requests")
        .select("status, client_response")
        .eq("client_id", client.id)

      const stats = {
        total: quotes?.length || 0,
        pending: quotes?.filter(q => q.status === "pending").length || 0,
        accepted: quotes?.filter(q => q.status === "estimated" && q.client_response === "accepted").length || 0,
        rejected: quotes?.filter(q => q.status === "estimated" && q.client_response === "rejected").length || 0
      }

      console.log("Quote stats:", stats) // Added for debugging
      return stats
    }
  })

  // Set up real-time subscription for quote updates
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quote_requests'
        },
        () => {
          // Invalidate and refetch quotes when any change occurs
          queryClient.invalidateQueries({ queryKey: ["clientQuoteStats"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Accepted</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.accepted}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.rejected}</div>
        </CardContent>
      </Card>
    </div>
  )
}
