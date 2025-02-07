
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Card } from "@/components/ui/card"
import { BadgeDollarSign, FileText } from "lucide-react"

export function QuoteStats() {
  const { data: quotesCount = 0 } = useQuery({
    queryKey: ["quotesCount"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("quotes")
        .select("*", { count: "exact", head: true })

      if (error) throw error
      return count || 0
    }
  })

  const { data: requestsCount = 0 } = useQuery({
    queryKey: ["quoteRequestsCount"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("quote_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")

      if (error) throw error
      return count || 0
    }
  })

  return (
    <div className="grid gap-4 md:grid-cols-2 mb-6">
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Quotes</p>
            <p className="text-2xl font-bold">{quotesCount}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <BadgeDollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending Requests</p>
            <p className="text-2xl font-bold">{requestsCount}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
